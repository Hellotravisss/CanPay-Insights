import { ProvincialRule, Province } from './types';

// Simplified Federal Brackets 2024 (Approximate)
export const FEDERAL_BRACKETS = [
  { threshold: 55867, rate: 0.15 },
  { threshold: 111733, rate: 0.205 },
  { threshold: 173205, rate: 0.26 },
  { threshold: 246752, rate: 0.29 },
  { threshold: Infinity, rate: 0.33 },
];
export const FEDERAL_BASIC_PERSONAL_AMOUNT = 15705;

// CPP & EI 2024 Constants
export const CPP_RATE = 0.0595;
export const CPP_MAX_CONTRIBUTION = 3867.50; // Approx max
export const CPP_EXEMPTION = 3500;

export const EI_RATE = 0.0166; // General rate (QC is different usually, simplified here)
export const EI_MAX_CONTRIBUTION = 1049.12;

// Provincial Rules (Simplified for Demo purposes)
export const PROVINCIAL_DATA: Record<string, ProvincialRule> = {
  [Province.AB]: {
    id: 'AB',
    name: Province.AB,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 21003,
    brackets: [{ threshold: 142292, rate: 0.10 }, { threshold: Infinity, rate: 0.12 }] // Simplified
  },
  [Province.BC]: {
    id: 'BC',
    name: Province.BC,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    doubleTimeThreshold: 12, // Double time after 12h
    vacationPayRate: 0.04,
    basicPersonalAmount: 11981,
    brackets: [{ threshold: 45654, rate: 0.0506 }, { threshold: 91310, rate: 0.077 }, { threshold: Infinity, rate: 0.105 }]
  },
  [Province.ON]: {
    id: 'ON',
    name: Province.ON,
    dailyOtThreshold: null, // ON uses weekly primarily for general rule
    weeklyOtThreshold: 44,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 11865,
    brackets: [{ threshold: 49231, rate: 0.0505 }, { threshold: 98463, rate: 0.0915 }, { threshold: Infinity, rate: 0.1116 }]
  },
  [Province.QC]: {
    id: 'QC',
    name: Province.QC,
    dailyOtThreshold: null,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    vacationPayRate: 0.04,
    basicPersonalAmount: 17183,
    brackets: [{ threshold: 49275, rate: 0.14 }, { threshold: 98540, rate: 0.19 }, { threshold: Infinity, rate: 0.24 }]
  },
  // Default fallback for others to avoid massive file size
  [Province.MB]: { id: 'MB', name: Province.MB, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 10145, brackets: [{ threshold: 35000, rate: 0.108 }, { threshold: Infinity, rate: 0.1275 }] },
  [Province.SK]: { id: 'SK', name: Province.SK, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 17661, brackets: [{ threshold: 49720, rate: 0.105 }, { threshold: Infinity, rate: 0.125 }] },
  [Province.NS]: { id: 'NS', name: Province.NS, dailyOtThreshold: null, weeklyOtThreshold: 48, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 8481, brackets: [{ threshold: 29590, rate: 0.0879 }, { threshold: Infinity, rate: 0.1495 }] },
  [Province.NB]: { id: 'NB', name: Province.NB, dailyOtThreshold: null, weeklyOtThreshold: 44, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 12458, brackets: [{ threshold: 47715, rate: 0.094 }, { threshold: Infinity, rate: 0.14 }] },
  [Province.PE]: { id: 'PE', name: Province.PE, dailyOtThreshold: null, weeklyOtThreshold: 48, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 12750, brackets: [{ threshold: 31984, rate: 0.098 }, { threshold: Infinity, rate: 0.138 }] },
  [Province.NL]: { id: 'NL', name: Province.NL, dailyOtThreshold: null, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 10382, brackets: [{ threshold: 41457, rate: 0.087 }, { threshold: Infinity, rate: 0.145 }] },
  [Province.YT]: { id: 'YT', name: Province.YT, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 15705, brackets: [{ threshold: 53359, rate: 0.064 }, { threshold: Infinity, rate: 0.09 }] },
  [Province.NT]: { id: 'NT', name: Province.NT, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 16593, brackets: [{ threshold: 48326, rate: 0.059 }, { threshold: Infinity, rate: 0.086 }] },
  [Province.NU]: { id: 'NU', name: Province.NU, dailyOtThreshold: 8, weeklyOtThreshold: 40, otRate: 1.5, vacationPayRate: 0.04, basicPersonalAmount: 17925, brackets: [{ threshold: 50877, rate: 0.04 }, { threshold: Infinity, rate: 0.07 }] },
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];