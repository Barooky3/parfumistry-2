import { useState, useEffect } from 'react';

const messages = [
  'EXCLUSIVE FRAGRANCES — INSTANT DELIVERY',
  'VERIFIED AUTHENTIC — PREMIUM QUALITY',
  'CURATED LUXURY COLLECTIONS',
];

export const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-primary text-primary-foreground py-2.5 fixed top-0 left-0 right-0 z-50">
      <div className="container">
        <div className="flex items-center justify-center text-[11px] font-medium tracking-[0.2em]">
          <span key={currentIndex} className="animate-fade-in">
            {messages[currentIndex]}
          </span>
        </div>
      </div>
    </div>
  );
};
