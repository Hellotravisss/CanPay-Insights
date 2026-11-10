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
import { generateTaxOptimization, calculateRRSPScenarios, incomeTaxAt, calculateMarginalRate, estimatePensionAdjustment } from '../utils/taxOptimizer';
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, type AnnualSalaryInputs } from '../types';
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

// ── Pension (RPP) members: the pension adjustment (PA, T4 box 52) comes off RRSP room ──
// We only see the employee's own contribution. The estimate assumes the employer puts in
// as much again (a matched DC plan; close to the PA of a typical 1.5–2% DB plan). For an
// unmatched plan that overstates the PA and understates the room — the safe side, since
// CRA charges 1% a month on an RRSP over-contribution beyond $2,000.
const paCase = (inc: number, p: string, pen: number) => {
  const o = generateTaxOptimization(inc, p, pen);
  return o.rrsp as { recommendedAmount: number; maxDeductible: number; taxSavings: number; pensionAdjustment: number };
};
const penTax = (inc: number, p: string, pen: number) => {
  const r = calculateFromAnnualSalary({ province: p, annualSalary: inc, payFrequency: PayFrequency.BI_WEEKLY,
    deductions: { ltdPremium: 0, unionDues: 0, otherDeductions: 0, pension: pen / 26 } } as AnnualSalaryInputs);
  return (r.federalTax + r.provincialTax) * 26;
};
{
  // The Manitoba pay stub (2026-11-07): $1,520.26 bi-weekly, $60.81 RPP each cheque.
  const inc = 1520.26 * 26, pen = 60.81 * 26;
  const r = paCase(inc, Province.MB, pen);
  checks++;
  if (estimatePensionAdjustment(pen) !== Math.round(pen * 2)) failures.push(`PA estimate for $${pen.toFixed(2)} RPP is ${estimatePensionAdjustment(pen)}, expected ${Math.round(pen * 2)}`);
  checks++;
  const want = Math.floor(inc * 0.18) - Math.round(pen * 2);
  if (r.maxDeductible !== want) failures.push(`MB stub: RRSP room ${r.maxDeductible}, expected 18% − PA = ${want}`);
  checks++;
  if (r.recommendedAmount > r.maxDeductible) failures.push(`MB stub: recommends $${r.recommendedAmount}, above the room $${r.maxDeductible}`);
  checks++;
  if (r.pensionAdjustment !== Math.round(pen * 2)) failures.push(`MB stub: pensionAdjustment ${r.pensionAdjustment} not reported`);
}
for (const p of Object.values(Province) as string[]) {
  for (const [inc, share] of [[45000, 0.04], [75000, 0.06], [120000, 0.09], [200000, 0.05]] as const) {
    const pen = Math.round(inc * share);
    const r = paCase(inc, p, pen);
    const cap = Math.max(0, Math.min(Math.floor(inc * 0.18), RRSP_DOLLAR_LIMIT) - Math.round(pen * 2));
    checks++;
    if (r.maxDeductible !== cap) failures.push(`${p} $${inc} RPP ${share * 100}%: room ${r.maxDeductible}, expected ${cap}`);
    checks++;
    if (r.recommendedAmount < 0 || r.recommendedAmount > r.maxDeductible) failures.push(`${p} $${inc} RPP ${share * 100}%: recommends $${r.recommendedAmount} outside 0…${r.maxDeductible}`);
    // Savings are measured on income already reduced by the pension, by the engine itself.
    checks++;
    const truth = Math.max(0, Math.floor(penTax(inc, p, pen) - penTax(inc - r.recommendedAmount, p, pen)));
    if (Math.abs(r.taxSavings - truth) > 1) failures.push(`${p} $${inc} RPP ${share * 100}%: RRSP $${r.recommendedAmount} shown saving $${r.taxSavings}, engine with RPP says $${truth}`);
    for (const sc of calculateRRSPScenarios(inc, p, pen)) {
      checks++;
      if (sc.amount > r.maxDeductible) failures.push(`${p} $${inc} RPP: scenario $${sc.amount} above room $${r.maxDeductible}`);
      const t = Math.max(0, Math.floor(penTax(inc, p, pen) - penTax(inc - sc.amount, p, pen)));
      if (Math.abs(sc.taxSavings - t) > 1) failures.push(`${p} $${inc} RPP: scenario $${sc.amount} saving $${sc.taxSavings}, engine with RPP says $${t}`);
    }
  }
}
// No pension → exactly the old advice (the main loop above checks it against 18%).
checks++;
if (JSON.stringify(generateTaxOptimization(75000, Province.ON, 0)) !== JSON.stringify(generateTaxOptimization(75000, Province.ON)))
  failures.push('pension 0 changes the advice');

if (failures.length) {
  console.log(failures.slice(0, 40).map((f) => '  ✗ ' + f).join('\n'));
  console.log(`\nADVISOR AUDIT FAIL — ${failures.length} of ${checks} checks.`);
  process.exit(1);
}
console.log(`ADVISOR AUDIT PASS — ${checks} advisor figures agree with the engine and RRSP_DOLLAR_LIMIT, pension adjustment included.`);
