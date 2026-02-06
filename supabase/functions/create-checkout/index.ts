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
  discountPercent?: number;
  freeItemDiscount?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const { items, customerEmail, customerName, shippingAddress, discountPercent, freeItemDiscount } =
      (await req.json()) as CheckoutRequest;

    const validDiscounts = [10, 20, 50];
    const discount = validDiscounts.includes(discountPercent || 0) ? (discountPercent || 0) : 0;
    const multiplier = 1 - discount / 100;

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Calculate total before discount code to figure out proportional free-item reduction
    const rawTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const safeFreeDiscount = Math.min(freeItemDiscount || 0, rawTotal);

    // Build line_items with price_data
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      items.map((item) => {
        let unitPrice = item.price;

        // Distribute freeItemDiscount proportionally across items
        if (safeFreeDiscount > 0 && rawTotal > 0) {
          const itemShare = (item.price / rawTotal) * safeFreeDiscount;
          unitPrice = item.price - itemShare / item.quantity;
        }

        // Apply discount code multiplier, then convert to cents
        const unitAmountCents = Math.round(unitPrice * 100 * multiplier);

        return {
          price_data: {
            currency: "eur",
            product_data: {
              name: `${item.brand} - ${item.name}${item.selectedMl ? ` (${item.selectedMl}ml)` : ""}`,
              images: item.image.startsWith("http") ? [item.image] : [],
            },
            unit_amount: Math.max(unitAmountCents, 0),
          },
          quantity: item.quantity,
        };
      });

    const origin = req.headers.get("origin") || "https://profparfums.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items,
      mode: "payment",
      success_url: `${origin}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
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
