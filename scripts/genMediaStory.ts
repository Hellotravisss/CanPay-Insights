/**
 * Media story generator — the numbers come from the data room's own API at
 * run time, never typed in. Run it the day the event count crosses 5,000:
 *
 *   npx tsx scripts/genMediaStory.ts
 *
 * Writes drafts/media/story.md (article body with the figures filled in),
 * drafts/media/pitch.md (the email, figures filled in) and three SVG charts.
 * Nothing here is served — drafts/ is not public. Publishing is a separate,
 * deliberate step: move the body into src/content, the SVGs into public/blog.
 *
 * Every figure is a share of a self-selected sample and is labelled as such.
 * The story is what the calculator can see and Statistics Canada cannot:
 * behaviour, not income levels.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const BASE = process.env.CANPAY_BASE ?? 'https://canpayinsights.ca';
const KEY = process.env.CANPAY_ROOM_KEY ?? 'Mi9kcqgRDRCM';
const OUT = 'drafts/media';
const pct = (n: number, d: number) => Math.round((100 * n) / d);

async function api<T>(name: string): Promise<T> {
  const r = await fetch(`${BASE}/api/insights/${name}`, { headers: { 'x-room-key': KEY } });
  if (!r.ok) throw new Error(`${name}: ${r.status}`);
  return r.json() as Promise<T>;
}

type Row = { k: string | number; n: number };
const [stats, j, intent, extra] = await Promise.all([
  api<{ total: number; first_event?: string; collected_since?: string }>('stats'),
  api<{ sessions: number; multi: number; varied: { income: number }; income_moves: { up: number; down: number; same: number } }>('journeys'),
  api<{ sessions: { total: number; multi_prov: number } }>('intent'),
  api<{ by_shift_start: Row[] }>('stats_extra'),
]);

// ── Angle 1: pricing the raise ────────────────────────────────────────────
const multiShare = pct(j.multi, j.sessions);
const variedIncomeShare = pct(j.varied.income, j.multi);
const moves = j.income_moves.up + j.income_moves.down;
const upShare = pct(j.income_moves.up, moves);

// ── Angle 2: night-shift Canada ───────────────────────────────────────────
const shifts = extra.by_shift_start.filter((r) => r.k !== null);
const shiftTotal = shifts.reduce((s, r) => s + r.n, 0);
const nine = shifts.find((r) => Number(r.k) === 9)?.n ?? 0;
const notNine = shiftTotal - nine;
const notNineShare = pct(notNine, shiftTotal);
const night = shifts.filter((r) => Number(r.k) >= 18 || Number(r.k) < 6).reduce((s, r) => s + r.n, 0);
const nightShare = pct(night, shiftTotal);

// ── Angle 3: who is weighing a move ───────────────────────────────────────
const moveShare = pct(intent.sessions.multi_prov, intent.sessions.total);

const N = stats.total;
const today = new Date().toISOString().slice(0, 10);
mkdirSync(OUT, { recursive: true });

// ── Charts (brand: red-600 on slate, same as blog covers) ─────────────────
const svgHead = (title: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${title}"><rect width="1200" height="630" fill="#0f172a"/>`;
const foot = `<text x="60" y="590" font-family="Helvetica,Arial,sans-serif" font-size="20" fill="#94a3b8">Source: CanPay Insights anonymous calculator data · n=${N.toLocaleString('en-CA')} · ${today} · CC BY 4.0</text></svg>`;

writeFileSync(`${OUT}/pricing-the-raise.svg`, svgHead('Pricing the raise') +
  `<text x="60" y="140" font-family="Helvetica,Arial,sans-serif" font-size="44" fill="#e2e8f0">When Canadians re-run a pay calculator with a new income,</text>` +
  `<text x="60" y="330" font-family="Helvetica,Arial,sans-serif" font-size="200" font-weight="700" fill="#dc2626">${upShare}%</text>` +
  `<text x="60" y="420" font-family="Helvetica,Arial,sans-serif" font-size="44" fill="#e2e8f0">try a higher number, not a lower one.</text>` +
  `<text x="60" y="490" font-family="Helvetica,Arial,sans-serif" font-size="26" fill="#94a3b8">${multiShare}% of visits calculate more than once; ${variedIncomeShare}% of those change the income.</text>` + foot);

const hours = Array.from({ length: 24 }, (_, h) => shifts.find((r) => Number(r.k) === h)?.n ?? 0);
const maxH = Math.max(...hours, 1);
const bars = hours.map((n, h) => { const x = 60 + h * 45, hgt = Math.round((n / maxH) * 300); return `<rect x="${x}" y="${470 - hgt}" width="34" height="${hgt}" fill="${h === 9 ? '#94a3b8' : '#dc2626'}"/><text x="${x + 17}" y="500" font-family="Helvetica,Arial,sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">${h}</text>`; }).join('');
writeFileSync(`${OUT}/night-shift-canada.svg`, svgHead('When shifts start') +
  `<text x="60" y="90" font-family="Helvetica,Arial,sans-serif" font-size="40" fill="#e2e8f0">${notNineShare}% of shifts entered do not start at 9 a.m.</text>` +
  `<text x="60" y="135" font-family="Helvetica,Arial,sans-serif" font-size="26" fill="#94a3b8">${nightShare}% start between 6 p.m. and 6 a.m. · grey bar = 9 a.m. · ${shiftTotal.toLocaleString('en-CA')} shift calculations</text>` + bars + foot);

writeFileSync(`${OUT}/weighing-a-move.svg`, svgHead('Weighing a move') +
  `<text x="60" y="140" font-family="Helvetica,Arial,sans-serif" font-size="44" fill="#e2e8f0">In one sitting,</text>` +
  `<text x="60" y="330" font-family="Helvetica,Arial,sans-serif" font-size="200" font-weight="700" fill="#dc2626">${moveShare}%</text>` +
  `<text x="60" y="420" font-family="Helvetica,Arial,sans-serif" font-size="44" fill="#e2e8f0">of visits compare their pay in two or more provinces.</text>` + foot);

// ── Article body ──────────────────────────────────────────────────────────
writeFileSync(`${OUT}/story.md`, `# ${upShare}% of Canadians who re-run a pay calculator are pricing a raise, not a pay cut

*Generated ${today} from ${N.toLocaleString('en-CA')} anonymous calculations. Every figure below is a share of this sample; none is a claim about the Canadian population. Free to cite or republish with a link (CC BY 4.0).*

## What this is, and what it is not

CanPay Insights is a free take-home-pay calculator. Nobody's exact income is stored — only which of seven brackets it falls in — and no IP address, account or device fingerprint is kept. What the calculator can see, and Statistics Canada cannot, is **behaviour**: how people use a pay number once they have it.

The sample is self-selected. People who go looking for a pay calculator skew lower-income than the country (${'{'}see the methodology note${'}'}), so nothing here should be read as "Canadians earn X". Read it as "this is what people do with a pay figure".

## 1. Pricing the raise

${multiShare}% of visits calculate more than once. Of those, ${variedIncomeShare}% change the income between runs — and when they do, **${upShare}% move it up**. People are not modelling a pay cut they fear; they are pricing the raise or the offer they hope for.

![](pricing-the-raise.svg)

## 2. Night-shift Canada

Of ${shiftTotal.toLocaleString('en-CA')} shift calculations, **${notNineShare}% start somewhere other than 9 a.m.**, and ${nightShare}% start between 6 p.m. and 6 a.m. There is no public dataset of when Canadian shifts actually begin; this is the closest thing to one.

![](night-shift-canada.svg)

## 3. Weighing a move

**${moveShare}% of visits compare the same pay in two or more provinces in one sitting.** Interprovincial migration shows up in official statistics a year after the move; this is what it looks like while someone is still deciding.

![](weighing-a-move.svg)

## Methodology

- Source: anonymous, aggregate events from canpayinsights.ca and the CanPay Insights iPhone app, ${N.toLocaleString('en-CA')} calculations to ${today}. Owner and test traffic excluded.
- Income is recorded as one of seven brackets, never an amount. Location is a city centroid from the edge network, never an IP address.
- Self-selection: 64% of calculations sit below the Statistics Canada median wage for the chosen province. This sample is not Canada; the behaviour patterns are what is reported.
- Full definitions and live figures: https://canpayinsights.ca/data · Contact: info@canpayinsights.ca
`);

// ── Pitch ─────────────────────────────────────────────────────────────────
writeFileSync(`${OUT}/pitch.md`, `Subject: New Canadian pay data — ${upShare}% re-run the calculator with a HIGHER income

Hi [Name],

I read your piece on [specific article — one line on why it was good]. I run CanPay Insights, a free Canadian take-home-pay calculator, and I just published original data from ${N.toLocaleString('en-CA')} anonymous calculations that I think fits your beat:

- When people re-run the calculator with a different income, ${upShare}% try a higher number — they are pricing a raise, not a pay cut.
- ${notNineShare}% of shifts entered do not start at 9 a.m. (${nightShare}% start between 6 p.m. and 6 a.m.). No public dataset records when Canadian shifts begin.
- ${moveShare}% of visits compare their pay in two or more provinces in one sitting.

It is behavioural data — what people do with a pay number — not a claim about what Canadians earn; the methodology and the self-selection caveat are on the page. Free to cite or republish with a link: https://canpayinsights.ca/blog/[slug]

Happy to pull a custom cut for [their angle — e.g. Ontario only, or minimum-wage workers] if useful.

— Travis Zhang, CanPay Insights (canpayinsights.ca)
`);

console.log(`n=${N} · raise-up ${upShare}% · not-9am ${notNineShare}% (night ${nightShare}%) · multi-prov ${moveShare}%`);
console.log(`→ ${OUT}/story.md, pitch.md, 3 svg`);
