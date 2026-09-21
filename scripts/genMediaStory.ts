/**
 * Media story generator — the numbers come from the data room's own API at
 * run time, never typed in. Run it the day the event count crosses 5,000:
 *
 *   npx tsx scripts/genMediaStory.ts            # drafts only
 *   npx tsx scripts/genMediaStory.ts --publish  # + the public snapshot
 *
 * Writes drafts/media/pitch.md (the email, figures filled in) and three SVG
 * charts — none of it served. With --publish it ALSO writes the dated snapshot
 * the public page renders (content/research/pay-behaviour.json) and copies the
 * charts into public/research/. The public page reads only that snapshot: a
 * journalist sees the figures as of a stated day, never the live data room,
 * and never anything finer than a national share.
 *
 * Two traps this script was rewritten around on 2026-09-18:
 *  - The form opens on a 09:00–17:00 shift. "Share of shifts not starting at
 *    9" over all rows counts untouched defaults as nine-to-fives, so it is
 *    published only as a lower bound, next to the cut over edited schedules.
 *  - "Moves up" counted per step lets one visitor trying twenty figures cast
 *    twenty votes. The headline gives each session one vote (end vs start);
 *    the per-step and first-step-dropped counts are published beside it.
 *
 * Every figure is a share of a self-selected sample and is labelled as such —
 * "people who used the calculator", never "Canadians".
 */
import { writeFileSync, mkdirSync, copyFileSync } from 'node:fs';

const BASE = process.env.CANPAY_BASE ?? 'https://canpayinsights.ca';
const KEY = process.env.CANPAY_ROOM_KEY ?? 'Mi9kcqgRDRCM';
const OUT = 'drafts/media';
const PUBLISH = process.argv.includes('--publish');
const PAGE = 'https://canpayinsights.ca/research/pay-calculator-behaviour';
const pct = (n: number, d: number) => Math.round((100 * n) / d);
const fmt = (n: number) => n.toLocaleString('en-CA');

async function api<T>(name: string): Promise<T> {
  const r = await fetch(`${BASE}/api/insights/${name}`, { headers: { 'x-room-key': KEY } });
  if (!r.ok) throw new Error(`${name}: ${r.status}`);
  return r.json() as Promise<T>;
}

type Row = { k: string | number | null; n: number };
type UpDown = { up: number; down: number };
const [stats, j, intent, extra, baro] = await Promise.all([
  api<{ total: number; first_event: string; excluded_rows: number }>('stats'),
  api<{ sessions: number; multi: number; varied: { income: number }; income_moves: UpDown; income_moves_later: UpDown; income_moves_net: UpDown }>('journeys'),
  api<{ sessions: { total: number; multi_prov: number } }>('intent'),
  api<{ by_shift_start: Row[]; by_shift_start_edited: Row[] }>('stats_extra'),
  api<{ year: { below_median_share: number }[] }>('income_barometer'),
]);
if (!j.income_moves_net || !extra.by_shift_start_edited) throw new Error('data room API is older than this script — deploy first');

// ── 1. Pricing the raise ──────────────────────────────────────────────────
const share = (m: UpDown) => ({ up: m.up, down: m.down, n: m.up + m.down, upShare: pct(m.up, m.up + m.down) });
const net = share(j.income_moves_net);      // headline: one vote per session
const steps = share(j.income_moves);        // every step
const later = share(j.income_moves_later);  // first step of each session dropped
const multiShare = pct(j.multi, j.sessions);
const variedIncomeShare = pct(j.varied.income, j.multi);

// ── 2. When shifts start ──────────────────────────────────────────────────
const hoursOf = (rows: Row[]) => Array.from({ length: 24 }, (_, h) => rows.find((r) => r.k !== null && Number(r.k) === h)?.n ?? 0);
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const nightOf = (h: number[]) => sum(h.filter((_, i) => i >= 18 || i < 6));
const all = hoursOf(extra.by_shift_start), edited = hoursOf(extra.by_shift_start_edited);
const allTotal = sum(all), editedTotal = sum(edited);
const notNineFloor = pct(allTotal - all[9], allTotal);           // lower bound
const editedBefore7 = pct(sum(edited.slice(0, 7)), editedTotal); // starts 00:00–06:59
const editedNight = pct(nightOf(edited), editedTotal);
const nightFloor = pct(nightOf(all), allTotal);

// ── 3. Weighing a move ────────────────────────────────────────────────────
const moveShare = pct(intent.sessions.multi_prov, intent.sessions.total);

const belowMedianShare = Math.round(baro.year[baro.year.length - 1].below_median_share);
const N = stats.total;
const today = new Date().toISOString().slice(0, 10);
mkdirSync(OUT, { recursive: true });

// ── Charts ────────────────────────────────────────────────────────────────
const F = 'font-family="Helvetica,Arial,sans-serif"';
const head = (title: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" role="img" aria-label="${title}"><rect width="1200" height="630" fill="#0f172a"/>`;
const foot = `<text x="60" y="590" ${F} font-size="20" fill="#94a3b8">Source: CanPay Insights, anonymous calculator use · ${fmt(N)} calculations to ${today} · self-selected sample · CC BY 4.0</text></svg>`;

writeFileSync(`${OUT}/pricing-the-raise.svg`, head('Pricing the raise') +
  `<text x="60" y="95" ${F} font-size="40" fill="#e2e8f0">Of visitors who changed the income</text>` +
  `<text x="60" y="145" ${F} font-size="40" fill="#e2e8f0">on a Canadian pay calculator,</text>` +
  `<text x="60" y="345" ${F} font-size="200" font-weight="700" fill="#dc2626">${net.upShare}%</text>` +
  `<text x="60" y="430" ${F} font-size="40" fill="#e2e8f0">ended on a higher figure than they started with.</text>` +
  `<text x="60" y="495" ${F} font-size="24" fill="#94a3b8">${fmt(net.n)} visits · ${steps.upShare}% counting every change · ${later.upShare}% ignoring each visit's first change</text>` + foot);

const maxH = Math.max(...edited, 1);
const bars = edited.map((n, h) => { const x = 60 + h * 45, hgt = Math.round((n / maxH) * 270); return `<rect x="${x}" y="${470 - hgt}" width="34" height="${hgt}" fill="${h >= 18 || h < 6 ? '#dc2626' : '#64748b'}"/><text x="${x + 17}" y="500" ${F} font-size="16" fill="#94a3b8" text-anchor="middle">${h}</text>`; }).join('');
writeFileSync(`${OUT}/night-shift-canada.svg`, head('When shifts start') +
  `<text x="60" y="90" ${F} font-size="40" fill="#e2e8f0">${editedBefore7}% of the shifts people typed in start before 7 a.m.</text>` +
  `<text x="60" y="130" ${F} font-size="24" fill="#94a3b8">${editedNight}% start between 6 p.m. and 6 a.m. (red).</text>` +
  `<text x="60" y="162" ${F} font-size="24" fill="#94a3b8">Start hour of ${fmt(editedTotal)} schedules that visitors changed from the form's 9-to-5 default.</text>` + bars + foot);

writeFileSync(`${OUT}/weighing-a-move.svg`, head('Weighing a move') +
  `<text x="60" y="140" ${F} font-size="44" fill="#e2e8f0">In one sitting,</text>` +
  `<text x="60" y="330" ${F} font-size="200" font-weight="700" fill="#dc2626">${moveShare}%</text>` +
  `<text x="60" y="420" ${F} font-size="44" fill="#e2e8f0">of visits price the same pay in two or more provinces.</text>` +
  `<text x="60" y="490" ${F} font-size="26" fill="#94a3b8">${fmt(intent.sessions.total)} visits</text>` + foot);

// ── Pitch ─────────────────────────────────────────────────────────────────
writeFileSync(`${OUT}/pitch.md`, `Subject: pay calculator data — ${net.upShare}% end on a higher income

Hi [Name],

I read your piece on [specific article — one line on why it was good]. I run CanPay Insights, a free Canadian take-home-pay calculator, and I've published what ${fmt(N)} anonymous calculations show about how people use a pay number:

- Of visitors who changed the income they'd entered, ${net.upShare}% ended on a higher figure than they started with. They're pricing a raise or an offer, not bracing for a cut.
- ${editedBefore7}% of the shifts people typed in start before 7 a.m., and ${editedNight}% start between 6 p.m. and 6 a.m. I don't know of a public dataset of when Canadian shifts begin.
- ${moveShare}% of visits price the same pay in two or more provinces in one sitting — interprovincial moves while they're still being weighed.

It's behaviour, not earnings: the sample is people who went looking for a pay calculator (${belowMedianShare}% of calculations are below their province's median wage), and the page says so, with the count behind every figure and how each was tested:
${PAGE}

Free to cite, charts included. If a cut by province or income range would help your angle, I can pull one.

Travis Zhang
CanPay Insights · info@canpayinsights.ca

---

## Variant for CBC Radio "Cost of Living" (costofliving@cbc.ca)

Replace the closing two lines with this — a radio show needs a person who can
say it out loud, not a page to cite:

> I can talk through any of this on tape, including what the data cannot say.
> The sample is people who came looking for a pay calculator, not a sample of
> Canadians, and I would rather say that on air than have it become the
> correction afterwards.
`);

const snapshot = {
  generated: today, since: stats.first_event.slice(0, 10), n: N, sessions: j.sessions, excluded: stats.excluded_rows,
  raise: { multiShare, multiSessions: j.multi, variedIncomeShare, net, steps, later },
  shifts: { allTotal, editedTotal, defaultRows: allTotal - editedTotal, notNineFloor, nightFloor, editedBefore7, editedNight, edited },
  move: { share: moveShare, sessions: intent.sessions.total, multiProv: intent.sessions.multi_prov },
  belowMedianShare,
};
console.log(JSON.stringify({ ...snapshot, shifts: { ...snapshot.shifts, edited: '…' } }, null, 1));

if (PUBLISH) {
  mkdirSync('content/research', { recursive: true });
  mkdirSync('public/research', { recursive: true });
  for (const f of ['pricing-the-raise', 'night-shift-canada', 'weighing-a-move']) copyFileSync(`${OUT}/${f}.svg`, `public/research/${f}.svg`);
  writeFileSync('content/research/pay-behaviour.json', JSON.stringify(snapshot, null, 2) + '\n');
  console.log('→ PUBLISHED SNAPSHOT: content/research/pay-behaviour.json + public/research/*.svg');
}
