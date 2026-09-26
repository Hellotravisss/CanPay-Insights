/**
 * audit:taxdays — the "working days' pay to tax" line must add up.
 *
 * Its two parts (income tax; CPP/QPP/QPIP + EI) must together equal the
 * engine's total deductions for the year, to within a day of rounding. The
 * first version counted QPIP twice in Quebec (annual.cpp already holds it).
 */
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { taxDays, WORK_DAYS } from '../utils/taxDays';
import { PROVINCIAL_DATA } from '../constants';
import { PayFrequency } from '../types';

const bad: string[] = [];
let n = 0;
for (const province of Object.keys(PROVINCIAL_DATA)) {
  for (let g = 20_000; g <= 300_000; g += 10_000) {
    n++;
    const r = calculateFromAnnualSalary({ province, annualSalary: g, payFrequency: PayFrequency.BI_WEEKLY });
    const d = taxDays(r);
    const whole = (WORK_DAYS * r.totalDeductionsAnnual) / g;
    if (!d || Math.abs(d.tax + d.contributions - whole) > 1) bad.push(`${province} ${g}: ${d?.tax}+${d?.contributions} vs ${whole.toFixed(2)}`);
  }
}
if (bad.length) { console.error(`TAX DAYS AUDIT FAIL — ${bad.length} of ${n}:\n  ` + bad.slice(0, 8).join('\n  ')); process.exit(1); }
console.log(`TAX DAYS AUDIT PASS — ${n} salaries: income-tax days + contribution days = total deductions, within a day.`);
