import { useState, useEffect, useRef } from 'react';
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
  const bannerRef = useRef<HTMLDivElement>(null);

  // Update CSS variable for header positioning
  useEffect(() => {
    const updateHeight = () => {
      if (bannerRef.current && isVisible) {
        const height = bannerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--promo-banner-height', `${height}px`);
      } else {
        document.documentElement.style.setProperty('--promo-banner-height', '0px');
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isVisible]);

  useEffect(() => {
    // Use a fixed end date stored in localStorage so it persists across refreshes
    const STORAGE_KEY = 'promo-banner-end-date-v2';
    let endDate: Date;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && new Date(stored).getTime() > Date.now()) {
      endDate = new Date(stored);
    } else {
      endDate = new Date();
      endDate.setTime(endDate.getTime() + (2 * 24 + 21) * 60 * 60 * 1000 + 59 * 1000);
      localStorage.setItem(STORAGE_KEY, endDate.toISOString());
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const distance = endDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((distance % (1000 * 60)) / 1000),
        });
      } else {
        setIsVisible(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  const handleClose = () => {
    setIsVisible(false);
    document.documentElement.style.setProperty('--promo-banner-height', '0px');
  };

  const TimerBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="bg-[hsl(0,0%,22%)] text-foreground text-base sm:text-lg md:text-2xl font-bold w-10 sm:w-12 md:w-14 py-1.5 sm:py-2 rounded text-center tabular-nums">
        {formatNumber(value)}
      </span>
      <span className="text-[9px] sm:text-[10px] md:text-xs text-foreground/60 mt-1 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={bannerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[hsl(0,0%,8%)] text-foreground py-3 sm:py-4 md:py-5 fixed top-0 left-0 right-0 z-50"
        >
          <div className="container relative px-4">
            <button
              onClick={handleClose}
              className="absolute right-2 sm:right-4 top-0 p-1.5 hover:opacity-70 transition-opacity"
              aria-label="Sluiten"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-wide uppercase mb-0.5 sm:mb-1 pr-6 sm:pr-0">
                Buy 2 Fragrances, Get 1 Free
              </h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-foreground/70 mb-3 sm:mb-4 leading-relaxed pr-6 sm:pr-0">
                Add 3 fragrances to your cart and one becomes free!
              </p>

              {/* Countdown Timer */}
              <div className="flex items-start justify-center gap-1.5 sm:gap-2 md:gap-3">
                <TimerBlock value={timeLeft.days} label="days" />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-foreground/40">:</span>
                <TimerBlock value={timeLeft.hours} label="hours" />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-foreground/40">:</span>
                <TimerBlock value={timeLeft.mins} label="mins" />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-foreground/40">:</span>
                <TimerBlock value={timeLeft.secs} label="secs" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
