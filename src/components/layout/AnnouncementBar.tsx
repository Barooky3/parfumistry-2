import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';

export const AnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const announcements = [
    '✨ Free shipping on orders over €75',
    '🌸 New Spring Collection Available',
    '💜 Verified sellers • Instant delivery',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="container py-2.5 flex items-center justify-center">
        <p className="text-sm font-medium text-center animate-fade-in" key={currentIndex}>
          {announcements[currentIndex]}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-4 p-1 hover:opacity-70 transition-opacity"
          aria-label="Close announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
