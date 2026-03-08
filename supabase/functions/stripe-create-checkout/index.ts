import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";

// Revenue split configuration — Stripe Connect automatic splits
// Platform = Jack's Stripe account (STRIPE_SECRET_KEY)
// Connected = Dom's account (STRIPE_DOM_CONNECTED_ACCOUNT_ID)
// Payments land in Jack's account; Dom's share auto-transfers via Stripe Connect.
//
// Split ratios (what Dom receives as connected account):
//   membership (Tier 1):     50% Dom, 50% Jack
//   transformation (Tier 2): 50% Dom, 50% Jack
//   coaching (Tier 3):       75% Dom, 25% Jack

const SPLITS: Record<string, number> = {
  membership: 50,       // Dom gets 50%
  transformation: 50,   // Dom gets 50%
  coaching: 75,          // Dom gets 75%
};

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

    const { planType, userId, email, referralCode } = await req.json();

    if (!planType || !userId || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: planType, userId, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the caller's user ID matches the requested userId
    if (caller.id !== userId) {
      return new Response(
        JSON.stringify({ error: "Forbidden: user ID mismatch" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
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
    const connectedAccountId = Deno.env.get("STRIPE_DOM_CONNECTED_ACCOUNT_ID");

    if (!stripeKey) {
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

    const isSubscription = planType === "membership" || planType === "transformation" || planType === "coaching";
    const domPercent = SPLITS[planType] || 50;
    const useSplit = !!connectedAccountId;

    if (!useSplit) {
      console.warn("STRIPE_DOM_CONNECTED_ACCOUNT_ID not set — checkout will proceed without revenue split.");
    }

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isSubscription ? "subscription" : "payment",
      allow_promotion_codes: true,
      success_url: `https://domdifferent.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://domdifferent.com/checkout?plan=${planType}`,
      metadata: {
        supabase_user_id: userId,
        plan_type: planType,
        referral_code: referralCode || "",
      },
    };

    if (isSubscription) {
      if (useSplit) {
        // Subscription with Connect split:
        // Jack keeps (100 - domPercent)% as application fee, Dom receives domPercent%
        sessionParams.subscription_data = {
          application_fee_percent: 100 - domPercent,
          transfer_data: {
            destination: connectedAccountId!,
          },
          metadata: {
            supabase_user_id: userId,
            plan_type: planType,
          },
        };
      } else {
        sessionParams.subscription_data = {
          metadata: {
            supabase_user_id: userId,
            plan_type: planType,
          },
        };
      }
    } else {
      if (useSplit) {
        // One-time payment with Connect split:
        // Retrieve the price to calculate Jack's application fee
        const priceObj = await stripe.prices.retrieve(priceId);
        const unitAmount = priceObj.unit_amount || 0;
        const jackFee = Math.round(unitAmount * (100 - domPercent) / 100);

        sessionParams.payment_intent_data = {
          application_fee_amount: jackFee,
          transfer_data: {
            destination: connectedAccountId!,
          },
          metadata: {
            supabase_user_id: userId,
            plan_type: planType,
          },
        };
      } else {
        sessionParams.payment_intent_data = {
          metadata: {
            supabase_user_id: userId,
            plan_type: planType,
          },
        };
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    const splitMsg = useSplit
      ? `(split: ${domPercent}% to Dom, ${100 - domPercent}% platform fee)`
      : "(no split — Connect not configured)";

    console.log(
      `Checkout session created for user ${userId}, plan ${planType}: ${session.id} ${splitMsg}`
    );

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
