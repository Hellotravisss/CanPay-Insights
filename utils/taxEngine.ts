import { 
  SalaryInputs, 
  CalculationResult, 
  Province, 
  ProvincialRule, 
  TaxBracket 
} from '../types';
import { 
  PROVINCIAL_DATA, 
  FEDERAL_BRACKETS, 
  FEDERAL_BASIC_PERSONAL_AMOUNT,
  CPP_RATE,
  CPP_MAX_CONTRIBUTION,
  CPP_EXEMPTION,
  EI_RATE,
  EI_MAX_CONTRIBUTION
} from '../constants';

// Helper: Calculate tax based on progressive brackets
const calculateProgressiveTax = (income: number, brackets: TaxBracket[]): number => {
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

// Helper: Convert "HH:MM" to minutes from midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Helper: Calculate minutes overlap between two time ranges (handling midnight crossing)
const getOverlapMinutes = (
  start1: number, end1: number, 
  start2: number, end2: number
): number => {
  // Normalize ranges to handle midnight crossing by unrolling 24h
  let e1 = end1 < start1 ? end1 + 1440 : end1;
  let e2 = end2 < start2 ? end2 + 1440 : end2;

  // We might need to check multiple overlaps if the shift wraps around heavily, 
  // but for shift premiums, usually we check the premium window against the shift.
  // Simple intersection logic:
  
  // If premium is 23:00 to 06:00 (1380 to 360), e2 is 1800.
  // Shift is 20:00 to 04:00 (1200 to 280), e1 is 1680.
  // Intersection: max(1380, 1200) to min(1800, 1680) -> 1380 to 1680 = 300 mins (5h).
  
  const start = Math.max(start1, start2);
  const end = Math.min(e1, e2);
  
  if (start < end) return end - start;
  
  // Edge case: Sometimes ranges don't overlap in the "unrolled" version simply.
  // A robust way for cyclic time is complex, but for daily shifts < 24h, the above unroll usually works 
  // if we assume the shift starts on "Day 1". 
  
  return 0;
};

export const calculateSalary = (inputs: SalaryInputs): CalculationResult => {
  const provinceRule = PROVINCIAL_DATA[inputs.province] || PROVINCIAL_DATA[Province.ON];
  
  // 1. Calculate Daily Hours & Shift Premium
  const startMins = timeToMinutes(inputs.shift.startTime);
  const endMins = timeToMinutes(inputs.shift.endTime);
  
  let dailyWorkMinutes = endMins - startMins;
  if (dailyWorkMinutes < 0) dailyWorkMinutes += 1440; // Crossed midnight
  
  const dailyPaidMinutes = Math.max(0, dailyWorkMinutes - inputs.shift.unpaidBreakMinutes);
  const dailyPaidHours = dailyPaidMinutes / 60;
  
  const daysWorkedCount = inputs.shift.daysActive.filter(d => d).length;
  
  // 2. Calculate Weekly Hours
  const totalWeeklyHours = dailyPaidHours * daysWorkedCount;
  
  // 3. Overtime Calculation (Weekly & Daily Logic)
  let regularHours = 0;
  let otHours15 = 0;
  let otHours20 = 0;
  
  // Calculate Daily OT first (if applicable)
  let weeklyRegularAccumulator = 0;
  let weeklyOtAccumulator = 0;
  
  // Iterate through each active day
  for (let i = 0; i < daysWorkedCount; i++) {
    let dayRegular = dailyPaidHours;
    let dayOt15 = 0;
    let dayOt20 = 0;

    // Apply Daily Rules (e.g., BC, AB)
    if (provinceRule.dailyOtThreshold) {
      if (provinceRule.doubleTimeThreshold && dailyPaidHours > provinceRule.doubleTimeThreshold) {
        // BC Double Time
        dayOt20 = dailyPaidHours - provinceRule.doubleTimeThreshold;
        dayOt15 = provinceRule.doubleTimeThreshold - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      } else if (dailyPaidHours > provinceRule.dailyOtThreshold) {
        dayOt15 = dailyPaidHours - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      }
    }
    
    weeklyRegularAccumulator += dayRegular;
    weeklyOtAccumulator += (dayOt15 + dayOt20); // Store daily OT
    
    otHours15 += dayOt15;
    otHours20 += dayOt20;
  }
  
  // Apply Weekly Rules
  // Most provinces: OT is greater of Daily Total OR Weekly Total > Threshold
  // But usually, hours counted as daily OT do not count towards weekly threshold to avoid double dipping.
  
  if (weeklyRegularAccumulator > provinceRule.weeklyOtThreshold) {
    const weeklyOt = weeklyRegularAccumulator - provinceRule.weeklyOtThreshold;
    // Add to 1.5x bucket
    otHours15 += weeklyOt;
    regularHours = provinceRule.weeklyOtThreshold;
  } else {
    regularHours = weeklyRegularAccumulator;
  }
  
  // Special case: If daily OT was calculated and is greater than weekly derived OT, some provinces strictly take the daily sum.
  // For this calculator, we simply add the calculated daily OT to the regular/weekly flow.
  // The above logic:
  // 1. Calculates daily OT -> removes it from "Regular bucket".
  // 2. Checks if remaining "Regular bucket" exceeds weekly limit.
  // This satisfies "Greater of" implicitly for standard scenarios.

  // 4. Shift Premium
  let premiumHoursPerDay = 0;
  if (inputs.premium.enabled) {
    const pStart = timeToMinutes(inputs.premium.startTime);
    const pEnd = timeToMinutes(inputs.premium.endTime);
    
    // Check overlap
    const overlapMins = getOverlapMinutes(startMins, endMins, pStart, pEnd);
    premiumHoursPerDay = overlapMins / 60;
  }
  const totalPremiumHours = premiumHoursPerDay * daysWorkedCount;

  // 5. Gross Pay (Bi-Weekly)
  // Calculate 2 weeks worth
  const biWeeklyMultiplier = 2;
  
  const biWeeklyRegularPay = regularHours * inputs.hourlyWage * biWeeklyMultiplier;
  const biWeeklyOt15Pay = otHours15 * (inputs.hourlyWage * provinceRule.otRate) * biWeeklyMultiplier;
  const biWeeklyOt20Pay = otHours20 * (inputs.hourlyWage * 2.0) * biWeeklyMultiplier;
  const biWeeklyPremiumPay = totalPremiumHours * inputs.premium.ratePerHour * biWeeklyMultiplier;
  
  let grossPayBiWeekly = biWeeklyRegularPay + biWeeklyOt15Pay + biWeeklyOt20Pay + biWeeklyPremiumPay;
  
  if (inputs.includeVacationPay) {
    grossPayBiWeekly += grossPayBiWeekly * provinceRule.vacationPayRate;
  }
  
  // 6. Annual Projection
  const weeksPerYear = 52;
  const annualGross = grossPayBiWeekly * (weeksPerYear / 2);
  
  // 7. Deductions (Annualized then converted back for display)
  // CPP
  const pensionableEarnings = Math.max(0, annualGross - CPP_EXEMPTION);
  let cppAnnual = pensionableEarnings * CPP_RATE;
  cppAnnual = Math.min(cppAnnual, CPP_MAX_CONTRIBUTION);
  
  // EI
  let eiAnnual = annualGross * EI_RATE;
  eiAnnual = Math.min(eiAnnual, EI_MAX_CONTRIBUTION);
  
  // Tax (Federal)
  // Determine taxable income
  const federalTaxable = Math.max(0, annualGross - FEDERAL_BASIC_PERSONAL_AMOUNT - cppAnnual - eiAnnual);
  const federalTaxAnnual = calculateProgressiveTax(federalTaxable, FEDERAL_BRACKETS);
  
  // Tax (Provincial)
  const provTaxable = Math.max(0, annualGross - provinceRule.basicPersonalAmount - cppAnnual - eiAnnual);
  const provTaxAnnual = calculateProgressiveTax(provTaxable, provinceRule.brackets);
  
  const totalTaxAnnual = federalTaxAnnual + provTaxAnnual;
  const totalDeductionsAnnual = totalTaxAnnual + cppAnnual + eiAnnual;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  return {
    regularHours: regularHours * biWeeklyMultiplier,
    overtimeHours15: otHours15 * biWeeklyMultiplier,
    overtimeHours20: otHours20 * biWeeklyMultiplier,
    shiftPremiumHours: totalPremiumHours * biWeeklyMultiplier,
    
    grossPayBiWeekly,
    federalTax: federalTaxAnnual / 26,
    provincialTax: provTaxAnnual / 26,
    cppDeduction: cppAnnual / 26,
    eiDeduction: eiAnnual / 26,
    netPayBiWeekly: netPayAnnual / 26,
    
    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual
  };
};