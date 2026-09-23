export enum Province {
  AB = 'Alberta',
  BC = 'British Columbia',
  MB = 'Manitoba',
  NB = 'New Brunswick',
  NL = 'Newfoundland and Labrador',
  NS = 'Nova Scotia',
  ON = 'Ontario',
  PE = 'Prince Edward Island',
  QC = 'Quebec',
  SK = 'Saskatchewan',
  NT = 'Northwest Territories',
  NU = 'Nunavut',
  YT = 'Yukon',
}

// 计算模式
export enum CalculationMode {
  SIMPLE = 'simple',      // 简易估算（时薪）
  ANNUAL = 'annual',      // 年薪倒推
  TIMESHEET = 'timesheet' // 精确打卡
}

// 发薪频率 (Pay Frequency - for Timesheet mode)
export enum PayFrequency {
  DAILY = 'daily',           // Daily - for timesheet mode
  WEEKLY = 'weekly',         // Weekly - for timesheet mode
  BI_WEEKLY = 'bi-weekly',   // Bi-Weekly - default for annual salary
  SEMI_MONTHLY = 'semi-monthly', // Semi-Monthly - for timesheet mode
  MONTHLY = 'monthly',       // Monthly - for timesheet mode
  QUARTERLY = 'quarterly'    // Quarterly - for timesheet mode
}

export interface TaxBracket {
  threshold: number;
  rate: number;
}

export interface ProvincialRule {
  id: string;
  name: string;
  dailyOtThreshold: number | null;
  weeklyOtThreshold: number;
  otRate: number;
  doubleTimeThreshold?: number;
  brackets: TaxBracket[];
  basicPersonalAmount: number;
  // Ontario surtax (optional)
  surtaxThreshold1?: number;
  surtaxRate1?: number;
  surtaxThreshold2?: number;
  surtaxRate2?: number;
}

export interface ShiftDetails {
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  unpaidBreakMinutes: number;
  daysActive: boolean[]; // [Sun, Mon, Tue, Wed, Thu, Fri, Sat]
}

export interface ShiftPremium {
  enabled: boolean;
  ratePerHour: number;
  startTime: string;
  endTime: string;
}

export interface AdditionalIncome {
  statHolidayPay: number;      // per period
  sickPay: number;             // per period
  bonus: number;               // per period (one-time or recurring)
  otherIncome: number;         // per period (tips, commissions, etc.)
  taxableBenefits?: number;    // non-cash taxable benefits (e.g. group life insurance)
}

export interface Deductions {
  ltdPremium: number;          // Long-term disability insurance per period
  unionDues: number;           // Union dues per period
  otherDeductions: number;     // Other pre/post-tax deductions per period
}

export interface SalaryInputs {
  province: string;
  hourlyWage: number;
  shift: ShiftDetails;
  premium: ShiftPremium;
  rrspType?: 'amount' | 'percent';
  rrspPercentage?: number;
  rrspMatchPolicy?: 'equal' | 'half' | 'none' | 'custom';
  rrspEmployerMatch?: number;
  rrspContributionPerPeriod?: number;
  additionalIncome?: AdditionalIncome;
  deductions?: Deductions;
}

// 年薪输入（新增）
export interface AnnualSalaryInputs {
  province: string;
  annualSalary: number;
  payFrequency: PayFrequency;
  rrspType?: 'amount' | 'percent';
  rrspPercentage?: number;
  rrspMatchPolicy?: 'equal' | 'half' | 'none' | 'custom';
  rrspEmployerMatch?: number;
  rrspContributionPerPeriod?: number;
  additionalIncome?: AdditionalIncome;
  deductions?: Deductions;
  /**
   * RSU value vesting this year, in dollars, at fair market value on the vest
   * date. Employment income in full — RSUs have never qualified for the
   * paragraph 110(1)(d) 50% deduction, so the whole amount is taxed at the
   * marginal rate (options are different and are NOT modelled here).
   *
   * Pensionable but not insurable: CRA treats a non-cash taxable benefit as
   * pensionable for CPP, while "a taxable non-cash or near-cash benefit is
   * generally not insurable" for EI.
   */
  equityVestingAnnual?: number;
}

// Timesheet 打卡条目
export interface TimesheetEntry {
  id: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM (24-hour format)
  checkOut: string; // HH:MM (24-hour format)
  unpaidBreakMinutes: number;
  tips?: number; // declared tips this shift (taxable)
  notes?: string;
}

// Timesheet 输入
export interface TimesheetInputs {
  province: string;
  hourlyWage: number;
  payFrequency: PayFrequency;
  entries: TimesheetEntry[];
  /**
   * How tips reach the worker (CRA, "Tips and gratuities"):
   * 'payroll' — controlled tips (tip pool, card tips the employer allocates):
   *   income tax, CPP and EI are withheld. The default, and the old behaviour.
   * 'direct'  — handed over by the customer: nothing is withheld; they are
   *   still taxable, so income tax on them is shown as owed at filing.
   */
  tipsPaid?: 'payroll' | 'direct';
  rrspType?: 'amount' | 'percent';
  rrspPercentage?: number;
  rrspMatchPolicy?: 'equal' | 'half' | 'none' | 'custom';
  rrspEmployerMatch?: number;
  rrspContributionPerPeriod?: number;
  deductions?: Deductions;
}

export interface CalculationResult {
  regularHours: number;
  overtimeHours15: number;
  overtimeHours20: number;
  shiftPremiumHours: number;
  
  grossPayBiWeekly: number;
  federalTax: number;
  provincialTax: number;
  cppDeduction: number;        // CPP+CPP2, or in Quebec QPP+QPP2 AND QPIP combined
  /**
   * The QPIP part of cppDeduction, per period (0 outside Quebec). Reported so a
   * display can show QPP and QPIP on separate lines; it is NOT an extra
   * deduction — cppDeduction already includes it.
   */
  qpipDeduction?: number;
  eiDeduction: number;
  rrspDeduction: number;       // RRSP per period (0 if not used)
  netPayBiWeekly: number;
  
  grossPayAnnual: number;
  netPayAnnual: number;
  totalDeductionsAnnual: number;
  /**
   * The year's deductions by kind. Use these for annual figures — never
   * "per-period × periods": after a one-off payment (a bonus paid this period)
   * the period's tax includes the whole bonus's tax, so multiplying it out
   * would charge that tax 26 times.
   */
  annual?: { federalTax: number; provincialTax: number; cpp: number; qpip: number; ei: number; rrsp: number };
  
  grossPayPerPeriod?: number;
  netPayPerPeriod?: number;
  payFrequency?: PayFrequency;
}