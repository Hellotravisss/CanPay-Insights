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
  dailyOtThreshold: number | null; // Hours per day before OT, null if not applicable
  weeklyOtThreshold: number; // Hours per week before OT
  otRate: number; // Usually 1.5
  doubleTimeThreshold?: number; // BC specific: hours after which 2x applies
  vacationPayRate: number; // 0.04
  brackets: TaxBracket[];
  basicPersonalAmount: number;
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
  includeVacationPay: boolean;
}

// 年薪输入（新增）
export interface AnnualSalaryInputs {
  province: string;
  annualSalary: number;
  payFrequency: PayFrequency;
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
}

export interface CalculationResult {
  regularHours: number;
  overtimeHours15: number; // 1.5x
  overtimeHours20: number; // 2.0x
  shiftPremiumHours: number;
  
  grossPayBiWeekly: number;
  federalTax: number;
  provincialTax: number;
  cppDeduction: number;
  eiDeduction: number;
  netPayBiWeekly: number;
  
  grossPayAnnual: number;
  netPayAnnual: number;
  totalDeductionsAnnual: number;
  
  // 新增：支持不同发薪频率
  grossPayPerPeriod?: number;  // 每期总收入
  netPayPerPeriod?: number;    // 每期净收入
  payFrequency?: PayFrequency; // 发薪频率
}