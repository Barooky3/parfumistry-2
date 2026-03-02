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
  if (!override) return { containerStyle: undefined, imageScale: 1, hasOverride: false };
  
  const hasAny = override.padding_top !== 0 || override.padding_right !== 0 || override.padding_bottom !== 0 || override.padding_left !== 0 || override.scale !== 1;
  if (!hasAny) return { containerStyle: undefined, imageScale: 1, hasOverride: false };

  // Allow all values (positive = padding, negative = negative margin effect via inset)
  const containerStyle: React.CSSProperties = {
    paddingTop: `${Math.max(0, override.padding_top)}rem`,
    paddingRight: `${Math.max(0, override.padding_right)}rem`,
    paddingBottom: `${Math.max(0, override.padding_bottom)}rem`,
    paddingLeft: `${Math.max(0, override.padding_left)}rem`,
  };

  // Use the dedicated scale value directly
  const imageScale = override.scale;

  // For negative values, store them separately so components can use them
  const negativeInsets = {
    top: Math.min(0, override.padding_top),
    right: Math.min(0, override.padding_right),
    bottom: Math.min(0, override.padding_bottom),
    left: Math.min(0, override.padding_left),
  };

  return { containerStyle, imageScale, hasOverride: true, negativeInsets };
};
