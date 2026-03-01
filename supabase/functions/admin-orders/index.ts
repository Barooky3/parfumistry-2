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

    // Decode JWT to get email without requiring active session
    const token = authHeader.replace("Bearer ", "");
    let payload: { email?: string };
    try {
      const parts = token.split(".");
      payload = JSON.parse(atob(parts[1]));
    } catch {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userEmail = payload.email || "";
    if (!ADMIN_EMAILS.includes(userEmail)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the token is actually valid by checking with service role
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
        // Update status to approved (allow re-approval with duplicate emails)
        await adminClient
          .from("orders")
          .update({ status: "approved", email_sent: true })
          .eq("id", orderId);

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

        // Send comprehensive admin invoice
        const apiKey = Deno.env.get("RESEND_API_KEY");
        if (apiKey) {
          const isGiftCard = order.checkout_reference?.startsWith("rewarble");
          const isRevolutApp = order.checkout_reference?.startsWith("revolut-app");
          const isBankTransfer = order.checkout_reference?.startsWith("bank-transfer");
          const isPaypal = order.checkout_reference?.startsWith("paypal");
          const pmLabel = isGiftCard ? "Rewarble Gift Card (Verified)" : isRevolutApp ? "Revolut App (Verified)" : isBankTransfer ? "Bank Transfer / SEPA (Verified)" : isPaypal ? "PayPal (Verified)" : "Revolut Transfer (Verified)";
          const orderNumLabel = order.order_number ? `#${order.order_number}` : order.id.slice(0, 8);
          const invoiceDate = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

          // Parse order items
          const items = Array.isArray(order.order_items) ? order.order_items : [];
          const itemRows = items.map((item: any) => {
            const name = item.product?.name || item.name || "Unknown";
            const brand = item.product?.brand || item.brand || "";
            const qty = item.quantity || 1;
            const price = item.selectedPrice || item.product?.price || item.price || 0;
            const ml = item.selectedMl || item.product?.selectedMl || "";
            const mlLabel = ml ? ` — ${ml}ml` : "";
            const lineTotal = (price * qty).toFixed(2);
            const affiliateUrl = item.product?.affiliateUrl || item.affiliateUrl || "";
            const linkHtml = affiliateUrl ? ` <a href="${affiliateUrl}" style="color:#c9a96e;font-size:12px;">(link)</a>` : "";
            return `<tr>
              <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;">${brand} — ${name}${mlLabel}${linkHtml}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${qty}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">€${Number(price).toFixed(2)}</td>
              <td style="padding:10px 8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600;">€${lineTotal}</td>
            </tr>`;
          }).join("");

          // Calculate subtotal from items
          const subtotal = items.reduce((sum: number, item: any) => {
            const price = item.selectedPrice || item.product?.price || item.price || 0;
            const qty = item.quantity || 1;
            return sum + price * qty;
          }, 0);

          // Discount info
          const hasDiscount = order.discount_code && order.discount_percent;
          const discountAmount = hasDiscount ? (subtotal * order.discount_percent / 100) : 0;

          // Shipping address
          const addr = order.shipping_address || {};
          const addressLines = [addr.line1, addr.line2, [addr.city, addr.postalCode].filter(Boolean).join(" "), addr.country].filter(Boolean);
          const addressHtml = addressLines.length > 0 ? addressLines.join("<br/>") : "N/A";

          // Gift card codes
          const giftCardHtml = order.gift_card_code 
            ? `<tr><td style="padding:6px 0;color:#999;font-size:13px;">Gift Card Code(s):</td><td style="padding:6px 0;font-size:13px;font-family:monospace;font-weight:700;color:#92400e;">${order.gift_card_code}</td></tr>` 
            : "";

          const invoiceSubject = `Invoice: Order ${orderNumLabel} — ${order.customer_name || order.customer_email} — €${order.total_amount}`;

          const invoiceHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:700px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e5e5;">
  
  <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:22px;font-weight:300;letter-spacing:5px;margin:0;">PROFPARFUMS</h1>
    <p style="color:#666;font-size:11px;letter-spacing:2px;margin:6px 0 0;text-transform:uppercase;">Invoice / Order Confirmation</p>
  </div>

  <div style="padding:28px 32px;">
    <table style="width:100%;margin-bottom:24px;font-size:13px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:8px;">Bill To</div>
          <div style="font-size:15px;font-weight:600;color:#1a1a1a;margin-bottom:4px;">${order.customer_name || "N/A"}</div>
          <div style="color:#666;line-height:1.5;">${order.customer_email}</div>
          <div style="color:#666;line-height:1.5;margin-top:4px;">${addressHtml}</div>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:8px;">Invoice Details</div>
          <table style="margin-left:auto;font-size:13px;">
            <tr><td style="padding:3px 12px 3px 0;color:#999;">Order №:</td><td style="padding:3px 0;font-weight:600;">${orderNumLabel}</td></tr>
            <tr><td style="padding:3px 12px 3px 0;color:#999;">Date:</td><td style="padding:3px 0;">${invoiceDate}</td></tr>
            <tr><td style="padding:3px 12px 3px 0;color:#999;">Payment:</td><td style="padding:3px 0;">${pmLabel}</td></tr>
            <tr><td style="padding:3px 12px 3px 0;color:#999;">Status:</td><td style="padding:3px 0;color:#16a34a;font-weight:600;">APPROVED ✓</td></tr>
            ${giftCardHtml}
          </table>
        </td>
      </tr>
    </table>

    <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #1a1a1a;margin-bottom:0;">Order Items</div>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#faf9f6;">
          <th style="padding:10px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;border-bottom:1px solid #ddd;">Product</th>
          <th style="padding:10px 8px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;border-bottom:1px solid #ddd;">Qty</th>
          <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;border-bottom:1px solid #ddd;">Unit Price</th>
          <th style="padding:10px 8px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#999;border-bottom:1px solid #ddd;">Total</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <table style="width:100%;margin-top:16px;font-size:14px;">
      <tr>
        <td style="padding:6px 8px;color:#666;">Subtotal:</td>
        <td style="padding:6px 8px;text-align:right;">€${subtotal.toFixed(2)}</td>
      </tr>
      ${hasDiscount ? `<tr>
        <td style="padding:6px 8px;color:#c9a96e;font-weight:500;">Discount (${order.discount_code} — ${order.discount_percent}%):</td>
        <td style="padding:6px 8px;text-align:right;color:#c9a96e;font-weight:500;">-€${discountAmount.toFixed(2)}</td>
      </tr>` : ""}
      <tr style="border-top:2px solid #1a1a1a;">
        <td style="padding:12px 8px;font-size:16px;font-weight:700;">Total Paid:</td>
        <td style="padding:12px 8px;text-align:right;font-size:20px;font-weight:700;">€${Number(order.total_amount).toFixed(2)}</td>
      </tr>
    </table>
  </div>

  <div style="background:#faf9f6;padding:16px 32px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center;">
    This invoice was generated automatically upon order approval. Order ID: ${order.id}
  </div>
</div>
</body></html>`;

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "ProfParfums Orders <orders@profparfum.com>",
              to: ADMIN_EMAILS,
              subject: invoiceSubject,
              html: invoiceHtml,
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
        const { rejectionNotes } = body;

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
            ? "Unfortunately, your bank transfer could not be verified or was bounced back by the receiving bank. Your order has been cancelled.<br><br><strong>If you did send the payment, don't worry -- your money is already on its way back to your account.</strong> Depending on your bank, it may take 1-3 business days to appear in your balance."
            : "Unfortunately, your payment could not be verified. No money has been taken from your account.";

          const nextStep = isBankTransfer
            ? "If you'd like to try again, please place a new order and make sure to include your email address in the payment reference so we can match your transfer. If you have any questions, don't hesitate to reach out."
            : "Please try again or contact us for assistance.";

          const adminNotesHtml = rejectionNotes && rejectionNotes.trim()
            ? `<div style="background:#fef2f2;border:1px solid #fca5a5;padding:16px 20px;border-radius:8px;margin:16px 0;">
                <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#991b1b;margin-bottom:6px;font-weight:600;">Reason for Rejection</div>
                <p style="font-size:14px;color:#991b1b;line-height:1.6;margin:0;">${rejectionNotes.trim().replace(/\n/g, '<br>')}</p>
              </div>`
            : "";

          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "ProfParfums <orders@profparfum.com>",
              to: [order.customer_email],
              reply_to: "ewhz3384@gmail.com",
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
    <p style="font-size:14px;color:#666;line-height:1.6;">${reason}</p>
    ${adminNotesHtml}
    <p style="font-size:14px;color:#666;line-height:1.6;">${nextStep}</p>
    <div style="background:#faf9f6;border:1px solid #eee;padding:20px 24px;border-radius:8px;text-align:center;margin-top:24px;">
      <p style="font-size:13px;color:#666;margin:0;">Need help? Contact us at <a href="mailto:support@profparfums.com" style="color:#c9a96e;">support@profparfums.com</a>${order.order_number ? '<br><span style="font-size:12px;color:#999;">Please include your order number: <strong>#' + order.order_number + '</strong></span>' : ''}</p>
    </div>
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
