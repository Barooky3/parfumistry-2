const EmailPreview = () => {
  const year = new Date().getFullYear();

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 20px; background-color: #f4f3ef; font-family: Helvetica Neue, Arial, sans-serif;">
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

<div style="background-color: #1a1a1a; padding: 36px 32px; text-align: center;">
<h1 style="color: #c9a96e; font-size: 26px; font-weight: 300; letter-spacing: 5px; margin: 0; text-transform: uppercase;">ProfParfums</h1>
<p style="color: #666; font-size: 12px; letter-spacing: 2px; margin: 8px 0 0 0; text-transform: uppercase;">Premium Fragrances</p>
</div>

<div style="background: linear-gradient(135deg, #c9a96e 0%, #b8944f 100%); padding: 28px 32px; text-align: center;">
<h2 style="color: #ffffff; font-size: 22px; font-weight: 400; margin: 0; letter-spacing: 1px;">Your Order Has Been Confirmed! 🎉</h2>
</div>

<div style="background-color: #1a1a1a; padding: 28px 32px; text-align: center; border-bottom: 3px solid #c9a96e;">
<h2 style="color: #c9a96e; font-size: 22px; font-weight: 600; margin: 0 0 6px 0; letter-spacing: 1px;">Thank you for your purchase!</h2>
<h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin: 0 0 14px 0;">🎁 Special Offer!</h2>
<p style="color: #ffffff; font-size: 16px; margin: 0 0 6px 0; line-height: 1.5;">Use code <span style="background-color: #c9a96e; color: #1a1a1a; padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 18px; letter-spacing: 1px;">Parfumz50</span> for <strong>50% off</strong> your next order</p>
<p style="color: #ccc; font-size: 13px; margin: 8px 0 0 0; line-height: 1.5;">Valid for 24 hours only ⏰<br><span style="color: #bbb; font-size: 13px;">(Valid for short time only in order to avoid order hoarding. Code can be used for multiple orders)</span></p>
</div>

<div style="padding: 32px 32px 0 32px;">
<p style="font-size: 13px; color: #999; margin: 0 0 8px 0;">Order Number: <strong style="color: #1a1a1a; font-size: 15px;">#1042</strong></p>
<p style="font-size: 15px; color: #333; margin: 0 0 6px 0; line-height: 1.6;">Hi <strong>John</strong>,</p>
<div style="background-color: #faf9f6; border: 2px solid #c9a96e; padding: 16px 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
<p style="font-size: 16px; color: #1a1a1a; margin: 0; font-weight: 500; line-height: 1.6;">📦 Your order has been confirmed and is being prepared for shipment. You will receive your <strong>DHL</strong> tracking number within <strong>2 business days</strong>.</p>
</div>
</div>

<div style="padding: 0 32px;">
<div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; padding-bottom: 12px; border-bottom: 2px solid #1a1a1a; margin-bottom: 0;">Your Products</div>
<table style="width: 100%; border-collapse: collapse;"><tbody>

<tr>
<td style="padding: 16px 0; border-bottom: 1px solid #eee; vertical-align: top;">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width: 80px; vertical-align: top;">
<img src="https://profparfums.store/cdn/shop/files/dior-sauvage-3604373.png?v=1768068546&width=800" alt="Sauvage Parfum" width="72" height="72" style="display: block; border-radius: 8px; object-fit: cover; border: 1px solid #eee;" />
</td>
<td style="padding-left: 16px; vertical-align: top; font-family: Helvetica Neue, Arial, sans-serif;">
<div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 4px;">Dior</div>
<div style="font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">Sauvage Parfum — 50ml</div>
<div style="font-size: 13px; color: #666; margin-bottom: 8px;">Qty: 1 · €32.00</div>
</td></tr></table>
</td></tr>

<tr>
<td style="padding: 16px 0; border-bottom: 1px solid #eee; vertical-align: top;">
<table cellpadding="0" cellspacing="0" border="0"><tr>
<td style="width: 80px; vertical-align: top;">
<img src="https://profparfums.store/cdn/shop/files/mancera-cedrat-boise-8376726.png?v=1768068547&width=800" alt="Cedrat Boisé" width="72" height="72" style="display: block; border-radius: 8px; object-fit: cover; border: 1px solid #eee;" />
</td>
<td style="padding-left: 16px; vertical-align: top; font-family: Helvetica Neue, Arial, sans-serif;">
<div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 4px;">Mancera</div>
<div style="font-size: 15px; font-weight: 500; color: #1a1a1a; margin-bottom: 4px;">Cedrat Boisé — 50ml</div>
<div style="font-size: 13px; color: #666; margin-bottom: 8px;">Qty: 1 · €30.00</div>
</td></tr></table>
</td></tr>

</tbody></table></div>

<div style="padding: 20px 32px; margin: 0 32px; border-top: 2px solid #1a1a1a; text-align: right;">
<span style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999;">Total Paid: </span>
<span style="font-size: 22px; font-weight: 600; color: #1a1a1a;">€62.00</span>
</div>

<div style="padding: 0 32px 24px 32px;">
<div style="background-color: #faf9f6; border: 1px solid #eee; padding: 20px 24px; border-radius: 8px;">
<p style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin: 0 0 12px 0;">Shipping Address</p>
<p style="font-size: 14px; color: #333; margin: 0 0 4px 0; line-height: 1.5;">123 Main Street</p>
<p style="font-size: 14px; color: #333; margin: 0 0 4px 0; line-height: 1.5;">Amsterdam, 1012AB</p>
<p style="font-size: 14px; color: #333; margin: 0; line-height: 1.5;">Netherlands</p>
</div>
</div>

<div style="padding: 0 32px; margin-bottom: 24px;">
<div style="background-color: #f0f7f0; border: 1px solid #d4e8d4; padding: 16px 24px; border-radius: 8px; text-align: center;">
<p style="font-size: 14px; color: #2d6a2d; margin: 0; font-weight: 500;">🚚 Shipping via DHL<br>EU &amp; UK: 4–6 business days · Rest of World: 6–8 business days</p>
</div></div>

<div style="padding: 0 32px 32px 32px;">
<div style="background-color: #faf9f6; border: 1px solid #eee; padding: 20px 24px; border-radius: 8px; text-align: center;">
<p style="font-size: 13px; color: #666; margin: 0; line-height: 1.6;">Questions about your order? Contact us at<br>
<a href="mailto:support@profparfums.com" style="color: #c9a96e; text-decoration: none; font-weight: 500;">support@profparfums.com</a><br><span style="font-size: 12px; color: #999;">Please include your order number: <strong>#1042</strong></span></p>
</div></div>

<div style="background-color: #1a1a1a; padding: 28px 32px; text-align: center;">
<p style="color: #c9a96e; font-size: 14px; letter-spacing: 3px; margin: 0 0 8px 0; text-transform: uppercase;">ProfParfums</p>
<p style="color: #666; font-size: 11px; margin: 0; line-height: 1.8;">© ${year} ProfParfums. All rights reserved.<br>
<a href="https://profparfums.lovable.app" style="color: #888; text-decoration: none;">profparfums.lovable.app</a></p>
</div>

</div></body></html>`;

  return (
    <div className="min-h-screen bg-muted p-4">
      <div className="max-w-[650px] mx-auto">
        <h1 className="font-display text-2xl text-foreground mb-4 text-center">Email Preview</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">This is how the order confirmation email will look to customers.</p>
        <div 
          className="rounded-lg overflow-hidden shadow-xl"
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      </div>
    </div>
  );
};

export default EmailPreview;
