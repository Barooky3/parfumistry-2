import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "ewhz3384@gmail.com";

interface OrderItem {
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  selectedMl?: number;
}

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function buildApprovalEmailHtml(
  orderId: string,
  token: string,
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  totalAmount: string,
  shippingAddress: { line1?: string; city?: string; postalCode?: string; country?: string },
  baseUrl: string,
  paymentMethod?: string,
  giftCardCode?: string,
  orderNumber?: number | null,
): string {
  const approveUrl = `${baseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=approve`;
  const rejectUrl = `${baseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=reject`;
  const proofUrl = `${baseUrl}/functions/v1/request-proof-of-payment?id=${orderId}&token=${token}`;

  const itemRows = items.map((item) => {
    const mlLabel = item.selectedMl ? ` — ${item.selectedMl}ml` : "";
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-family:Arial,sans-serif;">
      <strong>${item.brand}</strong> — ${item.name}${mlLabel}<br/>
      <span style="color:#666;">Qty: ${item.quantity} · €${(item.price * item.quantity).toFixed(2)}</span>
    </td></tr>`;
  }).join("");

  const addressText = shippingAddress
    ? [shippingAddress.line1, shippingAddress.city, shippingAddress.postalCode, shippingAddress.country].filter(Boolean).join(", ")
    : "N/A";

  const orderNumRow = orderNumber
    ? `<tr><td style="padding:4px 0;color:#999;width:120px;">Order #:</td><td style="padding:4px 0;"><strong>#${orderNumber}</strong></td></tr>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <div style="background:#1a1a1a;padding:24px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:22px;margin:0;letter-spacing:3px;">ORDER APPROVAL REQUIRED</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#333;margin:0 0 16px;">A new order needs your approval before the confirmation email is sent to the customer.</p>
    <table style="width:100%;margin-bottom:16px;font-size:14px;">
      ${orderNumRow}
      <tr><td style="padding:4px 0;color:#999;width:120px;">Customer:</td><td style="padding:4px 0;"><strong>${customerName}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#999;">Email:</td><td style="padding:4px 0;">${customerEmail}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Address:</td><td style="padding:4px 0;">${addressText}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Total:</td><td style="padding:4px 0;"><strong>€${totalAmount}</strong></td></tr>
    </table>
    <div style="text-align:center;margin-top:24px;margin-bottom:16px;">
      <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;margin-right:12px;">Approve</a>
      <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;">Reject</a>
    </div>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${proofUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:500;font-size:13px;">Request Proof of Payment</a>
    </div>
    <div style="border-top:2px solid #1a1a1a;padding-top:12px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px;">Order Items</div>
      <table style="width:100%;">${itemRows}</table>
    </div>
    ${paymentMethod === "rewarble" && giftCardCode ? `<div style="background:#fef3c7;border:2px solid #f59e0b;padding:16px 20px;border-radius:8px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;margin-bottom:6px;font-weight:600;">Rewarble Code</div>
      <div style="font-size:18px;font-weight:700;color:#92400e;letter-spacing:2px;font-family:monospace;">${giftCardCode}</div>
    </div>` : ""}
  </div>
</div>
</body></html>`;
}

async function sendWithBrevo(to: string, subject: string, htmlContent: string, replyTo?: string): Promise<void> {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");

  const emailPayload: any = {
    sender: { name: "ProfParfums Orders", email: "orders@profparfum.com" },
    to: [{ email: to }],
    subject,
    htmlContent,
  };
  if (replyTo) {
    emailPayload.replyTo = { email: replyTo };
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(emailPayload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error("Brevo API error (" + res.status + "): " + errBody);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderItems, customerEmail, customerName, shippingAddress, totalAmount, paymentMethod, giftCardCode } = body;

    if (!customerEmail) throw new Error("Customer email is required");
    if (!orderItems || orderItems.length === 0) throw new Error("No order items");

    // Normalize items
    const normalizedItems: OrderItem[] = orderItems.map((item: any) => {
      if (item.product) {
        return {
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.image,
          price: item.selectedPrice || item.product.price,
          quantity: item.quantity,
          selectedMl: item.selectedMl,
        };
      }
      return item as OrderItem;
    });

    const calculatedTotal = totalAmount || normalizedItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);
    const token = generateToken();

    // Store in orders table
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const refPrefix = paymentMethod === "rewarble" ? "rewarble" : "revolut";
    const { data: order, error: dbError } = await supabase.from("orders").insert({
      checkout_reference: refPrefix + "-" + Date.now(),
      customer_email: customerEmail,
      customer_name: customerName || "Valued Customer",
      shipping_address: shippingAddress || {},
      order_items: normalizedItems,
      total_amount: parseFloat(calculatedTotal),
      status: "pending_approval",
      approval_token: token,
      email_sent: false,
    }).select("id, order_number").single();

    if (dbError || !order) {
      console.error("Failed to store order:", dbError);
      throw new Error("Failed to store order");
    }

    // Send approval email to admin
    const html = buildApprovalEmailHtml(
      order.id,
      token,
      customerName || "Valued Customer",
      customerEmail,
      normalizedItems,
      calculatedTotal,
      shippingAddress || {},
      supabaseUrl,
      paymentMethod,
      giftCardCode,
      order.order_number,
    );

    const orderNumLabel = order.order_number ? ` #${order.order_number}` : "";
    const emailPrefix = paymentMethod === "rewarble" ? "Rewarble Order" : "Order Approval";
    await sendWithBrevo(ADMIN_EMAIL, `${emailPrefix}${orderNumLabel}: ${customerName || customerEmail} - EUR${calculatedTotal}`, html);

    console.log("Approval email sent to admin for order:", order.id);

    return new Response(JSON.stringify({ success: true, orderId: order.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error requesting order approval:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
