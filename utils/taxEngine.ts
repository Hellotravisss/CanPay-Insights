import { 
  SalaryInputs, 
  CalculationResult, 
  Province, 
  ProvincialRule, 
  TaxBracket,
  AnnualSalaryInputs,
  PayFrequency,
  TimesheetInputs,
  TimesheetEntry
} from '../types';
import { 
  PROVINCIAL_DATA, 
  FEDERAL_BRACKETS, 
  FEDERAL_BASIC_PERSONAL_AMOUNT,
  CPP_RATE,
  CPP_MAX_CONTRIBUTION,
  CPP_EXEMPTION,
  CPP_MAX_PENSIONABLE_EARNINGS,
  CPP2_RATE,
  CPP2_MAX_CONTRIBUTION,
  CPP2_MAX_PENSIONABLE_EARNINGS,
  EI_RATE,
  EI_MAX_CONTRIBUTION,
  EI_MAX_INSURABLE_EARNINGS
} from '../constants';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate tax based on progressive brackets
 */
const calculateProgressiveTax = (income: number, brackets: TaxBracket[]): number => {
  if (income <= 0) return 0;
  
  let tax = 0;
  let previousThreshold = 0;

  for (const bracket of brackets) {
    if (income > previousThreshold) {
      const taxableAmount = Math.min(income, bracket.threshold) - previousThreshold;
      tax += taxableAmount * bracket.rate;
      previousThreshold = bracket.threshold;
    } else {
      break;
    }
  }
  return tax;
};

/**
 * Calculate CPP contributions (including CPP2 for high earners)
 * 2025 CPP Structure:
 * - Tier 1: 5.95% on earnings between $3,500 and $73,600
 * - Tier 2 (CPP2): 4.00% on earnings between $73,600 and $81,200
 */
const calculateCPP = (annualGross: number): { cpp1: number; cpp2: number; total: number } => {
  // CPP Tier 1 Calculation
  const pensionableEarningsTier1 = Math.max(0, Math.min(annualGross, CPP_MAX_PENSIONABLE_EARNINGS) - CPP_EXEMPTION);
  const cpp1 = Math.min(pensionableEarningsTier1 * CPP_RATE, CPP_MAX_CONTRIBUTION);
  
  // CPP Tier 2 (CPP2) Calculation - for high earners
  let cpp2 = 0;
  if (annualGross > CPP_MAX_PENSIONABLE_EARNINGS) {
    const pensionableEarningsTier2 = Math.min(annualGross, CPP2_MAX_PENSIONABLE_EARNINGS) - CPP_MAX_PENSIONABLE_EARNINGS;
    cpp2 = Math.min(pensionableEarningsTier2 * CPP2_RATE, CPP2_MAX_CONTRIBUTION);
  }
  
  return {
    cpp1,
    cpp2,
    total: cpp1 + cpp2
  };
};

/**
 * Calculate EI premiums
 * 2025: 1.64% on earnings up to $65,700
 */
const calculateEI = (annualGross: number): number => {
  const insurableEarnings = Math.min(annualGross, EI_MAX_INSURABLE_EARNINGS);
  return Math.min(insurableEarnings * EI_RATE, EI_MAX_CONTRIBUTION);
};

/**
 * Calculate total tax with proper BPA (Basic Personal Amount) tax credit
 * BPA is a TAX CREDIT, not a deduction from income
 */
const calculateTotalTax = (
  annualGross: number,
  cppTotal: number,
  province: string
): { federalTax: number; provincialTax: number; total: number } => {
  const provinceRule = PROVINCIAL_DATA[province] || PROVINCIAL_DATA[Province.ON];
  
  // Step 1: Calculate tax on full income (CPP/EI are not deductible for federal tax in basic calculation)
  // Note: Quebec has different rules
  const federalTaxBeforeCredits = calculateProgressiveTax(annualGross, FEDERAL_BRACKETS);
  const provincialTaxBeforeCredits = calculateProgressiveTax(annualGross, provinceRule.brackets);
  
  // Step 2: Calculate BPA Tax Credits
  // Federal: 15% of BPA
  const federalBPACredit = FEDERAL_BASIC_PERSONAL_AMOUNT * 0.15;
  
  // Provincial: varies by province (lowest rate × BPA)
  const lowestProvincialRate = provinceRule.brackets[0]?.rate || 0.05;
  const provincialBPACredit = provinceRule.basicPersonalAmount * lowestProvincialRate;
  
  // CPP/EI also generate tax credits at lowest rates
  const cppFederalCredit = cppTotal * 0.15;
  const cppProvincialCredit = cppTotal * lowestProvincialRate;
  
  const eiFederalCredit = calculateEI(annualGross) * 0.15;
  const eiProvincialCredit = calculateEI(annualGross) * lowestProvincialRate;
  
  // Step 3: Apply tax credits (cannot reduce tax below zero)
  const totalFederalCredits = federalBPACredit + cppFederalCredit + eiFederalCredit;
  const totalProvincialCredits = provincialBPACredit + cppProvincialCredit + eiProvincialCredit;
  
  const federalTax = Math.max(0, federalTaxBeforeCredits - totalFederalCredits);
  const provincialTax = Math.max(0, provincialTaxBeforeCredits - totalProvincialCredits);
  
  return {
    federalTax,
    provincialTax,
    total: federalTax + provincialTax
  };
};

// ============================================
// TIME CALCULATION HELPERS
// ============================================

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const getOverlapMinutes = (
  start1: number, end1: number, 
  start2: number, end2: number
): number => {
  let e1 = end1 < start1 ? end1 + 1440 : end1;
  let e2 = end2 < start2 ? end2 + 1440 : end2;
  
  const start = Math.max(start1, start2);
  const end = Math.min(e1, e2);
  
  if (start < end) return end - start;
  return 0;
};

// ============================================
// MAIN CALCULATION FUNCTIONS
// ============================================

export const calculateSalary = (inputs: SalaryInputs): CalculationResult => {
  const provinceRule = PROVINCIAL_DATA[inputs.province] || PROVINCIAL_DATA[Province.ON];
  
  // 1. Calculate Daily Hours & Shift Premium
  const startMins = timeToMinutes(inputs.shift.startTime);
  const endMins = timeToMinutes(inputs.shift.endTime);
  
  let dailyWorkMinutes = endMins - startMins;
  if (dailyWorkMinutes < 0) dailyWorkMinutes += 1440;
  
  const dailyPaidMinutes = Math.max(0, dailyWorkMinutes - inputs.shift.unpaidBreakMinutes);
  const dailyPaidHours = dailyPaidMinutes / 60;
  
  const daysWorkedCount = inputs.shift.daysActive.filter(d => d).length;
  
  // 2. Overtime Calculation
  let regularHours = 0;
  let otHours15 = 0;
  let otHours20 = 0;
  
  let weeklyRegularAccumulator = 0;
  
  for (let i = 0; i < daysWorkedCount; i++) {
    let dayRegular = dailyPaidHours;
    let dayOt15 = 0;
    let dayOt20 = 0;

    if (provinceRule.dailyOtThreshold) {
      if (provinceRule.doubleTimeThreshold && dailyPaidHours > provinceRule.doubleTimeThreshold) {
        dayOt20 = dailyPaidHours - provinceRule.doubleTimeThreshold;
        dayOt15 = provinceRule.doubleTimeThreshold - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      } else if (dailyPaidHours > provinceRule.dailyOtThreshold) {
        dayOt15 = dailyPaidHours - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      }
    }
    
    weeklyRegularAccumulator += dayRegular;
    otHours15 += dayOt15;
    otHours20 += dayOt20;
  }
  
  if (weeklyRegularAccumulator > provinceRule.weeklyOtThreshold) {
    const weeklyOt = weeklyRegularAccumulator - provinceRule.weeklyOtThreshold;
    otHours15 += weeklyOt;
    regularHours = provinceRule.weeklyOtThreshold;
  } else {
    regularHours = weeklyRegularAccumulator;
  }

  // 3. Shift Premium
  let premiumHoursPerDay = 0;
  if (inputs.premium.enabled) {
    const pStart = timeToMinutes(inputs.premium.startTime);
    const pEnd = timeToMinutes(inputs.premium.endTime);
    const overlapMins = getOverlapMinutes(startMins, endMins, pStart, pEnd);
    premiumHoursPerDay = overlapMins / 60;
  }
  const totalPremiumHours = premiumHoursPerDay * daysWorkedCount;

  // 4. Gross Pay (Bi-Weekly)
  const biWeeklyMultiplier = 2;
  
  const biWeeklyRegularPay = regularHours * inputs.hourlyWage * biWeeklyMultiplier;
  const biWeeklyOt15Pay = otHours15 * (inputs.hourlyWage * provinceRule.otRate) * biWeeklyMultiplier;
  const biWeeklyOt20Pay = otHours20 * (inputs.hourlyWage * 2.0) * biWeeklyMultiplier;
  const biWeeklyPremiumPay = totalPremiumHours * inputs.premium.ratePerHour * biWeeklyMultiplier;
  
  let grossPayBiWeekly = biWeeklyRegularPay + biWeeklyOt15Pay + biWeeklyOt20Pay + biWeeklyPremiumPay;
  
  // Apply vacation pay if selected (4%, 6%, or 8%)
  if (inputs.vacationPayRate > 0) {
    grossPayBiWeekly += grossPayBiWeekly * inputs.vacationPayRate;
  }
  
  // 5. Annual Gross
  const annualGross = grossPayBiWeekly * 26;
  
  // 6. Deductions using new accurate calculation
  const cppResult = calculateCPP(annualGross);
  const eiAnnual = calculateEI(annualGross);
  const taxResult = calculateTotalTax(annualGross, cppResult.total, inputs.province);
  
  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  return {
    regularHours: regularHours * biWeeklyMultiplier,
    overtimeHours15: otHours15 * biWeeklyMultiplier,
    overtimeHours20: otHours20 * biWeeklyMultiplier,
    shiftPremiumHours: totalPremiumHours * biWeeklyMultiplier,
    
    grossPayBiWeekly,
    federalTax: taxResult.federalTax / 26,
    provincialTax: taxResult.provincialTax / 26,
    cppDeduction: cppResult.total / 26,
    eiDeduction: eiAnnual / 26,
    netPayBiWeekly: netPayAnnual / 26,
    
    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual
  };
};

// ============================================
// ANNUAL SALARY CALCULATOR
// ============================================

const getPeriodsPerYear = (frequency: PayFrequency): number => {
  switch (frequency) {
    case PayFrequency.DAILY: return 365;
    case PayFrequency.WEEKLY: return 52;
    case PayFrequency.BI_WEEKLY: return 26;
    case PayFrequency.SEMI_MONTHLY: return 24;
    case PayFrequency.MONTHLY: return 12;
    case PayFrequency.QUARTERLY: return 4;
    default: return 26;
  }
};

export const calculateFromAnnualSalary = (inputs: AnnualSalaryInputs): CalculationResult => {
  const { annualSalary, province, payFrequency } = inputs;
  
  const provinceRule = PROVINCIAL_DATA[province as keyof typeof PROVINCIAL_DATA];
  if (!provinceRule) {
    throw new Error(`Invalid province: ${province}`);
  }
  
  const annualGross = annualSalary;
  
  // Calculate deductions
  const cppResult = calculateCPP(annualGross);
  const eiAnnual = calculateEI(annualGross);
  const taxResult = calculateTotalTax(annualGross, cppResult.total, province);
  
  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  // Convert to selected pay period
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const grossPayPerPeriod = annualGross / periodsPerYear;
  const netPayPerPeriod = netPayAnnual / periodsPerYear;
  
  // Calculate bi-weekly equivalent for display consistency
  const grossPayBiWeekly = annualGross / 26;
  const netPayBiWeekly = netPayAnnual / 26;
  
  return {
    regularHours: 0,
    overtimeHours15: 0,
    overtimeHours20: 0,
    shiftPremiumHours: 0,
    
    // Use per-period values for the main display
    grossPayBiWeekly: grossPayPerPeriod,
    federalTax: taxResult.federalTax / periodsPerYear,
    provincialTax: taxResult.provincialTax / periodsPerYear,
    cppDeduction: cppResult.total / periodsPerYear,
    eiDeduction: eiAnnual / periodsPerYear,
    netPayBiWeekly: netPayPerPeriod,
    
    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual,
    
    grossPayPerPeriod,
    netPayPerPeriod,
    payFrequency
  };
};

// ============================================
// TIMESHEET CALCULATOR
// ============================================

export const calculateFromTimesheet = (inputs: TimesheetInputs): CalculationResult => {
  const { hourlyWage, province, payFrequency, entries } = inputs;
  
  const provinceRule = PROVINCIAL_DATA[province as keyof typeof PROVINCIAL_DATA];
  if (!provinceRule) {
    throw new Error(`Invalid province: ${province}`);
  }
  
  const calculateEntryHours = (entry: TimesheetEntry): number => {
    const [inH, inM] = entry.checkIn.split(':').map(Number);
    const [outH, outM] = entry.checkOut.split(':').map(Number);
    
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 1440;
    
    const paidMinutes = Math.max(0, totalMinutes - entry.unpaidBreakMinutes);
    return paidMinutes / 60;
  };
  
  const dailyHours = new Map<string, number>();
  entries.forEach(entry => {
    const hours = calculateEntryHours(entry);
    const current = dailyHours.get(entry.date) || 0;
    dailyHours.set(entry.date, current + hours);
  });
  
  let regularHours = 0;
  let otHours15 = 0;
  let otHours20 = 0;
  
  const weeklyHoursMap = new Map<string, { regular: number; overtime: number }>();
  
  dailyHours.forEach((dailyHours, date) => {
    const weekKey = getWeekKey(date);
    
    let dayRegular = dailyHours;
    let dayOt15 = 0;
    let dayOt20 = 0;
    
    if (provinceRule.dailyOtThreshold) {
      if (provinceRule.doubleTimeThreshold && dailyHours > provinceRule.doubleTimeThreshold) {
        dayOt20 = dailyHours - provinceRule.doubleTimeThreshold;
        dayOt15 = provinceRule.doubleTimeThreshold - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      } else if (dailyHours > provinceRule.dailyOtThreshold) {
        dayOt15 = dailyHours - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      }
    }
    
    const weekData = weeklyHoursMap.get(weekKey) || { regular: 0, overtime: 0 };
    weekData.regular += dayRegular;
    weekData.overtime += (dayOt15 + dayOt20);
    weeklyHoursMap.set(weekKey, weekData);
    
    otHours15 += dayOt15;
    otHours20 += dayOt20;
  });
  
  weeklyHoursMap.forEach((weekData) => {
    if (weekData.regular > provinceRule.weeklyOtThreshold) {
      const weeklyOt = weekData.regular - provinceRule.weeklyOtThreshold;
      otHours15 += weeklyOt;
      regularHours += provinceRule.weeklyOtThreshold;
    } else {
      regularHours += weekData.regular;
    }
  });
  
  const regularPay = regularHours * hourlyWage;
  const ot15Pay = otHours15 * (hourlyWage * provinceRule.otRate);
  const ot20Pay = otHours20 * (hourlyWage * 2.0);
  
  const totalGross = regularPay + ot15Pay + ot20Pay;
  
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const annualGross = totalGross * periodsPerYear;
  
  // Calculate deductions
  const cppResult = calculateCPP(annualGross);
  const eiAnnual = calculateEI(annualGross);
  const taxResult = calculateTotalTax(annualGross, cppResult.total, province);
  
  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  const grossPayPerPeriod = totalGross;
  const netPayPerPeriod = netPayAnnual / periodsPerYear;
  
  return {
    regularHours,
    overtimeHours15: otHours15,
    overtimeHours20: otHours20,
    shiftPremiumHours: 0,
    
    grossPayBiWeekly: totalGross,
    federalTax: taxResult.federalTax / periodsPerYear,
    provincialTax: taxResult.provincialTax / periodsPerYear,
    cppDeduction: cppResult.total / periodsPerYear,
    eiDeduction: eiAnnual / periodsPerYear,
    netPayBiWeekly: netPayPerPeriod,
    
    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual,
    
    grossPayPerPeriod,
    netPayPerPeriod,
    payFrequency
  };
};

const getWeekKey = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + (4 - (date.getDay() || 7)));
  
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const firstThursday = new Date(yearStart);
  firstThursday.setDate(yearStart.getDate() + ((4 - yearStart.getDay() + 7) % 7));
  
  const weekNumber = Math.ceil((((thursday.getTime() - firstThursday.getTime()) / 86400000) + 1) / 7);
  
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};
