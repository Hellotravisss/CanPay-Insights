/**
 * Site-wide social share card. The old one was a flat red banner with no live
 * data; this one carries the brand mark and a real computed example, so the
 * preview itself proves the tool does something.
 */
import { writeFileSync } from 'node:fs';
import { getSalaryFigures } from '../lib/salaryFigures';

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');
const on = getSalaryFigures(80000, 'ontario');
const bc = getSalaryFigures(80000, 'bc');
const ab = getSalaryFigures(80000, 'alberta');
const qc = getSalaryFigures(80000, 'quebec');
const bars = [
  { l: 'BC', v: bc.netAnnual },
  { l: 'ON', v: on.netAnnual },
  { l: 'AB', v: ab.netAnnual },
  { l: 'QC', v: qc.netAnnual },
];
const max = Math.max(...bars.map((b) => b.v));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="CanPay Insights — Canadian take-home pay calculator">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <radialGradient id="glow" cx="72%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#dc2626" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#dc2626" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g stroke="#ffffff" stroke-opacity="0.06" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 105}" x2="1200" y2="${i * 105}"/>`).join('')}
  </g>

  <!-- brand mark -->
  <g transform="translate(96,84)">
    <rect width="64" height="64" rx="16" fill="#dc2626"/>
    <g transform="translate(17,13) scale(1.25)" fill="#ffffff">
      <rect x="10" y="2" width="4" height="3" rx="0.5"/>
      <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>
      <rect x="9" y="10" width="6" height="4" rx="0.5"/>
      <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z"/>
      <rect x="7" y="18" width="3" height="4" rx="0.5"/>
      <rect x="14" y="18" width="3" height="4" rx="0.5"/>
    </g>
    <text x="84" y="30" font-family="Inter,Helvetica,Arial,sans-serif" font-size="30" font-weight="800" fill="#ffffff">CanPay <tspan fill="#f87171" font-weight="400">Insights</tspan></text>
    <text x="84" y="56" font-family="Inter,Helvetica,Arial,sans-serif" font-size="17" fill="#94a3b8">canpayinsights.ca</text>
  </g>

  <text x="96" y="272" font-family="Inter,Helvetica,Arial,sans-serif" font-size="62" font-weight="800" fill="#ffffff">What you actually</text>
  <text x="96" y="342" font-family="Inter,Helvetica,Arial,sans-serif" font-size="62" font-weight="800" fill="#ffffff">take home.</text>
  <text x="96" y="400" font-family="Inter,Helvetica,Arial,sans-serif" font-size="25" fill="#cbd5e1">Free Canadian paycheque calculator · 2026 tax year</text>
  <text x="96" y="440" font-family="Inter,Helvetica,Arial,sans-serif" font-size="21" fill="#64748b">Every province · hourly, salary or timesheet · 10 languages</text>

  <!-- a real computed comparison, not decoration -->
  <g transform="translate(700,150)">
    <rect width="410" height="360" rx="24" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.12"/>
    <text x="32" y="48" font-family="Inter,Helvetica,Arial,sans-serif" font-size="17" font-weight="700" fill="#94a3b8">TAKE-HOME ON $80,000</text>
    ${bars
      .map((b, i) => {
        const w = Math.round((b.v / max) * 250);
        const y = 84 + i * 66;
        return `<text x="32" y="${y + 20}" font-family="Inter,Helvetica,Arial,sans-serif" font-size="20" font-weight="700" fill="#e2e8f0">${b.l}</text>
    <rect x="76" y="${y}" width="${w}" height="26" rx="6" fill="#dc2626"/>
    <text x="${86 + w}" y="${y + 20}" font-family="Inter,Helvetica,Arial,sans-serif" font-size="18" font-weight="700" fill="#ffffff">${money(b.v)}</text>`;
      })
      .join('\n    ')}
  </g>
</svg>
`;
writeFileSync('public/og-image.svg', svg);
console.log('og image written');
