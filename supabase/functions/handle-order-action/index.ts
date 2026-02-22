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
    ? "Unfortunately, the Rewarble code you provided for your recent order could not be verified and is invalid. Your order has been cancelled."
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
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;margin-bottom:4px;font-weight:600;">🎁 Rewarble Code</div>
...
      const pmLabel = isGiftCard ? "Rewarble (Verified)" : "Revolut Transfer (Verified)";
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