/**
 * Build gate: numbers that must agree, agree.
 *
 * The golden test proves the engine reproduces the CRA's tables. It does not
 * prove that the site's OTHER numbers agree with the engine, or with each
 * other — and that is exactly how an outside reviewer caught us on 2026-09-22:
 * the displayed marginal rate and the change in take-home should have been the
 * same number and were not. This gate runs that reviewer's method on
 * everything it can reach without a browser:
 *
 *   1. Take-home is gross minus deductions, to the cent.
 *   2. Per-pay-period figures × periods per year = the annual figure, for every
 *      pay frequency.
 *   3. Take-home never falls when gross pay rises.
 *   4. What the widget and the province salary pages show (lib/salaryFigures)
 *      is what the calculator's engine says for the same salary.
 *   5. Pay frequency changes the timing of withholding, not how much is
 *      withheld over a year: annualised deductions agree across frequencies
 *      within a tolerance that allows the CRA's per-period rounding.
 *
 * Anything that fails here is a page where two figures contradict each other.
 */
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import { PayFrequency, Province, type AnnualSalaryInputs } from '../types';

const PROVINCES = Object.values(Province) as string[];
const INCOMES = [5000, 16000, 30000, 45000, 58000, 60000, 68900, 74600, 80000, 85000, 100000, 103000, 120000, 150000, 181000, 220000, 260000, 400000];
const FREQS: [PayFrequency, number][] = [
  [PayFrequency.WEEKLY, 52], [PayFrequency.BI_WEEKLY, 26], [PayFrequency.SEMI_MONTHLY, 24], [PayFrequency.MONTHLY, 12],
];
const run = (province: string, annualSalary: number, payFrequency = PayFrequency.BI_WEEKLY) =>
  calculateFromAnnualSalary({ province, annualSalary, payFrequency } as AnnualSalaryInputs);

const failures: string[] = [];
const fail = (s: string) => { if (failures.length < 60) failures.push(s); else if (failures.length === 60) failures.push('… (more)'); };
let checks = 0;
const money = (n: number) => `$${n.toFixed(2)}`;

for (const p of PROVINCES) {
  for (const inc of INCOMES) {
    // 1 + 2: identity and annualisation, every frequency
    for (const [f, periods] of FREQS) {
      const r = run(p, inc, f);
      const perPeriodNet = r.netPayPerPeriod ?? r.netPayBiWeekly;
      const perPeriodGross = r.grossPayPerPeriod ?? r.grossPayBiWeekly;
      const ded = r.federalTax + r.provincialTax + r.cppDeduction + r.eiDeduction + (r.rrspDeduction ?? 0);
      checks++;
      if (Math.abs(perPeriodGross - ded - perPeriodNet) > 0.011)
        fail(`${p} $${inc} ${f}: net ${money(perPeriodNet)} ≠ gross ${money(perPeriodGross)} − deductions ${money(ded)}`);
      checks++;
      if (Math.abs(perPeriodNet * periods - r.netPayAnnual) > periods * 0.011)
        fail(`${p} $${inc} ${f}: ${periods} × per-period net ${money(perPeriodNet)} = ${money(perPeriodNet * periods)} but annual net says ${money(r.netPayAnnual)}`);
    }
    // 5: frequency must not change the year's total by more than rounding
    const base = run(p, inc).netPayAnnual;
    for (const [f] of FREQS) {
      const other = run(p, inc, f).netPayAnnual;
      checks++;
      if (Math.abs(other - base) > Math.max(30, inc * 0.004))
        fail(`${p} $${inc}: annual take-home ${money(other)} when paid ${f} vs ${money(base)} bi-weekly`);
    }
  }
  // 3: monotonic, fine grid
  let prev = -Infinity, prevInc = 0;
  for (let inc = 1000; inc <= 400000; inc += 250) {
    const n = run(p, inc).netPayAnnual;
    checks++;
    if (n < prev - 0.01) fail(`${p}: take-home FALLS from ${money(prev)} at $${prevInc} to ${money(n)} at $${inc}`);
    prev = n; prevInc = inc;
  }
}

// 4: the widget / salary pages vs the engine
for (const cfg of PROVINCE_SEO_CONFIGS) {
  for (const inc of INCOMES) {
    const fig = getSalaryFigures(inc, cfg.slug);
    const r = run(cfg.province, inc);
    checks++;
    if (Math.abs(fig.netAnnual - r.netPayAnnual) > 1)
      fail(`${cfg.slug} $${inc}: salary page/widget shows ${money(fig.netAnnual)}, engine says ${money(r.netPayAnnual)}`);
  }
}

if (failures.length) {
  console.log(failures.map((f) => '  ✗ ' + f).join('\n'));
  console.log(`\nCONSISTENCY AUDIT FAIL — ${failures.length >= 60 ? '60+' : failures.length} of ${checks} checks.`);
  process.exit(1);
}
console.log(`CONSISTENCY AUDIT PASS — ${checks} checks: identity, annualisation, frequency, monotonicity, widget = engine.`);
