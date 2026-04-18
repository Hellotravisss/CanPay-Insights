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
  EI_MAX_INSURABLE_EARNINGS,
  // Quebec special imports
  QPP_RATE,
  QPP_MAX_CONTRIBUTION,
  QPP_EXEMPTION,
  QPP_MAX_PENSIONABLE_EARNINGS,
  QPP2_RATE,
  QPP2_MAX_CONTRIBUTION,
  QPP2_MAX_PENSIONABLE_EARNINGS,
  QPIP_RATE,
  QPIP_MAX_CONTRIBUTION,
  QPIP_MAX_INSURABLE_EARNINGS,
  QC_EI_RATE,
  QC_EI_MAX_CONTRIBUTION,
  QUEBEC_ABATEMENT_RATE
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
 * Calculate CPP/QPP contributions (including CPP2/QPP2 for high earners)
 * 2025 CPP Structure:
 * - Tier 1: 5.95% on earnings between $3,500 and $73,600
 * - Tier 2 (CPP2): 4.00% on earnings between $73,600 and $81,200
 * 
 * 2025 QPP Structure (Quebec only):
 * - Tier 1: 6.4% on earnings between $3,500 and $83,200
 * - Tier 2 (QPP2): 7.15% on earnings between $83,200 and $93,300
 */
const calculateCPP = (annualGross: number, isQuebec: boolean = false): { cpp1: number; cpp2: number; total: number } => {
  if (isQuebec) {
    // QPP Tier 1 Calculation (Quebec)
    const pensionableEarningsTier1 = Math.max(0, Math.min(annualGross, QPP_MAX_PENSIONABLE_EARNINGS) - QPP_EXEMPTION);
    const qpp1 = Math.min(pensionableEarningsTier1 * QPP_RATE, QPP_MAX_CONTRIBUTION);
    
    // QPP Tier 2 (QPP2) Calculation - for high earners
    let qpp2 = 0;
    if (annualGross > QPP_MAX_PENSIONABLE_EARNINGS) {
      const pensionableEarningsTier2 = Math.min(annualGross, QPP2_MAX_PENSIONABLE_EARNINGS) - QPP_MAX_PENSIONABLE_EARNINGS;
      qpp2 = Math.min(pensionableEarningsTier2 * QPP2_RATE, QPP2_MAX_CONTRIBUTION);
    }
    
    return {
      cpp1: qpp1,
      cpp2: qpp2,
      total: qpp1 + qpp2
    };
  }
  
  // CPP Tier 1 Calculation (Federal/Other provinces)
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
 * Calculate QPIP (Québec Parental Insurance Plan) contributions
 * Only applies to Quebec residents
 */
const calculateQPIP = (annualGross: number): number => {
  const insurableEarnings = Math.min(annualGross, QPIP_MAX_INSURABLE_EARNINGS);
  return Math.min(insurableEarnings * QPIP_RATE, QPIP_MAX_CONTRIBUTION);
};

/**
 * Calculate EI premiums
 * 2025 Federal: 1.64% on earnings up to $65,700
 * 2025 Quebec: 1.27% on earnings up to $65,700 (lower due to QPIP)
 */
const calculateEI = (annualGross: number, isQuebec: boolean = false): number => {
  if (isQuebec) {
    const insurableEarnings = Math.min(annualGross, EI_MAX_INSURABLE_EARNINGS);
    return Math.min(insurableEarnings * QC_EI_RATE, QC_EI_MAX_CONTRIBUTION);
  }
  const insurableEarnings = Math.min(annualGross, EI_MAX_INSURABLE_EARNINGS);
  return Math.min(insurableEarnings * EI_RATE, EI_MAX_CONTRIBUTION);
};

/**
 * Calculate total tax with proper BPA (Basic Personal Amount) tax credit
 * BPA is a TAX CREDIT, not a deduction from income
 * 
 * SPECIAL HANDLING FOR QUEBEC:
 * - Quebec Abatement: 16.5% reduction on federal tax
 * - Quebec residents pay into QPP instead of CPP (higher rate)
 * - Quebec residents pay into QPIP
 * - Quebec EI rate is lower (1.27% vs 1.64%)
 */
const calculateTotalTax = (
  annualGross: number,
  cppTotal: number,
  province: string
): { federalTax: number; provincialTax: number; total: number } => {
  const isQuebec = province === Province.QC;
  const provinceRule = PROVINCIAL_DATA[province] || PROVINCIAL_DATA[Province.ON];
  
  // Step 1: Calculate tax on full income
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
  
  const eiAnnual = calculateEI(annualGross, isQuebec);
  const eiFederalCredit = eiAnnual * 0.15;
  const eiProvincialCredit = eiAnnual * lowestProvincialRate;
  
  // Step 3: Apply tax credits (cannot reduce tax below zero)
  const totalFederalCredits = federalBPACredit + cppFederalCredit + eiFederalCredit;
  const totalProvincialCredits = provincialBPACredit + cppProvincialCredit + eiProvincialCredit;
  
  let federalTax = Math.max(0, federalTaxBeforeCredits - totalFederalCredits);
  let provincialTax = Math.max(0, provincialTaxBeforeCredits - totalProvincialCredits);

  // Step 4: Ontario Surtax (applied on top of base provincial tax)
  if (provinceRule.surtaxThreshold1 && provincialTax > provinceRule.surtaxThreshold1) {
    let surtax = (provincialTax - provinceRule.surtaxThreshold1) * (provinceRule.surtaxRate1 ?? 0);
    if (provinceRule.surtaxThreshold2 && provincialTax > provinceRule.surtaxThreshold2) {
      surtax += (provincialTax - provinceRule.surtaxThreshold2) * (provinceRule.surtaxRate2 ?? 0);
    }
    provincialTax += surtax;
  }

  // Step 5: Apply Quebec Abatement (16.5% reduction on federal tax)
  if (isQuebec) {
    federalTax = federalTax * (1 - QUEBEC_ABATEMENT_RATE);
  }
  
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
  
  // 5. Annual Gross & RRSP
  const annualGross = grossPayBiWeekly * 26;
  const rrspPerPeriod = inputs.rrspContributionPerPeriod ?? 0;
  const annualRRSP = rrspPerPeriod * 26;
  const taxableIncome = Math.max(0, annualGross - annualRRSP);

  // 6. Deductions
  const isQuebec = inputs.province === Province.QC;
  const cppResult = calculateCPP(annualGross, isQuebec);
  const eiAnnual = calculateEI(annualGross, isQuebec);
  const qpipAnnual = isQuebec ? calculateQPIP(annualGross) : 0;
  const taxResult = calculateTotalTax(taxableIncome, cppResult.total, inputs.province);
  
  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual + qpipAnnual + annualRRSP;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  return {
    regularHours: regularHours * biWeeklyMultiplier,
    overtimeHours15: otHours15 * biWeeklyMultiplier,
    overtimeHours20: otHours20 * biWeeklyMultiplier,
    shiftPremiumHours: totalPremiumHours * biWeeklyMultiplier,
    
    grossPayBiWeekly,
    federalTax: taxResult.federalTax / 26,
    provincialTax: taxResult.provincialTax / 26,
    cppDeduction: (cppResult.total + qpipAnnual) / 26,
    eiDeduction: eiAnnual / 26,
    rrspDeduction: rrspPerPeriod,
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
  
  const provinceRule = PROVINCIAL_DATA[province as keyof typeof PROVINCIAL_DATA] || PROVINCIAL_DATA[Province.ON];
  if (!provinceRule) {
    throw new Error(`Invalid province: ${province}`);
  }
  
  const annualGross = annualSalary;
  const isQuebec = province === Province.QC;
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const rrspPerPeriod = inputs.rrspContributionPerPeriod ?? 0;
  const annualRRSP = rrspPerPeriod * periodsPerYear;
  const taxableIncome = Math.max(0, annualGross - annualRRSP);

  // Calculate deductions
  const cppResult = calculateCPP(annualGross, isQuebec);
  const eiAnnual = calculateEI(annualGross, isQuebec);
  const qpipAnnual = isQuebec ? calculateQPIP(annualGross) : 0;
  const taxResult = calculateTotalTax(taxableIncome, cppResult.total, province);
  
  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual + qpipAnnual + annualRRSP;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  const grossPayPerPeriod = annualGross / periodsPerYear;
  const netPayPerPeriod = netPayAnnual / periodsPerYear;
  
  return {
    regularHours: 0,
    overtimeHours15: 0,
    overtimeHours20: 0,
    shiftPremiumHours: 0,
    
    grossPayBiWeekly: grossPayPerPeriod,
    federalTax: taxResult.federalTax / periodsPerYear,
    provincialTax: taxResult.provincialTax / periodsPerYear,
    cppDeduction: (cppResult.total + qpipAnnual) / periodsPerYear,
    eiDeduction: eiAnnual / periodsPerYear,
    rrspDeduction: rrspPerPeriod,
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
  
  const provinceRule = PROVINCIAL_DATA[province as keyof typeof PROVINCIAL_DATA] || PROVINCIAL_DATA[Province.ON];
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
  const rrspPerPeriod = inputs.rrspContributionPerPeriod ?? 0;
  const annualRRSP = rrspPerPeriod * periodsPerYear;
  const taxableIncome = Math.max(0, annualGross - annualRRSP);

  // Calculate deductions
  const isQuebec = province === Province.QC;
  const cppResult = calculateCPP(annualGross, isQuebec);
  const eiAnnual = calculateEI(annualGross, isQuebec);
  const qpipAnnual = isQuebec ? calculateQPIP(annualGross) : 0;
  const taxResult = calculateTotalTax(taxableIncome, cppResult.total, province);
  
  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual + qpipAnnual + annualRRSP;
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
    cppDeduction: (cppResult.total + qpipAnnual) / periodsPerYear,
    eiDeduction: eiAnnual / periodsPerYear,
    rrspDeduction: rrspPerPeriod,
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
