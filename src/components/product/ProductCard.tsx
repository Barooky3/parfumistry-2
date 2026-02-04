import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addItem } = useCart();
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

  return (
    <div className={cn('group', className)}>
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative mb-4">
        <div className="aspect-[3/4] bg-secondary overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 text-[10px] font-medium tracking-[0.1em] px-3 py-1.5 bg-background text-foreground uppercase border border-border">
          {product.category === 'men' ? 'For Him' : product.category === 'women' ? 'For Her' : 'Unisex'}
        </span>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px] font-semibold px-2 py-1">
            -{discountPercent}%
          </span>
        )}

        {/* Quick Add Button */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            addItem(product);
          }}
          size="icon"
          className="absolute bottom-3 right-3 h-10 w-10 bg-primary text-primary-foreground opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 rounded-none"
          disabled={!product.inStock}
        >
          <Plus className="h-5 w-5" />
        </Button>
      </Link>

      {/* Content */}
      <div className="space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors leading-tight line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        <Button
          onClick={() => addItem(product)}
          variant="outline"
          className="w-full h-11 text-xs font-medium tracking-[0.1em] uppercase mt-2 rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Sold Out'}
        </Button>
      </div>
    </div>
  );
};
