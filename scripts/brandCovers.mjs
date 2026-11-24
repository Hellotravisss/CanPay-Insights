/**
 * Article covers in the 2026-11 identity (1200×630 PNG, also the og:image). One generator for every cover:
 *
 *   news    the article's own numbers: headline with red highlights, sub line, pill, label, 2×2 fact tiles
 *   title   brand gradient + banknote pattern + the title            (guides without a data card)
 *   figure  brand gradient + one big engine figure                    (province take-home guides)
 *
 * Text is set as paths from lib/brand/glyphs.json, so this runs anywhere Node + sharp run (the weekly
 * article routine is on Linux). The logo is public/logo.png composited at LOGO_BOX — scripts/auditLogo.mjs
 * checks that exact spot on every cover, so a cover without the real mark fails the build.
 *
 * CLI
 *   node scripts/brandCovers.mjs news <slug>     render src/content/covers/<slug>.json → public/blog/covers/<slug>.png
 *   node scripts/brandCovers.mjs all-news        every spec in src/content/covers/
 * Spec (news): { "head": [["Wages up ", "2.3%", " —"], ["Canada lost ", "68,000 jobs", "."]],
 *                "sub": "...", "pill": "...", "label": "...", "tiles": [["$37.64/hr average wage", "Up $0.86 ..."], ...] }
 *   head: one array per line; odd items (1, 3, …) are highlighted in brand red. 2 or 4 tiles (or 2 with no sub line).
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { layout, layoutRich, measure, wrap } from '../lib/brand/type.mjs';

const ROOT = new URL('..', import.meta.url);
const W = 1200, H = 630;
export const LOGO_BOX = { x: 72, y: 44, size: 40 };
const INK = '#15171C', GREY = '#5E6270', BRAND = '#C8161A', BRAND_DARK = '#9E0B10', PEARL = '#F4F4F8', TINT = '#FDEBE8';
const BG = ['#D42422', '#B00B0D', '#74030A'];
const WM = JSON.parse(readFileSync(new URL('lib/brand/wordmark.json', ROOT), 'utf8')).ca;
const f1 = (v) => Math.round(v * 10) / 10;

// ── shared pieces ──────────────────────────────────────────────────────
function wordmark(x, baseline, size, c1, c2, op2 = 1) {
  const k = size / 100;
  return `<g transform="translate(${f1(x)} ${f1(baseline)}) scale(${k})"><path fill="${c1}" d="${WM.brand.d}"/></g>`
    + `<g transform="translate(${f1(x + (WM.brand.w + 26) * k)} ${f1(baseline)}) scale(${k})"><path fill="${c2}" fill-opacity="${op2}" d="${WM.desc.d}"/></g>`;
}
const lockup = (dark) => wordmark(LOGO_BOX.x + LOGO_BOX.size + 12, LOGO_BOX.y + LOGO_BOX.size / 2 + 8, 25, dark ? '#fff' : INK, dark ? '#fff' : BRAND, dark ? 0.72 : 1);

/** rosette lattice tile (two interlaced ring families), as in PayFamily-brand/16-patterns */
function rosetteTile(T = 240) {
  const ring = (cx, cy, R, a, ph) => 'M' + Array.from({ length: 121 }, (_, i) => {
    const t = (i / 120) * 2 * Math.PI, r = R + a * Math.sin(12 * t + ph);
    return `${f1(cx + r * Math.cos(t))} ${f1(cy + r * Math.sin(t))}`;
  }).join('L') + 'Z';
  const out = [];
  for (const [cx, cy] of [[T / 2, T / 2], [0, 0], [T, 0], [0, T], [T, T]])
    for (const dir of [1, -1]) for (let k = 0; k < 16; k++) out.push(ring(cx, cy, 10 + k * 5.2, 4.2, dir * k * 0.38));
  return out;
}
/** interlaced sine waves, periods divide the tile so it repeats both ways */
function wavesTile(TW = 480, TH = 240, gap = 8) {
  const N = TH / gap, out = [];
  for (const dir of [1, -1]) for (let j = 0; j < N; j++) {
    const ph = (2 * Math.PI * j) / N;
    for (const dy of [0, -TH, TH]) out.push('M' + Array.from({ length: TW / 4 + 1 }, (_, i) => {
      const u = i * 4; return `${u} ${f1(j * gap + dy + 9 * Math.sin((2 * Math.PI * u) / 240 + dir * ph) + 4 * Math.sin((2 * Math.PI * u) / 96 - dir * 2 * ph))}`;
    }).join('L'));
  }
  return out;
}
const pattern = (id, kind, color, op, scale = 1) => {
  const [tw, th, paths] = kind === 'rosette' ? [240, 240, rosetteTile()] : [480, 240, wavesTile()];
  return `<pattern id="${id}" width="${tw}" height="${th}" patternUnits="userSpaceOnUse" patternTransform="scale(${scale})"><g fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="0.9">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></pattern>`;
};
const gradient = `<radialGradient id="bg" gradientUnits="userSpaceOnUse" cx="180" cy="0" r="1350"><stop offset="0" stop-color="${BG[0]}"/><stop offset=".5" stop-color="${BG[1]}"/><stop offset="1" stop-color="${BG[2]}"/></radialGradient>`;
const text = (str, font, size, x, y, fill, { tracking = 0, opacity = 1 } = {}) => {
  const r = layout(str, font, size, tracking);
  return { svg: `<g transform="translate(${f1(x)} ${f1(y)})" fill="${fill}" fill-opacity="${opacity}">${r.svg}</g>`, width: r.width };
};
/** largest size from `sizes` at which every line fits `max` */
function fit(lines, font, sizes, max, rich = false) {
  for (const s of sizes) {
    const widest = Math.max(...lines.map((l) => (rich ? measure(l.join(''), font, s) : measure(l, font, s))));
    if (widest <= max) return s;
  }
  throw new Error(`text does not fit ${max}px even at ${sizes[sizes.length - 1]}px: ${JSON.stringify(lines)}`);
}

async function toPng(svg, out) {
  const logo = await sharp(readFileSync(new URL('public/logo.png', ROOT))).resize(LOGO_BOX.size, LOGO_BOX.size).png().toBuffer();
  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  mkdirSync(new URL('public/blog/covers/', ROOT), { recursive: true });
  await sharp(base).composite([{ input: logo, left: LOGO_BOX.x, top: LOGO_BOX.y }]).png({ palette: true, quality: 92, effort: 8 }).toFile(fileURLToPath(out));
}

// ── 1. news data card ──────────────────────────────────────────────────
export async function newsCover(slug, spec) {
  const X = 72, maxW = W - X - 64;
  const head = spec.head.map((line) => (Array.isArray(line) ? line : [line]));
  const fs = fit(head, 'display', [60, 56, 52, 48, 44], maxW, true);
  let y = LOGO_BOX.y + LOGO_BOX.size + 44 + fs * 0.8, body = '';
  for (const line of head) {
    const r = layoutRich(line.map((t, i) => ({ text: t, color: i % 2 ? BRAND : INK })).filter((s) => s.text), 'display', fs);
    body += `<g transform="translate(${X} ${f1(y)})">${r.svg}</g>`; y += fs * 1.08;
  }
  if (spec.sub) { const s = fit([spec.sub], 'text', [23, 21, 19], maxW); y += 6; body += text(spec.sub, 'text', s, X, y, GREY).svg; y += s * 0.4; }
  if (spec.pill) {
    const s = fit([spec.pill], 'textBold', [17, 16, 15], maxW - 40), w = measure(spec.pill, 'textBold', s) + 36; y += 22;
    body += `<rect x="${X}" y="${f1(y)}" width="${f1(w)}" height="38" rx="19" fill="${TINT}"/>` + text(spec.pill, 'textBold', s, X + 18, y + 25, BRAND_DARK).svg;
  }
  // tiles from the bottom up: 2 columns, 58 px (44 px when there is no sub line)
  const tiles = spec.tiles, two = tiles.some((t) => t[1]), th = two ? 58 : 44, rows = Math.ceil(tiles.length / 2), gap = 14, tw = (maxW - gap) / 2;
  const top = H - 40 - rows * th - (rows - 1) * 10;
  if (spec.label) body += text(spec.label.toUpperCase(), 'textBold', 12.5, X, top - 12, GREY, { tracking: 120 }).svg;
  tiles.forEach(([t, s], i) => {
    const x = X + (i % 2) * (tw + gap), ty = top + Math.floor(i / 2) * (th + 10);
    const ts = fit([t], 'textBold', [18, 17, 16, 15], tw - 36);
    body += `<rect x="${f1(x)}" y="${f1(ty)}" width="${f1(tw)}" height="${th}" rx="12" fill="${i % 2 ? INK : 'url(#bg)'}"/>`
      + text(t, 'textBold', ts, x + 18, ty + (s ? 26 : 28), '#fff').svg
      + (s ? text(s, 'text', fit([s], 'text', [13.5, 13, 12.5], tw - 36), x + 18, ty + 46, '#fff', { opacity: 0.78 }).svg : '');
  });
  if (y > top - 30) throw new Error(`${slug}: headline block runs into the tiles (${f1(y)} > ${top - 30})`);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${gradient}${pattern('r', 'rosette', BRAND, 0.22, 1.25)}
    <radialGradient id="m" cx="1" cy="0" r=".75"><stop offset=".3" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient><mask id="mk"><rect width="${W}" height="${H}" fill="url(#m)"/></mask></defs>
    <rect width="${W}" height="${H}" fill="${PEARL}"/><rect width="${W}" height="${H}" fill="url(#r)" mask="url(#mk)"/><rect width="10" height="${H}" fill="${BRAND}"/>
    ${lockup(false)}${body}</svg>`;
  await toPng(svg, new URL(`public/blog/covers/${slug}.png`, ROOT));
}

// ── 2. title cover (dark) ──────────────────────────────────────────────
export async function titleCover(slug, { title, label, pattern: kind = 'rosette' }) {
  const X = 72, maxW = 1000;
  let fs = 76, lines;
  for (fs of [76, 66, 58, 50, 46]) { lines = wrap(title, 'display', fs, maxW); if (lines.length <= 3) break; }
  if (lines.length > 3) throw new Error(`${slug}: title needs more than 3 lines`);
  let y = H - 64 - (lines.length - 1) * fs * 1.08, body = text(label.toUpperCase(), 'textBold', 18, X, y - fs - 14, '#fff', { tracking: 160, opacity: 0.82 }).svg;
  for (const l of lines) { body += text(l, 'display', fs, X, y, '#fff').svg; y += fs * 1.08; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${gradient}${pattern('p', kind, '#fff', 0.2, kind === 'rosette' ? 1.25 : 1)}</defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#p)"/>${lockup(true)}${body}</svg>`;
  await toPng(svg, new URL(`public/blog/covers/${slug}.png`, ROOT));
}

// ── 3. figure cover (province guides) ──────────────────────────────────
export async function figureCover(slug, { eyebrow, figure, caption, source }) {
  const X = 72, fs = 150, fw = measure(figure, 'display', fs);
  const cap = wrap(caption, 'text', 26, 340);
  let body = text(eyebrow.toUpperCase(), 'textBold', 18, X, 360, '#fff', { tracking: 160, opacity: 0.82 }).svg
    + text(figure, 'display', fs, X, 520, '#fff').svg;
  cap.forEach((l, i) => { body += text(l, 'text', 26, X + fw + 28, 520 - (cap.length - 1 - i) * 33 - 6, '#fff', { opacity: 0.85 }).svg; });
  body += text(source, 'text', 17, X, 568, '#fff', { opacity: 0.7 }).svg;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${gradient}${pattern('p', 'waves', '#fff', 0.2)}</defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/><rect width="${W}" height="${H}" fill="url(#p)"/>${lockup(true)}${body}</svg>`;
  await toPng(svg, new URL(`public/blog/covers/${slug}.png`, ROOT));
}

// ── CLI ────────────────────────────────────────────────────────────────
const SPECS = new URL('src/content/covers/', ROOT);
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [cmd, slug] = process.argv.slice(2);
  const one = async (s) => { await newsCover(s, JSON.parse(readFileSync(new URL(`${s}.json`, SPECS), 'utf8'))); console.log(`public/blog/covers/${s}.png`); };
  if (cmd === 'news' && slug) await one(slug);
  else if (cmd === 'all-news') for (const f of readdirSync(SPECS).filter((f) => f.endsWith('.json'))) await one(f.slice(0, -5));
  else { console.error('usage: node scripts/brandCovers.mjs news <slug> | all-news'); process.exit(2); }
}
