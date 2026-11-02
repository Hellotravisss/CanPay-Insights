/**
 * Data tables for the landing pages, computed from the engine at build time.
 *
 * Why: the November 2026 Avowd measurement (22 questions × 12 engines × 2) found
 * seven questions on which no engine named CanPay — "how much tax will I pay in
 * BC", "how much tax comes off my paycheque in Alberta", "CPP and EI deductions
 * explained", "marginal vs average tax rate", "RRSP tax savings", "BC省 工资扣税多少",
 * overtime — although the site had a page for most of them. The pages the
 * engines cited instead answer with a table: brackets, tax at several incomes,
 * the deduction on one cheque. Ours answered with one worked example in prose.
 *
 * Every figure here comes from utils/taxEngine.ts or constants.ts, never from a
 * literal, so a new tax year or a CRA mid-year edition changes the tables with
 * the engine and audit:engine is what proves them.
 */
import * as C from '../constants';
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province } from '../types';
import { getProvinceSeoConfig, getSalaryFigures, PROVINCE_SEO_CONFIGS } from './salaryFigures';
import { simulatePays } from './capTimeline';

export interface DataTable {
  heading: string;
  intro?: string;
  columns: string[];
  rows: string[][];
  note?: string;
}

const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;
const cents = (n: number) => `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (r: number, digits = 2) => `${(r * 100).toFixed(digits).replace(/\.?0+$/, '')}%`;

type Bracket = { threshold: number; rate: number };

/** [range, rate] per bracket, e.g. ["$50,363 – $100,728", "7.7%"]. */
export function bracketRows(brackets: Bracket[]): string[][] {
  let floor = 0;
  return brackets.map(({ threshold, rate }) => {
    const range = threshold === Infinity ? `Over ${money(floor)}` : `${money(floor)} – ${money(threshold)}`;
    floor = threshold;
    return [range, pct(rate)];
  });
}

/** Federal and provincial brackets side by side, with the basic personal amounts. */
export function bracketTables(provinceSlug: string): DataTable[] {
  const { province, name } = getProvinceSeoConfig(provinceSlug);
  const rule = C.PROVINCIAL_DATA[province as keyof typeof C.PROVINCIAL_DATA];
  return [
    {
      heading: `${C.TAX_YEAR} ${name} income tax brackets`,
      columns: ['Taxable income', `${name} rate`],
      rows: bracketRows(rule.brackets),
      note: `Each rate applies only to the income inside its band. The ${name} basic personal amount (${money(rule.basicPersonalAmount)}) is a credit at the lowest rate, so in effect that much income is tax-free.`,
    },
    {
      heading: `${C.TAX_YEAR} federal income tax brackets`,
      columns: ['Taxable income', 'Federal rate'],
      rows: bracketRows(C.FEDERAL_BRACKETS),
      note: `Federal tax is paid on top of ${name} tax. The federal basic personal amount is ${money(C.FEDERAL_BASIC_PERSONAL_AMOUNT)} (reduced above ${money(C.FEDERAL_BPA_THRESHOLD)}).`,
    },
  ];
}

/** Annual tax and payroll deductions at several salaries in one province. */
export function taxAtSalariesTable(provinceSlug: string, amounts: number[]): DataTable {
  const { name } = getProvinceSeoConfig(provinceSlug);
  return {
    heading: `How much tax you pay in ${name} at each salary (${C.TAX_YEAR})`,
    columns: ['Salary', 'Federal tax', `${name} tax`, 'CPP/CPP2', 'EI', 'Take-home', 'Average tax rate', 'Next $1,000 keeps'],
    rows: amounts.map((a) => {
      const f = getSalaryFigures(a, provinceSlug);
      return [money(a), money(f.federalTax), money(f.provincialTax), money(f.pensionContribution), money(f.eiPremium),
        money(f.netAnnual), pct(f.averageTaxRate, 1), money(1000 * (1 - f.marginalRate))];
    }),
    note: 'Average tax rate is federal plus provincial income tax divided by salary. The last column is what reaches you from a $1,000 raise after tax, CPP and EI. Single filer, basic credits only, no RRSP.',
  };
}

const BI_WEEKLY = 26;

/** What comes off one bi-weekly cheque: the engine's per-period withholding (CRA T4032 method). */
export function paychequeTable(provinceSlug: string, amounts: number[]): DataTable {
  const { province, name } = getProvinceSeoConfig(provinceSlug);
  return {
    heading: `What comes off a bi-weekly paycheque in ${name} (${C.TAX_YEAR})`,
    columns: ['Salary', 'Gross cheque', 'Federal tax', `${name} tax`, 'CPP/CPP2', 'EI', 'Net cheque'],
    rows: amounts.map((a) => {
      const r = calculateFromAnnualSalary({ annualSalary: a, province, payFrequency: PayFrequency.BI_WEEKLY });
      return [money(a), cents(a / BI_WEEKLY), cents(r.federalTax), cents(r.provincialTax), cents(r.cppDeduction), cents(r.eiDeduction), cents(r.netPayBiWeekly)];
    }),
    note: `26 pay periods a year, claim code 1 (basic personal amounts only). CanPay's engine is tested against every bi-weekly row of the CRA T4032 payroll deduction tables. Once your year's CPP or EI reaches its maximum, those lines stop and later cheques are larger.`,
  };
}

/** The 2026 CPP, CPP2 and EI parameters, from constants.ts. */
export function cppEiParametersTable(): DataTable {
  return {
    heading: `${C.TAX_YEAR} CPP, CPP2 and EI at a glance`,
    columns: ['Deduction', 'Employee rate', 'Earnings it applies to', 'Maximum a year'],
    rows: [
      ['CPP', pct(C.CPP_RATE), `${money(C.CPP_EXEMPTION)} – ${money(C.CPP_MAX_PENSIONABLE_EARNINGS)}`, cents(C.CPP_MAX_CONTRIBUTION)],
      ['CPP2', pct(C.CPP2_RATE), `${money(C.CPP2_MIN_PENSIONABLE_EARNINGS)} – ${money(C.CPP2_MAX_PENSIONABLE_EARNINGS)}`, cents(C.CPP2_MAX_CONTRIBUTION)],
      ['EI', pct(C.EI_RATE), `Up to ${money(C.EI_MAX_INSURABLE_EARNINGS)}`, cents(C.EI_MAX_CONTRIBUTION)],
      ['QPP (Quebec)', pct(C.QPP_RATE), `${money(C.QPP_EXEMPTION)} – ${money(C.QPP_MAX_PENSIONABLE_EARNINGS)}`, cents(C.QPP_MAX_CONTRIBUTION)],
      ['EI (Quebec)', pct(C.QC_EI_RATE), `Up to ${money(C.EI_MAX_INSURABLE_EARNINGS)}`, cents(C.QC_EI_MAX_CONTRIBUTION)],
      ['QPIP (Quebec)', pct(C.QPIP_RATE, 3), `Up to ${money(C.QPIP_MAX_INSURABLE_EARNINGS)}`, cents(C.QPIP_MAX_CONTRIBUTION)],
    ],
    note: `Your employer pays the same CPP and CPP2 as you, and 1.4 × your EI. The ${money(C.CPP_EXEMPTION)} exemption is spread across the year's pay periods.`,
  };
}

/** Annual CPP/CPP2 and EI at several salaries, and the cheque each one ends on (lib/capTimeline.ts). */
export function cppEiBySalaryTable(amounts: number[]): DataTable {
  const sum = (xs: number[]) => xs.reduce((t, x) => t + (x || 0), 0);
  return {
    heading: `CPP and EI by salary outside Quebec (${C.TAX_YEAR})`,
    columns: ['Salary', 'CPP', 'CPP2', 'EI', 'Total', 'Last CPP cheque', 'Last CPP2 cheque', 'Last EI cheque'],
    rows: amounts.map((a) => {
      const sim = simulatePays(a, BI_WEEKLY, false);
      const cpp = sum(sim.cpp), cpp2 = sum(sim.cpp2), ei = sum(sim.ei);
      const last = (kind: 'cpp' | 'cpp2' | 'ei', paid: number) =>
        paid === 0 ? 'none' : `#${sim.capped.find((c) => c.kind === kind)?.period ?? BI_WEEKLY}`;
      return [money(a), cents(cpp), cents(cpp2), cents(ei), cents(cpp + cpp2 + ei), last('cpp', cpp), last('cpp2', cpp2), last('ei', ei)];
    }),
    note: `Equal bi-weekly cheques, 26 a year, deducted the way payroll does it: a share of the ${money(C.CPP_EXEMPTION)} exemption on each pay, then nothing once the year's maximum is reached, so later cheques are larger. CPP2 starts only after year-to-date earnings pass ${money(C.CPP_MAX_PENSIONABLE_EARNINGS)}. Change jobs mid-year and the new employer starts again from zero; CRA refunds any overpayment when you file.`,
  };
}

/** Average and marginal rate at one salary in every province and territory. */
export function ratesByProvinceTable(amount: number): DataTable {
  return {
    heading: `Average vs marginal rate on ${money(amount)}, every province (${C.TAX_YEAR})`,
    columns: ['Province', 'Income tax', 'Average tax rate', 'Marginal rate (tax + CPP + EI)', 'Take-home'],
    rows: PROVINCE_SEO_CONFIGS.map((p) => ({ p, f: getSalaryFigures(amount, p.slug) }))
      .sort((x, y) => x.f.averageTaxRate - y.f.averageTaxRate)
      .map(({ p, f }) => [p.name, money(f.federalTax + f.provincialTax), pct(f.averageTaxRate, 1), pct(f.marginalRate, 1), money(f.netAnnual)]),
    note: 'Average rate = federal plus provincial income tax divided by salary. Marginal rate = the share of the next $1,000 that goes to tax, CPP and EI. Sorted from lowest average rate.',
  };
}

const incomeTaxWithRrsp = (a: number, province: Province, rrsp: number) => {
  const r = calculateFromAnnualSalary({
    annualSalary: a, province, payFrequency: PayFrequency.BI_WEEKLY,
    rrspType: 'amount', rrspContributionPerPeriod: rrsp / BI_WEEKLY,
  });
  return (r.federalTax + r.provincialTax) * BI_WEEKLY;
};

/** Federal plus provincial income tax an RRSP contribution saves, for one salary and province. */
export function rrspSaving(amount: number, provinceSlug: string, contribution: number): number {
  const { province } = getProvinceSeoConfig(provinceSlug);
  return incomeTaxWithRrsp(amount, province, 0) - incomeTaxWithRrsp(amount, province, contribution);
}

/** Income tax saved by an RRSP contribution, by salary and province. */
export function rrspSavingsTable(contribution: number, amounts: number[], provinceSlugs: string[]): DataTable {
  return {
    heading: `Tax saved by a ${money(contribution)} RRSP contribution (${C.TAX_YEAR})`,
    columns: ['Salary', ...provinceSlugs.map((s) => getProvinceSeoConfig(s).shortName)],
    rows: amounts.map((a) => [money(a), ...provinceSlugs.map((s) => money(rrspSaving(a, s, contribution)))]),
    note: `Federal plus provincial income tax, with and without the contribution. An RRSP does not lower CPP or EI. Your ${C.TAX_YEAR} limit is 18% of last year's earned income, up to ${money(C.RRSP_DOLLAR_LIMIT)}, plus unused room from earlier years.`,
  };
}
