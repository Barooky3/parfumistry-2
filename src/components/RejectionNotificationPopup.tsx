import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface RejectedOrder {
  id: string;
  order_number: number | null;
  rejection_notes: string | null;
  created_at: string;
}

const DEFAULT_REASON = "Unfortunately, your payment could not be verified and your order has been cancelled. Please try again or contact us for assistance.";

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

    // Delay check by 3 seconds so it doesn't interfere with page load
    const timer = setTimeout(checkRejections, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = async () => {
    // Mark current order as seen
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

  const reason = current.rejection_notes?.trim() || DEFAULT_REASON;
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
            className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Red top bar */}
            <div className="h-1.5 bg-red-500" />

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground"
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
                    We couldn't process your order
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-4 mb-5">
                <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                  {reason}
                </p>
              </div>

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
