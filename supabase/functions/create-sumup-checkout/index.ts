import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CheckoutRequest {
  amount: number;
  description: string;
  customerEmail: string;
  checkoutReference: string;
  redirectUrl?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("SUMUP_API_KEY");
    if (!apiKey) throw new Error("SumUp API key not configured");
    console.log("Using SumUp key starting with:", apiKey.substring(0, 10) + "...");

    // Get merchant code from SumUp profile
    const profileRes = await fetch("https://api.sumup.com/v0.1/me", {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + apiKey,
      },
    });
    const profileBody = await profileRes.text();
    console.log("SumUp /me status:", profileRes.status, "body:", profileBody);

    if (!profileRes.ok) {
      throw new Error("SumUp profile failed (" + profileRes.status + "): " + profileBody);
    }

    const profile = JSON.parse(profileBody);
    const merchantCode = profile.merchant_profile?.merchant_code;
    if (!merchantCode) throw new Error("Could not determine merchant code");
    console.log("Merchant code:", merchantCode);

    const body = (await req.json()) as CheckoutRequest;
    const { amount, description, customerEmail, checkoutReference, redirectUrl } = body;

    if (!amount || amount <= 0) throw new Error("Invalid amount");
    if (!checkoutReference) throw new Error("Missing checkout reference");

    const checkoutBody: Record<string, unknown> = {
      checkout_reference: checkoutReference,
      amount,
      currency: "EUR",
      merchant_code: merchantCode,
      description: description || "Prof Parfums Order",
    };

    if (customerEmail) {
      checkoutBody.pay_to_email = customerEmail;
    }
    if (redirectUrl) {
      checkoutBody.redirect_url = redirectUrl;
    }

    const checkoutRes = await fetch("https://api.sumup.com/v0.1/checkouts", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(checkoutBody),
    });

    const checkoutData = await checkoutRes.json();

    if (!checkoutRes.ok) {
      console.error("SumUp checkout error:", JSON.stringify(checkoutData));
      throw new Error(checkoutData.message || checkoutData.error_message || "Failed to create SumUp checkout");
    }

    console.log("Checkout created:", checkoutData.id);

    return new Response(
      JSON.stringify({ checkoutId: checkoutData.id, amount: checkoutData.amount }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating SumUp checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
