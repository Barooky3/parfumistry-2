import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Look up the order and verify token
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
      // Update status
      await supabase.from("orders").update({ status: "approved" }).eq("id", orderId);

      // Send the customer confirmation email via the existing function
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
      console.log("Order approved and customer email sent:", orderId);

      return new Response(buildResultPage("Order Approved ✅", `The confirmation email has been sent to ${order.customer_email}.`, true), {
        headers: { "Content-Type": "text/html" },
        status: 200,
      });
    } else {
      // Reject
      await supabase.from("orders").update({ status: "rejected", approval_token: null }).eq("id", orderId);

      // Send rejection email to customer - check if it's a gift card order
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
