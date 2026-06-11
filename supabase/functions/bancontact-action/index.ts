// Handles the Approve / Reject / Split 50/50 links from the Bancontact emails.
// On approve: marks approved, credits full amount to the counter.
// On split:   marks split, credits half now, schedules second half +1 hour (paid by bancontact-timer-tick).
// On reject:  marks rejected, no credit.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPage(title: string, msg: string, ok: boolean): string {
  const color = ok ? "#16a34a" : "#dc2626";
  const icon = ok ? "✓" : "✕";
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;padding:40px;background:#f4f3ef;font-family:Arial,sans-serif;text-align:center;">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="font-size:48px;margin-bottom:16px;color:${color};">${icon}</div>
  <h1 style="color:${color};font-size:24px;margin:0 0 12px;">${title}</h1>
  <p style="color:#666;font-size:16px;line-height:1.6;margin:0;">${msg}</p>
</div></body></html>`;
}

async function bumpCounter(supabase: ReturnType<typeof createClient>) {
  // The counter row has a BEFORE trigger that recalculates everything from
  // bancontact_orders. We just need to touch it so realtime fires.
  await supabase.from("bancontact_live_counter").update({ updated_at: new Date().toISOString() }).eq("id", 1);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("token");
    const action = url.searchParams.get("action");
    if (!id || !token || !action || !["approve", "reject", "split"].includes(action)) {
      return new Response(buildPage("Invalid Link", "Missing or invalid parameters.", false),
        { headers: { "Content-Type": "text/html" }, status: 400 });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: order, error } = await supabase
      .from("bancontact_orders")
      .select("*")
      .eq("id", id)
      .eq("approval_token", token)
      .maybeSingle();
    if (error || !order) {
      return new Response(buildPage("Invalid Link", "This link is invalid or has already been used.", false),
        { headers: { "Content-Type": "text/html" }, status: 404 });
    }

    if (order.status !== "pending") {
      return new Response(buildPage("Already Handled", `This order has already been ${order.status}.`, false),
        { headers: { "Content-Type": "text/html" }, status: 200 });
    }

    const now = new Date();
    if (action === "approve") {
      await supabase.from("bancontact_orders").update({
        status: "approved",
        approved_at: now.toISOString(),
        updated_at: now.toISOString(),
      }).eq("id", id);
      await bumpCounter(supabase);
      return new Response(buildPage("Approved", `Full amount €${Number(order.total_amount).toFixed(2)} added to the Bancontact live tally.`, true),
        { headers: { "Content-Type": "text/html" }, status: 200 });
    }

    if (action === "reject") {
      await supabase.from("bancontact_orders").update({
        status: "rejected",
        rejected_at: now.toISOString(),
        updated_at: now.toISOString(),
      }).eq("id", id);
      await bumpCounter(supabase);
      return new Response(buildPage("Rejected", "This Bancontact order has been rejected. Nothing was added to the tally.", true),
        { headers: { "Content-Type": "text/html" }, status: 200 });
    }

    // action === "split"
    const dueAt = new Date(now.getTime() + 60 * 60 * 1000);
    await supabase.from("bancontact_orders").update({
      status: "split",
      split_first_at: now.toISOString(),
      split_second_due_at: dueAt.toISOString(),
      updated_at: now.toISOString(),
    }).eq("id", id);
    await bumpCounter(supabase);
    const half = (Number(order.total_amount) / 2).toFixed(2);
    return new Response(buildPage(
      "Split 50/50 Accepted",
      `€${half} added to the live tally now. The remaining €${half} will be added at ${dueAt.toUTCString()}.`,
      true,
    ), { headers: { "Content-Type": "text/html" }, status: 200 });
  } catch (e: any) {
    console.error("bancontact-action error:", e);
    return new Response(buildPage("Error", "Something went wrong. Please try again.", false),
      { headers: { "Content-Type": "text/html" }, status: 500 });
  }
});
