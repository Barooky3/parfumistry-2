import { useState, useEffect } from 'react';
import { Plus, Minus, Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductPadding, savePaddingOverride, PaddingOverride } from '@/hooks/useProductPadding';
import { cn } from '@/lib/utils';

interface PaddingAdjusterProps {
  productId: string;
  productName: string;
}

const STEP = 0.25;

type Side = 'padding_top' | 'padding_right' | 'padding_bottom' | 'padding_left';

const sides: { key: Side; label: string; icon: typeof ChevronUp }[] = [
  { key: 'padding_top', label: 'Top', icon: ChevronUp },
  { key: 'padding_right', label: 'Right', icon: ChevronRight },
  { key: 'padding_bottom', label: 'Bottom', icon: ChevronDown },
  { key: 'padding_left', label: 'Left', icon: ChevronLeft },
];

export const PaddingAdjuster = ({ productId, productName }: PaddingAdjusterProps) => {
  const override = useProductPadding(productId);
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<PaddingOverride>({
    padding_top: 0, padding_right: 0, padding_bottom: 0, padding_left: 0,
  });

  useEffect(() => {
    if (override) setLocal(override);
  }, [override]);

  const adjust = (side: Side | 'all', delta: number) => {
    const next = { ...local };
    if (side === 'all') {
      next.padding_top = Math.max(0, +(next.padding_top + delta).toFixed(2));
      next.padding_right = Math.max(0, +(next.padding_right + delta).toFixed(2));
      next.padding_bottom = Math.max(0, +(next.padding_bottom + delta).toFixed(2));
      next.padding_left = Math.max(0, +(next.padding_left + delta).toFixed(2));
    } else {
      next[side] = Math.max(0, +(next[side] + delta).toFixed(2));
    }
    setLocal(next);
    savePaddingOverride(productId, next);
  };

  if (!open) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className="absolute top-2 right-2 z-50 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
        title="Adjust padding"
      >
        <Move className="w-3 h-3" />
      </button>
    );
  }

  return (
    <div
      className="absolute inset-0 z-50 bg-black/80 rounded-sm flex flex-col items-center justify-center gap-2 p-2"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <button
        onClick={() => setOpen(false)}
        className="absolute top-1 right-1 text-white/70 hover:text-white text-xs font-bold px-1.5 py-0.5"
      >
        ✕
      </button>

      <p className="text-[8px] text-white/80 font-medium truncate max-w-full">{productName}</p>

      {/* All padding control */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
          onClick={() => adjust('all', -STEP)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="text-[9px] text-white/90 font-mono w-14 text-center flex items-center justify-center gap-0.5">
          <Maximize className="w-2.5 h-2.5" /> All
        </span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white hover:bg-white/20"
          onClick={() => adjust('all', STEP)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {/* Individual sides */}
      {sides.map(({ key, label, icon: Icon }) => (
        <div key={key} className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 text-white hover:bg-white/20"
            onClick={() => adjust(key, -STEP)}
          >
            <Minus className="w-2.5 h-2.5" />
          </Button>
          <span className="text-[8px] text-white/80 font-mono w-14 text-center flex items-center justify-center gap-0.5">
            <Icon className="w-2.5 h-2.5" /> {label} {local[key].toFixed(2)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            className="h-5 w-5 p-0 text-white hover:bg-white/20"
            onClick={() => adjust(key, STEP)}
          >
            <Plus className="w-2.5 h-2.5" />
          </Button>
        </div>
      ))}
    </div>
  );
};
