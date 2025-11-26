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
}