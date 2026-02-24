import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Tag, Mail, MapPin, User, CheckSquare, Loader2, ChevronsUpDown, Check, Shield, AlertTriangle, Lock } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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
import { useLanguage } from '@/contexts/LanguageContext';


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
  const { t } = useLanguage();
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedPaymentMethod, setCompletedPaymentMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [revolutLinkOpened, setRevolutLinkOpened] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [discountCode, setDiscountCode] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRevolutPaymentPopup, setShowRevolutPaymentPopup] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalLoading, setPaypalLoading] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);

  const VALID_CODES: Record<string, number> = {
    'parfum10': 10,
    'parfumz20': 20,
    'parfuma90': 90,
    'parfumz50': 50,
  };
  
  // Address autocomplete state
  const [addressSuggestions, setAddressSuggestions] = useState<{ id?: string; street: string; city: string; postcode?: string; display: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const addressInputRef = useRef<HTMLDivElement>(null);
  
  // Form state - load from sessionStorage
  const [formData, setFormData] = useState(() => {
    const saved = sessionStorage.getItem('checkoutFormData');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return {
      email: '',
      confirmEmail: '',
      firstName: '',
      lastName: '',
      country: '',
      streetAddress: '',
      postalCode: '',
      city: '',
    };
  });

  // Persist form data to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('checkoutFormData', JSON.stringify(formData));
  }, [formData]);

  // Handle completed payment redirect from BankTransfer/Rewarble pages
  useEffect(() => {
    const completed = searchParams.get('completed');
    if (completed) {
      setCompletedPaymentMethod(completed);
      setIsCompleted(true);
    }
  }, [searchParams]);

  

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
    
    // Address autocomplete disabled - users enter manually
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
    return formData.email && isValidEmail(formData.email) && formData.confirmEmail && formData.email === formData.confirmEmail &&
           formData.firstName && formData.lastName && 
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

  // PayPal SDK - TEMPORARILY DISABLED
  // To re-enable: uncomment the useEffect below and the PayPal UI sections
  /*
  useEffect(() => {
    let cancelled = false;
    const loadPayPal = async () => {
      try {
        setPaypalLoading(true);
        const { data } = await supabase.functions.invoke('get-paypal-client-id');
        if (cancelled || !data?.clientId) return;
        const existing = document.querySelector('script[src*="paypal.com/sdk"]');
        if (existing) existing.remove();
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = `https://www.paypal.com/sdk/js?client-id=${data.clientId}&currency=EUR&disable-funding=card`;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load PayPal'));
          document.head.appendChild(script);
        });
        if (!cancelled) setPaypalReady(true);
      } catch (err) {
        console.error('PayPal SDK load error:', err);
      } finally {
        if (!cancelled) setPaypalLoading(false);
      }
    };
    loadPayPal();
    return () => { cancelled = true; };
  }, []);
  */

  // PayPal Buttons render - TEMPORARILY DISABLED
  /*
  useEffect(() => {
    if (!paypalReady || !(window as any).paypal || !paypalContainerRef.current) return;
    const container = paypalContainerRef.current;
    container.innerHTML = '';
    (window as any).paypal.Buttons({
      style: { layout: 'vertical', shape: 'rect', label: 'pay', height: 50 },
      onClick: (_data: any, actions: any) => {
        if (!isFormValidRef.current) {
          toast({ title: 'Please fill in all fields', description: 'Complete your shipping information before paying.', variant: 'destructive' });
          return actions.reject();
        }
        return actions.resolve();
      },
      createOrder: async () => {
        const fd = formDataRef.current;
        const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl }));
        const { data, error } = await supabase.functions.invoke('create-checkout', { body: { items: cartItems, customerEmail: fd.email, customerName: `${fd.firstName} ${fd.lastName}`, shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress }, discountPercent: appliedDiscountRef.current?.percent || 0, freeItemDiscount } });
        if (error || !data?.orderID) throw new Error(error?.message || data?.error || 'Failed to create order');
        return data.orderID;
      },
      onApprove: async (data: any) => {
        setIsProcessing(true);
        try {
          const { data: captureData, error } = await supabase.functions.invoke('capture-order', { body: { orderID: data.orderID } });
          if (error || captureData?.error) throw new Error(error?.message || captureData?.error);
          const fd = formDataRef.current;
          const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl }));
          const finalTotal = appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice;
          await supabase.functions.invoke('send-order-confirmation', { body: { orderItems: cartItems, customerEmail: fd.email, customerName: `${fd.firstName} ${fd.lastName}`, shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress }, totalAmount: finalTotal.toFixed(2) } });
          setCompletedPaymentMethod('paypal');
          setIsCompleted(true);
          clearCart();
        } catch (err: any) {
          console.error('Payment capture error:', err);
          toast({ title: 'Payment error', description: err.message || 'Something went wrong. Please try again.', variant: 'destructive' });
        } finally {
          setIsProcessing(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast({ title: 'Payment failed', description: 'Your payment could not be completed. Please try again.', variant: 'destructive' });
      },
    }).render(container);
  }, [paypalReady, items, totalPrice, freeItemDiscount, toast, clearCart]);
  */


  if (items.length === 0 && !isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-16 bg-background">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" strokeWidth={1} />
          <h1 className="font-display text-2xl text-foreground mb-3">{t('checkout.emptyCart')}</h1>
          <p className="text-sm text-muted-foreground mb-8">{t('checkout.emptyCartDesc')}</p>
          <Button asChild className="rounded-none h-12 px-8 text-xs tracking-[0.1em] uppercase">
            <Link to="/shop">{t('checkout.continueShopping')}</Link>
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
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">{t('general.information')}</span>
            </div>
            <div className="flex-1 h-[2px] bg-accent mx-2 mt-[-20px]" />
            {/* Step 2 - Payment */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-accent-foreground" strokeWidth={2} />
              </div>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">{t('checkout.payment')}</span>
            </div>
            <div className="flex-1 h-[2px] bg-accent mx-2 mt-[-20px]" />
            {/* Step 3 - Confirmation */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">3</span>
              </div>
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-foreground">{t('general.confirmation')}</span>
            </div>
          </div>

          {/* Checkmark Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-accent" strokeWidth={1.5} />
            </div>
          </div>

          {/* Thank You Text */}
          <h1 className="font-display text-3xl text-foreground text-center mb-4">{t('checkout.thankYou')}</h1>
          <p className="text-muted-foreground text-center mb-2">
            {completedPaymentMethod === 'revolut'
              ? t('checkout.thankYouRevolut')
              : completedPaymentMethod === 'rewarble'
              ? t('checkout.thankYouGiftCard')
              : completedPaymentMethod === 'bank_transfer'
              ? 'Your order has been placed and is pending bank transfer verification.'
              : t('checkout.thankYouPaypal')}
          </p>
          {completedPaymentMethod === 'paypal' && (
            <p className="text-sm text-muted-foreground text-center mb-10">
              {t('checkout.thankYouSpam')}
            </p>
          )}
          {(completedPaymentMethod === 'revolut' || completedPaymentMethod === 'rewarble' || completedPaymentMethod === 'bank_transfer') && (
            <p className="text-sm text-muted-foreground text-center mb-10">
              {t('checkout.thankYouPatience')}
            </p>
          )}

          {/* Continue Shopping Button */}
          <Button asChild className="w-full rounded-md h-12 text-xs tracking-[0.15em] uppercase font-semibold">
            <Link to="/shop">{t('checkout.continueShopping')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="py-8 md:py-10 text-center">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">{t('checkout.title')}</h1>
        <p className="text-muted-foreground">{t('checkout.subtitle')}</p>
      </div>

      {/* Main Content */}
      <div className="container pb-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left Column - Your Information */}
          <div>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <User className="h-5 w-5 text-accent" strokeWidth={1.5} />
              <h2 className="font-display text-xl text-foreground">{t('checkout.yourInfo')}</h2>
            </div>

            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <Label className="text-xs font-medium tracking-wider text-foreground">
                  {t('checkout.email')} <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={t('checkout.emailPlaceholder')}
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="pl-12 h-12 bg-background border-border rounded-md"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{t('checkout.emailHelper')}</p>
              </div>

              {/* Confirm Email Field */}
              <div className="space-y-2">
                <Label className="text-xs font-medium tracking-wider text-foreground">
                  CONFIRM EMAIL <span className="text-accent">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Confirm your email address"
                    value={formData.confirmEmail}
                    onChange={(e) => updateFormData('confirmEmail', e.target.value)}
                    className={cn("pl-12 h-12 bg-background border-border rounded-md", formData.confirmEmail && formData.confirmEmail !== formData.email && "border-destructive")}
                  />
                </div>
                {formData.confirmEmail && formData.confirmEmail !== formData.email && (
                  <p className="text-xs text-destructive mt-1">Emails do not match</p>
                )}
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
                    placeholder="Enter your street address"
                    value={formData.streetAddress}
                    onChange={(e) => updateFormData('streetAddress', e.target.value)}
                    className="pl-12 h-12 bg-background border-border rounded-md"
                  />
                </div>
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

              {!isFormValid() && (
                <div className="flex items-center gap-2.5 rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 mb-5">
                  <AlertTriangle className="h-4 w-4 text-accent shrink-0" />
                  <p className="text-sm font-medium text-foreground">
                    Fill in all required fields above to enable payment.
                  </p>
                </div>
              )}

              {/* Payment Options */}
              <div className="space-y-4">
                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm font-medium text-foreground">Processing your payment...</span>
                    <span className="text-xs text-muted-foreground">Please don't close this page</span>
                  </div>
                )}

                {/* PayPal UI - TEMPORARILY DISABLED
                {paypalLoading && !paypalReady && (
                  <div className="flex flex-col items-center justify-center py-6 gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading payment options...</span>
                  </div>
                )}

                <div ref={paypalContainerRef} className={!isFormValid() ? 'opacity-50 pointer-events-none' : ''} />

                {paypalReady && (
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                )}
                END PayPal UI */}

                <p className="text-xs text-center text-muted-foreground mb-2">
                  If you're looking for other payment methods, simply hit us up on{' '}
                  <a href="https://www.tiktok.com/@vendoreu2344?_r=1&_t=ZG-93eFNaYYZma" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">TikTok</a>{' '}
                  and we'll help you out!
                </p>

                {/* Revolut App Payment */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-[52px] rounded-lg text-sm font-bold tracking-wide bg-[#191C1F] hover:bg-[#2a2f35] text-white shadow-lg border border-white/10 relative overflow-hidden"
                    onClick={() => {
                      if (!isFormValid()) {
                        toast({ title: 'Please fill in all fields', description: 'Complete your shipping information before paying.', variant: 'destructive' });
                        return;
                      }
                      const fd = formDataRef.current;
                      const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl }));
                      const finalTotal = appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice;
                      sessionStorage.setItem('checkoutOrderContext', JSON.stringify({
                        cartItems,
                        email: fd.email,
                        customerName: `${fd.firstName} ${fd.lastName}`,
                        shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress },
                        totalAmount: finalTotal.toFixed(2),
                      }));
                      navigate(`/revolut?total=${finalTotal.toFixed(2)}`);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.25 2H9.77L9.27 4.69H14.7C16.89 4.69 18.1 5.82 18.1 7.67C18.1 9.86 16.51 11.71 14.32 11.71H11.08L7.5 22H10.33L12.83 13.53H14.56C18.46 13.53 21.06 10.82 21.06 7.33C21.06 4.11 19.18 2 17.25 2Z" fill="white"/>
                        <path d="M5.5 10.5L3 22H5.83L8.33 10.5H5.5Z" fill="white"/>
                      </svg>
                      <span>Pay with Revolut</span>
                    </span>
                    <span className="absolute right-3 flex items-center gap-1 text-[10px] font-normal text-white/50">
                      Instant
                    </span>
                  </Button>
                
                </div>



                {/* Alternative Methods Divider */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3 my-1">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">If other payment methods don't work for you</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  <Button
                    type="button"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-[52px] rounded-lg text-sm font-bold tracking-wide bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg border border-white/10 relative overflow-hidden"
                    onClick={() => {
                      if (!isFormValid()) {
                        toast({ title: 'Please fill in all fields', description: 'Complete your shipping information before paying.', variant: 'destructive' });
                        return;
                      }
                      // Save order context to sessionStorage
                      const fd = formDataRef.current;
                      const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl }));
                      const finalTotal = appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice;
                      sessionStorage.setItem('checkoutOrderContext', JSON.stringify({
                        cartItems,
                        email: fd.email,
                        customerName: `${fd.firstName} ${fd.lastName}`,
                        shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress },
                        totalAmount: finalTotal.toFixed(2),
                      }));
                      navigate(`/rewarble?total=${finalTotal.toFixed(2)}`);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      🎁
                      <span>Pay with Rewarble</span>
                    </span>
                  </Button>
                  {/* Payment method logos */}
                  <div className="flex items-center justify-center gap-2.5">
                    {/* Visa */}
                    <svg width="38" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#1A1F71" stroke="#2A2F81"/>
                      <path d="M20.4 21H17.8L19.5 11H22.1L20.4 21ZM16.2 11L13.7 17.8L13.4 16.3L13.4 16.3L12.5 12C12.5 12 12.4 11 11.1 11H7.1L7 11.2C7 11.2 8.5 11.5 10.2 12.5L12.5 21H15.2L19 11H16.2ZM37 21H39.3L37.3 11H35.2C34.1 11 33.8 11.9 33.8 11.9L29.9 21H32.6L33.1 19.5H36.4L36.7 21H37ZM33.9 17.5L35.3 13.5L36.1 17.5H33.9ZM30.4 13.5L30.8 11.3C30.8 11.3 29.5 10.8 28.1 10.8C26.6 10.8 23.2 11.5 23.2 14.3C23.2 16.9 26.8 16.9 26.8 18.3C26.8 19.6 23.6 19.3 22.4 18.4L22 20.7C22 20.7 23.3 21.3 25.2 21.3C27.1 21.3 29.8 20.2 29.8 17.7C29.8 15.1 26.1 14.8 26.1 13.7C26.1 12.5 28.5 12.7 30.4 13.5Z" fill="white"/>
                    </svg>
                    {/* Mastercard */}
                    <svg width="38" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#fff" stroke="#ddd"/>
                      <circle cx="19" cy="16" r="8" fill="#EB001B"/><circle cx="29" cy="16" r="8" fill="#F79E1B"/><path d="M24 10a8 8 0 010 12 8 8 0 010-12z" fill="#FF5F00"/>
                    </svg>
                    {/* iDEAL */}
                    <svg width="38" height="24" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#fff" stroke="#ddd"/>
                      <rect x="8" y="6" width="32" height="20" rx="2" fill="#CC0066"/>
                      <text x="24" y="19.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial, sans-serif">iDEAL</text>
                    </svg>
                  </div>
                </div>

                {/* Bank Transfer Section */}
                <div className="space-y-2 mt-2">
                  <Button
                    type="button"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-[52px] rounded-lg text-sm font-bold tracking-wide bg-[#0A2540] hover:bg-[#0D3158] text-white shadow-lg border border-white/10 relative overflow-hidden"
                    onClick={() => {
                      if (!isFormValid()) {
                        toast({ title: 'Please fill in all fields', description: 'Complete your shipping information before paying.', variant: 'destructive' });
                        return;
                      }
                      const fd = formDataRef.current;
                      const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl }));
                      const finalTotal = appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice;
                      sessionStorage.setItem('checkoutOrderContext', JSON.stringify({
                        cartItems,
                        email: fd.email,
                        customerName: `${fd.firstName} ${fd.lastName}`,
                        shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress },
                        totalAmount: finalTotal.toFixed(2),
                      }));
                      navigate(`/bank-transfer?total=${finalTotal.toFixed(2)}`);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
                      <span>Pay by Bank Transfer</span>
                    </span>
                    <span className="absolute right-3 flex items-center gap-1 text-[10px] font-normal text-white/50">
                      SEPA
                    </span>
                  </Button>
                  {/* European bank logos */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex items-center justify-center w-11 h-7 rounded border border-border bg-white overflow-hidden p-1">
                      <img src="/images/banks/ing.png" alt="ING" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex items-center justify-center w-11 h-7 rounded border border-border bg-white overflow-hidden p-0.5">
                      <img src="/images/banks/deutsche-bank.png" alt="Deutsche Bank" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex items-center justify-center w-11 h-7 rounded border border-border bg-white overflow-hidden p-0.5">
                      <img src="/images/banks/bnp-paribas.png" alt="BNP Paribas" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex items-center justify-center w-11 h-7 rounded border border-border bg-white overflow-hidden p-0.5">
                      <img src="/images/banks/hsbc.png" alt="HSBC" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex items-center justify-center w-7 h-7 rounded border border-border bg-muted">
                      <span className="text-[10px] font-bold text-muted-foreground">+</span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground/60 text-center">
                  By completing this purchase you agree to our terms and conditions
                </p>

                {/* Trust badges */}
                <div className="flex flex-col items-center gap-2 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-xs">Secure checkout</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/60">256-bit SSL encrypted · Buyer protection included</p>
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
