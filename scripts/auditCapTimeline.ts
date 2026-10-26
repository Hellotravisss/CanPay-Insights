/**
 * audit:captimeline — the "your cheques grow near year-end" card tells the truth.
 *
 * Found 2026-10-26: at $100,000 in Ontario the card said final cheques were
 * $437 larger than January's; the real difference is $284. Each bump was the
 * deduction that stops, ignoring CPP2 that starts on the same cheque.
 *
 * Three checks, for every salary from $30,000 to $300,000 (step $2,500), in and
 * out of Quebec, bi-weekly:
 *   1. The simulated cheques add up to the engine's annual CPP/CPP2/QPIP and EI
 *      (the engine is itself checked against the CRA tables by audit:engine).
 *   2. "Final cheques are about $X larger than January's" is exactly
 *      deductions(first cheque) − deductions(last cheque).
 *   3. When nothing is still capping on the last cheque, the per-event bumps add
 *      up to that total — so no line on the card double-counts another.
 * Plus the two cases the review worked out by hand.
 */
import { buildCapTimeline } from '../lib/capTimeline';
import { getSalaryFigures } from '../lib/salaryFigures';
import * as C from '../constants';

const fails: string[] = [];
let checked = 0;
const near = (a: number, b: number, tol: number) => Math.abs(a - b) <= tol;

for (const [slug, qc] of [['ontario', false], ['quebec', true]] as const) {
  for (let g = 30000; g <= 300000; g += 2500) {
    const t = buildCapTimeline(g, 26, qc);
    if (!t) continue;
    checked++;
    const D = t.deductionsByPeriod;
    const f = getSalaryFigures(g, slug);
    const annual = D.slice(1).reduce((s, v) => s + v, 0);
    const engine = f.pensionContribution + f.eiPremium; // pensionContribution includes CPP2 and, in Quebec, QPIP
    if (!near(annual, engine, 26)) fails.push(`${slug} $${g}: cheques add up to ${annual.toFixed(2)}, engine says ${engine.toFixed(2)}`);
    if (!near(t.lastChequeBump, D[1] - D[26], 0.01)) fails.push(`${slug} $${g}: total ${t.lastChequeBump} ≠ first − last ${(D[1] - D[26]).toFixed(2)}`);
    const steadyEnd = near(D[25], D[26], 0.01);
    const sum = t.events.reduce((s, e) => s + e.perChequeBump, 0);
    if (steadyEnd && !near(sum, t.lastChequeBump, 0.05)) fails.push(`${slug} $${g}: bumps add to ${sum.toFixed(2)}, total says ${t.lastChequeBump}`);
  }
}

// Worked by hand from the rates, as the review did. ON $100k bi-weekly, pay $3,846.15:
// EI stops (−1.63% = $62.69) and CPP stops (−5.95% above the $134.62 exemption = $220.84)
// while CPP2 starts (+4% = $153.85): +$129.68 from October; then CPP2 stops: +$153.85.
const pay = 100000 / 26;
const ei = pay * C.EI_RATE, cpp = (pay - C.CPP_EXEMPTION / 26) * C.CPP_RATE, cpp2 = pay * C.CPP2_RATE;
const on = buildCapTimeline(100000, 26, false)!;
const qc = buildCapTimeline(85000, 26, true)!;
if (!near(on.events[0]?.perChequeBump ?? 0, ei + cpp - cpp2, 0.02)) fails.push(`ON $100k first step ${on.events[0]?.perChequeBump}, by hand ${(ei + cpp - cpp2).toFixed(2)}`);
if (!near(on.events[1]?.perChequeBump ?? 0, cpp2, 0.02)) fails.push(`ON $100k CPP2 step ${on.events[1]?.perChequeBump}, by hand ${cpp2.toFixed(2)}`);
if (!near(on.lastChequeBump, ei + cpp, 0.02)) fails.push(`ON $100k total ${on.lastChequeBump}, by hand ${(ei + cpp).toFixed(2)} (the review: ≈ $284, card said $437)`);
if (!near(qc.lastChequeBump, 109, 1)) fails.push(`QC $85k total ${qc.lastChequeBump}, expected ≈ 109 (card said $240)`);

if (fails.length) {
  console.log(`CAP TIMELINE AUDIT FAIL — ${fails.length}:\n  ` + fails.join('\n  '));
  process.exit(1);
}
console.log(`CAP TIMELINE AUDIT PASS — ${checked} salary/province cases: cheques match the engine's annual totals and every figure on the card is a real cheque difference.`);
