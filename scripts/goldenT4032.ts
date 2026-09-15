/**
 * Golden test: the engine against CRA's own published withholding.
 *
 * Every prior engine audit checked the engine's CONSTANTS, or checked the
 * site's text against the engine. Neither can catch a missing formula step:
 * the engine left out the Canada employment amount and mistreated enhanced
 * CPP from launch until 2026-09-15 with every constant correct. This compares
 * the engine's OUTPUT, row by row, with the T4032 tables CRA publishes for
 * employers — the answer key, computed by CRA, independent of how we read
 * the rules.
 *
 * Fixture: tests/golden/t4032-<year>.json, built by scripts/buildT4032Fixture.py
 * from the PDFs the "Fetch T4032 tables" workflow downloads. Claim code 1 =
 * basic personal amount only, which is what the calculator models. Each row
 * is a bi-weekly pay range; CRA computes it at the range's midpoint.
 *
 *   npx tsx scripts/goldenT4032.ts            # gate: exit 1 on any failure
 *   npx tsx scripts/goldenT4032.ts --report   # print worst rows per table
 */
import { readFileSync } from 'node:fs';
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province } from '../types';
import { TAX_YEAR } from '../constants';

const P: Record<string, Province> = {
  AB: Province.AB, BC: Province.BC, MB: Province.MB, NB: Province.NB, NL: Province.NL, NS: Province.NS,
  NT: Province.NT, NU: Province.NU, ON: Province.ON, PE: Province.PE, QC: Province.QC, SK: Province.SK, YT: Province.YT,
};
// CRA rounds each table entry to the nearest 5 cents and computes at the
// range midpoint; the engine is exact. A cent-level gap is rounding; anything
// beyond this is a modelling difference and fails the build.
const TOLERANCE = 0.1;

type Row = [number, number, number];
const fixture = JSON.parse(readFileSync(`tests/golden/t4032-${TAX_YEAR}.json`, 'utf8')) as {
  editions: Record<string, Record<string, { federal?: Row[]; provincial?: Row[] }>>;
  contributions?: { cpp?: Row[]; ei?: Row[]; ei_qc?: Row[] };
};

// Where a province changed rates on July 1 (BC, NL, PE in 2026), CRA
// publishes two tables: January withholds at the old rate, July at a prorated
// catch-up rate for the rest of the year. Neither is the annual figure; a
// worker paid all year has half the year withheld from each, so the annual
// answer key is the MEAN of the two editions for the same pay range.
const report = process.argv.includes('--report');
let failures = 0, checked = 0;
const lines: string[] = [];
const jan = fixture.editions.january ?? {};
const jul = fixture.editions.july ?? {};
for (const [code, tables] of Object.entries(jan)) {
  for (const kind of ['federal', 'provincial'] as const) {
    const rows = tables[kind];
    if (!rows?.length) continue;
    const julRows = jul[code]?.[kind];
    // The two editions do not always use the same pay ranges, so the July
    // value at a January midpoint is read by linear interpolation between the
    // July rows' midpoints (the tables are piecewise linear in pay).
    const julPts = (julRows ?? []).map(([lo, hi, v]) => [(lo + hi) / 2, v] as [number, number]);
    const julAt = (m: number): number | undefined => {
      if (!julPts.length || m < julPts[0][0] || m > julPts[julPts.length - 1][0]) return undefined;
      let i = julPts.findIndex(([x]) => x >= m);
      if (julPts[i][0] === m) return julPts[i][1];
      const [x0, y0] = julPts[i - 1], [x1, y1] = julPts[i];
      return y0 + ((y1 - y0) * (m - x0)) / (x1 - x0);
    };
    const key = julRows ? 'Jan/Jul mean' : 'January';
    let maxDiff = 0, maxAt = 0, bad = 0, n = 0;
    for (const [lo, hi, janValue] of rows) {
      const julValue = julRows ? julAt((lo + hi) / 2) : undefined;
      if (julRows && julValue === undefined) continue; // range exists in one edition only
      const expected = julValue === undefined ? janValue : (janValue + julValue) / 2;
      // Averaging two nickel-rounded figures can sit 5 cents off either one.
      let tol = julValue === undefined ? TOLERANCE : TOLERANCE + 0.1;
      // Known, bounded exception. BC's tax reduction phases out between
      // $25,570 and ~$44,950 a year (annual 2026 values, which the engine
      // uses). The July 2026 table withholds with PRORATED catch-up
      // reduction parameters that end the phase-out at a different income,
      // so the Jan/Jul mean bends inside that band while the annual liability
      // does not. Measured gap: at most $2.14 a pay, only between $1,630 and
      // $1,850 a pay. Outside that band BC is held to the normal tolerance.
      if (code === 'BC' && kind === 'provincial' && julValue !== undefined && (lo + hi) / 2 >= 1630 && (lo + hi) / 2 <= 1850) tol = 2.5;
      const mid = (lo + hi) / 2;
      const r = calculateFromAnnualSalary({ province: P[code], annualSalary: mid * 26, payFrequency: PayFrequency.BI_WEEKLY } as any);
      const got = kind === 'federal' ? r.federalTax : r.provincialTax;
      const diff = got - expected;
      checked++; n++;
      if (Math.abs(diff) > Math.abs(maxDiff)) { maxDiff = diff; maxAt = mid; }
      if (Math.abs(diff) > tol) bad++;
    }
    // A table that compares nothing must not read as a pass.
    if (n < rows.length / 2) { failures += 1; lines.push(`${code} ${kind}: only ${n} of ${rows.length} rows could be compared`); }
    failures += bad;
    lines.push(`${code} ${kind.padEnd(10)} vs ${key.padEnd(12)} rows ${String(n).padStart(3)}  over tolerance: ${String(bad).padStart(3)}  worst ${maxDiff >= 0 ? '+' : ''}${maxDiff.toFixed(2)} at $${maxAt.toFixed(0)}/pay`);
  }
}
// Quebec income tax is Revenu Québec's, not CRA's: TP-1015.TI.26 annexe D,
// code A (basic personal amount only). Rows below the basic amount print a
// blank code-A cell and are not in the fixture.
{
  const rows = (fixture as any).quebec?.provincial as Row[] | undefined;
  if (!rows?.length) { failures++; lines.push('QC provincial: no Revenu Québec rows in fixture'); }
  else {
    let bad = 0, maxDiff = 0, maxAt = 0;
    for (const [lo, hi, expected] of rows) {
      const mid = (lo + hi) / 2;
      const r: any = calculateFromAnnualSalary({ province: Province.QC, annualSalary: mid * 26, payFrequency: PayFrequency.BI_WEEKLY } as any);
      const diff = r.provincialTax - expected; checked++;
      if (Math.abs(diff) > Math.abs(maxDiff)) { maxDiff = diff; maxAt = mid; }
      if (Math.abs(diff) > TOLERANCE) bad++;
    }
    failures += bad;
    lines.push(`QC provincial vs Revenu Québec rows ${String(rows.length).padStart(3)}  over tolerance: ${String(bad).padStart(3)}  worst ${maxDiff >= 0 ? '+' : ''}${maxDiff.toFixed(2)} at $${maxAt.toFixed(0)}/pay`);
  }
}

// CPP and EI per pay. Checked below the annual ceilings, where a single pay
// is a straight percentage; the ceilings themselves are covered by the tax
// tables above, whose credits depend on the annual maximums.
const contrib: [string, Row[] | undefined, Province, 'cppDeduction' | 'eiDeduction', number][] = [
  ['CPP', fixture.contributions?.cpp, Province.ON, 'cppDeduction', 74600 / 26],
  ['EI', fixture.contributions?.ei, Province.ON, 'eiDeduction', 68900 / 26],
  ['EI (Quebec)', fixture.contributions?.ei_qc, Province.QC, 'eiDeduction', 68900 / 26],
];
for (const [label, rows, prov, field, cap] of contrib) {
  if (!rows?.length) { failures++; lines.push(`${label}: no rows in fixture`); continue; }
  let bad = 0, n = 0, maxDiff = 0;
  for (const [lo, hi, expected] of rows) {
    const mid = (lo + hi) / 2;
    if (mid * 26 < 5000 || mid > cap) continue; // tiny pays hit the CPP exemption rounding; above the cap the annual max binds
    const r: any = calculateFromAnnualSalary({ province: prov, annualSalary: mid * 26, payFrequency: PayFrequency.BI_WEEKLY } as any);
    const diff = r[field] - expected; n++; checked++;
    if (Math.abs(diff) > Math.abs(maxDiff)) maxDiff = diff;
    if (Math.abs(diff) > 0.02) bad++;
  }
  if (n < 20) { failures++; lines.push(`${label}: only ${n} rows compared`); }
  failures += bad;
  lines.push(`${label.padEnd(22)} rows ${String(n).padStart(3)}  over tolerance: ${String(bad).padStart(3)}  worst ${maxDiff.toFixed(3)}`);
}
if (report || failures) console.log(lines.join('\n'));
console.log(failures ? `T4032 GOLDEN FAIL — ${failures} rows differ from CRA by more than tolerance` : `T4032 GOLDEN PASS — ${checked} rows of CRA's ${'T4032'} tables reproduced (federal + provincial, 13 jurisdictions, plus Revenu Québec's Quebec table)`);
process.exit(failures ? 1 : 0);
