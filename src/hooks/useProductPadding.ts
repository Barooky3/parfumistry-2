import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaddingOverride {
  padding_top: number;
  padding_right: number;
  padding_bottom: number;
  padding_left: number;
}

const cache: Record<string, PaddingOverride> = {};
let allFetched = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(fn => fn());

export const fetchAllPaddingOverrides = async () => {
  const { data } = await supabase
    .from('product_padding_overrides')
    .select('product_id, padding_top, padding_right, padding_bottom, padding_left');
  if (data) {
    data.forEach((row: any) => {
      cache[row.product_id] = {
        padding_top: Number(row.padding_top),
        padding_right: Number(row.padding_right),
        padding_bottom: Number(row.padding_bottom),
        padding_left: Number(row.padding_left),
      };
    });
    allFetched = true;
    notify();
  }
};

export const savePaddingOverride = async (productId: string, padding: PaddingOverride) => {
  cache[productId] = padding;
  notify();
  
  const { error } = await supabase
    .from('product_padding_overrides')
    .upsert({
      product_id: productId,
      ...padding,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'product_id' });
  
  if (error) console.error('Failed to save padding:', error);
};

export const useProductPadding = (productId: string): PaddingOverride | null => {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!allFetched) fetchAllPaddingOverrides();
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return cache[productId] || null;
};

export const computePaddingAndScale = (override: PaddingOverride | null) => {
  if (!override) return { containerStyle: undefined, imageScale: 1, hasOverride: false };
  
  const hasAny = override.padding_top !== 0 || override.padding_right !== 0 || override.padding_bottom !== 0 || override.padding_left !== 0;
  if (!hasAny) return { containerStyle: undefined, imageScale: 1, hasOverride: false };

  // Separate positive (padding) from negative (scale-up)
  const posTop = Math.max(0, override.padding_top);
  const posRight = Math.max(0, override.padding_right);
  const posBottom = Math.max(0, override.padding_bottom);
  const posLeft = Math.max(0, override.padding_left);

  // Negative values → scale factor. More negative = bigger image
  const negValues = [override.padding_top, override.padding_right, override.padding_bottom, override.padding_left].filter(v => v < 0);
  const maxNeg = negValues.length > 0 ? Math.min(...negValues) : 0;
  // Each -1rem ≈ 10% scale increase
  const imageScale = maxNeg < 0 ? 1 + Math.abs(maxNeg) * 0.1 : 1;

  const containerStyle = (posTop > 0 || posRight > 0 || posBottom > 0 || posLeft > 0) ? {
    paddingTop: `${posTop}rem`,
    paddingRight: `${posRight}rem`,
    paddingBottom: `${posBottom}rem`,
    paddingLeft: `${posLeft}rem`,
  } : undefined;

  return { containerStyle, imageScale, hasOverride: true };
};
