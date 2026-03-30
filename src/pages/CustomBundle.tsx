import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getFragrances } from '@/data/products';
import { Product, ProductVariant } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { cn } from '@/lib/utils';
import { X, Sparkles, Plus, Search, ShoppingBag } from 'lucide-react';
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

// Get the largest/standard variant for a product
const getStandardVariant = (product: Product): ProductVariant | null => {
  if (!product.variants || product.variants.length === 0) return null;
  const inStock = product.variants.filter(v => v.inStock);
  if (inStock.length === 0) return null;
  // Pick the largest ml variant
  return inStock.reduce((best, v) => v.ml > best.ml ? v : best, inStock[0]);
};

const CustomBundle = () => {
  const [selections, setSelections] = useState<BundleSelection[]>([]);
  const [bundleName, setBundleName] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();

  const fragrances = useMemo(() => {
    return getFragrances().filter(p => p.inStock && p.variants && p.variants.length > 0);
  }, []);

  const filteredFragrances = useMemo(() => {
    if (!search.trim()) return fragrances;
    const q = search.toLowerCase();
    return fragrances.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }, [fragrances, search]);

  const totalPrice = selections.reduce((sum, s) => sum + s.bundlePrice, 0);

  const handleSelect = (product: Product) => {
    if (selections.length >= MAX_ITEMS) return;
    const variant = getStandardVariant(product);
    if (!variant) return;
    const bundlePrice = getBundlePrice(variant.price);
    setSelections(prev => [...prev, { product, variant, bundlePrice }]);
  };

  const handleRemove = (index: number) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddToCart = () => {
    const bundleProduct: Product = {
      id: `custom-bundle-${Date.now()}`,
      name: (bundleName.trim() || 'Custom Bundle') + ' (' + selections.map(s => s.product.name).join(', ') + ')',
      brand: 'Parfumistry',
      price: totalPrice,
      category: 'bundle',
      description: `Custom bundle: ${selections.map(s => `${s.product.name} ${s.variant.ml}ml`).join(', ')}`,
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
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-3xl md:text-5xl text-foreground mb-3">
            Create Your Own Bundle
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Pick 5 fragrances and craft your perfect collection
          </p>
        </motion.div>

        {/* Name your bundle card */}
        <motion.div
          className="max-w-lg mx-auto mb-10 rounded-lg border-2 border-accent/40 bg-accent/5 p-6 text-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={18} className="text-accent" />
            <span className="text-sm font-semibold uppercase tracking-widest text-foreground">
              Name Your Bundle
            </span>
          </div>
          <input
            type="text"
            value={bundleName}
            onChange={(e) => setBundleName(e.target.value)}
            placeholder="e.g. Summer Vibes, Night Out, My Collection..."
            maxLength={40}
            className="w-full text-center bg-background border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/60 transition-shadow"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Give your bundle a personal touch!
          </p>
        </motion.div>

        {/* Sticky summary bar */}
        <motion.div
          className="sticky top-16 z-30 bg-secondary/80 backdrop-blur-md border border-border rounded-lg py-4 px-5 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-accent" />
              <span className="text-sm font-semibold text-foreground">
                {selections.length}/{MAX_ITEMS} selected
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: MAX_ITEMS }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-300",
                      i < selections.length
                        ? "bg-accent scale-110"
                        : "bg-muted-foreground/20"
                    )}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={selections.length !== MAX_ITEMS}
              className="rounded-md text-xs uppercase tracking-widest gap-2"
              size="sm"
            >
              <ShoppingBag size={14} />
              Add to Cart — €{totalPrice.toFixed(2)}
            </Button>
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
                    className="flex items-center gap-1.5 bg-background text-foreground text-xs px-3 py-1.5 rounded-full border border-border shadow-sm"
                  >
                    <span className="max-w-[120px] truncate">{sel.product.name}</span>
                    <span className="text-muted-foreground">({sel.variant.ml}ml)</span>
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
        </motion.div>

        {/* Search bar */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search fragrances..."
              className="w-full bg-secondary border border-border rounded-md pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/60 transition-shadow"
            />
          </div>
        </div>

        {/* Fragrance grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFragrances.map((product) => {
            const timesSelected = selections.filter(s => s.product.id === product.id).length;
            const isFull = selections.length >= MAX_ITEMS;
            const variant = getStandardVariant(product);
            if (!variant) return null;
            const bundlePrice = getBundlePrice(variant.price);

            return (
              <motion.div
                key={product.id}
                className={cn(
                  "border border-border bg-background overflow-hidden transition-all group cursor-pointer",
                  timesSelected > 0 && "ring-2 ring-accent",
                  isFull && timesSelected === 0 && "opacity-40"
                )}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                whileHover={!isFull ? { y: -4, transition: { duration: 0.2 } } : {}}
                onClick={() => !isFull && handleSelect(product)}
              >
                {/* Image */}
                <div className="aspect-square bg-secondary flex items-center justify-center p-4 relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  {timesSelected > 0 && (
                    <div className="absolute top-2 right-2 bg-accent text-accent-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md">
                      {timesSelected}
                    </div>
                  )}
                  {!isFull && timesSelected === 0 && (
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-accent text-accent-foreground rounded-full p-2 shadow-lg">
                        <Plus size={18} />
                      </div>
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
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{variant.ml}ml</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] line-through text-muted-foreground">€{variant.price.toFixed(2)}</span>
                      <span className="text-sm font-bold text-accent">€{bundlePrice.toFixed(2)}</span>
                    </div>
                  </div>
                  {(() => {
                    const savings = Math.round((1 - bundlePrice / variant.price) * 100);
                    return (
                      <div className="mt-1 text-[10px] font-semibold text-accent uppercase tracking-wider">
                        Save {savings}%
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredFragrances.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No fragrances found matching "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomBundle;
