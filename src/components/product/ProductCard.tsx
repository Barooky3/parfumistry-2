import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
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

  return (
    <div
      className={cn(
        'group bg-card rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 shadow-card hover:shadow-card-hover',
        className
      )}
    >
      {/* Image Container */}
      <Link to={`/product/${product.id}`} className="block relative">
        <div className="aspect-square bg-gradient-to-b from-muted to-background p-6 flex items-center justify-center overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-background/80 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 rounded border border-border">
            {getCategoryLabel(product.category)}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link to={`/product/${product.id}`} className="block">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <h3 className="font-serif text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-3">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-bold text-xl text-primary">
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
          className="w-full gap-2 font-semibold"
          disabled={!product.inStock}
        >
          <ShoppingBag className="h-4 w-4" />
          {product.inStock ? 'Add to Bag' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};
