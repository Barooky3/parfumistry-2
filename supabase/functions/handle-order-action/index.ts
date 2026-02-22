import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

function buildResultPage(title: string, message: string, success: boolean): string {
  const color = success ? "#16a34a" : "#dc2626";
  const icon = success ? "✅" : "❌";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:40px;background:#f4f3ef;font-family:Arial,sans-serif;text-align:center;">
<div style="max-width:500px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
  <div style="font-size:48px;margin-bottom:16px;">${icon}</div>
  <h1 style="color:${color};font-size:24px;margin:0 0 12px;">${title}</h1>
  <p style="color:#666;font-size:16px;line-height:1.6;margin:0;">${message}</p>
</div>
</body></html>`;
}

function buildRejectionEmailHtml(customerName: string, isGiftCard: boolean = false): string {
  const year = new Date().getFullYear();
  const reason = isGiftCard
    ? "Unfortunately, the gift card code you provided for your recent order could not be verified and is invalid. Your order has been cancelled."
    : "Unfortunately, your payment could not be verified and did not go through. <strong>No money has been taken from your account.</strong>";
  const nextStep = isGiftCard
    ? "If you believe this is an error, please contact us and we'll be happy to assist you."
    : "Please try again and ensure the payment is completed successfully before confirming your order. If the issue persists, feel free to reach out to us for assistance.";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">ProfParfums</h1>
    <p style="color:#666;font-size:12px;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">Premium Fragrances</p>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Payment Not Received</h2>
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">Hi <strong>${customerName}</strong>,</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 16px;">${reason}</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">${nextStep}</p>
    <div style="background:#faf9f6;border:1px solid #eee;padding:20px 24px;border-radius:8px;text-align:center;">
      <p style="font-size:13px;color:#666;margin:0;line-height:1.6;">Need help? Contact us at<br>
      <a href="mailto:support@profparfums.com" style="color:#c9a96e;text-decoration:none;font-weight:500;">support@profparfums.com</a></p>
    </div>
  </div>
  <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
    <p style="color:#c9a96e;font-size:14px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">ProfParfums</p>
    <p style="color:#666;font-size:11px;margin:0;">&copy; ${year} ProfParfums. All rights reserved.</p>
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
  <div style="padding:${giftCardCode ? '20px 40px 0' : '0'};">
    ${giftCardSection}
  </div>
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
      sender: { name: "ProfParfums", email: "orders@profparfum.com" },
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
    const url = new URL(req.url);
    const orderId = url.searchParams.get("id");
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");

    if (!orderId || !token || !action) {
      return new Response(buildResultPage("Invalid Link", "This link is missing required parameters.", false), {
        headers: { "Content-Type": "text/html" },
        status: 400,
      });
    }

    if (action !== "approve" && action !== "reject") {
      return new Response(buildResultPage("Invalid Action", "The action must be 'approve' or 'reject'.", false), {
        headers: { "Content-Type": "text/html" },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("approval_token", token)
      .maybeSingle();

    if (orderErr || !order) {
      return new Response(buildResultPage("Invalid Link", "This approval link is invalid or has expired.", false), {
        headers: { "Content-Type": "text/html" },
        status: 404,
      });
    }

    if (order.status !== "pending_approval") {
      const already = order.status === "approved" ? "already been approved" : "already been processed";
      return new Response(buildResultPage("Already Processed", `This order has ${already}.`, false), {
        headers: { "Content-Type": "text/html" },
        status: 200,
      });
    }

    if (action === "approve") {
      await supabase.from("orders").update({ status: "approved" }).eq("id", orderId);

      // Send the customer confirmation email
      const { error: emailError } = await supabase.functions.invoke("send-order-confirmation", {
        body: {
          orderItems: order.order_items,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          shippingAddress: order.shipping_address,
          totalAmount: order.total_amount.toString(),
        },
      });

      if (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        return new Response(buildResultPage("Approval Error", "Order approved but failed to send customer email. Please try again.", false), {
          headers: { "Content-Type": "text/html" },
          status: 500,
        });
      }

      await supabase.from("orders").update({ email_sent: true, approval_token: null }).eq("id", orderId);

      // Send admin invoice after approval
      const items: OrderItem[] = (order.order_items as any[]).map((item: any) => ({
        name: item.name || item.product?.name || "",
        brand: item.brand || item.product?.brand || "",
        image: item.image || item.product?.image || "",
        price: item.selectedPrice || item.price || item.product?.price || 0,
        quantity: item.quantity || 1,
        selectedMl: item.selectedMl,
      }));
      const isGiftCard = order.checkout_reference?.startsWith("rewarble");
      const pmLabel = isGiftCard ? "Gift Card (Verified)" : "Revolut Transfer (Verified)";
      const giftCardCode = isGiftCard ? order.checkout_reference?.replace("rewarble-", "") : undefined;
      const invoiceHtml = buildAdminInvoiceHtml(
        order.customer_name || "Valued Customer",
        order.customer_email,
        items,
        order.total_amount.toString(),
        (order.shipping_address as any) || {},
        pmLabel,
        giftCardCode,
      );
      await sendWithBrevo(ADMIN_EMAIL, `📋 Invoice: ${order.customer_name || order.customer_email} — €${order.total_amount}`, invoiceHtml);

      console.log("Order approved, customer email + admin invoice sent:", orderId);

      return new Response(buildResultPage("Order Approved ✅", `The confirmation email has been sent to ${order.customer_email}.`, true), {
        headers: { "Content-Type": "text/html" },
        status: 200,
      });
    } else {
      await supabase.from("orders").update({ status: "rejected", approval_token: null }).eq("id", orderId);

      const isGiftCard = order.checkout_reference?.startsWith("rewarble");
      const rejectionHtml = buildRejectionEmailHtml(order.customer_name || "Valued Customer", isGiftCard);
      await sendWithBrevo(order.customer_email, "Order Update - ProfParfums", rejectionHtml);

      console.log("Order rejected and customer notified:", orderId);

      return new Response(buildResultPage("Order Rejected", `A rejection notification has been sent to ${order.customer_email}.`, false), {
        headers: { "Content-Type": "text/html" },
        status: 200,
      });
    }
  } catch (error) {
    console.error("Error handling order action:", error);
    return new Response(buildResultPage("Error", "Something went wrong. Please try again.", false), {
      headers: { "Content-Type": "text/html" },
      status: 500,
    });
  }
});