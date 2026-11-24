/**
 * Brand type as SVG paths: the cover generators set Fraunces / Instrument Sans without the fonts installed
 * and without a browser (the weekly article routine runs on Linux). Outlines, advances and measured pair
 * kerning come from lib/brand/glyphs.json (scripts/brand/exportGlyphs.py).
 *
 *   const run = layout('Wages up 2.3%', 'display', 60)  → { d, width }   (baseline at y = 0)
 *   wrap(text, 'display', 60, maxWidth)                 → ['line one', 'line two']
 * A character the table doesn't have throws: add it to CHARS in exportGlyphs.py and re-export.
 */
import { readFileSync } from 'node:fs';

const G = JSON.parse(readFileSync(new URL('./glyphs.json', import.meta.url), 'utf8'));
const f2 = (v) => Math.round(v * 100) / 100;

/** advance width of `text` in px (tracking in em/1000, like CSS letter-spacing × 1000) */
export function measure(text, font, size, tracking = 0) {
  const F = G[font]; if (!F) throw new Error(`unknown font ${font}`);
  const k = size / F.upem; let x = 0;
  const chars = [...text];
  chars.forEach((c, i) => {
    const g = F.glyphs[c]; if (!g) throw new Error(`glyph missing in ${font}: "${c}" (U+${c.codePointAt(0).toString(16)}) — add it to exportGlyphs.py`);
    x += g.w + (F.kern[c + (chars[i + 1] || '')] || 0) + (i < chars.length - 1 ? (tracking * F.upem) / 1000 : 0);
  });
  return x * k;
}

/** one line of text as a single path, baseline at y = 0, starting at x = 0 */
export function layout(text, font, size, tracking = 0) {
  const F = G[font], k = size / F.upem, chars = [...text];
  let x = 0; const parts = [];
  chars.forEach((c, i) => {
    const g = F.glyphs[c]; if (!g) throw new Error(`glyph missing in ${font}: "${c}"`);
    if (g.d) parts.push(`<path transform="translate(${f2(x * k)} 0) scale(${f2(k * 10000) / 10000})" d="${g.d}"/>`);
    x += g.w + (F.kern[c + (chars[i + 1] || '')] || 0) + (i < chars.length - 1 ? (tracking * F.upem) / 1000 : 0);
  });
  return { svg: parts.join(''), width: x * k };
}

/** greedy word wrap by measured width */
export function wrap(text, font, size, maxWidth, tracking = 0) {
  const words = text.split(/\s+/).filter(Boolean), lines = []; let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && measure(next, font, size, tracking) > maxWidth) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

/**
 * Rich line: segments [{text, color}] set one after another (headline highlights).
 * Kerning across a colour change is kept by measuring the joined text.
 */
export function layoutRich(segs, font, size, tracking = 0) {
  let x = 0, out = '';
  segs.forEach((s, i) => {
    const r = layout(s.text, font, size, tracking);
    out += `<g transform="translate(${f2(x)} 0)" fill="${s.color}">${r.svg}</g>`;
    const next = segs[i + 1]?.text?.[0] || '', last = [...s.text].pop();
    x += r.width + ((G[font].kern[last + next] || 0) * size) / G[font].upem + (next ? tracking * size / 1000 : 0);
  });
  return { svg: out, width: x };
}

export const capHeight = (font, size) => (G[font].capHeight * size) / G[font].upem;
