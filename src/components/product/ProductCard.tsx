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

  return (
    <div className={cn('group', className)}>
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative mb-4">
        <div className="aspect-square bg-secondary rounded-2xl p-6 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:bg-secondary/80">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-foreground text-background text-xs font-medium px-2.5 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="space-y-2">
        <Link to={`/product/${product.id}`}>
          <p className="text-xs text-muted-foreground">
            {product.category === 'men' ? 'Men' : product.category === 'women' ? 'Women' : 'Unisex'}
          </p>
          <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground">
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
          className="w-full mt-2 gap-2 font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
          disabled={!product.inStock}
        >
          <ShoppingBag className="h-4 w-4" />
          {product.inStock ? 'Add to Bag' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};
