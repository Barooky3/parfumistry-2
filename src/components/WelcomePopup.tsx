import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const POPUP_SHOWN_KEY = 'profparfums_welcome_popup_shown';

export const WelcomePopup = () => {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) return;

    const alreadyShown = localStorage.getItem(POPUP_SHOWN_KEY);
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(POPUP_SHOWN_KEY, 'true');
    }, 4000);

    return () => clearTimeout(timer);
  }, [user, loading]);

  const handleSignUp = () => {
    setOpen(false);
    navigate('/signup');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          />

          {/* Popup */}
          <motion.div
            className="fixed z-50 bottom-6 right-6 w-[320px] rounded-lg border border-border bg-card shadow-2xl overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
          >
            {/* Header */}
            <div className="bg-foreground px-5 py-5 relative">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-2.5 right-2.5 p-1 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/40 transition-colors"
                aria-label="Close"
              >
                <X className="h-3.5 w-3.5 text-primary-foreground" />
              </button>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/20 shrink-0">
                  <Gift className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-base font-display text-primary-foreground tracking-wide leading-tight">
                    Welcome Gift
                  </h2>
                  <p className="text-muted-foreground text-[10px] tracking-wider uppercase">
                    Exclusive for new members
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4">
              <div className="bg-secondary rounded-md py-2.5 px-4 mb-3 border border-border text-center">
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mb-1">
                  Your discount code
                </p>
                <p className="text-2xl font-bold tracking-widest text-foreground">
                  15% OFF
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Create an account and get an exclusive <strong className="text-foreground">15% discount code</strong> sent to your email.
              </p>

              <Button
                onClick={handleSignUp}
                size="sm"
                className="w-full h-10 text-[10px] font-medium tracking-[0.15em] uppercase rounded-none"
              >
                Create Account & Get 15% Off
              </Button>

              <button
                onClick={() => setOpen(false)}
                className="mt-2 w-full text-center text-[10px] text-muted-foreground hover:text-foreground transition-colors"
              >
                No thanks, I'll pay full price
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
