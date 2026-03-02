import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaddingOverride {
  padding_top: number;
  padding_right: number;
  padding_bottom: number;
  padding_left: number;
  scale: number;
}

const cache: Record<string, PaddingOverride> = {};
let allFetched = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(fn => fn());

export const fetchAllPaddingOverrides = async () => {
  const { data } = await supabase
    .from('product_padding_overrides')
    .select('product_id, padding_top, padding_right, padding_bottom, padding_left, scale');
  if (data) {
    data.forEach((row: any) => {
      cache[row.product_id] = {
        padding_top: Number(row.padding_top),
        padding_right: Number(row.padding_right),
        padding_bottom: Number(row.padding_bottom),
        padding_left: Number(row.padding_left),
        scale: Number(row.scale) || 1,
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
  if (!override) return { wrapperStyle: undefined, imageScale: 1, hasOverride: false };
  
  const hasAny = override.padding_top !== 0 || override.padding_right !== 0 || override.padding_bottom !== 0 || override.padding_left !== 0 || override.scale !== 1;
  if (!hasAny) return { wrapperStyle: undefined, imageScale: 1, hasOverride: false };

  const imageScale = override.scale;

  // Use transform to translate + scale the content wrapper
  // Padding values are treated as translation offsets (positive = inward, negative = outward)
  const translateX = (override.padding_left - override.padding_right) / 2;
  const translateY = (override.padding_top - override.padding_bottom) / 2;

  const wrapperStyle: React.CSSProperties = {
    transform: `scale(${imageScale}) translate(${translateX}rem, ${translateY}rem)`,
    transformOrigin: 'center center',
  };

  return { wrapperStyle, imageScale, hasOverride: true };
};
