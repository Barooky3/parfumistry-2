import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Zap } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem, toggleCart } = useCart();
  const navigate = useNavigate();
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
    // Use first variant if available, otherwise base price
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

  return (
    <div className={cn('group', className)}>
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative mb-2.5">
        <div className="aspect-[3/4] bg-secondary overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        {/* Category Badge */}
        <span className="absolute top-2 left-2 text-[9px] font-medium tracking-[0.08em] px-2 py-1 bg-background/90 text-foreground uppercase">
          {product.category === 'men' ? 'For Him' : product.category === 'women' ? 'For Her' : 'Unisex'}
        </span>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-[9px] font-semibold px-1.5 py-0.5">
            -{discountPercent}%
          </span>
        )}

        {/* Quick Action Overlay - appears on hover */}
        <div className="absolute bottom-2 left-2 right-2 flex gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          <Button
            onClick={handleAddToCart}
            className="flex-1 h-8 text-[9px] font-medium tracking-[0.05em] uppercase rounded-none bg-primary/95 text-primary-foreground hover:bg-primary active:scale-[0.98] transition-all"
            disabled={!product.inStock}
          >
            Add
          </Button>
          <Button
            onClick={handleBuyNow}
            className="flex-1 h-8 text-[9px] font-medium tracking-[0.05em] uppercase rounded-none bg-accent/95 text-accent-foreground hover:bg-accent active:scale-[0.98] transition-all"
            disabled={!product.inStock}
          >
            Buy
          </Button>
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-[10px] font-medium tracking-[0.1em] uppercase text-foreground">Sold Out</span>
          </div>
        )}
      </Link>

      {/* Content - Compact */}
      <div className="space-y-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xs font-medium text-foreground group-hover:text-accent transition-colors leading-tight line-clamp-2">
            {product.name}
          </h3>
        </Link>

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
    </div>
  );
};