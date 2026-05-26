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
  return `${symbol}${bestDenom}`;
}

// PayPal Rewarble EUR cards actually listed on G2A, with direct product URLs
const PAYPAL_REWARBLE_CARDS_EUR: { denom: number; url: string }[] = [
  { denom: 6,  url: 'https://www.g2a.com/paypal-gift-card-6-eur-by-rewarble-global-i10000339995092' },
  { denom: 10, url: 'https://www.g2a.com/paypal-gift-card-10-eur-by-rewarble-global-i10000339995006' },
  { denom: 15, url: 'https://www.g2a.com/paypal-gift-card-15-eur-by-rewarble-global-i10000339995020' },
  { denom: 20, url: 'https://www.g2a.com/paypal-gift-card-20-eur-by-rewarble-global-i10000339995005' },
  { denom: 25, url: 'https://www.g2a.com/paypal-gift-card-25-eur-by-rewarble-global-i10000339995003' },
  { denom: 40, url: 'https://www.g2a.com/paypal-gift-card-40-eur-by-rewarble-global-i10000339995021' },
];

export interface VisaRewarbleCard {
  denom: number;
  label: string; // e.g. "€25"
  url: string;   // G2A direct product URL for that specific card
}

/**
 * Returns the PayPal Rewarble EUR card on G2A whose denomination is closest to the cart total.
 */
export function getVisaRewarbleCard(eurTotal: number): VisaRewarbleCard {
  const best = PAYPAL_REWARBLE_CARDS_EUR.reduce((acc, c) =>
    Math.abs(c.denom - eurTotal) < Math.abs(acc.denom - eurTotal) ? c : acc,
    PAYPAL_REWARBLE_CARDS_EUR[0]
  );
  return { denom: best.denom, label: `€${best.denom}`, url: best.url };
}
