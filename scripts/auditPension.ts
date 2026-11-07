/**
 * Build gate: employee pension (RPP) contributions, checked against CRA PDOC.
 *
 * An RPP contribution deducted at source comes off income before tax (T4127
 * factor F), exactly like union dues, but CPP and EI are still computed on the
 * full gross. The golden test cannot see this — T4032 tables have no pension
 * column — so the answer key here is CRA's Payroll Deductions Online Calculator
 * itself (apps.cra-arc.gc.ca/ebci/rhpd, version 2026-10-28), salary, bi-weekly,
 * paid 2026-11-13, claim code 1, run by hand on 2026-11-07.
 *
 * Found because a user in Manitoba compared the app with a pay stub that had a
 * "Pension" line the app could not enter (2026-11-07).
 *
 * Every case stays below EI's maximum insurable earnings on purpose: PDOC
 * computes one cheque with no year-to-date amounts, so above the annual EI and
 * CPP ceilings it deducts the full rate while the engine (annual) caps them.
 * That gap is about ceilings, not pensions, and would hide what this tests.
 */
import { calculateFromAnnualSalary, calculateSalary } from '../utils/taxEngine';
import { PayFrequency, Province, type CalculationResult } from '../types';

const failures: string[] = [];
let checks = 0;
// PDOC is exact to the cent (no table rounding), so the bar is tighter than
// the golden test's 10 cents.
const expect = (label: string, got: number, want: number, tol = 0.02) => {
  checks++;
  if (Math.abs(got - want) > tol) failures.push(`${label}: got ${got.toFixed(2)}, PDOC ${want.toFixed(2)}`);
};

type Case = { label: string; province: Province; gross: number; pension: number; unionDues?: number;
  pdoc: { federal: number; provincial: number | null; cpp: number; ei: number; net: number | null } };
const CASES: Case[] = [
  { label: 'MB $1,520.25, RPP 45.61', province: Province.MB, gross: 1520.25, pension: 45.61,
    pdoc: { federal: 94.77, provincial: 82.13, cpp: 82.45, ei: 24.78, net: 1190.51 } },
  { label: 'ON $2,400, RPP 216 + union dues 25', province: Province.ON, gross: 2400, pension: 216, unionDues: 25,
    pdoc: { federal: 181.24, provincial: 100.69, cpp: 134.79, ei: 39.12, net: 1703.16 } },
  { label: 'AB $2,200, RPP 180', province: Province.AB, gross: 2200, pension: 180,
    pdoc: { federal: 163.91, provincial: 78.84, cpp: 122.89, ei: 35.86, net: 1618.50 } },
  // PDOC leaves Quebec income tax to Revenu Québec, and reports QPP without QPIP.
  { label: 'QC $2,500, RPP 150 (federal, QPP, EI)', province: Province.QC, gross: 2500, pension: 150,
    pdoc: { federal: 175.62, provincial: null, cpp: 149.02, ei: 32.50, net: null } },
];

const deductions = (c: Case) => ({ ltdPremium: 0, unionDues: c.unionDues ?? 0, otherDeductions: 0, pension: c.pension });

// Every row the results screen lists must add up to gross − net.
const rowsAddUp = (label: string, r: CalculationResult) => {
  const rows = r.federalTax + r.provincialTax + r.cppDeduction + r.eiDeduction + (r.rrspDeduction ?? 0)
    + (r.pensionDeduction ?? 0) + (r.otherDeductions ?? 0);
  expect(`${label}: rows add up to gross − net`, rows, r.grossPayBiWeekly - r.netPayBiWeekly, 0.005);
};

for (const c of CASES) {
  const r = calculateFromAnnualSalary({ province: c.province, annualSalary: c.gross * 26, payFrequency: PayFrequency.BI_WEEKLY,
    deductions: deductions(c) } as never);
  expect(`${c.label} federal tax`, r.federalTax, c.pdoc.federal);
  if (c.pdoc.provincial !== null) expect(`${c.label} provincial tax`, r.provincialTax, c.pdoc.provincial);
  expect(`${c.label} CPP/QPP`, r.cppDeduction - (r.qpipDeduction ?? 0), c.pdoc.cpp);
  expect(`${c.label} EI`, r.eiDeduction, c.pdoc.ei);
  if (c.pdoc.net !== null) expect(`${c.label} net`, r.netPayBiWeekly, c.pdoc.net);
  expect(`${c.label} pension row`, r.pensionDeduction ?? 0, c.pension, 0.005);
  rowsAddUp(c.label, r);
}

// Hourly mode reaches the same answer: $20.27 × 75 h is the Manitoba case.
{
  const r = calculateSalary({
    province: Province.MB, hourlyWage: 20.27,
    shift: { startTime: '09:00', endTime: '17:00', unpaidBreakMinutes: 30, daysActive: [false, true, true, true, true, true, false] },
    premium: { enabled: false, ratePerHour: 0, startTime: '00:00', endTime: '00:00' },
    deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0, pension: 45.61 },
  } as never);
  expect('hourly MB federal tax', r.federalTax, 94.77);
  expect('hourly MB provincial tax', r.provincialTax, 82.13);
  expect('hourly MB net', r.netPayBiWeekly, 1190.51);
  rowsAddUp('hourly MB', r);
}

// The pay stub that started this: Manitoba, $20.27 × 75 h, a 4% pension.
// Stub: tax 173.13 (federal + provincial), CPP 82.45, EI 24.78, pension 60.81,
// net 1,179.09 on a gross of 1,520.26 (the employer rounds hours to the cent).
{
  const r = calculateFromAnnualSalary({ province: Province.MB, annualSalary: 1520.26 * 26, payFrequency: PayFrequency.BI_WEEKLY,
    deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0, pension: 60.81 } } as never);
  expect('MB pay stub: income tax', r.federalTax + r.provincialTax, 173.13);
  expect('MB pay stub: CPP', r.cppDeduction, 82.45);
  expect('MB pay stub: EI', r.eiDeduction, 24.78);
  expect('MB pay stub: net', r.netPayBiWeekly, 1179.09);
}

// No pension entered (and settings saved before the field existed) changes nothing.
{
  const base = { province: Province.ON, annualSalary: 60000, payFrequency: PayFrequency.BI_WEEKLY } as const;
  const none = calculateFromAnnualSalary(base as never);
  const old = calculateFromAnnualSalary({ ...base, deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0 } } as never);
  expect('no deductions vs pre-pension saved settings: net', old.netPayAnnual, none.netPayAnnual, 0.001);
  expect('no pension: pension row', none.pensionDeduction ?? 0, 0, 0);
}

if (failures.length) {
  console.log(failures.map((f) => '  ✗ ' + f).join('\n'));
  console.log(`\nPENSION AUDIT FAIL — ${failures.length} of ${checks}.`);
  process.exit(1);
}
console.log(`PENSION AUDIT PASS — ${checks} checks: RPP against CRA PDOC in MB, ON, AB and QC (federal), a real Manitoba pay stub, hourly mode, rows add up.`);
