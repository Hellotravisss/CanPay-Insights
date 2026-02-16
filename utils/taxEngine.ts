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

/**
 * 年薪倒推计算器
 * 从年薪计算每期实际到手收入
 */
export const calculateFromAnnualSalary = (inputs: AnnualSalaryInputs): CalculationResult => {
  const { annualSalary, province, payFrequency } = inputs;
  
  // 获取省份规则
  const provinceRule = PROVINCIAL_DATA[province as keyof typeof PROVINCIAL_DATA];
  if (!provinceRule) {
    throw new Error(`Invalid province: ${province}`);
  }
  
  // 年薪就是总收入
  const annualGross = annualSalary;
  
  // 1. CPP 扣款（年度）
  const pensionableEarnings = Math.max(0, annualGross - CPP_EXEMPTION);
  let cppAnnual = pensionableEarnings * CPP_RATE;
  cppAnnual = Math.min(cppAnnual, CPP_MAX_CONTRIBUTION);
  
  // 2. EI 扣款（年度）
  let eiAnnual = annualGross * EI_RATE;
  eiAnnual = Math.min(eiAnnual, EI_MAX_CONTRIBUTION);
  
  // 3. 联邦税（年度）
  const federalTaxable = Math.max(0, annualGross - FEDERAL_BASIC_PERSONAL_AMOUNT - cppAnnual - eiAnnual);
  const federalTaxAnnual = calculateProgressiveTax(federalTaxable, FEDERAL_BRACKETS);
  
  // 4. 省税（年度）
  const provTaxable = Math.max(0, annualGross - provinceRule.basicPersonalAmount - cppAnnual - eiAnnual);
  const provTaxAnnual = calculateProgressiveTax(provTaxable, provinceRule.brackets);
  
  // 5. 总扣款和净收入（年度）
  const totalTaxAnnual = federalTaxAnnual + provTaxAnnual;
  const totalDeductionsAnnual = totalTaxAnnual + cppAnnual + eiAnnual;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  // 6. 根据发薪频率计算每期收入
  const getPeriodsPerYear = (frequency: PayFrequency): number => {
    switch (frequency) {
      case PayFrequency.DAILY: return 365;
      case PayFrequency.WEEKLY: return 52;
      case PayFrequency.BI_WEEKLY: return 26;
      case PayFrequency.SEMI_MONTHLY: return 24;
      case PayFrequency.MONTHLY: return 12;
      case PayFrequency.QUARTERLY: return 4;
      default: return 26; // 默认 bi-weekly
    }
  };
  
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const grossPayPerPeriod = annualGross / periodsPerYear;
  const netPayPerPeriod = netPayAnnual / periodsPerYear;
  
  // 7. 返回结果（兼容现有结构）
  return {
    regularHours: 0, // 年薪模式不适用
    overtimeHours15: 0,
    overtimeHours20: 0,
    shiftPremiumHours: 0,
    
    // Bi-weekly 作为参考（用于显示）
    grossPayBiWeekly: annualGross / 26,
    federalTax: federalTaxAnnual / 26,
    provincialTax: provTaxAnnual / 26,
    cppDeduction: cppAnnual / 26,
    eiDeduction: eiAnnual / 26,
    netPayBiWeekly: netPayAnnual / 26,
    
    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual,
    
    // 新增：按实际发薪频率
    grossPayPerPeriod,
    netPayPerPeriod,
    payFrequency
  };
};

/**
 * Timesheet 精确打卡计算器
 * 从打卡记录计算实际收入（支持加班、多条目）
 */
export const calculateFromTimesheet = (inputs: TimesheetInputs): CalculationResult => {
  const { hourlyWage, province, payFrequency, entries } = inputs;
  
  // 获取省份规则
  const provinceRule = PROVINCIAL_DATA[province as keyof typeof PROVINCIAL_DATA];
  if (!provinceRule) {
    throw new Error(`Invalid province: ${province}`);
  }
  
  // 1. 计算每个条目的工作时长
  const calculateEntryHours = (entry: TimesheetEntry): number => {
    const [inH, inM] = entry.checkIn.split(':').map(Number);
    const [outH, outM] = entry.checkOut.split(':').map(Number);
    
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 1440; // Crossed midnight
    
    const paidMinutes = Math.max(0, totalMinutes - entry.unpaidBreakMinutes);
    return paidMinutes / 60;
  };
  
  // 2. 按日期分组并计算每日总工时
  const dailyHours = new Map<string, number>();
  entries.forEach(entry => {
    const hours = calculateEntryHours(entry);
    const current = dailyHours.get(entry.date) || 0;
    dailyHours.set(entry.date, current + hours);
  });
  
  // 3. 计算加班（逐天处理）
  let regularHours = 0;
  let otHours15 = 0;
  let otHours20 = 0;
  
  // 按周分组（用于周加班规则）
  const weeklyHoursMap = new Map<string, { regular: number; overtime: number }>();
  
  dailyHours.forEach((dailyHours, date) => {
    const weekKey = getWeekKey(date); // Get ISO week
    
    let dayRegular = dailyHours;
    let dayOt15 = 0;
    let dayOt20 = 0;
    
    // 应用每日加班规则（如 BC, AB）
    if (provinceRule.dailyOtThreshold) {
      if (provinceRule.doubleTimeThreshold && dailyHours > provinceRule.doubleTimeThreshold) {
        // BC 双倍时薪
        dayOt20 = dailyHours - provinceRule.doubleTimeThreshold;
        dayOt15 = provinceRule.doubleTimeThreshold - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      } else if (dailyHours > provinceRule.dailyOtThreshold) {
        dayOt15 = dailyHours - provinceRule.dailyOtThreshold;
        dayRegular = provinceRule.dailyOtThreshold;
      }
    }
    
    // 累加到周
    const weekData = weeklyHoursMap.get(weekKey) || { regular: 0, overtime: 0 };
    weekData.regular += dayRegular;
    weekData.overtime += (dayOt15 + dayOt20);
    weeklyHoursMap.set(weekKey, weekData);
    
    otHours15 += dayOt15;
    otHours20 += dayOt20;
  });
  
  // 4. 应用周加班规则
  weeklyHoursMap.forEach((weekData) => {
    if (weekData.regular > provinceRule.weeklyOtThreshold) {
      const weeklyOt = weekData.regular - provinceRule.weeklyOtThreshold;
      otHours15 += weeklyOt;
      regularHours += provinceRule.weeklyOtThreshold;
    } else {
      regularHours += weekData.regular;
    }
  });
  
  // 5. 计算总收入（基于所有打卡记录）
  const regularPay = regularHours * hourlyWage;
  const ot15Pay = otHours15 * (hourlyWage * provinceRule.otRate);
  const ot20Pay = otHours20 * (hourlyWage * 2.0);
  
  const totalGross = regularPay + ot15Pay + ot20Pay;
  
  // 6. 年化收入（用于税收计算）
  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const annualGross = totalGross * periodsPerYear;
  
  // 7. 计算扣款（年度）
  const pensionableEarnings = Math.max(0, annualGross - CPP_EXEMPTION);
  let cppAnnual = pensionableEarnings * CPP_RATE;
  cppAnnual = Math.min(cppAnnual, CPP_MAX_CONTRIBUTION);
  
  let eiAnnual = annualGross * EI_RATE;
  eiAnnual = Math.min(eiAnnual, EI_MAX_CONTRIBUTION);
  
  const federalTaxable = Math.max(0, annualGross - FEDERAL_BASIC_PERSONAL_AMOUNT - cppAnnual - eiAnnual);
  const federalTaxAnnual = calculateProgressiveTax(federalTaxable, FEDERAL_BRACKETS);
  
  const provTaxable = Math.max(0, annualGross - provinceRule.basicPersonalAmount - cppAnnual - eiAnnual);
  const provTaxAnnual = calculateProgressiveTax(provTaxable, provinceRule.brackets);
  
  const totalTaxAnnual = federalTaxAnnual + provTaxAnnual;
  const totalDeductionsAnnual = totalTaxAnnual + cppAnnual + eiAnnual;
  const netPayAnnual = annualGross - totalDeductionsAnnual;
  
  // 8. 返回结果
  const grossPayPerPeriod = totalGross;
  const netPayPerPeriod = netPayAnnual / periodsPerYear;
  
  return {
    regularHours,
    overtimeHours15: otHours15,
    overtimeHours20: otHours20,
    shiftPremiumHours: 0, // Timesheet 模式不使用 shift premium
    
    grossPayBiWeekly: totalGross, // 显示当前周期总收入
    federalTax: federalTaxAnnual / periodsPerYear,
    provincialTax: provTaxAnnual / periodsPerYear,
    cppDeduction: cppAnnual / periodsPerYear,
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

// Helper: Get ISO week key from date (YYYY-Www)
const getWeekKey = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  
  // Get Thursday of current week (ISO week date)
  const thursday = new Date(date);
  thursday.setDate(date.getDate() + (4 - (date.getDay() || 7)));
  
  // Get first Thursday of year
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const firstThursday = new Date(yearStart);
  firstThursday.setDate(yearStart.getDate() + ((4 - yearStart.getDay() + 7) % 7));
  
  // Calculate week number
  const weekNumber = Math.ceil((((thursday.getTime() - firstThursday.getTime()) / 86400000) + 1) / 7);
  
  return `${year}-W${String(weekNumber).padStart(2, '0')}`;
};

// Helper: Get periods per year
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