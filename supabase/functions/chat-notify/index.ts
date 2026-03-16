const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "ewhz3384@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation_id, message, user_email } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "No email key" }), { status: 500, headers: corsHeaders });
    }

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
            <h2 style="color: #333;">New Live Chat Message</h2>
            <p><strong>From:</strong> ${user_email}</p>
            <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0;">${message}</p>
            </div>
            <p style="color: #888; font-size: 13px;">Reply from your admin chat inbox.</p>
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
