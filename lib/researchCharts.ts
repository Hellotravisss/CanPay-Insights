import type { PayBehaviour } from './payBehaviour';

/**
 * The research note's charts, drawn from the same live object the prose uses.
 *
 * They were committed SVG files until 2026-09-22, with the numbers baked in at
 * generation time. That was safe only while the page itself was a snapshot; the
 * moment the text went live, a stale chart would have contradicted the sentence
 * above it. Nothing here may hold a figure that is not passed in.
 */
const F = 'font-family="Helvetica,Arial,sans-serif"';
const fmt = (n: number) => n.toLocaleString('en-CA');

const head = (title: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${title}"><rect width="1200" height="630" fill="#0f172a"/>`;
const foot = (s: PayBehaviour) =>
  `<text x="60" y="590" ${F} font-size="20" fill="#94a3b8">CanPay Insights · ${fmt(s.n)} calculations to ${s.generated} · self-selected sample · CC BY 4.0</text></svg>`;

const big = (s: PayBehaviour, title: string, lead: string[], figure: string, tail: string, notes: string[]) =>
  head(title) +
  lead.map((t, i) => `<text x="60" y="${95 + i * 50}" ${F} font-size="40" fill="#e2e8f0">${t}</text>`).join('') +
  `<text x="60" y="${lead.length > 1 ? 355 : 330}" ${F} font-size="200" font-weight="700" fill="#dc2626">${figure}</text>` +
  `<text x="60" y="${lead.length > 1 ? 430 : 420}" ${F} font-size="40" fill="#e2e8f0">${tail}</text>` +
  notes.map((t, i) => `<text x="60" y="${488 + i * 36}" ${F} font-size="${i ? 22 : 24}" fill="#94a3b8">${t}</text>`).join('') +
  foot(s);

export const CHARTS = ['pricing-the-raise', 'night-shift-canada', 'weighing-a-move', 'in-which-language', 'the-sample'] as const;
export type ChartName = (typeof CHARTS)[number];

export function chart(name: string, s: PayBehaviour): string | null {
  if (name === 'pricing-the-raise')
    return big(s, 'Pricing the raise',
      ['Of visitors who changed the income', 'on a Canadian pay calculator,'],
      `${s.raise.net.upShare}%`, 'ended on a higher figure than they started with.',
      [`${fmt(s.raise.net.n)} visits · ${s.raise.steps.upShare}% counting every change · ${s.raise.later.upShare}% ignoring each visit's first change`]);

  if (name === 'weighing-a-move')
    return big(s, 'Weighing a move', ['In one sitting,'], `${s.move.share}%`,
      'of visits price the same pay in two or more provinces.', [`${fmt(s.move.sessions)} visits`]);

  if (name === 'in-which-language') {
    const rest = s.lang.bars.slice(1).map((x) => `${x.name} ${fmt(x.n)}`).join(' · ');
    return big(s, 'In which language',
      ['Of the calculations done in a language', 'other than English —'],
      `${s.lang.zhShare}%`, 'of everything was done in Chinese.',
      [`${s.lang.nonEnglishShare}% were not in English at all.`,
       `Of ten languages offered, the rest: ${rest}.`]);
  }

  if (name === 'night-shift-canada') {
    const max = Math.max(...s.shifts.edited, 1);
    const bars = s.shifts.edited.map((n, h) => {
      const x = 60 + h * 45, hgt = Math.round((n / max) * 270);
      return `<rect x="${x}" y="${470 - hgt}" width="34" height="${hgt}" fill="${h >= 18 || h < 6 ? '#dc2626' : '#64748b'}"/>` +
        `<text x="${x + 17}" y="500" ${F} font-size="16" fill="#94a3b8" text-anchor="middle">${h}</text>`;
    }).join('');
    return head('When shifts start') +
      `<text x="60" y="90" ${F} font-size="40" fill="#e2e8f0">${s.shifts.editedBefore7}% of the shifts people typed in start before 7 a.m.</text>` +
      `<text x="60" y="130" ${F} font-size="24" fill="#94a3b8">${s.shifts.editedNight}% start between 6 p.m. and 6 a.m. (red).</text>` +
      `<text x="60" y="162" ${F} font-size="24" fill="#94a3b8">Start hour of ${fmt(s.shifts.editedTotal)} schedules that visitors changed from the form's 9-to-5 default.</text>` +
      bars + foot(s);
  }

  if (name === 'the-sample') {
    const d = s.sample.daily, max = Math.max(...d.map((x) => x.n), 1);
    // Capped, so a handful of days does not draw one bar across the whole canvas.
    const bw = Math.min(40, Math.max(3, Math.floor(1080 / Math.max(d.length, 1))));
    return head('The sample') +
      `<text x="60" y="95" ${F} font-size="40" fill="#e2e8f0">${fmt(s.n)} calculations over ${d.length} ${d.length === 1 ? 'day' : 'days'},</text>` +
      `<text x="60" y="145" ${F} font-size="40" fill="#e2e8f0">${s.sample.caShare}% of them from inside Canada.</text>` +
      d.map((x, i) => {
        const hgt = Math.round((x.n / max) * 300);
        return `<rect x="${60 + i * bw}" y="${490 - hgt}" width="${Math.max(2, bw - 2)}" height="${hgt}" fill="#dc2626"/>`;
      }).join('') +
      `<text x="60" y="525" ${F} font-size="22" fill="#94a3b8">${d[0]?.k ?? ''}</text>` +
      `<text x="1140" y="525" ${F} font-size="22" fill="#94a3b8" text-anchor="end">${d[d.length - 1]?.k ?? ''}</text>` +
      `<text x="600" y="525" ${F} font-size="22" fill="#94a3b8" text-anchor="middle">one bar = one day · busiest ${max}</text>` +
      foot(s);
  }
  return null;
}
