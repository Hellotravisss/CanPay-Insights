/**
 * Money as the calculator's chosen language writes it.
 *
 * Only French differs: 1 233,28 $ (space for thousands, comma for decimals, $ after),
 * which is how Québec pay stubs, tax slips and bank statements print it.
 * Every other language keeps the Canadian English form $1,233.28 — readers in those
 * languages are paid in Canada on English-format pay stubs, and their home-country forms
 * (1.233,28 in Spanish/Vietnamese, 1,23,456 lakh grouping in Hindi/Punjabi) would not match
 * the stub they compare against. Decided 2026-11-25 (Travis): French only.
 *
 * Display only. Inputs keep accepting plain digits in every language.
 * The CanPay iOS app has the same function in src/lib/money.ts — keep them identical.
 */
export function formatMoney(n: number, lang: string, digits = 0): string {
  const value = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-CA' : 'en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}
