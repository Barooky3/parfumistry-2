import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const squareAccessToken = Deno.env.get("SQUARE_ACCESS_TOKEN") || "";
    if (!squareAccessToken) throw new Error("Square access token not configured");

    const { items, customerEmail, customerName, shippingAddress, discountPercent, freeItemDiscount } =
      (await req.json()) as CheckoutRequest;

    const validDiscounts = [10, 20, 50];
    const discount = validDiscounts.includes(discountPercent || 0) ? (discountPercent || 0) : 0;
    const multiplier = 1 - discount / 100;

    if (!items || items.length === 0) throw new Error("No items in cart");
    if (!customerEmail) throw new Error("Customer email is required");

    // Expand all cart items into individual units sorted by price (cheapest first)
    const expandedUnits: { itemIndex: number; price: number }[] = [];
    items.forEach((item, idx) => {
      for (let i = 0; i < item.quantity; i++) {
        expandedUnits.push({ itemIndex: idx, price: item.price });
      }
    });
    expandedUnits.sort((a, b) => a.price - b.price);

    const totalUnits = expandedUnits.length;
    const freeCount = Math.floor(totalUnits / 3);

    const freePerItem: number[] = new Array(items.length).fill(0);
    for (let i = 0; i < freeCount; i++) {
      freePerItem[expandedUnits[i].itemIndex]++;
    }

    // Build Square order line items
    const lineItems: any[] = [];

    items.forEach((item, idx) => {
      const freeQty = freePerItem[idx];
      const paidQty = item.quantity - freeQty;
      const label = `${item.brand} - ${item.name}${item.selectedMl ? ` (${item.selectedMl}ml)` : ""}`;

      if (paidQty > 0) {
        const unitAmountCents = Math.max(Math.round(item.price * 100 * multiplier), 0);
        lineItems.push({
          name: label,
          quantity: String(paidQty),
          base_price_money: {
            amount: unitAmountCents,
            currency: "EUR",
          },
        });
      }

      if (freeQty > 0) {
        lineItems.push({
          name: `${label} (FREE)`,
          quantity: String(freeQty),
          base_price_money: {
            amount: 0,
            currency: "EUR",
          },
        });
      }
    });

    const origin = req.headers.get("origin") || "https://profparfums.lovable.app";
    const idempotencyKey = crypto.randomUUID();

    const squareResponse = await fetch("https://connect.squareup.com/v2/online-checkout/payment-links", {
      method: "POST",
      headers: {
        "Square-Version": "2024-11-20",
        "Authorization": `Bearer ${squareAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        order: {
          location_id: Deno.env.get("SQUARE_LOCATION_ID") || "",
          line_items: lineItems,
          metadata: {
            customer_email: customerEmail,
            customer_name: customerName,
            shipping_country: shippingAddress.country,
            shipping_city: shippingAddress.city,
            shipping_postal: shippingAddress.postalCode,
            shipping_line1: shippingAddress.line1,
          },
        },
        checkout_options: {
          redirect_url: `${origin}/checkout?success=true`,
        },
      }),
    });

    const squareData = await squareResponse.json();

    if (!squareResponse.ok) {
      console.error("Square API error:", JSON.stringify(squareData));
      throw new Error(squareData.errors?.[0]?.detail || "Failed to create Square checkout");
    }

    const checkoutUrl = squareData.payment_link?.long_url || squareData.payment_link?.url;

    if (!checkoutUrl) throw new Error("No checkout URL received from Square");

    return new Response(JSON.stringify({ url: checkoutUrl }), {
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
