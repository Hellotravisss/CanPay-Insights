/**
 * Paid products. Prices live here, not in the Stripe dashboard: Checkout
 * sessions are created with inline price_data, so changing a price or a
 * name is a code change that goes through review, not a dashboard click.
 *
 * Every product sells a DECISION, not more detail. Take-home pay itself is
 * free for everyone; that is the traffic and the dataset.
 */
export type ProductKey = 'relocation' | 'offer-compare';

export const PRODUCTS: Record<
  ProductKey,
  { name: string; description: string; amountCents: number; currency: 'cad' }
> = {
  relocation: {
    name: 'Province Move Report',
    description:
      'Your take-home pay in both provinces, the December 31 residency rule, moving-expense deduction, and sales-tax differences — computed from your own numbers.',
    amountCents: 900,
    currency: 'cad',
  },
  'offer-compare': {
    name: 'Offer Comparison',
    description:
      'Two job offers side by side, after tax: cash, bonus at your marginal rate, employer RRSP match, vacation priced in — plus what to ask HR before signing.',
    amountCents: 900,
    currency: 'cad',
  },
};

export function isProductKey(k: unknown): k is ProductKey {
  return typeof k === 'string' && k in PRODUCTS;
}
