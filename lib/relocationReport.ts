import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province } from '../types';
import { TAX_YEAR } from '../constants';

/**
 * Everything in the Province Move Report is computed here from the same tax
 * engine the free calculator uses — the one the prebuild audit checks every
 * published figure against. Nothing in the report is typed in by hand.
 *
 * The report sells a decision, and the decision has three legs the free
 * calculator never shows side by side: the take-home gap itself, the
 * December 31 residency rule (which can move a whole year of provincial tax),
 * and the consumption-tax gap that shows up in every receipt after the move.
 */

export const PROVINCE_NAMES = Object.values(Province) as string[];

export function isProvince(p: unknown): p is Province {
  return typeof p === 'string' && PROVINCE_NAMES.includes(p);
}

/** Sales tax a resident pays at the till, by jurisdiction, for the tax year.
 *  GST is federal and identical everywhere; the provincial part is what moves. */
export const SALES_TAX: Record<string, { gst: number; pst: number; label: string }> = {
  [Province.AB]: { gst: 5, pst: 0, label: 'GST only' },
  [Province.BC]: { gst: 5, pst: 7, label: 'GST + PST' },
  [Province.MB]: { gst: 5, pst: 7, label: 'GST + RST' },
  [Province.SK]: { gst: 5, pst: 6, label: 'GST + PST' },
  [Province.QC]: { gst: 5, pst: 9.975, label: 'GST + QST' },
  [Province.ON]: { gst: 5, pst: 8, label: 'HST 13%' },
  [Province.NB]: { gst: 5, pst: 10, label: 'HST 15%' },
  [Province.NS]: { gst: 5, pst: 9, label: 'HST 14%' },
  [Province.PE]: { gst: 5, pst: 10, label: 'HST 15%' },
  [Province.NL]: { gst: 5, pst: 10, label: 'HST 15%' },
  [Province.YT]: { gst: 5, pst: 0, label: 'GST only' },
  [Province.NT]: { gst: 5, pst: 0, label: 'GST only' },
  [Province.NU]: { gst: 5, pst: 0, label: 'GST only' },
};

export type ProvinceFigures = {
  province: string;
  gross: number;
  net: number;
  netMonthly: number;
  netBiweekly: number;
  federalTax: number;
  provincialTax: number;
  cpp: number;
  ei: number;
  totalDeductions: number;
  effectiveRate: number; // % of gross lost to all deductions
  salesTaxTotal: number; // % at the till
};

export type RelocationReport = {
  taxYear: number;
  income: number;
  from: ProvinceFigures;
  to: ProvinceFigures;
  netGapAnnual: number;      // to.net - from.net (positive = more take-home after move)
  netGapMonthly: number;
  provincialTaxGap: number;  // to.provincialTax - from.provincialTax
  /** December 31 rule: provincial tax for the whole year follows the province
   *  of residence on Dec 31. Moving late in the year re-rates the full year. */
  dec31: {
    ifResidentInToOnDec31: number;   // full-year provincial tax at `to` rates
    ifResidentInFromOnDec31: number; // full-year provincial tax at `from` rates
    swing: number;                   // difference a Dec 31 address makes
  };
  salesTaxGapPoints: number; // to - from, percentage points at the till
  /** Analysis — all engine-derived. */
  analysis: {
    /** Gross salary in `to` that lands the same take-home as `income` in `from`. */
    matchingSalaryInTo: number;
    /** What the next $1,000 of gross keeps, after all deductions, in each province. */
    keepPer1000From: number;
    keepPer1000To: number;
    /** Cumulative take-home gap over five years at the same salary. */
    fiveYearGap: number;
    /** Take-home rank of each province among all 13 at this income (1 = most). */
    rankFrom: number;
    rankTo: number;
    /** Every province's take-home at this income, for the bar chart. */
    ladder: { province: string; net: number }[];
  };
};

function figures(province: string, income: number): ProvinceFigures {
  const r = calculateFromAnnualSalary({
    province,
    annualSalary: income,
    payFrequency: PayFrequency.MONTHLY,
  });
  const annual = (x: number) => Math.round(x * 12);
  const federalTax = annual(r.federalTax);
  const provincialTax = annual(r.provincialTax);
  const cpp = annual(r.cppDeduction);
  const ei = annual(r.eiDeduction);
  const net = Math.round(r.netPayAnnual);
  const gross = Math.round(r.grossPayAnnual);
  const totalDeductions = gross - net;
  const st = SALES_TAX[province];
  return {
    province,
    gross,
    net,
    netMonthly: Math.round(net / 12),
    netBiweekly: Math.round(net / 26),
    federalTax,
    provincialTax,
    cpp,
    ei,
    totalDeductions,
    effectiveRate: gross ? Math.round((totalDeductions / gross) * 1000) / 10 : 0,
    salesTaxTotal: st ? Math.round((st.gst + st.pst) * 1000) / 1000 : 0,
  };
}

function netOf(province: string, income: number): number {
  return Math.round(
    calculateFromAnnualSalary({ province, annualSalary: income, payFrequency: PayFrequency.MONTHLY }).netPayAnnual,
  );
}

/** Gross in `province` whose take-home equals `targetNet` — bisection on the
 *  engine itself, so the answer obeys every bracket and credit it knows. */
function grossForNet(province: string, targetNet: number): number {
  let lo = 0, hi = Math.max(targetNet * 3, 50_000);
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (netOf(province, mid) < targetNet) lo = mid; else hi = mid;
  }
  return Math.round(hi / 10) * 10;
}

export function buildRelocationReport(from: string, to: string, income: number): RelocationReport {
  const f = figures(from, income);
  const t = figures(to, income);
  const ladder = PROVINCE_NAMES.map((province) => ({ province, net: netOf(province, income) }))
    .sort((a, b) => b.net - a.net);
  const rank = (p: string) => ladder.findIndex((x) => x.province === p) + 1;
  return {
    analysis: {
      matchingSalaryInTo: grossForNet(to, f.net),
      keepPer1000From: netOf(from, income + 1000) - f.net,
      keepPer1000To: netOf(to, income + 1000) - t.net,
      fiveYearGap: (t.net - f.net) * 5,
      rankFrom: rank(from),
      rankTo: rank(to),
      ladder,
    },
    taxYear: TAX_YEAR,
    income,
    from: f,
    to: t,
    netGapAnnual: t.net - f.net,
    netGapMonthly: Math.round((t.net - f.net) / 12),
    provincialTaxGap: t.provincialTax - f.provincialTax,
    dec31: {
      ifResidentInToOnDec31: t.provincialTax,
      ifResidentInFromOnDec31: f.provincialTax,
      swing: t.provincialTax - f.provincialTax,
    },
    salesTaxGapPoints: Math.round((t.salesTaxTotal - f.salesTaxTotal) * 1000) / 1000,
  };
}
