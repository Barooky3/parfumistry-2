import { forwardRef, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useProductPadding, computePaddingAndScale } from '@/hooks/useProductPadding';
import { PaddingAdjuster } from '@/components/admin/PaddingAdjuster';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product, className }, ref) => {
    const { addItem, toggleCart } = useCart();
    const { formatPrice } = useCurrency();
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showButtons, setShowButtons] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const paddingOverride = useProductPadding(product.id);
    
    const ADMIN_EMAILS = ["ewhz3384@gmail.com"];
    const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");
    
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
      ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
      : 0;

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

    // Handle touch for mobile - show buttons on touch
    const handleTouchStart = () => {
      setShowButtons(true);
    };

    // Handle card tap for navigation
    const handleCardClick = (e: React.MouseEvent) => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      if (isTouchDevice && !showButtons) {
        // If buttons not showing yet, show them and prevent navigation
        e.preventDefault();
        setShowButtons(true);
      }
      // If buttons are showing, allow normal navigation
    };

    // Close buttons when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
          setShowButtons(false);
        }
      };

      if (showButtons) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }, [showButtons]);

    return (
      <motion.div 
        ref={(node) => {
          // Handle both refs
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn('group', className)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onTouchStart={handleTouchStart}
      >
        {/* Image Container */}
        <Link 
          to={`/product/${product.id}`} 
          className="block relative mb-2.5"
          onClick={handleCardClick}
        >
         {(() => {
            const { innerStyle, hasOverride } = computePaddingAndScale(paddingOverride);
            return (
              <div 
                className={cn(
                  "aspect-[3/4] bg-secondary rounded-sm flex items-end justify-center relative overflow-hidden",
                  !hasOverride && product.imagePadding
                )}
              >
                {isAdmin && <PaddingAdjuster productId={product.id} productName={product.name} />}
                {product.bundleImages && product.bundleImages.length > 0 ? (
                  <div className="relative w-full h-full" style={innerStyle || undefined}>
                    <motion.img
                      src={product.bundleImages[0]}
                      alt={`${product.name} item 1`}
                      className="absolute top-[8%] left-[2%] h-[60%] w-auto object-contain drop-shadow-md z-10"
                      loading="lazy"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.img
                      src={product.bundleImages[2]}
                      alt={`${product.name} item 3`}
                      className="absolute top-[8%] right-[2%] h-[60%] w-auto object-contain drop-shadow-md z-10"
                      loading="lazy"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.img
                      src={product.bundleImages[1]}
                      alt={`${product.name} item 2`}
                      className="absolute bottom-[4%] left-1/2 -translate-x-1/2 h-[65%] w-auto object-contain drop-shadow-lg z-20"
                      loading="lazy"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                ) : (
                  <div style={innerStyle || undefined} className="w-full h-full flex items-end justify-center">
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className={cn("w-full h-full", (product.imagePadding || hasOverride) ? "object-contain object-bottom" : "object-cover")}
                      loading="lazy"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  </div>
                )}
              </div>
            );
          })()}
          
          {/* Category Badge */}
          <span className="absolute top-2 left-2 text-[9px] font-medium tracking-[0.08em] px-2 py-1 bg-background/90 text-foreground uppercase">
            {product.category === 'men' ? t('product.forHim') : product.category === 'women' ? t('product.forHer') : product.category === 'bundle' ? t('product.bundle') : t('product.unisex')}
          </span>
          
          {/* Hot Deal Fire Badge */}
          {product.hotDeal && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[85%] z-30 pointer-events-none">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-destructive/20 blur-xl scale-150" />
                <Flame size={40} className="text-destructive drop-shadow-[0_0_12px_hsl(var(--destructive)/0.7)] animate-pulse" strokeWidth={2.5} />
              </div>
            </div>
          )}

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
            
            {/* Mobile - tap to show */}
            <div 
              className={cn(
                "flex md:hidden gap-1.5 w-full transition-all duration-200",
                showButtons 
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
              <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-foreground">{t('product.soldOut')}</span>
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
