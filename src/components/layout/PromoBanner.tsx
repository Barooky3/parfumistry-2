import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface TimeLeft { days: number; hours: number; mins: number; secs: number; }

export const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 2, hours: 1, mins: 9, secs: 43 });
  const bannerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const updateHeight = () => {
      if (bannerRef.current && isVisible) {
        document.documentElement.style.setProperty('--promo-banner-height', `${bannerRef.current.offsetHeight}px`);
      } else {
        document.documentElement.style.setProperty('--promo-banner-height', '0px');
      }
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isVisible]);

  useEffect(() => {
    const CYCLE_MS = (2 * 24 + 20) * 60 * 60 * 1000;
    const EPOCH = new Date('2025-01-01T00:00:00Z').getTime();
    const calculateTimeLeft = () => {
      const remaining = CYCLE_MS - ((Date.now() - EPOCH) % CYCLE_MS);
      setTimeLeft({
        days: Math.floor(remaining / (1000 * 60 * 60 * 24)),
        hours: Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((remaining % (1000 * 60)) / 1000),
      });
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => num.toString().padStart(2, '0');
  const handleClose = () => { setIsVisible(false); document.documentElement.style.setProperty('--promo-banner-height', '0px'); };

  const TimerBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <span className="bg-secondary text-secondary-foreground text-base sm:text-lg md:text-2xl font-bold w-10 sm:w-12 md:w-14 py-1.5 sm:py-2 rounded text-center tabular-nums">{formatNumber(value)}</span>
      <span className="text-[9px] sm:text-[10px] md:text-xs text-primary-foreground/60 mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div ref={bannerRef} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-primary text-primary-foreground py-3 sm:py-4 md:py-5 fixed top-0 left-0 right-0 z-50">
          <div className="container relative px-4">
            <button onClick={handleClose} className="absolute right-2 sm:right-4 top-0 p-1.5 hover:opacity-70 transition-opacity" aria-label="Close">
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="text-center max-w-md mx-auto">
              <h3 className="text-xs sm:text-sm md:text-base font-bold tracking-wide uppercase mb-0.5 sm:mb-1 pr-6 sm:pr-0">{t('promo.title')}</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-primary-foreground/70 mb-3 sm:mb-4 leading-relaxed pr-6 sm:pr-0">{t('promo.subtitle')}</p>
              <div className="flex items-start justify-center gap-1.5 sm:gap-2 md:gap-3">
                <TimerBlock value={timeLeft.days} label={t('promo.days')} />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-primary-foreground/40">:</span>
                <TimerBlock value={timeLeft.hours} label={t('promo.hours')} />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-primary-foreground/40">:</span>
                <TimerBlock value={timeLeft.mins} label={t('promo.mins')} />
                <span className="text-base sm:text-lg md:text-xl font-bold mt-1.5 sm:mt-2 text-primary-foreground/40">:</span>
                <TimerBlock value={timeLeft.secs} label={t('promo.secs')} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
