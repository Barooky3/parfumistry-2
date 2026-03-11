import { useEffect, useState } from 'react';
import { AlertTriangle, X, ShoppingCart, ArrowRight, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface RejectedOrder {
  id: string;
  order_number: number | null;
  rejection_notes: string | null;
  created_at: string;
  checkout_reference?: string;
}

const DEFAULT_REASON = "Unfortunately, your payment could not be verified and your order has been cancelled. Please try again or contact us for assistance.";

// Parse value mismatch notes like "Code value: £10.00 GBP (≈ €8.50) | Cart value: €25.00 | Missing: €16.50"
// or "Code value: €10.00 | Cart value: €25.00 | Missing: €15.00"
const parseValueMismatch = (notes: string | null) => {
  if (!notes) return null;
  const match = notes.match(/Code value:\s*(.+?)\s*\|\s*Cart value:\s*€([\d.]+)\s*\|\s*Missing:\s*€([\d.]+)/);
  if (!match) return null;
  return {
    codeValue: match[1],
    cartValue: match[2],
    missingAmount: match[3],
  };
};

export const RejectionNotificationPopup = () => {
  const [rejectedOrders, setRejectedOrders] = useState<RejectedOrder[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkRejections = async () => {
      const email = localStorage.getItem('pp_customer_email');
      if (!email) return;

      try {
        const { data, error } = await supabase.functions.invoke('check-rejected-orders', {
          body: { email },
        });
        if (error || !data?.rejectedOrders?.length) return;
        setRejectedOrders(data.rejectedOrders);
        setVisible(true);
      } catch {
        // silently fail
      }
    };

    const timer = setTimeout(checkRejections, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = async () => {
    const current = rejectedOrders[currentIndex];
    if (current) {
      try {
        await supabase.functions.invoke('mark-rejection-seen', {
          body: { orderIds: [current.id] },
        });
      } catch {
        // silently fail
      }
    }

    if (currentIndex < rejectedOrders.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setVisible(false);
    }
  };

  const current = rejectedOrders[currentIndex];
  if (!current) return null;

  const mismatchData = parseValueMismatch(current.rejection_notes);
  const isValueMismatch = !!mismatchData;
  const reason = isValueMismatch
    ? `The value of the gift card you provided does not match your cart total.`
    : (current.rejection_notes?.trim() || DEFAULT_REASON);
  const orderLabel = current.order_number ? `#${current.order_number}` : '';

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Red top bar */}
            <div className="h-1.5 bg-red-500" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {/* Icon + title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Order {orderLabel} Rejected
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {isValueMismatch ? 'Gift card value mismatch' : "We couldn't process your order"}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                  {reason}
                </p>
              </div>

              {/* Value mismatch breakdown */}
              {isValueMismatch && mismatchData && (
                <>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 mb-4">
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-700 dark:text-amber-400">Code value:</span>
                        <span className="font-semibold text-amber-900 dark:text-amber-200">{mismatchData.codeValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-700 dark:text-amber-400">Cart value:</span>
                        <span className="font-semibold text-amber-900 dark:text-amber-200">€{mismatchData.cartValue}</span>
                      </div>
                      <div className="h-px bg-amber-300 dark:bg-amber-700 my-1" />
                      <div className="flex justify-between">
                        <span className="text-amber-700 dark:text-amber-400 font-medium">Missing amount:</span>
                        <span className="font-bold text-red-600 dark:text-red-400">€{mismatchData.missingAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tutorial steps */}
                  <div className="bg-muted/50 border border-border rounded-lg p-4 mb-5">
                    <h4 className="text-sm font-semibold text-foreground mb-3">How to redo your order:</h4>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">1</div>
                        <div className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Buy a new gift card</strong> to cover the missing amount (€{mismatchData.missingAmount}).
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">2</div>
                        <div className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Add the same items</strong> to your cart again on our website.
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">3</div>
                        <div className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Enter both codes</strong> at checkout — the original code you already used, plus the new one.
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">4</div>
                        <div className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Submit</strong> your new order and we'll verify both codes.
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Non-mismatch spacer */}
              {!isValueMismatch && <div className="mb-1" />}

              {/* CTA */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {rejectedOrders.length > 1 && `${currentIndex + 1} of ${rejectedOrders.length}`}
                </p>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {currentIndex < rejectedOrders.length - 1 ? 'Next' : 'Got it'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
