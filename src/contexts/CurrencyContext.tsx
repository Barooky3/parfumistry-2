import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type Currency = 'EUR' | 'GBP' | 'USD';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (priceInEur: number) => string;
}

const EXCHANGE_RATES: Record<Currency, number> = {
  EUR: 1,
  GBP: 0.86,
  USD: 1.08,
};

const LOCALE_MAP: Record<Currency, string> = {
  EUR: 'nl-NL',
  GBP: 'en-GB',
  USD: 'en-US',
};

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
    const converted = priceInEur * EXCHANGE_RATES[currency];
    return new Intl.NumberFormat(LOCALE_MAP[currency], {
      style: 'currency',
      currency,
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
