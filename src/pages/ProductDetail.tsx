import { useState, forwardRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Zap, Shield, ShoppingBag, CreditCard, Home, ChevronRight, Star, StarHalf } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getProductById, getFeaturedProducts } from '@/data/products';
import { ProductCard, ScentNotesVisual, DeliveryInfo } from '@/components/product';
import { getProductReviews } from '@/data/productReviews';

const ProductDetail = forwardRef<HTMLDivElement>((_, ref) => {
  const { id } = useParams<{ id: string }>();
  const { addItem, toggleCart } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [quantity] = useState(1);

  const product = id ? getProductById(id) : undefined;
  const relatedProducts = getFeaturedProducts().filter(p => p.id !== id).slice(0, 4);
  const reviews = id ? getProductReviews(id) : [];

  // ML variant selection state
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const selectedVariant = product?.variants?.[selectedVariantIndex];
  const displayPrice = selectedVariant?.price || product?.price || 0;
  const displayOriginalPrice = selectedVariant?.originalPrice || product?.originalPrice;
  const isInStock = selectedVariant?.inStock ?? product?.inStock ?? false;

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

  const hasDiscount = displayOriginalPrice && displayOriginalPrice > displayPrice;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      if (selectedVariant) {
        addItem(product, selectedVariant.ml, selectedVariant.price);
      } else {
        addItem(product);
      }
    }
    toggleCart();
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      if (selectedVariant) {
        addItem(product, selectedVariant.ml, selectedVariant.price);
      } else {
        addItem(product);
      }
    }
    navigate('/checkout');
  };

  return (
    <div ref={ref} className="min-h-screen bg-background pb-24 md:pb-12">
      <div className="container py-4 md:py-8">
        {/* Breadcrumb - Hidden on mobile */}
        <nav className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 mb-12 md:mb-24">
          {/* Image */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="aspect-square md:aspect-[3/4] bg-secondary overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="px-1 md:px-0"
          >
            {/* Brand & Name */}
            <p className="text-[10px] md:text-xs tracking-[0.2em] text-muted-foreground font-medium uppercase mb-2">
              {product.brand}
            </p>
            
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-4">
              {product.name}
            </h1>

            {/* ML Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.ml}
                      onClick={() => setSelectedVariantIndex(index)}
                      disabled={!variant.inStock}
                      className={`px-4 py-2 border text-sm font-medium transition-all ${
                        selectedVariantIndex === index
                          ? 'border-primary bg-primary text-primary-foreground'
                          : variant.inStock
                          ? 'border-border bg-background text-foreground hover:border-primary'
                          : 'border-border bg-muted text-muted-foreground cursor-not-allowed line-through'
                      }`}
                    >
                      {variant.ml}ml
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-xl md:text-2xl font-semibold text-foreground">
                {formatPrice(displayPrice)}
              </span>
              {hasDiscount && displayOriginalPrice && (
                <span className="text-base md:text-lg text-muted-foreground line-through">
                  {formatPrice(displayOriginalPrice)}
                </span>
              )}
            </div>

            {/* Delivery Info */}
            <div className="mb-6">
              <DeliveryInfo />
            </div>

            {/* Action Buttons - All Screens */}
            <div className="space-y-3 mb-6 md:mb-8">
              <Button 
                size="lg" 
                className="w-full h-12 md:h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99] transition-all" 
                onClick={handleAddToCart} 
                disabled={!isInStock}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>

              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-12 md:h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-[0.99] transition-all" 
                onClick={handleBuyNow} 
                disabled={!isInStock}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Buy Now
              </Button>
            </div>

            {/* Scent Notes Visual */}
            {product.scentNotes && (
              <div className="py-6 border-t border-border">
                <ScentNotesVisual 
                  scentNotes={product.scentNotes} 
                  scentNotesImage={product.scentNotesImage}
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-3 py-6 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">About This Fragrance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.description}
              </p>
              
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <motion.section 
          className="mb-12 md:mb-24 border-t border-border pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl md:text-3xl text-foreground">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {(() => {
                  const avgRating = reviews.length > 0 
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
                    : 5;
                  const fullStars = Math.floor(avgRating);
                  const hasHalf = avgRating % 1 >= 0.25 && avgRating % 1 < 0.75;
                  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
                  return (
                    <>
                      {[...Array(fullStars)].map((_, i) => (
                        <Star key={`full-${i}`} className="h-4 w-4 md:h-5 md:w-5 fill-accent text-accent" />
                      ))}
                      {hasHalf && <StarHalf className="h-4 w-4 md:h-5 md:w-5 fill-accent text-accent" />}
                      {[...Array(emptyStars)].map((_, i) => (
                        <Star key={`empty-${i}`} className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                      ))}
                    </>
                  );
                })()}
              </div>
              <span className="text-sm text-muted-foreground">
                ({reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '5.0'})
              </span>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4">
            {reviews.map((review, index) => (
              <motion.div 
                key={review.id} 
                className="border border-border p-4 md:p-6 bg-background"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 md:w-10 md:h-10 bg-secondary flex items-center justify-center text-foreground font-medium text-sm">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-foreground">{review.name}</span>
                      {review.verified && (
                        <span className="text-[10px] md:text-xs text-muted-foreground">Verified Buyer</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {(() => {
                          const fullStars = Math.floor(review.rating);
                          const hasHalf = review.rating % 1 >= 0.5;
                          return (
                            <>
                              {[...Array(fullStars)].map((_, i) => (
                                <Star key={`full-${i}`} className="h-3 w-3 fill-accent text-accent" />
                              ))}
                              {hasHalf && <StarHalf className="h-3 w-3 fill-accent text-accent" />}
                            </>
                          );
                        })()}
                      </div>
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </motion.section>
        )}
      </div>

      {/* Sticky Bottom Bar - Mobile Only */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex gap-3 md:hidden z-30">
        <Button 
          className="flex-1 h-12 text-[11px] font-medium tracking-[0.1em] uppercase rounded-none bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all" 
          onClick={handleAddToCart} 
          disabled={!isInStock}
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Add
        </Button>
        <Button 
          className="flex-1 h-12 text-[11px] font-medium tracking-[0.1em] uppercase rounded-none bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] transition-all" 
          onClick={handleBuyNow} 
          disabled={!isInStock}
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Buy Now
        </Button>
      </div>
    </div>
  );
});

ProductDetail.displayName = 'ProductDetail';

export default ProductDetail;