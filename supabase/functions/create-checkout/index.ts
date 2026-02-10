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
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID") || "";
    const clientSecret = Deno.env.get("PAYPAL_SECRET") || "";
    if (!clientId || !clientSecret) throw new Error("PayPal credentials not configured");

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

    // Build PayPal order items & calculate total
    const paypalItems: any[] = [];
    let orderTotal = 0;

    items.forEach((item, idx) => {
      const freeQty = freePerItem[idx];
      const paidQty = item.quantity - freeQty;
      const label = `${item.brand} - ${item.name}${item.selectedMl ? ` (${item.selectedMl}ml)` : ""}`;

      if (paidQty > 0) {
        const unitPrice = Math.max(Math.round(item.price * 100 * multiplier) / 100, 0);
        const lineTotal = Math.round(unitPrice * paidQty * 100) / 100;
        orderTotal += lineTotal;
        paypalItems.push({
          name: label.substring(0, 127),
          quantity: String(paidQty),
          unit_amount: {
            currency_code: "EUR",
            value: unitPrice.toFixed(2),
          },
        });
      }

      if (freeQty > 0) {
        paypalItems.push({
          name: `${label} (FREE)`.substring(0, 127),
          quantity: String(freeQty),
          unit_amount: {
            currency_code: "EUR",
            value: "0.00",
          },
        });
      }
    });

    orderTotal = Math.round(orderTotal * 100) / 100;

    const origin = req.headers.get("origin") || "https://profparfums.lovable.app";

    // Get PayPal access token
    const tokenRes = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("PayPal token error:", JSON.stringify(tokenData));
      throw new Error("Failed to authenticate with PayPal");
    }

    const accessToken = tokenData.access_token;

    // Create PayPal order
    const orderRes = await fetch("https://api-m.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: orderTotal.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: "EUR",
                  value: orderTotal.toFixed(2),
                },
              },
            },
            items: paypalItems,
            description: `Prof Parfums Order`,
          },
        ],
        application_context: {
          brand_name: "Prof Parfums",
          landing_page: "NO_PREFERENCE",
          user_action: "PAY_NOW",
          return_url: `${origin}/checkout?success=true`,
          cancel_url: `${origin}/checkout?canceled=true`,
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      console.error("PayPal order error:", JSON.stringify(orderData));
      throw new Error(orderData.details?.[0]?.description || "Failed to create PayPal order");
    }

    const approveLink = orderData.links?.find((l: any) => l.rel === "approve");
    const checkoutUrl = approveLink?.href;

    if (!checkoutUrl) throw new Error("No checkout URL received from PayPal");

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
