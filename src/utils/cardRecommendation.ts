import { Currency, CURRENCIES } from '@/contexts/CurrencyContext';

const CARD_CURRENCIES = ['EUR', 'USD', 'GBP'] as const;

const CARD_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

function nearestCard(amount: number): number {
  const lower = Math.floor(amount / 5) * 5;
  return (amount - lower) >= 4.99 ? lower + 5 : lower;
}

/**
 * Given an order total in EUR, finds the card denomination across EUR/USD/GBP
 * that is closest to the actual EUR total (to minimise over/underpay).
 * Returns a recommendation string like "a €15 card" or "a $15 card".
 */
export function getCardRecommendation(eurTotal: number, _userCurrency: Currency): string {
  let bestCurrency = 'EUR';
  let bestDenom = nearestCard(eurTotal);
  let bestDiffEur = Math.abs(eurTotal - bestDenom); // difference in EUR terms

  for (const cc of CARD_CURRENCIES) {
    const info = CURRENCIES.find(c => c.code === cc);
    if (!info) continue;

    const convertedAmount = eurTotal * info.rate;
    const denom = nearestCard(convertedAmount);
    // Convert denomination back to EUR to compare fairly
    const denomInEur = denom / info.rate;
    const diff = Math.abs(eurTotal - denomInEur);

    if (diff < bestDiffEur) {
      bestDiffEur = diff;
      bestDenom = denom;
      bestCurrency = cc;
    }
  }

  const symbol = CARD_SYMBOLS[bestCurrency];
  return `${symbol}${bestDenom}`;
}
