import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, Check, ArrowLeft, Building2, Shield, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const BANK_DETAILS = [
  { label: 'IBAN', value: 'IE26 REVO 9903 6038 5697 96', copyValue: 'IE26REVO99036038569796' },
  { label: 'Account Holder', value: 'Mubarak Elkhabir' },
  { label: 'BIC / SWIFT', value: 'REVOIE23' },
  { label: 'Bank', value: 'Revolut' },
  { label: 'Country', value: 'Ireland' },
];

const BankTransfer = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const orderTotal = searchParams.get('total') || '';
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast({ title: 'Copied!', description: `${label} copied to clipboard` });
    setTimeout(() => setCopiedField(null), 2000);
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
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">Bank Transfer</h1>
          <p className="text-sm text-muted-foreground">
            Transfer the exact amount to our account using the details below.
          </p>
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
          <div className="px-5 py-3.5 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground tracking-wide">Account Details</h2>
          </div>
          <div className="divide-y divide-border">
            {BANK_DETAILS.map((detail) => (
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
                <p className="text-sm font-medium text-foreground">Return to checkout & confirm</p>
                <p className="text-xs text-muted-foreground mt-0.5">Once you've initiated the transfer, go back and click "Confirm Transfer Sent" to place your order.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="flex gap-2.5 rounded-lg bg-muted/40 border border-border/50 px-4 py-3 mb-6">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            SEPA transfers typically arrive within 1 business day. Your order will be processed once payment is confirmed.
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px]">Secure</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px]">1 business day</span>
            </div>
          </div>
        </div>

        {/* Back to checkout button */}
        <div className="mt-6">
          <Link to="/checkout">
            <Button className="w-full h-12">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Checkout
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BankTransfer;
