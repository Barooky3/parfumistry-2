import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Shop All' },
  { href: '/shop/men', label: 'For Him' },
  { href: '/shop/women', label: 'For Her' },
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
        'fixed top-[42px] left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border'
          : 'bg-transparent'
      )}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>

          {/* Desktop Navigation - Left */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(0, 3).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary',
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Logo - Center */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mx-8">
            <span className="font-serif text-2xl lg:text-3xl font-semibold tracking-tight">
              <span className="text-foreground">Prof</span>
              <span className="text-gold-gradient">Parfums</span>
            </span>
          </Link>

          {/* Desktop Navigation - Right */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.slice(3).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium uppercase tracking-wider transition-colors hover:text-primary',
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-foreground/80'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-foreground hover:text-primary"
              onClick={toggleCart}
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 top-[calc(42px+64px)] bg-background border-b border-border transition-all duration-300 overflow-hidden',
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="container py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                'text-base font-medium uppercase tracking-wider py-3 px-4 rounded-lg transition-colors',
                location.pathname === link.href
                  ? 'text-primary bg-primary/10'
                  : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
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
