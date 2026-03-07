import { Currency, CURRENCIES } from '@/contexts/CurrencyContext';

const CARD_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

const CARD_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

function nearestCard(amount: number): number {
  const lower = Math.floor(amount / 5) * 5;
  return (amount - lower) > 4 ? lower + 5 : lower;
}

/**
 * Given an order total in EUR and the user's selected currency,
 * returns a recommendation string like "a €10 card" or "a $15 card".
 */
export function getCardRecommendation(eurTotal: number, userCurrency: Currency): string {
  // Determine which card currency to recommend
  let targetCurrency: string = 'EUR';

  if (CARD_CURRENCIES.includes(userCurrency as any)) {
    targetCurrency = userCurrency;
  }

  const currencyInfo = CURRENCIES.find(c => c.code === targetCurrency);
  const rate = currencyInfo?.rate || 1;
  const convertedAmount = eurTotal * rate;
  const recommended = nearestCard(convertedAmount);
  const symbol = CARD_SYMBOLS[targetCurrency];

  return `${symbol}${recommended}`;
}
