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
// Mode interval configs: [questionMinMin, questionMaxMin, thankYouMinMin, thankYouMaxMin]
// hyper_aggressive uses seconds internally (0.5-2 min questions, 2-5 min thanks)
const MODE_INTERVALS: Record<string, [number, number, number, number]> = {
  hyper_aggressive: [0.5, 2, 2, 5],
  aggressive:       [2, 8, 1, 7],
  normal:           [10, 25, 1, 13],
  relaxed:          [25, 45, 5, 20],
  hyper_relaxed:    [40, 60, 10, 30],
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
    `hi there, I live in ${country}. do you ship here?`,
    `wondering if ${country} is covered for delivery`,
    `what courier do you use for ${country}?`,
    `is there free shipping to ${country}?`,
    `how much is shipping to ${country}?`,
    `what are the shipping costs to ${country}?`,
    `do you offer express shipping to ${country}?`,
    `I want to place an order to ${country}, is that possible?`,
    `hey, just checking if you can send to ${country}`,
    `any idea how long it takes to arrive in ${country}?`,
    `does it come with tracking to ${country}?`,
    `is tracked shipping available to ${country}?`,
    `can I get next day delivery to ${country}?`,
    `what's the cheapest shipping option to ${country}?`,
    `do orders to ${country} go through customs?`,
    `will I have to pay customs fees if I'm in ${country}?`,
    `is there import tax for ${country}?`,
    `I need it delivered to ${country} asap, is that possible?`,
    `how reliable is shipping to ${country}?`,
    `have you shipped to ${country} before?`,
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
  "where do you source your perfumes from?",
  "are these original or inspired versions?",
  "do you buy directly from the brands?",
  "how do you guarantee authenticity?",
  "can I see a batch code or serial number?",
  "do you have any unboxing videos from customers?",
  "I've been scammed before, how do I know this is different?",
  "is there a money back guarantee if they're fake?",
  "do you have a certificate of authenticity?",
  "are these tester bottles or retail?",
  "someone told me cheap perfumes are always fake, can you prove otherwise?",
  "how do I know the batch codes are real?",
  "can you show me where you get your stock?",
  "do you have any trustpilot reviews?",
  "any social media reviews I can check?",
  "has anyone posted about your store online?",
  "can I verify the perfume when I receive it?",
  "what happens if I receive a fake?",
  "do you offer refunds if authenticity is questionable?",
  "are these sealed and brand new?",
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
  "seriously how are these prices even possible?",
  "are these discounted because they're old stock?",
  "is this a clearance sale or are prices always this low?",
  "my friend said these prices are suspicious, what's the explanation?",
  "how do you undercut every other store?",
  "are these the same size bottles as in stores?",
  "do you buy in bulk or something? prices are crazy low",
  "I compared prices and yours are way cheaper, how?",
  "is there a reason you're so much cheaper than Douglas?",
  "why is this half the price of what I see in shops?",
  "are these grey market products?",
  "do you have some kind of wholesale deal?",
  "is there something wrong with the packaging at these prices?",
  "the prices make me nervous, are these legit?",
  "how do you keep prices this low and still make profit?",
  "are these near expiry date or something?",
  "is the quality the same as retail at these prices?",
  "do you sell seconds or B-grade products?",
  "these are cheaper than duty free, how?",
  "no way these are real at this price, explain please",
];

const recommendationQuestions: string[] = [
  "can you recommend a good perfume for a date night?",
  "what's a good fragrance for a formal event?",
  "any suggestions for a summer scent?",
  "what perfume would you recommend for winter?",
  "I need something for everyday use, any recommendations?",
  "what's your best seller for men?",
  "what's the most popular women's fragrance you have?",
  "can you suggest something fresh and light?",
  "I'm looking for something sweet and long-lasting, any ideas?",
  "what would you recommend as a gift for my girlfriend?",
  "any good masculine scents for the office?",
  "what's a good unisex fragrance?",
  "I want something that lasts all day, what do you suggest?",
  "can you recommend something for a wedding?",
  "what's a good spring fragrance?",
  "do you have anything similar to Dior Sauvage?",
  "what would you recommend for a teenager?",
  "I like woody scents, what do you have?",
  "any recommendations for a night out?",
  "what's a good perfume that gets compliments?",
  "can you suggest something romantic?",
  "I need a fragrance for hot weather, any tips?",
  "what's your personal favourite from the store?",
  "any recommendations for someone who likes fresh and clean scents?",
  "what perfume would impress on a first date?",
  "what's good for a guy in his 20s?",
  "can you recommend something for my mum's birthday?",
  "I want something that smells expensive but isn't too pricey",
  "what's the best fragrance for clubbing?",
  "any good oud-based perfumes?",
  "I like citrus scents, what would you suggest?",
  "what's the longest lasting perfume you sell?",
  "can you recommend a perfume that's not too strong?",
  "I'm looking for something unique, not the usual mainstream stuff",
  "what fragrance do most people come back to buy again?",
  "any recommendations for autumn?",
  "what's a good perfume for a job interview?",
  "I need a gift for my boyfriend, what's popular?",
  "what's the most complimented men's fragrance?",
  "can you suggest something floral but not too feminine?",
  "what would you recommend for someone who's never worn perfume?",
  "I like Bleu de Chanel, anything similar?",
  "what's a good travel-friendly size you'd recommend?",
  "any perfumes that smell like vanilla?",
  "what's a sophisticated scent for a woman in her 30s?",
  "do you have anything that smells like Tom Ford?",
  "I want something seductive, any suggestions?",
  "what's the best bang for your buck perfume here?",
  "can you recommend something that works in both summer and winter?",
  "what perfume do you personally wear?",
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
  "legend, thank you!",
  "that's really helpful, thanks",
  "you're a star, thanks!",
  "brilliant, thanks!",
  "sweet, thanks for that",
  "thanks so much for the quick reply",
  "really appreciate the help 🙏",
  "thanks for your time",
  "that's exactly what I needed, thanks!",
  "thanks, you've been really helpful",
  "lovely, thank you!",
  "much appreciated!",
  "thank you, that clears things up",
  "thanks for the fast response!",
  "helpful as always, thanks",
  "thank youu",
  "thanks! will order now",
  "perfect thanks, gonna place my order",
  "great service, thanks!",
  "thanks, I'll go ahead and buy it",
  "wow thanks for the detailed reply",
  "ok perfect, thanks a lot!",
  "thanks! excited to receive it",
  "amazing, thank you so much!",
  "thanks bro",
  "thanks! really appreciate it 😊",
  "ah ok makes sense, thanks!",
  "thanks for explaining that!",
  "ok awesome, thank you!",
  "you guys are great, thanks",
  "thanks, I'll recommend you to my friends",
  "thank you! can't wait for it to arrive",
  "sound, cheers!",
  "ta, thanks!",
  "top, thanks!",
  "dankjewel!",
  "merci!",
  "gracias, thanks!",
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
  return min + Math.random() * (max - min);
}

// Detect original question category from message text
function detectCategory(msg: string): string {
  const lower = msg.toLowerCase();
  // shipping keywords
  if (/ship|deliver|courier|shipping|customs|tracking|import tax|arrive/.test(lower)) return "shipping";
  // proof keywords
  if (/proof|authentic|legit|genuine|fake|counterfeit|batch code|real|scam|certificate/.test(lower)) return "proof";
  // cheap keywords
  if (/cheap|price|low|afford|discount|clearance|expensive|cost|grey market|wholesale|duty free/.test(lower)) return "cheap";
  return "recommendation";
}

// Pick a different category, biased toward recommendation (50% chance recommendation, rest split)
function pickDifferentCategory(original: string): string {
  const allCats = ["shipping", "proof", "cheap", "recommendation"];
  const others = allCats.filter(c => c !== original);
  // 50% chance to pick recommendation if it's available in others
  if (others.includes("recommendation") && Math.random() < 0.5) return "recommendation";
  return pick(others);
}

function generateQuestion(category: string): string {
  if (category === "shipping") {
    const country = pick(COUNTRIES);
    return pick(shippingQuestions(country));
  } else if (category === "proof") {
    return pick(proofQuestions);
  } else if (category === "recommendation") {
    return pick(recommendationQuestions);
  } else {
    return pick(cheapQuestions);
  }
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
          const validModes = ["off", "hyper_aggressive", "aggressive", "normal", "relaxed", "hyper_relaxed"];
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

      const category = pick(["shipping", "proof", "cheap", "recommendation"]);
      const message = generateQuestion(category);

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
          // 25% chance: send a follow-up question instead of thank you
          const isFollowUp = Math.random() < 0.25;

          let outMsg: string;
          let keepAuto = false;

          if (isFollowUp) {
            // Determine the original category from the first customer message
            const { data: firstMsgs } = await supabase
              .from("fake_chat_messages")
              .select("message")
              .eq("conversation_id", conv.id)
              .eq("sender_type", "customer")
              .order("created_at", { ascending: true })
              .limit(1);

            const originalCategory = firstMsgs && firstMsgs.length > 0
              ? detectCategory(firstMsgs[0].message)
              : "shipping";

            const newCategory = pickDifferentCategory(originalCategory);
            outMsg = generateQuestion(newCategory);
            keepAuto = true; // stay is_auto so another thank-you gets scheduled after admin replies
          } else {
            outMsg = pick(thankYouMessages);
          }

          await supabase.from("fake_chat_messages").insert({
            conversation_id: conv.id,
            sender_type: "customer",
            message: outMsg,
            read: false,
          });

          await supabase
            .from("fake_chat_conversations")
            .update({
              auto_reply_due_at: null,
              is_auto: keepAuto,
              updated_at: now.toISOString(),
            })
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
                        <p style="margin: 0; color: #222; font-size: 15px; white-space: pre-wrap;">${outMsg}</p>
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
