/** Every figure the minimum-wage study prints, from one wage table. */
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency, Province } from '../types';
import { MIN_WAGES } from './minWages';
const H = 2080;
// Current rates from scripts/minWages.ts (gated by audit:minwage). Env vars
// still override one jurisdiction, e.g. ON=17.60 for a before/after article.
// The defaults here used to be a second, hand-kept copy that still held the
// pre-October-2026 rates after the study had moved on.
const W: Array<[Province, string, number]> = MIN_WAGES.map((w) => [w.province, w.label, Number(process.env[w.code] ?? w.wage)]);
const m = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');
const rows = W.map(([p, label, wage]) => {
  const gross = wage * H;
  const r: any = calculateFromAnnualSalary({ annualSalary: gross, province: p, payFrequency: PayFrequency.BI_WEEKLY } as any);
  return { p, label, wage, gross, net: r.netPayAnnual, mo: r.netPayAnnual / 12, hr: r.netPayAnnual / H, rate: (100 * r.totalDeductionsAnnual) / gross };
}).sort((a, b) => b.net - a.net);
console.log('| Province | Min. wage | Gross (full-time) | Take-home / year | Take-home / month | Net hourly | Deduction rate |');
console.log('| --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) console.log(`| ${r.label} | $${r.wage.toFixed(2)} | ${m(r.gross)} | **${m(r.net)}** | ${m(r.mo)} | $${r.hr.toFixed(2)} | ${r.rate.toFixed(1)}% |`);
const by = (l: string) => rows.find((r) => r.label.startsWith(l))!;
const top = rows[0], bot = rows[rows.length - 1];
const provs = rows.filter((r) => !['Nunavut', 'Yukon', 'Northwest Territories'].includes(r.label));
const maxRate = rows.reduce((a, b) => (a.rate > b.rate ? a : b)), minRate = rows.reduce((a, b) => (a.rate < b.rate ? a : b));
console.log('\nPROSE');
console.log(`top ${top.label} ${m(top.net)} @ $${top.wage}; bottom ${bot.label} ${m(bot.net)} @ $${bot.wage}; national gap ${m(top.net - bot.net)}`);
console.log(`best province (excl. territories): ${provs[0].label} ${m(provs[0].net)} @ $${provs[0].wage}; 2nd ${provs[1].label} ${m(provs[1].net)} @ $${provs[1].wage}; diff ${m(provs[0].net - provs[1].net)}/yr = ${m((provs[0].net - provs[1].net) / 12)}/mo`);
console.log(`deduction rate range ${minRate.rate.toFixed(1)}% (${minRate.label}) – ${maxRate.rate.toFixed(1)}% (${maxRate.label}); max kept ${(100 - minRate.rate).toFixed(1)}%`);
console.log(`PE vs QC monthly diff ${(by('Prince').mo - by('Quebec').mo).toFixed(0)}; SK vs MB annual net gap ${(by('Saskatchewan').net - by('Manitoba').net).toFixed(0)} (SK wage ${by('Saskatchewan').wage}, MB ${by('Manitoba').wage})`);
console.log(`BC vs ON: ${m(by('British').net - by('Ontario').net)}/yr, ${m((by('British').net - by('Ontario').net) / 12)}/mo`);
for (const l of ['Nunavut', 'Ontario', 'Quebec', 'Alberta']) { const r = by(l); console.log(`advertised $${r.wage.toFixed(2)} → $${r.hr.toFixed(2)} in the bank (${r.label})`); }
const on = by('Ontario');
console.log(`Ontario: gross ${m(on.gross)}, net ${m(on.net)}, monthly ${m(on.mo)}`);
