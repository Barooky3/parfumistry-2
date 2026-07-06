import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return new Response(JSON.stringify({ error: "no key" }), { status: 500, headers: corsHeaders });

  const to = "aarush.bhakoo2011@gmail.com";
  const message = `In order to redo your order, simply purchase another €120 code, and place a new order using:

1. The two old codes that were auto-redeemed by the system, and
2. The new €120 code.

You're only required to pay for the €120 that was used at the start.`;

  const year = new Date().getFullYear();
  const html = `<!DOCTYPE html><html><body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;">PARFUMISTRY</h1>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">How to Redo Your Order</h2>
    <p style="font-size:15px;color:#333;">Hi,</p>
    <p style="font-size:14px;color:#666;line-height:1.7;">In order to redo your order, simply purchase another <strong>€120 code</strong>, and place a new order using:</p>
    <ol style="font-size:14px;color:#666;line-height:1.8;padding-left:20px;">
      <li>The <strong>two old codes</strong> that were auto-redeemed by the system, and</li>
      <li>The <strong>new €120 code</strong>.</li>
    </ol>
    <p style="font-size:14px;color:#666;line-height:1.7;">You're only required to pay for the <strong>€120</strong> that was used at the start.</p>
    <div style="background:#faf9f6;border:1px solid #eee;padding:20px 24px;border-radius:8px;text-align:center;margin-top:24px;">
      <p style="font-size:13px;color:#666;margin:0;">Need help? Contact us at <a href="mailto:support@parfumistry.net" style="color:#c9a96e;">support@parfumistry.net</a></p>
    </div>
  </div>
  <div style="background:#1a1a1a;padding:20px 32px;text-align:center;">
    <p style="color:#666;font-size:11px;margin:0;">&copy; ${year} Parfumistry. All rights reserved.</p>
  </div>
</div></body></html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Parfumistry <orders@parfumistry.net>",
      to: [to],
      subject: "How to Redo Your Order — Parfumistry",
      text: message,
      html,
    }),
  });

  const body = await res.text();
  return new Response(JSON.stringify({ status: res.status, body }), {
    status: res.ok ? 200 : 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
