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
  ],
  legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <span className="text-xl font-bold tracking-tight">
                PROFPARFUMS
              </span>
            </Link>
            <p className="text-sm text-background/60 mb-6 max-w-xs leading-relaxed">
              Premium fragrance seller links. Authentic quality, instant digital delivery.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium">Stay updated</p>
              <form className="flex gap-2 max-w-xs">
                <Input
                  type="email"
                  placeholder="Email"
                  className="h-9 bg-background text-foreground text-sm rounded-none border-0"
                />
                <Button type="submit" size="sm" className="h-9 px-4 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-black rounded-none">
                  Join
                </Button>
              </form>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Shop</h4>
            <ul className="space-y-2.5">
              {footerLinks.shop.map((link, i) => (
                <li key={link.href + i}>
                  <Link to={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link, i) => (
                <li key={link.href + i}>
                  <Link to={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-background/60 hover:text-background transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-background/10">
          <p className="text-xs text-background/40 text-center">
            © {new Date().getFullYear()} ProfParfums. All rights reserved. We provide access to verified fragrance seller links.
          </p>
        </div>
      </div>
    </footer>
  );
};
