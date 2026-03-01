import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const POPUP_SHOWN_KEY = 'profparfums_welcome_popup_shown';

export const WelcomePopup = () => {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) return; // Already logged in, don't show

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none bg-card gap-0">
        <DialogTitle className="sr-only">Welcome Offer</DialogTitle>
        
        {/* Header */}
        <div className="bg-foreground px-6 py-8 text-center relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/20 mb-4">
            <Gift className="w-7 h-7 text-accent" />
          </div>
          <h2 className="text-2xl font-display text-primary-foreground tracking-wide mb-1">
            Welcome Gift
          </h2>
          <p className="text-muted-foreground text-sm tracking-wider uppercase">
            Exclusive for new members
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="bg-secondary rounded-lg py-4 px-6 mb-4 border border-border">
            <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">
              Your discount code
            </p>
            <p className="text-3xl font-bold tracking-widest text-foreground">
              15% OFF
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Create an account and get an exclusive <strong className="text-foreground">15% discount code</strong> sent to your email. Use it on your first order!
          </p>

          <Button
            onClick={handleSignUp}
            size="lg"
            className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none"
          >
            Create Account & Get 15% Off
          </Button>

          <button
            onClick={() => setOpen(false)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            No thanks, I'll pay full price
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
