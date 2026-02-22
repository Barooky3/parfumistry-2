import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "ewhz3384@gmail.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user identity
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = claimsData.claims.email;
    if (userEmail !== ADMIN_EMAIL) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "GET") {
      // List orders
      const statusFilter = url.searchParams.get("status") || "pending_approval";
      let query = adminClient.from("orders").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return new Response(JSON.stringify({ orders: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { orderId, action: orderAction } = body;

      if (!orderId || !orderAction) {
        return new Response(JSON.stringify({ error: "Missing orderId or action" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get order
      const { data: order, error: orderError } = await adminClient
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        return new Response(JSON.stringify({ error: "Order not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (orderAction === "approve") {
        await adminClient.from("orders").update({ status: "approved", email_sent: true }).eq("id", orderId);

        // Send confirmation to customer via send-order-confirmation function
        const confRes = await fetch(supabaseUrl + "/functions/v1/send-order-confirmation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + supabaseAnonKey,
          },
          body: JSON.stringify({
            orderItems: order.order_items,
            customerEmail: order.customer_email,
            customerName: order.customer_name,
            shippingAddress: order.shipping_address,
            totalAmount: order.total_amount.toString(),
          }),
        });
        if (!confRes.ok) {
          console.error("Failed to send confirmation:", await confRes.text());
        }

        // Send admin invoice
        const invoiceUrl = supabaseUrl + "/functions/v1/handle-order-action?id=" + orderId + "&token=" + (order.approval_token || "") + "&action=approve";
        // We already handled the confirmation above, just send invoice via Brevo
        const apiKey = Deno.env.get("BREVO_API_KEY");
        if (apiKey) {
          const isGiftCard = order.checkout_reference?.startsWith("rewarble");
          const pmLabel = isGiftCard ? "Rewarble (Verified)" : "Revolut Transfer (Verified)";
          const invoiceSubject = "Invoice: " + (order.customer_name || order.customer_email) + " - EUR" + order.total_amount;
          // Use minimal invoice notification
          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: { "api-key": apiKey, "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              sender: { name: "ProfParfums Orders", email: "orders@profparfum.com" },
              to: [{ email: ADMIN_EMAIL }],
              subject: invoiceSubject,
              htmlContent: `<p>Order ${orderId} approved via admin dashboard. Customer: ${order.customer_name} (${order.customer_email}). Total: EUR${order.total_amount}. Payment: ${pmLabel}.</p>`,
            }),
          });
        }

        return new Response(JSON.stringify({ success: true, message: "Order approved, confirmation sent." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } else if (orderAction === "reject") {
        await adminClient.from("orders").update({ status: "rejected" }).eq("id", orderId);

        // Send rejection email to customer
        const apiKey = Deno.env.get("BREVO_API_KEY");
        if (apiKey) {
          const isGiftCard = order.checkout_reference?.startsWith("rewarble");
          const reason = isGiftCard
            ? "Unfortunately, the Rewarble code you provided could not be verified. Your order has been cancelled."
            : "Unfortunately, your payment could not be verified. No money has been taken from your account.";

          await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: { "api-key": apiKey, "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
              sender: { name: "ProfParfums", email: "orders@profparfum.com" },
              to: [{ email: order.customer_email }],
              subject: "Order Update - ProfParfums",
              htmlContent: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;">PROFPARFUMS</h1>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Payment Not Received</h2>
    <p style="font-size:15px;color:#333;">Hi <strong>${order.customer_name || "Valued Customer"}</strong>,</p>
    <p style="font-size:14px;color:#666;">${reason}</p>
    <p style="font-size:14px;color:#666;">Please try again or contact us at <a href="mailto:support@profparfums.com" style="color:#c9a96e;">support@profparfums.com</a>.</p>
  </div>
</div></body></html>`,
            }),
          });
        }

        return new Response(JSON.stringify({ success: true, message: "Order rejected, customer notified." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
