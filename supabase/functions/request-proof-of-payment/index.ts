import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const ADMIN_EMAIL = "ewhz3384@gmail.com";

function buildProofRequestEmailHtml(customerName: string, totalAmount: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">ProfParfums</h1>
    <p style="color:#666;font-size:12px;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">Premium Fragrances</p>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Proof of Payment Required</h2>
    <p style="font-size:15px;color:#333;line-height:1.6;margin:0 0 16px;">Hi <strong>${customerName}</strong>,</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 16px;">Thank you for your order of <strong>€${totalAmount}</strong>. To process your order, we need to verify your payment.</p>
    <p style="font-size:14px;color:#666;line-height:1.6;margin:0 0 24px;">Please <strong>reply to this email</strong> with a screenshot or photo of your payment confirmation (e.g. bank transfer receipt, transaction confirmation).</p>
    <div style="background:#eff6ff;border:2px solid #2563eb;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
      <p style="font-size:13px;color:#1e40af;margin:0;line-height:1.6;">📸 <strong>How to send proof:</strong><br/>Simply reply to this email and attach a screenshot or photo of your payment. You can use your phone's camera or take a screenshot of your banking app.</p>
    </div>
    <p style="font-size:13px;color:#999;line-height:1.6;margin:0;">Once verified, we'll confirm your order and send you a confirmation email with all the details.</p>
  </div>
  <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
    <p style="color:#c9a96e;font-size:14px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">ProfParfums</p>
    <p style="color:#666;font-size:11px;margin:0;">&copy; ${year} ProfParfums. All rights reserved.</p>
  </div>
</div>
</body></html>`;
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

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("id");
    const token = url.searchParams.get("token");

    if (!orderId || !token) {
      return new Response(buildResultPage("Invalid Link", "Missing order ID or token.", false), {
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

    // Send proof request email to customer with reply-to set to admin
    const html = buildProofRequestEmailHtml(
      order.customer_name || "Valued Customer",
      order.total_amount.toString(),
    );

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
        to: [{ email: order.customer_email }],
        replyTo: { email: ADMIN_EMAIL },
        subject: "Proof of Payment Required — ProfParfums",
        htmlContent: html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error("Brevo error: " + errBody);
    }

    console.log("Proof of payment email sent to:", order.customer_email);

    // Send admin a follow-up email with Approve/Reject buttons
    const approveUrl = `${supabaseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=approve`;
    const rejectUrl = `${supabaseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=reject`;
    const customerName = order.customer_name || "Valued Customer";

    const adminFollowUpHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <div style="background:#1a1a1a;padding:24px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:22px;margin:0;letter-spacing:3px;">PROOF REQUESTED</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#333;margin:0 0 16px;">Proof of payment has been requested from <strong>${customerName}</strong> (${order.customer_email}).</p>
    <p style="font-size:14px;color:#666;margin:0 0 8px;">Order total: <strong>EUR${order.total_amount}</strong></p>
    <p style="font-size:14px;color:#666;margin:0 0 24px;">Once you receive their reply with proof, use the buttons below to approve or reject the order.</p>
    <div style="text-align:center;">
      <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;margin-right:12px;">Approve</a>
      <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;">Reject</a>
    </div>
  </div>
</div>
</body></html>`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "ProfParfums Orders", email: "orders@profparfum.com" },
        to: [{ email: ADMIN_EMAIL }],
        subject: `Proof Requested: ${customerName} - EUR${order.total_amount}`,
        htmlContent: adminFollowUpHtml,
      }),
    });

    return new Response(
      buildResultPage("Proof Requested", `Proof request sent to ${order.customer_email}. You will also receive an email with Approve/Reject buttons.`, true),
      { headers: { "Content-Type": "text/html" }, status: 200 },
    );
  } catch (error) {
    console.error("Error requesting proof:", error);
    return new Response(buildResultPage("Error", "Something went wrong. Please try again.", false), {
      headers: { "Content-Type": "text/html" }, status: 500,
    });
  }
});
