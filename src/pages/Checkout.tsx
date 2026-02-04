import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, CheckCircle, ShoppingBag, Shield, Truck, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const handleCompletePurchase = () => {
    items.forEach((item) => {
      if (item.product.affiliateUrl && item.product.affiliateUrl !== '#') {
        window.open(item.product.affiliateUrl, '_blank');
      }
    });

    setIsCompleted(true);
    clearCart();

    toast({
      title: 'Redirecting to seller...',
      description: 'Complete your purchase on our trusted partner site.',
    });
  };

  if (items.length === 0 && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-foreground mb-4">
            Your bag is empty
          </h1>
          <p className="text-muted-foreground mb-8">
            Add some fragrances to your bag to checkout.
          </p>
          <Button className="font-semibold" asChild>
            <Link to="/shop">Explore Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold text-foreground mb-4">
            Almost There!
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            You've been redirected to our trusted seller to complete your purchase. 
            Check the new tab(s) that opened to finalize your order.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="font-semibold" asChild>
              <Link to="/shop">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="container max-w-5xl">
        <Button variant="ghost" className="mb-8 gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/shop">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>

        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h2 className="font-semibold text-foreground mb-6 uppercase tracking-wider text-sm">
                Order Summary
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4 bg-background rounded-lg">
                    <div className="w-20 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-foreground">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium text-foreground">Total</span>
                <span className="font-serif text-3xl font-semibold text-primary">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </div>

          {/* Checkout Action */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg p-6 border border-border sticky top-[calc(42px+80px+2rem)]">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-foreground leading-relaxed">
                  <strong className="text-primary">How it works:</strong> When you click "Complete Purchase", 
                  you'll be redirected to our trusted seller's website to finalize 
                  your order securely.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full gap-2 font-semibold"
                onClick={handleCompletePurchase}
              >
                Complete Purchase
                <ExternalLink className="h-4 w-4" />
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                You'll be redirected to a secure checkout
              </p>

              <Separator className="my-6" />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>100% authentic products guaranteed</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Secure payment on seller site</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Fast delivery options available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
