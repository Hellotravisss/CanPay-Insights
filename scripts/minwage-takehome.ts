// One-off data generation for the minimum-wage take-home article.
// Run: npx tsx scripts/minwage-takehome.ts
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency } from '../types';
import { MIN_WAGES } from './minWages';

const HOURS_PER_YEAR = 2080; // 40 hrs/week x 52 weeks

// General adult rates, their government sources and review dates live in
// scripts/minWages.ts, which `npm run audit:minwage` checks against each
// government's own page (weekly and on every deploy). Change rates there.


const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

const rows = MIN_WAGES.map(({ province, label, wage }) => {
  const gross = wage * HOURS_PER_YEAR;
  const r = calculateFromAnnualSalary({
    annualSalary: gross,
    province,
    payFrequency: PayFrequency.BI_WEEKLY,
  });
  const totalTax = (r.federalTax + r.provincialTax) * 26;
  return {
    label,
    wage,
    gross,
    netAnnual: r.netPayAnnual,
    netMonthly: r.netPayAnnual / 12,
    netHourly: r.netPayAnnual / HOURS_PER_YEAR,
    totalTax,
    cppEi: (r.cppDeduction + r.eiDeduction) * 26,
    deductionRate: r.totalDeductionsAnnual / gross,
  };
});

rows.sort((a, b) => b.netAnnual - a.netAnnual);

console.log('| Province | Min. wage | Gross (full-time) | Take-home / year | Take-home / month | Net hourly | Deductions kept by gov |');
console.log('| --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) {
  console.log(
    `| ${r.label} | $${r.wage.toFixed(2)} | ${money(r.gross)} | **${money(r.netAnnual)}** | ${money(r.netMonthly)} | $${r.netHourly.toFixed(2)} | ${(r.deductionRate * 100).toFixed(1)}% |`
  );
}
console.log('\nJSON:\n' + JSON.stringify(rows, null, 1));
