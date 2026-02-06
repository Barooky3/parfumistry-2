import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Tag, Mail, MapPin, Lock, User, CheckSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';


const COUNTRIES = [
  // Europe
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
  'Romania',
  'Bulgaria',
  'Croatia',
  'Slovakia',
  'Slovenia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Iceland',
  'Turkey',
  'Russia',
  'Ukraine',
  // North America
  'United States',
  'Canada',
  'Mexico',
  // South America
  'Brazil',
  'Argentina',
  'Chile',
  'Colombia',
  'Peru',
  // Asia
  'Japan',
  'South Korea',
  'China',
  'India',
  'Thailand',
  'Vietnam',
  'Indonesia',
  'Malaysia',
  'Singapore',
  'Philippines',
  'United Arab Emirates',
  'Saudi Arabia',
  // Oceania
  'Australia',
  'New Zealand',
  // Africa
  'South Africa',
  'Egypt',
  'Morocco',
  'Nigeria',
];

// Interface for PDOK API response (Netherlands)
interface PDOKSuggestion {
  weergavenaam: string;
  straatnaam: string;
  woonplaatsnaam: string;
  postcode: string;
  huisnummer: string;
}

// Interface for Nominatim API response (worldwide)
interface NominatimSuggestion {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
    country?: string;
  };
}

// Country code mapping for Nominatim (ISO 3166-1 alpha-2)
const COUNTRY_CODES: Record<string, string> = {
  // Europe
  'Belgium': 'be',
  'Germany': 'de',
  'France': 'fr',
  'United Kingdom': 'gb',
  'Spain': 'es',
  'Italy': 'it',
  'Austria': 'at',
  'Switzerland': 'ch',
  'Portugal': 'pt',
  'Poland': 'pl',
  'Sweden': 'se',
  'Denmark': 'dk',
  'Norway': 'no',
  'Finland': 'fi',
  'Ireland': 'ie',
  'Luxembourg': 'lu',
  'Czech Republic': 'cz',
  'Greece': 'gr',
  'Hungary': 'hu',
  'Romania': 'ro',
  'Bulgaria': 'bg',
  'Croatia': 'hr',
  'Slovakia': 'sk',
  'Slovenia': 'si',
  'Estonia': 'ee',
  'Latvia': 'lv',
  'Lithuania': 'lt',
  'Iceland': 'is',
  'Turkey': 'tr',
  'Russia': 'ru',
  'Ukraine': 'ua',
  // North America
  'United States': 'us',
  'Canada': 'ca',
  'Mexico': 'mx',
  // South America
  'Brazil': 'br',
  'Argentina': 'ar',
  'Chile': 'cl',
  'Colombia': 'co',
  'Peru': 'pe',
  // Asia
  'Japan': 'jp',
  'South Korea': 'kr',
  'China': 'cn',
  'India': 'in',
  'Thailand': 'th',
  'Vietnam': 'vn',
  'Indonesia': 'id',
  'Malaysia': 'my',
  'Singapore': 'sg',
  'Philippines': 'ph',
  'United Arab Emirates': 'ae',
  'Saudi Arabia': 'sa',
  // Oceania
  'Australia': 'au',
  'New Zealand': 'nz',
  // Africa
  'South Africa': 'za',
  'Egypt': 'eg',
  'Morocco': 'ma',
  'Nigeria': 'ng',
};

// Debounce function
const debounce = <T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

const Checkout = () => {
  const { items, totalPrice, subtotalBeforeDiscount, freeItemDiscount, freeItemsCount, clearCart } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);

  const VALID_CODES: Record<string, number> = {
    'parfum10': 10,
    'parfumz20': 20,
    'parfumz50': 50,
  };
  
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<{ id?: string; street: string; city: string; postcode?: string; display: string }[]>([]);
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

  

  // Fetch addresses from PDOK (Netherlands) or Nominatim (worldwide)
  const fetchAddressSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setAddressSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      if (!formData.country) {
        setAddressSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoadingAddress(true);
      
      try {
        if (formData.country === 'Netherlands') {
          // PDOK Locatieserver - Free Dutch government API
          const response = await fetch(
            `https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?q=${encodeURIComponent(query)}&fq=type:adres&rows=8`
          );
          
          if (!response.ok) throw new Error('Failed to fetch');
          
          const data = await response.json();
          
          if (data.response?.docs) {
            const suggestions = data.response.docs.map((doc: PDOKSuggestion & { id: string }) => ({
              id: doc.id,
              street: doc.straatnaam && doc.huisnummer 
                ? `${doc.straatnaam} ${doc.huisnummer}` 
                : doc.straatnaam || doc.weergavenaam,
              city: doc.woonplaatsnaam || '',
              postcode: doc.postcode || '',
              display: doc.weergavenaam,
            }));
            
            setAddressSuggestions(suggestions);
            setShowSuggestions(suggestions.length > 0);
          }
        } else {
          // Nominatim (OpenStreetMap) - Free worldwide API
          const countryCode = COUNTRY_CODES[formData.country] || '';
          const countryFilter = countryCode ? `&countrycodes=${countryCode}` : '';
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(query)}${countryFilter}`,
            {
              headers: {
                'Accept-Language': 'en',
              }
            }
          );
          
          if (!response.ok) throw new Error('Failed to fetch');
          
          const data: NominatimSuggestion[] = await response.json();
          
          const suggestions = data.map((item) => {
            const street = item.address.road 
              ? (item.address.house_number 
                  ? `${item.address.road} ${item.address.house_number}` 
                  : item.address.road)
              : '';
            const city = item.address.city || item.address.town || item.address.village || item.address.municipality || '';
            
            return {
              street,
              city,
              postcode: item.address.postcode || '',
              display: item.display_name,
            };
          }).filter(s => s.street); // Only show results with a street
          
          setAddressSuggestions(suggestions);
          setShowSuggestions(suggestions.length > 0);
        }
      } catch (error) {
        console.error('Address lookup failed:', error);
        setAddressSuggestions([]);
      } finally {
        setIsLoadingAddress(false);
      }
    }, 400),
    [formData.country]
  );

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Trigger address suggestions when typing street address
    if (field === 'streetAddress') {
      fetchAddressSuggestions(value);
    }
  };

  const selectAddressSuggestion = async (suggestion: { id?: string; street: string; city: string; postcode?: string }) => {
    setShowSuggestions(false);
    
    // If postcode or city missing and we have an id, fetch full details from PDOK
    if (suggestion.id && (!suggestion.postcode || !suggestion.city) && formData.country === 'Netherlands') {
      try {
        const response = await fetch(
          `https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup?id=${encodeURIComponent(suggestion.id)}`
        );
        if (response.ok) {
          const data = await response.json();
          const doc = data.response?.docs?.[0];
          if (doc) {
            setFormData(prev => ({
              ...prev,
              streetAddress: doc.straatnaam && doc.huisnummer ? `${doc.straatnaam} ${doc.huisnummer}` : suggestion.street,
              city: doc.woonplaatsnaam || suggestion.city,
              postalCode: doc.postcode || suggestion.postcode || prev.postalCode,
            }));
            return;
          }
        }
      } catch (error) {
        console.error('PDOK lookup failed:', error);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      streetAddress: suggestion.street,
      city: suggestion.city,
      postalCode: suggestion.postcode || prev.postalCode,
    }));
  };

  // Handle Stripe success/cancel redirects
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (searchParams.get('success') === 'true') {
      setIsCompleted(true);
      
      // Send order confirmation email with cart items
      if (sessionId) {
        const savedItems = localStorage.getItem('profparfums-pending-order');
        const orderItems = savedItems ? JSON.parse(savedItems) : [];
        localStorage.removeItem('profparfums-pending-order');
        
        supabase.functions.invoke('send-order-confirmation', {
          body: { sessionId, orderItems },
        }).then(({ error }) => {
          if (error) console.error('Failed to send confirmation email:', error);
        });
      }
      
      clearCart();
    }
    if (searchParams.get('canceled') === 'true') {
      toast({ title: 'Payment canceled', description: 'Your payment was canceled. You can try again.' });
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addressInputRef.current && !addressInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isFormValid = () => {
    return formData.email && isValidEmail(formData.email) && formData.firstName && formData.lastName && 
           formData.country && formData.streetAddress && formData.postalCode && formData.city;
  };



  const handleApplyDiscount = () => {
    setIsApplyingDiscount(true);
    setTimeout(() => {
      setIsApplyingDiscount(false);
      const code = discountCode.trim().toLowerCase();
      const percent = VALID_CODES[code];
      if (percent) {
        setAppliedDiscount({ code: discountCode.trim(), percent });
        toast({ title: 'Discount applied!', description: `${percent}% off has been applied to your order.` });
      } else {
        setAppliedDiscount(null);
        toast({ title: 'Invalid code', description: 'This discount code is not valid.', variant: 'destructive' });
      }
    }, 600);
  };

  const handlePayment = async () => {
    if (!isFormValid()) {
      const emailIssue = formData.email && !isValidEmail(formData.email);
      toast({ 
        title: emailIssue ? 'Invalid email' : 'Missing information', 
        description: emailIssue ? 'Please enter a valid email address.' : 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const cartItems = items.map(item => ({
        name: item.product.name,
        brand: item.product.brand,
        image: item.product.image,
        price: item.selectedPrice || item.product.price,
        quantity: item.quantity,
        selectedMl: item.selectedMl,
      }));

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: cartItems,
          customerEmail: formData.email,
          customerName: `${formData.firstName} ${formData.lastName}`,
          shippingAddress: {
            country: formData.country,
            city: formData.city,
            postalCode: formData.postalCode,
            line1: formData.streetAddress,
          },
          discountPercent: appliedDiscount?.percent || 0,
          freeItemDiscount: freeItemDiscount,
        },
      });

      if (error) throw error;
      if (data?.url) {
        // Save cart items for order confirmation email
        localStorage.setItem('profparfums-pending-order', JSON.stringify(cartItems));
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast({
        title: 'Payment error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="py-8 md:py-10 text-center">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Checkout</h1>
        <p className="text-muted-foreground">Complete your purchase</p>
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
                {(showSuggestions || isLoadingAddress) && (
                  <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-64 overflow-auto">
                    {isLoadingAddress ? (
                      <div className="px-4 py-3 flex items-center gap-3 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Searching addresses...</span>
                      </div>
                    ) : addressSuggestions.length > 0 ? (
                      addressSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectAddressSuggestion(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors flex items-center gap-3 border-b border-border last:border-0"
                        >
                          <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{suggestion.display || suggestion.street}</p>
                            {suggestion.city && (
                              <p className="text-xs text-muted-foreground">{suggestion.postcode} {suggestion.city}</p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : null}
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
                    <span className="text-accent font-medium">Buy 2 Get 1 Free</span>
                    <span className="text-accent font-medium">-{formatPrice(freeItemDiscount)}</span>
                  </div>
                )}
                
                {appliedDiscount && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-accent font-medium">Code: {appliedDiscount.code} ({appliedDiscount.percent}%)</span>
                    <span className="text-accent font-medium">-{formatPrice(totalPrice * appliedDiscount.percent / 100)}</span>
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
                  <span className="text-xl font-bold text-foreground">{formatPrice(appliedDiscount ? totalPrice * (1 - appliedDiscount.percent / 100) : totalPrice)}</span>
                  <p className="text-xs text-muted-foreground">Taxes included</p>
                </div>
              </div>

              {/* Form validation message */}
              {!isFormValid() && (
                <p className="text-xs text-center text-muted-foreground mb-4">
                  Fill in all required fields to proceed with payment.
                </p>
              )}

              {/* Payment Button */}
              <div className="space-y-3">
                <Button 
                  onClick={handlePayment}
                  disabled={!isFormValid() || isProcessing}
                  className="w-full h-12 text-sm font-medium rounded-md disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay with Stripe
                    </>
                  )}
                </Button>

                {/* Terms */}
                <p className="text-xs text-center text-muted-foreground pt-2">
                  By completing this purchase, you agree to our terms and conditions.
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
