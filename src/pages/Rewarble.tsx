import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Shield, CheckCircle, AlertTriangle, Loader2, ExternalLink, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';

const Rewarble = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderTotal = searchParams.get('total') || '';
  const { currency, formatPrice } = useCurrency();
  const orderTotalNum = orderTotal ? parseFloat(orderTotal) : 0;
  const [codes, setCodes] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('rewarbleCodes');
    return saved ? JSON.parse(saved) : [''];
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCart();

  const updateCode = (index: number, value: string) => {
    setCodes(prev => {
      const next = [...prev];
      next[index] = value;
      sessionStorage.setItem('rewarbleCodes', JSON.stringify(next));
      return next;
    });
  };

  const addCodeSlot = () => setCodes(prev => {
    const next = [...prev, ''];
    sessionStorage.setItem('rewarbleCodes', JSON.stringify(next));
    return next;
  });

  const removeCodeSlot = (index: number) => {
    if (codes.length <= 1) return;
    setCodes(prev => {
      const next = prev.filter((_, i) => i !== index);
      sessionStorage.setItem('rewarbleCodes', JSON.stringify(next));
      return next;
    });
  };

  const allCodes = codes.map(c => c.trim()).filter(Boolean);
  const combinedCode = allCodes.join(' | ');

  // Generate a stable idempotency key per session to prevent duplicate orders
  const [idempotencyKey] = useState(() => {
    const existing = sessionStorage.getItem('rewarbleIdempotencyKey');
    if (existing) return existing;
    const key = crypto.randomUUID();
    sessionStorage.setItem('rewarbleIdempotencyKey', key);
    return key;
  });

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setShowConfirmDialog(false);
    try {
      const orderContext = sessionStorage.getItem('checkoutOrderContext');
      if (!orderContext) {
        toast({ title: 'Session expired', description: 'Please go back to checkout and try again.', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }
      const ctx = JSON.parse(orderContext);
      const { data } = await supabase.functions.invoke('request-order-approval', {
        body: {
          orderItems: ctx.cartItems,
          customerEmail: ctx.email,
          customerName: ctx.customerName,
          shippingAddress: ctx.shippingAddress,
          totalAmount: ctx.totalAmount,
          paymentMethod: 'rewarble',
          giftCardCode: combinedCode,
          discountCode: ctx.discountCode || null,
          discountPercent: ctx.discountPercent || 0,
          idempotencyKey,
        },
      });
      clearCart();
      sessionStorage.removeItem('checkoutOrderContext');
      sessionStorage.removeItem('checkoutFormData');
      sessionStorage.removeItem('rewarbleCodes');
      sessionStorage.removeItem('rewarbleIdempotencyKey');
      const orderNum = data?.orderNumber ? `&order=${data.orderNumber}` : '';
      navigate(`/checkout?completed=rewarble${orderNum}`);
    } catch (err: any) {
      console.error('Rewarble order error:', err);
      toast({ title: 'Order error', description: 'Could not complete your order. Please contact support.', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        {/* Back link */}
        <Link to="/checkout" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to checkout
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#7C3AED]/10 mb-4">
            <Gift className="h-7 w-7 text-[#7C3AED]" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Pay with Rewarble</h1>
        </div>

        {/* Order total */}
        {orderTotal && (
          <div className="rounded-xl border border-[#7C3AED]/30 bg-[#7C3AED]/5 p-4 mb-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Order amount</p>
            <p className="text-2xl font-bold text-foreground">€{orderTotal}</p>
            {currency !== 'EUR' && orderTotalNum > 0 && (
              <p className="text-sm text-muted-foreground mt-1">≈ {formatPrice(orderTotalNum)}</p>
            )}
          </div>
        )}

        {/* Step 1: Purchase */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground tracking-wide">How it works</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs font-bold shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-sm font-medium text-foreground">Purchase a Rewarble gift card</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Buy a card closest to your order amount ({orderTotal ? `€${orderTotal}${currency !== 'EUR' && orderTotalNum > 0 ? ` (≈ ${formatPrice(orderTotalNum)})` : ''}` : 'see checkout'}) using one of the many supported payment methods.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-[11px] text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded">Visa</span>
                  <span className="text-[11px] text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded">Mastercard</span>
                  <span className="text-[11px] text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded">Apple Pay</span>
                  <span className="text-[11px] text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded">Google Pay</span>
                  <span className="text-[11px] text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded">Paysafecard</span>
                  <span className="text-[11px] text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded">& more</span>
                </div>
                <Button type="button" variant="outline" size="sm" className="mt-2 text-xs"
                  onClick={() => window.open('https://www.g2a.com/revolut-gift-card-5-eur-by-rewarble-global-i10000504736016', '_blank')}>
                  <ExternalLink className="h-3 w-3 mr-1.5" />Buy Rewarble Card
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs font-bold shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-sm font-medium text-foreground">Paste your code below</p>
                <p className="text-xs text-muted-foreground mt-0.5">Enter the Rewarble code you received after purchasing.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#7C3AED] text-white text-xs font-bold shrink-0 mt-0.5">3</span>
              <div>
                <p className="text-sm font-medium text-foreground">Confirm your payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your code is sent to Rewarble for validation. Funds are only released once you receive your products.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment logos */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <svg width="44" height="30" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#1A1F71" stroke="#2A2F81"/>
            <text x="24" y="20" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
          </svg>
          <svg width="44" height="30" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#fff" stroke="#ddd"/>
            <circle cx="19" cy="16" r="8" fill="#EB001B"/>
            <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
            <path d="M24 9.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#FF5F00"/>
          </svg>
          <div className="w-[44px] h-[30px] rounded border border-border overflow-hidden bg-white flex items-center justify-center">
            <img src="/images/apple-pay.png" alt="Apple Pay" className="h-full w-full object-contain" />
          </div>
          <div className="w-[44px] h-[30px] rounded border border-border overflow-hidden bg-white flex items-center justify-center">
            <img src="/images/google-pay.png" alt="Google Pay" className="h-full w-full object-contain" />
          </div>
          <div className="w-[44px] h-[30px] rounded border border-border overflow-hidden bg-white flex items-center justify-center">
            <img src="/images/paysafecard.png" alt="Paysafecard" className="h-full w-full object-contain" />
          </div>
        </div>

        {/* Code Inputs */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground tracking-wide">Enter your code{codes.length > 1 ? 's' : ''}</h2>
          </div>
          <div className="p-5 space-y-3">
            {codes.map((code, i) => (
              <div key={i}>
                <Label className="text-xs font-medium tracking-wider text-foreground">
                  REWARBLE CODE {codes.length > 1 ? `#${i + 1}` : ''}
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type="text"
                    placeholder="Paste your Rewarble code here..."
                    value={code}
                    onChange={(e) => updateCode(i, e.target.value)}
                    className="h-12 bg-background border-border rounded-md font-mono flex-1"
                  />
                  {codes.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" className="h-12 w-12 text-muted-foreground hover:text-destructive shrink-0" onClick={() => removeCodeSlot(i)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addCodeSlot}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add another code
            </button>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
              Once you paste your code and confirm, it is sent to Rewarble for validation. The code is only released to us after you have received your products.
            </p>
            <div className="flex items-center justify-center gap-2 pt-4 mt-4 border-t border-border/60">
              <Shield className="h-3.5 w-3.5 text-[#7C3AED]" />
              <span className="text-xs text-muted-foreground">Secure verification powered by</span>
              <img src="/images/rewarble-icon.svg" alt="Rewarble" className="h-5 w-5" />
              <span className="text-sm font-semibold text-foreground">Rewarble</span>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          type="button"
          disabled={allCodes.length === 0 || isProcessing}
          className="w-full h-[52px] rounded-lg text-sm font-semibold tracking-wide bg-green-600 hover:bg-green-700 text-white shadow-lg disabled:opacity-40"
          onClick={() => setShowConfirmDialog(true)}
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" />Confirm Payment</>}
        </Button>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Payment Confirmation
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed">
                <span className="font-semibold text-red-500 block mb-2">
                  Orders confirmed with invalid Rewarble codes will be rejected upon review.
                </span>
                Your Rewarble code{allCodes.length > 1 ? 's' : ''} will be verified before your order is processed. If any code is invalid or has already been used, your order will be rejected. Are you sure you have valid Rewarble code{allCodes.length > 1 ? 's' : ''}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={handleConfirm}>
                Yes, Confirm Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Trust badges */}
        <div className="flex flex-col items-center gap-2 pt-4 mt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-accent" />
            <span className="text-[11px]">Secure checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Rewarble;
