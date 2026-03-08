import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { getCorsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require service role key for admin-only operations
  const authHeader = req.headers.get("Authorization") || "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  if (!authHeader.includes(serviceKey)) {
    return new Response(JSON.stringify({ error: "Unauthorized: admin access required" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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

    const body = await req.json().catch(() => ({}));
    const maxRedemptions = body.max_redemptions || 6;
    const code = body.code || "FOUNDING3";
    const deactivateExisting = body.deactivate_existing ?? false;

    // If requested, deactivate existing promo codes with same code
    if (deactivateExisting) {
      const existing = await stripe.promotionCodes.list({ code, active: true });
      for (const pc of existing.data) {
        await stripe.promotionCodes.update(pc.id, { active: false });
      }
    }

    // Create a 100% off forever coupon
    const coupon = await stripe.coupons.create({
      percent_off: 100,
      duration: "forever",
      name: "Founding Tester - Free Lifetime Access",
      max_redemptions: maxRedemptions,
    });

    // Create a promo code for the coupon
    const promoCode = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code,
      max_redemptions: maxRedemptions,
    });

    return new Response(
      JSON.stringify({
        success: true,
        coupon_id: coupon.id,
        promo_code: promoCode.code,
        promo_code_id: promoCode.id,
        max_redemptions: maxRedemptions,
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
