import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "ewhz3384@gmail.com";

async function sendAdminApprovalEmail(order: any, proofUrl: string, supabaseUrl: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) { console.error("RESEND_API_KEY not configured, skipping admin email"); return; }

  const items = (order.order_items || []) as any[];
  const paymentMethod = order.checkout_reference?.startsWith("bank-transfer") ? "Bank Transfer" : "Revolut App";
  const token = order.approval_token || "";
  const orderId = order.id;
  const orderNum = order.order_number;
  const approveUrl = `${supabaseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=approve`;
  const rejectUrl = `${supabaseUrl}/functions/v1/handle-order-action?id=${orderId}&token=${token}&action=reject`;

  const itemRows = items.map((item: any) => {
    const mlLabel = item.selectedMl ? ` — ${item.selectedMl}ml` : "";
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-family:Arial,sans-serif;">
      <strong>${item.brand || ""}</strong> — ${item.name || ""}${mlLabel}<br/>
      <span style="color:#666;">Qty: ${item.quantity || 1} · €${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
    </td></tr>`;
  }).join("");

  const addr = order.shipping_address || {};
  const addressText = [addr.line1, addr.city, addr.postalCode, addr.country].filter(Boolean).join(", ") || "N/A";

  const proofLinks = proofUrl.split(",").map((url: string, i: number) =>
    `<a href="${url.trim()}" target="_blank" style="display:inline-block;background:#2563eb;color:#fff;padding:8px 16px;border-radius:6px;text-decoration:none;font-size:13px;margin-right:8px;">📸 View Proof${proofUrl.includes(",") ? ` #${i+1}` : ""}</a>`
  ).join("");

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <div style="background:#1a1a1a;padding:24px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:22px;margin:0;letter-spacing:3px;">ORDER APPROVAL REQUIRED</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#333;margin:0 0 16px;">A new <strong>${paymentMethod}</strong> order needs your approval. The customer has uploaded proof of payment.</p>
    <div style="background:#d1fae5;border:2px solid #10b981;padding:16px 20px;border-radius:8px;margin-bottom:16px;text-align:center;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#065f46;margin-bottom:8px;font-weight:600;">✅ Payment Proof Uploaded</div>
      ${proofLinks}
    </div>
    <table style="width:100%;margin-bottom:16px;font-size:14px;">
      ${orderNum ? `<tr><td style="padding:4px 0;color:#999;width:120px;">Order #:</td><td style="padding:4px 0;"><strong>#${orderNum}</strong></td></tr>` : ""}
      <tr><td style="padding:4px 0;color:#999;width:120px;">Customer:</td><td style="padding:4px 0;"><strong>${order.customer_name}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#999;">Email:</td><td style="padding:4px 0;">${order.customer_email}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Address:</td><td style="padding:4px 0;">${addressText}</td></tr>
      <tr><td style="padding:4px 0;color:#999;">Total:</td><td style="padding:4px 0;"><strong>€${Number(order.total_amount).toFixed(2)}</strong></td></tr>
    </table>
    <div style="text-align:center;margin-top:24px;margin-bottom:16px;">
      <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;margin-right:12px;">Approve</a>
      <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;font-size:16px;">Reject</a>
    </div>
    <div style="border-top:2px solid #1a1a1a;padding-top:12px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px;">Order Items</div>
      <table style="width:100%;">${itemRows}</table>
    </div>
  </div>
</div>
</body></html>`;

  const orderNumLabel = orderNum ? ` #${orderNum}` : "";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "ProfParfums Orders <orders@profparfum.com>",
      to: [ADMIN_EMAIL],
      subject: `${paymentMethod} Order${orderNumLabel}: ${order.customer_name || order.customer_email} - EUR${Number(order.total_amount).toFixed(2)}`,
      html,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error("Failed to send admin email:", errBody);
  } else {
    console.log("Admin approval email sent for order #" + orderNum);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const orderNumber = formData.get("orderNumber") as string;
    const file = formData.get("file") as File;

    if (!orderNumber || !file) {
      return new Response(JSON.stringify({ error: "Missing orderNumber or file" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify order exists
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, proof_url, customer_email, customer_name, order_items, total_amount, shipping_address, approval_token, checkout_reference, gift_card_code")
      .eq("order_number", parseInt(orderNumber))
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404,
      });
    }

    // Upload file to storage
    const ext = file.name.split(".").pop() || "png";
    const fileName = `order-${orderNumber}-${Date.now()}.${ext}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload file" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("payment-proofs")
      .getPublicUrl(fileName);

    const proofUrl = urlData.publicUrl;

    // Update order with proof URL (append if multiple)
    const existingProof = order.proof_url;
    const newProofUrl = existingProof ? `${existingProof},${proofUrl}` : proofUrl;

    const { error: updateError } = await supabase
      .from("orders")
      .update({ proof_url: newProofUrl })
      .eq("id", order.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update order" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log(`Proof uploaded for order #${orderNumber}: ${proofUrl}`);

    // Send admin approval email now that proof is uploaded (for bank_transfer / revolut_app)
    const isProofMethod = order.checkout_reference?.startsWith("bank-transfer") || order.checkout_reference?.startsWith("revolut-app");
    if (isProofMethod) {
      try {
        await sendAdminApprovalEmail(order, newProofUrl, supabaseUrl);
      } catch (emailErr) {
        console.error("Failed to send admin email after proof upload:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, proofUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error uploading proof:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
