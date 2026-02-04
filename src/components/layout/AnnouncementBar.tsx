import { Sparkles } from 'lucide-react';

export const AnnouncementBar = () => {
  return (
    <div className="bg-foreground text-background">
      <div className="container py-2.5 flex items-center justify-center gap-2">
        <Sparkles className="h-3.5 w-3.5" />
        <p className="text-xs sm:text-sm font-medium tracking-wide">
          EXCLUSIVE FRAGRANCE ON SALE
        </p>
        <Sparkles className="h-3.5 w-3.5" />
      </div>
    </div>
  );
};
