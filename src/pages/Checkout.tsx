import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ShoppingBag, Shield, Zap, CreditCard, Mail, User } from 'lucide-react';
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
    
    // Open affiliate links for each item
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
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl text-foreground mb-3">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground mb-8">Add some fragrances to checkout</p>
          <Button asChild><Link to="/shop">Browse Collection</Link></Button>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-3">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. You will receive your order details and seller access via email shortly.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild><Link to="/shop">Continue Shopping</Link></Button>
            <Button variant="outline" asChild><Link to="/">Home</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 md:py-12 bg-background">
      <div className="container max-w-5xl">
        <Button variant="ghost" size="sm" className="mb-6 gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link to="/shop"><ArrowLeft className="h-4 w-4" />Back to Shop</Link>
        </Button>

        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleCompletePurchase} className="space-y-6">
              {/* Contact Information */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm text-foreground">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-11 h-12 bg-secondary border-border"
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
                        className="pl-11 h-12 bg-secondary border-border"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-sm font-medium tracking-wider uppercase text-muted-foreground mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-4 bg-secondary rounded-lg">
                      <div className="w-16 h-16 bg-card rounded-md overflow-hidden flex-shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Checkout Button */}
              <div className="lg:hidden">
                <Button type="submit" size="lg" className="w-full h-12 gap-2 font-medium tracking-wider">
                  Complete Purchase — {formatPrice(totalPrice)}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-[110px]">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Digital Delivery</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">Total</span>
                  <span className="text-xl font-semibold text-foreground">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                form="checkout-form"
                size="lg" 
                className="w-full h-12 gap-2 font-medium tracking-wider hidden lg:flex"
                onClick={handleCompletePurchase}
              >
                Complete Purchase
              </Button>
              
              <p className="text-xs text-muted-foreground text-center mt-4">
                By completing this purchase you agree to our Terms of Service
              </p>

              <div className="mt-6 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  100% Authentic Guarantee
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4 text-primary" />
                  Instant Digital Delivery
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4 text-blue-400" />
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
