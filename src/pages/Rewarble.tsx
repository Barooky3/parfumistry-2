import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Shield, Copy, Check, CheckCircle, AlertTriangle, Loader2, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

const Rewarble = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderTotal = searchParams.get('total') || '';
  const [rewarbleCode, setRewarbleCode] = useState(() => {
    return sessionStorage.getItem('rewarbleCode') || '';
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { clearCart } = useCart();

  const handleCodeChange = (value: string) => {
    setRewarbleCode(value);
    sessionStorage.setItem('rewarbleCode', value);
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const orderContext = sessionStorage.getItem('checkoutOrderContext');
      if (!orderContext) {
        toast({ title: 'Session expired', description: 'Please go back to checkout and try again.', variant: 'destructive' });
        setIsProcessing(false);
        return;
      }
      const ctx = JSON.parse(orderContext);
      await supabase.functions.invoke('request-order-approval', {
        body: {
          orderItems: ctx.cartItems,
          customerEmail: ctx.email,
          customerName: ctx.customerName,
          shippingAddress: ctx.shippingAddress,
          totalAmount: ctx.totalAmount,
          paymentMethod: 'rewarble',
          giftCardCode: rewarbleCode.trim(),
        },
      });
      clearCart();
      sessionStorage.removeItem('checkoutOrderContext');
      sessionStorage.removeItem('checkoutFormData');
      sessionStorage.removeItem('rewarbleCode');
      navigate('/checkout?completed=rewarble');
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
                  Buy a card closest to your order amount ({orderTotal ? `€${orderTotal}` : 'see checkout'}) using Visa, iDEAL, or Revolut.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 text-xs"
                  onClick={() => window.open('https://www.g2a.com/revolut-gift-card-5-eur-by-rewarble-global-i10000504736016', '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  Buy Rewarble Card
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
                <p className="text-xs text-muted-foreground mt-0.5">Click confirm to place your order. We'll verify the code and process your order.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multiple codes note */}
        <div className="flex gap-2.5 rounded-lg bg-muted/40 border border-border/50 px-4 py-3 mb-6">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            If you need to use multiple codes, simply repeat the order process for each. Orders with matching details (name, email, address) will be manually joined.
          </p>
        </div>

        {/* Payment logos */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {/* Visa */}
          <svg width="36" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#1A1F71" stroke="#2A2F81"/>
            <text x="24" y="20" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
          </svg>
          {/* Mastercard */}
          <svg width="36" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#fff" stroke="#ddd"/>
            <circle cx="19" cy="16" r="8" fill="#EB001B"/>
            <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
            <path d="M24 9.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#FF5F00"/>
          </svg>
          {/* Apple Pay */}
          <svg width="36" height="24" viewBox="0 0 165 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="165" height="40" rx="4" fill="#000"/>
            <g transform="translate(16, 3) scale(0.85)">
              <path d="M25.2 7.8c-1.4 1.7-3.7 3-5.9 2.8-.3-2.3.8-4.8 2.1-6.3C22.8 2.6 25.3 1.5 27.2 1.4c.2 2.5-.7 4.9-2 6.4z" fill="white"/>
              <path d="M27.1 10.5c-3.3-.2-6.1 1.9-7.6 1.9-1.6 0-4-1.8-6.6-1.8-3.4.1-6.5 2-8.3 5-3.5 6.1-.9 15.2 2.5 20.2 1.7 2.5 3.7 5.2 6.3 5.1 2.5-.1 3.5-1.6 6.5-1.6 3 0 3.9 1.6 6.6 1.6 2.7-.1 4.4-2.5 6.1-5 1.9-2.8 2.7-5.5 2.7-5.7-.1 0-5.2-2-5.3-7.9-.1-5 4-7.3 4.2-7.5-2.3-3.4-5.8-3.8-7.1-3.8v.5z" fill="white"/>
            </g>
            <g transform="translate(70, 6)">
              <path d="M7.3 27.4V1.7h8.5c4.2 0 7.1 2.8 7.1 6.9 0 4.1-3 6.9-7.2 6.9H11v11.9H7.3zM11 12.6h3.5c2.9 0 4.5-1.5 4.5-4.1 0-2.5-1.6-4-4.5-4H11v8.1z" fill="white"/>
              <path d="M35.5 23.4c0 2.6-2 4.3-5 4.3-2.6 0-4.5-1.3-4.6-3.2h3.3c.2 1 1.2 1.7 2.5 1.7 1.6 0 2.5-.8 2.5-1.9 0-1-.8-1.6-2.5-2l-1.8-.4c-3-.7-4.3-2-4.3-4.2 0-2.7 2.2-4.5 5.3-4.5 2.5 0 4.3 1.3 4.4 3.2h-3.2c-.2-1-1-1.7-2.3-1.7-1.4 0-2.3.7-2.3 1.8 0 1 .8 1.5 2.4 1.9l1.5.4c3.3.8 4.8 2 4.8 4.3l-.7.3z" fill="white"/>
              <path d="M39 28.9c-.4 0-.8 0-1.1-.1v-2.5c.3 0 .7.1 1 .1 1.4 0 2.1-.6 2.6-2l.3-.8-5.7-15.1h3.5l4 12.1h.1l4-12.1h3.4L45.2 25c-1.3 3.6-2.8 4.2-5.3 4.2l-.9-.3z" fill="white"/>
            </g>
          </svg>
          {/* Google Pay */}
          <svg width="36" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#fff" stroke="#ddd"/>
            <g transform="translate(3, 5) scale(0.88)">
              <path d="M21.2 15.4v5h-1.6V9h4.2c1 0 1.9.4 2.6 1 .7.7 1.1 1.5 1.1 2.5s-.4 1.9-1.1 2.5c-.7.7-1.6 1-2.6 1l-2.6-.6zm0-5v3.5h2.7c.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.4 0-.5-.2-1-.6-1.4-.4-.4-.9-.6-1.5-.6l-2.7.5z" fill="#5F6368"/>
              <path d="M32.5 13c1.2 0 2.1.3 2.8 1 .7.7 1 1.6 1 2.7v5.6h-1.5v-1.3c-.6.9-1.5 1.4-2.6 1.4-.9 0-1.7-.3-2.3-.8-.6-.5-.9-1.2-.9-2s.3-1.4.9-1.9c.6-.5 1.4-.7 2.5-.7h2.3v-.3c0-.7-.2-1.2-.6-1.6-.4-.4-1-.6-1.7-.6-.5 0-.9.1-1.3.3-.4.2-.7.5-.9.8l-1.2-.8c.3-.5.8-.9 1.3-1.2.6-.3 1.3-.4 2-.4l.2-.2zm-1.8 7.3c.4.3.9.5 1.5.5.8 0 1.4-.3 2-.8.5-.5.8-1.1.8-1.7h-2.2c-.7 0-1.2.1-1.6.4-.4.3-.5.6-.5 1 0 .3.1.5.2.6h-.2z" fill="#5F6368"/>
              <path d="M43.4 13.3l-4.8 11.1H37l1.8-3.9-3.2-7.2h1.7l2.3 5.4 2.3-5.4h1.5z" fill="#5F6368"/>
              <path d="M17.4 15.5c0-.4 0-.7-.1-1.1h-5.5v2h3.2c-.1.8-.5 1.5-1.1 1.9v1.6h1.8c1.1-1 1.7-2.4 1.7-4.1v-.3z" fill="#4285F4"/>
              <path d="M11.8 20.5c1.5 0 2.7-.5 3.6-1.3l-1.8-1.4c-.5.3-1.1.5-1.8.5-1.4 0-2.5-.9-2.9-2.2H7v1.4c.9 1.8 2.7 3 4.8 3z" fill="#34A853"/>
              <path d="M8.9 16.1c-.1-.3-.2-.7-.2-1.1s.1-.8.2-1.1V12.5H7c-.4.8-.6 1.6-.6 2.5s.2 1.7.6 2.5l1.9-1.4z" fill="#FBBC04"/>
              <path d="M11.8 11.7c.8 0 1.5.3 2 .8l1.5-1.5c-.9-.9-2.1-1.4-3.5-1.4-2.1 0-3.9 1.2-4.8 3l1.9 1.4c.4-1.3 1.5-2.2 2.9-2.3z" fill="#EA4335"/>
            </g>
          </svg>
          {/* Paysafecard */}
          <svg width="36" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#0A3163" stroke="#0A3163"/>
            <text x="24" y="20" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">paysafe</text>
          </svg>
        </div>

        {/* Code Input */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground tracking-wide">Enter your code</h2>
          </div>
          <div className="p-5 space-y-3">
            <Label className="text-xs font-medium tracking-wider text-foreground">
              REWARBLE CODE
            </Label>
            <Input
              type="text"
              placeholder="Paste your Rewarble code here..."
              value={rewarbleCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="h-12 bg-background border-border rounded-md font-mono"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-1.5">
              Once you paste your code and confirm, it is sent to Rewarble for validation. The code is only released to us after you have received your products.
            </p>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          type="button"
          disabled={!rewarbleCode.trim() || isProcessing}
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
                Your Rewarble code will be verified before your order is processed. If the code is invalid or has already been used, your order will be rejected. Are you sure you have a valid Rewarble code?
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
