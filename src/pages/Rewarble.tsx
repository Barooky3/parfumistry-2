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
                  onClick={() => window.open('https://skine.com/en-us/rewarble?utm_source=rewarble.com', '_blank')}
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
          <svg width="36" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#1A1F71" stroke="#2A2F81"/>
            <text x="24" y="20" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
          </svg>
          <svg width="36" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#fff" stroke="#ddd"/>
            <text x="24" y="20" textAnchor="middle" fill="#CC0066" fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">iDEAL</text>
          </svg>
          <svg width="36" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#191C1F" stroke="#333"/>
            <path d="M28.25 8H20.77L20.27 10.69H25.7C27.89 10.69 29.1 11.82 29.1 13.67C29.1 15.86 27.51 17.71 25.32 17.71H22.08L18.5 28H21.33L23.83 19.53H25.56C29.46 19.53 32.06 16.82 32.06 13.33C32.06 10.11 30.18 8 28.25 8Z" fill="white" transform="scale(0.7) translate(6, 2)"/>
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
