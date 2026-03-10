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

const COUNTRY_PHONE_CODES: Record<string, string> = {
  'Albania': '+355', 'Algeria': '+213', 'Andorra': '+376', 'Argentina': '+54',
  'Armenia': '+374', 'Australia': '+61', 'Austria': '+43', 'Azerbaijan': '+994',
  'Bahrain': '+973', 'Bangladesh': '+880', 'Barbados': '+1-246', 'Belarus': '+375',
  'Belgium': '+32', 'Bolivia': '+591', 'Bosnia and Herzegovina': '+387', 'Brazil': '+55',
  'Bulgaria': '+359', 'Cambodia': '+855', 'Cameroon': '+237', 'Canada': '+1',
  'Chile': '+56', 'China': '+86', 'Colombia': '+57', 'Croatia': '+385',
  'Curaçao': '+599', 'Cyprus': '+357', 'Czech Republic': '+420', 'Denmark': '+45',
  'Dominican Republic': '+1-809', 'Ecuador': '+593', 'Egypt': '+20', 'Estonia': '+372',
  'Ethiopia': '+251', 'Finland': '+358', 'France': '+33', 'Georgia': '+995',
  'Germany': '+49', 'Ghana': '+233', 'Greece': '+30', 'Hong Kong': '+852',
  'Hungary': '+36', 'Iceland': '+354', 'India': '+91', 'Indonesia': '+62',
  'Ireland': '+353', 'Israel': '+972', 'Italy': '+39', 'Ivory Coast': '+225',
  'Jamaica': '+1-876', 'Japan': '+81', 'Jordan': '+962', 'Kenya': '+254',
  'Kosovo': '+383', 'Kuwait': '+965', 'Latvia': '+371', 'Lebanon': '+961',
  'Liechtenstein': '+423', 'Lithuania': '+370', 'Luxembourg': '+352', 'Macao': '+853',
  'Malaysia': '+60', 'Malta': '+356', 'Mauritius': '+230', 'Mexico': '+52',
  'Moldova': '+373', 'Monaco': '+377', 'Montenegro': '+382', 'Morocco': '+212',
  'Myanmar': '+95', 'Nepal': '+977', 'Netherlands': '+31', 'New Zealand': '+64',
  'Nigeria': '+234', 'North Macedonia': '+389', 'Norway': '+47', 'Oman': '+968',
  'Pakistan': '+92', 'Paraguay': '+595', 'Peru': '+51', 'Philippines': '+63',
  'Poland': '+48', 'Portugal': '+351', 'Qatar': '+974', 'Romania': '+40',
  'Russia': '+7', 'San Marino': '+378', 'Saudi Arabia': '+966', 'Senegal': '+221',
  'Serbia': '+381', 'Singapore': '+65', 'Slovakia': '+421', 'Slovenia': '+386',
  'South Africa': '+27', 'South Korea': '+82', 'Spain': '+34', 'Sri Lanka': '+94',
  'Suriname': '+597', 'Sweden': '+46', 'Switzerland': '+41', 'Taiwan': '+886',
  'Tanzania': '+255', 'Thailand': '+66', 'Trinidad and Tobago': '+1-868',
  'Tunisia': '+216', 'Turkey': '+90', 'Ukraine': '+380', 'United Arab Emirates': '+971',
  'United Kingdom': '+44', 'United States': '+1', 'Uruguay': '+598',
  'Venezuela': '+58', 'Vietnam': '+84',
};

const EU_UK_COUNTRIES = new Set([
  'Netherlands', 'Belgium', 'Germany', 'France', 'United Kingdom', 'Spain', 'Italy',
  'Austria', 'Switzerland', 'Portugal', 'Poland', 'Sweden', 'Denmark', 'Norway', 'Finland',
  'Ireland', 'Luxembourg', 'Czech Republic', 'Greece', 'Hungary', 'Romania', 'Bulgaria',
  'Croatia', 'Slovakia', 'Slovenia', 'Estonia', 'Latvia', 'Lithuania', 'Iceland', 'Cyprus',
  'Malta', 'Monaco', 'Liechtenstein', 'Andorra', 'San Marino',
]);

const getShippingCost = (country: string): number => {
  if (!country) return 0;
  return EU_UK_COUNTRIES.has(country) ? 1.99 : 2.99;
};

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
  const [completedOrderNumber, setCompletedOrderNumber] = useState<string | null>(null);
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
    'professor15': 15,
    'parfum10': 10,
    'parfumz20': 20,
    'parfumo30': 30,
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
      phone: '',
      phoneCode: '',
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
    const orderNum = searchParams.get('order');
    if (completed) {
      setCompletedPaymentMethod(completed);
      setCompletedOrderNumber(orderNum);
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
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // Auto-set phone code when country changes
      if (field === 'country' && COUNTRY_PHONE_CODES[value] && !prev.phone) {
        updated.phoneCode = COUNTRY_PHONE_CODES[value];
      }
      return updated;
    });

    // Persist customer email for rejection notification matching
    if (field === 'email' && value.includes('@')) {
      localStorage.setItem('pp_customer_email', value.toLowerCase().trim());
    }
    
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

  // Calculate shipping and current total
  const shippingCost = formData.country ? getShippingCost(formData.country) : 0;
  const currentTotal = (appliedDiscount ? totalPrice * (1 - appliedDiscount.percent / 100) : totalPrice) + shippingCost;

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
           const finalTotal = (appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice) + getShippingCost(fd.country);
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
          {completedOrderNumber && (
            <p className="text-center text-sm font-mono font-semibold text-accent mb-4">
              Order #{completedOrderNumber}
            </p>
          )}
          <p className="text-muted-foreground text-center mb-2">
            {completedPaymentMethod === 'revolut'
              ? t('checkout.thankYouRevolut')
              : completedPaymentMethod === 'rewarble'
              ? t('checkout.thankYouGiftCard')
              : t('checkout.thankYouPaypal')}
          </p>
          {completedPaymentMethod === 'paypal' && (
            <p className="text-sm text-muted-foreground text-center mb-10">
              {t('checkout.thankYouSpam')}
            </p>
          )}
          {(completedPaymentMethod === 'revolut' || completedPaymentMethod === 'rewarble') && (
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
                      <div className={cn("w-14 h-16 bg-secondary/50 overflow-hidden flex-shrink-0 rounded border border-border", item.product.imagePadding && "p-1")}>
                        {item.product.bundleImages && item.product.bundleImages.length > 0 ? (
                          <div className="flex items-end justify-center gap-0.5 h-full p-0.5">
                            {item.product.bundleImages.map((img, imgIdx) => (
                              <img key={imgIdx} src={img} alt="" className="h-[70%] w-auto object-contain" />
                            ))}
                          </div>
                        ) : (
                          <img src={item.product.image} alt={item.product.name} className={cn("w-full h-full", item.product.imagePadding ? "object-contain" : "object-cover")} />
                        )}
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
                  {formData.country ? (
                    <span className="text-foreground font-medium">{formatPrice(shippingCost)}</span>
                  ) : (
                    <span className="text-muted-foreground text-xs italic">Select country</span>
                  )}
                </div>

                {/* Estimated Delivery Info */}
                <div className="bg-secondary/50 border border-border rounded-md p-3 mt-1">
                  <p className="text-xs font-semibold text-foreground mb-1">🚚 Estimated Delivery via DHL</p>
                  <p className="text-xs text-muted-foreground">EU & UK: <span className="font-medium text-foreground">4–6 business days</span></p>
                  <p className="text-xs text-muted-foreground">Rest of World: <span className="font-medium text-foreground">6–8 business days</span></p>
                  <p className="text-xs text-muted-foreground mt-1.5">📧 DHL tracking number sent automatically by email</p>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-display text-lg text-foreground">Total</span>
                <div className="text-right">
                  <span className="text-xl font-bold text-foreground">{formatPrice(currentTotal)}</span>
                  <p className="text-xs text-muted-foreground">Taxes & shipping included</p>
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
                  <a href="https://www.tiktok.com/@profparfumz" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">TikTok</a>{' '}
                  and we'll help you out!
                </p>

                {/* Pay with Rewarble */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-[52px] rounded-lg text-sm font-bold tracking-wide bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg border border-white/10 relative overflow-hidden"
                    onClick={() => {
                      if (!isFormValid()) {
                        toast({ title: 'Please fill in all fields', description: 'Complete your shipping information before paying.', variant: 'destructive' });
                        return;
                      }
                      const fd = formDataRef.current;
                      const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.bundleImages?.[1] || item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl, affiliateUrl: item.product.affiliateUrl }));
                      const finalTotal = (appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice) + getShippingCost(fd.country);
                      sessionStorage.setItem('checkoutOrderContext', JSON.stringify({
                        cartItems,
                        email: fd.email,
                        customerName: `${fd.firstName} ${fd.lastName}`,
                        shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress },
                        totalAmount: finalTotal.toFixed(2),
                        discountCode: appliedDiscountRef.current?.code || null,
                        discountPercent: appliedDiscountRef.current?.percent || 0,
                      }));
                      navigate(`/rewarble?total=${finalTotal.toFixed(2)}`);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      💳
                      <span>Pay with Card / Apple Pay / Google Pay</span>
                    </span>
                  </Button>
                  {/* Payment method logos */}
                  <div className="flex items-center justify-center gap-2.5">
                    <svg width="44" height="30" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#1A1F71" stroke="#2A2F81"/>
                      <text x="24" y="20" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial, sans-serif">VISA</text>
                    </svg>
                    <svg width="44" height="30" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.5" y="0.5" width="47" height="31" rx="3.5" fill="#fff" stroke="#ddd"/>
                      <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                      <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                      <path d="M24 9.8a8 8 0 0 1 0 12.4 8 8 0 0 1 0-12.4z" fill="#FF5F00"/>
                    </svg>
                    <div className="w-[44px] h-[30px] rounded border border-border overflow-hidden bg-white flex items-center justify-center">
                      <img src="/images/apple-pay.png" alt="Apple Pay" className="h-full w-full object-contain" />
                    </div>
                    <div className="w-[44px] h-[30px] rounded border border-border overflow-hidden bg-white flex items-center justify-center">
                      <img src="/images/google-pay.png" alt="Google Pay" className="h-full w-full object-contain" />
                    </div>
                    <div className="w-[44px] h-[30px] rounded border border-border overflow-hidden bg-white flex items-center justify-center">
                      <img src="/images/paysafecard.png" alt="Paysafecard" className="h-full w-full object-contain" />
                    </div>
                  </div>
                </div>

                {/* Separator between Rewarble and Revolut */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-[1.5px] bg-border/80" />
                  <span className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">or</span>
                  <div className="flex-1 h-[1.5px] bg-border/80" />
                </div>

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
                      const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.bundleImages?.[1] || item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl, affiliateUrl: item.product.affiliateUrl }));
                      const finalTotal = (appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice) + getShippingCost(fd.country);
                      sessionStorage.setItem('checkoutOrderContext', JSON.stringify({
                        cartItems,
                        email: fd.email,
                        customerName: `${fd.firstName} ${fd.lastName}`,
                        shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress },
                        totalAmount: finalTotal.toFixed(2),
                        discountCode: appliedDiscountRef.current?.code || null,
                        discountPercent: appliedDiscountRef.current?.percent || 0,
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

                {/* Pay with iDEAL */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-[52px] rounded-lg text-sm font-bold tracking-wide bg-[#CC0066] hover:bg-[#A30052] text-white shadow-lg border border-white/10 relative overflow-hidden"
                    onClick={() => {
                      if (!isFormValid()) {
                        toast({ title: 'Please fill in all fields', description: 'Complete your shipping information before paying.', variant: 'destructive' });
                        return;
                      }
                      const fd = formDataRef.current;
                      const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.bundleImages?.[1] || item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl, affiliateUrl: item.product.affiliateUrl }));
                      const finalTotal = (appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice) + getShippingCost(fd.country);
                      sessionStorage.setItem('checkoutOrderContext', JSON.stringify({
                        cartItems,
                        email: fd.email,
                        customerName: `${fd.firstName} ${fd.lastName}`,
                        shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress },
                        totalAmount: finalTotal.toFixed(2),
                        discountCode: appliedDiscountRef.current?.code || null,
                        discountPercent: appliedDiscountRef.current?.percent || 0,
                      }));
                      navigate(`/ideal?total=${finalTotal.toFixed(2)}`);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" fill="white"/>
                        <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#CC0066" fontFamily="sans-serif">iD</text>
                      </svg>
                      <span>Pay with iDEAL</span>
                    </span>
                  </Button>
                </div>

                {/* Pay with PayPal (via Eneba) */}
                <div className="space-y-2">
                  <Button
                    type="button"
                    disabled={!isFormValid() || isProcessing}
                    className="w-full h-[52px] rounded-lg text-sm font-bold tracking-wide bg-[#0070BA] hover:bg-[#005C99] text-white shadow-lg border border-white/10 relative overflow-hidden"
                    onClick={() => {
                      if (!isFormValid()) {
                        toast({ title: 'Please fill in all fields', description: 'Complete your shipping information before paying.', variant: 'destructive' });
                        return;
                      }
                      const fd = formDataRef.current;
                      const cartItems = items.map(item => ({ name: item.product.name, brand: item.product.brand, image: item.product.bundleImages?.[1] || item.product.image, price: item.selectedPrice || item.product.price, quantity: item.quantity, selectedMl: item.selectedMl, affiliateUrl: item.product.affiliateUrl }));
                      const finalTotal = (appliedDiscountRef.current ? totalPrice * (1 - appliedDiscountRef.current.percent / 100) : totalPrice) + getShippingCost(fd.country);
                      sessionStorage.setItem('checkoutOrderContext', JSON.stringify({
                        cartItems,
                        email: fd.email,
                        customerName: `${fd.firstName} ${fd.lastName}`,
                        shippingAddress: { country: fd.country, city: fd.city, postalCode: fd.postalCode, line1: fd.streetAddress },
                        totalAmount: finalTotal.toFixed(2),
                        discountCode: appliedDiscountRef.current?.code || null,
                        discountPercent: appliedDiscountRef.current?.percent || 0,
                      }));
                      navigate(`/paypal?total=${finalTotal.toFixed(2)}`);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .757-.645h6.527c2.168 0 3.87.458 5.048 1.36 1.236.945 1.86 2.378 1.86 4.26 0 .376-.04.758-.117 1.15-.727 3.655-3.25 5.507-7.516 5.507H9.522a.77.77 0 0 0-.757.645l-1.69 5.34z" fill="white"/>
                        <path d="M20.16 8.848c-.727 3.655-3.25 5.507-7.516 5.507H10.66a.77.77 0 0 0-.757.645l-1.15 3.63-.486 3.085a.641.641 0 0 0 .633.74h3.34a.77.77 0 0 0 .757-.645l.632-3.18a.77.77 0 0 1 .757-.645h1.594c4.267 0 6.79-1.852 7.516-5.507.41-2.06-.076-3.655-1.337-4.63z" fill="rgba(255,255,255,0.7)"/>
                      </svg>
                      <span>Pay with PayPal</span>
                    </span>
                  </Button>
                </div>


                <details className="text-center group">
                  <summary className="text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-4 list-none inline transition-colors">
                    Why are the payment methods like this?
                  </summary>
                  <div className="mt-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-3 text-xs text-muted-foreground text-left leading-relaxed">
                    <p>
                      Since I'm currently under 17, I don't have access to a proper bank account yet. This means I'm unable to set up traditional payment processing (like credit card terminals or direct bank transfers).
                    </p>
                    <p className="mt-2">
                      For now, Rewarble codes and app-based payments are the only way I can securely accept payments. I know it's not the most convenient — but there's not much I can do. If you're in doubt or don't trust it, please do some research on Rewarble, and don't hesitate to ask me questions on{' '}
                      <a href="https://www.tiktok.com/@profparfumz" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">TikTok</a>{' '}
                      if you're confused!
                    </p>
                    <p className="mt-2 font-medium">
                      As soon as I'm able to open a bank account, normal payment methods (card payments, direct PayPal, cash on delivery, etc.) will be added right away.
                    </p>
                  </div>
                </details>

                <Link to="/return-policy" className="flex items-center justify-center gap-2 rounded-lg border border-accent bg-accent/10 px-4 py-3 text-sm font-semibold text-accent transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-md active:scale-[0.98]">
                  📋 Please read our return and refund policy before purchasing →
                </Link>
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
