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
  vacationPayRate: number;
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

export interface SalaryInputs {
  province: string;
  hourlyWage: number;
  shift: ShiftDetails;
  premium: ShiftPremium;
  vacationPayRate: number;
  rrspContributionPerPeriod?: number; // Optional RRSP deduction per pay period
}

// 年薪输入（新增）
export interface AnnualSalaryInputs {
  province: string;
  annualSalary: number;
  payFrequency: PayFrequency;
  rrspContributionPerPeriod?: number; // Optional RRSP deduction per pay period
}

// Timesheet 打卡条目
export interface TimesheetEntry {
  id: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM (24-hour format)
  checkOut: string; // HH:MM (24-hour format)
  unpaidBreakMinutes: number;
  notes?: string;
}

// Timesheet 输入
export interface TimesheetInputs {
  province: string;
  hourlyWage: number;
  payFrequency: PayFrequency;
  entries: TimesheetEntry[];
  rrspContributionPerPeriod?: number;
}

export interface CalculationResult {
  regularHours: number;
  overtimeHours15: number;
  overtimeHours20: number;
  shiftPremiumHours: number;
  
  grossPayBiWeekly: number;
  federalTax: number;
  provincialTax: number;
  cppDeduction: number;
  eiDeduction: number;
  rrspDeduction: number;       // RRSP per period (0 if not used)
  netPayBiWeekly: number;
  
  grossPayAnnual: number;
  netPayAnnual: number;
  totalDeductionsAnnual: number;
  
  grossPayPerPeriod?: number;
  netPayPerPeriod?: number;
  payFrequency?: PayFrequency;
}