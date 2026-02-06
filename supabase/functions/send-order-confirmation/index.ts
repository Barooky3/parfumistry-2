import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_SELLER_LINK = "https://litbuy.shop/lit/I2wvc0a2";

const PRODUCT_LINKS: Record<string, string> = {
  "stronger-with-you": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661840944&affcode=c5v3b",
  "aventus": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661817242&affcode=c5v3b",
  "valentino": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661811226&affcode=c5v3b",
  "louis-vuitton": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661789506&affcode=c5v3b",
  "xerjoff": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7662173327&affcode=c5v3b",
  "eros": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7665241752&affcode=c5v3b",
  "dior": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661870378&affcode=c5v3b",
  "parfums-de-marly": "https://m.orientdig.com/pages/product/product?id=857200052892&shoptype=ALI_1688&ref=100144636",
  "jean-paul-gaultier": "https://litbuy.shop/lit/JeaFpAPH",
};

function getProductLink(name: string, brand: string): string {
  const n = name.toLowerCase();
  const b = brand.toLowerCase();
  if (n.includes("stronger with you")) return PRODUCT_LINKS["stronger-with-you"];
  if (n.includes("aventus")) return PRODUCT_LINKS["aventus"];
  if (b.includes("valentino")) return PRODUCT_LINKS["valentino"];
  if (b.includes("louis vuitton")) return PRODUCT_LINKS["louis-vuitton"];
  if (b.includes("xerjoff")) return PRODUCT_LINKS["xerjoff"];
  if (n.includes("eros")) return PRODUCT_LINKS["eros"];
  if (b.includes("dior")) return PRODUCT_LINKS["dior"];
  if (b.includes("parfums de marly")) return PRODUCT_LINKS["parfums-de-marly"];
  if (b.includes("jean paul gaultier")) return PRODUCT_LINKS["jean-paul-gaultier"];
  return DEFAULT_SELLER_LINK;
}

interface OrderItem {
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
  selectedMl?: number;
}

function buildItemRow(item: OrderItem, origin: string): string {
  const imageUrl = item.image.startsWith("http")
    ? item.image
    : origin + (item.image.startsWith("/") ? "" : "/") + item.image;
  const productLink = getProductLink(item.name, item.brand);
  const mlLabel = item.selectedMl ? " \u2014 " + item.selectedMl + "ml" : "";
  const itemTotal = (item.price * item.quantity).toFixed(2);

  return [
    '<tr>',
    '<td style="padding: 16px 0; border-bottom: 1px solid #eee; vertical-align: top;">',
    '<table cellpadding="0" cellspacing="0" border="0"><tr>',
    '<td style="width: 80px; vertical-align: top;">',
    '<a href="' + productLink + '" style="text-decoration: none;">',
    '<img src="' + imageUrl + '" alt="' + item.name + '" width="72" height="72" style="display: block; border-radius: 8px; object-fit: cover; border: 1px solid #eee;" />',
    '</a>',
    '</td>',
    '<td style="padding-left: 16px; vertical-align: top; font-family: Helvetica Neue, Arial, sans-serif;">',
    '<div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 4px;">' + item.brand + '</div>',
    '<a href="' + productLink + '" style="font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px; display: block; text-decoration: none;">' + item.name + mlLabel + '</a>',
    '<div style="font-size: 13px; color: #666; margin-bottom: 4px;">Qty: ' + item.quantity + ' &middot; &euro;' + itemTotal + '</div>',
    '</td></tr></table>',
    '</td></tr>',
  ].join("\n");
}

function buildEmailHtml(
  customerName: string,
  itemsHtml: string,
  totalAmount: string,
  shippingAddress: { line1: string; city: string; postalCode: string; country: string },
): string {
  const year = new Date().getFullYear();
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>',
    '<body style="margin: 0; padding: 0; background-color: #f4f3ef; font-family: Helvetica Neue, Arial, sans-serif;">',
    '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">',

    // Header
    '<div style="background-color: #1a1a1a; padding: 36px 32px; text-align: center;">',
    '<h1 style="color: #c9a96e; font-size: 26px; font-weight: 300; letter-spacing: 5px; margin: 0; text-transform: uppercase;">ProfParfums</h1>',
    '<p style="color: #666; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0 0; text-transform: uppercase;">Premium Fragrances</p>',
    '</div>',

    // Banner
    '<div style="background: linear-gradient(135deg, #c9a96e 0%, #b8944f 100%); padding: 28px 32px; text-align: center;">',
    '<h2 style="color: #ffffff; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 1px;">Thank You for Your Order! &#127881;</h2>',
    '</div>',

    // Special Offer
    '<div style="background-color: #1a1a1a; padding: 28px 32px; text-align: center; border-bottom: 3px solid #c9a96e;">',
    '<h2 style="color: #c9a96e; font-size: 22px; font-weight: 600; margin: 0 0 6px 0; letter-spacing: 1px;">Thank you for your purchase!</h2>',
    '<h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0 0 14px 0;">&#127873; Special Offer!</h2>',
    '<p style="color: #ffffff; font-size: 16px; margin: 0 0 6px 0; line-height: 1.5;">Use code <span style="background-color: #c9a96e; color: #1a1a1a; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 18px; letter-spacing: 1px;">Parfumz50</span> for <strong>50% off</strong> your next order</p>',
    '<p style="color: #ccc; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">Valid for 24 hours only &#9200;<br><span style="color: #999; font-size: 11px;">(Valid for short time only in order to avoid order hoarding. Code can be used for multiple orders)</span></p>',
    '</div>',

    // Greeting
    '<div style="padding: 32px 32px 0 32px;">',
    '<p style="font-size: 15px; color: #333; margin: 0 0 6px 0; line-height: 1.6;">Hi <strong>' + customerName + '</strong>,</p>',
    '<p style="font-size: 14px; color: #666; margin: 0 0 24px 0; line-height: 1.6;">Your order has been confirmed! Below you\'ll find your products. Click on any product to access it.</p>',
    '</div>',

    // Items
    '<div style="padding: 0 32px;">',
    '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; padding-bottom: 12px; border-bottom: 2px solid #1a1a1a; margin-bottom: 0;">Your Products</div>',
    '<table style="width: 100%; border-collapse: collapse;"><tbody>',
    itemsHtml,
    '</tbody></table></div>',

    // Total
    '<div style="padding: 20px 32px; margin: 0 32px; border-top: 2px solid #1a1a1a; text-align: right;">',
    '<span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Total Paid: </span>',
    '<span style="font-size: 22px; font-weight: 600; color: #1a1a1a;">&euro;' + totalAmount + '</span>',
    '</div>',

    // Shipping
    '<div style="padding: 0 32px 32px 32px;">',
    '<div style="background-color: #f8f7f4; padding: 20px 24px; border-radius: 8px;">',
    '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 12px;">&#128230; Delivery Details</div>',
    '<p style="font-size: 14px; color: #333; margin: 0; line-height: 1.7;">' + customerName + '<br>' + shippingAddress.line1 + '<br>' + shippingAddress.postalCode + ' ' + shippingAddress.city + '<br>' + shippingAddress.country + '</p>',
    '</div></div>',

    // Help
    '<div style="padding: 0 32px 32px 32px;">',
    '<div style="background-color: #faf9f6; border: 1px solid #eee; padding: 20px 24px; border-radius: 8px; text-align: center;">',
    '<p style="font-size: 13px; color: #666; margin: 0; line-height: 1.6;">Questions about your order? Contact us at<br>',
    '<a href="mailto:support@profparfums.com" style="color: #c9a96e; text-decoration: none; font-weight: 500;">support@profparfums.com</a></p>',
    '</div></div>',

    // Footer
    '<div style="background-color: #1a1a1a; padding: 28px 32px; text-align: center;">',
    '<p style="color: #c9a96e; font-size: 14px; letter-spacing: 3px; margin: 0 0 8px 0; text-transform: uppercase;">ProfParfums</p>',
    '<p style="color: #666; font-size: 11px; margin: 0; line-height: 1.8;">&copy; ' + year + ' ProfParfums. All rights reserved.<br>',
    '<a href="https://profparfums.lovable.app" style="color: #888; text-decoration: none;">profparfums.lovable.app</a></p>',
    '</div>',

    '</div></body></html>',
  ].join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, orderItems, testMode, testEmail, testName } = await req.json() as {
      sessionId: string; orderItems: OrderItem[]; testMode?: boolean; testEmail?: string; testName?: string
    };

    let customerEmail: string;
    let customerName: string;
    let shippingAddress: { line1: string; city: string; postalCode: string; country: string };
    let totalAmount: string;

    if (testMode && testEmail) {
      customerEmail = testEmail;
      customerName = testName || "Test Customer";
      shippingAddress = { line1: "Teststraat 1", city: "Amsterdam", postalCode: "1000 AA", country: "Netherlands" };
      totalAmount = (orderItems || []).reduce((sum: number, i: OrderItem) => sum + i.price * i.quantity, 0).toFixed(2);
    } else {
      if (!sessionId) throw new Error("Session ID is required");

      const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
        apiVersion: "2025-08-27.basil",
      });

      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items"],
      });

      if (session.payment_status !== "paid") throw new Error("Payment not completed");

      customerEmail = session.customer_email || session.customer_details?.email || "";
      if (!customerEmail) throw new Error("Customer email not found");

      customerName = session.metadata?.customer_name || "Valued Customer";
      shippingAddress = {
        line1: session.metadata?.shipping_line1 || "",
        city: session.metadata?.shipping_city || "",
        postalCode: session.metadata?.shipping_postal || "",
        country: session.metadata?.shipping_country || "",
      };
      totalAmount = ((session.amount_total || 0) / 100).toFixed(2);
    }

    const origin = "https://profparfums.lovable.app";
    const itemsHtml = (orderItems || []).map((item: OrderItem) => buildItemRow(item, origin)).join("");

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const emailResponse = await resend.emails.send({
      from: "ProfParfums <orders@profparfum.com>",
      to: [customerEmail],
      subject: "Order Confirmed - ProfParfums",
      html: buildEmailHtml(customerName, itemsHtml, totalAmount, shippingAddress),
    });

    console.log("Order confirmation email sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending order confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
