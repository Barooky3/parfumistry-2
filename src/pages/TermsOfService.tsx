const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-8">
            Terms of Service
          </h1>
          <p className="text-muted-foreground mb-12">
            Last updated: February 2026
          </p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to ProfParfums. These Terms of Service govern your use of our website and services. 
                By accessing or using our platform, you agree to be bound by these terms. If you do not agree 
                with any part of these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Services Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                ProfParfums provides access to verified fragrance seller links. We act as an intermediary 
                connecting buyers with trusted fragrance sellers. Upon purchase, you will receive seller 
                information via email for direct contact and transaction completion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To use certain features of our platform, you may need to create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Updating your information as necessary</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Purchases and Payments</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                All purchases made through ProfParfums are final. By making a purchase, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Pay all charges at the prices listed at the time of purchase</li>
                <li>Provide valid payment information</li>
                <li>Receive seller information via the email address provided</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Refund Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer a satisfaction guarantee. If you experience any issues with your purchase, 
                please contact our support team within 14 days of purchase. Refund requests will be 
                reviewed on a case-by-case basis.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on ProfParfums, including text, graphics, logos, and images, is the property 
                of ProfParfums or its content suppliers and is protected by intellectual property laws. 
                You may not reproduce, distribute, or create derivative works without our express permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                ProfParfums shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use of our services. Our total liability shall not 
                exceed the amount paid by you for the specific service giving rise to the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Modifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be effective 
                immediately upon posting to the website. Your continued use of our services after changes 
                constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about these Terms of Service, please contact us through our 
                Contact page or email us directly at support@profparfums.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
