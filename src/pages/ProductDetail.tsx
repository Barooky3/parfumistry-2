import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Minus, Plus, Truck, Shield, Home, ChevronRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getProductById, getFeaturedProducts } from '@/data/products';
import { ProductCard } from '@/components/product';

const reviews = [
  { id: 1, name: 'Tyler', text: 'This one hits different, everyone keeps asking what I\'m wearing.', verified: true, rating: 5, date: '1 week ago' },
  { id: 2, name: 'Oliver', text: 'Makes people turn their head when you walk by. Trust.', verified: true, rating: 5, date: '3 weeks ago' },
  { id: 3, name: 'Tony', text: 'Walked into a party and instantly got asked about it.', verified: true, rating: 5, date: '1 week ago' },
  { id: 4, name: 'Emma', text: 'The perfect signature scent. Elegant and long-lasting.', verified: true, rating: 5, date: '2 weeks ago' },
  { id: 5, name: 'Sarah', text: 'Absolutely love it. Professional and sophisticated.', verified: true, rating: 5, date: '2 weeks ago' },
];

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem, toggleCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = getFeaturedProducts().filter(p => p.id !== id).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-4">Product Not Found</h1>
          <Button asChild className="rounded-none"><Link to="/shop">Back to Shop</Link></Button>
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
    <div className="min-h-screen py-8 md:py-12 bg-background">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          {/* Image */}
          <div className="animate-fade-in">
            <div className="aspect-[3/4] bg-secondary overflow-hidden">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info */}
          <div className="animate-slide-up">
            <p className="text-xs tracking-[0.2em] text-muted-foreground font-medium uppercase mb-3">{product.brand}</p>
            
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-6">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-semibold text-foreground">{formatPrice(product.price)}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
              )}
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-8 mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" strokeWidth={1.5} />
                Instant Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" strokeWidth={1.5} />
                Verified Seller
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-xs font-medium tracking-[0.1em] uppercase text-muted-foreground">Quantity</span>
                <div className="flex items-center border border-border">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-none hover:bg-secondary" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium text-foreground">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-none hover:bg-secondary" 
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                size="lg" 
                className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none bg-primary text-primary-foreground hover:bg-primary/90" 
                onClick={handleAddToCart} 
                disabled={!product.inStock}
              >
                Add to Cart
              </Button>

              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none border-accent text-accent hover:bg-accent hover:text-accent-foreground" 
                onClick={handleBuyNow} 
                disabled={!product.inStock}
              >
                Buy Now
              </Button>
            </div>

            {/* Description */}
            <div className="space-y-4 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
              <p className="text-xs text-muted-foreground">
                Digital product. After purchase, you'll receive access to the seller link via email.
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-display text-3xl text-foreground">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-foreground text-foreground" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">({reviews.length})</span>
            </div>
          </div>

          <div className="grid gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-secondary flex items-center justify-center text-foreground font-medium">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{review.name}</span>
                      {review.verified && (
                        <span className="text-xs text-muted-foreground">Verified Buyer</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-foreground text-foreground" />
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
            <h2 className="font-display text-3xl text-foreground mb-10">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
