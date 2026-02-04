import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
          <h1 className="text-xl font-semibold text-foreground mb-4">Product Not Found</h1>
          <Button asChild><Link to="/shop">Back to Shop</Link></Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(price);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
  };

  return (
    <div className="min-h-screen py-6 md:py-10">
      <div className="container">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mb-16">
          {/* Image */}
          <div className="animate-fade-in">
            <div className="aspect-square bg-secondary rounded-2xl p-8 lg:p-12 flex items-center justify-center">
              <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Info */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-muted-foreground">
                {product.category === 'men' ? 'Men' : product.category === 'women' ? 'Women' : 'Unisex'}
              </span>
              {hasDiscount && (
                <span className="bg-foreground text-background text-xs font-medium px-2 py-0.5 rounded-full">
                  -{discountPercent}%
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-semibold text-foreground">{formatPrice(product.price)}</span>
              {hasDiscount && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Scent Notes */}
            <div className="bg-secondary rounded-xl p-5 mb-6">
              <h3 className="text-sm font-medium text-foreground mb-3">Scent Notes</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3"><span className="text-primary font-medium w-12">Top</span><span className="text-muted-foreground">{product.scentNotes.top.join(', ')}</span></div>
                <div className="flex gap-3"><span className="text-primary font-medium w-12">Heart</span><span className="text-muted-foreground">{product.scentNotes.heart.join(', ')}</span></div>
                <div className="flex gap-3"><span className="text-primary font-medium w-12">Base</span><span className="text-muted-foreground">{product.scentNotes.base.join(', ')}</span></div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1 bg-secondary rounded-lg">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQuantity(quantity + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
              <Button size="lg" className="flex-1 gap-2 font-medium rounded-full" onClick={handleAddToCart} disabled={!product.inStock}>
                <ShoppingBag className="h-5 w-5" />
                {product.inStock ? 'Add to Bag' : 'Out of Stock'}
              </Button>
            </div>

            {/* Trust */}
            <div className="flex gap-6 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4 text-primary" />Fast Shipping</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Shield className="h-4 w-4 text-primary" />Authentic</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><RotateCcw className="h-4 w-4 text-primary" />Easy Returns</div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border pt-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
