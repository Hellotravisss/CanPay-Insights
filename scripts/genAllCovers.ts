/**
 * Every article cover, in the 2026-11 identity: npx tsx scripts/genAllCovers.ts
 *
 * Each article's imageUrl is /blog/covers/<stem>.png, and <stem> decides the look:
 *   src/content/covers/<stem>.json exists  → news data card (the article's own figures; the weekly routine writes this file)
 *   <province>-take-home-pay-guide-2026     → one big engine figure (median hourly wage, or take-home on $80,000)
 *   anything else                           → title on the brand gradient with a banknote pattern
 * Replaces genArticleCovers.ts, genProvinceCovers.ts and the hand-written SVG cards (2026-11-24).
 */
import { existsSync, readFileSync } from 'node:fs';
import { rawArticles } from '../src/content/articles-data';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import { PROVINCIAL_WAGES, annualFromHourly } from '../lib/provincialWages';
import { newsCover, titleCover, figureCover } from './brandCovers.mjs';

const STATCAN: Record<string, string> = {
  ontario: 'ON', bc: 'BC', alberta: 'AB', quebec: 'QC', manitoba: 'MB', saskatchewan: 'SK',
  'nova-scotia': 'NS', 'new-brunswick': 'NB', newfoundland: 'NL', pei: 'PE',
};
const LABEL: Record<string, string> = { tax: 'Tax guide', salary: 'Salary guide', province: 'Province guide', tips: 'Money guide', news: 'News', studies: 'Study' };
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');
const only = process.argv.slice(2);

const done = new Set<string>();
for (const a of rawArticles as any[]) {
  const url: string = a.imageUrl || '';
  const m = url.match(/^\/blog\/covers\/([a-z0-9-]+)\.png$/);
  if (!m) { if (url) console.warn(`skip ${a.slug}: imageUrl ${url} is not /blog/covers/<stem>.png`); continue; }
  const stem = m[1];
  if (done.has(stem) || (only.length && !only.includes(stem))) continue;
  done.add(stem);
  const spec = `src/content/covers/${stem}.json`;
  const prov = PROVINCE_SEO_CONFIGS.find((c) => stem === `${c.slug}-take-home-pay-guide-2026`);
  if (existsSync(spec)) {
    await newsCover(stem, JSON.parse(readFileSync(spec, 'utf8')));
  } else if (prov) {
    const code = STATCAN[prov.slug], hourly = code ? (PROVINCIAL_WAGES as any)['all-industries'][code] : null;
    const net80 = getSalaryFigures(80000, prov.slug).netAnnual;
    await figureCover(stem, {
      eyebrow: `${prov.name} · Take-home pay guide 2026`,
      figure: hourly ? `$${hourly.toFixed(2)}` : money(net80),
      caption: hourly ? `median full-time wage, per hour (about ${money(annualFromHourly(hourly))} a year)` : 'take-home on $80,000',
      source: hourly ? 'Statistics Canada wage data · CanPay Insights 2026 engine' : 'CanPay Insights 2026 engine',
    });
  } else {
    await titleCover(stem, { title: a.title, label: LABEL[a.category] ?? 'Guide', pattern: a.category === 'salary' ? 'waves' : 'rosette' });
  }
  console.log(`public/blog/covers/${stem}.png`);
}
console.log(done.size, 'covers');
