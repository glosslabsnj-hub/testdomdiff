import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subscriptionId, reason } = await req.json();

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: subscriptionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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

    // Look up the subscription to get the Stripe subscription ID
    const { data: sub, error: subError } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, plan_type")
      .eq("id", subscriptionId)
      .maybeSingle();

    if (subError || !sub) {
      return new Response(
        JSON.stringify({ error: "Subscription not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sub.stripe_subscription_id) {
      // Cancel at end of current period (user keeps access until then)
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
        metadata: {
          cancellation_reason: reason || "No reason provided",
        },
      });
      console.log(`Stripe subscription ${sub.stripe_subscription_id} set to cancel at period end`);
    }

    // Update our DB immediately to reflect pending cancellation
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", subscriptionId);

    if (updateError) {
      console.error("Error updating subscription status:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update subscription" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Subscription ${subscriptionId} cancelled (reason: ${reason || "none"})`);

    return new Response(
      JSON.stringify({ success: true, message: "Subscription cancelled" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Cancel subscription error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
