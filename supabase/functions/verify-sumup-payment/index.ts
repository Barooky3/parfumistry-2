import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { checkoutReference } = await req.json();
    if (!checkoutReference) throw new Error("Missing checkout reference");

    const apiKey = Deno.env.get("SUMUP_API_KEY");
    if (!apiKey) throw new Error("SumUp API key not configured");

    // Get checkout status from SumUp
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up order by checkout reference
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("checkout_reference", checkoutReference)
      .maybeSingle();

    if (orderErr || !order) {
      throw new Error("Order not found for reference: " + checkoutReference);
    }

    // If email already sent, skip
    if (order.email_sent) {
      return new Response(JSON.stringify({ success: true, message: "Email already sent" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify payment with SumUp using the checkout ID
    const checkoutRes = await fetch(`https://api.sumup.com/v0.1/checkouts/${order.sumup_checkout_id}`, {
      headers: { "Authorization": `Bearer ${apiKey}` },
    });

    if (!checkoutRes.ok) {
      throw new Error("Failed to verify checkout with SumUp");
    }

    const checkout = await checkoutRes.json();
    console.log("SumUp checkout status:", checkout.status, "for ref:", checkoutReference);

    if (checkout.status !== "PAID") {
      // Update order status but don't send email
      await supabase.from("orders").update({ status: checkout.status?.toLowerCase() || "unknown" }).eq("id", order.id);
      return new Response(JSON.stringify({ success: false, status: checkout.status }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Payment verified! Request admin approval instead of sending customer email directly
    await supabase.from("orders").update({ status: "pending_approval" }).eq("id", order.id);

    // Generate approval token
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    const token = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
    await supabase.from("orders").update({ approval_token: token }).eq("id", order.id);

    // Send approval request to admin via the request-order-approval-like flow
    const { error: approvalError } = await supabase.functions.invoke("request-order-approval", {
      body: {
        orderItems: order.order_items,
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        shippingAddress: order.shipping_address,
        totalAmount: order.total_amount.toString(),
      },
    });

    if (approvalError) {
      console.error("Failed to send approval email:", approvalError);
      throw new Error("Failed to send order approval email");
    }

    console.log("Order pending approval for:", checkoutReference);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
