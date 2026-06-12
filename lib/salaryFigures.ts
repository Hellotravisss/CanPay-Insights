import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province } from '../types';

export interface SalaryFigures {
  gross: number;
  netAnnual: number;
  netMonthly: number;
  netSemiMonthly: number;
  netBiWeekly: number;
  netWeekly: number;
  netHourly: number;
  federalTax: number;
  provincialTax: number;
  pensionContribution: number; // CPP/QPP (includes QPIP for Quebec)
  eiPremium: number;
  totalDeductions: number;
  averageTaxRate: number; // (federal + provincial tax) / gross
  totalDeductionRate: number; // all deductions / gross
  marginalRate: number; // deduction share of the next $1,000 earned
}

export interface ProvinceSeoConfig {
  slug: string;
  province: Province;
  name: string;
  shortName: string;
}

export const PROVINCE_SEO_CONFIGS: ProvinceSeoConfig[] = [
  { slug: 'ontario', province: Province.ON, name: 'Ontario', shortName: 'Ontario' },
  { slug: 'bc', province: Province.BC, name: 'British Columbia', shortName: 'BC' },
  { slug: 'alberta', province: Province.AB, name: 'Alberta', shortName: 'Alberta' },
  { slug: 'quebec', province: Province.QC, name: 'Quebec', shortName: 'Quebec' },
  { slug: 'manitoba', province: Province.MB, name: 'Manitoba', shortName: 'Manitoba' },
  { slug: 'saskatchewan', province: Province.SK, name: 'Saskatchewan', shortName: 'Saskatchewan' },
  { slug: 'nova-scotia', province: Province.NS, name: 'Nova Scotia', shortName: 'Nova Scotia' },
  { slug: 'new-brunswick', province: Province.NB, name: 'New Brunswick', shortName: 'New Brunswick' },
  { slug: 'newfoundland', province: Province.NL, name: 'Newfoundland and Labrador', shortName: 'Newfoundland' },
  { slug: 'pei', province: Province.PE, name: 'Prince Edward Island', shortName: 'PEI' },
  { slug: 'yukon', province: Province.YT, name: 'Yukon', shortName: 'Yukon' },
  { slug: 'northwest-territories', province: Province.NT, name: 'Northwest Territories', shortName: 'Northwest Territories' },
  { slug: 'nunavut', province: Province.NU, name: 'Nunavut', shortName: 'Nunavut' },
];

export const getProvinceSeoConfig = (slug: string): ProvinceSeoConfig => {
  const config = PROVINCE_SEO_CONFIGS.find((entry) => entry.slug === slug);
  if (!config) {
    throw new Error(`Unknown province slug: ${slug}`);
  }
  return config;
};

const BI_WEEKLY_PERIODS = 26;
const WORK_HOURS_PER_YEAR = 2080;

const figuresCache = new Map<string, SalaryFigures>();

const computeAnnualDeductions = (amount: number, province: Province) => {
  const result = calculateFromAnnualSalary({
    annualSalary: amount,
    province,
    payFrequency: PayFrequency.BI_WEEKLY,
  });

  return {
    federalTax: result.federalTax * BI_WEEKLY_PERIODS,
    provincialTax: result.provincialTax * BI_WEEKLY_PERIODS,
    pensionContribution: result.cppDeduction * BI_WEEKLY_PERIODS,
    eiPremium: result.eiDeduction * BI_WEEKLY_PERIODS,
    netAnnual: result.netPayAnnual,
    totalDeductions: result.totalDeductionsAnnual,
  };
};

export const getSalaryFigures = (amount: number, provinceSlug: string): SalaryFigures => {
  const cacheKey = `${provinceSlug}:${amount}`;
  const cached = figuresCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const { province } = getProvinceSeoConfig(provinceSlug);
  const current = computeAnnualDeductions(amount, province);
  const next = computeAnnualDeductions(amount + 1000, province);

  const figures: SalaryFigures = {
    gross: amount,
    netAnnual: current.netAnnual,
    netMonthly: current.netAnnual / 12,
    netSemiMonthly: current.netAnnual / 24,
    netBiWeekly: current.netAnnual / 26,
    netWeekly: current.netAnnual / 52,
    netHourly: current.netAnnual / WORK_HOURS_PER_YEAR,
    federalTax: current.federalTax,
    provincialTax: current.provincialTax,
    pensionContribution: current.pensionContribution,
    eiPremium: current.eiPremium,
    totalDeductions: current.totalDeductions,
    averageTaxRate: (current.federalTax + current.provincialTax) / amount,
    totalDeductionRate: current.totalDeductions / amount,
    marginalRate: (next.totalDeductions - current.totalDeductions) / 1000,
  };

  figuresCache.set(cacheKey, figures);
  return figures;
};

export interface SalaryBreakdown {
  amount: number;
  provinceSlug: string;
  provinceName: string;
  provinceShortName: string;
  figures: SalaryFigures;
  provinceComparison: Array<{
    slug: string;
    shortName: string;
    netAnnual: number;
    netMonthly: number;
    href: string;
  }>;
  nearbySalaries: Array<{
    amount: number;
    netAnnual: number;
    netMonthly: number;
    netBiWeekly: number;
    href: string;
  }>;
}

export const buildSalaryBreakdown = (
  amount: number,
  provinceSlug: string,
  allAmounts: number[]
): SalaryBreakdown => {
  const config = getProvinceSeoConfig(provinceSlug);

  const provinceComparison = PROVINCE_SEO_CONFIGS.map((entry) => {
    const figures = getSalaryFigures(amount, entry.slug);
    return {
      slug: entry.slug,
      shortName: entry.shortName,
      netAnnual: figures.netAnnual,
      netMonthly: figures.netMonthly,
      href: `/${amount}-after-tax-${entry.slug}`,
    };
  }).sort((a, b) => b.netAnnual - a.netAnnual);

  const nearbySalaries = allAmounts
    .filter((candidate) => candidate !== amount)
    .sort((a, b) => Math.abs(a - amount) - Math.abs(b - amount))
    .slice(0, 8)
    .sort((a, b) => a - b)
    .map((candidate) => {
      const figures = getSalaryFigures(candidate, provinceSlug);
      return {
        amount: candidate,
        netAnnual: figures.netAnnual,
        netMonthly: figures.netMonthly,
        netBiWeekly: figures.netBiWeekly,
        href: `/${candidate}-after-tax-${provinceSlug}`,
      };
    });

  return {
    amount,
    provinceSlug,
    provinceName: config.name,
    provinceShortName: config.shortName,
    figures: getSalaryFigures(amount, provinceSlug),
    provinceComparison,
    nearbySalaries,
  };
};
