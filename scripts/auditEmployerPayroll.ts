/**
 * audit:employer — the employer payroll calculator (/payroll-calculator) agrees
 * with the CRA and with the engine.
 *
 *   1. First pay of the year, bi-weekly: employee CPP and EI equal the CRA's
 *      own CPP and EI tables (tests/golden/t4032-2026.json, every row), and
 *      Quebec EI equals the CRA's Quebec EI table.
 *   2. Whole year, every frequency, Ontario and Quebec, $15,000–$300,000:
 *      employee CPP+CPP2(+QPIP) and EI add up to the engine's annual figures.
 *   3. Employer side: CPP/CPP2 matched dollar for dollar, EI × 1.4, QPIP at
 *      0.602% to $620.06; remittances add up to every line withheld or owed.
 */
import { readFileSync } from 'node:fs';
import { employerPayroll, PERIODS } from '../lib/employerPayroll';
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province, type AnnualSalaryInputs } from '../types';
import * as C from '../constants';

type Row = [number, number, number];
const fx = JSON.parse(readFileSync('tests/golden/t4032-2026.json', 'utf8')) as { contributions: { cpp: Row[]; ei: Row[]; ei_qc: Row[] } };
const fails: string[] = [];
let checks = 0;
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;
const cents = (v: number) => Math.round(v * 100) / 100;

// 1. CRA tables, first pay of the year (nothing deducted yet).
for (const [label, rows, prov, line] of [
  ['CPP', fx.contributions.cpp, Province.ON, 'cpp'],
  ['EI', fx.contributions.ei, Province.ON, 'ei'],
  ['EI (Quebec)', fx.contributions.ei_qc, Province.QC, 'ei'],
] as const) {
  for (const [lo, hi, want] of rows) {
    if (hi <= 0) continue;
    const pay = (lo + hi) / 2;
    const p = employerPayroll(prov, pay, PayFrequency.BI_WEEKLY)!;
    const got = cents(p.firstPay[line]);
    checks++;
    if (!near(got, want, 0.011)) fails.push(`${label} table: pay $${pay.toFixed(2)} → ${got}, CRA ${want}`);
  }
}

// 2 + 3. Whole year against the engine; employer side; remittances.
for (const prov of [Province.ON, Province.QC, Province.AB, Province.BC]) {
  for (const freq of Object.keys(PERIODS) as PayFrequency[]) {
    const n = PERIODS[freq];
    for (let annual = 15000; annual <= 300000; annual += 5000) {
      const p = employerPayroll(prov, annual / n, freq)!;
      const r = calculateFromAnnualSalary({ province: prov, annualSalary: annual, payFrequency: freq } as AnnualSalaryInputs);
      const y = p.year;
      checks += 6;
      // engine cppDeduction includes QPIP in Quebec
      if (!near(y.cpp + y.cpp2 + y.qpip, r.cppDeduction * n, 1)) fails.push(`${prov} ${freq} $${annual}: CPP/QPP(+QPIP) year ${(y.cpp + y.cpp2 + y.qpip).toFixed(2)} vs engine ${(r.cppDeduction * n).toFixed(2)}`);
      if (!near(y.ei, r.eiDeduction * n, 1)) fails.push(`${prov} ${freq} $${annual}: EI year ${y.ei.toFixed(2)} vs engine ${(r.eiDeduction * n).toFixed(2)}`);
      if (!near(y.employerCpp + y.employerCpp2, y.cpp + y.cpp2, 0.001)) fails.push(`${prov} ${freq} $${annual}: employer CPP not matched`);
      if (!near(y.employerEi, y.ei * C.EI_EMPLOYER_MULTIPLIER, 0.01)) fails.push(`${prov} ${freq} $${annual}: employer EI not 1.4×`);
      const qpipEr = prov === Province.QC ? Math.min(annual * C.QPIP_EMPLOYER_RATE, C.QPIP_EMPLOYER_MAX_CONTRIBUTION) : 0;
      if (!near(y.employerQpip, qpipEr, 0.05)) fails.push(`${prov} ${freq} $${annual}: employer QPIP ${y.employerQpip.toFixed(2)} vs ${qpipEr.toFixed(2)}`);
      const f = p.firstPay;
      const owed = f.federalTax + f.provincialTax + f.cpp + f.cpp2 + f.ei + f.qpip + f.employerCpp + f.employerCpp2 + f.employerEi + f.employerQpip;
      if (!near(f.remitCra + f.remitQuebec, owed, 0.001)) fails.push(`${prov} ${freq} $${annual}: remittances ${(f.remitCra + f.remitQuebec).toFixed(2)} ≠ owed ${owed.toFixed(2)}`);
    }
  }
}

if (fails.length) {
  console.log(`EMPLOYER PAYROLL AUDIT FAIL — ${fails.length} of ${checks}:\n  ` + fails.slice(0, 25).join('\n  '));
  process.exit(1);
}
console.log(`EMPLOYER PAYROLL AUDIT PASS — ${checks} checks: first-pay CPP and EI equal the CRA tables row by row; the year matches the engine; employer CPP matched, EI × 1.4, QPIP 0.602%; remittances add up.`);
