import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Zap, ShieldCheck, Home, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getFeaturedProducts } from '@/data/products';
import { ProductCard } from '@/components/product';

const reviews = [
  { id: 1, name: 'Tyler', text: 'this one hits different bro everyone keeps asking what im wearing', verified: true, rating: 5, date: '1 week ago' },
  { id: 2, name: 'Oliver', text: 'makes people turn their head when you walk by trust', verified: true, rating: 5, date: '3 weeks ago' },
  { id: 3, name: 'Tony', text: 'walked into a party and instantly got asked about it', verified: true, rating: 5, date: '1 week ago' },
  { id: 4, name: 'Trey', text: 'even my mom complimented me and she never does', verified: true, rating: 5, date: '1 week ago' },
  { id: 5, name: 'Terrence', text: 'sister said i finally smell like an adult lmao', verified: true, rating: 5, date: '2 weeks ago' },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, toggleCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = getFeaturedProducts().filter(p => p.id !== id).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-4">Product Not Found</h1>
          <Button asChild><Link to="/shop">Back to Shop</Link></Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(price);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    toggleCart();
  };

  return (
    <div className="min-h-screen py-6 md:py-10 bg-background">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-20">
          {/* Image */}
          <div className="animate-fade-in">
            <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="animate-slide-up">
            <p className="text-xs tracking-wider text-primary font-medium uppercase mb-2">{product.brand}</p>
            
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-semibold text-foreground">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
              )}
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              Taxes included. Shipping calculated at checkout.
            </p>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-primary" />
                Instant Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Verified Seller
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-secondary rounded-lg border border-border">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-muted-foreground hover:text-foreground" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium text-foreground">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 text-muted-foreground hover:text-foreground" 
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-12 gap-2 font-medium tracking-wider text-sm bg-card text-foreground border border-border hover:bg-secondary" 
                onClick={handleAddToCart} 
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>

              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-12 gap-2 font-medium tracking-wider text-sm border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
                onClick={handleBuyNow} 
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              <p className="text-xs text-muted-foreground italic">
                This is a digital product. After purchase, you'll receive access to the seller link. No refunds available.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl text-foreground">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>
          </div>

          <div className="grid gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-secondary rounded-lg p-5 border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{review.name}</span>
                      {review.verified && (
                        <span className="text-xs text-emerald-400 font-medium">Verified</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
