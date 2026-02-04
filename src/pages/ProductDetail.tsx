import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Minus, Plus, Truck, ShieldCheck, RotateCcw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getFeaturedProducts } from '@/data/products';
import { ProductCard } from '@/components/product';

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
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container">
        {/* Breadcrumb */}
        <Button
          variant="ghost"
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Shop
        </Button>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="aspect-square bg-card rounded-lg border border-border p-8 lg:p-12 flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-up">
            {/* Category & Brand */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary font-medium uppercase tracking-wider text-sm">
                {getCategoryLabel(product.category)}
              </span>
              {hasDiscount && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded">
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            <p className="text-muted-foreground uppercase tracking-wider text-sm mb-2">
              {product.brand}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-6">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-serif text-4xl font-semibold text-primary">
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
            <div className="bg-card rounded-lg p-6 border border-border mb-8">
              <h3 className="font-semibold text-foreground mb-4 uppercase tracking-wider text-sm">
                Scent Profile
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-primary w-16 uppercase tracking-wider">Top</span>
                  <p className="text-sm text-foreground/80">{product.scentNotes.top.join(' • ')}</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-primary w-16 uppercase tracking-wider">Heart</span>
                  <p className="text-sm text-foreground/80">{product.scentNotes.heart.join(' • ')}</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-sm font-medium text-primary w-16 uppercase tracking-wider">Base</span>
                  <p className="text-sm text-foreground/80">{product.scentNotes.base.join(' • ')}</p>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold text-lg">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 h-12 gap-2 font-semibold text-base"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <ShoppingBag className="h-5 w-5" />
                {product.inStock ? 'Add to Bag' : 'Out of Stock'}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-border hover:border-primary"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Fast Shipping</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">100% Authentic</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-5 w-5 mx-auto text-primary mb-2" />
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <Separator className="mb-12" />
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
                You May Also Like
              </h2>
              <Button variant="ghost" className="text-muted-foreground hover:text-primary" asChild>
                <Link to="/shop">View All</Link>
              </Button>
            </div>
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
