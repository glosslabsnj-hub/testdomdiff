import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";

// Stripe Connect onboarding for Dom's connected account.
// Platform (Jack) owns STRIPE_SECRET_KEY. Dom is the connected account
// receiving automatic transfers on every payment.

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    let accountId = Deno.env.get("STRIPE_DOM_CONNECTED_ACCOUNT_ID");

    // If Dom's connected account doesn't exist yet, create an Express account
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual",
        metadata: { role: "dom_partner" },
      });
      accountId = account.id;
      console.log(`Created new Express account for Dom: ${accountId}`);
      console.log(`IMPORTANT: Set STRIPE_DOM_CONNECTED_ACCOUNT_ID=${accountId} in your Supabase env vars`);
    }

    // Check if account is already fully onboarded
    const account = await stripe.accounts.retrieve(accountId);
    if (account.charges_enabled && account.payouts_enabled) {
      return new Response(
        JSON.stringify({
          accountId,
          status: "active",
          charges_enabled: true,
          payouts_enabled: true,
          message: "Dom's account is fully onboarded and ready to receive transfers.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "https://domdifferent.com/admin?stripe=refresh",
      return_url: "https://domdifferent.com/admin?stripe=complete",
      type: "account_onboarding",
    });

    return new Response(
      JSON.stringify({
        url: accountLink.url,
        accountId,
        status: "pending_onboarding",
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        message: `Send this URL to Dom to complete identity verification. Account ID: ${accountId}`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Connect onboarding error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
