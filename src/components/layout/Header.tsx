import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop' },
  { href: '/shop/men', label: 'Men' },
  { href: '/shop/women', label: 'Women' },
  { href: '/contact', label: 'Contact' },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <header
      className={cn(
        'fixed top-[38px] left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/50'
          : 'bg-background/60 backdrop-blur-md'
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              ProfParfums
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-xs font-medium transition-colors hover:text-foreground',
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
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-foreground hover:bg-transparent hover:text-primary"
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 text-foreground hover:bg-transparent"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden fixed inset-x-0 top-[86px] bg-background/95 backdrop-blur-xl border-b border-border transition-all duration-300 overflow-hidden',
          isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="container py-4 flex flex-col">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-sm font-medium py-3 transition-colors',
                location.pathname === link.href
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
