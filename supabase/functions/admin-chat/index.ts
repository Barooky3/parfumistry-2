import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["ewhz3384@gmail.com"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const payload = JSON.parse(atob(token.split(".")[1]));
    const adminEmail = payload.email;
    if (!ADMIN_EMAILS.includes(adminEmail)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, conversation_id, message, user_email } = await req.json();

    if (action === "list_conversations") {
      const { data: convos } = await supabase
        .from("chat_conversations")
        .select("*")
        .eq("blocked", false)
        .order("updated_at", { ascending: false });

      if (!convos || convos.length === 0) {
        return new Response(JSON.stringify({ conversations: [] }), { headers: corsHeaders });
      }

      // Parallel: fetch all unread counts and order counts at once
      const convIds = convos.map(c => c.id);
      const emails = [...new Set(convos.map(c => c.user_email))];

      const [unreadRes, orderRes] = await Promise.all([
        supabase
          .from("chat_messages")
          .select("conversation_id", { count: "exact" })
          .in("conversation_id", convIds)
          .eq("sender_type", "customer")
          .eq("read", false),
        supabase
          .from("orders")
          .select("customer_email")
          .in("customer_email", emails),
      ]);

      // Build unread count map
      const unreadMap: Record<string, number> = {};
      if (unreadRes.data) {
        for (const row of unreadRes.data) {
          unreadMap[row.conversation_id] = (unreadMap[row.conversation_id] || 0) + 1;
        }
      }

      // Build order count map
      const orderMap: Record<string, number> = {};
      if (orderRes.data) {
        for (const row of orderRes.data) {
          orderMap[row.customer_email] = (orderMap[row.customer_email] || 0) + 1;
        }
      }

      const results = convos.map(conv => ({
        ...conv,
        unread_count: unreadMap[conv.id] || 0,
        order_count: orderMap[conv.user_email] || 0,
      }));

      return new Response(JSON.stringify({ conversations: results }), { headers: corsHeaders });
    }

    if (action === "get_messages") {
      const [msgsRes, convoRes] = await Promise.all([
        supabase
          .from("chat_messages")
          .select("*")
          .eq("conversation_id", conversation_id)
          .order("created_at", { ascending: true }),
        supabase
          .from("chat_conversations")
          .select("customer_last_seen_at")
          .eq("id", conversation_id)
          .single(),
      ]);

      return new Response(JSON.stringify({
        messages: msgsRes.data || [],
        customer_last_seen_at: convoRes.data?.customer_last_seen_at || null,
      }), { headers: corsHeaders });
    }

    if (action === "mark_read") {
      await supabase
        .from("chat_messages")
        .update({ read: true })
        .eq("conversation_id", conversation_id)
        .eq("sender_type", "customer")
        .eq("read", false);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === "send_reply") {
      const { data: inserted } = await supabase.from("chat_messages").insert({
        conversation_id,
        sender_type: "admin",
        message,
        read: true,
      }).select("id").single();

      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation_id);

      // Send email notification to customer
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY && user_email) {
        const SITE_URL = "https://profparfums.lovable.app";
        // Strip [img:...] tags for email preview
        const cleanMessage = message.replace(/\[img:[^\]]+\]/g, '').trim();
        const previewText = cleanMessage.length > 200 ? cleanMessage.substring(0, 200) + '...' : cleanMessage;
        const hasImages = /\[img:/.test(message);

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "ProfParfums <orders@profparfum.com>",
              to: [user_email],
              subject: "💬 New reply from Parfumistry Support",
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                  <h2 style="color: #333; margin-bottom: 16px;">You have a new message from our support team</h2>
                  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 0 0 12px;">
                    <p style="margin: 0; color: #222; font-size: 15px; white-space: pre-wrap;">${previewText}</p>
                    ${hasImages ? '<p style="margin: 8px 0 0; color: #888; font-size: 13px;">📷 This message also includes photos — view them on our website.</p>' : ''}
                  </div>
                  <a href="${SITE_URL}" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                    View &amp; Reply
                  </a>
                  <p style="margin-top: 20px; color: #999; font-size: 12px;">If you didn't expect this message, you can ignore this email.</p>
                </div>
              `,
            }),
          });
        } catch (emailErr) {
          console.error("Failed to email customer:", emailErr);
        }
      }

      return new Response(JSON.stringify({ success: true, message_id: inserted?.id }), { headers: corsHeaders });
    }

    if (action === "block") {
      // Delete all messages but keep conversation marked as blocked
      await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", conversation_id);

      await supabase
        .from("chat_conversations")
        .update({ blocked: true })
        .eq("id", conversation_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === "unblock") {
      await supabase
        .from("chat_conversations")
        .update({ blocked: false })
        .eq("id", conversation_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === "delete") {
      await supabase
        .from("chat_messages")
        .delete()
        .eq("conversation_id", conversation_id);

      await supabase
        .from("chat_conversations")
        .delete()
        .eq("id", conversation_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === "get_seen_status") {
      const { data } = await supabase
        .from("chat_conversations")
        .select("customer_last_seen_at")
        .eq("id", conversation_id)
        .single();

      return new Response(JSON.stringify({ customer_last_seen_at: data?.customer_last_seen_at || null }), { headers: corsHeaders });
    }

    if (action === "get_orders") {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, created_at, order_items")
        .eq("customer_email", user_email)
        .order("created_at", { ascending: false })
        .limit(20);

      return new Response(JSON.stringify({ orders: orders || [] }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
