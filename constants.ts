
import { ProvincialRule, Province } from './types';

// ============================================
// 2025 FEDERAL TAX BRACKETS
// ============================================
export const FEDERAL_BRACKETS = [
  { threshold: 57375, rate: 0.15 },    // 15% on first $57,375
  { threshold: 114750, rate: 0.205 },  // 20.5% on $57,376 to $114,750
  { threshold: 177722, rate: 0.26 },   // 26% on $114,751 to $177,722
  { threshold: 253865, rate: 0.29 },   // 29% on $177,723 to $253,865
  { threshold: Infinity, rate: 0.33 }, // 33% on amount over $253,865
];

// Federal Basic Personal Amount (2025)
// The BPA is a tax CREDIT, not a deduction from income
// Value: $16,129 (federal) - but the tax credit is 15% of this amount
export const FEDERAL_BASIC_PERSONAL_AMOUNT = 16129; // 2025 actual value

// ============================================
// CPP CONTRIBUTIONS (2025)
// ============================================
// CPP First Tier
export const CPP_RATE = 0.0595; // 5.95% employee contribution
export const CPP_MAX_CONTRIBUTION = 4037.40; // 2025 max employee contribution
export const CPP_EXEMPTION = 3500; // Annual basic exemption
export const CPP_MAX_PENSIONABLE_EARNINGS = 73600; // 2025 YMPE

// CPP2 Second Tier (NEW for 2024+)
export const CPP2_RATE = 0.04; // 4.00% employee contribution
export const CPP2_MAX_CONTRIBUTION = 423; // 2025 max employee contribution
export const CPP2_MAX_PENSIONABLE_EARNINGS = 81200; // 2025 YAMPE
export const CPP2_MIN_PENSIONABLE_EARNINGS = 73600; // Same as CPP max

// ============================================
// QUEBEC SPECIAL CONTRIBUTIONS (2025)
// ============================================
// QPP (Québec Pension Plan) - Higher rates than CPP
export const QPP_RATE = 0.064; // 6.4% employee contribution (vs 5.95% CPP)
export const QPP_MAX_CONTRIBUTION = 5100; // 2025 max (approximate)
export const QPP_EXEMPTION = 3500; // Same as CPP
export const QPP_MAX_PENSIONABLE_EARNINGS = 83200; // 2025 YMPE for QPP

// QPP2 Second Tier
export const QPP2_RATE = 0.0715; // 7.15% employee contribution (vs 4.00% CPP2)
export const QPP2_MAX_CONTRIBUTION = 724; // 2025 max (approximate)
export const QPP2_MAX_PENSIONABLE_EARNINGS = 93300; // 2025 YAMPE for QPP

// QPIP (Québec Parental Insurance Plan)
export const QPIP_RATE = 0.00494; // 0.494% employee contribution
export const QPIP_MAX_CONTRIBUTION = 424; // 2025 max (approximate)
export const QPIP_MAX_INSURABLE_EARNINGS = 86000; // 2025 MIE for QPIP

// Quebec EI - Lower rate due to QPIP
export const QC_EI_RATE = 0.0127; // 1.27% employee premium (vs 1.64% federal)
export const QC_EI_MAX_CONTRIBUTION = 834; // 2025 max (approximate)

// Quebec Abatement - 16.5% reduction on federal tax
export const QUEBEC_ABATEMENT_RATE = 0.165;

// ============================================
// EI PREMIUMS (2025)
// ============================================
export const EI_RATE = 0.0164; // 1.64% employee premium rate
export const EI_MAX_CONTRIBUTION = 1077.48; // 2025 max employee premium
export const EI_MAX_INSURABLE_EARNINGS = 65700; // 2025 MIE

// ============================================
// PROVINCIAL DATA (2025)
// ============================================
export const PROVINCIAL_DATA: Record<string, ProvincialRule> = {
  [Province.AB]: {
    id: 'AB',
    name: Province.AB,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 22783, // 2025 Alberta BPA
    brackets: [
      { threshold: 151839, rate: 0.10 }, 
      { threshold: Infinity, rate: 0.12 }
    ]
  },
  [Province.BC]: {
    id: 'BC',
    name: Province.BC,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    doubleTimeThreshold: 12,
    vacationPayRate: 0.04,
    basicPersonalAmount: 12680, // 2025 BC BPA
    brackets: [
      { threshold: 49279,  rate: 0.0506 },
      { threshold: 98560,  rate: 0.077  },
      { threshold: 113158, rate: 0.105  },
      { threshold: 137407, rate: 0.1229 },
      { threshold: 186306, rate: 0.147  },
      { threshold: 259829, rate: 0.168  },
      { threshold: Infinity, rate: 0.205 }
    ]
  },
  [Province.ON]: {
    id: 'ON',
    name: Province.ON,
    dailyOtThreshold: null,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 13229, // 2025 Ontario BPA
    // Surtax applied in taxEngine: 20% on ON tax > $5,710; +36% on ON tax > $6,802
    surtaxThreshold1: 5710,
    surtaxRate1: 0.20,
    surtaxThreshold2: 6802,
    surtaxRate2: 0.36,
    brackets: [
      { threshold: 52886,   rate: 0.0505 },
      { threshold: 105775,  rate: 0.0915 },
      { threshold: 150000,  rate: 0.1116 },
      { threshold: 220000,  rate: 0.1216 },
      { threshold: Infinity, rate: 0.1316 }
    ]
  },
  [Province.QC]: {
    id: 'QC',
    name: Province.QC,
    dailyOtThreshold: null,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 18571, // 2025 Quebec BPA
    brackets: [
      { threshold: 53255, rate: 0.14 }, 
      { threshold: 106495, rate: 0.19 }, 
      { threshold: 129590, rate: 0.24 },
      { threshold: Infinity, rate: 0.2575 }
    ]
  },
  [Province.MB]: { 
    id: 'MB', 
    name: Province.MB, 
    dailyOtThreshold: 8, 
    weeklyOtThreshold: 40, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 16399, // 2025
    brackets: [
      { threshold: 47564,   rate: 0.108  },
      { threshold: 101200,  rate: 0.1275 },
      { threshold: Infinity, rate: 0.174 }
    ] 
  },
  [Province.SK]: { 
    id: 'SK', 
    name: Province.SK, 
    dailyOtThreshold: 8, 
    weeklyOtThreshold: 40, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 19139, // 2025
    brackets: [
      { threshold: 54300, rate: 0.105 }, 
      { threshold: Infinity, rate: 0.125 }
    ] 
  },
  [Province.NS]: { 
    id: 'NS', 
    name: Province.NS, 
    dailyOtThreshold: null, 
    weeklyOtThreshold: 48, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 12544, // 2025
    brackets: [
      { threshold: 30507, rate: 0.0879 }, 
      { threshold: 61015, rate: 0.1495 },
      { threshold: 95883, rate: 0.1667 },
      { threshold: 154650, rate: 0.175 },
      { threshold: Infinity, rate: 0.21 }
    ] 
  },
  [Province.NB]: { 
    id: 'NB', 
    name: Province.NB, 
    dailyOtThreshold: null, 
    weeklyOtThreshold: 44, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 13853, // 2025
    brackets: [
      { threshold: 51306, rate: 0.094 }, 
      { threshold: 102614, rate: 0.14 },
      { threshold: 190859, rate: 0.16 },
      { threshold: Infinity, rate: 0.195 }
    ] 
  },
  [Province.PE]: { 
    id: 'PE', 
    name: Province.PE, 
    dailyOtThreshold: null, 
    weeklyOtThreshold: 48, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 14250, // 2025
    brackets: [
      { threshold: 33328, rate: 0.098 }, 
      { threshold: 66652, rate: 0.138 },
      { threshold: Infinity, rate: 0.167 }
    ] 
  },
  [Province.NL]: { 
    id: 'NL', 
    name: Province.NL, 
    dailyOtThreshold: null, 
    weeklyOtThreshold: 40, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 11385, // 2025
    brackets: [
      { threshold: 44192,   rate: 0.087  },
      { threshold: 88382,   rate: 0.145  },
      { threshold: 157792,  rate: 0.158  },
      { threshold: 221850,  rate: 0.178  },
      { threshold: 282214,  rate: 0.198  },
      { threshold: 564429,  rate: 0.208  },
      { threshold: Infinity, rate: 0.218 }
    ] 
  },
  [Province.YT]: { 
    id: 'YT', 
    name: Province.YT, 
    dailyOtThreshold: 8, 
    weeklyOtThreshold: 40, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 16129, // Same as federal
    brackets: [
      { threshold: 57375, rate: 0.064 }, 
      { threshold: 114750, rate: 0.09 },
      { threshold: 177722, rate: 0.109 },
      { threshold: 253865, rate: 0.128 },
      { threshold: 500000, rate: 0.15 },
      { threshold: Infinity, rate: 0.16 }
    ] 
  },
  [Province.NT]: { 
    id: 'NT', 
    name: Province.NT, 
    dailyOtThreshold: 8, 
    weeklyOtThreshold: 40, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 17782, // 2025
    brackets: [
      { threshold: 52000, rate: 0.059 }, 
      { threshold: Infinity, rate: 0.086 }
    ] 
  },
  [Province.NU]: { 
    id: 'NU', 
    name: Province.NU, 
    dailyOtThreshold: 8, 
    weeklyOtThreshold: 40, 
    otRate: 1.5, 
    vacationPayRate: 0.04, 
    basicPersonalAmount: 19025, // 2025
    brackets: [
      { threshold: 54000, rate: 0.04 }, 
      { threshold: Infinity, rate: 0.07 }
    ] 
  },
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
