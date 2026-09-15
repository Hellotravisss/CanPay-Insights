/**
 * Cover art for every article that still pointed at an Unsplash photo.
 *
 * Why: 42 articles hot-linked images.unsplash.com. That is a third-party
 * request on every article view (a privacy-policy line we would rather not
 * need), a dependency on someone else's CDN and licence terms, and a set of
 * stock photos that said nothing about the article. These covers say the
 * article's own title, in the site's own palette, from a file we own.
 *
 * Run:  npx tsx scripts/genArticleCovers.ts
 * Writes public/blog/covers/<slug>.png (1200×630, palette PNG, ~40–90 KB)
 * and prints the slug → path map. The content files are rewritten by the
 * companion step in the same commit; this script never edits them.
 *
 * The logo is the real one (public/logo.png at 256 px, inlined by
 * lib/logoBase64.ts) — never redrawn.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { rawArticles as allArticles } from '../src/content/articles-data';
import { LOGO_PNG_BASE64 } from '../lib/logoBase64';

const OUT = 'public/blog/covers';
mkdirSync(OUT, { recursive: true });

// One family per category, several hues inside each so a category page does
// not read as one cover repeated ten times. Chosen by a stable hash of the slug.
const FAMILIES: Record<string, [string, string][]> = {
  tax: [['#dc2626', '#7f1d1d'], ['#b91c1c', '#450a0a'], ['#e11d48', '#881337'], ['#c2410c', '#7c2d12']],
  salary: [['#0f766e', '#134e4a'], ['#0e7490', '#164e63'], ['#1d4ed8', '#1e3a8a'], ['#4338ca', '#312e81']],
  province: [['#2563eb', '#1e3a8a'], ['#0284c7', '#0c4a6e'], ['#7c3aed', '#4c1d95'], ['#0d9488', '#134e4a']],
  tips: [['#b45309', '#78350f'], ['#15803d', '#14532d'], ['#a16207', '#713f12'], ['#be123c', '#4c0519']],
  news: [['#334155', '#0f172a'], ['#475569', '#1e293b']],
};
const LABEL: Record<string, string> = {
  tax: 'Tax guide', salary: 'Salary guide', province: 'Province guide', tips: 'Money guide', news: 'News',
};

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h;
}
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Greedy word wrap to at most `max` lines; the last line gets an ellipsis if it had to stop. */
function wrap(title: string, perLine: number, max: number): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > perLine && cur) { lines.push(cur); cur = w; }
    else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  if (lines.length > max) { lines.length = max; lines[max - 1] = lines[max - 1].replace(/[\s,:;–-]+$/, '') + '…'; }
  return lines;
}

/**
 * A quiet motif per category, drawn from the slug hash so no two are alike:
 * tax = a rising step chart (brackets), salary = bars, province = a grid of
 * dots (a map without pretending to be one), tips = concentric arcs (saving).
 */
function motif(cat: string, h: number): string {
  const r = (i: number) => ((h >> (i * 3)) & 7) / 7; // 0..1 pseudo-random per index
  if (cat === 'tax') {
    const steps = 6;
    return Array.from({ length: steps }, (_, i) => {
      const x = 760 + i * 66, hgt = 60 + i * 42 + r(i) * 30;
      return `<rect x="${x}" y="${560 - hgt}" width="52" height="${hgt}" rx="6" fill="#ffffff" fill-opacity="${0.10 + i * 0.03}"/>`;
    }).join('');
  }
  if (cat === 'salary') {
    return Array.from({ length: 9 }, (_, i) => {
      const x = 720 + i * 48, hgt = 40 + r(i) * 220;
      return `<rect x="${x}" y="${560 - hgt}" width="30" height="${hgt}" rx="4" fill="#ffffff" fill-opacity="${0.08 + r(i + 3) * 0.14}"/>`;
    }).join('');
  }
  if (cat === 'province') {
    let s = '';
    for (let row = 0; row < 6; row++) for (let col = 0; col < 8; col++) {
      const k = row * 8 + col, rad = 4 + r(k % 10) * 9;
      s += `<circle cx="${760 + col * 52}" cy="${300 + row * 48}" r="${rad}" fill="#ffffff" fill-opacity="${0.08 + r((k + 5) % 10) * 0.16}"/>`;
    }
    return s;
  }
  return Array.from({ length: 7 }, (_, i) => {
    const rad = 60 + i * 42;
    return `<circle cx="1040" cy="520" r="${rad}" fill="none" stroke="#ffffff" stroke-opacity="${0.22 - i * 0.025}" stroke-width="${10 - i}"/>`;
  }).join('');
}

// rawArticles includes pruned (unpublished) entries on purpose: a hot-link in a
// pruned article is one un-prune away from loading again.
const targets = allArticles.filter((a) => (a.imageUrl ?? '').includes('images.unsplash.com'));
const map: Record<string, string> = {};

for (const a of targets) {
  const cat = a.category in FAMILIES ? a.category : 'tips';
  const h = hash(a.slug);
  const [c1, c2] = FAMILIES[cat][h % FAMILIES[cat].length];
  const sub = (a.subtitle || a.excerpt || '').replace(/\s+/g, ' ').trim();
  const lines = wrap(a.title, 30, 3);
  const size = lines.length === 1 ? 62 : lines.length === 2 ? 54 : 46;
  const lineH = size * 1.18;
  const firstY = 290 - ((lines.length - 1) * lineH) / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${esc(a.title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <radialGradient id="spot" cx="28%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#spot)"/>
  <g stroke="#ffffff" stroke-opacity="0.07" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 105}" x2="1200" y2="${i * 105}"/>`).join('')}
  </g>
  ${motif(cat, h)}
  <g font-family="Inter,Helvetica,Arial,sans-serif">
    <g transform="translate(64,56)">
      <rect width="46" height="46" rx="12" fill="#ffffff"/>
      <image href="data:image/png;base64,${LOGO_PNG_BASE64}" x="3" y="3" width="40" height="40"/>
      <text x="60" y="31" font-size="24" font-weight="700" fill="#ffffff">CanPay Insights</text>
    </g>
    <text x="64" y="190" font-size="19" font-weight="700" letter-spacing="5" fill="#ffffff" fill-opacity="0.8">${esc(LABEL[cat].toUpperCase())} · CANADA</text>
    ${lines.map((l, i) => `<text x="64" y="${Math.round(firstY + i * lineH)}" font-size="${size}" font-weight="800" fill="#ffffff">${esc(l)}</text>`).join('\n    ')}
    <text x="64" y="560" font-size="18" fill="#ffffff" fill-opacity="0.7">${esc(sub.slice(0, 92))}${sub.length > 92 ? '…' : ''}</text>
    <text x="64" y="594" font-size="15" fill="#ffffff" fill-opacity="0.5">canpayinsights.ca · free Canadian take-home pay calculator</text>
  </g>
</svg>`;
  const out = `${OUT}/${a.slug}.png`;
  await sharp(Buffer.from(svg)).png({ palette: true, colours: 192, compressionLevel: 9 }).toFile(out);
  map[a.slug] = `/blog/covers/${a.slug}.png`;
}
console.log(JSON.stringify(map, null, 0));
console.error(`covers written: ${targets.length}`);
