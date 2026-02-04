import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Minus, Plus, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getFeaturedProducts } from '@/data/products';
import { ProductCard } from '@/components/product';
import { cn } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = getFeaturedProducts().filter(p => p.id !== id).slice(0, 3);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Product Not Found
          </h1>
          <Button asChild>
            <Link to="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

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

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
  };

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="aspect-square bg-card rounded-2xl p-8 flex items-center justify-center shadow-card">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-up">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline" className="rounded-full">
                {getCategoryLabel(product.category)}
              </Badge>
              {hasDiscount && (
                <Badge className="bg-accent text-accent-foreground rounded-full">
                  Save {discountPercent}%
                </Badge>
              )}
            </div>

            {/* Title */}
            <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif text-3xl font-semibold text-foreground">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Scent Notes */}
            <div className="bg-background rounded-xl p-6 mb-8">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-4">
                Scent Notes
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-16">Top</span>
                  <p className="text-sm text-foreground">{product.scentNotes.top.join(', ')}</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-16">Heart</span>
                  <p className="text-sm text-foreground">{product.scentNotes.heart.join(', ')}</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-16">Base</span>
                  <p className="text-sm text-foreground">{product.scentNotes.base.join(', ')}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-background rounded-full p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 rounded-full gap-2"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="h-5 w-5" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Fast Shipping</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">100% Authentic</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <Separator className="mb-12" />
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
