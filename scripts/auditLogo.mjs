/**
 * Build gate: every blog cover must carry the REAL logo.
 *
 * The mark has shipped wrong three times — hand-drawn paths that look roughly
 * like an inukshuk but are not the logo. Prose in a README did not stop it and
 * a rule in the article routine's prompt did not stop it, because both rely on
 * someone reading them. This fails the build instead.
 *
 * PASS requires, for every public/blog/*.svg:
 *   - an embedded base64 PNG (the real logo travels inside the file),
 *   - every embedded PNG IS one of the real logo files, compared pixel by
 *     pixel at 32x32 (until 2026-11-23 any PNG at all passed: a solid red
 *     square would have gone through), and
 *   - no hand-drawn mark: no <path>/<rect> group posing as the brand.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

// The real marks: logo.png (red square, white inukshuk) and its reverse, used
// on red backgrounds (province guide covers, results card). Resizers differ
// (sips, sharp, ImageMagick) by under 1 point of mean difference; a different
// image is above 15. The limit sits between the two.
const REAL = ['public/logo.png', 'public/logo_reverse.png'];
const LIMIT = 5;
const raw = (buf) => sharp(buf).resize(32, 32, { fit: 'fill' }).ensureAlpha().raw().toBuffer();
const refs = await Promise.all(REAL.map((f) => raw(readFileSync(f))));
async function distance(buf) {
  let px;
  try { px = await raw(buf); } catch { return Infinity; }
  return Math.min(...refs.map((r) => { let d = 0; for (let i = 0; i < r.length; i++) d += Math.abs(r[i] - px[i]); return d / r.length; }));
}

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
  for (const [, b64] of s.matchAll(/data:image\/png;base64,([A-Za-z0-9+\/=]+)/g)) {
    const d = await distance(Buffer.from(b64, 'base64'));
    if (d > LIMIT) problems.push(`${f}: embedded PNG is not the real logo (mean pixel difference ${d.toFixed(1)}, limit ${LIMIT}). Use scripts/coverLogo.mjs.`);
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
