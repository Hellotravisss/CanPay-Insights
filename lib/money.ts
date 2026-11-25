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
 * Same file in the CanPay website (lib/money.ts) and the iOS app (src/lib/money.ts) — keep them identical.
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

/**
 * A percentage the same way: French 30,5 % (comma, no-break space before %), every other
 * language 30.5% — the English output is exactly what the pages printed before.
 * `n` is already in percent (30.5, not 0.305). With `digits` it is fixed to that many
 * decimals; without, the number prints as it is (30.5, 30).
 */
export function formatPercent(n: number, lang: string, digits?: number): string {
  const value = Number.isFinite(n) ? n : 0;
  const s = digits === undefined ? String(value) : value.toFixed(digits);
  return lang === 'fr' ? `${s.replace('.', ',')} %` : `${s}%`;
}
