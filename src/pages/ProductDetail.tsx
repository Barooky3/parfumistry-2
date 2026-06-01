import { useState, forwardRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Zap, Shield, ShoppingBag, CreditCard, Home, ChevronRight, Star, StarHalf, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProductById, getFeaturedProducts } from '@/data/products';
import { ProductCard, ScentNotesVisual } from '@/components/product';
import { DeliveryInfo } from '@/components/product/DeliveryInfo';
import { BundleContents } from '@/components/product/BundleContents';
import { ProductAttributes } from '@/components/product/ProductAttributes';
import { useProductPadding, computePaddingAndScale } from '@/hooks/useProductPadding';
import { useDisplayName } from '@/hooks/useProductName';
import { PaddingAdjuster } from '@/components/admin/PaddingAdjuster';
import { NameEditor } from '@/components/admin/NameEditor';

const ProductDetail = forwardRef<HTMLDivElement>((_, ref) => {
  const { id } = useParams<{ id: string }>();
  const { addItem, toggleCart } = useCart();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [quantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const ADMIN_EMAILS = ["ewhz3384@gmail.com"];
  const isAdmin = user && ADMIN_EMAILS.includes(user.email || "");

  const product = id ? getProductById(id) : undefined;
  const paddingOverride = useProductPadding(id || '');
  const displayName = useDisplayName(id || '', product?.name || '');
  const relatedProducts = (() => {
    const all = getFeaturedProducts().filter(p => p.id !== id);
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  })();
  

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
          <h1 className="text-xl font-semibold text-foreground mb-4">{t('productDetail.notFound')}</h1>
          <Button asChild className="rounded-none"><Link to="/shop">{t('productDetail.backToShop')}</Link></Button>
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
          <span className="text-foreground truncate">{displayName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 mb-12 md:mb-24 items-start">
          {/* Image */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="lg:sticky lg:top-8 space-y-6"
          >
            {(() => {
              const { innerStyle, hasOverride } = computePaddingAndScale(paddingOverride);
              const imageList = product.additionalImages && product.additionalImages.length > 0
                ? [...product.additionalImages, product.image]
                : [product.image];
              const currentSrc = imageList[selectedImageIndex] || product.image;
              const isProductShot = currentSrc === product.image;
              return (
                <div 
                  className={cn(
                    "aspect-square bg-secondary flex items-end justify-center relative overflow-hidden",
                    !hasOverride && isProductShot && product.imagePadding
                  )}
                >
                  {isAdmin && <PaddingAdjuster productId={product.id} productName={displayName} variant="detail" />}
                  {isAdmin && <NameEditor productId={product.id} originalName={product.name} variant="detail" />}
                  {product.bundleImages && product.bundleImages.length > 0 ? (
                    <div className="relative w-full h-full" style={innerStyle || undefined}>
                      <img
                        src={product.bundleImages[0]}
                        alt={`${product.name} item 1`}
                        className="absolute top-[8%] left-[4%] h-[58%] w-auto object-contain drop-shadow-md z-10"
                        loading="eager"
                      />
                      <img
                        src={product.bundleImages[2]}
                        alt={`${product.name} item 3`}
                        className="absolute top-[8%] right-[4%] h-[58%] w-auto object-contain drop-shadow-md z-10"
                        loading="eager"
                      />
                      <img
                        src={product.bundleImages[1]}
                        alt={`${product.name} item 2`}
                        className="absolute bottom-[6%] left-1/2 -translate-x-1/2 h-[62%] w-auto object-contain drop-shadow-lg z-20"
                        loading="eager"
                      />
                    </div>
                  ) : (
                    <div style={isProductShot ? (innerStyle || undefined) : undefined} className="w-full h-full flex items-end justify-center">
                      <img 
                        src={currentSrc} 
                        alt={product.name} 
                        className={cn("w-full h-full", isProductShot && (product.imagePadding || hasOverride) ? "object-contain object-bottom" : "object-cover")}
                        loading="eager"
                      />
                    </div>
                  )}
                </div>
              );
            })()}
            {product.additionalImages && product.additionalImages.length > 0 && !product.bundleImages && (
              <div className="flex gap-3 px-1">
                {[...product.additionalImages, product.image].map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "w-20 h-20 md:w-24 md:h-24 bg-secondary overflow-hidden border-2 transition-all flex items-center justify-center",
                      selectedImageIndex === idx ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <img src={src} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}

            <ProductAttributes productId={product.id} />
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
              {displayName}
            </h1>

            {/* ML Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('productDetail.selectSize')}</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={`${variant.ml}-${variant.label || 'std'}-${index}`}
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
                      {variant.label || `${variant.ml}ml`}
                    </button>
                  ))}
                </div>
                {selectedVariant?.note && (
                  <div className="mt-3 flex items-start gap-2 border border-accent/40 bg-accent/5 px-3 py-2 rounded-sm">
                    <Info className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                    <p className="text-[11px] md:text-xs text-foreground/80 leading-snug">
                      {selectedVariant.note}
                    </p>
                  </div>
                )}
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


            {/* Action Buttons - All Screens */}
            <div className="space-y-3 mb-6 md:mb-8">
              <Button 
                size="lg" 
                className="w-full h-12 md:h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99] transition-all" 
                onClick={handleAddToCart} 
                disabled={!isInStock}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {t('productDetail.addToCart')}
              </Button>

              <Button 
                size="lg" 
                variant="outline"
                className="w-full h-12 md:h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none border-accent text-accent hover:bg-accent hover:text-accent-foreground active:scale-[0.99] transition-all" 
                onClick={handleBuyNow} 
                disabled={!isInStock}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                {t('productDetail.buyNow')}
              </Button>
            </div>

            {/* Delivery Timeline */}
            <div className="mt-5 mb-10">
              <DeliveryInfo />
            </div>


            {product.scentNotes && (
              <div className="pt-10 pb-6 border-t border-border">
                <ScentNotesVisual 
                  scentNotes={product.scentNotes} 
                  accentColor={product.accentColor}
                  noteImages={product.scentNoteImages}
                />
              </div>
            )}

            {/* Bundle Contents */}
            {product.bundleContents && product.bundleContents.length > 0 && (
              <div className="py-6 border-t border-border">
                <BundleContents contents={product.bundleContents} />
              </div>
            )}

            {/* Description */}
            <div className="space-y-3 py-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground">
                {product.isBundle ? t('productDetail.aboutBundle') : t('productDetail.aboutFragrance')}
              </h3>
              <p className="text-[15px] md:text-base text-foreground/80 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

          </motion.div>
        </div>


        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-8">{t('productDetail.youMayAlsoLike')}</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} imageAspect="square" />)}
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
            {t('productDetail.add')}
          </Button>
        <Button 
          className="flex-1 h-12 text-[11px] font-medium tracking-[0.1em] uppercase rounded-none bg-accent text-accent-foreground hover:bg-accent/90 active:scale-[0.98] transition-all" 
          onClick={handleBuyNow} 
          disabled={!isInStock}
        >
            <CreditCard className="h-4 w-4 mr-2" />
            {t('productDetail.buyNow')}
        </Button>
      </div>
    </div>
  );
});

ProductDetail.displayName = 'ProductDetail';

export default ProductDetail;