import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShoppingBag, Shield, Truck, CreditCard, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const formatPrice = (price: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(price);

  const handleCompletePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    
    items.forEach((item) => {
      if (item.product.affiliateUrl && item.product.affiliateUrl !== '#') {
        window.open(item.product.affiliateUrl, '_blank');
      }
    });
    
    setIsCompleted(true);
    clearCart();
    toast({ title: 'Order Confirmed!', description: 'Check your email for order details.' });
  };

  if (items.length === 0 && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-background">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-display text-2xl text-foreground mb-3">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground mb-8">Add some fragrances to checkout</p>
          <Button asChild className="rounded-none h-12 px-8 text-xs tracking-[0.1em] uppercase">
            <Link to="/shop">Browse Collection</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-background">
        <div className="text-center max-w-md px-4">
          <CheckCircle className="h-16 w-16 text-foreground mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-display text-3xl text-foreground mb-4">Order Confirmed</h1>
          <p className="text-muted-foreground mb-10">
            Thank you for your purchase. You will receive your order details and seller access via email shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild className="rounded-none h-12 px-8 text-xs tracking-[0.1em] uppercase">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 md:py-14 bg-background">
      <div className="container max-w-5xl">
        <Button variant="ghost" size="sm" className="mb-8 gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/shop"><ArrowLeft className="h-4 w-4" />Back to Shop</Link>
        </Button>

        <h1 className="font-display text-4xl text-foreground mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Order Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleCompletePurchase} className="space-y-8">
              {/* Contact Information */}
              <div className="border border-border p-8">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-6">Contact Information</h2>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-foreground">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-11 h-12 bg-background border-border rounded-none focus:border-foreground"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Your order details will be sent to this email</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm text-foreground">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="pl-11 h-12 bg-background border-border rounded-none focus:border-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-border p-8">
                <h2 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-6">Order Summary</h2>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                      <div className="w-16 h-20 bg-secondary overflow-hidden flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Checkout Button */}
              <div className="lg:hidden">
                <Button type="submit" size="lg" className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none">
                  Complete Purchase — {formatPrice(totalPrice)}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="border border-border p-8 sticky top-[120px]">
              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Digital Delivery</span>
                  <span className="text-foreground">Free</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">Total</span>
                  <span className="text-xl font-semibold text-foreground">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-none hidden lg:flex"
                onClick={handleCompletePurchase}
              >
                Complete Purchase
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                By completing this purchase you agree to our Terms of Service
              </p>

              <div className="mt-8 pt-8 border-t border-border space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" strokeWidth={1.5} />
                  100% Authentic Guarantee
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" strokeWidth={1.5} />
                  Instant Digital Delivery
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" strokeWidth={1.5} />
                  Secure Payment
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
