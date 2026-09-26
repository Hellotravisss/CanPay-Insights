/**
 * audit:claimcodes — the engine against every T4032 claim-code column (2–10).
 *
 * audit:engine checks claim code 1 (basic personal amount only). Anyone whose
 * TD1 claims more — the spouse amount above all — is withheld under codes
 * 2–10, which CRA computes at the midpoint of each code's total-claim range
 * (tests/golden/t4032-2026-claimcodes.json, built by buildClaimCodeFixture.py).
 * The engine is given that total claim and must land within $0.10 of CRA.
 *
 * Provincial columns are skipped for BC, NL and PE: they changed rates on
 * July 1, so their January table is not the annual answer (audit:engine
 * handles that with the Jan/Jul mean for code 1). Quebec's provincial tax is
 * Revenu Québec's and not in T4032. Their federal columns are all checked.
 */
import { readFileSync } from 'node:fs';
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province } from '../types';
import { TAX_YEAR } from '../constants';

const fx = JSON.parse(readFileSync(`tests/golden/t4032-${TAX_YEAR}-claimcodes.json`, 'utf8'));
const P: Record<string, string> = { AB: Province.AB, BC: Province.BC, MB: Province.MB, NB: Province.NB, NL: Province.NL, NS: Province.NS,
  NT: Province.NT, NU: Province.NU, ON: Province.ON, PE: Province.PE, QC: Province.QC, SK: Province.SK, YT: Province.YT };
const MIDYEAR = new Set(['BC', 'NL', 'PE']);
const TOLERANCE = 0.1;
const mid = (r: number[]) => (r[0] + r[1]) / 2;

let checked = 0, failures = 0;
const lines: string[] = [];
for (const [code, t] of Object.entries(fx.tables) as [string, any][]) {
  for (const kind of ['federal', 'provincial'] as const) {
    if (kind === 'provincial' && (code === 'QC' || MIDYEAR.has(code))) continue;
    const chart: number[][] = kind === 'federal' ? fx.charts.federal : fx.charts[code];
    let bad = 0, n = 0, worst = 0, worstAt = '';
    for (const [lo, hi, cols] of t[kind] as [number, number, number[]][]) {
      const pay = (lo + hi) / 2;
      for (let k = 2; k <= 10; k++) {
        const claim = mid(chart[k - 1]);
        const r = calculateFromAnnualSalary({ province: P[code], annualSalary: pay * 26, payFrequency: PayFrequency.BI_WEEKLY,
          totalClaims: kind === 'federal' ? { federal: claim } : { provincial: claim } } as any);
        const got = kind === 'federal' ? r.federalTax : r.provincialTax;
        const d = got - cols[k];
        n++; checked++;
        if (Math.abs(d) > Math.abs(worst)) { worst = d; worstAt = `CC${k} $${pay.toFixed(0)}/pay`; }
        if (Math.abs(d) > TOLERANCE) bad++;
      }
    }
    failures += bad;
    lines.push(`${code} ${kind.padEnd(10)} rows×codes ${String(n).padStart(4)}  over tolerance: ${String(bad).padStart(4)}  worst ${worst >= 0 ? '+' : ''}${worst.toFixed(2)} at ${worstAt}`);
  }
}
if (process.argv.includes('--report') || failures) console.log(lines.join('\n'));
console.log(failures
  ? `CLAIM CODES GOLDEN FAIL — ${failures} of ${checked} cells differ from CRA by more than $${TOLERANCE}`
  : `CLAIM CODES GOLDEN PASS — ${checked} cells of CRA's T4032 claim-code columns 2–10 reproduced`);
if (failures) process.exit(1);

// ── TD1 spouse amounts ─────────────────────────────────────────────────────
// Re-typed independently from the 2026 TD1 forms (not read from constants.ts),
// so a typo in either place fails here. Checked through the tax itself: the
// spouse amount lowers tax by exactly lowest-rate × amount while tax stays
// above zero and income is below the federal BPA phase-out.
const TD1: Record<string, { max: number; zeroAt: number } | 'bpa'> = {
  AB: 'bpa', BC: { max: 11317, zeroAt: 12449 }, MB: { max: 9134, zeroAt: 9134 }, NB: { max: 10709, zeroAt: 11781 },
  NL: { max: 9142, zeroAt: 10057 }, NS: { max: 11932, zeroAt: 12820 }, NT: 'bpa', NU: 'bpa',
  ON: { max: 11029, zeroAt: 12132 }, PE: { max: 12740, zeroAt: 14014 }, QC: { max: 18952, zeroAt: 18952 },
  SK: { max: 20381, zeroAt: 22419 }, YT: 'bpa',
};
const BPA: Record<string, number> = { AB: 22769, NT: 18198, NU: 19659, YT: 16452 };
const FED_BPA = 16452;
const FED_RATE = 0.14;
let spouseBad = 0, spouseN = 0;
const { PROVINCIAL_DATA } = await import('../constants');
for (const code of Object.keys(TD1)) {
  const rule = TD1[code];
  const provRate = PROVINCIAL_DATA[P[code]].brackets[0].rate;
  for (const s of [0, 500, 1000, 3000, 6000, 9000, 12000, 15000, 20000, 25000]) {
    const base = { province: P[code], annualSalary: 90000, payFrequency: PayFrequency.BI_WEEKLY } as any;
    const without = calculateFromAnnualSalary(base);
    const withS = calculateFromAnnualSalary({ ...base, spouseNetIncome: s });
    const fedAmt = Math.max(0, FED_BPA - s);
    const provAmt = rule === 'bpa' ? Math.max(0, BPA[code] - s) : Math.max(0, Math.min(rule.max, rule.zeroAt - s));
    // Quebec's federal tax carries the 16.5% abatement; its provincial credit rate is Quebec's own.
    const fedFactor = code === 'QC' ? 1 - 0.165 : 1;
    const fedDiff = (without.federalTax - withS.federalTax) * 26;
    const provDiff = (without.provincialTax - withS.provincialTax) * 26;
    spouseN += 2; checked += 2;
    // Ontario's surtax and health premium, and BC's and ON's reductions, move with tax: provincial is
    // checked as a lower bound (the credit is at least rate × amount) in those three provinces.
    const provExpected = provRate * provAmt;
    const fedOk = Math.abs(fedDiff - FED_RATE * fedAmt * fedFactor) < 1;
    const provOk = ['ON', 'BC'].includes(code) ? provDiff >= provExpected - 1 : Math.abs(provDiff - provExpected) < 1;
    if (!fedOk) { spouseBad++; lines.push(`spouse ${code} s=${s} federal: tax fell ${fedDiff.toFixed(2)}, TD1 says ${(FED_RATE * fedAmt * fedFactor).toFixed(2)}`); }
    if (!provOk) { spouseBad++; lines.push(`spouse ${code} s=${s} provincial: tax fell ${provDiff.toFixed(2)}, TD1 says ${provExpected.toFixed(2)}`); }
  }
}
failures += spouseBad;
console.log(spouseBad
  ? `SPOUSE AMOUNT FAIL — ${spouseBad} of ${spouseN}:\n  ` + lines.filter((l) => l.startsWith('spouse')).slice(0, 12).join('\n  ')
  : `SPOUSE AMOUNT PASS — ${spouseN} checks: federal and provincial spouse amounts match the 2026 TD1 forms for 13 jurisdictions`);
if (spouseBad) process.exit(1);
