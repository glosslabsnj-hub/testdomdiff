import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";

/**
 * Verify a Stripe checkout session and ensure the subscription exists.
 * Called from CheckoutSuccess as a reliable fallback when webhooks are slow/missing.
 */
Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is authenticated
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: { user: caller }, error: authError } = await authClient.auth.getUser();
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId or userId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller's user ID matches the requested userId (or caller is admin)
    if (caller.id !== userId) {
      const adminCheckClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: adminRole } = await adminCheckClient
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        return new Response(
          JSON.stringify({ error: "Forbidden: user ID mismatch" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");

    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // 2. Verify it's completed and belongs to this user
    if (session.status !== "complete") {
      return new Response(
        JSON.stringify({ error: "Session not complete", status: session.status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionUserId = session.metadata?.supabase_user_id;
    if (sessionUserId !== userId) {
      return new Response(
        JSON.stringify({ error: "Session does not belong to this user" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planType = session.metadata?.plan_type;
    if (!planType) {
      return new Response(
        JSON.stringify({ error: "No plan_type in session metadata" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Check if subscription already exists (webhook may have already handled it)
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (existingSub) {
      return new Response(
        JSON.stringify({ success: true, subscription: existingSub, source: "existing" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. No active subscription — check for any existing subscription for this user
    const now = new Date();

    // Determine expires_at from Stripe subscription period
    let expiresAt: string | null = null;
    if (session.subscription) {
      try {
        const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
        const stripeClient = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
        const stripeSub = await stripeClient.subscriptions.retrieve(session.subscription as string);
        expiresAt = new Date(stripeSub.current_period_end * 1000).toISOString();
      } catch (err) {
        console.error("Failed to retrieve Stripe subscription period:", err);
        const fallback = new Date(now);
        fallback.setDate(fallback.getDate() + 30);
        expiresAt = fallback.toISOString();
      }
    }

    // Try to update any existing (possibly inactive) subscription first
    const { data: updatedSub, error: updateError } = await supabase
      .from("subscriptions")
      .update({
        plan_type: planType,
        status: "active",
        started_at: now.toISOString(),
        expires_at: expiresAt,
        stripe_customer_id: (session.customer as string) || null,
        stripe_subscription_id: (session.subscription as string) || null,
      })
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    // If no existing row to update, insert a new one
    let newSub = updatedSub;
    let subError = updateError;

    if (!updatedSub && !updateError) {
      const { data: insertedSub, error: insertError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: userId,
          plan_type: planType,
          status: "active",
          started_at: now.toISOString(),
          expires_at: expiresAt,
          stripe_customer_id: (session.customer as string) || null,
          stripe_subscription_id: (session.subscription as string) || null,
        })
        .select()
        .single();
      newSub = insertedSub;
      subError = insertError;
    }

    if (subError) {
      console.error("Error creating subscription:", subError);
      return new Response(
        JSON.stringify({ error: "Failed to create subscription", detail: subError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Ensure profile has stripe_customer_id
    if (session.customer) {
      await supabase
        .from("profiles")
        .update({ stripe_customer_id: session.customer as string })
        .eq("user_id", userId);
    }

    console.log(`Subscription created via verify-checkout-session for user ${userId}, plan ${planType}`);

    return new Response(
      JSON.stringify({ success: true, subscription: newSub, source: "created" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("verify-checkout-session error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
