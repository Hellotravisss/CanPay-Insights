/**
 * The media pitch draft. Since 2026-09-22 the research page computes its own
 * figures from D1 on render, so this no longer generates or publishes anything
 * — it reads the page's own public JSON and writes drafts/media/pitch.md.
 *
 *   npx tsx scripts/genMediaStory.ts
 *
 * There is nothing to commit afterwards. If a figure here disagrees with the
 * page, the page is right and this script is stale.
 */
import { writeFileSync, mkdirSync } from 'node:fs';

const PAGE = 'https://canpayinsights.ca/research/pay-calculator-behaviour';
const OUT = 'drafts/media';
const fmt = (n: number) => n.toLocaleString('en-CA');

const s = await (await fetch(`${PAGE.replace(/\/research\/.*/, '')}/research/pay-behaviour.json`)).json();
mkdirSync(OUT, { recursive: true });

writeFileSync(`${OUT}/pitch.md`, `Subject: pay calculator data — ${s.raise.net.upShare}% end on a higher income

Hi [Name],

I read your piece on [specific article — one line on why it was good]. I run CanPay Insights, a free Canadian take-home-pay calculator, and I've published what ${fmt(s.n)} anonymous calculations show about how people use a pay number:

- Of visitors who changed the income they'd entered, ${s.raise.net.upShare}% ended on a higher figure than they started with. They're pricing a raise or an offer, not bracing for a cut.
- ${s.shifts.editedBefore7}% of the shifts people typed in start before 7 a.m., and ${s.shifts.editedNight}% start between 6 p.m. and 6 a.m. I don't know of a public dataset of when Canadian shifts begin.
- ${s.lang.nonEnglishShare}% of the calculations were done in a language other than English; Chinese alone was ${s.lang.zhShare}% of all calculations.
- ${s.move.share}% of visits price the same pay in two or more provinces in one sitting.

It's behaviour, not earnings: the sample is people who went looking for a pay calculator (${s.belowMedianShare}% of calculations are below their province's median wage), and the page says so, with the count behind every figure and how each was tested. The page keeps itself current and records what it said each day, so a figure you quote stays checkable:
${PAGE}

Free to cite, charts included. If a cut by province or income range would help your angle, I can pull one.

Travis Zhang
CanPay Insights · info@canpayinsights.ca

---

## Variant for a radio show (address is in the vault target list)

Replace the closing two lines with this — a radio show needs a person who can
say it out loud, not a page to cite:

> I can talk through any of this on tape, including what the data cannot say.
> The sample is people who came looking for a pay calculator, not a sample of
> Canadians, and I would rather say that on air than have it become the
> correction afterwards.
`);

console.log(`n=${s.n} · raise ${s.raise.net.upShare}% · before7 ${s.shifts.editedBefore7}% · lang ${s.lang.nonEnglishShare}% · move ${s.move.share}%`);
console.log(`→ ${OUT}/pitch.md (figures read live from the page)`);
