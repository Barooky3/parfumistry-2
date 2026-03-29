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

    // Email notifications disabled — admin checks chat manually
    return new Response(JSON.stringify({ success: true, skipped: true, reason: "notifications_disabled" }), { headers: corsHeaders });
  } catch (err) {
    console.error("Chat notify error:", err);
    return new Response(JSON.stringify({ error: "Unable to process request" }), { status: 500, headers: corsHeaders });
  }
});
