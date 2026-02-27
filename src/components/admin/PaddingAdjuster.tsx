import { useState, useEffect } from 'react';
import { Plus, Minus, Move, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Maximize, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProductPadding, savePaddingOverride, PaddingOverride } from '@/hooks/useProductPadding';

interface PaddingAdjusterProps {
  productId: string;
  productName: string;
  variant?: 'card' | 'detail';
}

const STEP = 0.25;

type Side = 'padding_top' | 'padding_right' | 'padding_bottom' | 'padding_left';

const sides: { key: Side; label: string; icon: typeof ChevronUp }[] = [
  { key: 'padding_top', label: 'Top', icon: ChevronUp },
  { key: 'padding_right', label: 'Right', icon: ChevronRight },
  { key: 'padding_bottom', label: 'Bottom', icon: ChevronDown },
  { key: 'padding_left', label: 'Left', icon: ChevronLeft },
];

export const PaddingAdjuster = ({ productId, productName, variant = 'card' }: PaddingAdjusterProps) => {
  const override = useProductPadding(productId);
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<PaddingOverride>({
    padding_top: 0, padding_right: 0, padding_bottom: 0, padding_left: 0,
  });

  useEffect(() => {
    if (override) setLocal(override);
  }, [override]);

  const updateAndSave = (next: PaddingOverride) => {
    setLocal(next);
    savePaddingOverride(productId, next);
  };

  const adjust = (side: Side | 'all', delta: number) => {
    const next = { ...local };
    if (side === 'all') {
      next.padding_top = +(next.padding_top + delta).toFixed(2);
      next.padding_right = +(next.padding_right + delta).toFixed(2);
      next.padding_bottom = +(next.padding_bottom + delta).toFixed(2);
      next.padding_left = +(next.padding_left + delta).toFixed(2);
    } else {
      next[side] = +(next[side] + delta).toFixed(2);
    }
    updateAndSave(next);
  };

  const handleInputChange = (side: Side, value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const next = { ...local, [side]: +num.toFixed(2) };
    updateAndSave(next);
  };

  const handleAllInputChange = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const val = +num.toFixed(2);
    updateAndSave({ padding_top: val, padding_right: val, padding_bottom: val, padding_left: val });
  };

  const isDetail = variant === 'detail';

  if (!open) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true); }}
        className={`absolute ${isDetail ? 'top-4 right-4 w-8 h-8' : 'top-2 right-2 w-6 h-6'} z-50 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors`}
        title="Adjust padding"
      >
        <Move className={isDetail ? 'w-4 h-4' : 'w-3 h-3'} />
      </button>
    );
  }

  const inputClass = `bg-transparent border border-white/30 text-white text-center font-mono rounded focus:outline-none focus:border-blue-400 ${isDetail ? 'w-14 h-7 text-xs' : 'w-10 h-5 text-[8px]'}`;
  const btnSize = isDetail ? 'h-7 w-7' : 'h-5 w-5';
  const iconSize = isDetail ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';
  const labelClass = isDetail ? 'text-[10px]' : 'text-[8px]';

  return (
    <div
      className="absolute inset-0 z-50 bg-black/85 rounded-sm flex flex-col items-center justify-center gap-2 p-3"
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <button
        onClick={() => setOpen(false)}
        className="absolute top-2 right-2 text-white/70 hover:text-white"
      >
        <X className={isDetail ? 'w-5 h-5' : 'w-3.5 h-3.5'} />
      </button>

      <p className={`${isDetail ? 'text-xs' : 'text-[8px]'} text-white/80 font-medium truncate max-w-full mb-1`}>{productName}</p>

      {/* All padding control */}
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          className={`${btnSize} p-0 text-white hover:bg-white/20`}
          onClick={() => adjust('all', -STEP)}
        >
          <Minus className={iconSize} />
        </Button>
        <div className="flex items-center gap-1">
          <Maximize className={iconSize + ' text-white/70'} />
          <span className={`${labelClass} text-white/70`}>All</span>
          <input
            type="number"
            step="0.25"
            value={local.padding_top === local.padding_right && local.padding_right === local.padding_bottom && local.padding_bottom === local.padding_left ? local.padding_top : ''}
            placeholder="—"
            onChange={(e) => handleAllInputChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            className={inputClass}
          />
        </div>
        <Button
          size="sm"
          variant="ghost"
          className={`${btnSize} p-0 text-white hover:bg-white/20`}
          onClick={() => adjust('all', STEP)}
        >
          <Plus className={iconSize} />
        </Button>
      </div>

      {/* Individual sides */}
      {sides.map(({ key, label, icon: Icon }) => (
        <div key={key} className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            className={`${btnSize} p-0 text-white hover:bg-white/20`}
            onClick={() => adjust(key, -STEP)}
          >
            <Minus className={iconSize} />
          </Button>
          <div className="flex items-center gap-1">
            <Icon className={iconSize + ' text-white/70'} />
            <span className={`${labelClass} text-white/70 w-6`}>{label}</span>
            <input
              type="number"
              step="0.25"
              
              value={local[key]}
              onChange={(e) => handleInputChange(key, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={inputClass}
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            className={`${btnSize} p-0 text-white hover:bg-white/20`}
            onClick={() => adjust(key, STEP)}
          >
            <Plus className={iconSize} />
          </Button>
        </div>
      ))}
    </div>
  );
};
