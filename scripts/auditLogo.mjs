/**
 * Build gate: every blog cover must carry the REAL logo.
 *
 * The mark has shipped wrong three times — hand-drawn paths that look roughly
 * like an inukshuk but are not the logo. Prose in a README did not stop it and
 * a rule in the article routine's prompt did not stop it, because both rely on
 * someone reading them. This fails the build instead.
 *
 * PASS requires, for every public/blog/*.svg:
 *   - an embedded base64 PNG (the real logo travels inside the file), and
 *   - no hand-drawn mark: no <path>/<rect> group posing as the brand.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'public/blog';
// Signatures of marks that were hand-drawn in the past. Add to this list, never remove.
const FORGERIES = [
  { sig: 'M4 6h16a1 1 0 0 1 1 1v2', note: 'four-bar inukshuk drawn with rounded rects (2026-08)' },
  { sig: 'M5 14h14a1 1 0 0 1 1 1v2', note: 'same forgery, hips bar' },
];

const covers = readdirSync(DIR).filter((f) => f.endsWith('.svg'));
const problems = [];

for (const f of covers) {
  const s = readFileSync(join(DIR, f), 'utf8');
  const hasBrand = /<!--\s*brand/i.test(s) || /CanPay/.test(s);
  if (!hasBrand) continue; // covers without a brand block are not in scope

  for (const { sig, note } of FORGERIES) {
    if (s.includes(sig)) problems.push(`${f}: hand-drawn logo — ${note}`);
  }
  if (!/data:image\/png;base64,/.test(s)) {
    problems.push(`${f}: no embedded logo. Covers must embed public/logo.png as base64 (an SVG in <img> cannot fetch /logo.png). Use scripts/coverLogo.mjs.`);
  }
}

if (problems.length) {
  console.error('\nLOGO AUDIT FAIL — ' + problems.length + ' cover(s) do not carry the real logo:\n');
  for (const p of problems) console.error('  • ' + p);
  console.error('\nFix: import { brandGroup, SVG_OPEN } from scripts/coverLogo.mjs and use its output verbatim.');
  console.error('Never redraw the mark in <path>/<rect>. The only source is public/logo.png.\n');
  process.exit(1);
}
console.log(`LOGO AUDIT PASS — ${covers.length} cover(s), all carrying the embedded real logo.`);
