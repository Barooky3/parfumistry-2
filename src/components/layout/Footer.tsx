import { Link } from 'react-router-dom';

const footerLinks = {
  shop: [
    { label: 'All Fragrances', href: '/shop' },
    { label: 'For Him', href: '/shop/men' },
    { label: 'For Her', href: '/shop/women' },
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/#faq' },
  ],
  account: [
    { label: 'Login', href: '/login' },
    { label: 'Register', href: '/signup' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <span className="text-xl font-semibold tracking-[0.15em] uppercase">
                ProfParfums
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/70 leading-relaxed">
              Premium fragrance seller links. Instant digital delivery.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-5">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-5">
              Support
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.15em] uppercase mb-5">
              Account
            </h4>
            <ul className="space-y-3">
              {footerLinks.account.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary-foreground/10 mt-14 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} ProfParfums. All rights reserved.
            </p>
            <p className="text-xs text-primary-foreground/40">
              We provide access to verified fragrance seller links.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
