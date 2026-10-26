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
 * languages, against monthly_indicators.csv), the number of hidden calculation cells
 * is 0 or at least 2. Sessions are not checked: one visit can price several pay types,
 * so session cells do not add up to the session total.
 *
 *   node scripts/auditSample.mjs         check (prebuild)
 *   node scripts/auditSample.mjs --fix   also withhold ("x") the smallest shown cell next to a lone "<20"
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
      const hidden = rows.filter((r) => isHidden(r[calc]));
      if (hidden.length !== 1) continue;
      if (FIX) {
        const next = rows.filter((r) => !isHidden(r[calc])).sort((a, b) => Number(a[calc]) - Number(b[calc]))[0];
        if (next) { next[calc] = COMPLEMENT; changed = true; console.log(`  fixed ${f}: ${k} — also hid ${next.join(',')}`); continue; }
      }
      const shown = rows.filter((r) => !isHidden(r[calc])).reduce((s, r) => s + Number(r[calc]), 0);
      const total = Number(totals.get(rows[0][area]));
      failures.push(`${f}: ${k} has one hidden cell, recoverable as ${total} − ${shown} = ${total - shown}`);
    }
   }
   if (changed) write(f, tables);
  }
}

if (failures.length) {
  console.log(`SAMPLE AUDIT FAIL — ${failures.length} "<20" cell(s) recoverable by subtraction:\n`);
  for (const x of failures) console.log('  ' + x);
  console.log('\nRun: node scripts/auditSample.mjs --fix');
  process.exit(1);
}
console.log(`SAMPLE AUDIT PASS — ${groups} groups with a published total; none has a lone "<20" cell.`);
