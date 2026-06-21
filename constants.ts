
import { ProvincialRule, Province } from './types';

// ============================================================================
// 2026 TAX YEAR
// Figures verified 2026-06-21 against authoritative sources:
//  • Federal brackets / BPA + provincial brackets / BPAs: TaxTips.ca (CRA-indexed)
//  • CPP/CPP2: canada.ca CRA payroll
//  • EI (incl. Quebec rate): canada.ca EI 2026 premium-rate notice
//  • QPP/QPP2: Revenu Québec  • QPIP/RQAP: rqap.gouv.qc.ca 2026 notice
// Federal lowest rate is 14% for 2026 (was 15%). The federal non-refundable
// credit rate in utils/taxEngine.ts is therefore 0.14 (lowest federal rate).
// ============================================================================

// ============================================
// 2026 FEDERAL TAX BRACKETS
// ============================================
export const FEDERAL_BRACKETS = [
  { threshold: 58523, rate: 0.14 },    // 14% on first $58,523 (lowest rate cut 15%→14% for 2026)
  { threshold: 117045, rate: 0.205 },  // 20.5% on $58,523 to $117,045
  { threshold: 181440, rate: 0.26 },   // 26% on $117,045 to $181,440
  { threshold: 258482, rate: 0.29 },   // 29% on $181,440 to $258,482
  { threshold: Infinity, rate: 0.33 }, // 33% on amount over $258,482
];

// Federal Basic Personal Amount (2026) — max; BPA is a 14% tax CREDIT
export const FEDERAL_BASIC_PERSONAL_AMOUNT = 16452; // 2026 maximum BPA

// ============================================
// CPP CONTRIBUTIONS (2026)
// ============================================
// CPP First Tier
export const CPP_RATE = 0.0595; // 5.95% employee contribution
export const CPP_MAX_CONTRIBUTION = 4230.45; // 2026 max employee contribution (5.95% × (74,600 − 3,500))
export const CPP_EXEMPTION = 3500; // Annual basic exemption
export const CPP_MAX_PENSIONABLE_EARNINGS = 74600; // 2026 YMPE (first ceiling)

// CPP2 Second Tier
export const CPP2_RATE = 0.04; // 4.00% employee contribution
export const CPP2_MAX_CONTRIBUTION = 416; // 2026 max employee contribution (4% × (85,000 − 74,600))
export const CPP2_MAX_PENSIONABLE_EARNINGS = 85000; // 2026 YAMPE (second ceiling)
export const CPP2_MIN_PENSIONABLE_EARNINGS = 74600; // Same as CPP max (YMPE)

// ============================================
// QUEBEC SPECIAL CONTRIBUTIONS (2026)
// ============================================
// QPP (Québec Pension Plan) — first tier (base 5.3% + first-additional 1.0% = 6.3% employee)
export const QPP_RATE = 0.063; // 6.3% employee contribution (2026)
export const QPP_MAX_CONTRIBUTION = 4479.30; // 2026 max (6.3% × (74,600 − 3,500))
export const QPP_EXEMPTION = 3500; // Same as CPP
export const QPP_MAX_PENSIONABLE_EARNINGS = 74600; // 2026 MPE for QPP (same first ceiling as CPP)

// QPP2 Second Tier — second-additional (4% between the two ceilings, same as CPP2)
export const QPP2_RATE = 0.04; // 4.00% employee contribution (2026)
export const QPP2_MAX_CONTRIBUTION = 416; // 2026 max (4% × (85,000 − 74,600))
export const QPP2_MAX_PENSIONABLE_EARNINGS = 85000; // 2026 YAMPE for QPP

// QPIP / RQAP (Québec Parental Insurance Plan) — 13% rate reduction for 2026
export const QPIP_RATE = 0.0043; // 0.430% employee premium (2026, down from 0.494%)
export const QPIP_MAX_CONTRIBUTION = 442.90; // 2026 max employee premium (0.430% × 103,000)
export const QPIP_MAX_INSURABLE_EARNINGS = 103000; // 2026 MIE for QPIP

// Quebec EI — lower rate due to QPIP
export const QC_EI_RATE = 0.0130; // 1.30% employee premium (2026)
export const QC_EI_MAX_CONTRIBUTION = 895.70; // 2026 max (1.30% × 68,900)

// Quebec Abatement — 16.5% reduction on federal tax
export const QUEBEC_ABATEMENT_RATE = 0.165;

// ============================================
// EI PREMIUMS (2026)
// ============================================
export const EI_RATE = 0.0163; // 1.63% employee premium rate (2026, down from 1.64%)
export const EI_MAX_CONTRIBUTION = 1123.07; // 2026 max employee premium
export const EI_MAX_INSURABLE_EARNINGS = 68900; // 2026 MIE

// ============================================
// PROVINCIAL DATA (2026 brackets & basic personal amounts)
// Labour-standards fields (overtime thresholds/rates) are unchanged.
// ============================================
export const PROVINCIAL_DATA: Record<string, ProvincialRule> = {
  [Province.AB]: {
    id: 'AB',
    name: Province.AB,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    basicPersonalAmount: 22769, // 2026 Alberta BPA
    brackets: [
      { threshold: 61200,  rate: 0.08 },  // 8% bracket (introduced 2025)
      { threshold: 154259, rate: 0.10 },
      { threshold: 185111, rate: 0.12 },
      { threshold: 246813, rate: 0.13 },
      { threshold: 370220, rate: 0.14 },
      { threshold: Infinity, rate: 0.15 }
    ]
  },
  [Province.BC]: {
    id: 'BC',
    name: Province.BC,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    doubleTimeThreshold: 12,
    basicPersonalAmount: 13216, // 2026 BC BPA
    brackets: [
      { threshold: 50363,  rate: 0.0506 },
      { threshold: 100728, rate: 0.077  },
      { threshold: 115648, rate: 0.105  },
      { threshold: 140430, rate: 0.1229 },
      { threshold: 190405, rate: 0.147  },
      { threshold: 265545, rate: 0.168  },
      { threshold: Infinity, rate: 0.205 }
    ]
  },
  [Province.ON]: {
    id: 'ON',
    name: Province.ON,
    dailyOtThreshold: null,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    basicPersonalAmount: 12989, // 2026 Ontario BPA
    // Ontario surtax (2026): 20% on ON tax > $5,818; +36% on ON tax > $7,446
    surtaxThreshold1: 5818,
    surtaxRate1: 0.20,
    surtaxThreshold2: 7446,
    surtaxRate2: 0.36,
    brackets: [
      { threshold: 53891,   rate: 0.0505 },
      { threshold: 107785,  rate: 0.0915 },
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
    basicPersonalAmount: 18952, // 2026 Quebec BPA
    brackets: [
      { threshold: 54345,  rate: 0.14 },
      { threshold: 108680, rate: 0.19 },
      { threshold: 132245, rate: 0.24 },
      { threshold: Infinity, rate: 0.2575 }
    ]
  },
  [Province.MB]: {
    id: 'MB',
    name: Province.MB,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    basicPersonalAmount: 15780, // 2026 Manitoba BPA
    brackets: [
      { threshold: 47000,   rate: 0.108  },
      { threshold: 100000,  rate: 0.1275 },
      { threshold: Infinity, rate: 0.174 }
    ]
  },
  [Province.SK]: {
    id: 'SK',
    name: Province.SK,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    basicPersonalAmount: 20381, // 2026 Saskatchewan BPA
    brackets: [
      { threshold: 54532,  rate: 0.105 },
      { threshold: 155805, rate: 0.125 },
      { threshold: Infinity, rate: 0.145 }
    ]
  },
  [Province.NS]: {
    id: 'NS',
    name: Province.NS,
    dailyOtThreshold: null,
    weeklyOtThreshold: 48,
    otRate: 1.5,
    basicPersonalAmount: 11932, // 2026 Nova Scotia BPA (base; NS also has an income-tested top-up not modelled here)
    brackets: [
      { threshold: 30995,  rate: 0.0879 },
      { threshold: 61991,  rate: 0.1495 },
      { threshold: 97417,  rate: 0.1667 },
      { threshold: 157124, rate: 0.175  },
      { threshold: Infinity, rate: 0.21 }
    ]
  },
  [Province.NB]: {
    id: 'NB',
    name: Province.NB,
    dailyOtThreshold: null,
    weeklyOtThreshold: 44,
    otRate: 1.5,
    basicPersonalAmount: 13664, // 2026 New Brunswick BPA
    brackets: [
      { threshold: 52333,  rate: 0.094 },
      { threshold: 104666, rate: 0.14  },
      { threshold: 193861, rate: 0.16  },
      { threshold: Infinity, rate: 0.195 }
    ]
  },
  [Province.PE]: {
    id: 'PE',
    name: Province.PE,
    dailyOtThreshold: null,
    weeklyOtThreshold: 48,
    otRate: 1.5,
    basicPersonalAmount: 15000, // 2026 PEI BPA
    brackets: [
      { threshold: 33928,  rate: 0.095  },
      { threshold: 65820,  rate: 0.1347 },
      { threshold: 106890, rate: 0.166  },
      { threshold: 142250, rate: 0.1762 },
      { threshold: 200000, rate: 0.19   },
      { threshold: Infinity, rate: 0.20 }
    ]
  },
  [Province.NL]: {
    id: 'NL',
    name: Province.NL,
    dailyOtThreshold: null,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    basicPersonalAmount: 13094, // 2026 Newfoundland & Labrador BPA
    brackets: [
      { threshold: 44678,    rate: 0.087  },
      { threshold: 89354,    rate: 0.145  },
      { threshold: 159528,   rate: 0.158  },
      { threshold: 223340,   rate: 0.178  },
      { threshold: 285319,   rate: 0.198  },
      { threshold: 570638,   rate: 0.208  },
      { threshold: 1141275,  rate: 0.213  },
      { threshold: Infinity, rate: 0.218 }
    ]
  },
  [Province.YT]: {
    id: 'YT',
    name: Province.YT,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    basicPersonalAmount: 16452, // 2026 Yukon BPA (tracks federal max)
    brackets: [
      { threshold: 58523,   rate: 0.064 },
      { threshold: 117045,  rate: 0.09  },
      { threshold: 181440,  rate: 0.109 },
      { threshold: 500000,  rate: 0.128 },
      { threshold: Infinity, rate: 0.15 }
    ]
  },
  [Province.NT]: {
    id: 'NT',
    name: Province.NT,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    basicPersonalAmount: 18198, // 2026 NWT BPA
    brackets: [
      { threshold: 53003,  rate: 0.059  },
      { threshold: 106009, rate: 0.086  },
      { threshold: 172346, rate: 0.122  },
      { threshold: Infinity, rate: 0.1405 }
    ]
  },
  [Province.NU]: {
    id: 'NU',
    name: Province.NU,
    dailyOtThreshold: 8,
    weeklyOtThreshold: 40,
    otRate: 1.5,
    basicPersonalAmount: 19659, // 2026 Nunavut BPA
    brackets: [
      { threshold: 55801,  rate: 0.04  },
      { threshold: 111602, rate: 0.07  },
      { threshold: 181439, rate: 0.09  },
      { threshold: Infinity, rate: 0.115 }
    ]
  },
};

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
