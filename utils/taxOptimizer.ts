import { Province, PayFrequency, type AnnualSalaryInputs } from '../types';
import { calculateFromAnnualSalary } from './taxEngine';
import { 
  FEDERAL_BRACKETS, 
  PROVINCIAL_DATA,
  CPP_MAX_CONTRIBUTION,
  CPP2_MAX_CONTRIBUTION,
  FEDERAL_BASIC_PERSONAL_AMOUNT,
  RRSP_DOLLAR_LIMIT,
} from '../constants';

export interface TaxOptimizationResult {
  // RRSP Recommendations
  rrsp: {
    recommendedAmount: number;
    maxDeductible: number;
    taxSavings: number;
    effectiveCost: number;
    refundAmount: number;
    marginalRate: number;
    tierRecommendation: string;
  };
  // TFSA Recommendations
  tfsa: {
    annualLimit: number;
    recommendedAmount: number;
    lifetimeRoom: number;
  };
  // FHSA Recommendations
  fhsa: {
    annualLimit: number;
    lifetimeLimit: number;
    taxSavings: number;
    recommendedAmount: number;
  };
  // Other Tax Strategies
  otherStrategies: TaxStrategy[];
  // Summary
  summary: {
    totalPotentialSavings: number;
    priority: string;
    actionPlan: string[];
  };
}

export interface TaxStrategy {
  name: string;
  description: string;
  maxBenefit: number;
  effort: 'low' | 'medium' | 'high';
  suitability: 'highly-recommended' | 'recommended' | 'optional';
  estimatedSavings: number;
  actionItems: string[];
}

// The RRSP dollar limit comes from constants.ts (RRSP_DOLLAR_LIMIT) — the same
// figure the FAQ, llms.txt and articles quote. This file used to carry its own
// copy, $31,950, so the advisor told high earners they had $1,860 less room
// than every other page on the site said (found 2026-09-22).

// TFSA 2025 Limit
// TFSA annual dollar limit. $7,000 for 2024, 2025 and 2026 (indexation has not
// pushed it to the next $500 step). Cumulative room for someone eligible since
// 2009 and never contributed: $109,000 as of 2026 ($102,000 through 2025 + $7,000).
// Sources checked 2026-08-24: Fidelity Canada TFSA limit article; CRA TFSA pages.
const TFSA_ANNUAL_LIMIT = 7000;
const TFSA_LIFETIME_ROOM = 109_000;

// FHSA Limits
const FHSA_ANNUAL_LIMIT = 8000;
const FHSA_LIFETIME_LIMIT = 40000;

/**
 * Marginal income-tax rate at an income: federal and provincial tax on one
 * more dollar, measured by running the engine itself.
 *
 * This used to walk FEDERAL_BRACKETS and PROVINCIAL_DATA by hand, and was wrong
 * twice over. The tables store each bracket's UPPER limit ("14% on the first
 * $58,523") while the loop read it as a lower bound, so it always returned the
 * rate of the bracket below — Ontario at $100,000 came out at 19.05% instead of
 * the statutory 29.65%. And it never applied Ontario's or PEI's surtax, the
 * Ontario Health Premium or the federal basic-amount phase-out, so even with
 * the bracket fixed it would have understated. The true figure at $100,000 in
 * Ontario is 31.5%. An outside reviewer found this by comparing the displayed
 * rate with the change in take-home between $100,000 and $101,000 (2026-09-22).
 *
 * It had escaped the golden test because the golden test checks the engine,
 * and this was a second formula beside the engine. Deriving it FROM the engine
 * means there is one source of truth; `scripts/auditMarginal.ts` fails the
 * build if a hand-written rate ever comes back.
 *
 * Tax only — CPP, EI and QPIP are left out on purpose. The callers use this to
 * value RRSP and FHSA deductions, which lower income tax but not payroll
 * contributions. A centred $1,000 step keeps a bracket edge from being read as
 * the next bracket's rate.
 */
/** Federal + provincial income tax for a year, from the engine. */
export const incomeTaxAt = (annualIncome: number, province: string): number => {
  const r = calculateFromAnnualSalary({ province, annualSalary: Math.max(0, annualIncome), payFrequency: PayFrequency.BI_WEEKLY } as AnnualSalaryInputs);
  return (r.federalTax + r.provincialTax) * 26;
};

/**
 * Tax a deduction (RRSP, FHSA) actually saves: tax at the income minus tax at
 * the income less the deduction, both from the engine.
 *
 * Multiplying the whole amount by the marginal rate — what this file did until
 * 2026-09-22 — assumes every dollar is saved at the top rate. A large
 * contribution reaches down into lower brackets, so that overstated the
 * saving: Ontario, $120,000, a $17,280 RRSP was shown saving $7,501 when it
 * saves $6,007. The marginal rate is right only for the next dollar.
 */
export const taxSavedByDeduction = (annualIncome: number, province: string, amount: number): number =>
  Math.max(0, Math.floor(incomeTaxAt(annualIncome, province) - incomeTaxAt(annualIncome - Math.max(0, amount), province)));

/**
 * The nearest income below this one at which the combined marginal rate
 * actually drops by at least a point, searched no further than `maxDown`.
 * Null if there is none in reach. Used so that "contribute enough to drop into
 * a lower bracket" is only ever said when it is true — the advisor used to aim
 * at a hard-coded $90,000, which is not a bracket boundary anywhere in Canada.
 */
export const nextRateDrop = (annualIncome: number, province: string, maxDown: number): number | null => {
  const step = 250;
  const rateAt = (x: number) => (incomeTaxAt(x, province) - incomeTaxAt(x - step, province)) / step;
  const top = rateAt(annualIncome);
  for (let x = annualIncome - step; x >= Math.max(step, annualIncome - maxDown); x -= step) {
    if (top - rateAt(x) >= 0.01) return x;
  }
  return null;
};

export const calculateMarginalRate = (
  annualIncome: number,
  province: string
): { federal: number; provincial: number; combined: number } => {
  const step = 500;
  const lo = Math.max(0, annualIncome - step);
  const hi = lo + 2 * step;
  const taxAt = (income: number) => {
    const r = calculateFromAnnualSalary({ province, annualSalary: income, payFrequency: PayFrequency.BI_WEEKLY } as AnnualSalaryInputs);
    return { fed: r.federalTax * 26, prov: r.provincialTax * 26 };
  };  // split federal/provincial here; incomeTaxAt gives the combined figure
  const a = taxAt(lo), b = taxAt(hi);
  const federal = Math.max(0, (b.fed - a.fed) / (hi - lo));
  const provincial = Math.max(0, (b.prov - a.prov) / (hi - lo));
  return { federal, provincial, combined: federal + provincial };
};

/**
 * Calculate optimal RRSP contribution amount
 */
const calculateRRSPRecommendation = (
  annualIncome: number,
  province: string
) => {
  const marginalRate = calculateMarginalRate(annualIncome, province);
  const combinedRate = marginalRate.combined;

  // Calculate maximum deductible amount (18% of income, capped)
  const maxDeductible = Math.min(
    Math.floor(annualIncome * 0.18),
    RRSP_DOLLAR_LIMIT
  );

  // Recommendations based on income tier
  let recommendedAmount = 0;
  let tierRecommendation = '';

  if (annualIncome <= 50000) {
    // Low income: prioritize TFSA, limited RRSP
    recommendedAmount = Math.min(5000, maxDeductible);
    tierRecommendation = 'tier.emergency';
  } else if (annualIncome <= 100000) {
    // Medium income: contribute down to where the marginal rate really drops,
    // if that point is within reach; otherwise don't promise a bracket change.
    const drop = nextRateDrop(annualIncome, province, maxDeductible);
    if (drop !== null) {
      recommendedAmount = Math.min(annualIncome - drop, maxDeductible);
      tierRecommendation = 'tier.bracket';
    } else {
      recommendedAmount = Math.min(5000, maxDeductible);
      tierRecommendation = 'tier.maximize';
    }
  } else if (annualIncome <= 150000) {
    // Upper medium income: contribute near maximum limit
    recommendedAmount = Math.min(
      Math.floor(maxDeductible * 0.8),
      maxDeductible
    );
    tierRecommendation = 'tier.maximize';
  } else {
    // High income: maximum limit
    recommendedAmount = maxDeductible;
    tierRecommendation = 'tier.maxAll';
  }

  // Tax saved, measured by the engine across the whole contribution
  const taxSavings = taxSavedByDeduction(annualIncome, province, recommendedAmount);
  const effectiveCost = recommendedAmount - taxSavings;
  const refundAmount = taxSavings;

  return {
    recommendedAmount,
    maxDeductible,
    taxSavings,
    effectiveCost,
    refundAmount,
    marginalRate: combinedRate,
    tierRecommendation,
  };
};

/**
 * Calculate TFSA recommendations
 */
const calculateTFSARecommendation = (annualIncome: number) => {
  // Lifetime contribution room as of 2025
  const lifetimeRoom = TFSA_LIFETIME_ROOM;

  let recommendedAmount = TFSA_ANNUAL_LIMIT;
  if (annualIncome < 50000) {
    // Low income: prioritize TFSA
    recommendedAmount = Math.min(TFSA_ANNUAL_LIMIT, Math.floor(annualIncome * 0.1));
  }

  return {
    annualLimit: TFSA_ANNUAL_LIMIT,
    recommendedAmount,
    lifetimeRoom,
  };
};

/**
 * Calculate FHSA recommendations
 */
const calculateFHSARecommendation = (
  annualIncome: number,
  province: string
) => {
  const marginalRate = calculateMarginalRate(annualIncome, province);
  const recommendedAmount = Math.min(FHSA_ANNUAL_LIMIT, Math.floor(annualIncome * 0.1));
  const taxSavings = taxSavedByDeduction(annualIncome, province, recommendedAmount);

  return {
    annualLimit: FHSA_ANNUAL_LIMIT,
    lifetimeLimit: FHSA_LIFETIME_LIMIT,
    taxSavings,
    recommendedAmount,
  };
};

/**
 * Generate other tax reduction strategies
 */
const generateOtherStrategies = (
  annualIncome: number,
  province: string
): TaxStrategy[] => {
  const strategies: TaxStrategy[] = [];

  // 1. Charitable Donations
  strategies.push({
    name: 'Charitable Donations Tax Credit',
    description: 'Donations over $200 receive higher refund rates (federal 29% + provincial)',
    maxBenefit: Math.floor(annualIncome * 0.05 * 0.4),
    effort: 'low',
    suitability: annualIncome > 70000 ? 'recommended' : 'optional',
    estimatedSavings: Math.floor(Math.min(annualIncome * 0.02, 1000) * 0.4),
    actionItems: [
      'Collect all charitable donation receipts',
      'Consider bundling multiple years of donations into one year for higher refund rates',
      'Use CRA-certified charitable organizations',
    ],
  });

  // 2. Medical Expense Tax Credit
  const medicalThreshold = Math.min(annualIncome * 0.03, 2749);
  strategies.push({
    name: 'Medical Expense Tax Credit',
    description: `Medical expenses exceeding 3% of income (approx. $${medicalThreshold.toFixed(0)}) or $2,749 are deductible`,
    maxBenefit: 1500,
    effort: 'medium',
    suitability: 'recommended',
    estimatedSavings: 800,
    actionItems: [
      'Keep all medical receipts (dental, vision care, prescriptions)',
      'Consider timing planned medical expenses in December to cross the threshold',
      'Include spouse and dependent medical expenses',
    ],
  });

  // 3. Child Care Expense Deduction
  if (annualIncome < 150000) {
    const childCareMax = annualIncome <= 80000 ? 8000 : 5000;
    strategies.push({
      name: 'Child Care Expense Deduction',
      description: 'Up to $8,000 for children under 7, up to $5,000 for ages 7-16',
      maxBenefit: childCareMax,
      effort: 'low',
      suitability: 'highly-recommended',
      estimatedSavings: Math.floor(childCareMax * 0.3),
      actionItems: [
        'Ensure daycare provides official receipts',
        'Lower-income spouse should claim for greater tax benefit',
        'Include daycare, nanny, and summer camp costs',
      ],
    });
  }

  // 4. Work From Home Deduction
  strategies.push({
    name: 'Work From Home Deduction',
    description: 'Deduct utilities, internet, office supplies for home office work',
    maxBenefit: 500,
    effort: 'medium',
    suitability: 'recommended',
    estimatedSavings: 150,
    actionItems: [
      'Track days worked from home',
      'Keep utility and internet bills',
      'Calculate office space percentage of home',
    ],
  });

  // 5. Province-specific benefits
  if (province === Province.ON) {
    strategies.push({
      name: 'Ontario Health Benefits',
      description: 'Private health insurance premiums and OHIP-non-covered medical expenses',
      maxBenefit: 600,
      effort: 'low',
      suitability: 'optional',
      estimatedSavings: 150,
      actionItems: [
        'Keep private health insurance premium receipts',
        'Track OHIP-non-covered medical services',
      ],
    });
  } else if (province === Province.BC) {
    strategies.push({
      name: 'BC Climate Action Tax Credit',
      description: 'Low-income families receive additional climate action supplement',
      maxBenefit: 447,
      effort: 'low',
      suitability: annualIncome < 60000 ? 'highly-recommended' : 'optional',
      estimatedSavings: 300,
      actionItems: [
        'Ensure T1 income tax is filed',
        'Coordinate with spouse on who claims for maximum benefit',
      ],
    });
  }

  // 6. Tuition and Education Credits
  if (annualIncome < 80000) {
    strategies.push({
      name: 'Tuition Tax Credit',
      description: 'Full-time student tuition is tax-deductible; unused amounts can transfer to spouse or parent',
      maxBenefit: 5000,
      effort: 'low',
      suitability: 'highly-recommended',
      estimatedSavings: 750,
      actionItems: [
        'Obtain T2202 form from school',
        'Consider transferring unused amounts to higher-income spouse',
        'Keep textbook and learning material receipts',
      ],
    });
  }

  // 7. First-Time Home Buyers Tax Credit
  strategies.push({
    name: 'First-Time Home Buyers Tax Credit (HBTC)',
    description: 'First-time home buyers receive $10,000 non-refundable tax credit',
    maxBenefit: 1500,
    effort: 'low',
    suitability: 'highly-recommended',
    estimatedSavings: 1500,
    actionItems: [
      'Confirm first-time home buyer eligibility',
      'Claim in year of home purchase',
      'Combine with FHSA account for maximum benefit',
    ],
  });

  return strategies;
};

/**
 * Main function: Generate complete tax optimization recommendations
 */
export const generateTaxOptimization = (
  annualIncome: number,
  province: string
): TaxOptimizationResult => {
  const rrsp = calculateRRSPRecommendation(annualIncome, province);
  const tfsa = calculateTFSARecommendation(annualIncome);
  const fhsa = calculateFHSARecommendation(annualIncome, province);
  const otherStrategies = generateOtherStrategies(annualIncome, province);

  // Calculate total potential savings
  const totalPotentialSavings =
    rrsp.taxSavings +
    fhsa.taxSavings +
    otherStrategies.reduce((sum, s) => sum + s.estimatedSavings, 0);

  // Generate action plan
  const actionPlan: string[] = [];
  
  if (rrsp.recommendedAmount > 0) {
    actionPlan.push(`Contribute $${rrsp.recommendedAmount.toLocaleString()} to RRSP for estimated $${rrsp.refundAmount.toLocaleString()} tax refund`);
  }
  
  if (tfsa.recommendedAmount > 0) {
    actionPlan.push(`Open/contribute $${tfsa.recommendedAmount.toLocaleString()} to TFSA account`);
  }
  
  if (fhsa.recommendedAmount > 0) {
    actionPlan.push(`Open FHSA account and contribute $${fhsa.recommendedAmount.toLocaleString()}`);
  }

  // Determine priority
  let priority = '';
  if (annualIncome > 120000) {
    priority = 'High Priority: Maximize all tax-advantaged accounts (RRSP, TFSA, FHSA)';
  } else if (annualIncome > 70000) {
    priority = 'Medium Priority: Balance RRSP and TFSA contributions, prioritize dropping tax brackets';
  } else {
    priority = 'Basic Priority: Focus on TFSA emergency fund, modest RRSP contributions';
  }

  return {
    rrsp,
    tfsa,
    fhsa,
    otherStrategies,
    summary: {
      totalPotentialSavings,
      priority,
      actionPlan,
    },
  };
};

/**
 * Calculate RRSP contribution scenarios at different amounts
 */
export const calculateRRSPScenarios = (
  annualIncome: number,
  province: string
): { amount: number; taxSavings: number; effectiveCost: number; refundRate: number }[] => {
  const marginalRate = calculateMarginalRate(annualIncome, province);
  const maxDeductible = Math.min(
    Math.floor(annualIncome * 0.18),
    RRSP_DOLLAR_LIMIT
  );

  const scenarios = [
    Math.min(3000, maxDeductible),
    Math.min(5000, maxDeductible),
    Math.min(10000, maxDeductible),
    Math.min(15000, maxDeductible),
    Math.min(20000, maxDeductible),
    maxDeductible,
  ].filter((v, i, a) => a.indexOf(v) === i);

  return scenarios.map((amount) => {
    const taxSavings = taxSavedByDeduction(annualIncome, province, amount);
    return {
      amount,
      taxSavings,
      effectiveCost: amount - taxSavings,
      // The rate this contribution actually earns back, not the top rate.
      refundRate: amount > 0 ? (taxSavings / amount) * 100 : 0,
    };
  });
};

// English fallback for the tier keys — used in plain-text report exports,
// which stay English regardless of UI language.
export const TIER_EN: Record<string, string> = {
  'tier.emergency': 'Focus on building emergency fund first. Keep RRSP contribution under $5,000.',
  'tier.bracket': 'Contribute enough to drop into a lower tax bracket for maximum refund benefit.',
  'tier.maximize': 'Maximize RRSP contribution for significant tax refund.',
  'tier.maxAll': 'Contribute the maximum amount to optimize tax benefits.',
};
