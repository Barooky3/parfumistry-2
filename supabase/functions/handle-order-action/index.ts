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
  const icon = success ? "V" : "X";
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

function buildRejectionEmailHtml(customerName: string, isGiftCard: boolean = false, orderNumber?: number | null, isBankTransfer: boolean = false): string {
  const year = new Date().getFullYear();
  let reason: string;
  if (isGiftCard) {
    reason = "Unfortunately, the Rewarble code you provided for your recent order could not be verified and is invalid. Your order has been cancelled.";
  } else if (isBankTransfer) {
    reason = "Unfortunately, your bank transfer could not be verified or was bounced back by the receiving bank. Your order has been cancelled.<br><br><strong>If you did send the payment, don't worry -- your money is already on its way back to your account.</strong> Depending on your bank, it may take 1-3 business days to appear in your balance.";
  } else {
    reason = "Unfortunately, your payment could not be verified and did not go through. <strong>No money has been taken from your account.</strong>";
  }
  const giftCardTip = isGiftCard
    ? `<div style="background:#fef3c7;border:1px solid #f59e0b;padding:16px 20px;border-radius:8px;margin:16px 0;">
        <p style="font-size:14px;font-weight:600;color:#92400e;margin:0 0 8px;">Important: Send the Gift Card Code, NOT the Order Number</p>
        <p style="font-size:13px;color:#92400e;line-height:1.6;margin:0;">Please make sure you send us the <strong>actual Rewarble gift card code</strong>. The gift card code is <strong>16 characters long and contains letters</strong>. The Rewarble <strong>order number</strong> (e.g. a number starting with #, containing only digits) is <strong>not</strong> the gift card code and cannot be used to redeem your purchase.</p>
      </div>`
    : "";
  let nextStep: string;
  if (isGiftCard) {
    nextStep = "If you believe this is an error, please contact us and we'll be happy to assist you.";
  } else if (isBankTransfer) {
    nextStep = "If you'd like to try again, please place a new order and make sure to include your email address in the payment reference so we can match your transfer. If you have any questions, don't hesitate to reach out.";
  } else {
    nextStep = "Please try again and ensure the payment is completed successfully before confirming your order. If the issue persists, feel free to reach out to us for assistance.";
  }
  const orderNumText = orderNumber ? `<p style="font-size:13px;color:#999;margin:0 0 12px;">Order Number: <strong style="color:#1a1a1a;">#${orderNumber}</strong></p>` : "";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">ProfParfums</h1>
    <p style="color:#666;font-size:12px;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">Premium Fragrances</p>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Payment Not Received</h2>
    ${orderNumText}
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">Hi <strong>${customerName}</strong>,</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 16px;">${reason}</p>
    ${giftCardTip}
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">${nextStep}</p>
    <div style="background:#faf9f6;border:1px solid #eee;padding:20px 24px;border-radius:8px;text-align:center;">
      <p style="font-size:13px;color:#666;margin:0;line-height:1.6;">Need help? Contact us at<br>
      <a href="mailto:support@profparfums.com" style="color:#c9a96e;text-decoration:none;font-weight:500;">support@profparfums.com</a>${orderNumber ? '<br><span style="font-size:12px;color:#999;">Please include your order number: <strong>#' + orderNumber + '</strong></span>' : ''}</p>
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
    const mlLabel = item.selectedMl ? ` - ${item.selectedMl}ml` : "";
    const lineTotal = (item.price * item.quantity).toFixed(2);
    const bg = i % 2 === 0 ? "#ffffff" : "#fafaf8";
    return `<tr style="background:${bg};">
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;color:#333;">${item.brand} - ${item.name}${mlLabel} <span style="color:#c9a96e;font-weight:500;">(link)</span></td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:center;color:#333;">${item.quantity}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:right;color:#333;">EUR${item.price.toFixed(2)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:right;color:#333;font-weight:500;">EUR${lineTotal}</td>
    </tr>`;
  }).join("");

  const giftCardSection = giftCardCode ? `<div style="background:#fef3c7;border:2px solid #f59e0b;padding:12px 16px;border-radius:8px;margin-bottom:20px;">
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#92400e;margin-bottom:4px;font-weight:600;">Rewarble Code</div>
    <div style="font-size:18px;font-weight:700;color:#92400e;letter-spacing:2px;font-family:monospace;">${giftCardCode}</div>
  </div>` : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">ProfParfums</h1>
    <p style="color:#666;font-size:12px;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">Admin Invoice</p>
  </div>
  <div style="padding:32px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:20px;">
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:4px;">Invoice No</div>
        <div style="font-size:14px;font-weight:600;color:#333;">${invoiceNo}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:4px;">Date</div>
        <div style="font-size:14px;color:#333;">${orderDate}</div>
      </div>
    </div>
    <table style="width:100%;margin-bottom:16px;font-size:13px;">
      <tr><td style="padding:4px 0;color:#999;width:100px;">Customer:</td><td style="padding:4px 0;"><strong>${customerName}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#999;">Email:</td><td style="padding:4px 0;">${customerEmail}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Address:</td><td style="padding:4px 0;">${addressText}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Payment:</td><td style="padding:4px 0;">${paymentMethod}</td></tr>
    </table>
    ${giftCardSection}
    <div style="border-top:2px solid #1a1a1a;padding-top:12px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px;">Order Items</div>
      <table style="width:100%;">
        <thead><tr style="background:#f4f3ef;">
          <th style="padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Item</th>
          <th style="padding:8px 10px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Qty</th>
          <th style="padding:8px 10px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Price</th>
          <th style="padding:8px 10px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;">Total</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
    </div>
    <div style="text-align:right;padding-top:12px;border-top:2px solid #1a1a1a;">
      <span style="font-size:14px;color:#999;">Total:</span>
      <span style="font-size:20px;font-weight:700;color:#1a1a1a;margin-left:8px;">EUR${totalAmount}</span>
    </div>
    <div style="background:#f4f3ef;padding:16px;border-radius:8px;margin-top:20px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:6px;">Delivery Details</div>
      <table style="width:100%;font-size:13px;">
        <tr><td style="padding:2px 0;color:#999;width:80px;">Method:</td><td style="padding:2px 0;color:#333;">Digital</td></tr>
        <tr><td style="padding:2px 0;color:#999;">To:</td><td style="padding:2px 0;color:#333;">${customerEmail}</td></tr>
        <tr><td style="padding:2px 0;color:#999;">Time:</td><td style="padding:2px 0;color:#333;">${orderDate}</td></tr>
      </table>
    </div>
  </div>
  <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
    <p style="color:#c9a96e;font-size:14px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">ProfParfums</p>
    <p style="color:#666;font-size:11px;margin:0;">&copy; ${year} ProfParfums. All rights reserved.</p>
  </div>
</div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ProfParfums Orders <orders@profparfum.com>",
      to: [to],
      subject,
      html: htmlContent,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error("Resend API error (" + res.status + "): " + errBody);
  }
}

async function sendConfirmationViaFunction(
  supabaseUrl: string,
  customerEmail: string,
  customerName: string,
  items: OrderItem[],
  totalAmount: string,
  shippingAddress: { line1?: string; city?: string; postalCode?: string; country?: string },
  orderNumber?: number | null,
  paymentMethod?: string,
): Promise<void> {
  const url = supabaseUrl + "/functions/v1/send-order-confirmation";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + Deno.env.get("SUPABASE_ANON_KEY")!,
    },
    body: JSON.stringify({
      orderItems: items,
      customerEmail,
      customerName,
      shippingAddress,
      totalAmount,
      orderNumber,
      paymentMethod,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error("send-order-confirmation error: " + errBody);
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
      return new Response(buildResultPage("Invalid Link", "Missing required parameters.", false), {
        headers: { "Content-Type": "text/html" }, status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("approval_token", token)
      .single();

    if (error || !order) {
      return new Response(buildResultPage("Invalid Link", "This link is invalid or has already been used.", false), {
        headers: { "Content-Type": "text/html" }, status: 404,
      });
    }

    if (action === "approve") {
      // Prevent duplicate invoice: only process if not already approved
      if (order.status === "approved" && order.email_sent === true) {
        return new Response(buildResultPage("Already Approved", "This order has already been approved and the confirmation email was sent.", true), {
          headers: { "Content-Type": "text/html" }, status: 200,
        });
      }

      await supabase.from("orders").update({ status: "approved", email_sent: true }).eq("id", orderId);

      const items = (order.order_items as unknown as OrderItem[]) || [];

      // Check email validity via Resend before sending
      let emailWarning = "";
      const isRewarble = order.checkout_reference?.startsWith("rewarble");
      const isBankTransfer = order.checkout_reference?.startsWith("bank-transfer");
      const noLinksMethod = isRewarble ? "rewarble" : isBankTransfer ? "bank_transfer" : undefined;
      try {
        await sendConfirmationViaFunction(
          supabaseUrl,
          order.customer_email,
          order.customer_name || "Valued Customer",
          items,
          order.total_amount.toString(),
          (order.shipping_address as any) || {},
          order.order_number,
          noLinksMethod,
        );
      } catch (emailErr: any) {
        console.error("Failed to send customer email:", emailErr);
        emailWarning = `⚠️ WARNING: The customer email (${order.customer_email}) may be invalid or unreachable. The confirmation email could not be delivered. Error: ${emailErr.message}`;
      }

      // Send admin invoice (only once — this block only runs on first approval)
      const isGiftCard = order.checkout_reference?.startsWith("rewarble");
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
      const orderNumLabel = order.order_number ? ` #${order.order_number}` : "";
      const invoiceSubject = (emailWarning ? "⚠️ EMAIL ISSUE — " : "") + "Invoice" + orderNumLabel + ": " + (order.customer_name || order.customer_email) + " - EUR" + order.total_amount;
      
      // If there was an email warning, prepend it to the invoice HTML
      let finalInvoiceHtml = invoiceHtml;
      if (emailWarning) {
        const warningBanner = `<div style="background:#fef2f2;border:2px solid #dc2626;padding:16px 20px;margin:16px 40px;border-radius:8px;">
          <p style="color:#dc2626;font-size:14px;font-weight:600;margin:0 0 6px;">⚠️ Email Delivery Issue</p>
          <p style="color:#991b1b;font-size:13px;margin:0;">The customer email <strong>${order.customer_email}</strong> appears to be invalid or unreachable. The confirmation email may not have been delivered. Please contact the customer directly.</p>
        </div>`;
        finalInvoiceHtml = invoiceHtml.replace('<!-- Invoice Meta -->', warningBanner + '\n  <!-- Invoice Meta -->');
        // Fallback if comment not found
        if (!finalInvoiceHtml.includes('Email Delivery Issue')) {
          finalInvoiceHtml = invoiceHtml.replace('<div style="padding:28px 40px 0', warningBanner + '<div style="padding:28px 40px 0');
        }
      }
      
      await sendEmail(ADMIN_EMAIL, invoiceSubject, finalInvoiceHtml);

      console.log("Order approved, customer email + admin invoice sent:", orderId);

      const resultMsg = emailWarning
        ? "Order approved. ⚠️ However, the customer email (" + order.customer_email + ") may be invalid — the confirmation email might not have been delivered."
        : "The confirmation email has been sent to " + order.customer_email + ".";

      return new Response(buildResultPage("Order Approved", resultMsg, true), {
        headers: { "Content-Type": "text/html" },
        status: 200,
      });
    } else {
      // Prevent duplicate rejection
      if (order.status === "rejected") {
        return new Response(buildResultPage("Already Rejected", "This order has already been rejected.", false), {
          headers: { "Content-Type": "text/html" }, status: 200,
        });
      }

      await supabase.from("orders").update({ status: "rejected" }).eq("id", orderId);

      const isGiftCard = order.checkout_reference?.startsWith("rewarble");
      const isBankTransferRej = order.checkout_reference?.startsWith("bank-transfer");
      const rejectionHtml = buildRejectionEmailHtml(order.customer_name || "Valued Customer", isGiftCard, order.order_number, isBankTransferRej);
      const rejSubject = order.order_number ? `Order #${order.order_number} Update - ProfParfums` : "Order Update - ProfParfums";
      
      let rejEmailWarning = "";
      try {
        await sendEmail(order.customer_email, rejSubject, rejectionHtml);
      } catch (emailErr: any) {
        console.error("Failed to send rejection email:", emailErr);
        rejEmailWarning = ` ⚠️ Note: The rejection email to ${order.customer_email} may not have been delivered (email might be invalid).`;
      }

      console.log("Order rejected and customer notified:", orderId);

      return new Response(buildResultPage("Order Rejected", "A rejection notification has been sent to " + order.customer_email + "." + rejEmailWarning, false), {
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
