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
    addItem(product);
    toggleCart();
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    navigate('/checkout');
  };

  return (
    <div className={cn('group', className)}>
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative mb-3 md:mb-4">
        <div className="aspect-[3/4] bg-secondary overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        
        {/* Category Badge */}
        <span className="absolute top-2 left-2 md:top-3 md:left-3 text-[9px] md:text-[10px] font-medium tracking-[0.1em] px-2 md:px-3 py-1 md:py-1.5 bg-background text-foreground uppercase border border-border">
          {product.category === 'men' ? 'For Him' : product.category === 'women' ? 'For Her' : 'Unisex'}
        </span>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 md:top-3 md:right-3 bg-accent text-accent-foreground text-[9px] md:text-[10px] font-semibold px-1.5 md:px-2 py-0.5 md:py-1">
            -{discountPercent}%
          </span>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="text-xs font-medium tracking-[0.1em] uppercase text-foreground">Sold Out</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xs md:text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-tight line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs md:text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[10px] md:text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {product.inStock ? (
          <div className="flex flex-col gap-2 pt-1">
            <Button
              onClick={handleAddToCart}
              className="w-full h-10 text-[10px] md:text-xs font-medium tracking-[0.08em] uppercase rounded-none bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
              Add to Cart
            </Button>
            <Button
              onClick={handleBuyNow}
              variant="outline"
              className="w-full h-10 text-[10px] md:text-xs font-medium tracking-[0.08em] uppercase rounded-none border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-[0.98] transition-all"
            >
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Buy Now
            </Button>
          </div>
        ) : (
          <Button
            disabled
            variant="outline"
            className="w-full h-10 text-[10px] md:text-xs font-medium tracking-[0.1em] uppercase rounded-none border-muted text-muted-foreground mt-1"
          >
            Sold Out
          </Button>
        )}
      </div>
    </div>
  );
};
