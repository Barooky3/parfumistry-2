// Bancontact fake order generator. Creates a row in bancontact_orders and
// emails an approval message to elkhabirmalik with Approve / Reject / Split 50/50 links.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RECIPIENT = "elkhabirmalik@gmail.com";

interface BancItem {
  name: string;
  brand: string;
  price: number;
  quantity: number;
  selectedMl?: number;
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function genToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildEmailHtml(
  orderId: string,
  token: string,
  customerName: string,
  customerEmail: string,
  country: string | null,
  items: BancItem[],
  totalAmount: number,
  baseUrl: string,
): string {
  const approveUrl = `${baseUrl}/functions/v1/bancontact-action?id=${orderId}&token=${token}&action=approve`;
  const rejectUrl  = `${baseUrl}/functions/v1/bancontact-action?id=${orderId}&token=${token}&action=reject`;
  const splitUrl   = `${baseUrl}/functions/v1/bancontact-action?id=${orderId}&token=${token}&action=split`;

  const itemRows = items.map((item) => {
    const mlLabel = item.selectedMl ? ` — ${item.selectedMl}ml` : "";
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-family:Arial,sans-serif;">
      <strong>${escapeHtml(item.brand)}</strong> — ${escapeHtml(item.name)}${mlLabel}<br/>
      <span style="color:#666;">Qty: ${item.quantity} · €${(item.price * item.quantity).toFixed(2)}</span>
    </td></tr>`;
  }).join("");

  const countryRow = country
    ? `<tr><td style="padding:4px 0;color:#999;width:120px;">Country:</td><td style="padding:4px 0;">${escapeHtml(country)}</td></tr>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <div style="background:#1a1a1a;padding:24px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:22px;margin:0;letter-spacing:3px;">BANCONTACT ORDER APPROVAL</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#333;margin:0 0 16px;">A new Bancontact order needs your approval.</p>
    <table style="width:100%;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:4px 0;color:#999;width:120px;">Customer:</td><td style="padding:4px 0;"><strong>${escapeHtml(customerName)}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#999;">Email:</td><td style="padding:4px 0;">${escapeHtml(customerEmail)}</td></tr>
      ${countryRow}
      <tr><td style="padding:4px 0;color:#999;">Total:</td><td style="padding:4px 0;"><strong>€${totalAmount.toFixed(2)}</strong></td></tr>
    </table>
    <div style="text-align:center;margin-top:24px;margin-bottom:12px;">
      <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;margin:4px;">Approve</a>
      <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;margin:4px;">Reject</a>
    </div>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${splitUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Split 50/50 (half now, half in 1h)</a>
    </div>
    <div style="border-top:2px solid #1a1a1a;padding-top:12px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px;">Order Items</div>
      <table style="width:100%;">${itemRows}</table>
    </div>
  </div>
</div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Parfumistry Bancontact <orders@parfumistry.net>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errBody}`);
  }
}

interface RealOrderRow {
  customer_name: string;
  customer_email: string;
  shipping_address: { country?: string } | null;
  order_items: BancItem[] | null;
  total_amount: number;
}

type PickResult =
  | { ok: true; name: string; email: string; country: string | null; exhausted: boolean; poolSize: number }
  | { ok: false; reason: "no_real_orders" | "all_in_cooldown_strict"; poolSize: number };

async function pickCustomer(
  supabase: ReturnType<typeof createClient>,
  opts: { allowRepeats: boolean } = { allowRepeats: true },
): Promise<PickResult> {
  // 1. Cooldown window: don't reuse any customer (real or bancontact) seen in the last 2 days.
  const COOLDOWN_MS = 2 * 24 * 60 * 60 * 1000;
  const cooldownCutoff = new Date(Date.now() - COOLDOWN_MS).toISOString();
  const ageCutoff = cooldownCutoff;

  // 2. Emails recently used in bancontact_orders — fully blocked until cooldown clears.
  const { data: recentBC } = await supabase
    .from("bancontact_orders")
    .select("customer_email, created_at")
    .gte("created_at", cooldownCutoff);
  const blocked = new Set<string>();
  for (const r of (recentBC || []) as Array<{ customer_email: string }>) {
    if (r.customer_email) blocked.add(r.customer_email.toLowerCase());
  }

  // 3. Build the full eligible pool from real (non-pending) orders older than the cutoff.
  const { data } = await supabase
    .from("orders")
    .select("customer_name, customer_email, shipping_address, created_at")
    .neq("status", "pending_approval")
    .lt("created_at", ageCutoff)
    .order("created_at", { ascending: true })
    .limit(2000);
  const rows = (data || []) as Array<{ customer_name: string; customer_email: string; shipping_address: any; created_at: string }>;
  if (rows.length === 0) return { ok: false, reason: "no_real_orders", poolSize: 0 };

  // 4. Dedupe by email — keep the newest record per email so name/country reflect latest order.
  const byEmail = new Map<string, { name: string; email: string; country: string | null; created_at: string }>();
  for (const r of rows) {
    const key = (r.customer_email || "").toLowerCase();
    if (!key) continue;
    const existing = byEmail.get(key);
    const entry = {
      name: r.customer_name || "Valued Customer",
      email: r.customer_email,
      country: r.shipping_address?.country || null,
      created_at: r.created_at,
    };
    if (!existing || new Date(entry.created_at) > new Date(existing.created_at)) {
      byEmail.set(key, entry);
    }
  }
  const unique = Array.from(byEmail.values());
  if (unique.length === 0) return { ok: false, reason: "no_real_orders", poolSize: 0 };

  // 5. Drop everyone currently in the cooldown window.
  const available = unique.filter((u) => !blocked.has(u.email.toLowerCase()));

  // 6. Fetch last-used-in-bancontact timestamp per email.
  const allEmails = unique.map((u) => u.email);
  const { data: allBCUsage } = await supabase
    .from("bancontact_orders")
    .select("customer_email, created_at")
    .in("customer_email", allEmails);
  const lastUsed = new Map<string, number>();
  for (const r of (allBCUsage || []) as Array<{ customer_email: string; created_at: string }>) {
    const key = (r.customer_email || "").toLowerCase();
    const t = new Date(r.created_at).getTime();
    const prev = lastUsed.get(key);
    if (prev === undefined || t > prev) lastUsed.set(key, t);
  }

  // 7. Selection strategy + explicit exhaustion fallback:
  //    a) Prefer never-used available customers (random pick for variety).
  //    b) Else, least-recently-used among the available (cooldown-clear) pool.
  //    c) EXHAUSTION (every eligible customer is still inside the 2-day cooldown):
  //       - allowRepeats=true → rotate the least-recently-used customer back in (flag exhausted).
  //       - allowRepeats=false → bail out with a friendly error so caller can stop & warn.
  let chosen: { name: string; email: string; country: string | null; created_at: string };
  let exhausted = false;

  if (available.length > 0) {
    const neverUsed = available.filter((u) => !lastUsed.has(u.email.toLowerCase()));
    if (neverUsed.length > 0) {
      chosen = pick(neverUsed);
    } else {
      const sorted = [...available].sort((a, b) => {
        const ta = lastUsed.get(a.email.toLowerCase()) ?? 0;
        const tb = lastUsed.get(b.email.toLowerCase()) ?? 0;
        return ta - tb;
      });
      chosen = pick(sorted.slice(0, Math.min(5, sorted.length)));
    }
  } else {
    if (!opts.allowRepeats) {
      return { ok: false, reason: "all_in_cooldown_strict", poolSize: unique.length };
    }
    exhausted = true;
    const sorted = [...unique].sort((a, b) => {
      const ta = lastUsed.get(a.email.toLowerCase()) ?? 0;
      const tb = lastUsed.get(b.email.toLowerCase()) ?? 0;
      return ta - tb;
    });
    chosen = sorted[0];
    console.warn(
      `bancontact: customer pool exhausted (all ${unique.length} within 2d cooldown). Reusing LRU ${chosen.email}.`,
    );
  }

  return {
    ok: true,
    name: chosen.name,
    email: chosen.email,
    country: chosen.country,
    exhausted,
    poolSize: unique.length,
  };
}

async function buildRandomItems(supabase: ReturnType<typeof createClient>): Promise<{ items: BancItem[]; total: number }> {
  // Pull a wide pool of past order items to draw from.
  const { data } = await supabase
    .from("orders")
    .select("order_items")
    .neq("status", "pending_approval")
    .order("created_at", { ascending: false })
    .limit(150);
  const pool: BancItem[] = [];
  for (const row of (data || []) as Array<{ order_items: any }>) {
    const arr = Array.isArray(row.order_items) ? row.order_items : [];
    for (const it of arr) {
      if (!it || typeof it !== "object") continue;
      const price = Number(it.price);
      if (!isFinite(price) || price <= 0 || price > 120) continue;
      pool.push({
        name: String(it.name || "Fragrance"),
        brand: String(it.brand || "Brand"),
        price,
        quantity: 1,
        selectedMl: typeof it.selectedMl === "number" ? it.selectedMl : undefined,
      });
    }
  }
  // Fallback pool if no items
  if (pool.length === 0) {
    pool.push(
      { name: "Aventus", brand: "Creed", price: 49.99, quantity: 1, selectedMl: 50 },
      { name: "Sauvage", brand: "Dior", price: 39.99, quantity: 1, selectedMl: 100 },
      { name: "Eros", brand: "Versace", price: 34.99, quantity: 1, selectedMl: 100 },
    );
  }

  // Try up to 15 random compositions, pick the first whose total is 20-150.
  for (let attempt = 0; attempt < 15; attempt++) {
    const count = 1 + Math.floor(Math.random() * 3); // 1..3
    const picked: BancItem[] = [];
    for (let i = 0; i < count; i++) {
      picked.push({ ...pick(pool) });
    }
    const total = picked.reduce((s, it) => s + it.price * it.quantity, 0);
    if (total >= 20 && total <= 150) {
      return { items: picked, total: Math.round(total * 100) / 100 };
    }
  }
  // Last resort: take a single cheap item from the pool.
  const cheap = pool
    .filter((it) => it.price >= 20 && it.price <= 100)
    .sort(() => Math.random() - 0.5)[0] || pool[0];
  return {
    items: [{ ...cheap, quantity: 1 }],
    total: Math.round(cheap.price * 100) / 100,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({} as any));
    const mode: "random" | "custom" = body?.mode === "custom" ? "custom" : "random";
    const source: string = body?.source === "timed" ? "timed" : mode;
    // Strict mode: when true, bail out instead of reusing a recently-used customer.
    // Default: manual (UI) calls are strict so the admin sees a clear error; the
    // timed generator is non-strict so the loop keeps running via LRU rotation.
    const strict: boolean = typeof body?.strict === "boolean"
      ? body.strict
      : source !== "timed";

    const pickRes = await pickCustomer(supabase, { allowRepeats: !strict });
    if (!pickRes.ok) {
      const message = pickRes.reason === "no_real_orders"
        ? "No real customer orders are available yet to base a Bancontact order on. Wait until at least one approved order is older than 2 days."
        : `All ${pickRes.poolSize} eligible customers were used in the last 2 days. Wait for the cooldown to clear, or re-run with repeats allowed.`;
      return new Response(
        JSON.stringify({ error: message, reason: pickRes.reason, poolSize: pickRes.poolSize }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 409 },
      );
    }
    const customer = { name: pickRes.name, email: pickRes.email, country: pickRes.country };

    let items: BancItem[];
    let total: number;

    if (mode === "custom") {
      const rawItems = Array.isArray(body?.items) ? body.items : [];
      if (rawItems.length === 0) {
        return new Response(JSON.stringify({ error: "Custom mode requires items." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      }
      items = rawItems.map((it: any) => ({
        name: String(it.name || "Fragrance"),
        brand: String(it.brand || "Brand"),
        price: Number(it.price) || 0,
        quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
        selectedMl: typeof it.selectedMl === "number" ? it.selectedMl : undefined,
      }));
      const providedTotal = Number(body?.total);
      total = isFinite(providedTotal) && providedTotal > 0
        ? Math.round(providedTotal * 100) / 100
        : Math.round(items.reduce((s, it) => s + it.price * it.quantity, 0) * 100) / 100;
    } else {
      const built = await buildRandomItems(supabase);
      items = built.items;
      total = built.total;
    }

    const token = genToken();
    const { data: order, error: insErr } = await supabase
      .from("bancontact_orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        country: customer.country,
        order_items: items,
        total_amount: total,
        status: "pending",
        approval_token: token,
        source,
      })
      .select("id")
      .single();
    if (insErr || !order) throw new Error(`Failed to create bancontact order: ${insErr?.message}`);

    const html = buildEmailHtml(order.id, token, customer.name, customer.email, customer.country, items, total, supabaseUrl);
    const subject = `Bancontact Order: ${customer.name} - EUR${total.toFixed(2)}`;
    await sendEmail(RECIPIENT, subject, html);

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      customer: customer.name,
      total,
      exhausted: pickRes.exhausted,
      poolSize: pickRes.poolSize,
      warning: pickRes.exhausted
        ? `Customer pool exhausted (${pickRes.poolSize} eligible, all within 2d cooldown). Reused least-recently-used customer.`
        : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e: any) {
    console.error("bancontact-generate error:", e);
    return new Response(JSON.stringify({ error: e.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
