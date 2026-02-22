import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Revenue split configuration (percentages are Dom's share AFTER Stripe fees)
const REVENUE_SPLITS: Record<string, { domPercent: number; platformPercent: number }> = {
  membership: { domPercent: 50, platformPercent: 50 },    // Solitary $49.99/mo
  transformation: { domPercent: 50, platformPercent: 50 }, // Gen Pop $379.99 one-time
  coaching: { domPercent: 75, platformPercent: 25 },       // Free World $999.99/mo
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planType, userId, email } = await req.json();

    if (!planType || !userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: planType, userId, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validPlans = ["membership", "transformation", "coaching"];
    if (!validPlans.includes(planType)) {
      return new Response(
        JSON.stringify({ error: `Invalid plan type. Must be one of: ${validPlans.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const domAccountId = Deno.env.get("STRIPE_DOM_CONNECTED_ACCOUNT_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!stripeKey || !domAccountId) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration is incomplete" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Look up or create Stripe customer
    let stripeCustomerId: string | undefined;

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      stripeCustomerId = customer.id;

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customer.id })
        .eq("user_id", userId);
    }

    // Map plan types to Stripe price IDs
    const priceMap: Record<string, string> = {
      membership: Deno.env.get("STRIPE_PRICE_MEMBERSHIP") || "",
      transformation: Deno.env.get("STRIPE_PRICE_TRANSFORMATION") || "",
      coaching: Deno.env.get("STRIPE_PRICE_COACHING") || "",
    };

    const priceId = priceMap[planType];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `No Stripe price configured for plan: ${planType}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const split = REVENUE_SPLITS[planType];

    // Price amounts in cents for fee calculation
    const priceAmounts: Record<string, number> = {
      membership: 4999,      // $49.99
      transformation: 37999, // $379.99
      coaching: 99999,       // $999.99
    };

    const amountCents = priceAmounts[planType];

    // Stripe fee estimate: 2.9% + $0.30
    const stripeFee = Math.round(amountCents * 0.029 + 30);
    const afterFees = amountCents - stripeFee;

    // Platform keeps its percentage as application_fee_amount
    // Dom receives the rest via transfer_data.destination
    const applicationFee = Math.round(afterFees * (split.platformPercent / 100));

    const isSubscription = planType === "membership" || planType === "coaching";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      success_url: `https://domdifferent.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://domdifferent.com/checkout?plan=${planType}`,
      metadata: {
        supabase_user_id: userId,
        plan_type: planType,
      },
    };

    if (isSubscription) {
      sessionParams.subscription_data = {
        transfer_data: {
          destination: domAccountId,
        },
        application_fee_percent: split.platformPercent,
        metadata: {
          supabase_user_id: userId,
          plan_type: planType,
        },
      };
    } else {
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: domAccountId,
        },
        metadata: {
          supabase_user_id: userId,
          plan_type: planType,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log(`Checkout session created for user ${userId}, plan ${planType}: ${session.id}`);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Stripe checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
