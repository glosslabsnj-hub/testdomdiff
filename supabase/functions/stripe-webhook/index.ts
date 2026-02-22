import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const TRANSFORMATION_DURATION_DAYS = 84; // 12 weeks

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
        const expiresAt =
          planType === "transformation"
            ? new Date(
                now.getTime() + TRANSFORMATION_DURATION_DAYS * 24 * 60 * 60 * 1000
              ).toISOString()
            : null;

        // Create or update subscription
        const { error: subError } = await supabase.from("subscriptions").upsert(
          {
            user_id: userId,
            plan_type: planType,
            status: "active",
            started_at: now.toISOString(),
            expires_at: expiresAt,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string | null,
          },
          { onConflict: "user_id" }
        );

        if (subError) {
          console.error("Error creating subscription:", subError);
        } else {
          console.log(`Subscription created/updated for user ${userId}, plan ${planType}`);
        }

        // Update profile with Stripe customer ID
        if (session.customer) {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: session.customer as string })
            .eq("user_id", userId);
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Keep subscription active on successful renewal
        const { error } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        if (error) {
          console.error("Error updating subscription on invoice.paid:", error);
        } else {
          console.log(`Subscription ${subscriptionId} confirmed active`);
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
