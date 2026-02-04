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
  const Icon = current.icon;

  return (
    <div className="bg-foreground text-background py-2.5 relative overflow-hidden">
      <div className="container">
        <div className="flex items-center justify-center gap-2 text-xs font-medium tracking-widest">
          <Icon className="h-3.5 w-3.5" />
          <span key={currentIndex} className="animate-fade-in">
            ✨ {current.text} ✨
          </span>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
};
