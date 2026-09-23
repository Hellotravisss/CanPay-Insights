/**
 * Build gate: every figure the tax advisor shows agrees with the engine and
 * with the site's single statutory constants.
 *
 * Found by an outside review on 2026-09-22, all in components/GeminiAdvisor.tsx
 * and utils/taxOptimizer.ts, all invisible to the golden test because none of
 * it was the engine: a hand-typed copy of the 2025 federal brackets; an RRSP
 * limit of $31,950 while the rest of the site said $33,810; tax savings shown
 * as "contribution × marginal rate", which overstated a large contribution by
 * up to 25%; and advice to "contribute enough to drop into a lower bracket"
 * aimed at $90,000, which is not a bracket boundary anywhere.
 */
import { generateTaxOptimization, calculateRRSPScenarios, incomeTaxAt, calculateMarginalRate } from '../utils/taxOptimizer';
import { RRSP_DOLLAR_LIMIT } from '../constants';
import { Province } from '../types';

const INCOMES = [30000, 45000, 52000, 60000, 75000, 90000, 100000, 120000, 150000, 200000, 300000];
const failures: string[] = [];
let checks = 0;
const saved = (inc: number, p: string, amt: number) => Math.max(0, Math.floor(incomeTaxAt(inc, p) - incomeTaxAt(inc - amt, p)));

for (const p of Object.values(Province) as string[]) {
  for (const inc of INCOMES) {
    const o = generateTaxOptimization(inc, p);
    const r = o.rrsp as { recommendedAmount: number; maxDeductible: number; taxSavings: number; tierRecommendation?: string };

    checks++;
    const cap = Math.min(Math.floor(inc * 0.18), RRSP_DOLLAR_LIMIT);
    if (r.maxDeductible !== cap) failures.push(`${p} $${inc}: RRSP room ${r.maxDeductible}, expected min(18%, $${RRSP_DOLLAR_LIMIT}) = ${cap}`);

    checks++;
    const truth = saved(inc, p, r.recommendedAmount);
    if (Math.abs(r.taxSavings - truth) > 1) failures.push(`${p} $${inc}: RRSP $${r.recommendedAmount} shown saving $${r.taxSavings}, engine says $${truth}`);

    checks++;
    const f = o.fhsa as { recommendedAmount: number; taxSavings: number };
    const fTruth = saved(inc, p, f.recommendedAmount);
    if (Math.abs(f.taxSavings - fTruth) > 1) failures.push(`${p} $${inc}: FHSA $${f.recommendedAmount} shown saving $${f.taxSavings}, engine says $${fTruth}`);

    // "drop into a lower bracket" must be true when it is said
    if (r.tierRecommendation === 'tier.bracket') {
      checks++;
      const after = inc - r.recommendedAmount;
      const before = calculateMarginalRate(inc, p).combined, then = calculateMarginalRate(after - 500, p).combined;
      if (before - then < 0.009) failures.push(`${p} $${inc}: advice says the $${r.recommendedAmount} RRSP drops a bracket, but the rate goes ${(before * 100).toFixed(1)}% → ${(then * 100).toFixed(1)}%`);
    }

    for (const sc of calculateRRSPScenarios(inc, p)) {
      checks++;
      const t = saved(inc, p, sc.amount);
      if (Math.abs(sc.taxSavings - t) > 1) failures.push(`${p} $${inc}: scenario $${sc.amount} shown saving $${sc.taxSavings}, engine says $${t}`);
    }
  }
}

if (failures.length) {
  console.log(failures.slice(0, 40).map((f) => '  ✗ ' + f).join('\n'));
  console.log(`\nADVISOR AUDIT FAIL — ${failures.length} of ${checks} checks.`);
  process.exit(1);
}
console.log(`ADVISOR AUDIT PASS — ${checks} advisor figures agree with the engine and RRSP_DOLLAR_LIMIT.`);
