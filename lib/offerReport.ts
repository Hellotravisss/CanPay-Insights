import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency } from '../types';
import { TAX_YEAR } from '../constants';
import { isProvince } from './relocationReport';

/**
 * Offer comparison, after tax. Every job-offer comparison on the internet is
 * pre-tax; this one prices each line the way the money actually lands:
 *
 *   cash after tax      = engine net of (salary + bonus)   [province-aware]
 *   bonus, after tax    = net(salary + bonus) − net(salary) — marginal, not average
 *   employer RRSP match = match% × salary, capped at the stated cap — money
 *                         that goes in pre-tax, so it is shown at face value,
 *                         separately, never blended into "cash"
 *   vacation            = days × (salary / 260): the pay attached to time off,
 *                         so two offers with different vacation are compared
 *                         on what the hours are worth
 *
 * Nothing is typed in by hand; nothing is advice.
 */

export type Offer = {
  label: string;
  province: string;
  salary: number;
  bonus: number;          // annual, cash
  matchPct: number;       // employer RRSP match, % of salary (0–20)
  vacationDays: number;   // paid vacation days per year (0–60)
};

export type OfferSide = Offer & {
  grossCash: number;      // salary + bonus
  netCash: number;        // after all deductions
  netMonthly: number;
  federalTax: number; provincialTax: number; cpp: number; ei: number;
  netSalaryOnly: number;
  bonusAfterTax: number;
  employerMatch: number;
  vacationValue: number;
  total: number;          // netCash + employerMatch
  workingHours: number;   // 2080 − vacationDays × 8
  perWorkingHour: number; // total / workingHours
  keepPer1000: number;
};

export type OfferReport = {
  taxYear: number;
  a: OfferSide; b: OfferSide;
  gap: { netCash: number; total: number; perHour: number; monthly: number };
  winner: 'a' | 'b' | 'tie';
  breakEvenSalaryForB: number; // salary B would need for the same total as A
};

export function parseOffer(raw: unknown, label: string): Offer | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const n = (v: unknown, lo: number, hi: number) => { const x = Number(v); return Number.isFinite(x) ? Math.min(hi, Math.max(lo, x)) : 0; };
  if (!isProvince(o.province)) return null;
  const salary = n(o.salary, 1000, 5_000_000);
  if (salary < 1000) return null;
  return { label, province: o.province, salary, bonus: n(o.bonus, 0, 5_000_000), matchPct: n(o.matchPct, 0, 20), vacationDays: n(o.vacationDays, 0, 60) };
}

function net(province: string, gross: number) {
  const r = calculateFromAnnualSalary({ province, annualSalary: gross, payFrequency: PayFrequency.MONTHLY });
  return { net: Math.round(r.netPayAnnual), fed: Math.round(r.federalTax * 12), prov: Math.round(r.provincialTax * 12), cpp: Math.round(r.cppDeduction * 12), ei: Math.round(r.eiDeduction * 12) };
}

function side(o: Offer): OfferSide {
  const all = net(o.province, o.salary + o.bonus);
  const base = net(o.province, o.salary).net;
  const employerMatch = Math.round((o.matchPct / 100) * o.salary);
  const vacationValue = Math.round((o.vacationDays * o.salary) / 260);
  const total = all.net + employerMatch;
  const workingHours = Math.max(1, 2080 - o.vacationDays * 8);
  return {
    ...o,
    grossCash: o.salary + o.bonus,
    netCash: all.net, netMonthly: Math.round(all.net / 12),
    federalTax: all.fed, provincialTax: all.prov, cpp: all.cpp, ei: all.ei,
    netSalaryOnly: base,
    bonusAfterTax: all.net - base,
    employerMatch, vacationValue, total,
    workingHours, perWorkingHour: Math.round((total / workingHours) * 100) / 100,
    keepPer1000: net(o.province, o.salary + 1000).net - base,
  };
}

function salaryForTotal(o: Offer, target: number): number {
  let lo = 0, hi = Math.max(target * 3, 50_000);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (side({ ...o, salary: mid }).total < target) lo = mid; else hi = mid;
  }
  return Math.round(hi / 100) * 100;
}

export function buildOfferReport(a: Offer, b: Offer): OfferReport {
  const A = side(a), B = side(b);
  const dTotal = B.total - A.total;
  return {
    taxYear: TAX_YEAR, a: A, b: B,
    gap: { netCash: B.netCash - A.netCash, total: dTotal, perHour: Math.round((B.perWorkingHour - A.perWorkingHour) * 100) / 100, monthly: Math.round(dTotal / 12) },
    winner: Math.abs(dTotal) < 100 ? 'tie' : dTotal > 0 ? 'b' : 'a',
    breakEvenSalaryForB: salaryForTotal(b, A.total),
  };
}
