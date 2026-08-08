/**
 * Branded cover art for the provincial guides. Each cover carries that
 * province's own headline number, so the thumbnail itself says something true
 * rather than being decoration.
 */
import { writeFileSync } from 'node:fs';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import { PROVINCIAL_WAGES, annualFromHourly } from '../lib/provincialWages';

const STATCAN_CODE: Record<string, string> = {
  ontario: 'ON', bc: 'BC', alberta: 'AB', quebec: 'QC', manitoba: 'MB',
  saskatchewan: 'SK', 'nova-scotia': 'NS', 'new-brunswick': 'NB',
  newfoundland: 'NL', pei: 'PE',
};
// A distinct accent per province keeps the blog index from looking like one
// article repeated 13 times.
const ACCENT: Record<string, [string, string]> = {
  ontario: ['#dc2626', '#7f1d1d'], bc: ['#0d9488', '#134e4a'], alberta: ['#f97316', '#7c2d12'],
  quebec: ['#2563eb', '#1e3a8a'], manitoba: ['#7c3aed', '#4c1d95'], saskatchewan: ['#16a34a', '#14532d'],
  'nova-scotia': ['#0284c7', '#0c4a6e'], 'new-brunswick': ['#ca8a04', '#713f12'],
  newfoundland: ['#be123c', '#4c0519'], pei: ['#db2777', '#831843'],
  yukon: ['#0891b2', '#164e63'], 'northwest-territories': ['#4f46e5', '#312e81'],
  nunavut: ['#475569', '#1e293b'],
};

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');

for (const cfg of PROVINCE_SEO_CONFIGS) {
  const code = STATCAN_CODE[cfg.slug];
  const hourly = code ? PROVINCIAL_WAGES['all-industries'][code] : null;
  const net80 = getSalaryFigures(80000, cfg.slug).netAnnual;
  const [c1, c2] = ACCENT[cfg.slug] ?? ['#dc2626', '#7f1d1d'];

  const headline = hourly ? `$${hourly.toFixed(2)}` : money(net80);
  const caption = hourly
    ? `median full-time wage, per hour`
    : `take-home on $80,000`;
  const sub = hourly
    ? `≈ ${money(annualFromHourly(hourly))}/yr · ${money(net80)} take-home on $80k`
    : `2026 tax year`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${cfg.name} take-home pay guide 2026">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#fade)"/>

  <!-- graph paper -->
  <g stroke="#ffffff" stroke-opacity="0.10" stroke-width="1">
    ${Array.from({ length: 11 }, (_, i) => `<line x1="${i * 120}" y1="0" x2="${i * 120}" y2="630"/>`).join('')}
    ${Array.from({ length: 6 }, (_, i) => `<line x1="0" y1="${i * 126}" x2="1200" y2="${i * 126}"/>`).join('')}
  </g>

  <!-- rising bars, drawn from the province's own salary ladder -->
  <g opacity="0.22">
    ${[40000, 60000, 80000, 100000, 150000]
      .map((s, i) => {
        const h = Math.round((getSalaryFigures(s, cfg.slug).netAnnual / 120000) * 300);
        return `<rect x="${760 + i * 78}" y="${560 - h}" width="52" height="${h}" rx="8" fill="#ffffff"/>`;
      })
      .join('')}
  </g>

  <!-- logo -->
  <g transform="translate(72,64)">
    <rect width="56" height="56" rx="14" fill="#ffffff" fill-opacity="0.95"/>
    <g transform="translate(16,12) scale(1.05)" fill="${c1}">
      <rect x="10" y="2" width="4" height="3" rx="0.5"/>
      <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>
      <rect x="9" y="10" width="6" height="4" rx="0.5"/>
      <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"/>
      <rect x="7" y="18" width="3" height="4" rx="0.5"/>
      <rect x="14" y="18" width="3" height="4" rx="0.5"/>
    </g>
    <text x="72" y="37" font-family="Inter,Helvetica,Arial,sans-serif" font-size="26" font-weight="700" fill="#ffffff">CanPay Insights</text>
  </g>

  <text x="72" y="228" font-family="Inter,Helvetica,Arial,sans-serif" font-size="22" font-weight="700" letter-spacing="4" fill="#ffffff" fill-opacity="0.75">${cfg.name.toUpperCase()} · 2026</text>
  <text x="72" y="316" font-family="Inter,Helvetica,Arial,sans-serif" font-size="66" font-weight="800" fill="#ffffff">Take-home pay guide</text>

  <text x="72" y="452" font-family="Inter,Helvetica,Arial,sans-serif" font-size="104" font-weight="800" fill="#ffffff">${headline}</text>
  <text x="72" y="492" font-family="Inter,Helvetica,Arial,sans-serif" font-size="24" fill="#ffffff" fill-opacity="0.8">${caption}</text>
  <text x="72" y="536" font-family="Inter,Helvetica,Arial,sans-serif" font-size="20" fill="#ffffff" fill-opacity="0.65">${sub}</text>

  <text x="72" y="592" font-family="Inter,Helvetica,Arial,sans-serif" font-size="17" fill="#ffffff" fill-opacity="0.55">Statistics Canada wage data · CanPay Insights 2026 tax engine</text>
</svg>
`;
  writeFileSync(`public/blog/${cfg.slug}-take-home-pay-guide-2026.svg`, svg);
}
console.log('covers written:', PROVINCE_SEO_CONFIGS.length);
