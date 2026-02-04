const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background py-20">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-8">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mb-12">
            Last updated: February 2026
          </p>

          <div className="space-y-8 text-foreground">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                At ProfParfums, we are committed to protecting your privacy. This Privacy Policy explains 
                how we collect, use, disclose, and safeguard your information when you visit our website 
                or make a purchase through our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect information about you in various ways, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and billing information</li>
                <li><strong>Transaction Data:</strong> Details about purchases and orders</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                <li><strong>Usage Data:</strong> How you interact with our website</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for various purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>To process and fulfill your orders</li>
                <li>To send you seller information after purchase</li>
                <li>To communicate with you about your account or transactions</li>
                <li>To send promotional emails (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To detect and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>With Sellers:</strong> Your contact information may be shared with verified sellers to complete transactions</li>
                <li><strong>Service Providers:</strong> We may share data with third-party vendors who perform services on our behalf</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your 
                personal information. However, no method of transmission over the Internet is 100% secure, 
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our website. 
                Cookies help us understand how you use our site and allow us to remember your preferences. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Right to access your personal information</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to request deletion of your data</li>
                <li>Right to object to processing</li>
                <li>Right to data portability</li>
                <li>Right to withdraw consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">8. Third-Party Links</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the 
                privacy practices or content of these external sites. We encourage you to review the 
                privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">9. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not intended for individuals under the age of 18. We do not knowingly 
                collect personal information from children. If we become aware that we have collected 
                data from a minor, we will take steps to delete that information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">10. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions or concerns about this Privacy Policy, please contact us through 
                our Contact page or email us at privacy@profparfums.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
