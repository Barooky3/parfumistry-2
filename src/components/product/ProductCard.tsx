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

  const categoryColor = product.category === 'men' 
    ? 'bg-blue-500/10 text-blue-600' 
    : product.category === 'women' 
    ? 'bg-pink-500/10 text-pink-600' 
    : 'bg-amber-500/10 text-amber-600';

  return (
    <div className={cn('group', className)}>
      {/* Image */}
      <Link to={`/product/${product.id}`} className="block relative mb-4">
        <div className="aspect-square bg-gradient-to-br from-secondary to-secondary/50 rounded-2xl p-6 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/5">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        
        {/* Category Badge */}
        <span className={cn("absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full", categoryColor)}>
          {product.category === 'men' ? 'For Him' : product.category === 'women' ? 'For Her' : 'Unisex'}
        </span>
        
        {hasDiscount && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            -{discountPercent}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="space-y-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-foreground">
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
          className="w-full mt-2 gap-2 font-semibold rounded-full bg-foreground text-background hover:bg-foreground/90"
          disabled={!product.inStock}
        >
          <ShoppingBag className="h-4 w-4" />
          {product.inStock ? 'Add to Cart' : 'Sold Out'}
        </Button>
      </div>
    </div>
  );
};
