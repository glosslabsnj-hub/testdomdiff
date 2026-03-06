import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: "No Stripe key" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Create a 100% off forever coupon
    const coupon = await stripe.coupons.create({
      percent_off: 100,
      duration: "forever",
      name: "Founding Tester - Free Lifetime Access",
      max_redemptions: 3,
    });

    // Create a promo code for the coupon
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: "FOUNDING3",
      max_redemptions: 3,
    });

    return new Response(
      JSON.stringify({
        success: true,
        coupon_id: coupon.id,
        promo_code: promoCode.code,
        promo_code_id: promoCode.id,
        max_redemptions: 3,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
