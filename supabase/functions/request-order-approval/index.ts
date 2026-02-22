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
): string {
  const approveUrl = `${baseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=approve`;
  const rejectUrl = `${baseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=reject`;

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

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <div style="background:#1a1a1a;padding:24px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:22px;margin:0;letter-spacing:3px;">ORDER APPROVAL REQUIRED</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#333;margin:0 0 16px;">A new order needs your approval before the confirmation email is sent to the customer.</p>
    <table style="width:100%;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:4px 0;color:#999;width:120px;">Customer:</td><td style="padding:4px 0;"><strong>${customerName}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#999;">Email:</td><td style="padding:4px 0;">${customerEmail}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Address:</td><td style="padding:4px 0;">${addressText}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Total:</td><td style="padding:4px 0;"><strong>€${totalAmount}</strong></td></tr>
    </table>
    <div style="border-top:2px solid #1a1a1a;padding-top:12px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px;">Order Items</div>
      <table style="width:100%;">${itemRows}</table>
    </div>
    ${paymentMethod === "rewarble" && giftCardCode ? `<div style="background:#fef3c7;border:2px solid #f59e0b;padding:16px 20px;border-radius:8px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;margin-bottom:6px;font-weight:600;">🎁 Rewarble Gift Card Code</div>
      <div style="font-size:20px;font-weight:700;color:#92400e;letter-spacing:2px;font-family:monospace;">${giftCardCode}</div>
      <p style="font-size:12px;color:#a16207;margin:8px 0 0;">Please verify this gift card code before approving.</p>
    </div>` : ""}
    <div style="text-align:center;padding:20px 0;">
      <a href="${approveUrl}" style="display:inline-block;padding:14px 40px;background:#16a34a;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;margin-right:12px;">✅ APPROVE</a>
      <a href="${rejectUrl}" style="display:inline-block;padding:14px 40px;background:#dc2626;color:#fff;text-decoration:none;border-radius:6px;font-size:16px;font-weight:600;">❌ REJECT</a>
    </div>
  </div>
</div>
</body></html>`;
}

function buildAdminInvoiceHtml(
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  totalAmount: string,
  billingAddress: { line1?: string; city?: string; postalCode?: string; country?: string },
  paymentMethod: string,
  giftCardCode?: string,
): string {
  const year = new Date().getFullYear();
  const now = new Date();
  const orderDate = now.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Amsterdam" });
  const invoiceNo = "INV-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0");
  const addressText = [billingAddress.line1, billingAddress.city, billingAddress.postalCode, billingAddress.country].filter(Boolean).join(", ") || "N/A";

  const itemRows = items.map((item, i) => {
    const mlLabel = item.selectedMl ? ` — ${item.selectedMl}ml` : "";
    const lineTotal = (item.price * item.quantity).toFixed(2);
    const bg = i % 2 === 0 ? "#ffffff" : "#fafaf8";
    return `<tr style="background:${bg};">
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;color:#333;">${item.brand} — ${item.name}${mlLabel} <span style="color:#c9a96e;font-weight:500;">(link)</span></td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:center;color:#333;">${item.quantity}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:right;color:#333;">€${item.price.toFixed(2)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:right;color:#333;font-weight:500;">€${lineTotal}</td>
    </tr>`;
  }).join("");

  const giftCardSection = giftCardCode ? `<div style="background:#fef3c7;border:2px solid #f59e0b;padding:12px 16px;border-radius:8px;margin-bottom:20px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;margin-bottom:4px;font-weight:600;">🎁 Gift Card Code</div>
    <div style="font-size:18px;font-weight:700;color:#92400e;letter-spacing:2px;font-family:monospace;">${giftCardCode}</div>
  </div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:0;overflow:hidden;border:1px solid #e8e5df;">

  <!-- Header -->
  <div style="background:#1a1a1a;padding:32px 40px;">
    <table style="width:100%;"><tr>
      <td style="vertical-align:top;">
        <h1 style="color:#c9a96e;font-size:24px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">ProfParfums</h1>
        <p style="color:#666;font-size:11px;letter-spacing:2px;margin:6px 0 0;text-transform:uppercase;">Premium Fragrances</p>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <p style="color:#c9a96e;font-size:20px;font-weight:300;letter-spacing:3px;margin:0;text-transform:uppercase;">Invoice</p>
      </td>
    </tr></table>
  </div>

  <!-- Invoice Meta -->
  <div style="padding:28px 40px 0;border-bottom:1px solid #f0ede8;">
    <table style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin:0 0 6px;">Bill To</p>
          <p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">${customerName}</p>
          <p style="font-size:13px;color:#666;margin:0 0 2px;">${customerEmail}</p>
          <p style="font-size:13px;color:#666;margin:0;">${addressText}</p>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <table style="margin-left:auto;">
            <tr><td style="padding:2px 0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;padding-right:12px;">Invoice No.</td><td style="padding:2px 0;font-size:13px;color:#1a1a1a;font-weight:500;">${invoiceNo}</td></tr>
            <tr><td style="padding:2px 0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;padding-right:12px;">Date</td><td style="padding:2px 0;font-size:13px;color:#1a1a1a;">${orderDate}</td></tr>
            <tr><td style="padding:2px 0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;padding-right:12px;">Payment</td><td style="padding:2px 0;font-size:13px;color:#1a1a1a;font-weight:500;">${paymentMethod}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Gift Card Code if applicable -->
  <div style="padding:${giftCardCode ? '20px 40px 0' : '0'};">
    ${giftCardSection}
  </div>

  <!-- Items Table -->
  <div style="padding:24px 40px;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#1a1a1a;">
          <th style="padding:10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Description</th>
          <th style="padding:10px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Qty</th>
          <th style="padding:10px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Unit Price</th>
          <th style="padding:10px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <table style="width:100%;margin-top:0;">
      <tr>
        <td style="width:60%;"></td>
        <td style="padding:16px 10px 6px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#999;">Subtotal</td>
        <td style="padding:16px 10px 6px;text-align:right;font-size:14px;color:#333;">€${totalAmount}</td>
      </tr>
      <tr>
        <td></td>
        <td style="padding:6px 10px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#999;">Tax (0%)</td>
        <td style="padding:6px 10px;text-align:right;font-size:14px;color:#333;">€0.00</td>
      </tr>
      <tr>
        <td></td>
        <td style="padding:12px 10px;text-align:right;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#1a1a1a;font-weight:700;border-top:2px solid #1a1a1a;">Total Due</td>
        <td style="padding:12px 10px;text-align:right;font-size:20px;color:#1a1a1a;font-weight:700;border-top:2px solid #1a1a1a;">€${totalAmount}</td>
      </tr>
    </table>
  </div>

  <!-- Delivery Details -->
  <div style="padding:0 40px 28px;">
    <div style="background:#faf9f6;border-left:3px solid #c9a96e;padding:16px 20px;">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin:0 0 6px;font-weight:600;">Delivery Details</p>
      <table style="width:100%;font-size:12px;color:#666;line-height:1.7;">
        <tr><td style="padding:2px 0;color:#999;width:110px;">Method:</td><td style="padding:2px 0;">Digital delivery (link)</td></tr>
        <tr><td style="padding:2px 0;color:#999;">Delivered to:</td><td style="padding:2px 0;">${customerEmail}</td></tr>
        <tr><td style="padding:2px 0;color:#999;">Delivered on:</td><td style="padding:2px 0;">${orderDate}</td></tr>
      </table>
      <p style="font-size:11px;color:#999;margin:8px 0 0;line-height:1.5;">This invoice serves as an itemized record and proof of service fulfillment. Customer agreed to terms of service at checkout.</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#1a1a1a;padding:24px 40px;text-align:center;">
    <p style="color:#c9a96e;font-size:13px;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase;">ProfParfums</p>
    <p style="color:#666;font-size:11px;margin:0;line-height:1.6;">© ${year} ProfParfums. All rights reserved.<br>
    <a href="mailto:support@profparfums.com" style="color:#888;text-decoration:none;">support@profparfums.com</a></p>
  </div>

</div>
</body></html>`;
}

async function sendWithBrevo(to: string, subject: string, htmlContent: string): Promise<void> {
  const apiKey = Deno.env.get("BREVO_API_KEY");
  if (!apiKey) throw new Error("BREVO_API_KEY not configured");

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "ProfParfums Orders", email: "orders@profparfum.com" },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
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
    }).select("id").single();

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
    );

    const emailPrefix = paymentMethod === "rewarble" ? "🎁 Gift Card Order" : "🔔 Order Approval";
    await sendWithBrevo(ADMIN_EMAIL, `${emailPrefix}: ${customerName || customerEmail} — €${calculatedTotal}`, html);

    // Send admin invoice/receipt
    const pmLabel = paymentMethod === "rewarble" ? "Gift Card (Pending Verification)" : "Revolut Transfer (Pending Verification)";
    const invoiceHtml = buildAdminInvoiceHtml(
      customerName || "Valued Customer",
      customerEmail,
      normalizedItems,
      calculatedTotal,
      shippingAddress || {},
      pmLabel,
      giftCardCode,
    );
    await sendWithBrevo(ADMIN_EMAIL, `📋 Invoice: ${customerName || customerEmail} — €${calculatedTotal}`, invoiceHtml);

    console.log("Approval + invoice emails sent to admin for order:", order.id);

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
