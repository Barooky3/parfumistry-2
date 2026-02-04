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

  const TimerBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="bg-secondary text-secondary-foreground text-base sm:text-lg md:text-2xl font-bold w-10 sm:w-12 md:w-14 py-1.5 sm:py-2 rounded text-center tabular-nums">
        {formatNumber(value)}
      </span>
      <span className="text-[9px] sm:text-[10px] md:text-xs text-primary-foreground/60 mt-1 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-primary text-primary-foreground py-3 sm:py-4 md:py-5"
        >
          <div className="container relative px-4">
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-2 sm:right-4 top-0 p-1.5 hover:opacity-70 transition-opacity"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-wide uppercase mb-0.5 sm:mb-1 pr-6 sm:pr-0">
                Buy 2 Fragrances, Get 1 Free
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/70 mb-3 sm:mb-4 leading-relaxed pr-6 sm:pr-0">
                Add 3 fragrances to your cart and one becomes free!
              </p>

              {/* Countdown Timer */}
              <div className="flex items-start justify-center gap-1.5 sm:gap-2 md:gap-3">
                <TimerBlock value={timeLeft.days} label="days" />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-primary-foreground/40">:</span>
                <TimerBlock value={timeLeft.hours} label="hours" />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-primary-foreground/40">:</span>
                <TimerBlock value={timeLeft.mins} label="mins" />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-primary-foreground/40">:</span>
                <TimerBlock value={timeLeft.secs} label="secs" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
