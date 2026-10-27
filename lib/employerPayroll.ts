import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { simulatePays } from './capTimeline';
import { PayFrequency, Province, type AnnualSalaryInputs } from '../types';
import { EI_EMPLOYER_MULTIPLIER, QPIP_EMPLOYER_RATE, QPIP_EMPLOYER_MAX_CONTRIBUTION } from '../constants';

/**
 * What an employer withholds and remits on one employee's pay, and what the
 * employee costs them — the question "payroll calculator" searches ask.
 *
 * Income tax per pay comes from the engine (checked row by row against the CRA
 * T4032 tables by audit:engine). CPP/QPP, CPP2/QPP2, EI and QPIP are simulated
 * pay by pay from January with nothing deducted yet, the way a payroll system
 * does it: full deductions until each annual maximum, then none. The employer
 * matches CPP/QPP and pays 1.4× EI; in Quebec it also pays its own QPIP rate.
 *
 * Basic personal amounts only (TD1 claim code 1). Not included: provincial
 * employer health taxes (Ontario EHT, BC EHT…), Quebec HSF/CNESST/WSDRF,
 * workers' compensation, vacation pay, benefits.
 */
export const PERIODS: Record<string, number> = {
  [PayFrequency.WEEKLY]: 52,
  [PayFrequency.BI_WEEKLY]: 26,
  [PayFrequency.SEMI_MONTHLY]: 24,
  [PayFrequency.MONTHLY]: 12,
};

export type PayLines = {
  federalTax: number; provincialTax: number;
  cpp: number; cpp2: number; ei: number; qpip: number;
  employerCpp: number; employerCpp2: number; employerEi: number; employerQpip: number;
};

export type EmployerPayroll = {
  province: string;
  periods: number;
  grossPerPay: number;
  /** The first pay of the year: every deduction running, none capped yet. */
  firstPay: PayLines & { netPay: number; remitCra: number; remitQuebec: number; employerCost: number };
  /** The whole year, caps applied. */
  year: PayLines & { gross: number; netPay: number; employerCost: number };
  /** Pay number on which each deduction reaches its maximum (deductions stop after it). */
  caps: Array<{ kind: 'cpp' | 'cpp2' | 'ei' | 'qpip'; pay: number }>;
  /** First pay with CPP2/QPP2 (null if earnings never pass the first ceiling). */
  cpp2Starts: number | null;
};

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const cents = (v: number) => Math.round(v * 100) / 100;

export function employerPayroll(province: string, grossPerPay: number, payFrequency: PayFrequency): EmployerPayroll | null {
  const n = PERIODS[payFrequency];
  if (!n || !(grossPerPay > 0)) return null;
  const isQuebec = province === Province.QC;
  const annual = grossPerPay * n;
  const r = calculateFromAnnualSalary({ province, annualSalary: annual, payFrequency } as AnnualSalaryInputs);
  const sim = simulatePays(annual, n, isQuebec);

  const qpipErAt = (pay: number, sofar: number) => Math.min(pay * QPIP_EMPLOYER_RATE, QPIP_EMPLOYER_MAX_CONTRIBUTION - sofar);
  const qpipEr: number[] = [0];
  if (isQuebec) {
    let so = 0;
    for (let i = 1; i <= n; i++) { const q = Math.max(0, qpipErAt(grossPerPay, so)); qpipEr.push(q); so += q; }
  }

  // Every line on a pay stub is rounded to the cent, and totals add the rounded
  // lines — otherwise the remittance shown is a cent off the rows above it.
  const first = {
    federalTax: cents(r.federalTax), provincialTax: cents(r.provincialTax),
    cpp: cents(sim.cpp[1]), cpp2: cents(sim.cpp2[1]), ei: cents(sim.ei[1]), qpip: cents(sim.qpip[1]),
    employerCpp: cents(sim.cpp[1]), employerCpp2: cents(sim.cpp2[1]),
    employerEi: cents(cents(sim.ei[1]) * EI_EMPLOYER_MULTIPLIER), employerQpip: isQuebec ? cents(qpipEr[1]) : 0,
  };
  // Who receives what: outside Quebec everything goes to the CRA. In Quebec the
  // CRA gets federal tax and EI; Revenu Québec gets Quebec tax, QPP and QPIP.
  const toCra = first.federalTax + first.ei + first.employerEi + (isQuebec ? 0 : first.provincialTax + first.cpp + first.cpp2 + first.employerCpp + first.employerCpp2);
  const toQuebec = isQuebec ? first.provincialTax + first.cpp + first.cpp2 + first.employerCpp + first.employerCpp2 + first.qpip + first.employerQpip : 0;

  const y = {
    federalTax: r.federalTax * n, provincialTax: r.provincialTax * n,
    cpp: sum(sim.cpp), cpp2: sum(sim.cpp2), ei: sum(sim.ei), qpip: sum(sim.qpip),
    employerCpp: sum(sim.cpp), employerCpp2: sum(sim.cpp2),
    employerEi: sum(sim.ei) * EI_EMPLOYER_MULTIPLIER, employerQpip: sum(qpipEr),
  };
  const firstCpp2 = sim.cpp2.findIndex((v, i) => i > 0 && v > 0);

  return {
    province, periods: n, grossPerPay,
    firstPay: {
      ...first,
      netPay: grossPerPay - first.federalTax - first.provincialTax - first.cpp - first.cpp2 - first.ei - first.qpip,
      remitCra: toCra, remitQuebec: toQuebec,
      employerCost: grossPerPay + first.employerCpp + first.employerCpp2 + first.employerEi + first.employerQpip,
    },
    year: {
      ...y, gross: annual,
      netPay: annual - y.federalTax - y.provincialTax - y.cpp - y.cpp2 - y.ei - y.qpip,
      employerCost: annual + y.employerCpp + y.employerCpp2 + y.employerEi + y.employerQpip,
    },
    caps: sim.capped.filter((c) => c.period < n).map((c) => ({ kind: c.kind, pay: c.period })),
    cpp2Starts: firstCpp2 > 0 ? firstCpp2 : null,
  };
}
