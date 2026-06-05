import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["ewhz3384@gmail.com", "elkhabirmalik@gmail.com"];

const VALID_DISCOUNT_CODES: Record<string, number> = {
  'professor15': 15,
  'parfum10': 10,
  'parfumz20': 20,
  'parfumo30': 30,
  'parfuma90': 90,
  'parfumz50': 50,
};

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

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
  shippingAddress: { line1?: string; line2?: string; city?: string; postalCode?: string; country?: string },
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

  const addressLines = [
    shippingAddress?.line1,
    shippingAddress?.line2,
    [shippingAddress?.postalCode, shippingAddress?.city].filter(Boolean).join(" "),
    shippingAddress?.country,
  ].filter(Boolean);
  const addressHtml = addressLines.length > 0 ? addressLines.map((l) => escapeHtml(String(l))).join("<br/>") : "N/A";

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
      <tr><td style="padding:4px 0;color:#999;width:120px;">Customer:</td><td style="padding:4px 0;"><strong>${escapeHtml(customerName)}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#999;">Email:</td><td style="padding:4px 0;">${escapeHtml(customerEmail)}</td></tr>
      <tr><td style="padding:4px 0;color:#999;vertical-align:top;">Address:</td><td style="padding:4px 0;line-height:1.5;">${addressHtml}</td></tr>
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

function buildProofRequestEmailHtml(customerName: string, totalAmount: string, orderNumber?: number | null): string {
  const year = new Date().getFullYear();
  const orderNumText = orderNumber ? `<p style="font-size:13px;color:#999;margin:0 0 12px;">Order Number: <strong style="color:#1a1a1a;">#${orderNumber}</strong></p>` : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">Parfumistry</h1>
    <p style="color:#666;font-size:12px;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">Premium Fragrances</p>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Proof of Payment Required</h2>
    ${orderNumText}
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">Hi <strong>${escapeHtml(customerName)}</strong>,</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 16px;">Thank you for your order of <strong>&euro;${totalAmount}</strong>. To process your order and send you the confirmation email, we need to verify your payment.</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">Please <strong>reply to this email</strong> with a screenshot or photo of your payment confirmation (e.g. bank transfer receipt, transaction confirmation).</p>
    <div style="background:#eff6ff;border:2px solid #2563eb;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
      <p style="font-size:13px;color:#1e40af;margin:0;line-height:1.6;">📸 <strong>How to send proof:</strong><br/>Simply reply to this email and attach a screenshot or photo of your payment. You can use your phone's camera or take a screenshot of your banking app.</p>
    </div>
    <p style="font-size:13px;color:#999;line-height:1.6;margin:0;">Once you send your proof of payment, we'll verify it and send you the order confirmation email right away.${orderNumber ? ' Please reference order <strong>#' + orderNumber + '</strong> in your reply.' : ''}</p>
  </div>
  <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
    <p style="color:#c9a96e;font-size:14px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">Parfumistry</p>
    <p style="color:#666;font-size:11px;margin:0;">&copy; ${year} Parfumistry. All rights reserved.</p>
  </div>
</div>
</body></html>`;
}

async function sendEmail(to: string | string[], subject: string, htmlContent: string, replyTo?: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const emailPayload: any = {
    from: "Parfumistry Orders <orders@parfumistry.net>",
    to: Array.isArray(to) ? to : [to],
    subject,
    html: htmlContent,
  };
  if (replyTo) {
    emailPayload.reply_to = replyTo;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(emailPayload),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error("Resend API error (" + res.status + "): " + errBody);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { orderItems, customerEmail, customerName, shippingAddress, totalAmount, paymentMethod, giftCardCode, discountCode, idempotencyKey, firstVisitAt } = body;
    const discountPercent = VALID_DISCOUNT_CODES[discountCode?.toLowerCase().trim() || ''] ?? 0;

    if (!customerEmail) throw new Error("Customer email is required");
    if (!orderItems || orderItems.length === 0) throw new Error("No order items");

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Server-side idempotency check: if this idempotency key was already used, return the existing order
    if (idempotencyKey) {
      const refPrefix = paymentMethod === "rewarble" ? "rewarble" : paymentMethod === "bank_transfer" ? "bank-transfer" : paymentMethod === "revolut_app" ? "revolut-app" : "revolut";
      const expectedRef = refPrefix + "-idem-" + idempotencyKey;
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, order_number")
        .eq("checkout_reference", expectedRef)
        .maybeSingle();

      if (existingOrder) {
        console.log("Duplicate submission detected, returning existing order:", existingOrder.id);
        return new Response(JSON.stringify({ success: true, orderId: existingOrder.id, orderNumber: existingOrder.order_number }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    const refPrefix = paymentMethod === "rewarble" ? "rewarble" : paymentMethod === "bank_transfer" ? "bank-transfer" : paymentMethod === "revolut_app" ? "revolut-app" : "revolut";
    const checkoutRef = idempotencyKey ? refPrefix + "-idem-" + idempotencyKey : refPrefix + "-" + Date.now();
    // Privacy: do NOT store full address. Only persist country + shipping method.
    const minimalShipping = {
      country: shippingAddress?.country || null,
      shippingMethod: (shippingAddress as any)?.shippingMethod || null,
    };
    const { data: order, error: dbError } = await supabase.from("orders").insert({
      checkout_reference: checkoutRef,
      customer_email: customerEmail,
      customer_name: customerName || "Valued Customer",
      shipping_address: minimalShipping,
      order_items: normalizedItems,
      total_amount: parseFloat(calculatedTotal),
      status: "pending_approval",
      approval_token: token,
      email_sent: false,
      gift_card_code: giftCardCode || null,
      discount_code: discountCode || null,
      discount_percent: discountPercent || 0,
      first_visit_at: firstVisitAt ? new Date(firstVisitAt).toISOString() : null,
    }).select("id, order_number").single();

    if (dbError || !order) {
      console.error("Failed to store order:", dbError);
      throw new Error("Failed to store order");
    }

    // Send approval email to admin immediately for all payment methods
    const html = buildApprovalEmailHtml(
      order.id,
      token,
      customerName || "Valued Customer",
      customerEmail,
      normalizedItems,
      calculatedTotal,
      { country: shippingAddress?.country },
      supabaseUrl,
      paymentMethod,
      giftCardCode,
      order.order_number,
    );

    const orderNumLabel = order.order_number ? ` #${order.order_number}` : "";
    const methodLabels: Record<string, string> = {
      rewarble: "Rewarble Order",
      revolut_app: "Revolut Order",
      bank_transfer: "Bank Transfer Order",
      paypal_eneba: "PayPal/Eneba Order",
    };
    const emailPrefix = methodLabels[paymentMethod || ""] || "Order Approval";
    await sendEmail(ADMIN_EMAILS, `${emailPrefix}${orderNumLabel}: ${customerName || customerEmail} - EUR${calculatedTotal}`, html);
    console.log("Approval email sent to admin for order:", order.id);

    // Auto proof emails removed — customers now upload proof via the website after confirming payment

    return new Response(JSON.stringify({ success: true, orderId: order.id, orderNumber: order.order_number }), {
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
