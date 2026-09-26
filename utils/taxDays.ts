import type { CalculationResult } from '../types';

/**
 * "How many working days' pay goes to tax." Income tax and CPP/QPP + EI (+ QPIP)
 * are kept apart on purpose: the contributions come back as a pension and as
 * insurance, so counting them as "working for the government" would overstate
 * it — the usual criticism of tax-freedom-day figures.
 *
 * Uses the engine's own annual breakdown (results.annual), never per-period
 * figures multiplied up, so it always agrees with the totals on screen.
 * 260 = 52 weeks × 5 days.
 */
export const WORK_DAYS = 260;

export function taxDays(r: CalculationResult): { tax: number; contributions: number } | null {
  const a = r.annual;
  const gross = r.grossPayAnnual;
  if (!a || !gross || gross <= 0) return null;
  const tax = a.federalTax + a.provincialTax;
  // annual.cpp already includes QPIP in Quebec (annual.qpip is that part again,
  // listed separately for display). Adding qpip here counted it twice.
  const contributions = a.cpp + a.ei;
  return {
    tax: Math.round((WORK_DAYS * tax) / gross),
    contributions: Math.round((WORK_DAYS * contributions) / gross),
  };
}
