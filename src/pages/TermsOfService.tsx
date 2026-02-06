const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-4 text-center">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-12 text-center">
            Last updated: February 2026
          </p>

          <div className="space-y-10 text-foreground">
            <section>
              <h2 className="font-display text-2xl mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using ProfParfums, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">2. Nature of Products</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                ProfParfums sells digital products in the form of links to third-party fragrance sellers. When you make a purchase:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>You receive access to seller links, not physical products</li>
                <li>The actual fragrance purchase is made directly with third-party sellers</li>
                <li>ProfParfums is not responsible for products sold by third-party sellers</li>
                <li>Delivery times and policies are determined by the third-party sellers</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">3. No Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Due to the digital nature of our products, all sales are final. Once you receive access to seller links, no refunds or exchanges will be provided. Please ensure you understand what you are purchasing before completing your transaction.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">4. Account Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you create an account with us:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for all activities under your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">5. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on ProfParfums, including but not limited to text, graphics, logos, images, and software, is the property of ProfParfums or its content suppliers and is protected by international copyright laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">6. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service provides links to third-party sellers. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. Your interactions with third-party sellers are solely between you and the seller.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                ProfParfums shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. This includes damages for loss of profits, data, or other intangible losses.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">8. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">9. Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the European Union. Any disputes arising from these terms shall be resolved in the appropriate courts of the EU.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting on this page. Your continued use of the service after any changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our Contact page. We will respond to your inquiry as soon as possible.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
