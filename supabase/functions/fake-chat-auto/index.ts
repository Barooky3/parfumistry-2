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
    `hiya, quick one - do you post to ${country}?`,
    `just wanted to check before I order, do you send to ${country}?`,
    `I'm based in ${country}, would love to order if you ship there`,
    `a friend recommended you but I'm in ${country}, can I still buy?`,
    `what's the estimated delivery for ${country}?`,
    `do you use DHL or PostNL for ${country}?`,
    `is shipping to ${country} insured?`,
    `what happens if my package gets lost going to ${country}?`,
    `do you ship discreetly to ${country}?`,
    `I've ordered from other sites to ${country} and it always takes ages, how about you?`,
    `would it be faster to ship to ${country} with express?`,
    `hi! planning to buy a gift and need it in ${country} by next week, possible?`,
    `is there a minimum order for free shipping to ${country}?`,
    `can you ship multiple items to ${country} in one package?`,
    `do you declare the full value for customs to ${country}?`,
    `any issues with shipping perfume to ${country}?`,
    `is airmail available to ${country}?`,
    `does shipping to ${country} require a signature?`,
    `I'm ordering from ${country}, will it arrive before Christmas?`,
    `my last order from another store to ${country} got stuck in customs, does that happen with you?`,
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
  "my friend says if the price is too low they're always fake, is that true?",
  "can you send me a photo of the actual bottle before shipping?",
  "do the bottles come with the original packaging?",
  "are these the same ones you'd find in a department store?",
  "I read online that replica perfumes are everywhere, how do I know yours aren't?",
  "do you have a physical store I can visit to check?",
  "have you ever had a customer complain about getting a fake?",
  "can I check the batch number on checkfresh when I receive it?",
  "are these EU or US versions?",
  "do you sell any testers? are those authentic too?",
  "how long have you been selling perfumes?",
  "I just want to be safe, can you reassure me these are real?",
  "would you be willing to show proof on video call?",
  "is your business registered? can I see proof?",
  "do you have any certifications from the brands?",
  "I saw your instagram but how do I know the photos are real?",
  "can you show me the invoice from your supplier?",
  "do these have the proper barcodes on them?",
  "are the ingredients lists accurate on the boxes?",
  "my girlfriend said I should ask for proof before buying, so here I am",
  "do you test the perfumes yourself to confirm they're real?",
  "have any influencers reviewed your products?",
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
  "what's your secret to having such low prices?",
  "I checked 5 other websites and you're the cheapest by far, why?",
  "are you running a sale or is this the normal price?",
  "do you have a coupon code? prices are already low but just asking",
  "my budget is tight, are these really this cheap or will there be hidden costs?",
  "is the shipping included in this price?",
  "are there any additional fees I should know about?",
  "I was going to buy from Sephora but your prices are way lower, what gives?",
  "how come you're cheaper than Amazon too?",
  "is the bottle size the same? maybe that's why it's cheaper?",
  "are these mini bottles or full size at this price?",
  "I keep seeing cheap perfume sites turn out to be scams, are you different?",
  "do prices go even lower during Black Friday?",
  "is there a bulk discount if I buy multiple?",
  "the price difference is making me hesitant, can you explain?",
  "my colleague bought from a cheap site and got fakes, how are you different?",
  "are you an authorized retailer?",
  "do you pay less tax or something to offer these prices?",
  "I'm shocked at how cheap this is, what's the story?",
  "even with shipping your prices beat everyone, how?",
  "are these factory seconds or overruns?",
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
  "hey I'm new to fragrances, where should I start?",
  "what's a good perfume for a 50 year old man?",
  "my wife likes floral scents, what would she like from your store?",
  "I want to smell good at the gym, any light options?",
  "what's trending right now in men's fragrances?",
  "I'm going on holiday, what's a good beach scent?",
  "can you recommend something that projects well?",
  "I like Aventus by Creed, do you have anything similar but cheaper?",
  "what's a good cozy fragrance for staying home?",
  "I need something for a graduation ceremony, any ideas?",
  "what would you recommend for someone who hates sweet scents?",
  "my dad loves old school fragrances, anything classic?",
  "I want a signature scent, what's versatile enough?",
  "what's a good perfume to wear to a dinner party?",
  "any powdery fragrances you'd recommend?",
  "I love the smell of coffee, any perfume like that?",
  "what's something that smells clean like fresh laundry?",
  "can you recommend a niche fragrance that's not too out there?",
  "I want something spicy but not overwhelming",
  "what do you recommend for cold rainy days?",
  "my sister likes fruity scents, what should I get her?",
  "what's a mature scent for a woman in her 40s?",
  "I need a safe blind buy, what do you suggest?",
  "what's a good layering combo from your store?",
  "any amber-heavy fragrances you'd recommend?",
  "I want something my colleagues will notice but not be bothered by",
  "what's the best perfume for a romantic anniversary dinner?",
  "I like YSL La Nuit de l'Homme, got anything in that style?",
  "can you suggest something aquatic and fresh?",
  "what's a good everyday scent that won't bore me?",
  "I want to try something completely different from what I usually wear",
  "what fragrance would you buy as a treat for yourself?",
  "what's a sophisticated evening fragrance for a man?",
  "I'm buying for my brother who's turning 18, any suggestions?",
  "can you recommend a light fragrance for the office that won't bother anyone?",
  "what's the most unique perfume in your collection?",
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
  "you've been super helpful, thanks a lot",
  "oh nice, that's good to know. thanks!",
  "ahh ok I understand now, thank you",
  "that puts my mind at ease, thanks!",
  "ok I'm convinced, gonna order now. thanks!",
  "class, thanks for that 👍",
  "fair enough, thanks for explaining",
  "ok cool I'll go for it then, cheers",
  "thanks! just placed my order",
  "great customer service, appreciate it",
  "thanks for being so quick to respond",
  "you've answered all my questions, thank you!",
  "ace, thanks!",
  "sorted, thanks!",
  "thanks a million!",
  "safe, appreciate it",
  "bless, thank you!",
  "respect, thanks for the info",
  "wicked, thanks!",
  "mint, cheers!",
  "sick, thanks for helping out",
  "thanks, that's all I needed to know",
  "perfect, that answers my question",
  "ok great, I feel better about ordering now, thanks",
  "that's reassuring, thank you so much",
  "I'm happy with that answer, thanks!",
  "thanks! gonna tell my mates about your store",
  "good to know, thanks for the help",
  "that's what I wanted to hear, cheers",
  "ok brilliant, ordering right now",
  "thanks, really good service",
  "you lot are class, thanks",
  "thanks for the honesty, really appreciate it",
  "ok nice one, I'll order today then",
  "that makes total sense, thanks!",
  "thanks! looking forward to receiving it 😄",
  "super helpful, thanks for everything",
  "danke!",
  "bedankt!",
  "obrigado, thanks!",
  "tack!",
  "kiitos!",
  "tak!",
  "tusind tak!",
  "thanks, excellent service honestly",
  "ok that's perfect, thanks so much for your help",
  "you've sold me, placing my order now. thanks!",
  "quality, thanks!",
  "sound out, cheers!",
  "thanks, will definitely be ordering again",
  "can't fault the service, thanks",
  "thanks for taking the time to explain",
  "ok I'm sold, thank you!",
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

// Pick from array avoiding any previously used messages
function pickUnique<T>(arr: T[], used: Set<string>): T {
  const available = arr.filter(item => !used.has(String(item)));
  if (available.length > 0) return pick(available);
  return pick(arr); // fallback if all used (shouldn't happen with this many)
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

// Generate a question that hasn't been used recently
function generateQuestionUnique(category: string, used: Set<string>): string {
  if (category === "shipping") {
    const country = pick(COUNTRIES);
    const qs = shippingQuestions(country);
    return pickUnique(qs, used);
  } else if (category === "proof") {
    return pickUnique(proofQuestions, used);
  } else if (category === "recommendation") {
    return pickUnique(recommendationQuestions, used);
  } else {
    return pickUnique(cheapQuestions, used);
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
      // Fetch recent customer messages globally to avoid repeats
      const { data: recentMsgs } = await supabase
        .from("fake_chat_messages")
        .select("message")
        .eq("sender_type", "customer")
        .order("created_at", { ascending: false })
        .limit(200);
      const globalUsed = new Set((recentMsgs || []).map((m: any) => m.message));

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
      const message = generateQuestionUnique(category, globalUsed);

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
          // Fetch all messages in this conversation to avoid repeats
          const { data: convMsgs } = await supabase
            .from("fake_chat_messages")
            .select("message, sender_type")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: true });

          // GUARD: Only send thank-you/follow-up if the admin actually replied
          // Find the last message — if it's still a customer message, admin hasn't replied yet
          const lastMsg = (convMsgs || []).length > 0 ? (convMsgs || [])[(convMsgs || []).length - 1] : null;
          if (!lastMsg || lastMsg.sender_type !== "admin") {
            // Admin hasn't replied yet — clear the stale auto_reply_due_at and skip
            await supabase
              .from("fake_chat_conversations")
              .update({ auto_reply_due_at: null })
              .eq("id", conv.id);
            continue;
          }

          const convUsed = new Set((convMsgs || []).filter((m: any) => m.sender_type === "customer").map((m: any) => m.message));

          // 25% chance: send a follow-up question instead of thank you
          const isFollowUp = Math.random() < 0.25;

          let outMsg: string;
          let keepAuto = false;

          if (isFollowUp) {
            // Determine the original category from the first customer message
            const firstCustomerMsg = (convMsgs || []).find((m: any) => m.sender_type === "customer");
            const originalCategory = firstCustomerMsg
              ? detectCategory(firstCustomerMsg.message)
              : "shipping";

            const newCategory = pickDifferentCategory(originalCategory);
            outMsg = generateQuestionUnique(newCategory, convUsed);
            keepAuto = true; // stay is_auto so another thank-you gets scheduled after admin replies
          } else {
            outMsg = pickUnique(thankYouMessages, convUsed);
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
