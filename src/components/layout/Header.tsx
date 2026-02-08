import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, ChevronDown, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/contexts/CartContext';
import { useCurrency, CURRENCIES, Currency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { toggleCart, totalItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close currency dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        "fixed left-0 right-0 z-40 border-b transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-border"
          : "bg-transparent border-transparent"
      )}
      style={{
        top: 'var(--promo-banner-height, 0px)',
        transition: 'top 0.3s ease-out'
      }}
    >
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className={cn(
              "text-xl font-semibold tracking-[0.15em] uppercase transition-colors duration-300",
              isScrolled ? "text-foreground" : "text-white"
            )}>
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
                  'text-xs font-medium tracking-[0.15em] transition-colors',
                  isScrolled
                    ? location.pathname === link.href ? 'text-foreground hover:text-accent' : 'text-muted-foreground hover:text-accent'
                    : 'text-white/80 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Currency Dropdown - aromaeu style */}
            <div ref={currencyRef} className="relative hidden md:block mr-1">
              <button
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-xs font-medium transition-colors", isScrolled ? "border-border text-foreground hover:border-foreground/50" : "border-white/30 text-white hover:border-white/60")}
              >
                {currency}
                <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', currencyOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {currencyOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 bg-background border border-border rounded-sm shadow-lg z-50 max-h-64 overflow-y-auto min-w-[100px]"
                  >
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center gap-2',
                          currency === c.code
                            ? 'bg-secondary text-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        )}
                      >
                        <span>{c.symbol}</span>
                        <span>{c.code}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Account */}
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10 hover:bg-transparent transition-colors", isScrolled ? "text-accent hover:text-accent" : "text-white hover:text-white/80")}
                asChild
              >
                <Link to="/account" aria-label="My Account">
                  <User className="h-5 w-5" strokeWidth={1.5} />
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-10 w-10 hover:bg-transparent transition-colors", isScrolled ? "text-foreground hover:text-accent" : "text-white hover:text-white/80")}
                asChild
              >
                <Link to="/login" aria-label="Account">
                  <User className="h-5 w-5" strokeWidth={1.5} />
                </Link>
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("relative h-10 w-10 hover:bg-transparent transition-colors", isScrolled ? "text-foreground hover:text-accent" : "text-white hover:text-white/80")}
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
              className={cn("md:hidden h-10 w-10 hover:bg-transparent transition-colors", isScrolled ? "text-foreground hover:text-accent" : "text-white hover:text-white/80")}
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
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="md:hidden absolute left-0 right-0 top-full bg-background border-b border-border overflow-hidden z-40"
          >
            <nav className="container py-6 flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link
                    to={link.href}
                    className={cn(
                      'text-sm font-medium tracking-[0.1em] py-3 transition-colors border-b border-border block',
                      location.pathname === link.href
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05, duration: 0.3 }}
              >
                {user ? (
                  <Link
                    to="/account"
                    className="text-sm font-medium tracking-[0.1em] py-3 text-muted-foreground hover:text-foreground block"
                  >
                    MY ACCOUNT
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="text-sm font-medium tracking-[0.1em] py-3 text-muted-foreground hover:text-foreground block"
                  >
                    ACCOUNT
                  </Link>
                )}
              </motion.div>
              {/* Mobile Currency Selector */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navLinks.length + 1) * 0.05, duration: 0.3 }}
              >
                <div className="py-3">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="bg-background border border-border text-foreground text-sm font-medium px-3 py-2 pr-8 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
