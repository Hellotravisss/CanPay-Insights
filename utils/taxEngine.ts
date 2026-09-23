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
  CANADA_EMPLOYMENT_AMOUNT,
  QC_WORKER_DEDUCTION_RATE,
  QC_WORKER_DEDUCTION_MAX,
  CPP_BASE_RATE,
  QPP_BASE_RATE,
  QPIP_MAX_CONTRIBUTION,
  QPIP_MAX_INSURABLE_EARNINGS,
  QC_EI_RATE,
  QC_EI_MAX_CONTRIBUTION,
  QUEBEC_ABATEMENT_RATE,
  BC_TAX_REDUCTION_BASE,
  BC_TAX_REDUCTION_THRESHOLD,
  BC_TAX_REDUCTION_RATE,
  FEDERAL_BPA_BASE,
  FEDERAL_BPA_THRESHOLD,
  FEDERAL_BPA_RANGE,
  FEDERAL_BPA_TOPUP,
  ON_HEALTH_PREMIUM_TIERS,
  ON_TAX_REDUCTION_BASE
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
 * Calculate RRSP contribution amount for the period based on Type (Amount or Percentage)
 */
/**
 * The employer's RRSP match for one pay period: gross × rrspEmployerMatch% when
 * the employee contributes a percentage and a match policy is set. The form
 * stores the match as a percent of pay whatever the policy ("100%" equals the
 * employee's rate, "50%" half of it, "custom" what was typed).
 *
 * CRA T4130: employer contributions to a group RRSP "are generally paid in cash
 * and are pensionable and insurable. Deduct CPP contributions and EI premiums."
 * They are a taxable benefit, but "you do not have to deduct income tax at
 * source … if you have reasonable grounds to believe that the employee can
 * deduct the contribution" — so the match adds CPP and EI and leaves income
 * tax where it was. Until 2026-09-22 the engine ignored the match entirely
 * while the form offered it. Assumes a group RRSP the employee can withdraw
 * from; a locked-in plan is not insurable (same guide).
 */
export const getEmployerMatchPerPeriod = (inputs: any, grossPayPerPeriod: number): number => {
  if (inputs.rrspType !== 'percent') return 0;
  if ((inputs.rrspMatchPolicy ?? 'equal') === 'none') return 0;
  const pct = Number(inputs.rrspEmployerMatch) || 0;
  return pct > 0 ? grossPayPerPeriod * pct / 100 : 0;
};

export const getRRSPPerPeriod = (inputs: any, grossPayPerPeriod: number): number => {
  if (inputs.rrspType === 'percent') {
    return grossPayPerPeriod * (inputs.rrspPercentage ?? 0) / 100;
  }
  return inputs.rrspContributionPerPeriod ?? 0;
};

/**
 * Calculate CPP/QPP contributions (including CPP2/QPP2 for high earners)
 * 2026 CPP Structure:
 * - Tier 1: 5.95% on earnings between $3,500 and $74,600 (YMPE)
 * - Tier 2 (CPP2): 4.00% on earnings between $74,600 and $85,000 (YAMPE)
 *
 * 2026 QPP Structure (Quebec only):
 * - Tier 1: 6.3% on earnings between $3,500 and $74,600 (MPE)
 * - Tier 2 (QPP2): 4.00% on earnings between $74,600 and $85,000 (YAMPE)
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
 * 2026 Federal: 1.63% on earnings up to $68,900
 * 2026 Quebec: 1.30% on earnings up to $68,900 (lower due to QPIP)
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
/**
 * Ontario Health Premium — CRA T4127 factor V2. Withheld at source like tax, so
 * it belongs in take-home pay; it is not a credit and not reduced by anything.
 * Each tier pays the LESSER of its cap or (base + rate x income above the floor),
 * which is why the amount plateaus between tiers rather than rising smoothly.
 */
const calculateOntarioHealthPremium = (annualGross: number): number => {
  let premium = 0;
  for (const t of ON_HEALTH_PREMIUM_TIERS) {
    if (annualGross > t.floor) {
      premium = Math.min(t.cap, t.base + (annualGross - t.floor) * t.rate);
    }
  }
  return premium;
};

const calculateTotalTax = (
  incomeBeforeCppDeduction: number,
  cpp: { cpp1: number; cpp2: number },
  province: string,
  eiAnnual: number,
  qpipAnnual: number = 0
): { federalTax: number; provincialTax: number; total: number } => {
  const isQuebec = province === Province.QC;
  const provinceRule = PROVINCIAL_DATA[province] || PROVINCIAL_DATA[Province.ON];

  // T4127 factor F5: enhanced CPP/QPP comes off income before tax (factor A),
  // and only the base slice of tier 1 is credited (factor K2). Until
  // 2026-09-15 the engine credited the whole contribution at the lowest rate
  // and deducted nothing — over-withholding every province above ~$30k.
  const fullRate = isQuebec ? QPP_RATE : CPP_RATE;
  const baseRate = isQuebec ? QPP_BASE_RATE : CPP_BASE_RATE;
  const cppBase = cpp.cpp1 * (baseRate / fullRate);
  const cppEnhanced = cpp.cpp1 - cppBase + cpp.cpp2;
  const annualGross = Math.max(0, incomeBeforeCppDeduction - cppEnhanced);
  const cppTotal = cppBase;
  
  // Step 1: Calculate tax on full income
  const federalTaxBeforeCredits = calculateProgressiveTax(annualGross, FEDERAL_BRACKETS);
  // Quebec taxes a smaller base: the deduction for workers comes off first.
  const quebecIncome = isQuebec
    ? Math.max(0, annualGross - Math.min(incomeBeforeCppDeduction * QC_WORKER_DEDUCTION_RATE, QC_WORKER_DEDUCTION_MAX))
    : annualGross;
  const provincialTaxBeforeCredits = calculateProgressiveTax(quebecIncome, provinceRule.brackets);
  
  // Step 2: Calculate BPA Tax Credits
  // Federal: lowest-bracket rate × BPA. Read from FEDERAL_BRACKETS rather than
  // a literal so a future bracket change cannot leave credits at the old rate.
  const lowestFederalRate = FEDERAL_BRACKETS[0].rate;
  // The BPA is the maximum only up to $181,440 of net income; above that it
  // slides down to FEDERAL_BPA_BASE by $258,482 (TD1-WS (26), line 1).
  const bpaTopUp = annualGross <= FEDERAL_BPA_THRESHOLD
    ? FEDERAL_BPA_TOPUP
    : FEDERAL_BPA_TOPUP * Math.max(0, FEDERAL_BPA_RANGE - (annualGross - FEDERAL_BPA_THRESHOLD)) / FEDERAL_BPA_RANGE;
  const federalBPA = FEDERAL_BPA_BASE + bpaTopUp;
  const federalBPACredit = federalBPA * lowestFederalRate;

  // Provincial: varies by province (lowest rate × BPA)
  const lowestProvincialRate = provinceRule.brackets[0]?.rate || 0.05;
  // Yukon's basic personal amount tracks the federal one INCLUDING its
  // high-income phase-out (T4127: Yukon BPAYT uses the same formula as the
  // federal BPAF). Found by the T4032 golden test on 2026-09-15: without it
  // Yukon withholding was $4.00 a pay short above $181,440.
  const provincialBPA = province === Province.YT ? federalBPA : provinceRule.basicPersonalAmount;
  const provincialBPACredit = provincialBPA * lowestProvincialRate;

  // CPP/EI also generate tax credits at lowest rates
  const cppFederalCredit = cppTotal * lowestFederalRate;
  const cppProvincialCredit = cppTotal * lowestProvincialRate;

  const eiFederalCredit = eiAnnual * lowestFederalRate;
  const eiProvincialCredit = eiAnnual * lowestProvincialRate;
  // QPIP premiums are part of the federal K2Q credit for Quebec employees.
  const qpipFederalCredit = qpipAnnual * lowestFederalRate;

  // T4127 K4 — Canada employment amount. Yukon mirrors it provincially (K4P).
  const employmentAmount = Math.min(annualGross, CANADA_EMPLOYMENT_AMOUNT);
  const employmentFederalCredit = employmentAmount * lowestFederalRate;
  const employmentProvincialCredit = province === Province.YT ? employmentAmount * lowestProvincialRate : 0;

  // Step 3: Apply tax credits (cannot reduce tax below zero)
  const totalFederalCredits = federalBPACredit + cppFederalCredit + eiFederalCredit + qpipFederalCredit + employmentFederalCredit;
  const totalProvincialCredits = isQuebec
    ? provincialBPACredit // TP-1015.F: personal credits only, no QPP/EI/QPIP credit
    : provincialBPACredit + cppProvincialCredit + eiProvincialCredit + employmentProvincialCredit;
  
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

  // Step 4b: British Columbia tax reduction (T4127 factor S). Withheld at
  // source, unlike Nova Scotia's — see the note in constants.ts for why NS is
  // deliberately absent here.
  if (province === Province.BC) {
    const reduction = Math.max(0, BC_TAX_REDUCTION_BASE - Math.max(0, annualGross - BC_TAX_REDUCTION_THRESHOLD) * BC_TAX_REDUCTION_RATE);
    provincialTax = Math.max(0, provincialTax - reduction);
  }

  // Step 4c: Ontario tax reduction (T4127 factor S) and Ontario Health Premium
  // (factor V2). Order matters and follows the form: the reduction applies to the
  // tax including surtax, and T4127 is explicit that the health premium is NOT
  // reduced by it — so the premium is added after the reduction, never before.
  if (province === Province.ON) {
    const reduction = Math.min(provincialTax, Math.max(0, 2 * ON_TAX_REDUCTION_BASE - provincialTax));
    provincialTax = Math.max(0, provincialTax - reduction);
    provincialTax += calculateOntarioHealthPremium(annualGross);
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

/**
 * Minutes a shift overlaps a premium window, either of which may cross
 * midnight. The window repeats every day, so it is tested in yesterday's,
 * today's and tomorrow's position. Testing only today's position — as this did
 * until 2026-09-22 — found no overlap at all for a shift that starts after
 * midnight: 00:00–08:00 against a 22:00–06:00 night premium paid nothing
 * instead of six hours.
 */
const getOverlapMinutes = (
  start1: number, end1: number,
  start2: number, end2: number
): number => {
  const e1 = end1 < start1 ? end1 + 1440 : end1;
  const e2 = end2 < start2 ? end2 + 1440 : end2;
  let total = 0;
  for (const offset of [-1440, 0, 1440]) {
    const start = Math.max(start1, start2 + offset);
    const end = Math.min(e1, e2 + offset);
    if (start < end) total += end - start;
  }
  return total;
};

// ============================================
// MAIN CALCULATION FUNCTIONS
// ============================================

/**
 * Hourly / shift pay for one pay period.
 *
 * Stat-holiday pay, sick pay, a bonus and "other income" entered here are paid
 * THIS period — the form says so ("added to gross this period", "one-time or
 * recurring bonus"). Until 2026-09-22 they were added to the period's gross and
 * the whole period was then multiplied by 26, so a one-time $1,000 bonus on
 * $25/h became $26,000 a year: annual gross $78,000 instead of $53,000.
 *
 * Now they are treated the way the CRA's bonus method treats a non-periodic
 * payment: regular pay is computed on its own, and the one-off amount's tax,
 * CPP/QPP, QPIP and EI are the difference between the year with it and the
 * year without it — charged in full to this period, not spread over 26.
 */
export const calculateSalary = (inputs: SalaryInputs): CalculationResult => {
  const a = inputs.additionalIncome;
  const once = a ? (a.statHolidayPay || 0) + (a.sickPay || 0) + (a.bonus || 0) + (a.otherIncome || 0) : 0;
  if (!a || once <= 0) return calculateSalaryRecurring(inputs);

  const without = { ...a, statHolidayPay: 0, sickPay: 0, bonus: 0, otherIncome: 0 };
  const base = calculateSalaryRecurring({ ...inputs, additionalIncome: without });
  // The same year with the one-off amount added once: spreading it as once/26
  // per period makes the annual gross exactly base + once.
  const year = calculateSalaryRecurring({ ...inputs, additionalIncome: { ...without, otherIncome: once / 26 } });

  const inc = (f: (r: CalculationResult) => number) => (f(year) - f(base)) * 26;
  const dFed = inc((r) => r.federalTax);
  const dProv = inc((r) => r.provincialTax);
  const dCpp = inc((r) => r.cppDeduction);
  const dQpip = inc((r) => r.qpipDeduction ?? 0);
  const dEi = inc((r) => r.eiDeduction);
  const dRrsp = inc((r) => r.rrspDeduction ?? 0);

  return {
    ...base,
    grossPayBiWeekly: base.grossPayBiWeekly + once,
    federalTax: base.federalTax + dFed,
    provincialTax: base.provincialTax + dProv,
    cppDeduction: base.cppDeduction + dCpp,
    qpipDeduction: (base.qpipDeduction ?? 0) + dQpip,
    eiDeduction: base.eiDeduction + dEi,
    rrspDeduction: (base.rrspDeduction ?? 0) + dRrsp,
    netPayBiWeekly: base.netPayBiWeekly + once - (dFed + dProv + dCpp + dEi + dRrsp),
    grossPayAnnual: year.grossPayAnnual,
    netPayAnnual: year.netPayAnnual,
    totalDeductionsAnnual: year.totalDeductionsAnnual,
    annual: year.annual,
  };
};

const calculateSalaryRecurring = (inputs: SalaryInputs): CalculationResult => {
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
  
  // 4b. Additional income this period
  const addl = inputs.additionalIncome;
  const additionalPerPeriod = addl
    ? (addl.statHolidayPay + addl.sickPay + addl.bonus + addl.otherIncome)
    : 0;

  const grossPayBiWeekly =
    biWeeklyRegularPay + biWeeklyOt15Pay + biWeeklyOt20Pay + biWeeklyPremiumPay + additionalPerPeriod;

  // 5. Annual Gross & RRSP
  const annualGross = grossPayBiWeekly * 26;
  const rrspPerPeriod = getRRSPPerPeriod(inputs, grossPayBiWeekly);
  const annualRRSP = rrspPerPeriod * 26;
  const annualMatch = getEmployerMatchPerPeriod(inputs, grossPayBiWeekly) * 26;

  // Post-tax deductions (LTD, union dues, other) — do NOT reduce taxable income
  const ded = inputs.deductions;
  const postTaxDeductionsPerPeriod = ded
    ? (ded.ltdPremium + ded.otherDeductions)
    : 0;

  const taxableBenefitsPerPeriod = inputs.additionalIncome?.taxableBenefits ?? 0;
  const annualTaxableBenefits = taxableBenefitsPerPeriod * 26;

  const annualUnionDuesBw = ded ? ded.unionDues * 26 : 0;
  const taxableIncome = Math.max(0, (annualGross + annualTaxableBenefits) - annualRRSP - annualUnionDuesBw);

  // 6. Deductions
  const isQuebec = inputs.province === Province.QC;
  const cppResult = calculateCPP(annualGross + annualTaxableBenefits + annualMatch, isQuebec);
  // Taxable benefits here are NON-CASH (types.ts: "e.g. group life insurance").
  // CRA T4130: "A taxable non-cash or near-cash benefit is generally not
  // insurable. Do not deduct EI premiums." They stay in the CPP base above —
  // "when a non-cash … benefit is taxable, it is also pensionable". Charged EI
  // until 2026-09-22.
  const eiAnnual = calculateEI(annualGross + annualMatch, isQuebec);
  const qpipAnnual = isQuebec ? calculateQPIP(annualGross + annualTaxableBenefits) : 0;
  const taxResult = calculateTotalTax(taxableIncome, cppResult, inputs.province, eiAnnual, qpipAnnual);
  
  const totalTaxAnnual = taxResult.total;
  const annualPostTaxDeductions = postTaxDeductionsPerPeriod * 26;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual + qpipAnnual + annualRRSP + annualPostTaxDeductions + annualUnionDuesBw;
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
    qpipDeduction: qpipAnnual / 26,
    eiDeduction: eiAnnual / 26,
    rrspDeduction: rrspPerPeriod,
    netPayBiWeekly: netPayAnnual / 26,

    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual,
    annual: { federalTax: taxResult.federalTax, provincialTax: taxResult.provincialTax, cpp: cppResult.total + qpipAnnual, qpip: qpipAnnual, ei: eiAnnual, rrsp: annualRRSP },
  };
};

// ============================================
// ANNUAL SALARY CALCULATOR
// ============================================

const getPeriodsPerYear = (frequency: PayFrequency): number => {
  switch (frequency) {
    // 240, the CRA's own count for daily pay (T4127, table 6.1: "Daily (240)",
    // CPP basic exemption 14.58 = 3,500 / 240). It was 365, which treated a
    // daily-paid worker as paid every day of the year: $200 a day became
    // $73,000 instead of $48,000, withholding about 24% too much.
    case PayFrequency.DAILY: return 240;
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
  
  const isQuebec = province === Province.QC;
  const periodsPerYear = getPeriodsPerYear(payFrequency);

  // Additional income per period → annualize
  const addl = inputs.additionalIncome;
  const additionalPerPeriod = addl
    ? (addl.statHolidayPay + addl.sickPay + addl.bonus + addl.otherIncome)
    : 0;
  const annualGross = annualSalary + additionalPerPeriod * periodsPerYear;

  const rrspPerPeriod = getRRSPPerPeriod(inputs, annualGross / periodsPerYear);
  const annualRRSP = rrspPerPeriod * periodsPerYear;
  const annualMatch = getEmployerMatchPerPeriod(inputs, annualGross / periodsPerYear) * periodsPerYear;

  const ded = inputs.deductions;
  /**
   * Union dues come OUT of the cheque but also come OFF taxable income.
   *
   * CRA line 21200 ("annual union, professional, or like dues"), reported in
   * box 44 of the T4: dues are deducted in computing net income, exactly like
   * an RRSP contribution. They were previously bucketed with LTD premiums and
   * "other" as an after-tax deduction, which taxed income the member never had
   * — it overstated the tax and understated the take-home of roughly a third
   * of Canadian employees.
   *
   * LTD premiums genuinely ARE after-tax (that is what keeps the benefit
   * tax-free if it is ever claimed), so only the dues move.
   *
   * Dues do not reduce pensionable or insurable earnings: CPP and EI are still
   * computed on gross.
   */
  const postTaxPerPeriod = ded ? (ded.ltdPremium + ded.otherDeductions) : 0;
  const annualPostTax = postTaxPerPeriod * periodsPerYear;
  const annualUnionDues = ded ? ded.unionDues * periodsPerYear : 0;

  const taxableBenefitsPerPeriod = inputs.additionalIncome?.taxableBenefits ?? 0;
  const annualTaxableBenefits = taxableBenefitsPerPeriod * periodsPerYear;

  /**
   * Vesting RSUs. Three things make equity different from every other line
   * here, and getting any of them wrong changes the answer materially:
   *
   *  1. TAXED IN FULL. RSUs never qualified for the paragraph 110(1)(d) 50%
   *     deduction — that is for qualifying options only. The vest-date fair
   *     market value is employment income at the full marginal rate.
   *  2. PENSIONABLE, NOT INSURABLE. CRA: a taxable non-cash benefit is
   *     pensionable for CPP, but "generally not insurable" for EI. So equity
   *     enters the CPP base and stays out of the EI base.
   *  3. THE PERSON ACTUALLY RECEIVES IT. Unlike group life insurance, which
   *     raises tax without paying anything out, vested shares are value in
   *     hand — so equity joins the total the take-home is computed from.
   */
  const annualEquity = Math.max(0, inputs.equityVestingAnnual ?? 0);

  const taxableIncome = Math.max(0, (annualGross + annualTaxableBenefits + annualEquity) - annualRRSP - annualUnionDues);

  // Calculate deductions
  const cppResult = calculateCPP(annualGross + annualTaxableBenefits + annualEquity + annualMatch, isQuebec);
  // Taxable benefits here are NON-CASH (types.ts: "e.g. group life insurance").
  // CRA T4130: "A taxable non-cash or near-cash benefit is generally not
  // insurable. Do not deduct EI premiums." They stay in the CPP base above —
  // "when a non-cash … benefit is taxable, it is also pensionable". Charged EI
  // until 2026-09-22.
  const eiAnnual = calculateEI(annualGross + annualMatch, isQuebec);
  const qpipAnnual = isQuebec ? calculateQPIP(annualGross + annualTaxableBenefits) : 0;
  const taxResult = calculateTotalTax(taxableIncome, cppResult, province, eiAnnual, qpipAnnual);

  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual + qpipAnnual + annualRRSP + annualPostTax + annualUnionDues;
  const netPayAnnual = (annualGross + annualEquity) - totalDeductionsAnnual;

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
    qpipDeduction: qpipAnnual / periodsPerYear,
    eiDeduction: eiAnnual / periodsPerYear,
    rrspDeduction: rrspPerPeriod,
    netPayBiWeekly: netPayPerPeriod,
    
    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual,
    annual: { federalTax: taxResult.federalTax, provincialTax: taxResult.provincialTax, cpp: cppResult.total + qpipAnnual, qpip: qpipAnnual, ei: eiAnnual, rrsp: annualRRSP },
    
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

  // Sum tips from all entries (declared tips are taxable income)
  const totalTips = entries.reduce((sum, e) => sum + (e.tips ?? 0), 0);

  const totalGross = regularPay + ot15Pay + ot20Pay + totalTips;

  const periodsPerYear = getPeriodsPerYear(payFrequency);
  const annualGross = totalGross * periodsPerYear;
  const rrspPerPeriod = getRRSPPerPeriod(inputs, totalGross);
  const annualRRSP = rrspPerPeriod * periodsPerYear;
  const annualMatch = getEmployerMatchPerPeriod(inputs, totalGross) * periodsPerYear;

  const ded = inputs.deductions;
  /**
   * Union dues come OUT of the cheque but also come OFF taxable income.
   *
   * CRA line 21200 ("annual union, professional, or like dues"), reported in
   * box 44 of the T4: dues are deducted in computing net income, exactly like
   * an RRSP contribution. They were previously bucketed with LTD premiums and
   * "other" as an after-tax deduction, which taxed income the member never had
   * — it overstated the tax and understated the take-home of roughly a third
   * of Canadian employees.
   *
   * LTD premiums genuinely ARE after-tax (that is what keeps the benefit
   * tax-free if it is ever claimed), so only the dues move.
   *
   * Dues do not reduce pensionable or insurable earnings: CPP and EI are still
   * computed on gross.
   */
  const postTaxPerPeriod = ded ? (ded.ltdPremium + ded.otherDeductions) : 0;
  const annualPostTax = postTaxPerPeriod * periodsPerYear;
  const annualUnionDues = ded ? ded.unionDues * periodsPerYear : 0;

  const taxableBenefitsPerPeriod = inputs.deductions ? 0 : (inputs as any).additionalIncome?.taxableBenefits ?? 0; // fallback safety
  const annualTaxableBenefits = taxableBenefitsPerPeriod * periodsPerYear;

  const taxableIncome = Math.max(0, (annualGross + annualTaxableBenefits) - annualRRSP - annualUnionDues);

  // Calculate deductions
  const isQuebec = province === Province.QC;
  const cppResult = calculateCPP(annualGross + annualTaxableBenefits + annualMatch, isQuebec);
  // Taxable benefits here are NON-CASH (types.ts: "e.g. group life insurance").
  // CRA T4130: "A taxable non-cash or near-cash benefit is generally not
  // insurable. Do not deduct EI premiums." They stay in the CPP base above —
  // "when a non-cash … benefit is taxable, it is also pensionable". Charged EI
  // until 2026-09-22.
  const eiAnnual = calculateEI(annualGross + annualMatch, isQuebec);
  const qpipAnnual = isQuebec ? calculateQPIP(annualGross + annualTaxableBenefits) : 0;
  const taxResult = calculateTotalTax(taxableIncome, cppResult, province, eiAnnual, qpipAnnual);

  const totalTaxAnnual = taxResult.total;
  const totalDeductionsAnnual = totalTaxAnnual + cppResult.total + eiAnnual + qpipAnnual + annualRRSP + annualPostTax + annualUnionDues;
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
    qpipDeduction: qpipAnnual / periodsPerYear,
    eiDeduction: eiAnnual / periodsPerYear,
    rrspDeduction: rrspPerPeriod,
    netPayBiWeekly: netPayPerPeriod,
    
    grossPayAnnual: annualGross,
    netPayAnnual,
    totalDeductionsAnnual,
    annual: { federalTax: taxResult.federalTax, provincialTax: taxResult.provincialTax, cpp: cppResult.total + qpipAnnual, qpip: qpipAnnual, ei: eiAnnual, rrsp: annualRRSP },
    
    grossPayPerPeriod,
    netPayPerPeriod,
    payFrequency
  };
};

/**
 * ISO week (Monday to Sunday) of a 'YYYY-MM-DD' calendar date.
 *
 * The date is read as a calendar date and every step is done in UTC. It used
 * to be `new Date(dateStr)` — which JavaScript reads as UTC midnight — followed
 * by LOCAL getDay()/getDate(). Everywhere in Canada is west of UTC, so UTC
 * midnight on a Monday is still Sunday locally, and every Monday was counted
 * in the previous week: six 8-hour days Monday to Saturday in Ontario came out
 * as 48 regular hours and no overtime instead of 44 + 4 (found 2026-09-22).
 * The year also came from the date rather than from the week's Thursday, which
 * mislabelled late-December days.
 */
const getWeekKey = (dateStr: string): string => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y, (m || 1) - 1, d || 1));
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + (4 - (date.getUTCDay() || 7)));
  const isoYear = thursday.getUTCFullYear();
  const yearStart = Date.UTC(isoYear, 0, 1);
  const weekNumber = Math.ceil(((thursday.getTime() - yearStart) / 86400000 + 1) / 7);
  return `${isoYear}-W${String(weekNumber).padStart(2, '0')}`;
};
