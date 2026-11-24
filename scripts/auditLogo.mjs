/**
 * Build gate: every blog cover must carry the REAL logo.
 *
 * The mark has shipped wrong three times — hand-drawn paths that look roughly
 * like an inukshuk but are not the logo. Prose in a README did not stop it and
 * a rule in the article routine's prompt did not stop it, because both rely on
 * someone reading them. This fails the build instead.
 *
 * Since 2026-11-24 covers are PNGs from scripts/brandCovers.mjs, which composites public/logo.png at LOGO_BOX.
 * PASS requires, for every public/blog/covers/*.png:
 *   - the pixels at LOGO_BOX ARE public/logo.png (inner 70%, 32x32, same limit as below), and
 *   - at least one cover was checked (a checker that finds nothing must fail, not pass).
 * And, for any public/blog/*.svg that still exists:
 *   - an embedded base64 PNG (the real logo travels inside the file),
 *   - every embedded PNG IS one of the real logo files, compared pixel by
 *     pixel at 32x32 (until 2026-11-23 any PNG at all passed: a solid red
 *     square would have gone through), and
 *   - no hand-drawn mark: no <path>/<rect> group posing as the brand.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

// The real marks: logo.png (the 2026-11 app icon: pearly beaver on the red tile) and logo_reverse.png
// (kept for callers that still name it; since 2026-11 it is the same image). Resizers differ
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

// ── PNG covers (scripts/brandCovers.mjs): the logo must sit, unaltered, at LOGO_BOX ──
const { LOGO_BOX } = await import('./brandCovers.mjs');
const inner = async (buf, box) => {
  const m = Math.round(box.size * 0.15), s = box.size - 2 * m;   // inner 70%: no anti-aliased rim, no background
  return sharp(buf).extract({ left: box.x + m, top: box.y + m, width: s, height: s }).resize(32, 32, { fit: 'fill' }).removeAlpha().raw().toBuffer();
};
const logoAt = await sharp(readFileSync('public/logo.png')).resize(LOGO_BOX.size, LOGO_BOX.size).png().toBuffer();
const refInner = await inner(await sharp({ create: { width: LOGO_BOX.x + LOGO_BOX.size, height: LOGO_BOX.y + LOGO_BOX.size, channels: 4, background: '#808080' } })
  .composite([{ input: logoAt, left: LOGO_BOX.x, top: LOGO_BOX.y }]).png().toBuffer(), LOGO_BOX);
const PNG_DIR = join(DIR, 'covers');
const pngs = readdirSync(PNG_DIR).filter((f) => f.endsWith('.png'));
for (const f of pngs) {
  let px; try { px = await inner(readFileSync(join(PNG_DIR, f)), LOGO_BOX); } catch (e) { problems.push(`covers/${f}: unreadable (${e.message})`); continue; }
  let d = 0; for (let i = 0; i < px.length; i++) d += Math.abs(px[i] - refInner[i]); d /= px.length;
  if (d > LIMIT) problems.push(`covers/${f}: no real logo at LOGO_BOX (mean pixel difference ${d.toFixed(1)}, limit ${LIMIT}). Render covers with scripts/brandCovers.mjs.`);
}
if (pngs.length === 0) problems.push('no PNG covers found in public/blog/covers — the audit checked nothing');

if (problems.length) {
  console.error('\nLOGO AUDIT FAIL — ' + problems.length + ' cover(s) do not carry the real logo:\n');
  for (const p of problems) console.error('  • ' + p);
  console.error('\nFix: render covers with scripts/brandCovers.mjs (PNG) — or, for an SVG, scripts/coverLogo.mjs.');
  console.error('Never redraw the mark in <path>/<rect>. The only source is public/logo.png.\n');
  process.exit(1);
}
console.log(`LOGO AUDIT PASS — ${pngs.length} PNG cover(s) carry public/logo.png at LOGO_BOX; ${covers.length} SVG cover(s) embed it.`);
