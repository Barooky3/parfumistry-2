import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Tag, Mail, MapPin, CreditCard, Lock, User, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  'Poland',
  'Sweden',
  'Denmark',
  'Norway',
  'Finland',
  'Ireland',
  'Luxembourg',
  'Czech Republic',
  'Greece',
  'Hungary',
];

// Simple address suggestions
const ADDRESS_SUGGESTIONS: { [key: string]: { street: string; city: string }[] } = {
  'NL': [
    { street: 'Herengracht 100', city: 'Amsterdam' },
    { street: 'Kalverstraat 50', city: 'Amsterdam' },
    { street: 'Lijnbaan 25', city: 'Rotterdam' },
  ],
  'BE': [
    { street: 'Meir 100', city: 'Antwerpen' },
    { street: 'Rue Neuve 50', city: 'Brussels' },
  ],
  'DE': [
    { street: 'Kurfürstendamm 100', city: 'Berlin' },
    { street: 'Maximilianstraße 50', city: 'München' },
  ],
};

const Checkout = () => {
  const { items, totalPrice, subtotalBeforeDiscount, freeItemDiscount, freeItemsCount, clearCart } = useCart();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [currentStep] = useState(1);
  
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<{ street: string; city: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLDivElement>(null);
  
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
    
    // Trigger address suggestions when typing - show all suggestions when starting to type
    if (field === 'streetAddress' && value.length >= 1) {
      // Get country code based on selected country
      let countryCode: string | null = null;
      if (formData.country === 'Netherlands') countryCode = 'NL';
      else if (formData.country === 'Belgium') countryCode = 'BE';
      else if (formData.country === 'Germany') countryCode = 'DE';
      
      // If no country selected, show Dutch suggestions by default
      const code = countryCode || 'NL';
      const suggestions = ADDRESS_SUGGESTIONS[code] || [];
      
      if (value.length >= 1) {
        const filtered = suggestions.filter(
          addr => addr.street.toLowerCase().includes(value.toLowerCase())
        );
        setAddressSuggestions(filtered.length > 0 ? filtered : suggestions);
        setShowSuggestions(true);
      }
    } else if (field === 'streetAddress' && value.length === 0) {
      setShowSuggestions(false);
    }
  };

  const selectAddressSuggestion = (suggestion: { street: string; city: string }) => {
    setFormData(prev => ({
      ...prev,
      streetAddress: suggestion.street,
      city: suggestion.city,
    }));
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressInputRef.current && !addressInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFormValid = () => {
    return formData.email && formData.firstName && formData.lastName && 
           formData.country && formData.streetAddress && formData.postalCode && formData.city;
  };

  const handleApplyDiscount = () => {
    setIsApplyingDiscount(true);
    setTimeout(() => {
      setIsApplyingDiscount(false);
      toast({ 
        title: 'Invalid code', 
        description: 'This discount code is not valid.',
        variant: 'destructive'
      });
    }, 1000);
  };

  const handlePayment = () => {
    if (!isFormValid()) {
      toast({ 
        title: 'Missing information', 
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    items.forEach((item) => {
      if (item.product.affiliateUrl && item.product.affiliateUrl !== '#') {
        window.open(item.product.affiliateUrl, '_blank');
      }
    });
    
    setIsCompleted(true);
    clearCart();
    toast({ title: 'Order Confirmed!', description: 'Check your email for order details.' });
  };

  // Empty cart state
  if (items.length === 0 && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-background">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-display text-2xl text-foreground mb-3">Your cart is empty</h1>
          <p className="text-sm text-muted-foreground mb-8">Add some fragrances to checkout</p>
          <Button asChild className="rounded-none h-12 px-8 text-xs tracking-[0.1em] uppercase">
            <Link to="/shop">Browse Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Order completed state
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-accent" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-4">Order Confirmed</h1>
          <p className="text-muted-foreground mb-10">
            Thank you for your purchase. You have been redirected to the seller to complete payment.
          </p>
          <Button asChild className="rounded-none h-12 px-8 text-xs tracking-[0.1em] uppercase">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
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
      <div className="py-8 md:py-10 text-center">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
      </div>

      {/* Progress Stepper */}
      <div className="pb-10">
        <div className="flex items-center justify-center max-w-md mx-auto px-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                {/* Step Circle */}
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    currentStep === step.number 
                      ? "bg-foreground text-background" 
                      : "bg-transparent border-2 border-border text-muted-foreground"
                  )}
                >
                  {step.number}
                </div>
                {/* Step Label */}
                <span className="text-[10px] tracking-wider mt-2 text-muted-foreground font-medium">
                  {step.label}
                </span>
              </div>
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="w-16 md:w-24 h-[2px] bg-border mx-2 -mt-5" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container pb-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left Column - Your Information */}
          <div>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <h2 className="font-display text-xl text-foreground">Your Information</h2>
            </div>

            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label className="text-xs font-medium tracking-wider text-foreground">
                  EMAIL ADDRESS <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-12 h-12 bg-background border-border rounded-md"
                  />
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider text-foreground">
                    FIRST NAME <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="h-12 bg-background border-border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider text-foreground">
                    LAST NAME <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="h-12 bg-background border-border rounded-md"
                  />
                </div>
              </div>

              {/* Country Dropdown */}
              <div className="space-y-2">
                <Label className="text-xs font-medium tracking-wider text-foreground">
                  COUNTRY <span className="text-accent">*</span>
                </Label>
                <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
                  <SelectTrigger className="h-12 bg-background border-border rounded-md">
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
              <div className="space-y-2 relative" ref={addressInputRef}>
                <Label className="text-xs font-medium tracking-wider text-foreground">
                  STREET ADDRESS <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Start typing your address..."
                    value={formData.streetAddress}
                    onChange={(e) => updateFormData('streetAddress', e.target.value)}
                    onFocus={() => formData.streetAddress.length >= 2 && addressSuggestions.length > 0 && setShowSuggestions(true)}
                    className="pl-12 h-12 bg-background border-border rounded-md"
                  />
                </div>
                
                {/* Address Suggestions */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAddressSuggestion(suggestion)}
                        className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3 border-b border-border last:border-0"
                      >
                        <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{suggestion.street}</p>
                          <p className="text-xs text-muted-foreground">{suggestion.city}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Postal Code & City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider text-foreground">
                    POSTAL CODE <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="1234 AB"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData('postalCode', e.target.value)}
                    className="h-12 bg-background border-border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider text-foreground">
                    CITY <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="h-12 bg-background border-border rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <CheckSquare className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <h2 className="font-display text-xl text-foreground">Order Summary</h2>
            </div>

            {/* Order Summary Card */}
            <div className="border border-border rounded-lg p-6 lg:sticky lg:top-[100px]">
              {/* Order Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-border">
                {items.map((item) => {
                  const cartKey = item.selectedMl ? `${item.product.id}-${item.selectedMl}` : item.product.id;
                  const displayPrice = item.selectedPrice || item.product.price;
                  return (
                    <div key={cartKey} className="flex gap-4 items-start">
                      <div className="w-14 h-16 bg-secondary/50 overflow-hidden flex-shrink-0 rounded border border-border">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity}
                          {item.selectedMl && ` • ${item.selectedMl}ml`}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{formatPrice(displayPrice * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium tracking-wider text-muted-foreground">DISCOUNT CODE</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="h-11 flex-1 bg-background border-border rounded-md text-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyDiscount}
                    disabled={!discountCode || isApplyingDiscount}
                    className="h-11 px-5 rounded-md border-border font-medium"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Discount Applied Banner */}
              {freeItemDiscount > 0 && (
                <div className="mb-6 p-3 bg-accent/10 border border-accent/20 rounded-md">
                  <p className="text-sm font-semibold text-accent">
                    🎉 Buy 2 Get 1 Free Applied!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {freeItemsCount} free fragrance{freeItemsCount > 1 ? 's' : ''} included
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className={freeItemDiscount > 0 ? "text-muted-foreground line-through" : "text-foreground"}>
                    {formatPrice(subtotalBeforeDiscount)}
                  </span>
                </div>
                
                {freeItemDiscount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-accent font-medium">Discount</span>
                    <span className="text-accent font-medium">-{formatPrice(freeItemDiscount)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-lg text-foreground">Total</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                  <p className="text-xs text-muted-foreground">Taxes included</p>
                </div>
              </div>

              {/* Form validation message */}
              {!isFormValid() && (
                <p className="text-xs text-center text-muted-foreground mb-4">
                  Fill in all required fields to proceed with payment.
                </p>
              )}

              {/* Payment Buttons */}
              <div className="space-y-3">
                {/* Pay with Shopify - Green */}
                <Button 
                  onClick={handlePayment}
                  disabled={!isFormValid()}
                  className="w-full h-12 text-sm font-medium rounded-md disabled:opacity-50"
                  style={{ backgroundColor: '#96bf48', color: 'white' }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Pay with Shopify
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase">Or pay with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* PayPal - Cream/Yellow */}
                <Button 
                  onClick={handlePayment}
                  disabled={!isFormValid()}
                  variant="outline"
                  className="w-full h-11 text-base font-bold rounded-md border-border disabled:opacity-50"
                  style={{ backgroundColor: '#ffc439', color: '#003087' }}
                >
                  PayPal
                </Button>

                {/* Creditcard - Gray */}
                <Button 
                  onClick={handlePayment}
                  disabled={!isFormValid()}
                  variant="outline"
                  className="w-full h-11 text-sm font-medium rounded-md bg-muted hover:bg-muted/80 text-muted-foreground border-border disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Creditcard
                </Button>

                {/* PayPal Attribution */}
                <p className="text-xs text-center text-muted-foreground">
                  Powered by <span className="font-bold" style={{ color: '#003087' }}>PayPal</span>
                </p>

                {/* Terms */}
                <p className="text-xs text-center text-muted-foreground pt-2">
                  By completing this purchase, you agree to our{' '}
                  <Link to="/terms" className="underline hover:text-foreground">terms and conditions</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
