import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShoppingBag, Shield, Truck, CreditCard, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(price);

  const handleCompletePurchase = () => {
    items.forEach((item) => {
      if (item.product.affiliateUrl && item.product.affiliateUrl !== '#') {
        window.open(item.product.affiliateUrl, '_blank');
      }
    });
    setIsCompleted(true);
    clearCart();
    toast({ title: 'Order Processing', description: 'Complete your purchase to receive your fragrance.' });
  };

  if (items.length === 0 && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Your bag is empty</h1>
          <p className="text-sm text-muted-foreground mb-6">Add items to checkout</p>
          <Button asChild><Link to="/shop">Shop Now</Link></Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Order Confirmed!</h1>
          <p className="text-sm text-muted-foreground mb-6">Complete your payment in the new window to finalize your order.</p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
            <Button variant="outline" asChild><Link to="/">Home</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground" asChild>
          <Link to="/shop"><ArrowLeft className="h-4 w-4" />Continue Shopping</Link>
        </Button>

        <h1 className="text-2xl font-semibold text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Summary */}
          <div className="lg:col-span-3">
            <div className="bg-secondary rounded-xl p-5">
              <h2 className="text-sm font-medium text-foreground mb-4">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 p-3 bg-background rounded-lg">
                    <div className="w-14 h-14 bg-secondary rounded flex items-center justify-center flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-xl font-semibold text-foreground">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Checkout */}
          <div className="lg:col-span-2">
            <div className="bg-secondary rounded-xl p-5 sticky top-[110px]">
              <Button size="lg" className="w-full gap-2 font-medium rounded-full" onClick={handleCompletePurchase}>
                <Package className="h-4 w-4" />
                Complete Order
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">Secure checkout • Instant processing</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Shield className="h-3.5 w-3.5 text-primary" />100% authentic products</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><CreditCard className="h-3.5 w-3.5 text-primary" />Secure payment</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Truck className="h-3.5 w-3.5 text-primary" />Fast worldwide delivery</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
