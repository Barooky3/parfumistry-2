import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const COUNTRIES = [
  'Netherlands','Belgium','Germany','France','United Kingdom','Spain','Italy','Austria',
  'Switzerland','Portugal','Poland','Sweden','Denmark','Norway','Finland','Ireland',
  'Luxembourg','Czech Republic','Greece','Hungary','Romania','Bulgaria','Croatia',
  'Slovakia','Slovenia','Serbia','Estonia','Latvia','Lithuania','Iceland','Turkey',
  'Russia','Ukraine','Bosnia and Herzegovina','Montenegro','North Macedonia','Albania',
  'Moldova','Cyprus','Malta','Monaco','Liechtenstein','Andorra','Kosovo','Belarus',
  'Georgia','Armenia','Azerbaijan','San Marino','United States','Canada','Mexico',
  'Brazil','Argentina','Chile','Colombia','Peru','Ecuador','Uruguay','Paraguay',
  'Bolivia','Venezuela','Dominican Republic','Jamaica','Trinidad and Tobago','Barbados',
  'Curaçao','Suriname','United Arab Emirates','Saudi Arabia','Qatar','Kuwait','Bahrain',
  'Oman','Israel','Jordan','Lebanon','Japan','South Korea','China','India','Thailand',
  'Vietnam','Indonesia','Malaysia','Singapore','Philippines','Hong Kong','Taiwan',
  'Pakistan','Bangladesh','Sri Lanka','Nepal','Cambodia','Myanmar','Macao','Australia',
  'New Zealand','South Africa','Egypt','Morocco','Nigeria','Kenya','Ghana','Tunisia',
  'Algeria','Senegal','Ivory Coast','Cameroon','Tanzania','Ethiopia','Mauritius',
];

// Mode interval configs: [questionMin, questionMax, thankYouMin, thankYouMax]
const MODE_INTERVALS: Record<string, [number, number, number, number]> = {
  normal:     [10, 25, 1, 20],
  relaxed:    [25, 45, 5, 20],
  aggressive: [2, 10, 3, 10],
};

function shippingQuestions(country: string): string[] {
  return [
    `Do you ship to ${country}?`,
    `do you guys ship to ${country}?`,
    `hey do you deliver to ${country}?`,
    `Can I order from ${country}?`,
    `Is shipping to ${country} available?`,
    `Do you do delivery to ${country}?`,
    `can you ship to ${country}?`,
    `hi, wondering if you ship to ${country}`,
    `does your store ship to ${country}?`,
    `How long does shipping to ${country} take?`,
    `how long does delivery to ${country} take?`,
    `what's the shipping time to ${country}?`,
    `How many days to ship to ${country}?`,
    `shipping time to ${country}?`,
    `how fast can you get it to ${country}?`,
    `whats the delivery time for ${country}?`,
    `do you deliver internationally? I'm in ${country}`,
    `I'm from ${country}, can I order?`,
    `is ${country} included in your shipping?`,
    `yo can I get something shipped to ${country}`,
  ];
}

const proofQuestions: string[] = [
  "can you show me proof that these are real?",
  "how do I know it's legit?",
  "proof please",
  "do you have any proof these are authentic?",
  "how can I trust this is genuine?",
  "any proof of authenticity?",
  "can you prove these are real perfumes?",
  "is there any way to verify these are legit?",
  "how do I know I'm not getting fakes?",
  "do you have pictures from other customers?",
  "can I see reviews or proof from buyers?",
  "I need some proof before ordering",
  "show me some proof",
  "are these 100% authentic? any proof?",
  "how can I be sure these aren't counterfeit?",
  "can you verify authenticity somehow?",
  "got any proof these are the real deal?",
  "any way to prove they're genuine?",
  "do you have customer photos as proof?",
  "I want to make sure these are real, any proof?",
];

const cheapQuestions: string[] = [
  "why are these so cheap?",
  "how come the prices are so low?",
  "why is everything so cheap on here?",
  "these prices seem too good to be true, why so cheap?",
  "how can you sell these for so little?",
  "why are your prices way lower than retail?",
  "what's the catch with the low prices?",
  "how are you selling these so cheap?",
  "is there a reason the prices are this low?",
  "why is it cheaper than other stores?",
  "the prices are really low, is something wrong with them?",
  "how do you manage to sell at these prices?",
  "why so affordable compared to shops?",
  "these are suspiciously cheap, what's the deal?",
  "are these cheaper because they're different somehow?",
  "how can the prices be this low and still legit?",
  "I'm curious why it's so much cheaper here",
  "what makes your prices so low?",
  "why the huge discount compared to retail?",
  "why is everything priced so low?",
];

const thankYouMessages: string[] = [
  "thanks!",
  "thank you",
  "appreciate it",
  "thanks a lot",
  "cheers, thanks",
  "thank you so much",
  "thanks for letting me know",
  "thanks for the info",
  "great, thanks!",
  "awesome, thank you",
  "nice one, thanks",
  "ok thanks",
  "alright thanks",
  "perfect, thank you",
  "cool thanks",
  "thanks mate",
  "thank you for explaining",
  "that makes sense, thanks",
  "got it, thanks!",
  "appreciated 👍",
  "ok cool, thank you!",
  "thanks for getting back to me",
  "ty",
  "thx",
  "cheers",
  "ok thank you!",
];

const BLOCKED_NAMES = ["valued customer", "mubarak elkhabir"];

function isValidName(n: string): boolean {
  if (!n || n.trim().length === 0) return false;
  const lower = n.trim().toLowerCase();
  if (BLOCKED_NAMES.includes(lower)) return false;
  if (!/[a-zA-Z]/.test(n)) return false;
  return true;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomMinutes(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const MALIK_ADMIN = "malikisthebiggestw@gmail.com";

    // Handle status check (GET with ?action=status)
    const url = new URL(req.url);
    if (url.searchParams.get("action") === "status") {
      const { data: stateRow } = await supabase
        .from("fake_chat_auto_state")
        .select("enabled, mode")
        .limit(1)
        .single();
      return new Response(
        JSON.stringify({ enabled: stateRow?.enabled ?? true, mode: stateRow?.mode ?? "normal" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle set-mode (POST with action=set_mode)
    if (req.method === "POST") {
      try {
        const body = await req.json();

        if (body.action === "set_mode" && typeof body.mode === "string") {
          const validModes = ["off", "normal", "relaxed", "aggressive"];
          if (!validModes.includes(body.mode)) {
            return new Response(JSON.stringify({ error: "Invalid mode" }), { status: 400, headers: corsHeaders });
          }

          const enabled = body.mode !== "off";
          await supabase
            .from("fake_chat_auto_state")
            .update({ enabled, mode: body.mode === "off" ? "normal" : body.mode })
            .neq("id", "00000000-0000-0000-0000-000000000000");

          return new Response(
            JSON.stringify({ success: true, enabled, mode: body.mode }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Legacy toggle support
        if (body.action === "toggle" && typeof body.enabled === "boolean") {
          await supabase
            .from("fake_chat_auto_state")
            .update({ enabled: body.enabled })
            .neq("id", "00000000-0000-0000-0000-000000000000");
          return new Response(
            JSON.stringify({ success: true, enabled: body.enabled }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch { /* not a mode/toggle request, continue with normal flow */ }
    }

    const now = new Date();
    let didSomething = false;

    // ─── 1. Check if it's time to send a new auto question ───
    const { data: stateRow } = await supabase
      .from("fake_chat_auto_state")
      .select("*")
      .limit(1)
      .single();

    if (stateRow && stateRow.enabled === false) {
      return new Response(
        JSON.stringify({ success: true, did_something: false, reason: "disabled" }),
        { headers: corsHeaders }
      );
    }

    const mode = stateRow?.mode || "normal";
    const intervals = MODE_INTERVALS[mode] || MODE_INTERVALS.normal;
    const [qMin, qMax, tMin, tMax] = intervals;

    if (stateRow && new Date(stateRow.next_question_at) <= now) {
      // Get a random unused name from orders
      const { data: orders } = await supabase
        .from("orders")
        .select("customer_name")
        .limit(1000);

      const allNames = orders && orders.length > 0
        ? [...new Set(orders.map((o: any) => o.customer_name).filter(isValidName))]
        : ["Alex", "Jordan", "Sam", "Chris", "Taylor", "Morgan", "Jamie", "Casey"];

      const { data: existingConvos } = await supabase
        .from("fake_chat_conversations")
        .select("fake_name");
      const usedNames = new Set((existingConvos || []).map((c: any) => c.fake_name));

      const unused = allNames.filter((n: string) => !usedNames.has(n));
      const name = unused.length > 0 ? pick(unused) : pick(allNames);

      const category = pick(["shipping", "proof", "cheap"]);
      let message: string;

      if (category === "shipping") {
        const country = pick(COUNTRIES);
        message = pick(shippingQuestions(country));
      } else if (category === "proof") {
        message = pick(proofQuestions);
      } else {
        message = pick(cheapQuestions);
      }

      const { data: conv } = await supabase
        .from("fake_chat_conversations")
        .insert({ fake_name: name, is_auto: true })
        .select()
        .single();

      if (conv) {
        await supabase.from("fake_chat_messages").insert({
          conversation_id: conv.id,
          sender_type: "customer",
          message,
          read: false,
        });

        await supabase
          .from("fake_chat_conversations")
          .update({ updated_at: now.toISOString() })
          .eq("id", conv.id);

        if (RESEND_API_KEY) {
          const preview = message.length > 150 ? message.substring(0, 150) + "..." : message;
          try {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
              body: JSON.stringify({
                from: "ProfParfums <orders@profparfum.com>",
                to: [MALIK_ADMIN],
                subject: `💬 New message from ${name}`,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #333;">New customer message from ${name}</h2>
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

        didSomething = true;
      }

      // Schedule next question using mode intervals
      const nextMinutes = randomMinutes(qMin, qMax);
      const nextAt = new Date(now.getTime() + nextMinutes * 60 * 1000);
      await supabase
        .from("fake_chat_auto_state")
        .update({ next_question_at: nextAt.toISOString() })
        .eq("id", stateRow.id);
    }

    // ─── 2. Check for auto conversations needing a thank-you reply ───
    const { data: pendingReplies } = await supabase
      .from("fake_chat_conversations")
      .select("id, fake_name, auto_reply_due_at")
      .eq("is_auto", true)
      .not("auto_reply_due_at", "is", null);

    if (pendingReplies) {
      for (const conv of pendingReplies) {
        if (new Date(conv.auto_reply_due_at!) <= now) {
          const thankMsg = pick(thankYouMessages);
          await supabase.from("fake_chat_messages").insert({
            conversation_id: conv.id,
            sender_type: "customer",
            message: thankMsg,
            read: false,
          });

          await supabase
            .from("fake_chat_conversations")
            .update({ auto_reply_due_at: null, is_auto: false, updated_at: now.toISOString() })
            .eq("id", conv.id);

          if (RESEND_API_KEY) {
            try {
              await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
                body: JSON.stringify({
                  from: "ProfParfums <orders@profparfum.com>",
                  to: [MALIK_ADMIN],
                  subject: `💬 New message from ${conv.fake_name}`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                      <h2 style="color: #333;">New customer message from ${conv.fake_name}</h2>
                      <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 0 0 12px;">
                        <p style="margin: 0; color: #222; font-size: 15px; white-space: pre-wrap;">${thankMsg}</p>
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

          didSomething = true;
        }
      }
    }

    // ─── 3. Schedule thank-you for auto convos where admin replied ───
    const { data: autoConvos } = await supabase
      .from("fake_chat_conversations")
      .select("id")
      .eq("is_auto", true)
      .is("auto_reply_due_at", null);

    if (autoConvos) {
      for (const conv of autoConvos) {
        const { data: lastMsgs } = await supabase
          .from("fake_chat_messages")
          .select("sender_type, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (lastMsgs && lastMsgs.length > 0 && lastMsgs[0].sender_type === "admin") {
          const replyTime = new Date(lastMsgs[0].created_at);
          const delayMinutes = randomMinutes(tMin, tMax);
          const thankAt = new Date(replyTime.getTime() + delayMinutes * 60 * 1000);

          await supabase
            .from("fake_chat_conversations")
            .update({ auto_reply_due_at: thankAt.toISOString() })
            .eq("id", conv.id);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, did_something: didSomething }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("Fake chat auto error:", err);
    return new Response(
      JSON.stringify({ error: "Unable to process" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
