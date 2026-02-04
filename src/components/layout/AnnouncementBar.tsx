import { useState, useEffect } from 'react';
import { Sparkles, Truck, Shield } from 'lucide-react';

const messages = [
  { icon: Sparkles, text: 'EXCLUSIVE FRAGRANCE ON SALE' },
  { icon: Truck, text: 'FREE SHIPPING ON ORDERS OVER €50' },
  { icon: Shield, text: '100% AUTHENTIC GUARANTEED' },
];

export const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = messages[currentIndex];

  return (
    <div className="bg-gradient-to-r from-foreground via-foreground to-foreground text-background py-2.5 relative overflow-hidden">
      <div className="container">
        <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-widest">
          <span key={currentIndex} className="animate-fade-in flex items-center gap-2">
            ✨ {current.text} ✨
          </span>
        </div>
      </div>
    </div>
  );
};
