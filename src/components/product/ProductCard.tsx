import { forwardRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, className }, ref) => {
    const { addItem, toggleCart } = useCart();
    const navigate = useNavigate();
    const [isTouched, setIsTouched] = useState(false);
    
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
      ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
      : 0;

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
      }).format(price);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const firstVariant = product.variants?.[0];
      if (firstVariant) {
        addItem(product, firstVariant.ml, firstVariant.price);
      } else {
        addItem(product);
      }
      toggleCart();
    };

    const handleBuyNow = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const firstVariant = product.variants?.[0];
      if (firstVariant) {
        addItem(product, firstVariant.ml, firstVariant.price);
      } else {
        addItem(product);
      }
      navigate('/checkout');
    };

    // Get top 3 scent notes to display (combine all types)
    const getScentNotesDisplay = () => {
      if (!product.scentNotes) return null;
      const allNotes = [
        ...(product.scentNotes.top || []),
        ...(product.scentNotes.heart || []),
        ...(product.scentNotes.base || []),
      ];
      return allNotes.slice(0, 3);
    };

    const scentNotes = getScentNotesDisplay();

    // Touch handlers for mobile
    const handleTouchStart = () => setIsTouched(true);
    const handleTouchEnd = () => {
      // Delay hiding to allow button clicks
      setTimeout(() => setIsTouched(false), 150);
    };

    return (
      <motion.div 
        ref={ref} 
        className={cn('group', className)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Image Container */}
        <Link to={`/product/${product.id}`} className="block relative mb-2.5">
          <div className="aspect-[3/4] bg-secondary overflow-hidden rounded-sm">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
          
          {/* Category Badge */}
          <span className="absolute top-2 left-2 text-[9px] font-medium tracking-[0.08em] px-2 py-1 bg-background/90 text-foreground uppercase">
            {product.category === 'men' ? 'For Him' : product.category === 'women' ? 'For Her' : product.category === 'bundle' ? 'Bundle' : 'Unisex'}
          </span>
          
          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-[9px] font-semibold px-1.5 py-0.5">
              -{discountPercent}%
            </span>
          )}

          {/* Quick Action Overlay - Desktop: hover, Mobile: touch */}
          <div className="absolute bottom-2 left-2 right-2 flex gap-1.5">
            {/* Desktop - hover only */}
            <div className="hidden md:flex gap-1.5 w-full pointer-events-none group-hover:pointer-events-auto opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-9 text-[9px] font-medium tracking-[0.05em] uppercase rounded-sm bg-primary/95 text-primary-foreground hover:bg-primary active:scale-[0.97] transition-all shadow-lg backdrop-blur-sm"
                disabled={!product.inStock}
              >
                Add
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-1 h-9 text-[9px] font-medium tracking-[0.05em] uppercase rounded-sm bg-accent/95 text-accent-foreground hover:bg-accent active:scale-[0.97] transition-all shadow-lg backdrop-blur-sm"
                disabled={!product.inStock}
              >
                Buy
              </Button>
            </div>
            
            {/* Mobile - touch only */}
            <div 
              className={cn(
                "flex md:hidden gap-1.5 w-full transition-all duration-200",
                isTouched 
                  ? "opacity-100 translate-y-0 pointer-events-auto" 
                  : "opacity-0 translate-y-2 pointer-events-none"
              )}
            >
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-8 text-[8px] font-medium tracking-[0.05em] uppercase rounded-sm bg-primary/95 text-primary-foreground hover:bg-primary active:scale-[0.97] transition-all shadow-lg backdrop-blur-sm"
                disabled={!product.inStock}
              >
                Add
              </Button>
              <Button
                onClick={handleBuyNow}
                className="flex-1 h-8 text-[8px] font-medium tracking-[0.05em] uppercase rounded-sm bg-accent/95 text-accent-foreground hover:bg-accent active:scale-[0.97] transition-all shadow-lg backdrop-blur-sm"
                disabled={!product.inStock}
              >
                Buy
              </Button>
            </div>
          </div>

          {/* Out of Stock Overlay */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-foreground">Sold Out</span>
            </div>
          )}
        </Link>

        {/* Content - Compact */}
        <div className="space-y-1.5">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-xs font-medium text-foreground group-hover:text-accent transition-colors leading-tight line-clamp-2">
              {product.name}
            </h3>
          </Link>

          {/* Scent Notes */}
          {scentNotes && scentNotes.length > 0 && (
            <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
              {scentNotes.join(' · ')}
            </p>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);

ProductCard.displayName = 'ProductCard';
