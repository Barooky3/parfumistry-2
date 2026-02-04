import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Product } from '@/types/product';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'men':
        return 'For Him';
      case 'women':
        return 'For Her';
      default:
        return 'Unisex';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'men':
        return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'women':
        return 'bg-secondary/30 text-secondary-foreground border-secondary/30';
      default:
        return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  return (
    <div
      className={cn(
        'group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1',
        className
      )}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="aspect-square bg-muted p-6 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge
            variant="outline"
            className={cn(
              'text-xs font-medium rounded-full',
              getCategoryColor(product.category)
            )}
          >
            {getCategoryLabel(product.category)}
          </Badge>
          {hasDiscount && (
            <Badge className="bg-accent text-accent-foreground text-xs font-medium rounded-full">
              -{discountPercent}%
            </Badge>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-semibold text-lg text-foreground">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.originalPrice!)}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={() => addItem(product)}
          className="w-full rounded-full gap-2"
          disabled={!product.inStock}
        >
          <ShoppingBag className="h-4 w-4" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};
