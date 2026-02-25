import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_SELLER_LINK = "https://litbuy.shop/lit/I2wvc0a2";

// Actual perfume bottle images from profparfums.store
const PRODUCT_IMAGES: Record<string, string> = {
  "amore-caffe": "https://profparfums.store/cdn/shop/files/mancera-amore-caffe-1050170.png?v=1768068487&width=800",
  "althair": "https://profparfums.store/cdn/shop/files/parfums-de-marly-althair-7480525.png?v=1768068548&width=800",
  "aoud-lemon-mint": "https://profparfums.store/cdn/shop/files/mancera-aoud-lemon-mint-3807519.png?v=1767903748&width=800",
  "aoud-vanille": "https://profparfums.store/cdn/shop/files/mancera-aoud-vanille-5716076.png?v=1768068487&width=800",
  "aventus": "https://profparfums.store/cdn/shop/files/creed-aventus-1140157.png?v=1768068488&width=800",
  "aventus-absolu": "https://profparfums.store/cdn/shop/files/creed-aventus-absolu-8001034.png?v=1768068489&width=800",
  "black-orchid": "https://profparfums.store/cdn/shop/files/tom-ford-black-orchid-1912271.png?v=1768068487&width=800",
  "born-in-roma": "https://profparfums.store/cdn/shop/files/valentino-born-in-roma-8991381.png?v=1768068487&width=800",
  "born-in-roma-coral-fantasy": "https://profparfums.store/cdn/shop/files/valentino.png?v=1768493347&width=800",
  "cedrat-boise": "https://profparfums.store/cdn/shop/files/mancera-cedrat-boise-8376726.png?v=1768068547&width=800",
  "delina": "https://profparfums.store/cdn/shop/files/second_image_matched_dimensions_smaller.png?v=1768068548&width=800",
  "erba-gold": "https://profparfums.store/cdn/shop/files/xerjoff-erba-gold-9327888.png?v=1768068546&width=800",
  "erba-pura": "https://profparfums.store/cdn/shop/files/xerjoff-erba-pura-8755466.png?v=1768068547&width=800",
  "eros-energy": "https://profparfums.store/cdn/shop/files/yellow_resized_to_red_d0d3284b-0228-4acd-8b37-3765a0c838d8.png?v=1768068547&width=800",
  "eros-flame": "https://profparfums.store/cdn/shop/files/A2B6CEE1-52D5-4900-AE35-97311C0903DF_transparent_1.png?v=1768068490&width=800",
  "eros-parfum": "https://profparfums.store/cdn/shop/files/versace-eros-2404971.png?v=1768068489&width=800",
  "french-riviera": "https://profparfums.store/cdn/shop/files/mancera-french-riviera-9959440.png?v=1768068547&width=800",
  "khamrah-parfum": "https://profparfums.store/cdn/shop/files/lattafa-khamrah-6018164.png?v=1768068489&width=800",
  "imagination": "https://profparfums.store/cdn/shop/files/product_4_matched_1.png?v=1768068548&width=800",
  "layton": "https://profparfums.store/cdn/shop/files/parfums-de-marly-layton-9771652.png?v=1768068489&width=800",
  "le-beau-le-parfum": "https://profparfums.store/cdn/shop/files/CD9D450B-B45D-4AB9-9750-9BD6AD00DB2F_png_only_1.png?v=1768068490&width=800",
  "le-male-le-parfum": "https://profparfums.store/cdn/shop/files/jean-paul-gaultier-le-male-le-parfum-9203208.png?v=1768068486&width=800",
  "le-male-elixir": "https://profparfums.store/cdn/shop/files/F5DB0F17-85A7-4892-BB9E-F7BE8D91B966_converted_1.png?v=1768068488&width=800",
  "libre": "https://profparfums.store/cdn/shop/files/ysl-libre-8359553.png?v=1768068486&width=800",
  "mon-paris": "https://profparfums.store/cdn/shop/files/yves-saint-laurent-mon-paris-7356496.png?v=1768068487&width=800",
  "black-opium": "https://profparfums.store/cdn/shop/files/ysl-black-opium-3914424.png?v=1768068488&width=800",
  "myself-edp": "https://profparfums.store/cdn/shop/files/ysl-myslf-eau-de-parfum-1896916.png?v=1768068488&width=800",
  "naxos": "https://profparfums.store/cdn/shop/files/xerjoff-naxos-3352432.png?v=1768068487&width=800",
  "paradigme": "https://profparfums.store/cdn/shop/files/prada_resized_uniform_54c5598a-9a6e-47d7-8803-0a385e54b9c6.png?v=1768068488&width=800",
  "pacific-hill": "https://profparfums.store/cdn/shop/files/image_6261aa49-3221-4a96-91e9-c8d120107fc0.png?v=1768493348&width=800",
  "red-tobacco": "https://profparfums.store/cdn/shop/files/mancera-red-tobacco-3937206.png?v=1768068488&width=800",
  "sauvage-parfum": "https://profparfums.store/cdn/shop/files/dior-sauvage-3604373.png?v=1768068546&width=800",
  "silver-mountain-water": "https://profparfums.store/cdn/shop/files/creed-silver-mountain-water-3465174.png?v=1768068487&width=800",
  "spicebomb-extreme": "https://profparfums.store/cdn/shop/files/spicebomb.png?v=1768410549&width=800",
  "stronger-with-you-absolutely": "https://profparfums.store/cdn/shop/files/stronger-with-you-absolute-8775051.png?v=1768068488&width=800",
  "stronger-with-you-amber": "https://profparfums.store/cdn/shop/files/1C01C9E5-CAD8-4745-8AED-B06A573E591B_converted_1.png?v=1768068489&width=800",
  "stronger-with-you-intensely": "https://profparfums.store/cdn/shop/files/73584D90-E000-4F86-8CF6-647F94B4F567_converted_1.png?v=1768068550&width=800",
  "stronger-with-you-parfum": "https://profparfums.store/cdn/shop/files/stronger-with-you-parfum-2174125.png?v=1768068547&width=800",
  "symphony": "https://profparfums.store/cdn/shop/files/image_f5380ed8-72f9-4429-ae98-588f5395b6ba.png?v=1768493348&width=800",
  "the-most-wanted-edp-intense": "https://profparfums.store/cdn/shop/files/product_2_matched_1.png?v=1768068488&width=800",
  "the-most-wanted-parfum": "https://profparfums.store/cdn/shop/files/product_3_matched_1.png?v=1768068488&width=800",
  "homme-intense": "https://profparfums.store/cdn/shop/files/dior-homme-intense-7103864.png?v=1768068547&width=800",
  "elixir-absolu": "https://profparfums.store/cdn/shop/files/gold_resized_to_match_black_object_1.png?v=1768068488&width=800",
  // Bundles
  "evening-sweetheart": "https://profparfums.store/cdn/shop/files/fragrance-bundle-evening-sweetheart-9560408.png?v=1768068549&width=800",
  "young-playboy": "https://profparfums.store/cdn/shop/files/fragrance-bundle-young-playboy-9880709.png?v=1768068548&width=800",
  "sleek-and-clean": "https://profparfums.store/cdn/shop/files/fragrance-bundle-sleek-and-clean-3751514.png?v=1768068487&width=800",
};

function resolveProductImage(name: string, originalImage: string): string {
  const n = name.toLowerCase();
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (n.includes(key.replace(/-/g, " "))) return url;
  }
  // Fallback: if the original image is already from profparfums.store, use it
  if (originalImage.includes("profparfums.store")) return originalImage;
  return originalImage;
}

const PRODUCT_LINKS: Record<string, string> = {
  "stronger-with-you-absolutely": "https://litbuy.shop/lit/nOAwjxV0",
  "stronger-with-you": "https://litbuy.shop/lit/nOAwjxV0",
  "aventus": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661817242&affcode=c5v3b",
  "born-in-roma-intense": "https://litbuy.com/product/0/942511489889?inviteCode=4W9SCOLDU",
  "born-in-roma-green-stravaganza": "https://litbuy.com/product/0/942511489889?inviteCode=4W9SCOLDU",
  "born-in-roma-coral-fantasy": "https://litbuy.com/product/0/942511489889?inviteCode=4W9SCOLDU",
  "born-in-roma": "https://litbuy.com/product/0/942511489889?inviteCode=4W9SCOLDU",
  "valentino": "https://litbuy.com/product/0/942511489889?inviteCode=4W9SCOLDU",
  "louis-vuitton": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661789506&affcode=c5v3b",
  "xerjoff": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7662173327&affcode=c5v3b",
  "eros": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7665241752&affcode=c5v3b",
  "dior": "https://m.kakobuy.com/pages/goods-detail/goods-detail?url=https%3A%2F%2Fweidian.com%2Fitem.html%3FitemID%3D7661870378&affcode=c5v3b",
  "parfums-de-marly": "https://m.orientdig.com/pages/product/product?id=857200052892&shoptype=ALI_1688&ref=100144636",
  "jean-paul-gaultier": "https://litbuy.shop/lit/JeaFpAPH",
  "lattafa": "https://litbuy.shop/lit/XVWEmSku",
  "azzaro": "https://litbuy.shop/lit/hVExk1tS",
  "mancera": "https://litbuy.shop/lit/qYJ4Tj6g",
};

function getProductLink(name: string, brand: string): string {
  const n = name.toLowerCase();
  const b = brand.toLowerCase();
  if (n.includes("stronger with you absolutely")) return PRODUCT_LINKS["stronger-with-you-absolutely"];
  if (n.includes("stronger with you")) return PRODUCT_LINKS["stronger-with-you"];
  if (n.includes("aventus")) return PRODUCT_LINKS["aventus"];
  if (n.includes("born in roma intense")) return PRODUCT_LINKS["born-in-roma-intense"];
  if (n.includes("born in roma green stravaganza")) return PRODUCT_LINKS["born-in-roma-green-stravaganza"];
  if (n.includes("born in roma coral fantasy")) return PRODUCT_LINKS["born-in-roma-coral-fantasy"];
  if (n.includes("born in roma")) return PRODUCT_LINKS["born-in-roma"];
  if (b.includes("valentino")) return PRODUCT_LINKS["valentino"];
  if (b.includes("louis vuitton")) return PRODUCT_LINKS["louis-vuitton"];
  if (b.includes("xerjoff")) return PRODUCT_LINKS["xerjoff"];
  if (n.includes("eros")) return PRODUCT_LINKS["eros"];
  if (b.includes("dior")) return PRODUCT_LINKS["dior"];
  if (b.includes("parfums de marly")) return PRODUCT_LINKS["parfums-de-marly"];
  if (b.includes("jean paul gaultier")) return PRODUCT_LINKS["jean-paul-gaultier"];
  if (b.includes("lattafa")) return PRODUCT_LINKS["lattafa"];
  if (b.includes("azzaro")) return PRODUCT_LINKS["azzaro"];
  if (b.includes("mancera")) return PRODUCT_LINKS["mancera"];
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

const BUNDLE_BONUS_LINKS: Record<string, { label: string; url: string }[]> = {
  "evening-sweetheart": [
    { label: "JPG Le Male Elixir", url: PRODUCT_LINKS["jean-paul-gaultier"] },
    { label: "Azzaro The Most Wanted Parfum", url: PRODUCT_LINKS["azzaro"] },
  ],
  "young-playboy": [
    { label: "JPG Le Male Elixir", url: PRODUCT_LINKS["jean-paul-gaultier"] },
  ],
};

function getBundleBonusLinks(name: string): { label: string; url: string }[] {
  const n = name.toLowerCase();
  if (n.includes("evening sweetheart")) return BUNDLE_BONUS_LINKS["evening-sweetheart"];
  if (n.includes("young playboy")) return BUNDLE_BONUS_LINKS["young-playboy"];
  return [];
}

function buildItemRow(item: OrderItem, origin: string, noLinks: boolean = false): string {
  const rawImage = item.image.startsWith("http")
    ? item.image
    : origin + (item.image.startsWith("/") ? "" : "/") + item.image;
  const imageUrl = resolveProductImage(item.name, rawImage);
  const mlLabel = item.selectedMl ? " \u2014 " + item.selectedMl + "ml" : "";
  const itemTotal = (item.price * item.quantity).toFixed(2);

  if (noLinks) {
    // Rewarble orders: images only, no links
    return [
      '<tr>',
      '<td style="padding: 16px 0; border-bottom: 1px solid #eee; vertical-align: top;">',
      '<table cellpadding="0" cellspacing="0" border="0"><tr>',
      '<td style="width: 80px; vertical-align: top;">',
      '<img src="' + imageUrl + '" alt="' + item.name + '" width="72" height="72" style="display: block; border-radius: 8px; object-fit: cover; border: 1px solid #eee;" />',
      '</td>',
      '<td style="padding-left: 16px; vertical-align: top; font-family: Helvetica Neue, Arial, sans-serif;">',
      '<div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 4px;">' + item.brand + '</div>',
      '<div style="font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">' + item.name + mlLabel + '</div>',
      '<div style="font-size: 13px; color: #666; margin-bottom: 8px;">Qty: ' + item.quantity + ' &middot; &euro;' + itemTotal + '</div>',
      '</td></tr></table>',
      '</td></tr>',
    ].join("\n");
  }

  const productLink = getProductLink(item.name, item.brand);

  const bonusLinks = getBundleBonusLinks(item.name);
  const bonusHtml = bonusLinks.map((b) =>
    '<a href="' + b.url + '" style="font-size: 13px; color: #c9a96e; text-decoration: underline; font-weight: 500; display: inline-block; margin-left: 12px;">&#128279; ' + b.label + '</a>'
  ).join("");

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
    '<div style="font-size: 13px; color: #666; margin-bottom: 8px;">Qty: ' + item.quantity + ' &middot; &euro;' + itemTotal + '</div>',
    '<a href="' + productLink + '" style="font-size: 13px; color: #c9a96e; text-decoration: underline; font-weight: 500;">&#128279; View your seller link</a>' + bonusHtml,
    '</td></tr></table>',
    '</td></tr>',
  ].join("\n");
}

function buildEmailHtml(
  customerName: string,
  itemsHtml: string,
  totalAmount: string,
  shippingAddress: { line1: string; city: string; postalCode: string; country: string },
  orderNumber?: number | null,
  noLinks: boolean = false,
): string {
  const year = new Date().getFullYear();
  const orderNumDisplay = orderNumber ? `#${orderNumber}` : "";
  const orderNumSection = orderNumber
    ? `<p style="font-size: 13px; color: #999; margin: 0 0 8px 0;">Order Number: <strong style="color: #1a1a1a; font-size: 15px;">#${orderNumber}</strong></p>`
    : "";
  return [
    '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>',
    '<body style="margin: 0; padding: 0; background-color: #f4f3ef; font-family: Helvetica Neue, Arial, sans-serif;">',
    '<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">',

    '<div style="background-color: #1a1a1a; padding: 36px 32px; text-align: center;">',
    '<h1 style="color: #c9a96e; font-size: 26px; font-weight: 300; letter-spacing: 5px; margin: 0; text-transform: uppercase;">ProfParfums</h1>',
    '<p style="color: #666; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0 0; text-transform: uppercase;">Premium Fragrances</p>',
    '</div>',

    '<div style="background: linear-gradient(135deg, #c9a96e 0%, #b8944f 100%); padding: 28px 32px; text-align: center;">',
    '<h2 style="color: #ffffff; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 1px;">Your Order Has Been Approved! &#127881;</h2>',
    '</div>',

    '<div style="background-color: #1a1a1a; padding: 28px 32px; text-align: center; border-bottom: 3px solid #c9a96e;">',
    '<h2 style="color: #c9a96e; font-size: 22px; font-weight: 600; margin: 0 0 6px 0; letter-spacing: 1px;">Thank you for your purchase!</h2>',
    '<h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0 0 14px 0;">&#127873; Special Offer!</h2>',
    '<p style="color: #ffffff; font-size: 16px; margin: 0 0 6px 0; line-height: 1.5;">Use code <span style="background-color: #c9a96e; color: #1a1a1a; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 18px; letter-spacing: 1px;">Parfumz50</span> for <strong>50% off</strong> your next order</p>',
    '<p style="color: #ccc; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">Valid for 24 hours only &#9200;<br><span style="color: #999; font-size: 11px;">(Valid for short time only in order to avoid order hoarding. Code can be used for multiple orders)</span></p>',
    '</div>',

    '<div style="padding: 32px 32px 0 32px;">',
    orderNumSection,
    '<p style="font-size: 15px; color: #333; margin: 0 0 6px 0; line-height: 1.6;">Hi <strong>' + customerName + '</strong>,</p>',
    '<p style="font-size: 14px; color: #666; margin: 0 0 24px 0; line-height: 1.6;">Your order has been confirmed! Below you\'ll find your products.' + (noLinks ? '' : ' Click on any product to access it.') + '</p>',
    '</div>',

    '<div style="padding: 0 32px;">',
    '<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; padding-bottom: 12px; border-bottom: 2px solid #1a1a1a; margin-bottom: 0;">Your Products</div>',
    '<table style="width: 100%; border-collapse: collapse;"><tbody>',
    itemsHtml,
    '</tbody></table></div>',

    '<div style="padding: 20px 32px; margin: 0 32px; border-top: 2px solid #1a1a1a; text-align: right;">',
    '<span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Total Paid: </span>',
    '<span style="font-size: 22px; font-weight: 600; color: #1a1a1a;">&euro;' + totalAmount + '</span>',
    '</div>',

    '<div style="padding: 0 32px 32px 32px;">',
    '<div style="background-color: #faf9f6; border: 1px solid #eee; padding: 20px 24px; border-radius: 8px; text-align: center;">',
    '<p style="font-size: 13px; color: #666; margin: 0; line-height: 1.6;">Questions about your order? Contact us at<br>',
    '<a href="mailto:support@profparfums.com" style="color: #c9a96e; text-decoration: none; font-weight: 500;">support@profparfums.com</a>' + (orderNumber ? '<br><span style="font-size: 12px; color: #999;">Please include your order number: <strong>#' + orderNumber + '</strong></span>' : '') + '</p>',
    '</div></div>',

    '<div style="background-color: #1a1a1a; padding: 28px 32px; text-align: center;">',
    '<p style="color: #c9a96e; font-size: 14px; letter-spacing: 3px; margin: 0 0 8px 0; text-transform: uppercase;">ProfParfums</p>',
    '<p style="color: #666; font-size: 11px; margin: 0; line-height: 1.8;">&copy; ' + year + ' ProfParfums. All rights reserved.<br>',
    '<a href="https://profparfums.lovable.app" style="color: #888; text-decoration: none;">profparfums.lovable.app</a></p>',
    '</div>',

    '</div></body></html>',
  ].join("\n");
}

const ADMIN_EMAIL = "ewhz3384@gmail.com";

function buildAdminInvoiceHtml(
  customerName: string,
  customerEmail: string,
  items: OrderItem[],
  totalAmount: string,
  billingAddress: { line1: string; city: string; postalCode: string; country: string },
  paymentMethod: string,
): string {
  const year = new Date().getFullYear();
  const now = new Date();
  const orderDate = now.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Amsterdam" });
  const invoiceNo = "INV-" + now.getFullYear() + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0") + "-" + String(now.getHours()).padStart(2, "0") + String(now.getMinutes()).padStart(2, "0") + String(now.getSeconds()).padStart(2, "0");
  const addressText = [billingAddress.line1, billingAddress.city, billingAddress.postalCode, billingAddress.country].filter(Boolean).join(", ") || "N/A";

  const itemRows = items.map((item, i) => {
    const mlLabel = item.selectedMl ? ` — ${item.selectedMl}ml` : "";
    const lineTotal = (item.price * item.quantity).toFixed(2);
    const bg = i % 2 === 0 ? "#ffffff" : "#fafaf8";
    return `<tr style="background:${bg};">
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;color:#333;">${item.brand} — ${item.name}${mlLabel}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:center;color:#333;">${item.quantity}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:right;color:#333;">€${item.price.toFixed(2)}</td>
      <td style="padding:12px 10px;border-bottom:1px solid #f0ede8;font-size:13px;text-align:right;color:#333;font-weight:500;">€${lineTotal}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Helvetica Neue,Arial,sans-serif;">
<div style="max-width:680px;margin:0 auto;background:#fff;border-radius:0;overflow:hidden;border:1px solid #e8e5df;">

  <!-- Header -->
  <div style="background:#1a1a1a;padding:32px 40px;display:flex;justify-content:space-between;">
    <table style="width:100%;"><tr>
      <td style="vertical-align:top;">
        <h1 style="color:#c9a96e;font-size:24px;font-weight:300;letter-spacing:5px;margin:0;text-transform:uppercase;">ProfParfums</h1>
        <p style="color:#666;font-size:11px;letter-spacing:2px;margin:6px 0 0;text-transform:uppercase;">Premium Fragrances</p>
      </td>
      <td style="vertical-align:top;text-align:right;">
        <p style="color:#c9a96e;font-size:20px;font-weight:300;letter-spacing:3px;margin:0;text-transform:uppercase;">Invoice</p>
      </td>
    </tr></table>
  </div>

  <!-- Invoice Meta -->
  <div style="padding:28px 40px 0;border-bottom:1px solid #f0ede8;">
    <table style="width:100%;margin-bottom:24px;">
      <tr>
        <td style="vertical-align:top;width:50%;">
          <p style="font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#999;margin:0 0 6px;">Bill To</p>
          <p style="font-size:15px;font-weight:600;color:#1a1a1a;margin:0 0 4px;">${customerName}</p>
          <p style="font-size:13px;color:#666;margin:0 0 2px;">${customerEmail}</p>
          <p style="font-size:13px;color:#666;margin:0;">${addressText}</p>
        </td>
        <td style="vertical-align:top;text-align:right;">
          <table style="margin-left:auto;">
            <tr><td style="padding:2px 0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;padding-right:12px;">Invoice No.</td><td style="padding:2px 0;font-size:13px;color:#1a1a1a;font-weight:500;">${invoiceNo}</td></tr>
            <tr><td style="padding:2px 0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;padding-right:12px;">Date</td><td style="padding:2px 0;font-size:13px;color:#1a1a1a;">${orderDate}</td></tr>
            <tr><td style="padding:2px 0;font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#999;padding-right:12px;">Payment</td><td style="padding:2px 0;font-size:13px;color:#1a1a1a;font-weight:500;">${paymentMethod}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Items Table -->
  <div style="padding:24px 40px;">
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="background:#1a1a1a;">
          <th style="padding:10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Description</th>
          <th style="padding:10px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Qty</th>
          <th style="padding:10px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Unit Price</th>
          <th style="padding:10px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c9a96e;font-weight:500;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Totals -->
    <table style="width:100%;margin-top:0;">
      <tr>
        <td style="width:60%;"></td>
        <td style="padding:16px 10px 6px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#999;">Subtotal</td>
        <td style="padding:16px 10px 6px;text-align:right;font-size:14px;color:#333;">€${totalAmount}</td>
      </tr>
      <tr>
        <td></td>
        <td style="padding:6px 10px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:1.5px;color:#999;">Tax (0%)</td>
        <td style="padding:6px 10px;text-align:right;font-size:14px;color:#333;">€0.00</td>
      </tr>
      <tr>
        <td></td>
        <td style="padding:12px 10px;text-align:right;font-size:13px;text-transform:uppercase;letter-spacing:1.5px;color:#1a1a1a;font-weight:700;border-top:2px solid #1a1a1a;">Total Due</td>
        <td style="padding:12px 10px;text-align:right;font-size:20px;color:#1a1a1a;font-weight:700;border-top:2px solid #1a1a1a;">€${totalAmount}</td>
      </tr>
    </table>
  </div>

  <!-- Notes -->
  <div style="padding:0 40px 28px;">
    <div style="background:#faf9f6;border-left:3px solid #c9a96e;padding:16px 20px;">
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin:0 0 6px;font-weight:600;">Notes & Terms</p>
      <p style="font-size:12px;color:#666;margin:0;line-height:1.7;">Digital product — no physical shipment. This invoice serves as proof of transaction for dispute purposes. Customer agreed to terms of service at checkout. All order timestamps and details are logged server-side.</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#1a1a1a;padding:24px 40px;text-align:center;">
    <p style="color:#c9a96e;font-size:13px;letter-spacing:3px;margin:0 0 6px;text-transform:uppercase;">ProfParfums</p>
    <p style="color:#666;font-size:11px;margin:0;line-height:1.6;">© ${year} ProfParfums. All rights reserved.<br>
    <a href="mailto:support@profparfums.com" style="color:#888;text-decoration:none;">support@profparfums.com</a></p>
  </div>

</div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, htmlContent: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ProfParfums <orders@profparfum.com>",
      to: [to],
      subject,
      html: htmlContent,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error("Resend API error (" + res.status + "): " + errBody);
  }

  console.log("Email sent via Resend to:", to);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    let { orderItems, customerEmail, customerName, shippingAddress, totalAmount, orderNumber, paymentMethod } = body as {
      orderItems: (OrderItem | { product: { name: string; brand: string; image: string; price: number }; quantity: number; selectedMl?: number; selectedPrice?: number })[];
      customerEmail: string;
      customerName: string;
      shippingAddress: { line1: string; city: string; postalCode: string; country: string };
      totalAmount: string;
      orderNumber?: number | null;
      paymentMethod?: string;
    };

    if (!customerEmail) throw new Error("Customer email is required");
    if (!orderItems || orderItems.length === 0) throw new Error("No order items");

    const normalizedItems: OrderItem[] = orderItems.map((item: any) => {
      if (item.product) {
        return {
          name: item.product.name,
          brand: item.product.brand,
          image: item.product.image,
          price: item.selectedPrice || item.product.price,
          quantity: item.quantity,
          selectedMl: item.selectedMl,
        };
      }
      return item as OrderItem;
    });

    const calculatedTotal = totalAmount || normalizedItems.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

    const origin = "https://profparfums.lovable.app";
    const isRewarble = paymentMethod === "rewarble";
    const itemsHtml = normalizedItems.map((item: OrderItem) => buildItemRow(item, origin, isRewarble)).join("");

    const html = buildEmailHtml(customerName || "Valued Customer", itemsHtml, calculatedTotal, shippingAddress || { line1: "", city: "", postalCode: "", country: "" }, orderNumber, isRewarble);

    const emailSubject = orderNumber ? `Order #${orderNumber} Confirmed - ProfParfums` : "Order Confirmed - ProfParfums";
    await sendEmail(customerEmail, emailSubject, html);

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
