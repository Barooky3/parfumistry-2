import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CartLineItem {
  name: string;
  brand: string;
  image: string;
  price: number; // in EUR
  quantity: number;
  selectedMl?: number;
}

interface CheckoutRequest {
  items: CartLineItem[];
  customerEmail: string;
  customerName: string;
  shippingAddress: {
    country: string;
    city: string;
    postalCode: string;
    line1: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { items, customerEmail, customerName, shippingAddress } =
      (await req.json()) as CheckoutRequest;

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Build line_items with price_data (dynamic pricing for perfume store)
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.brand} - ${item.name}${item.selectedMl ? ` (${item.selectedMl}ml)` : ""}`,
            images: item.image.startsWith("http") ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Convert EUR to cents
        },
        quantity: item.quantity,
      }));

    const origin = req.headers.get("origin") || "https://profparfums.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items,
      mode: "payment",
      success_url: `${origin}/checkout?success=true`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        customer_name: customerName,
        shipping_country: shippingAddress.country,
        shipping_city: shippingAddress.city,
        shipping_postal: shippingAddress.postalCode,
        shipping_line1: shippingAddress.line1,
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
