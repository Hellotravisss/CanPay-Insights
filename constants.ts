
import { ProvincialRule, Province } from './types';

// Updated Federal Brackets 2025/2026 (Indexed for inflation)
export const FEDERAL_BRACKETS = [
  { threshold: 57375, rate: 0.15 },    // 2025 Est.
  { threshold: 114750, rate: 0.205 },
  { threshold: 177722, rate: 0.26 },
  { threshold: 253865, rate: 0.29 },
  { threshold: Infinity, rate: 0.33 },
];
export const FEDERAL_BASIC_PERSONAL_AMOUNT = 15950; // 2025 Estimated

// CPP & EI 2025/2026 Constants
// Note: CPP2 (Additional) is simplified into a slightly higher effective cap for calculation
export const CPP_RATE = 0.0595; 
export const CPP_MAX_CONTRIBUTION = 4055.25; // 2025 Max (Base + Enhanced)
export const CPP_EXEMPTION = 3500;

export const EI_RATE = 0.0164; // 2025 Premium Rate
export const EI_MAX_CONTRIBUTION = 1077.48; // 2025 Max

// Provincial Rules (Updated for 2025/2026 projections)
export const PROVINCIAL_DATA: Record<string, ProvincialRule> = {
  [Province.AB]: {
    id: 'AB',
    name: Province.AB,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 22250, // Highly indexed in Alberta
    brackets: [{ threshold: 151230, rate: 0.10 }, { threshold: Infinity, rate: 0.12 }]
  },
  [Province.BC]: {
    id: 'BC',
    name: Province.BC,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    doubleTimeThreshold: 12,
    vacationPayRate: 0.04,
    basicPersonalAmount: 12580,
    brackets: [{ threshold: 48000, rate: 0.0506 }, { threshold: 96000, rate: 0.077 }, { threshold: Infinity, rate: 0.105 }]
  },
  [Province.ON]: {
    id: 'ON',
    name: Province.ON,
    dailyOtThreshold: null,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 12399,
    brackets: [{ threshold: 52446, rate: 0.0505 }, { threshold: 104891, rate: 0.0915 }, { threshold: Infinity, rate: 0.1116 }]
  },
  [Province.QC]: {
    id: 'QC',
    name: Province.QC,
    dailyOtThreshold: null,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 18050,
    brackets: [{ threshold: 51780, rate: 0.14 }, { threshold: 103545, rate: 0.19 }, { threshold: Infinity, rate: 0.24 }]
  },
  [Province.MB]: { id: 'MB', name: Province.MB, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 16000, brackets: [{ threshold: 47000, rate: 0.108 }, { threshold: Infinity, rate: 0.1275 }] },
  [Province.SK]: { id: 'SK', name: Province.SK, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 18450, brackets: [{ threshold: 52000, rate: 0.105 }, { threshold: Infinity, rate: 0.125 }] },
  [Province.NS]: { id: 'NS', name: Province.NS, dailyOtThreshold: null, weeklyOtThreshold: 48, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 11481, brackets: [{ threshold: 32000, rate: 0.0879 }, { threshold: Infinity, rate: 0.1495 }] },
  [Province.NB]: { id: 'NB', name: Province.NB, dailyOtThreshold: null, weeklyOtThreshold: 44, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 13500, brackets: [{ threshold: 49800, rate: 0.094 }, { threshold: Infinity, rate: 0.14 }] },
  [Province.PE]: { id: 'PE', name: Province.PE, dailyOtThreshold: null, weeklyOtThreshold: 48, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 13500, brackets: [{ threshold: 33000, rate: 0.098 }, { threshold: Infinity, rate: 0.138 }] },
  [Province.NL]: { id: 'NL', name: Province.NL, dailyOtThreshold: null, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 10800, brackets: [{ threshold: 43000, rate: 0.087 }, { threshold: Infinity, rate: 0.145 }] },
  [Province.YT]: { id: 'YT', name: Province.YT, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 15950, brackets: [{ threshold: 57375, rate: 0.064 }, { threshold: Infinity, rate: 0.09 }] },
  [Province.NT]: { id: 'NT', name: Province.NT, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 17300, brackets: [{ threshold: 52000, rate: 0.059 }, { threshold: Infinity, rate: 0.086 }] },
  [Province.NU]: { id: 'NU', name: Province.NU, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 18500, brackets: [{ threshold: 54000, rate: 0.04 }, { threshold: Infinity, rate: 0.07 }] },
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
