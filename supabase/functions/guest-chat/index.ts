import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, guest_id, email, message, conversation_id } = await req.json();

    if (!guest_id || !email) {
      return new Response(
        JSON.stringify({ error: "guest_id and email are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Action: load — get or create conversation + load messages
    if (action === "load") {
      const { data: convos } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("user_id", guest_id)
        .order("created_at", { ascending: false });

      if (convos && convos.length > 0) {
        const anyBlocked = convos.some((c: any) => c.blocked);
        if (anyBlocked) {
          return new Response(
            JSON.stringify({ blocked: true, conversation_id: null, messages: [] }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const convo = convos[0];
        const { data: msgs } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: true });

        // Update last seen
        await supabase
          .from("chat_conversations")
          .update({ customer_last_seen_at: new Date().toISOString() })
          .eq("id", convo.id);

        return new Response(
          JSON.stringify({ blocked: false, conversation_id: convo.id, messages: msgs || [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ blocked: false, conversation_id: null, messages: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: send — send a message
    if (action === "send") {
      if (!message || typeof message !== "string" || message.trim().length === 0 || message.length > 1000) {
        return new Response(
          JSON.stringify({ error: "Invalid message" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for blocking
      const { data: convos } = await supabase
        .from("chat_conversations")
        .select("id, blocked")
        .eq("user_id", guest_id)
        .order("created_at", { ascending: false });

      if (convos && convos.some((c: any) => c.blocked)) {
        // Silently succeed
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let convId = conversation_id;

      if (!convId) {
        const { data: newConvo, error: convError } = await supabase
          .from("chat_conversations")
          .insert({
            user_id: guest_id,
            user_email: email,
            user_name: email,
          })
          .select()
          .single();

        if (convError || !newConvo) {
          console.error("Failed to create conversation:", convError);
          return new Response(
            JSON.stringify({ error: "Failed to create conversation" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        convId = newConvo.id;
      }

      const { error: msgError } = await supabase.from("chat_messages").insert({
        conversation_id: convId,
        sender_type: "customer",
        message: message.trim(),
      });

      if (msgError) {
        console.error("Failed to send message:", msgError);
        return new Response(
          JSON.stringify({ error: "Failed to send message" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("chat_conversations")
        .update({ customer_last_seen_at: new Date().toISOString() })
        .eq("id", convId);

      // Notify admin
      const cutoffIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: oldApprovedOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("status", "approved")
        .lt("created_at", cutoffIso)
        .ilike("customer_email", email)
        .limit(1)
        .maybeSingle();

      if (!oldApprovedOrder) {
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (RESEND_API_KEY) {
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: "Parfumistry <orders@parfumistry.net>",
                to: ["ewhz3384@gmail.com"],
                subject: `💬 New chat message from ${email}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #333;">New Chat Message</h2>
                    <p style="color: #555;">${email} sent a new message in the support chat.</p>
                    <a href="https://profparfums.lovable.app/admin-chat" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                      Open Admin Chat
                    </a>
                  </div>
                `,
              }),
            });
          } catch (e) {
            console.error("Failed to notify admin:", e);
          }
        }
      }

      return new Response(
        JSON.stringify({ success: true, conversation_id: convId }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Action: poll — get new messages (for guests who can't use realtime)
    if (action === "poll") {
      if (!conversation_id) {
        return new Response(
          JSON.stringify({ messages: [] }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: true });

      return new Response(
        JSON.stringify({ messages: msgs || [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Guest chat error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
