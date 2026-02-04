import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/shop/men', label: 'MEN' },
  { href: '/shop/women', label: 'WOMEN' },
  { href: '/shop', label: 'SHOP ALL' },
  { href: '/contact', label: 'CONTACT' },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header className="fixed top-[38px] left-0 right-0 z-40 bg-background border-b border-border">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-semibold tracking-[0.15em] text-foreground uppercase">
              ProfParfums
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-xs font-medium tracking-[0.15em] transition-colors hover:text-accent',
                  location.pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Account */}
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-foreground hover:text-accent hover:bg-transparent"
              asChild
            >
              <Link to="/login" aria-label="Account">
                <User className="h-5 w-5" strokeWidth={1.5} />
              </Link>
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 text-foreground hover:text-accent hover:bg-transparent"
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 text-foreground hover:text-accent hover:bg-transparent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden absolute left-0 right-0 top-full bg-background border-b border-border transition-all duration-300 overflow-hidden',
          isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="container py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium tracking-[0.1em] py-3 transition-colors border-b border-border',
                location.pathname === link.href
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/login"
            className="text-sm font-medium tracking-[0.1em] py-3 text-muted-foreground hover:text-foreground"
          >
            ACCOUNT
          </Link>
        </nav>
      </div>
    </header>
  );
};
