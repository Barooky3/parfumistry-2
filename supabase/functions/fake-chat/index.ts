import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PRIMARY_ADMIN = "ewhz3384@gmail.com";
const MALIK_ADMIN = "malikisthebiggestw@gmail.com";
const ALLOWED = [PRIMARY_ADMIN, MALIK_ADMIN];

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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const email = user.email || "";
    if (!ALLOWED.includes(email)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: corsHeaders });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, conversation_id, message, fake_name } = await req.json();

    // PRIMARY ADMIN: list conversations for the fake chat sender panel
    if (action === "list_conversations") {
      const { data: convos } = await supabase
        .from("fake_chat_conversations")
        .select("*")
        .eq("hidden", false)
        .order("updated_at", { ascending: false });

      if (!convos || convos.length === 0) {
        return new Response(JSON.stringify({ conversations: [] }), { headers: corsHeaders });
      }

      const convIds = convos.map((c: any) => c.id);
      const { data: unreadRows } = await supabase
        .from("fake_chat_messages")
        .select("conversation_id")
        .in("conversation_id", convIds)
        .eq("sender_type", "admin")
        .eq("read", false);

      const unreadMap: Record<string, number> = {};
      if (unreadRows) {
        for (const row of unreadRows) {
          unreadMap[row.conversation_id] = (unreadMap[row.conversation_id] || 0) + 1;
        }
      }

      const results = convos.map((conv: any) => ({
        ...conv,
        unread_count: unreadMap[conv.id] || 0,
      }));

      return new Response(JSON.stringify({ conversations: results }), { headers: corsHeaders });
    }

    if (action === "get_messages") {
      const { data: msgs } = await supabase
        .from("fake_chat_messages")
        .select("*")
        .eq("conversation_id", conversation_id)
        .order("created_at", { ascending: true });

      return new Response(JSON.stringify({ messages: msgs || [] }), { headers: corsHeaders });
    }

    // PRIMARY ADMIN: create a new fake conversation with random name
    if (action === "create_conversation" && email === PRIMARY_ADMIN) {
      let name = fake_name;
      if (!name) {
        // Get all unique customer names from orders
        const { data: orders } = await supabase
          .from("orders")
          .select("customer_name")
          .limit(1000);
        const allNames = orders && orders.length > 0
          ? [...new Set(orders.map((o: any) => o.customer_name).filter(Boolean))]
          : ["Alex", "Jordan", "Sam", "Chris", "Taylor", "Morgan", "Jamie", "Casey"];

        // Get names already used in fake conversations
        const { data: existingConvos } = await supabase
          .from("fake_chat_conversations")
          .select("fake_name")
          .order("created_at", { ascending: true });
        const usedNames = (existingConvos || []).map((c: any) => c.fake_name);

        // Find first unused name
        const unused = allNames.filter((n: string) => !usedNames.includes(n));
        if (unused.length > 0) {
          name = unused[0];
        } else {
          // All exhausted — cycle: pick the name that was used earliest
          const usedInOrder = allNames.filter((n: string) => usedNames.includes(n));
          // Sort by first appearance in usedNames (earliest created first)
          name = usedInOrder[0] || allNames[0];
        }
      }

      const { data: conv, error } = await supabase
        .from("fake_chat_conversations")
        .insert({ fake_name: name })
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: "Failed to create conversation" }), { status: 500, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ conversation: conv }), { headers: corsHeaders });
    }

    // PRIMARY ADMIN: send a fake "customer" message
    if (action === "send_customer_message" && email === PRIMARY_ADMIN) {
      await supabase.from("fake_chat_messages").insert({
        conversation_id,
        sender_type: "customer",
        message,
        read: false,
      });

      await supabase
        .from("fake_chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation_id);

      // Email notification to malik about new "customer" message
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        // Get conversation name
        const { data: conv } = await supabase
          .from("fake_chat_conversations")
          .select("fake_name")
          .eq("id", conversation_id)
          .single();

        const customerName = conv?.fake_name || "Customer";
        const preview = message.length > 150 ? message.substring(0, 150) + "..." : message;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: "ProfParfums <orders@profparfum.com>",
              to: [MALIK_ADMIN],
              subject: `💬 New message from ${customerName}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                  <h2 style="color: #333;">New customer message from ${customerName}</h2>
                  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 0 0 12px;">
                    <p style="margin: 0; color: #222; font-size: 15px; white-space: pre-wrap;">${preview}</p>
                  </div>
                  <a href="https://profparfums.lovable.app/admin/orders" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View & Reply
                  </a>
                </div>
              `,
            }),
          });
        } catch (e) {
          console.error("Failed to email malik:", e);
        }
      }

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    // MALIK: send a reply (appears as admin message)
    if (action === "send_reply" && email === MALIK_ADMIN) {
      const { data: inserted } = await supabase.from("fake_chat_messages").insert({
        conversation_id,
        sender_type: "admin",
        message,
        read: false,
      }).select("id").single();

      await supabase
        .from("fake_chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation_id);

      // Email notification to primary admin about malik's reply
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (RESEND_API_KEY) {
        const { data: conv } = await supabase
          .from("fake_chat_conversations")
          .select("fake_name")
          .eq("id", conversation_id)
          .single();

        const preview = message.length > 150 ? message.substring(0, 150) + "..." : message;

        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
            body: JSON.stringify({
              from: "ProfParfums <orders@profparfum.com>",
              to: [PRIMARY_ADMIN],
              subject: `💬 Malik replied to ${conv?.fake_name || "customer"}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                  <h2 style="color: #333;">Malik replied to ${conv?.fake_name || "customer"}</h2>
                  <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 0 0 12px;">
                    <p style="margin: 0; color: #222; font-size: 15px; white-space: pre-wrap;">${preview}</p>
                  </div>
                  <a href="https://profparfums.lovable.app/admin/orders" style="display: inline-block; background: #000; color: #fff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    View Conversation
                  </a>
                </div>
              `,
            }),
          });
        } catch (e) {
          console.error("Failed to email primary admin:", e);
        }
      }

      return new Response(JSON.stringify({ success: true, message_id: inserted?.id }), { headers: corsHeaders });
    }

    // PRIMARY ADMIN can also reply (appears as customer message to malik)
    if (action === "send_reply" && email === PRIMARY_ADMIN) {
      await supabase.from("fake_chat_messages").insert({
        conversation_id,
        sender_type: "customer",
        message,
        read: false,
      });

      await supabase
        .from("fake_chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversation_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === "mark_read") {
      // Malik marks customer messages as read; primary marks admin messages as read
      const senderType = email === MALIK_ADMIN ? "customer" : "admin";
      await supabase
        .from("fake_chat_messages")
        .update({ read: true })
        .eq("conversation_id", conversation_id)
        .eq("sender_type", senderType)
        .eq("read", false);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    if (action === "delete" && email === PRIMARY_ADMIN) {
      await supabase
        .from("fake_chat_conversations")
        .update({ hidden: true })
        .eq("id", conversation_id);

      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
  } catch (err) {
    console.error("Fake chat error:", err);
    return new Response(JSON.stringify({ error: "Unable to process request" }), { status: 500, headers: corsHeaders });
  }
});
