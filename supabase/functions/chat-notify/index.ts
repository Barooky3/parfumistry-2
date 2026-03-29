import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id } = await req.json();

    // Check if conversation is blocked — silently skip
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

    // Send email notification to admin
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (RESEND_API_KEY) {
      const { data: convoData } = await supabase
        .from("chat_conversations")
        .select("user_email, user_name")
        .eq("id", conversation_id)
        .single();

      const customerName = convoData?.user_name || convoData?.user_email || "A customer";
      const SITE_URL = "https://profparfums.lovable.app";

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "ProfParfums <orders@profparfum.com>",
            to: ["ewhz3384@gmail.com"],
            subject: `💬 New chat message from ${customerName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                <h2 style="color: #333;">New Chat Message</h2>
                <p style="color: #555;">${customerName} sent a new message in the support chat.</p>
                <a href="${SITE_URL}/admin-chat" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  Open Admin Chat
                </a>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send admin notification:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
  } catch (err) {
    console.error("Chat notify error:", err);
    return new Response(JSON.stringify({ error: "Unable to process request" }), { status: 500, headers: corsHeaders });
  }
});
