import { Currency, CURRENCIES } from '@/contexts/CurrencyContext';

const CARD_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
};

// Actual available Rewarble card denominations per currency
const AVAILABLE_DENOMINATIONS: Record<string, number[]> = {
  EUR: [5, 10, 20, 25, 30, 35, 40, 45, 50],
  USD: [5, 10, 15, 20, 25, 30, 35, 45, 50],
  GBP: [5, 10, 15, 20, 35, 45, 50],
};

/**
 * Given an order total in EUR, finds the available card denomination across EUR/USD/GBP
 * that is closest to the actual EUR total (to minimise over/underpay).
 */
export function getCardRecommendation(eurTotal: number, _userCurrency: Currency): string {
  let bestCurrency = 'EUR';
  let bestDenom = 50;
  let bestOverpayEur = Infinity;

  for (const [cc, denoms] of Object.entries(AVAILABLE_DENOMINATIONS)) {
    const info = CURRENCIES.find(c => c.code === cc);
    if (!info) continue;

    for (const denom of denoms) {
      const denomInEur = denom / info.rate;
      // Only consider denominations that cover the total (no underpay)
      if (denomInEur >= eurTotal - 0.01) {
        const overpay = denomInEur - eurTotal;
        if (overpay < bestOverpayEur) {
          bestOverpayEur = overpay;
          bestDenom = denom;
          bestCurrency = cc;
        }
      }
    }
  }

  const symbol = CARD_SYMBOLS[bestCurrency];
  return `${symbol}${bestDenom}`;
}
