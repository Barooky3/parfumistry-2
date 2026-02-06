import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SELLER_LINK = "https://litbuy.shop/lit/I2wvc0a2";

interface OrderItem {
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  selectedMl?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, orderItems } = await req.json() as { sessionId: string; orderItems: OrderItem[] };

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    const customerEmail = session.customer_email || session.customer_details?.email;
    if (!customerEmail) {
      throw new Error("Customer email not found");
    }

    const customerName = session.metadata?.customer_name || "Valued Customer";
    const shippingAddress = {
      line1: session.metadata?.shipping_line1 || "",
      city: session.metadata?.shipping_city || "",
      postalCode: session.metadata?.shipping_postal || "",
      country: session.metadata?.shipping_country || "",
    };

    const totalAmount = ((session.amount_total || 0) / 100).toFixed(2);
    const origin = "https://profparfums.lovable.app";

    // Build product rows HTML using the passed orderItems
    const itemsHtml = (orderItems || [])
      .map((item) => {
        const imageUrl = item.image.startsWith("http")
          ? item.image
          : `${origin}${item.image.startsWith("/") ? "" : "/"}${item.image}`;
        const mlLabel = item.selectedMl ? ` — ${item.selectedMl}ml` : "";
        const itemTotal = (item.price * item.quantity).toFixed(2);

        return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #eee; vertical-align: top;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width: 80px; vertical-align: top;">
                  <img src="${imageUrl}" alt="${item.name}" width="72" height="72" style="display: block; border-radius: 8px; object-fit: cover; border: 1px solid #eee;" />
                </td>
                <td style="padding-left: 16px; vertical-align: top; font-family: 'Helvetica Neue', Arial, sans-serif;">
                  <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 4px;">${item.brand}</div>
                  <div style="font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${item.name}${mlLabel}</div>
                  <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Qty: ${item.quantity} · €${itemTotal}</div>
                  <a href="${SELLER_LINK}" style="display: inline-block; background-color: #c9a96e; color: #ffffff; text-decoration: none; padding: 8px 20px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Access Product →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
      })
      .join("");

    // Fallback if no orderItems passed — use Stripe line items
    const fallbackHtml =
      itemsHtml ||
      (session.line_items?.data || [])
        .map(
          (item) => `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #eee; font-family: 'Helvetica Neue', Arial, sans-serif;">
            <div style="font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">${item.description}</div>
            <div style="font-size: 13px; color: #666; margin-bottom: 8px;">Qty: ${item.quantity} · €${((item.amount_total || 0) / 100).toFixed(2)}</div>
            <a href="${SELLER_LINK}" style="display: inline-block; background-color: #c9a96e; color: #ffffff; text-decoration: none; padding: 8px 20px; border-radius: 4px; font-size: 12px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Access Product →</a>
          </td>
        </tr>`
        )
        .join("");

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const emailResponse = await resend.emails.send({
      from: "ProfParfums <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmed ✓ — ProfParfums`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f3ef; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: #1a1a1a; padding: 36px 32px; text-align: center;">
      <h1 style="color: #c9a96e; font-size: 26px; font-weight: 300; letter-spacing: 5px; margin: 0; text-transform: uppercase;">ProfParfums</h1>
      <p style="color: #666; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0 0; text-transform: uppercase;">Premium Fragrances</p>
    </div>

    <!-- Thank You Banner -->
    <div style="background: linear-gradient(135deg, #c9a96e 0%, #b8944f 100%); padding: 28px 32px; text-align: center;">
      <h2 style="color: #ffffff; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 1px;">Thank You for Your Order! 🎉</h2>
    </div>

    <!-- Greeting -->
    <div style="padding: 32px 32px 0 32px;">
      <p style="font-size: 15px; color: #333; margin: 0 0 6px 0; line-height: 1.6;">
        Hi <strong>${customerName}</strong>,
      </p>
      <p style="font-size: 14px; color: #666; margin: 0 0 24px 0; line-height: 1.6;">
        Your order has been confirmed! Below you'll find your products with direct access links. Click the button on each product to access it.
      </p>
    </div>

    <!-- Order Items -->
    <div style="padding: 0 32px;">
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; padding-bottom: 12px; border-bottom: 2px solid #1a1a1a; margin-bottom: 0;">Your Products</div>
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${fallbackHtml}
        </tbody>
      </table>
    </div>

    <!-- Total -->
    <div style="padding: 20px 32px; margin: 0 32px; border-top: 2px solid #1a1a1a; text-align: right;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Total Paid: </span>
      <span style="font-size: 22px; font-weight: 600; color: #1a1a1a;">€${totalAmount}</span>
    </div>

    <!-- Shipping Info -->
    <div style="padding: 0 32px 32px 32px;">
      <div style="background-color: #f8f7f4; padding: 20px 24px; border-radius: 8px;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 12px;">📦 Delivery Details</div>
        <p style="font-size: 14px; color: #333; margin: 0; line-height: 1.7;">
          ${customerName}<br>
          ${shippingAddress.line1}<br>
          ${shippingAddress.postalCode} ${shippingAddress.city}<br>
          ${shippingAddress.country}
        </p>
      </div>
    </div>

    <!-- Help Section -->
    <div style="padding: 0 32px 32px 32px;">
      <div style="background-color: #faf9f6; border: 1px solid #eee; padding: 20px 24px; border-radius: 8px; text-align: center;">
        <p style="font-size: 13px; color: #666; margin: 0; line-height: 1.6;">
          Questions about your order? Contact us at<br>
          <a href="mailto:support@profparfums.com" style="color: #c9a96e; text-decoration: none; font-weight: 500;">support@profparfums.com</a>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1a1a1a; padding: 28px 32px; text-align: center;">
      <p style="color: #c9a96e; font-size: 14px; letter-spacing: 3px; margin: 0 0 8px 0; text-transform: uppercase;">ProfParfums</p>
      <p style="color: #666; font-size: 11px; margin: 0; line-height: 1.8;">
        © ${new Date().getFullYear()} ProfParfums. All rights reserved.<br>
        <a href="https://profparfums.lovable.app" style="color: #888; text-decoration: none;">profparfums.lovable.app</a>
      </p>
    </div>
  </div>
</body>
</html>
      `,
    });

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
