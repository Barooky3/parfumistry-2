import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  mins: number;
  secs: number;
}

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 2, hours: 1, mins: 9, secs: 43 });

  useEffect(() => {
    // Set end date to 3 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary text-primary-foreground py-4 md:py-5"
        >
          <div className="container relative">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:opacity-70 transition-opacity"
              aria-label="Sluiten"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center pr-8 md:pr-0">
              <h3 className="text-sm md:text-lg font-bold tracking-wide uppercase mb-1">
                Buy 2 Fragrances and Get a 3rd for Free
              </h3>
              <p className="text-xs md:text-sm text-primary-foreground/80 mb-4">
                When you add 3 fragrances to your cart, one of them instantly becomes free!
              </p>

              {/* Countdown Timer */}
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <div className="flex flex-col items-center">
                  <span className="bg-secondary text-secondary-foreground text-lg md:text-2xl font-bold px-2.5 md:px-4 py-1.5 md:py-2 rounded-md min-w-[40px] md:min-w-[56px]">
                    {formatNumber(timeLeft.days)}
                  </span>
                  <span className="text-[10px] md:text-xs text-primary-foreground/70 mt-1">days</span>
                </div>
                <span className="text-lg md:text-2xl font-bold mb-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-secondary text-secondary-foreground text-lg md:text-2xl font-bold px-2.5 md:px-4 py-1.5 md:py-2 rounded-md min-w-[40px] md:min-w-[56px]">
                    {formatNumber(timeLeft.hours)}
                  </span>
                  <span className="text-[10px] md:text-xs text-primary-foreground/70 mt-1">hours</span>
                </div>
                <span className="text-lg md:text-2xl font-bold mb-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-secondary text-secondary-foreground text-lg md:text-2xl font-bold px-2.5 md:px-4 py-1.5 md:py-2 rounded-md min-w-[40px] md:min-w-[56px]">
                    {formatNumber(timeLeft.mins)}
                  </span>
                  <span className="text-[10px] md:text-xs text-primary-foreground/70 mt-1">mins</span>
                </div>
                <span className="text-lg md:text-2xl font-bold mb-4">:</span>
                <div className="flex flex-col items-center">
                  <span className="bg-secondary text-secondary-foreground text-lg md:text-2xl font-bold px-2.5 md:px-4 py-1.5 md:py-2 rounded-md min-w-[40px] md:min-w-[56px]">
                    {formatNumber(timeLeft.secs)}
                  </span>
                  <span className="text-[10px] md:text-xs text-primary-foreground/70 mt-1">secs</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
