import { Sparkles } from 'lucide-react';

export const AnnouncementBar = () => {
  return (
    <div className="bg-primary text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
      <div className="container py-2.5 flex items-center justify-center gap-2">
        <Sparkles className="h-4 w-4" />
        <p className="text-sm font-semibold tracking-wider uppercase">
          Exclusive Fragrance On Sale
        </p>
        <Sparkles className="h-4 w-4" />
      </div>
    </div>
  );
};
