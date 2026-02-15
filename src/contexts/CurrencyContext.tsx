import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Currency = 
  | 'EUR' | 'GBP' | 'USD' | 'CHF' | 'SEK' | 'DKK' | 'NOK' | 'ISK'
  | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK' | 'TRY' | 'RUB' | 'UAH'
  | 'CAD' | 'MXN' | 'BRL' | 'ARS' | 'CLP' | 'COP' | 'PEN'
  | 'JPY' | 'KRW' | 'CNY' | 'INR' | 'THB' | 'VND' | 'IDR' | 'MYR' | 'SGD' | 'PHP' | 'AED' | 'SAR'
  | 'AUD' | 'NZD' | 'ZAR' | 'EGP' | 'MAD' | 'NGN';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  rate: number; // relative to EUR
  locale: string;
}

// All currencies mapped to checkout countries
export const CURRENCIES: CurrencyInfo[] = [
  // Europe
  { code: 'EUR', symbol: '€', rate: 1, locale: 'nl-NL' },
  { code: 'GBP', symbol: '£', rate: 0.86, locale: 'en-GB' },
  { code: 'CHF', symbol: 'CHF', rate: 0.94, locale: 'de-CH' },
  { code: 'SEK', symbol: 'kr', rate: 11.2, locale: 'sv-SE' },
  { code: 'DKK', symbol: 'kr', rate: 7.46, locale: 'da-DK' },
  { code: 'NOK', symbol: 'kr', rate: 11.5, locale: 'nb-NO' },
  { code: 'PLN', symbol: 'zł', rate: 4.32, locale: 'pl-PL' },
  { code: 'CZK', symbol: 'Kč', rate: 25.2, locale: 'cs-CZ' },
  { code: 'HUF', symbol: 'Ft', rate: 395, locale: 'hu-HU' },
  { code: 'RON', symbol: 'lei', rate: 4.97, locale: 'ro-RO' },
  { code: 'BGN', symbol: 'лв', rate: 1.96, locale: 'bg-BG' },
  { code: 'HRK', symbol: 'kn', rate: 7.53, locale: 'hr-HR' },
  { code: 'ISK', symbol: 'kr', rate: 149, locale: 'is-IS' },
  { code: 'TRY', symbol: '₺', rate: 34.5, locale: 'tr-TR' },
  { code: 'RUB', symbol: '₽', rate: 97, locale: 'ru-RU' },
  { code: 'UAH', symbol: '₴', rate: 41.5, locale: 'uk-UA' },
  // North America
  { code: 'USD', symbol: '$', rate: 1.08, locale: 'en-US' },
  { code: 'CAD', symbol: 'C$', rate: 1.47, locale: 'en-CA' },
  { code: 'MXN', symbol: 'MX$', rate: 18.5, locale: 'es-MX' },
  // South America
  { code: 'BRL', symbol: 'R$', rate: 5.35, locale: 'pt-BR' },
  { code: 'ARS', symbol: 'ARS', rate: 925, locale: 'es-AR' },
  { code: 'CLP', symbol: 'CLP', rate: 1010, locale: 'es-CL' },
  { code: 'COP', symbol: 'COP', rate: 4250, locale: 'es-CO' },
  { code: 'PEN', symbol: 'S/', rate: 4.05, locale: 'es-PE' },
  // Asia
  { code: 'JPY', symbol: '¥', rate: 164, locale: 'ja-JP' },
  { code: 'KRW', symbol: '₩', rate: 1430, locale: 'ko-KR' },
  { code: 'CNY', symbol: '¥', rate: 7.85, locale: 'zh-CN' },
  { code: 'INR', symbol: '₹', rate: 90.5, locale: 'en-IN' },
  { code: 'THB', symbol: '฿', rate: 37.8, locale: 'th-TH' },
  { code: 'VND', symbol: '₫', rate: 26500, locale: 'vi-VN' },
  { code: 'IDR', symbol: 'Rp', rate: 17000, locale: 'id-ID' },
  { code: 'MYR', symbol: 'RM', rate: 4.85, locale: 'ms-MY' },
  { code: 'SGD', symbol: 'S$', rate: 1.46, locale: 'en-SG' },
  { code: 'PHP', symbol: '₱', rate: 61, locale: 'en-PH' },
  { code: 'AED', symbol: 'د.إ', rate: 3.97, locale: 'ar-AE' },
  { code: 'SAR', symbol: 'ر.س', rate: 4.05, locale: 'ar-SA' },
  // Oceania
  { code: 'AUD', symbol: 'A$', rate: 1.65, locale: 'en-AU' },
  { code: 'NZD', symbol: 'NZ$', rate: 1.79, locale: 'en-NZ' },
  // Africa
  { code: 'ZAR', symbol: 'R', rate: 19.8, locale: 'en-ZA' },
  { code: 'EGP', symbol: 'E£', rate: 52, locale: 'ar-EG' },
  { code: 'MAD', symbol: 'MAD', rate: 10.8, locale: 'ar-MA' },
  { code: 'NGN', symbol: '₦', rate: 1650, locale: 'en-NG' },
];

// Map country names to their currency codes
export const COUNTRY_CURRENCY_MAP: Record<string, Currency> = {
  'Netherlands': 'EUR', 'Belgium': 'EUR', 'Germany': 'EUR', 'France': 'EUR',
  'Spain': 'EUR', 'Italy': 'EUR', 'Austria': 'EUR', 'Portugal': 'EUR',
  'Finland': 'EUR', 'Ireland': 'EUR', 'Luxembourg': 'EUR', 'Greece': 'EUR',
  'Slovakia': 'EUR', 'Slovenia': 'EUR', 'Estonia': 'EUR', 'Latvia': 'EUR', 'Lithuania': 'EUR',
  'Croatia': 'EUR',
  'United Kingdom': 'GBP',
  'Switzerland': 'CHF',
  'Sweden': 'SEK', 'Denmark': 'DKK', 'Norway': 'NOK', 'Iceland': 'ISK',
  'Poland': 'PLN', 'Czech Republic': 'CZK', 'Hungary': 'HUF',
  'Romania': 'RON', 'Bulgaria': 'BGN',
  'Serbia': 'EUR',
  'Kosovo': 'EUR', 'Belarus': 'EUR', 'Georgia': 'EUR', 'Armenia': 'EUR', 'Azerbaijan': 'EUR', 'San Marino': 'EUR',
  'Turkey': 'TRY', 'Russia': 'RUB', 'Ukraine': 'UAH',
  'United States': 'USD', 'Canada': 'CAD', 'Mexico': 'MXN',
  'Brazil': 'BRL', 'Argentina': 'ARS', 'Chile': 'CLP', 'Colombia': 'COP', 'Peru': 'PEN',
  'Paraguay': 'USD', 'Bolivia': 'USD', 'Venezuela': 'USD',
  'Dominican Republic': 'USD', 'Jamaica': 'USD', 'Trinidad and Tobago': 'USD', 'Barbados': 'USD',
  'Curaçao': 'EUR', 'Suriname': 'EUR',
  'Japan': 'JPY', 'South Korea': 'KRW', 'China': 'CNY', 'India': 'INR',
  'Thailand': 'THB', 'Vietnam': 'VND', 'Indonesia': 'IDR', 'Malaysia': 'MYR',
  'Singapore': 'SGD', 'Philippines': 'PHP',
  'United Arab Emirates': 'AED', 'Saudi Arabia': 'SAR',
  'Sri Lanka': 'USD', 'Nepal': 'USD', 'Cambodia': 'USD', 'Myanmar': 'USD', 'Macao': 'USD',
  'Australia': 'AUD', 'New Zealand': 'NZD',
  'South Africa': 'ZAR', 'Egypt': 'EGP', 'Morocco': 'MAD', 'Nigeria': 'NGN',
  'Algeria': 'EUR', 'Senegal': 'EUR', 'Ivory Coast': 'EUR', 'Cameroon': 'EUR',
  'Tanzania': 'USD', 'Ethiopia': 'USD', 'Mauritius': 'USD',
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInEur: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem('profparfums-currency');
    return (stored as Currency) || 'EUR';
  });

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('profparfums-currency', c);
  };

  const formatPrice = useCallback((priceInEur: number) => {
    const info = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
    const converted = priceInEur * info.rate;
    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: info.code,
      minimumFractionDigits: info.code === 'JPY' || info.code === 'KRW' || info.code === 'VND' || info.code === 'IDR' || info.code === 'CLP' || info.code === 'COP' || info.code === 'HUF' || info.code === 'ISK' ? 0 : 2,
      maximumFractionDigits: info.code === 'JPY' || info.code === 'KRW' || info.code === 'VND' || info.code === 'IDR' || info.code === 'CLP' || info.code === 'COP' || info.code === 'HUF' || info.code === 'ISK' ? 0 : 2,
    }).format(converted);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
