import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { email, name } = await req.json();
    if (!email || !name) throw new Error("Email and name are required");

    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY not configured");

    const year = new Date().getFullYear();

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">

  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">ProfParfums</h1>
    <p style="color:#666;font-size:12px;letter-spacing:2px;margin:8px 0 0;text-transform:uppercase;">Premium Fragrances</p>
  </div>

  <div style="background:linear-gradient(135deg,#c9a96e 0%,#b8944f 100%);padding:28px 32px;text-align:center;">
    <h2 style="color:#fff;font-size:22px;font-weight:400;margin:0;letter-spacing:1px;">Welcome to ProfParfums! 🎉</h2>
  </div>

  <div style="padding:32px;">
    <p style="font-size:16px;color:#333;line-height:1.6;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
    <p style="font-size:14px;color:#666;line-height:1.7;margin:0 0 16px;">Thank you so much for creating an account with us! We're thrilled to have you as part of the ProfParfums family. You now have access to our exclusive collection of premium fragrances at unbeatable prices.</p>
    <p style="font-size:14px;color:#666;line-height:1.7;margin:0 0 24px;">As a thank-you for joining, here's your exclusive welcome discount:</p>

    <div style="background:#1a1a1a;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
      <p style="color:#c9a96e;font-size:12px;letter-spacing:3px;text-transform:uppercase;margin:0 0 8px;">Your Exclusive Discount Code</p>
      <div style="background:#c9a96e;display:inline-block;padding:10px 28px;border-radius:6px;margin-bottom:12px;">
        <span style="font-size:28px;font-weight:700;letter-spacing:4px;color:#1a1a1a;">Parfum10</span>
      </div>
      <p style="color:#fff;font-size:16px;font-weight:600;margin:8px 0 4px;">10% OFF your first order</p>
      <p style="color:#f59e0b;font-size:13px;margin:0;">⏰ Valid for 13 hours only — don't miss out!</p>
    </div>

    <p style="font-size:14px;color:#666;line-height:1.7;margin:0 0 16px;">Simply enter the code <strong>Parfum10</strong> at checkout to claim your discount. Browse our collection and find your signature scent today!</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://profparfums.lovable.app/shop" style="display:inline-block;background:#1a1a1a;color:#c9a96e;padding:14px 36px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;letter-spacing:1px;text-transform:uppercase;">Start Shopping</a>
    </div>

    <div style="background:#faf9f6;border:1px solid #eee;padding:20px 24px;border-radius:8px;text-align:center;margin-top:24px;">
      <p style="font-size:13px;color:#666;margin:0;line-height:1.6;">Need help? We're always here for you at<br>
      <a href="mailto:support@profparfums.com" style="color:#c9a96e;text-decoration:none;font-weight:500;">support@profparfums.com</a></p>
    </div>
  </div>

  <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
    <p style="color:#c9a96e;font-size:14px;letter-spacing:3px;margin:0 0 8px;text-transform:uppercase;">ProfParfums</p>
    <p style="color:#666;font-size:11px;margin:0;">&copy; ${year} ProfParfums. All rights reserved.</p>
  </div>

</div>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ProfParfums <orders@profparfum.com>",
        to: [email],
        subject: "Welcome to ProfParfums! 🎁 Here's 10% Off Your First Order",
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error("Resend API error (" + res.status + "): " + errBody);
    }

    console.log("Welcome email sent to:", email);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
