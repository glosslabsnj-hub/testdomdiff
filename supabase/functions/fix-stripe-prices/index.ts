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
    const action = body.action || "check";

    // Get current price IDs from env
    const priceIds = {
      membership: Deno.env.get("STRIPE_PRICE_MEMBERSHIP") || "",
      transformation: Deno.env.get("STRIPE_PRICE_TRANSFORMATION") || "",
      coaching: Deno.env.get("STRIPE_PRICE_COACHING") || "",
    };

    if (action === "check") {
      // Fetch current prices from Stripe
      const results: Record<string, unknown> = {};
      for (const [plan, priceId] of Object.entries(priceIds)) {
        if (priceId) {
          try {
            const price = await stripe.prices.retrieve(priceId);
            results[plan] = {
              price_id: priceId,
              amount: price.unit_amount ? price.unit_amount / 100 : null,
              currency: price.currency,
              type: price.type,
              recurring: price.recurring,
              active: price.active,
              product: price.product,
            };
          } catch (e) {
            results[plan] = { price_id: priceId, error: String(e) };
          }
        } else {
          results[plan] = { error: "No price ID configured" };
        }
      }
      return new Response(JSON.stringify(results, null, 2), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "fix") {
      // Create correct prices and return the new IDs
      // Target: membership=$19.99/mo, transformation=$249 one-time, coaching=$499/mo
      const targetPrices = {
        membership: { amount: 1999, recurring: { interval: "month" as const }, nickname: "Solitary Confinement - $19.99/mo" },
        transformation: { amount: 24900, recurring: null, nickname: "General Population - $249 one-time" },
        coaching: { amount: 49900, recurring: { interval: "month" as const }, nickname: "Free World Coaching - $499/mo" },
      };

      const newPrices: Record<string, unknown> = {};

      for (const [plan, target] of Object.entries(targetPrices)) {
        // Get product from existing price if available
        let productId: string | undefined;
        const existingPriceId = priceIds[plan as keyof typeof priceIds];
        if (existingPriceId) {
          try {
            const existing = await stripe.prices.retrieve(existingPriceId);
            productId = typeof existing.product === "string" ? existing.product : undefined;
          } catch (_e) { /* ignore */ }
        }

        // Create product if needed
        if (!productId) {
          const product = await stripe.products.create({ name: target.nickname });
          productId = product.id;
        }

        // Create the new price
        const priceParams: Stripe.PriceCreateParams = {
          product: productId,
          unit_amount: target.amount,
          currency: "usd",
          nickname: target.nickname,
        };

        if (target.recurring) {
          priceParams.recurring = target.recurring;
        }

        const newPrice = await stripe.prices.create(priceParams);
        newPrices[plan] = {
          price_id: newPrice.id,
          amount: newPrice.unit_amount ? newPrice.unit_amount / 100 : null,
          product: productId,
        };
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "New prices created. Update Supabase secrets with these price IDs.",
          prices: newPrices,
        }, null, 2),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use 'check' or 'fix'" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
