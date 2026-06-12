// Generates branded blog cover images (1200x630 PNG) from inline SVG via sharp.
// Run: node scripts/gen-blog-covers.mjs
import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/blog', { recursive: true });

const FONT = 'Helvetica, Arial, sans-serif';

// ---------- Cover 1: minimum wage data study (bar chart of real figures) ----------
const rows = [
  ['Nunavut', 34098],
  ['Yukon', 31580],
  ['British Columbia', 31269],
  ['Ontario', 30301],
  ['Northwest Territories', 29404],
  ['Prince Edward Island', 28464],
  ['Quebec', 28038],
  ['Nova Scotia', 27950],
  ['Newfoundland &amp; Labrador', 27547],
  ['Manitoba', 27164],
  ['New Brunswick', 26984],
  ['Saskatchewan', 26565],
  ['Alberta', 26478],
];
const max = rows[0][1];
const barX = 320;
const barMaxW = 700;
const startY = 158;
const step = 33;

const bars = rows
  .map(([name, val], i) => {
    const y = startY + i * step;
    const w = (val / max) * barMaxW;
    const isTop = i === 0;
    const isBottom = i === rows.length - 1;
    const fill = isTop ? '#dc2626' : isBottom ? '#94a3b8' : '#ef4444';
    return `
    <text x="${barX - 14}" y="${y + 16}" text-anchor="end" font-family="${FONT}" font-size="17" fill="#334155" font-weight="${isTop || isBottom ? 'bold' : 'normal'}">${name}</text>
    <rect x="${barX}" y="${y}" width="${w}" height="22" rx="4" fill="${fill}" opacity="${isTop ? 1 : 0.82}"/>
    <text x="${barX + w + 10}" y="${y + 16}" font-family="${FONT}" font-size="16" fill="#0f172a" font-weight="bold">$${val.toLocaleString('en-CA')}</text>`;
  })
  .join('');

const minwageSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="8" fill="#dc2626"/>
  <text x="60" y="68" font-family="${FONT}" font-size="34" font-weight="bold" fill="#0f172a">Minimum Wage Take-Home Pay by Province</text>
  <text x="60" y="104" font-family="${FONT}" font-size="20" fill="#64748b">Full-time net pay after federal tax, provincial tax, CPP &amp; EI &#183; June 2026</text>
  ${bars}
  <text x="60" y="600" font-family="${FONT}" font-size="18" font-weight="bold" fill="#dc2626">CanPay Insights</text>
  <text x="220" y="600" font-family="${FONT}" font-size="16" fill="#94a3b8">canpayinsights.ca &#183; free Canadian payroll calculator</text>
</svg>`;

// ---------- Cover 2: AI for All strategy (dark tech motif) ----------
const nodes = [
  [120, 9], [240, 5], [360, 11], [480, 7], [600, 4], [720, 10], [840, 6], [960, 8], [1080, 5],
];
const net = nodes
  .map(([x, seed], i) => {
    const y1 = 420 + ((seed * 13) % 60);
    const y2 = 500 + ((seed * 29) % 70);
    const next = nodes[i + 1];
    const line = next
      ? `<line x1="${x}" y1="${y1}" x2="${next[0]}" y2="${420 + ((next[1] * 13) % 60)}" stroke="#dc2626" stroke-width="1.5" opacity="0.5"/>
         <line x1="${x}" y1="${y2}" x2="${next[0]}" y2="${500 + ((next[1] * 29) % 70)}" stroke="#475569" stroke-width="1" opacity="0.6"/>
         <line x1="${x}" y1="${y1}" x2="${next[0]}" y2="${500 + ((next[1] * 29) % 70)}" stroke="#64748b" stroke-width="0.8" opacity="0.35"/>`
      : '';
    return `${line}
      <circle cx="${x}" cy="${y1}" r="5" fill="#ef4444"/>
      <circle cx="${x}" cy="${y2}" r="4" fill="#94a3b8"/>`;
  })
  .join('');

const aiSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="8" fill="#dc2626"/>
  <text x="60" y="150" font-family="${FONT}" font-size="26" font-weight="bold" fill="#f87171" letter-spacing="4">CANADA &#183; NATIONAL AI STRATEGY</text>
  <text x="60" y="235" font-family="${FONT}" font-size="68" font-weight="bold" fill="#ffffff">'AI for All'</text>
  <text x="60" y="310" font-family="${FONT}" font-size="40" font-weight="bold" fill="#e2e8f0">$200B Economic Injection</text>
  <text x="60" y="360" font-family="${FONT}" font-size="24" fill="#94a3b8">What it means for your salary, taxes &amp; career</text>
  ${net}
  <text x="60" y="600" font-family="${FONT}" font-size="18" font-weight="bold" fill="#f87171">CanPay Insights</text>
  <text x="220" y="600" font-family="${FONT}" font-size="16" fill="#64748b">canpayinsights.ca</text>
</svg>`;

await sharp(Buffer.from(minwageSvg)).png().toFile('public/blog/minimum-wage-take-home-2026.png');
await sharp(Buffer.from(aiSvg)).png().toFile('public/blog/ai-for-all-strategy-2026.png');
console.log('covers written to public/blog/');
