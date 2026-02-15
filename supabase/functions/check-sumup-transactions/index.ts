import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SUMUP_API_KEY");
    if (!apiKey) throw new Error("SumUp API key not configured");

    // Fetch transaction history from SumUp
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const res = await fetch(`https://api.sumup.com/v0.1/me/transactions/history?limit=50&order=descending`, {
      method: "GET",
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    const body = await res.text();
    if (!res.ok) throw new Error(`SumUp API error (${res.status}): ${body}`);
    const data = JSON.parse(body);

    // For each successful transaction, try to get checkout details
    const enriched = [];
    for (const tx of (data.items || [])) {
      if (tx.status === "SUCCESSFUL" && tx.client_transaction_id) {
        try {
          const checkoutRes = await fetch(`https://api.sumup.com/v0.1/checkouts/${tx.client_transaction_id}`, {
            headers: { "Authorization": `Bearer ${apiKey}` },
          });
          if (checkoutRes.ok) {
            const checkout = await checkoutRes.json();
            enriched.push({ ...tx, checkout_details: checkout });
            continue;
          }
        } catch (e) { /* ignore */ }
      }
      enriched.push(tx);
    }

    return new Response(JSON.stringify({ items: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
