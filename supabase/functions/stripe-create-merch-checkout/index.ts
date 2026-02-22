import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://domdifferent.com",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Merchandise: 25% platform, 75% Dom
const MERCH_PLATFORM_PERCENT = 25;

interface CartItem {
  name: string;
  price: number; // in dollars
  quantity: number;
  size?: string;
  image_url?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, email, shipping } = await req.json() as {
      items: CartItem[];
      email: string;
      shipping: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
    };

    if (!items || items.length === 0 || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: items, email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const domAccountId = Deno.env.get("STRIPE_DOM_CONNECTED_ACCOUNT_ID");

    if (!stripeKey || !domAccountId) {
      return new Response(
        JSON.stringify({ error: "Stripe configuration is incomplete" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Calculate subtotal in cents
    const subtotalCents = items.reduce(
      (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
      0
    );

    // Shipping: free over $100, else $9.99
    const shippingCents = subtotalCents >= 10000 ? 0 : 999;
    const totalCents = subtotalCents + shippingCents;

    // Stripe fee estimate: 2.9% + $0.30
    const stripeFee = Math.round(totalCents * 0.029 + 30);
    const afterFees = totalCents - stripeFee;

    // Platform keeps 25% after fees
    const applicationFee = Math.round(afterFees * (MERCH_PLATFORM_PERCENT / 100));

    // Build line items for Stripe Checkout
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
      (item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            ...(item.size ? { description: `Size: ${item.size}` } : {}),
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })
    );

    // Add shipping as a line item if applicable
    if (shippingCents > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Shipping" },
          unit_amount: shippingCents,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      customer_email: email,
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: domAccountId,
        },
        metadata: {
          order_type: "merchandise",
          shipping_name: `${shipping.firstName} ${shipping.lastName}`,
          shipping_address: shipping.address,
          shipping_city: shipping.city,
          shipping_state: shipping.state,
          shipping_zip: shipping.zipCode,
        },
      },
      success_url: "https://domdifferent.com/shop/confirmation?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://domdifferent.com/shop/checkout",
      metadata: {
        order_type: "merchandise",
      },
    });

    console.log(`Merch checkout session created: ${session.id}`);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Merch checkout error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
