import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const footerLinks = {
  shop: [
    { href: '/shop', label: 'All Fragrances' },
    { href: '/shop/men', label: 'For Him' },
    { href: '/shop/women', label: 'For Her' },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/contact', label: 'FAQ' },
    { href: '/contact', label: 'Shipping' },
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-lg font-semibold tracking-tight text-foreground">
                ProfParfums
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
              Premium fragrances at unbeatable prices. Authentic quality, worldwide delivery.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Stay updated</p>
              <form className="flex gap-2 max-w-xs">
                <Input
                  type="email"
                  placeholder="Email"
                  className="h-9 bg-background text-sm"
                />
                <Button type="submit" size="sm" className="h-9 px-4 text-sm font-medium">
                  Join
                </Button>
              </form>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link) => (
                <li key={link.href + link.label}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link, i) => (
                <li key={link.href + i}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} ProfParfums. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
