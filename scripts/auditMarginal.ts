/**
 * Build gate: every marginal tax rate the site shows must agree with the engine.
 *
 * Why this exists. On 2026-09-22 a publisher reviewing the widget found that
 * the tax report showed Ontario's marginal rate at $100,000 as 19.05% while
 * take-home actually fell by 31.5% of each extra dollar. The rate came from a
 * hand-written bracket walk in utils/taxOptimizer.ts that read each bracket's
 * upper limit as its lower bound and never applied a surtax. The golden test
 * could not see it: it checks the engine, and this was a second formula beside
 * the engine. 90 of 91 province × income cells were more than half a point off,
 * and every RRSP "tax saved" figure built on it was understated.
 *
 * The check is independent of how calculateMarginalRate is written: above every
 * payroll ceiling (CPP2 $85,000, EI $68,900, QPIP $103,000 in 2026) the only
 * thing a raise changes is income tax, so the rate must equal the fall in
 * take-home per extra dollar. Below the ceilings the two legitimately differ
 * by the payroll contribution, so those incomes are not compared.
 */
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { calculateMarginalRate } from '../utils/taxOptimizer';
import { PayFrequency, Province } from '../types';

const net = (p: string, i: number) =>
  calculateFromAnnualSalary({ province: p, annualSalary: i, payFrequency: PayFrequency.BI_WEEKLY } as never).netPayAnnual;

const INCOMES = [110000, 130000, 160000, 200000, 260000, 320000];
const TOL = 0.0005; // 0.05 of a percentage point

let failures = 0, checked = 0;
for (const [code, p] of Object.entries(Province)) {
  for (const inc of INCOMES) {
    const viaNet = 1 - (net(p, inc + 500) - net(p, inc - 500)) / 1000;
    const shown = calculateMarginalRate(inc, p).combined;
    checked++;
    if (Math.abs(viaNet - shown) > TOL) {
      failures++;
      console.log(`  ✗ ${code} $${inc.toLocaleString()}: shown ${(shown * 100).toFixed(2)}% but take-home falls ${(viaNet * 100).toFixed(2)}%`);
    }
  }
}

// A named case, so a regression reads as the bug it was.
const on = calculateMarginalRate(100000, Province.ON).combined;
checked++;
if (Math.abs(on - 0.3148) > TOL) {
  failures++;
  console.log(`  ✗ Ontario $100,000: ${(on * 100).toFixed(2)}%, expected 31.48% (20.5% federal + 9.15% × 1.2 surtax)`);
}

if (failures) {
  console.log(`\nMARGINAL AUDIT FAIL — ${failures} of ${checked} rates disagree with the engine.`);
  process.exit(1);
}
console.log(`MARGINAL AUDIT PASS — ${checked} rates agree with the engine to within 0.05 of a point.`);
