import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, Check, ArrowLeft, Building2, Shield, Clock, Info, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/contexts/CartContext';

const EUR_BANK_DETAILS = [
  { label: 'IBAN', value: 'IE26 REVO 9903 6038 5697 96', copyValue: 'IE26REVO99036038569796' },
  { label: 'Beneficiary', value: 'Mubarak Elkhabir' },
  { label: 'BIC / SWIFT', value: 'REVOIE23' },
  { label: 'Correspondent BIC', value: 'CHASDEFX' },
  { label: 'Bank', value: 'Revolut Bank UAB' },
  { label: 'Bank Address', value: '2 Dublin Landings, North Dock, Dublin 1, D01 V4A3, Ireland' },
];

const GBP_BANK_DETAILS = [
  { label: 'Sort Code', value: '23-01-20', copyValue: '230120' },
  { label: 'Account Number', value: '18879447', copyValue: '18879447' },
  { label: 'Beneficiary', value: 'Mubarak Elkhabir' },
  { label: 'Bank', value: 'Revolut Ltd' },
  { label: 'Bank Address', value: '30 South Colonnade, E14 5HX, London, UK' },
];

const BankTransfer = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderTotal = searchParams.get('total') || '';
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'eur' | 'gbp'>('eur');
  const { clearCart } = useCart();

  const bankDetails = activeTab === 'eur' ? EUR_BANK_DETAILS : GBP_BANK_DETAILS;

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmTransfer = async () => {
    setIsProcessing(true);
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
          paymentMethod: 'bank_transfer',
          discountCode: ctx.discountCode || null,
          discountPercent: ctx.discountPercent || 0,
        },
      });
      clearCart();
      sessionStorage.removeItem('checkoutOrderContext');
      sessionStorage.removeItem('checkoutFormData');
      if (data?.orderNumber) {
        navigate(`/proof?order=${data.orderNumber}&method=bank_transfer`);
      } else {
        navigate(`/checkout?completed=bank_transfer`);
      }
    } catch (err: any) {
      console.error('Bank transfer order error:', err);
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-7 w-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Bank Transfer</h1>
        </div>

        {/* Order total if available */}
        {orderTotal && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 mb-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Amount to transfer</p>
            <p className="text-2xl font-bold text-foreground">€{orderTotal}</p>
          </div>
        )}

        {/* Bank details card */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground tracking-wide">Account Details</h2>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setActiveTab('eur')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${activeTab === 'eur' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              >
                EUR (SEPA)
              </button>
              <button
                onClick={() => setActiveTab('gbp')}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${activeTab === 'gbp' ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
              >
                GBP
              </button>
            </div>
          </div>
          <div className="divide-y divide-border">
            {bankDetails.map((detail) => (
              <div key={detail.label} className="flex items-center justify-between px-5 py-3.5 group">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{detail.label}</p>
                  <p className="text-sm font-medium text-foreground font-mono tracking-wide">
                    {detail.value}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                  onClick={() => handleCopy(detail.label, detail.copyValue || detail.value)}
                >
                  {copiedField === detail.label ? (
                    <Check className="h-4 w-4 text-accent" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-6">
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground tracking-wide">How it works</h2>
          </div>
          <div className="px-5 py-4 space-y-4">
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">1</span>
              <div>
                <p className="text-sm font-medium text-foreground">Copy the bank details above</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use the copy buttons to avoid typos.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">2</span>
              <div>
                <p className="text-sm font-medium text-foreground">Transfer the exact amount</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {orderTotal ? `Send exactly €${orderTotal} via your banking app.` : 'Send the exact order total via your banking app.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">3</span>
              <div>
                <p className="text-sm font-medium text-foreground">Include your email as reference</p>
                <p className="text-xs text-muted-foreground mt-0.5">Add the email you used at checkout in the payment reference/description so we can match your payment.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">4</span>
              <div>
                <p className="text-sm font-medium text-foreground">Click "Confirm Transfer Sent" below</p>
                <p className="text-xs text-muted-foreground mt-0.5">Once you've initiated the transfer, confirm it to place your order.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="flex gap-2.5 rounded-lg bg-muted/40 border border-border/50 px-4 py-3 mb-6">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            After placing your order, you'll receive an email asking for proof of payment. Your order confirmation will be sent as soon as you provide it.
          </p>
        </div>

        {/* Confirm Transfer Sent Button */}
        <Button
          type="button"
          disabled={isProcessing}
          className="w-full h-[52px] rounded-lg text-sm font-semibold tracking-wide bg-green-600 hover:bg-green-700 text-white shadow-lg disabled:opacity-40"
          onClick={() => setShowConfirmDialog(true)}
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" />Confirm Transfer Sent</>}
        </Button>

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Confirm Bank Transfer
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground block mb-2">
                  Please confirm that you have initiated a bank transfer for the correct amount.
                </span>
                After placing your order, you'll receive an email asking for proof of payment. Your order confirmation will be sent as soon as you provide it.
                <span className="font-semibold text-red-500 block mt-2">
                  Orders confirmed without a valid bank transfer will be rejected.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Go Back</AlertDialogCancel>
              <AlertDialogAction className="bg-green-600 hover:bg-green-700" onClick={handleConfirmTransfer}>
                Yes, I've Sent the Transfer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Trust badges */}
        <div className="flex flex-col items-center gap-2 pt-4 mt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px]">Secure</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px]">Instant after proof</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankTransfer;
