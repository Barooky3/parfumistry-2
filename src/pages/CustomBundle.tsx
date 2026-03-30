import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getFragrances } from '@/data/products';
import { Product, ProductVariant } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { Check, X, Package, Plus, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MAX_ITEMS = 5;

interface BundleSelection {
  product: Product;
  variant: ProductVariant;
  bundlePrice: number;
}

const getBundlePrice = (variantPrice: number): number => {
  if (variantPrice <= 28) return 9.99;
  if (variantPrice <= 39) return 14.99;
  return 19.99;
};

const getBundlePriceTier = (variantPrice: number): string => {
  if (variantPrice <= 28) return '€9.99';
  if (variantPrice <= 39) return '€14.99';
  return '€19.99';
};

const CustomBundle = () => {
  const [selections, setSelections] = useState<BundleSelection[]>([]);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addItem } = useCart();

  const fragrances = useMemo(() => {
    return getFragrances().filter(p => p.inStock && p.variants && p.variants.length > 0);
  }, []);

  const totalPrice = selections.reduce((sum, s) => sum + s.bundlePrice, 0);

  const handleSelectVariant = (product: Product, variant: ProductVariant) => {
    if (selections.length >= MAX_ITEMS) return;
    const bundlePrice = getBundlePrice(variant.price);
    setSelections(prev => [...prev, { product, variant, bundlePrice }]);
    setExpandedProduct(null);
  };

  const handleRemove = (index: number) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = () => {
    // Create a custom bundle product
    const bundleProduct: Product = {
      id: `custom-bundle-${Date.now()}`,
      name: 'Custom Bundle (' + selections.map(s => s.product.name).join(', ') + ')',
      brand: 'Parfumistry',
      price: totalPrice,
      category: 'bundle',
      description: 'Custom bundle of 5 fragrances',
      image: selections[0]?.product.image || '',
      affiliateUrl: '',
      inStock: true,
      isBundle: true,
    };
    addItem(bundleProduct, undefined, totalPrice);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 md:py-14">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl md:text-4xl text-foreground mb-2">
            Make Your Own Bundle
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Pick any 5 fragrances and build your perfect collection at bundle prices
          </p>
        </motion.div>

        {/* Sticky summary bar */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border py-3 mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Package size={20} className="text-accent" />
              <span className="text-sm font-medium text-foreground">
                {selections.length}/{MAX_ITEMS} selected
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: MAX_ITEMS }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-3 h-3 rounded-full border-2 transition-colors",
                      i < selections.length
                        ? "bg-accent border-accent"
                        : "border-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold text-foreground">
                €{totalPrice.toFixed(2)}
              </span>
              <Button
                onClick={handleAddToCart}
                disabled={selections.length !== MAX_ITEMS}
                className="rounded-none text-xs uppercase tracking-widest"
                size="sm"
              >
                Add Bundle to Cart
              </Button>
            </div>
          </div>

          {/* Selected items pills */}
          {selections.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              <AnimatePresence>
                {selections.map((sel, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center gap-1.5 bg-secondary text-foreground text-xs px-3 py-1.5 rounded-full border border-border"
                  >
                    <span className="max-w-[120px] truncate">{sel.product.name}</span>
                    <span className="text-muted-foreground">({sel.variant.ml}ml)</span>
                    <span className="font-medium">€{sel.bundlePrice.toFixed(2)}</span>
                    <button
                      onClick={() => handleRemove(i)}
                      className="ml-1 hover:text-destructive transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Pricing tiers legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500/80" />
            €10–€28 → <span className="font-semibold text-foreground">€9.99</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500/80" />
            €29–€39 → <span className="font-semibold text-foreground">€14.99</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500/80" />
            €40+ → <span className="font-semibold text-foreground">€19.99</span>
          </div>
        </div>

        {/* Fragrance grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {fragrances.map((product) => {
            const timesSelected = selections.filter(s => s.product.id === product.id).length;
            const isFull = selections.length >= MAX_ITEMS;

            return (
              <motion.div
                key={product.id}
                className={cn(
                  "border border-border bg-background overflow-hidden transition-shadow",
                  expandedProduct === product.id && "ring-2 ring-accent"
                )}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
              >
                {/* Image */}
                <div className="aspect-square bg-secondary flex items-center justify-center p-4 relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                  {timesSelected > 0 && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {timesSelected}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                    {product.brand}
                  </p>
                  <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
                    {product.name}
                  </h3>

                  {/* Variant buttons */}
                  <div className="space-y-1.5 mt-2">
                    {product.variants?.filter(v => v.inStock).map((variant) => {
                      const bundlePrice = getBundlePrice(variant.price);
                      const tierColor = variant.price <= 28 ? 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400'
                        : variant.price <= 39 ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
                        : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400';

                      return (
                        <button
                          key={variant.ml}
                          onClick={() => !isFull && handleSelectVariant(product, variant)}
                          disabled={isFull}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2 text-xs border rounded transition-all",
                            isFull ? "opacity-40 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                            tierColor
                          )}
                        >
                          <span className="font-medium">{variant.ml}ml</span>
                          <div className="flex items-center gap-2">
                            <span className="line-through text-muted-foreground text-[10px]">
                              €{variant.price.toFixed(2)}
                            </span>
                            <span className="font-bold">€{bundlePrice.toFixed(2)}</span>
                            <Plus size={12} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomBundle;
