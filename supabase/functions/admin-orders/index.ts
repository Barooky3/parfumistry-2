import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAILS = ["ewhz3384@gmail.com", "mubarak.elkhabir@gmail.com"];

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

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!ADMIN_EMAILS.includes(user.email || "")) {
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
            orderNumber: order.order_number,
            discountCode: order.discount_code || null,
            discountPercent: order.discount_percent || 0,
            paymentMethod: order.checkout_reference?.startsWith("rewarble") ? "rewarble"
              : order.checkout_reference?.startsWith("bank-transfer") ? "bank_transfer"
              : order.checkout_reference?.startsWith("paypal") ? "paypal"
              : undefined,
          }),
        });
        if (!confRes.ok) {
          console.error("Failed to send confirmation:", await confRes.text());
        }

        // Send admin invoice
        const invoiceUrl = supabaseUrl + "/functions/v1/handle-order-action?id=" + orderId + "&token=" + (order.approval_token || "") + "&action=approve";
        // We already handled the confirmation above, just send invoice via Brevo
        const apiKey = Deno.env.get("RESEND_API_KEY");
        if (apiKey) {
          const isGiftCard = order.checkout_reference?.startsWith("rewarble");
          const isRevolutApp = order.checkout_reference?.startsWith("revolut-app");
          const isBankTransfer = order.checkout_reference?.startsWith("bank-transfer");
          const pmLabel = isGiftCard ? "Rewarble (Verified)" : isRevolutApp ? "Revolut App (Verified)" : isBankTransfer ? "Bank Transfer (Verified)" : "Revolut Transfer (Verified)";
          const discountLabel = order.discount_code && order.discount_percent ? ` | Discount: ${order.discount_code} (${order.discount_percent}%)` : "";
          const orderNumLabel = order.order_number ? ` #${order.order_number}` : "";
          const invoiceSubject = "Invoice: Order" + orderNumLabel + " - " + (order.customer_name || order.customer_email) + " - EUR" + order.total_amount;
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "ProfParfums Orders <orders@profparfum.com>",
              to: ADMIN_EMAILS,
              subject: invoiceSubject,
              html: `<p>Order ${orderId} approved via admin dashboard. Customer: ${order.customer_name} (${order.customer_email}). Total: EUR${order.total_amount}. Payment: ${pmLabel}.${discountLabel}</p>`,
            }),
          });
        }

        return new Response(JSON.stringify({ success: true, message: "Order approved, confirmation sent." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } else if (orderAction === "dismiss") {
        await adminClient.from("orders").delete().eq("id", orderId);
        return new Response(JSON.stringify({ success: true, message: "Order removed." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } else if (orderAction === "update_items") {
        const { orderItems, totalAmount } = body;
        if (!orderItems || totalAmount === undefined) {
          return new Response(JSON.stringify({ error: "Missing orderItems or totalAmount" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        await adminClient.from("orders").update({ order_items: orderItems, total_amount: totalAmount }).eq("id", orderId);
        return new Response(JSON.stringify({ success: true, message: "Order items updated." }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

      } else if (orderAction === "reject") {
        await adminClient.from("orders").update({ status: "rejected" }).eq("id", orderId);

        // Send rejection email to customer
        const apiKey = Deno.env.get("RESEND_API_KEY");
        if (apiKey) {
          const isGiftCard = order.checkout_reference?.startsWith("rewarble");
          const isRevolutApp = order.checkout_reference?.startsWith("revolut-app");
          const isBankTransfer = order.checkout_reference?.startsWith("bank-transfer");
          const reason = isGiftCard
            ? "Unfortunately, the Rewarble code you provided could not be verified. Please make sure you sent the <strong>actual gift card code</strong> — it is <strong>16 characters long and contains letters</strong>. The Rewarble <strong>order number</strong> (only digits, starting with #) is <strong>not</strong> the gift card code. Your order has been cancelled."
            : isRevolutApp
            ? "Unfortunately, your Revolut payment could not be verified. Your order has been cancelled."
            : isBankTransfer
            ? "Unfortunately, your bank transfer could not be verified. Your order has been cancelled."
            : "Unfortunately, your payment could not be verified. No money has been taken from your account.";

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "ProfParfums <orders@profparfum.com>",
              to: [order.customer_email],
              subject: order.order_number ? `Order #${order.order_number} Update - ProfParfums` : "Order Update - ProfParfums",
              html: `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;">
  <div style="background:#1a1a1a;padding:36px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:26px;font-weight:300;letter-spacing:5px;margin:0;">PROFPARFUMS</h1>
  </div>
  <div style="padding:32px;">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;">Payment Not Received</h2>
    ${order.order_number ? `<p style="font-size:13px;color:#999;margin:0 0 12px;">Order Number: <strong style="color:#1a1a1a;">#${order.order_number}</strong></p>` : ""}
    <p style="font-size:15px;color:#333;">Hi <strong>${order.customer_name || "Valued Customer"}</strong>,</p>
    <p style="font-size:14px;color:#666;">${reason}</p>
    <p style="font-size:14px;color:#666;">Please try again or contact us at <a href="mailto:support@profparfums.com" style="color:#c9a96e;">support@profparfums.com</a>${order.order_number ? `. Please reference order <strong>#${order.order_number}</strong>.` : ""}</p>
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
