/**
 * audit:reverse — the net → gross solver must agree with the engine.
 *
 * For every jurisdiction, pay frequency and a range of targets, the salary it
 * returns must reach the target take-home and one dollar less must not. Any
 * inverse that is not the engine (a hand-written formula, a stale cache) fails.
 */
import { grossForNet, netForGross } from '../utils/reverseSalary';
import { PROVINCIAL_DATA } from '../constants';
import { PayFrequency, type AnnualSalaryInputs } from '../types';

const bad: string[] = [];
let n = 0;
const freqs = [PayFrequency.BI_WEEKLY, PayFrequency.MONTHLY];
for (const province of Object.keys(PROVINCIAL_DATA)) {
  for (const payFrequency of freqs) {
    const base: AnnualSalaryInputs = { province, annualSalary: 0, payFrequency };
    for (let target = 15_000; target <= 250_000; target += 7_500) {
      n++;
      const g = grossForNet(target, base);
      if (g === null) { bad.push(`${province} ${payFrequency} net ${target}: no salary found`); continue; }
      const at = netForGross(g, base);
      const below = netForGross(g - 1, base);
      if (!(at >= target && below < target)) bad.push(`${province} ${payFrequency} net ${target}: gross ${g} gives ${at.toFixed(2)}, gross ${g - 1} gives ${below.toFixed(2)}`);
    }
  }
}
// With extras: RRSP and a bonus (per pay period, as the form asks) must be honoured too.
const extra: AnnualSalaryInputs = { province: 'Ontario', annualSalary: 0, payFrequency: PayFrequency.BI_WEEKLY,
  rrspType: 'percent', rrspPercentage: 5, additionalIncome: { statHolidayPay: 0, sickPay: 0, bonus: 200, otherIncome: 0 } } as AnnualSalaryInputs;
for (const target of [40_000, 60_000, 90_000]) {
  n++;
  const g = grossForNet(target, extra)!;
  if (!(netForGross(g, extra) >= target && netForGross(g - 1, extra) < target)) bad.push(`Ontario with RRSP+bonus net ${target}: gross ${g}`);
}
if (bad.length) {
  console.error(`REVERSE AUDIT FAIL — ${bad.length} of ${n}:\n  ` + bad.slice(0, 10).join('\n  '));
  process.exit(1);
}
console.log(`REVERSE AUDIT PASS — ${n} targets across ${Object.keys(PROVINCIAL_DATA).length} jurisdictions: every salary is the exact dollar that reaches the take-home.`);
