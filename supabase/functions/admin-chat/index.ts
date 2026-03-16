import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAILS = ["ewhz3384@gmail.com", "malikisthebiggestw@gmail.com"];

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
        .order("updated_at", { ascending: false });

      const results = [];
      for (const conv of convos || []) {
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .eq("sender_type", "customer")
          .eq("read", false);
        results.push({ ...conv, unread_count: count || 0 });
      }

      return new Response(JSON.stringify({ conversations: results }), { headers: corsHeaders });
    }

    if (action === "get_messages") {
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: true });

      return new Response(JSON.stringify({ messages: msgs || [] }), { headers: corsHeaders });
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

      return new Response(JSON.stringify({ success: true, message_id: inserted?.id }), { headers: corsHeaders });
    }

    if (action === "block") {
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
