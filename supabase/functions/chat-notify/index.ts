import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "ewhz3384@gmail.com";
const SITE_URL = "https://profparfums.lovable.app";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id, message, user_email } = await req.json();

    // Check if conversation is blocked — silently skip notification
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: conv } = await supabase
      .from("chat_conversations")
      .select("blocked")
      .eq("id", conversation_id)
      .single();

    if (conv?.blocked) {
      return new Response(JSON.stringify({ success: true, skipped: true }), { headers: corsHeaders });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "No email key" }), { status: 500, headers: corsHeaders });
    }

    const replyUrl = `${SITE_URL}/admin/chat-reply?id=${conversation_id}&email=${encodeURIComponent(user_email)}`;
    const chatUrl = `${SITE_URL}/admin/orders`;

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ProfParfums <orders@profparfum.com>",
        to: [ADMIN_EMAIL],
        subject: `💬 New Chat Message from ${user_email}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #333; margin-bottom: 4px;">New Live Chat Message</h2>
            <p style="margin: 0 0 16px; color: #666;"><strong>From:</strong> ${user_email}</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 0 0 20px;">
              <p style="margin: 0; color: #222; font-size: 15px;">${message}</p>
            </div>
            <a href="${replyUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
              Reply Now
            </a>
            <p style="margin-top: 16px;">
              <a href="${chatUrl}" style="color: #666; font-size: 13px; text-decoration: underline;">Open full chat inbox</a>
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.text();
      console.error("Resend error:", err);
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
