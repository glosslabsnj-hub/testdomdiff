import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!stripeKey || !webhookSecret) {
    console.error("Missing Stripe configuration");
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Verify Stripe signature
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook signature verification failed:", message);
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }

  // Idempotency check
  const { data: existingEvent } = await supabase
    .from("stripe_events")
    .select("id")
    .eq("id", event.id)
    .maybeSingle();

  if (existingEvent) {
    console.log(`Event ${event.id} already processed, skipping`);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Log the event for idempotency
  await supabase.from("stripe_events").insert({
    id: event.id,
    type: event.type,
    data: event.data,
  });

  console.log(`Processing event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const planType = session.metadata?.plan_type;
        const orderType = session.metadata?.order_type;

        if (orderType === "merchandise") {
          console.log("Merchandise order completed:", session.id);
          // Merchandise orders don't create subscriptions
          break;
        }

        if (!userId || !planType) {
          console.error("Missing metadata in checkout session:", session.id);
          break;
        }

        const now = new Date();

        // All plans get expiry from Stripe subscription period
        let expiresAt: string | null = null;
        if (session.subscription) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string);
            expiresAt = new Date(stripeSub.current_period_end * 1000).toISOString();
          } catch (err) {
            // Fallback: set expiry to 30 days from now
            console.error("Failed to retrieve Stripe subscription period:", err);
            const fallback = new Date(now);
            fallback.setDate(fallback.getDate() + 30);
            expiresAt = fallback.toISOString();
          }
        }

        // Create or update subscription — use upsert to avoid race conditions
        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert({
            user_id: userId,
            plan_type: planType,
            status: "active",
            started_at: now.toISOString(),
            expires_at: expiresAt,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string | null,
          }, { onConflict: "user_id" });

        if (subError) {
          console.error("Error creating subscription:", subError);
        } else {
          console.log(`Subscription created/updated for user ${userId}, plan ${planType}`);

          // Trigger welcome email
          try {
            await fetch(`${supabaseUrl}/functions/v1/send-notifications`, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${serviceRoleKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ type: "welcome", userId }),
            });
            console.log(`Welcome email triggered for user ${userId}`);
          } catch (emailErr) {
            console.error("Failed to trigger welcome email:", emailErr);
          }
        }

        // Process referral credit if a referral code was used
        const referralCode = session.metadata?.referral_code;
        if (referralCode) {
          try {
            // Look up the referrer from referral_codes table
            const { data: referralEntry } = await supabase
              .from("referral_codes")
              .select("user_id")
              .eq("code", referralCode)
              .maybeSingle();

            if (referralEntry && referralEntry.user_id !== userId) {
              // Insert referral completion with status 'completed'
              const { error: refInsertErr } = await supabase
                .from("referral_completions")
                .insert({
                  referrer_id: referralEntry.user_id,
                  referred_user_id: userId,
                  referred_plan: planType,
                  status: "completed",
                  completed_at: new Date().toISOString(),
                });

              if (refInsertErr) {
                // Likely a duplicate — safe to ignore
                console.log("Referral insert skipped (possible duplicate):", refInsertErr.message);
              } else {
                // Extend the referrer's subscription by 30 days
                const { error: extendErr } = await supabase
                  .rpc("extend_subscription_30_days", { target_user_id: referralEntry.user_id });

                if (extendErr) {
                  // Fallback: manual update
                  await supabase
                    .from("subscriptions")
                    .update({
                      expires_at: new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                      ).toISOString(),
                    })
                    .eq("user_id", referralEntry.user_id)
                    .eq("status", "active");
                  console.log(`Referral credit (fallback): extended subscription for ${referralEntry.user_id}`);
                } else {
                  console.log(`Referral credit: extended subscription for ${referralEntry.user_id} by 30 days`);
                }

                // Mark referral as credited
                await supabase
                  .from("referral_completions")
                  .update({
                    status: "credited",
                    credited_at: new Date().toISOString(),
                  })
                  .eq("referrer_id", referralEntry.user_id)
                  .eq("referred_user_id", userId);
              }
            } else if (referralEntry?.user_id === userId) {
              console.log("Self-referral blocked for user:", userId);
            }
          } catch (refErr) {
            console.error("Referral processing error (non-fatal):", refErr);
          }
        }

        // Ensure profile exists and update with Stripe customer ID
        if (session.customer) {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", userId)
            .maybeSingle();

          if (existingProfile) {
            await supabase
              .from("profiles")
              .update({ stripe_customer_id: session.customer as string })
              .eq("user_id", userId);
          } else {
            await supabase.from("profiles").insert({
              user_id: userId,
              email: session.customer_email || session.customer_details?.email || "",
              stripe_customer_id: session.customer as string,
            });
            console.log(`Profile created for user ${userId}`);
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Get the new period end from Stripe to extend expiry
        let newExpiresAt: string | undefined;
        try {
          const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);
          newExpiresAt = new Date(stripeSub.current_period_end * 1000).toISOString();
        } catch (err) {
          console.error("Failed to retrieve subscription period on renewal:", err);
        }

        // Keep subscription active on successful renewal and extend expiry
        const updateData: Record<string, string> = {
          status: "active",
          updated_at: new Date().toISOString(),
        };
        if (newExpiresAt) {
          updateData.expires_at = newExpiresAt;
        }

        const { error } = await supabase
          .from("subscriptions")
          .update(updateData)
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          console.error("Error updating subscription on invoice.paid:", error);
        } else {
          console.log(`Subscription ${subscriptionId} confirmed active, expires ${newExpiresAt || "unchanged"}`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(
          `Payment failed for subscription ${invoice.subscription}, attempt ${invoice.attempt_count}. Stripe will auto-retry.`
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        // Map Stripe status to our status
        let status = "active";
        if (subscription.status === "canceled" || subscription.status === "unpaid") {
          status = "cancelled";
        } else if (subscription.status === "past_due") {
          status = "active"; // Still active during retry period
        }

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error syncing subscription update:", error);
        } else {
          console.log(`Subscription ${subscription.id} status synced to ${status}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "cancelled",
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error marking subscription cancelled:", error);
        } else {
          console.log(`Subscription ${subscription.id} marked cancelled`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Error processing event ${event.type}:`, message);
    // Don't return error - we already logged the event for idempotency
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
