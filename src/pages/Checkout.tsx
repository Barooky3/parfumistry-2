import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Tag, Mail, MapPin, User, CheckSquare, Loader2, ChevronsUpDown, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
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
  'Serbia',
  'Estonia',
  'Latvia',
  'Lithuania',
  'Iceland',
  'Turkey',
  'Russia',
  'Ukraine',
  'Bosnia and Herzegovina',
  'Montenegro',
  'North Macedonia',
  'Albania',
  'Moldova',
  'Cyprus',
  'Malta',
  'Monaco',
  'Liechtenstein',
  'Andorra',
  'Kosovo',
  'Belarus',
  'Georgia',
  'Armenia',
  'Azerbaijan',
  'San Marino',
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
  'Ecuador',
  'Uruguay',
  'Paraguay',
  'Bolivia',
  'Venezuela',
  // Caribbean
  'Dominican Republic',
  'Jamaica',
  'Trinidad and Tobago',
  'Barbados',
  'Curaçao',
  'Suriname',
  // Middle East
  'United Arab Emirates',
  'Saudi Arabia',
  'Qatar',
  'Kuwait',
  'Bahrain',
  'Oman',
  'Israel',
  'Jordan',
  'Lebanon',
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
  'Hong Kong',
  'Taiwan',
  'Pakistan',
  'Bangladesh',
  'Sri Lanka',
  'Nepal',
  'Cambodia',
  'Myanmar',
  'Macao',
  // Oceania
  'Australia',
  'New Zealand',
  // Africa
  'South Africa',
  'Egypt',
  'Morocco',
  'Nigeria',
  'Kenya',
  'Ghana',
  'Tunisia',
  'Algeria',
  'Senegal',
  'Ivory Coast',
  'Cameroon',
  'Tanzania',
  'Ethiopia',
  'Mauritius',
].sort();

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
  'Bosnia and Herzegovina': 'ba',
  'Montenegro': 'me',
  'North Macedonia': 'mk',
  'Albania': 'al',
  'Moldova': 'md',
  'Cyprus': 'cy',
  'Malta': 'mt',
  'Monaco': 'mc',
  'Liechtenstein': 'li',
  'Andorra': 'ad',
  'Kosovo': 'xk',
  'Belarus': 'by',
  'Georgia': 'ge',
  'Armenia': 'am',
  'Azerbaijan': 'az',
  'San Marino': 'sm',
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
  'Ecuador': 'ec',
  'Uruguay': 'uy',
  'Paraguay': 'py',
  'Bolivia': 'bo',
  'Venezuela': 've',
  // Caribbean
  'Dominican Republic': 'do',
  'Jamaica': 'jm',
  'Trinidad and Tobago': 'tt',
  'Barbados': 'bb',
  'Curaçao': 'cw',
  'Suriname': 'sr',
  // Middle East
  'United Arab Emirates': 'ae',
  'Saudi Arabia': 'sa',
  'Qatar': 'qa',
  'Kuwait': 'kw',
  'Bahrain': 'bh',
  'Oman': 'om',
  'Israel': 'il',
  'Jordan': 'jo',
  'Lebanon': 'lb',
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
  'Hong Kong': 'hk',
  'Taiwan': 'tw',
  'Pakistan': 'pk',
  'Bangladesh': 'bd',
  'Sri Lanka': 'lk',
  'Nepal': 'np',
  'Cambodia': 'kh',
  'Myanmar': 'mm',
  'Macao': 'mo',
  // Oceania
  'Australia': 'au',
  'New Zealand': 'nz',
  // Africa
  'South Africa': 'za',
  'Egypt': 'eg',
  'Morocco': 'ma',
  'Nigeria': 'ng',
  'Kenya': 'ke',
  'Ghana': 'gh',
  'Tunisia': 'tn',
  'Algeria': 'dz',
  'Senegal': 'sn',
  'Ivory Coast': 'ci',
  'Cameroon': 'cm',
  'Tanzania': 'tz',
  'Ethiopia': 'et',
  'Mauritius': 'mu',
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

// Country Combobox with search
const CountryCombobox = ({ value, onSelect }: { value: string; onSelect: (value: string) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-12 justify-between bg-background border-border rounded-md font-normal"
        >
          {value || "Select your country"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country}
                  value={country}
                  onSelect={() => {
                    onSelect(country);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === country ? "opacity-100" : "opacity-0")} />
                  {country}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const Checkout = () => {
  const { items, totalPrice, subtotalBeforeDiscount, freeItemDiscount, freeItemsCount, clearCart } = useCart();
  const { toast } = useToast();
  const { formatPrice } = useCurrency();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const sumupContainerRef = useRef<HTMLDivElement>(null);

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

  // Store latest form data in a ref so callbacks always see current values
  const formDataRef = useRef(formData);
  formDataRef.current = formData;
  const appliedDiscountRef = useRef(appliedDiscount);
  appliedDiscountRef.current = appliedDiscount;
  const isFormValidRef = useRef(isFormValid());
  isFormValidRef.current = isFormValid();

  // Calculate current total
  const currentTotal = appliedDiscount ? totalPrice * (1 - appliedDiscount.percent / 100) : totalPrice;

  // Handle SumUp payment
  const handleSumUpPayment = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Please fill in all fields',
        description: 'Complete your shipping information before paying.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const fd = formDataRef.current;
      const finalTotal = appliedDiscountRef.current
        ? totalPrice * (1 - appliedDiscountRef.current.percent / 100)
        : totalPrice;
      const amount = Math.round(finalTotal * 100) / 100;

      const checkoutReference = `PP-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      // Create SumUp checkout
      const { data, error } = await supabase.functions.invoke('create-sumup-checkout', {
        body: {
          amount,
          description: 'Prof Parfums Order',
          customerEmail: fd.email,
          checkoutReference,
        },
      });

      if (error || !data?.checkoutId) {
        throw new Error(error?.message || data?.error || 'Failed to create checkout');
      }

      const checkoutId = data.checkoutId;

      // Mount SumUp card widget
      const container = sumupContainerRef.current;
      if (!container) throw new Error('Payment container not found');
      container.innerHTML = '<div id="sumup-card"></div>';

      // Load SumUp SDK if not already loaded
      if (!(window as any).SumUpCard) {
        await new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector('script[src*="sumup.com/gateway/ecom/card"]');
          if (existingScript) {
            const check = setInterval(() => {
              if ((window as any).SumUpCard) { clearInterval(check); resolve(); }
            }, 100);
            setTimeout(() => { clearInterval(check); reject(new Error('SumUp SDK timeout')); }, 10000);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load SumUp SDK'));
          document.head.appendChild(script);
        });
      }

      const SumUpCard = (window as any).SumUpCard;
      SumUpCard.mount({
        id: 'sumup-card',
        checkoutId,
        onResponse: async (type: string, body: any) => {
          console.log('SumUp response:', type, body);

          if (type === 'success' || body?.status === 'PAID') {
            const cartItems = items.map(item => ({
              name: item.product.name,
              brand: item.product.brand,
              image: item.product.image,
              price: item.selectedPrice || item.product.price,
              quantity: item.quantity,
              selectedMl: item.selectedMl,
            }));

            const confirmationPayload = {
              orderItems: cartItems,
              customerEmail: fd.email,
              customerName: `${fd.firstName} ${fd.lastName}`,
              shippingAddress: {
                country: fd.country,
                city: fd.city,
                postalCode: fd.postalCode,
                line1: fd.streetAddress,
              },
              totalAmount: amount.toFixed(2),
            };

            try {
              await supabase.functions.invoke('send-order-confirmation', {
                body: confirmationPayload,
              });
            } catch (emailErr) {
              console.error('Order confirmation email error:', emailErr);
            }

            setIsCompleted(true);
            clearCart();
          } else if (type === 'error' || body?.status === 'FAILED') {
            toast({
              title: 'Payment failed',
              description: body?.message || 'Your payment was not completed. Please try again.',
              variant: 'destructive',
            });
          }

          setIsProcessing(false);
        },
      });
    } catch (err: any) {
      console.error('SumUp payment error:', err);
      toast({
        title: 'Payment error',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
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
      <div className="min-h-screen flex items-center justify-center py-16 bg-muted/30">
        <div className="bg-background rounded-2xl shadow-lg max-w-md w-full mx-4 p-8 md:p-10">
          {/* Step Indicators */}
          <div className="flex items-center justify-between mb-10 px-2">
            {/* Step 1 - Information */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-accent-foreground" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Information</span>
            </div>
            <div className="flex-1 h-[2px] bg-accent mx-2 mt-[-20px]" />
            {/* Step 2 - Payment */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-accent-foreground" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">Payment</span>
            </div>
            <div className="flex-1 h-[2px] bg-accent mx-2 mt-[-20px]" />
            {/* Step 3 - Confirmation */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">3</span>
              </div>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-foreground">Confirmation</span>
            </div>
          </div>

          {/* Checkmark Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-accent" strokeWidth={1.5} />
            </div>
          </div>

          {/* Thank You Text */}
          <h1 className="font-display text-3xl text-foreground text-center mb-4">Thank You!</h1>
          <p className="text-muted-foreground text-center mb-2">
            Your purchase is complete. You will receive an email with your order details and seller links.
          </p>
          <p className="text-sm text-muted-foreground text-center mb-10">
            Please check your spam folder if you don't see it within a few minutes.
          </p>

          {/* Continue Shopping Button */}
          <Button asChild className="w-full rounded-md h-12 text-xs tracking-[0.15em] uppercase font-semibold">
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
                <p className="text-xs text-muted-foreground mt-1">Please make sure your email is correct to ensure you get the order confirmation email correctly.</p>
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

              {/* Country Dropdown with Search */}
              <div className="space-y-2">
                <Label className="text-xs font-medium tracking-wider text-foreground">
                  COUNTRY <span className="text-accent">*</span>
                </Label>
                <CountryCombobox
                  value={formData.country}
                  onSelect={(value) => updateFormData('country', value)}
                />
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

              {/* SumUp Payment */}
              <div className="space-y-4">
                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium text-foreground">Setting up secure payment...</span>
                    <span className="text-xs text-muted-foreground">This may take a moment</span>
                  </div>
                )}
                
                <div ref={sumupContainerRef} className={isProcessing ? 'min-h-[60px]' : ''} />

                {!isProcessing && (
                  <Button
                    onClick={handleSumUpPayment}
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-14 text-sm tracking-[0.12em] uppercase font-semibold rounded-md shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Pay Securely — {formatPrice(currentTotal)}
                  </Button>
                )}
                
                {!isFormValid() && (
                  <p className="text-xs text-center text-muted-foreground">
                    Fill in all required fields to enable payment.
                  </p>
                )}

                {/* Trust badges */}
                <div className="flex flex-col items-center gap-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    <span className="text-xs">Secure payment powered by</span>
                    <span className="text-xs font-bold tracking-wide">SumUp</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">256-bit SSL encrypted · PCI DSS compliant</p>
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
