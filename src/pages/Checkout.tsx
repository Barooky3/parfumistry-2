import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Shield, Truck, Tag, Mail, MapPin, CreditCard, Lock, User, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

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

// Simple address suggestions based on input
const ADDRESS_SUGGESTIONS: { [key: string]: { street: string; city: string }[] } = {
  'NL': [
    { street: 'Herengracht 100', city: 'Amsterdam' },
    { street: 'Kalverstraat 50', city: 'Amsterdam' },
    { street: 'Lijnbaan 25', city: 'Rotterdam' },
    { street: 'Mariaplaats 10', city: 'Utrecht' },
    { street: 'Grote Markt 1', city: 'Groningen' },
  ],
  'BE': [
    { street: 'Meir 100', city: 'Antwerpen' },
    { street: 'Rue Neuve 50', city: 'Brussels' },
    { street: 'Veldstraat 25', city: 'Gent' },
  ],
  'DE': [
    { street: 'Kurfürstendamm 100', city: 'Berlin' },
    { street: 'Maximilianstraße 50', city: 'München' },
    { street: 'Königsallee 25', city: 'Düsseldorf' },
  ],
};

const Checkout = () => {
  const { items, totalPrice, subtotalBeforeDiscount, freeItemDiscount, freeItemsCount, clearCart } = useCart();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  
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
    
    // Trigger address suggestions when typing street address
    if (field === 'streetAddress' && value.length >= 2) {
      const countryCode = formData.country === 'Netherlands' ? 'NL' : 
                         formData.country === 'Belgium' ? 'BE' : 
                         formData.country === 'Germany' ? 'DE' : null;
      if (countryCode && ADDRESS_SUGGESTIONS[countryCode]) {
        const filtered = ADDRESS_SUGGESTIONS[countryCode].filter(
          addr => addr.street.toLowerCase().includes(value.toLowerCase())
        );
        setAddressSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } else if (field === 'streetAddress') {
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

  // Close suggestions when clicking outside
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

  const handlePayment = (method: 'shopify' | 'paypal' | 'creditcard') => {
    if (!isFormValid()) {
      toast({ 
        title: 'Missing information', 
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    // Open affiliate links for all items
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
    <div className="min-h-screen bg-secondary/50">
      <div className="container py-10 md:py-16 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
          
          {/* Left Column - Your Information Form */}
          <div className="order-2 lg:order-1">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
              <User className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <h2 className="font-display text-2xl text-foreground">Your Information</h2>
            </div>

            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label className="text-xs font-medium tracking-wider uppercase text-foreground">
                  EMAIL ADDRESS <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-12 h-14 bg-background border-border text-base rounded-md focus:border-foreground"
                  />
                </div>
              </div>

              {/* Name Fields - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider uppercase text-foreground">
                    FIRST NAME <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className="h-14 bg-background border-border text-base rounded-md focus:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider uppercase text-foreground">
                    LAST NAME <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className="h-14 bg-background border-border text-base rounded-md focus:border-foreground"
                  />
                </div>
              </div>

              {/* Country Dropdown */}
              <div className="space-y-2">
                <Label className="text-xs font-medium tracking-wider uppercase text-foreground">
                  COUNTRY <span className="text-accent">*</span>
                </Label>
                <Select value={formData.country} onValueChange={(value) => updateFormData('country', value)}>
                  <SelectTrigger className="h-14 bg-background border-border text-base rounded-md focus:border-foreground">
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

              {/* Street Address with Autocomplete */}
              <div className="space-y-2 relative" ref={addressInputRef}>
                <Label className="text-xs font-medium tracking-wider uppercase text-foreground">
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
                    className="pl-12 h-14 bg-background border-border text-base rounded-md focus:border-foreground"
                  />
                </div>
                
                {/* Address Suggestions Dropdown */}
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto">
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

              {/* Postal Code & City - Side by Side */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider uppercase text-foreground">
                    POSTAL CODE <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="1234 AB"
                    value={formData.postalCode}
                    onChange={(e) => updateFormData('postalCode', e.target.value)}
                    className="h-14 bg-background border-border text-base rounded-md focus:border-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium tracking-wider uppercase text-foreground">
                    CITY <span className="text-accent">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Amsterdam"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="h-14 bg-background border-border text-base rounded-md focus:border-foreground"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-1 lg:order-2">
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-8">
              <CheckSquare className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <h2 className="font-display text-2xl text-foreground">Order Summary</h2>
            </div>

            <div className="bg-background rounded-lg border border-border p-6 lg:sticky lg:top-[100px]">
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const cartKey = item.selectedMl ? `${item.product.id}-${item.selectedMl}` : item.product.id;
                  const displayPrice = item.selectedPrice || item.product.price;
                  return (
                    <div key={cartKey} className="flex gap-4 items-start">
                      <div className="w-16 h-20 bg-secondary overflow-hidden flex-shrink-0 rounded border border-border">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-foreground line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Qty: {item.quantity}
                          {item.selectedMl && ` • ${item.selectedMl}ml`}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-foreground">{formatPrice(displayPrice * item.quantity)}</p>
                    </div>
                  );
                })}
              </div>

              {/* Discount Code Section */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">DISCOUNT CODE</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="h-12 flex-1 bg-background border-2 border-accent/60 focus:border-accent rounded-md text-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyDiscount}
                    disabled={!discountCode || isApplyingDiscount}
                    className="h-12 px-6 rounded-md border-border font-medium"
                  >
                    {isApplyingDiscount ? '...' : 'Apply'}
                  </Button>
                </div>
              </div>

              {/* Discount Applied Banner */}
              {freeItemDiscount > 0 && (
                <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-md">
                  <p className="text-sm font-semibold text-accent">
                    🎉 Buy 2 Get 1 Free Applied!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {freeItemsCount} free fragrance{freeItemsCount > 1 ? 's' : ''} included
                  </p>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className={freeItemDiscount > 0 ? "text-muted-foreground line-through" : "text-foreground font-medium"}>
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
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-4 border-t border-border mb-6">
                <span className="font-display text-xl text-foreground">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                  <p className="text-xs text-muted-foreground">Taxes included</p>
                </div>
              </div>

              {/* Form validation message */}
              {!isFormValid() && (
                <p className="text-sm text-center text-muted-foreground mb-4">
                  Fill in all required fields to proceed with payment.
                </p>
              )}

              {/* Payment Buttons */}
              <div className="space-y-3">
                {/* Pay with Shopify - Green */}
                <Button 
                  onClick={() => handlePayment('shopify')}
                  disabled={!isFormValid()}
                  className="w-full h-14 text-sm font-semibold rounded-md disabled:opacity-50"
                  style={{ backgroundColor: '#96bf48', color: 'white' }}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Pay with Shopify
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Or pay with</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* PayPal - Yellow */}
                <Button 
                  onClick={() => handlePayment('paypal')}
                  disabled={!isFormValid()}
                  variant="outline"
                  className="w-full h-12 text-base font-bold rounded-md border-border disabled:opacity-50"
                  style={{ backgroundColor: '#ffc439', color: '#003087' }}
                >
                  PayPal
                </Button>

                {/* Creditcard - Gray */}
                <Button 
                  onClick={() => handlePayment('creditcard')}
                  disabled={!isFormValid()}
                  variant="outline"
                  className="w-full h-12 text-sm font-medium rounded-md bg-muted hover:bg-muted/80 text-foreground border-border disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Creditcard
                </Button>

                {/* PayPal Attribution */}
                <p className="text-xs text-center text-muted-foreground pt-2">
                  Powered by <span className="font-bold" style={{ color: '#003087' }}>PayPal</span>
                </p>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-border space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                  100% Authentic Guarantee
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={1.5} />
                  Fast Delivery
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={1.5} />
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
