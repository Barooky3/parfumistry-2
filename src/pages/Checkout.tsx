import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Shield, Truck, CreditCard, Mail, User, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type CheckoutStep = 1 | 2 | 3;

const COUNTRIES = [
  'Netherlands',
  'Belgium',
  'Germany',
  'France',
  'United Kingdom',
  'Spain',
  'Italy',
  'Austria',
  'Switzerland',
  'Portugal',
];

const Checkout = () => {
  const { items, totalPrice, subtotalBeforeDiscount, freeItemDiscount, freeItemsCount, clearCart } = useCart();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    country: '',
    streetAddress: '',
    postalCode: '',
    city: '',
  });

  const formatPrice = (price: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(price);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = () => {
    return formData.email && formData.firstName && formData.lastName && 
           formData.country && formData.streetAddress && formData.postalCode && formData.city;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && isStep1Valid()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      handleCompletePurchase();
    }
  };

  const handleCompletePurchase = () => {
    items.forEach((item) => {
      if (item.product.affiliateUrl && item.product.affiliateUrl !== '#') {
        window.open(item.product.affiliateUrl, '_blank');
      }
    });
    
    setCurrentStep(3);
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
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-4">Order Confirmed</h1>
          <p className="text-muted-foreground mb-10">
            Thank you for your purchase. You will receive your order details and seller access via email.
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

  const steps = [
    { number: 1, label: 'INFORMATION' },
    { number: 2, label: 'PAYMENT' },
    { number: 3, label: 'CONFIRMATION' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="py-8 md:py-12 border-b border-border">
        <div className="container text-center">
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground text-sm">Complete your purchase</p>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="py-8 md:py-10 bg-secondary border-b border-border">
        <div className="container">
          <div className="flex items-center justify-center max-w-lg mx-auto px-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  {/* Step Circle */}
                  <div 
                    className={cn(
                      "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-base md:text-lg font-bold transition-all",
                      currentStep === step.number 
                        ? "bg-accent text-white shadow-lg ring-4 ring-accent/20" 
                        : currentStep > step.number
                          ? "bg-accent text-white"
                          : "bg-white text-foreground border-2 border-foreground/30 shadow-md"
                    )}
                  >
                    {currentStep > step.number ? (
                      <Check className="h-6 w-6 md:h-7 md:w-7" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {/* Step Label */}
                  <span 
                    className={cn(
                      "text-xs md:text-sm tracking-[0.08em] mt-3 font-semibold",
                      currentStep >= step.number ? "text-foreground" : "text-foreground/60"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div 
                    className={cn(
                      "h-1 w-12 md:w-20 -mt-7 md:-mt-8 mx-1 md:mx-2 rounded-full",
                      currentStep > step.number ? "bg-accent" : "bg-foreground/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-10 md:py-14">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-12">
            {/* Left Column - Form */}
            <div className="lg:col-span-3">
              {currentStep === 1 && (
                <div className="space-y-8">
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    <h2 className="font-display text-xl text-foreground">Your Information</h2>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium tracking-[0.08em] uppercase text-foreground">
                      Email Address <span className="text-accent">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        required
                        className="pl-11 h-12 bg-background border-border rounded-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium tracking-[0.08em] uppercase text-foreground">
                        First Name <span className="text-accent">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        required
                        className="h-12 bg-background border-border rounded-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium tracking-[0.08em] uppercase text-foreground">
                        Last Name <span className="text-accent">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        required
                        className="h-12 bg-background border-border rounded-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Country Field */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium tracking-[0.08em] uppercase text-foreground">
                      Country <span className="text-accent">*</span>
                    </Label>
                    <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
                      <SelectTrigger className="h-12 bg-background border-border rounded-sm focus:border-accent focus:ring-accent">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Street Address */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium tracking-[0.08em] uppercase text-foreground">
                      Street Address <span className="text-accent">*</span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Start typing your address..."
                        value={formData.streetAddress}
                        onChange={(e) => updateFormData('streetAddress', e.target.value)}
                        required
                        className="pl-11 h-12 bg-background border-border rounded-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Postal Code & City */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium tracking-[0.08em] uppercase text-foreground">
                        Postal Code <span className="text-accent">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="1234 AB"
                        value={formData.postalCode}
                        onChange={(e) => updateFormData('postalCode', e.target.value)}
                        required
                        className="h-12 bg-background border-border rounded-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium tracking-[0.08em] uppercase text-foreground">
                        City <span className="text-accent">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="Amsterdam"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        required
                        className="h-12 bg-background border-border rounded-sm focus:border-accent focus:ring-accent"
                      />
                    </div>
                  </div>

                  {/* Continue Button - Mobile */}
                  <div className="lg:hidden pt-4">
                    <Button 
                      onClick={handleNextStep}
                      disabled={!isStep1Valid()}
                      className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-sm"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-8">
                  {/* Section Header */}
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-accent" strokeWidth={1.5} />
                    <h2 className="font-display text-xl text-foreground">Payment</h2>
                  </div>

                  {/* Order Summary for Step 2 */}
                  <div className="border border-border p-6 space-y-4">
                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-4">Order Summary</h3>
                    {items.map((item) => {
                      const cartKey = item.selectedMl ? `${item.product.id}-${item.selectedMl}` : item.product.id;
                      const displayPrice = item.selectedPrice || item.product.price;
                      return (
                        <div key={cartKey} className="flex gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                          <div className="w-14 h-16 bg-secondary overflow-hidden flex-shrink-0 rounded-sm">
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</h4>
                            {item.selectedMl && (
                            <p className="text-xs text-muted-foreground">{item.selectedMl}ml</p>
                            )}
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formatPrice(displayPrice * item.quantity)}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping Address Preview */}
                  <div className="border border-border p-6">
                    <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-4">Shipping Address</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="text-foreground font-medium">{formData.firstName} {formData.lastName}</p>
                      <p>{formData.streetAddress}</p>
                      <p>{formData.postalCode} {formData.city}</p>
                      <p>{formData.country}</p>
                      <p className="pt-2">{formData.email}</p>
                    </div>
                  </div>

                  {/* Payment Notice */}
                  <div className="bg-secondary/50 border border-border p-6 rounded-sm">
                    <p className="text-sm text-muted-foreground">
                      By clicking "Place Order", you will be redirected to the seller to complete your purchase.
                    </p>
                  </div>

                  {/* Complete Button - Mobile */}
                  <div className="lg:hidden pt-4">
                    <Button 
                      onClick={handleCompletePurchase}
                      className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-sm"
                    >
                      Place Order — {formatPrice(totalPrice)}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary Sidebar */}
            <div className="lg:col-span-2">
              <div className="border border-border p-6 lg:p-8 sticky top-[120px] rounded-sm">
                <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground mb-6">Summary</h3>
                
                {/* Order Items Preview (Step 1 only) */}
                {currentStep === 1 && (
                  <div className="space-y-3 mb-6 pb-6 border-b border-border">
                    {items.slice(0, 3).map((item) => {
                      const cartKey = item.selectedMl ? `${item.product.id}-${item.selectedMl}` : item.product.id;
                      return (
                        <div key={cartKey} className="flex items-center gap-3">
                          <div className="w-10 h-12 bg-secondary overflow-hidden flex-shrink-0 rounded-sm">
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                          </div>
                        </div>
                      );
                    })}
                    {items.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{items.length - 3} meer items</p>
                    )}
                  </div>
                )}

                {/* Discount Banner */}
                {freeItemDiscount > 0 && (
                  <div className="mb-6 p-3 bg-accent/10 border border-accent/20 rounded-sm">
                    <p className="text-xs font-semibold text-accent uppercase tracking-wide mb-1">
                      🎉 Buy 2 Get 1 Free Applied!
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {freeItemsCount} free fragrance{freeItemsCount > 1 ? 's' : ''} included
                    </p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className={freeItemDiscount > 0 ? "text-muted-foreground line-through" : "text-foreground"}>
                      {formatPrice(subtotalBeforeDiscount)}
                    </span>
                  </div>
                  
                  {freeItemDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-accent font-medium">Free Fragrance Discount</span>
                      <span className="text-accent font-medium">-{formatPrice(freeItemDiscount)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-foreground">Free</span>
                  </div>
                  
                  <div className="h-px bg-border my-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">Total</span>
                    <span className="text-xl font-semibold text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Desktop Action Button */}
                <div className="hidden lg:block">
                  {currentStep === 1 && (
                    <Button 
                      onClick={handleNextStep}
                      disabled={!isStep1Valid()}
                      className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-sm"
                    >
                      Continue to Payment
                    </Button>
                  )}
                  {currentStep === 2 && (
                    <Button 
                      onClick={handleCompletePurchase}
                      className="w-full h-14 text-xs font-medium tracking-[0.15em] uppercase rounded-sm"
                    >
                      Place Order
                    </Button>
                  )}
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  By continuing you agree to our Terms of Service
                </p>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-border space-y-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-accent" strokeWidth={1.5} />
                    100% Authentic Guarantee
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4 text-accent" strokeWidth={1.5} />
                    Fast Delivery
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <CreditCard className="h-4 w-4 text-accent" strokeWidth={1.5} />
                    Secure Payment
                  </div>
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
