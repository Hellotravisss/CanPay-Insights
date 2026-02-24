import { Province } from '../types';
import { 
  FEDERAL_BRACKETS, 
  PROVINCIAL_DATA,
  CPP_MAX_CONTRIBUTION,
  CPP2_MAX_CONTRIBUTION,
  FEDERAL_BASIC_PERSONAL_AMOUNT
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
    contributionRoom2025: number;
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

// 2025 RRSP Limits
const RRSP_MAX_CONTRIBUTION_2025 = 31950;
const RRSP_MAX_CONTRIBUTION_2026 = 32370;

// TFSA 2025 Limit
const TFSA_LIMIT_2025 = 7000;

// FHSA Limits
const FHSA_ANNUAL_LIMIT = 8000;
const FHSA_LIFETIME_LIMIT = 40000;

/**
 * Calculate marginal tax rate
 */
export const calculateMarginalRate = (
  annualIncome: number,
  province: string
): { federal: number; provincial: number; combined: number } => {
  // Federal marginal tax rate
  let federalRate = 0.15;
  for (const bracket of FEDERAL_BRACKETS) {
    if (annualIncome > bracket.threshold) {
      federalRate = bracket.rate;
    } else {
      break;
    }
  }

  // Provincial marginal tax rate
  const provData = PROVINCIAL_DATA[province as keyof typeof PROVINCIAL_DATA];
  let provincialRate = provData?.brackets[0]?.rate || 0.1;
  
  if (provData) {
    for (const bracket of provData.brackets) {
      if (annualIncome > bracket.threshold) {
        provincialRate = bracket.rate;
      } else {
        break;
      }
    }
  }

  return {
    federal: federalRate,
    provincial: provincialRate,
    combined: federalRate + provincialRate,
  };
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
    RRSP_MAX_CONTRIBUTION_2025
  );

  // Recommendations based on income tier
  let recommendedAmount = 0;
  let tierRecommendation = '';

  if (annualIncome <= 50000) {
    // Low income: prioritize TFSA, limited RRSP
    recommendedAmount = Math.min(5000, maxDeductible);
    tierRecommendation = 'Focus on building emergency fund first. Keep RRSP contribution under $5,000.';
  } else if (annualIncome <= 100000) {
    // Medium income: contribute to drop to lower tax bracket
    const targetIncome = 90000;
    recommendedAmount = Math.min(
      Math.max(0, annualIncome - targetIncome),
      maxDeductible
    );
    tierRecommendation = 'Contribute enough to drop into a lower tax bracket for maximum refund benefit.';
  } else if (annualIncome <= 150000) {
    // Upper medium income: contribute near maximum limit
    recommendedAmount = Math.min(
      Math.floor(maxDeductible * 0.8),
      maxDeductible
    );
    tierRecommendation = 'Maximize RRSP contribution for significant tax refund.';
  } else {
    // High income: maximum limit
    recommendedAmount = maxDeductible;
    tierRecommendation = 'Contribute the maximum amount to optimize tax benefits.';
  }

  // Calculate tax savings
  const taxSavings = Math.floor(recommendedAmount * combinedRate);
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
  const lifetimeRoom = 102000;

  let recommendedAmount = TFSA_LIMIT_2025;
  if (annualIncome < 50000) {
    // Low income: prioritize TFSA
    recommendedAmount = Math.min(TFSA_LIMIT_2025, Math.floor(annualIncome * 0.1));
  }

  return {
    contributionRoom2025: TFSA_LIMIT_2025,
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
  const taxSavings = Math.floor(recommendedAmount * marginalRate.combined);

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
    RRSP_MAX_CONTRIBUTION_2025
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
    const taxSavings = Math.floor(amount * marginalRate.combined);
    return {
      amount,
      taxSavings,
      effectiveCost: amount - taxSavings,
      refundRate: marginalRate.combined * 100,
    };
  });
};
