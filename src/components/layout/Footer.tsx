import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const footerLinks = {
  shop: [
    { href: '/shop', label: 'All Fragrances' },
    { href: '/shop/men', label: "Men's Collection" },
    { href: '/shop/women', label: "Women's Collection" },
  ],
  support: [
    { href: '/contact', label: 'Contact Us' },
    { href: '/contact', label: 'Privacy Policy' },
    { href: '/contact', label: 'Terms of Service' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl text-foreground mb-1">Join the ProfParfums Family</h3>
              <p className="text-sm text-muted-foreground">Get exclusive offers, new arrivals & insider deals</p>
            </div>
            <form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 h-11 px-4 bg-secondary text-foreground text-sm rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />
              <Button type="submit" className="h-11 px-6 font-medium">
                Subscribe Now
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-lg font-semibold tracking-[0.15em] text-foreground">
                PROFPARFUMS
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Premium fragrance seller links. Authentic quality, instant digital delivery.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase text-primary mb-4">Shop</h4>
            <ul className="space-y-3">
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
            <h4 className="text-xs font-medium tracking-wider uppercase text-primary mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, i) => (
                <li key={link.href + i}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stay Updated */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase text-primary mb-4">Stay Updated</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe for exclusive offers and new arrivals.
            </p>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link to="/shop">
                Shop Now
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} ProfParfums. All rights reserved. We provide access to verified fragrance seller links.
          </p>
        </div>
      </div>
    </footer>
  );
};
