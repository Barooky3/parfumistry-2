import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Retrieve the checkout session with line items
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

    // Build order items HTML
    const lineItems = session.line_items?.data || [];
    const itemsHtml = lineItems
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #333;">
            ${item.description}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #333; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 14px; color: #333; text-align: right;">
            €${((item.amount_total || 0) / 100).toFixed(2)}
          </td>
        </tr>`
      )
      .join("");

    const totalAmount = ((session.amount_total || 0) / 100).toFixed(2);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const emailResponse = await resend.emails.send({
      from: "ProfParfums <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Order Confirmation - ProfParfums`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8f7f4; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    
    <!-- Header -->
    <div style="background-color: #1a1a1a; padding: 32px; text-align: center;">
      <h1 style="color: #c9a96e; font-size: 24px; font-weight: 300; letter-spacing: 4px; margin: 0; text-transform: uppercase;">ProfParfums</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 32px;">
      <h2 style="font-size: 22px; font-weight: 400; color: #1a1a1a; margin: 0 0 8px 0;">Thank You for Your Order!</h2>
      <p style="font-size: 14px; color: #666; margin: 0 0 32px 0; line-height: 1.6;">
        Hi ${customerName}, your order has been confirmed and is being processed.
      </p>

      <!-- Order Items -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr>
            <th style="padding: 12px 0; border-bottom: 2px solid #1a1a1a; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Product</th>
            <th style="padding: 12px 0; border-bottom: 2px solid #1a1a1a; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Qty</th>
            <th style="padding: 12px 0; border-bottom: 2px solid #1a1a1a; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <!-- Total -->
      <div style="text-align: right; padding: 16px 0; border-top: 2px solid #1a1a1a;">
        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999;">Total: </span>
        <span style="font-size: 20px; font-weight: 500; color: #1a1a1a;">€${totalAmount}</span>
      </div>

      <!-- Shipping Address -->
      <div style="background-color: #f8f7f4; padding: 20px; margin-top: 24px;">
        <h3 style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; margin: 0 0 12px 0;">Shipping Address</h3>
        <p style="font-size: 14px; color: #333; margin: 0; line-height: 1.6;">
          ${customerName}<br>
          ${shippingAddress.line1}<br>
          ${shippingAddress.postalCode} ${shippingAddress.city}<br>
          ${shippingAddress.country}
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #1a1a1a; padding: 24px 32px; text-align: center;">
      <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.6;">
        © ${new Date().getFullYear()} ProfParfums. All rights reserved.<br>
        <a href="https://profparfums.lovable.app" style="color: #c9a96e; text-decoration: none;">profparfums.lovable.app</a>
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
