import { useState, useEffect } from 'react';

const messages = [
  '✨ Exclusive Fragrance On Sale ✨',
];

export const AnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (messages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div className="bg-card text-foreground py-2.5 fixed top-0 left-0 right-0 z-50 border-b border-border">
      <div className="container">
        <div className="flex items-center justify-center text-xs font-medium tracking-[0.2em]">
          <span key={currentIndex} className="animate-fade-in">
            {messages[currentIndex]}
          </span>
        </div>
      </div>
    </div>
  );
};
