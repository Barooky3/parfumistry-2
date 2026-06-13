import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const [ordersRes, bancontactRes] = await Promise.all([
      supabase.from('orders').select('customer_name, shipping_address').not('customer_name', 'is', null),
      supabase.from('bancontact_orders').select('customer_name, country').not('customer_name', 'is', null),
    ]);

    const map = new Map<string, { display: string; country: string }>();

    const addEntry = (rawName: string | null | undefined, country: string | null | undefined) => {
      if (!rawName) return;
      const name = String(rawName).trim();
      if (!name) return;
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length === 0) return;
      const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
      const lastInitial = parts.length > 1 ? parts[parts.length - 1].charAt(0).toUpperCase() + '.' : '';
      const display = lastInitial ? `${first} ${lastInitial}` : first;
      const ctry = (country || '').trim() || 'Europe';
      const key = `${display}|${ctry}`;
      if (!map.has(key)) map.set(key, { display, country: ctry });
    };

    (ordersRes.data || []).forEach((r: any) =>
      addEntry(r.customer_name, r.shipping_address?.country || r.shipping_address?.Country)
    );
    (bancontactRes.data || []).forEach((r: any) => addEntry(r.customer_name, r.country));

    const entries = Array.from(map.values());

    return new Response(JSON.stringify({ entries }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=600' },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), entries: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
