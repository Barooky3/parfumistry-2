import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
      .select("id, order_number, proof_url")
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
