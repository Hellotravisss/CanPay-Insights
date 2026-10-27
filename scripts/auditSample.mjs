#!/usr/bin/env node
/**
 * audit:sample — the free buyer sample (public/data/sample/*.csv) keeps its "<20" promise.
 *
 * A "<20" cell hides nothing when its group's total is published elsewhere and it is
 * the ONLY hidden cell in the group: total − shown cells = the hidden value. In the
 * September 2026 sample, eight cells came out exactly that way (Alberta timesheet = 12,
 * PEI English = 7…), found by an independent review on 2026-10-26.
 *
 * Rule: within every group whose total is published (a province's pay types or
 * languages, against monthly_indicators.csv), what the hidden cells add up to —
 * total minus the shown cells, which anyone can work out — is 0 or at least 20.
 * One hidden cell fails; so do two that sum to 7. (USAPay's lib/suppress.ts rule.) Sessions are not checked: one visit can price several pay types,
 * so session cells do not add up to the session total.
 *
 *   node scripts/auditSample.mjs         check (prebuild)
 *   node scripts/auditSample.mjs --fix   keep withholding ("x") the smallest shown cell until the hidden ones add up to 20+
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const DIR = 'public/data/sample';
const FIX = process.argv.includes('--fix');
const SMALL = '<20';
// A cell withheld only so that a "<20" next to it cannot be worked out. It is not small,
// so it must not say "<20" — Statistics Canada marks the same thing "x".
const COMPLEMENT = 'x';
const isHidden = (v) => v === SMALL || v === COMPLEMENT;

// A file may hold several tables, each with its own header, separated by a blank line.
const read = (f) =>
  readFileSync(`${DIR}/${f}`, 'utf8').trimEnd().split(/\n\s*\n/).map((block) => {
    const [head, ...lines] = block.split('\n');
    return { head: head.split(','), rows: lines.map((l) => l.split(',')) };
  });
const write = (f, tables) =>
  writeFileSync(`${DIR}/${f}`, tables.map(({ head, rows }) => [head, ...rows].map((r) => r.join(',')).join('\n')).join('\n\n') + '\n');

const files = readdirSync(DIR).filter((f) => f.endsWith('.csv'));
const failures = [];
let groups = 0;

for (const ind of files.filter((f) => f.endsWith('_monthly_indicators.csv'))) {
  const month = ind.slice(0, 7);
  const [t] = read(ind);
  const [pi, ci] = ['province', 'calculations'].map((c) => t.head.indexOf(c));
  const totals = new Map(t.rows.map((r) => [r[pi], r[ci]]));

  for (const f of files.filter((x) => x.startsWith(month) && x !== ind)) {
   const tables = read(f);
   let changed = false;
   for (const d of tables) {
    const area = d.head.includes('province') ? d.head.indexOf('province') : d.head.indexOf('area');
    const calc = d.head.indexOf('calculations');
    // The income-range block is a second partition of All Canada: its own group.
    const byIncome = d.head.includes('income_range');
    const byGroup = new Map();
    for (const r of d.rows) {
      if (!totals.has(r[area])) continue; // a group is judged only when its total is published
      const k = byIncome ? `${r[area]} by income range` : r[area];
      byGroup.set(k, [...(byGroup.get(k) ?? []), r]);
    }
    for (const [k, rows] of byGroup) {
      groups++;
      const total = Number(totals.get(rows[0][area]));
      const shownSum = () => rows.filter((r) => !isHidden(r[calc])).reduce((s, r) => s + Number(r[calc]), 0);
      let hiddenSum = total - shownSum();
      if (hiddenSum === 0 || hiddenSum >= 20) continue;
      if (FIX) {
        while (hiddenSum > 0 && hiddenSum < 20) {
          const next = rows.filter((r) => !isHidden(r[calc])).sort((a, b) => Number(a[calc]) - Number(b[calc]))[0];
          if (!next) break;
          next[calc] = COMPLEMENT; changed = true;
          console.log(`  fixed ${f}: ${k} — also withheld ${next.join(',')}`);
          hiddenSum = total - shownSum();
        }
        if (hiddenSum === 0 || hiddenSum >= 20) continue;
      }
      failures.push(`${f}: ${k} — the hidden cells add up to ${total} − ${shownSum()} = ${hiddenSum}, under 20`);
    }
   }
   if (changed) write(f, tables);
  }
}

if (failures.length) {
  console.log(`SAMPLE AUDIT FAIL — ${failures.length} group(s) where the hidden cells can be added up by subtraction:\n`);
  for (const x of failures) console.log('  ' + x);
  console.log('\nRun: node scripts/auditSample.mjs --fix');
  process.exit(1);
}
console.log(`SAMPLE AUDIT PASS — ${groups} groups with a published total; what is hidden in each adds up to 0 or at least 20.`);
