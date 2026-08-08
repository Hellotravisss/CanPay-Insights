/**
 * Generates src/content/articles-province-2026.ts — one guide per province and
 * territory, built ONLY from data we can stand behind:
 *   • Statistics Canada median wages by industry (lib/provincialWages.ts)
 *   • our own 2026 tax engine (lib/salaryFigures.ts)
 * No speculative salary ranges: that is exactly what got the old province
 * guides pruned. Re-run after either dataset changes.
 */
import { writeFileSync } from 'node:fs';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import {
  PROVINCIAL_WAGES,
  INDUSTRY_LABELS,
  WAGE_DATA_YEAR,
  annualFromHourly,
} from '../lib/provincialWages';

const STATCAN_CODE: Record<string, string> = {
  ontario: 'ON', bc: 'BC', alberta: 'AB', quebec: 'QC', manitoba: 'MB',
  saskatchewan: 'SK', 'nova-scotia': 'NS', 'new-brunswick': 'NB',
  newfoundland: 'NL', pei: 'PE',
};

// Where people actually work, for the opening line. Facts, not filler.
const CITIES: Record<string, string> = {
  ontario: 'Toronto, Ottawa, Mississauga, Hamilton and London',
  bc: 'Vancouver, Surrey, Burnaby, Victoria and Kelowna',
  alberta: 'Calgary, Edmonton, Red Deer and Lethbridge',
  quebec: 'Montreal, Quebec City, Laval and Gatineau',
  manitoba: 'Winnipeg, Brandon and Steinbach',
  saskatchewan: 'Saskatoon, Regina and Prince Albert',
  'nova-scotia': 'Halifax, Sydney and Truro',
  'new-brunswick': 'Moncton, Saint John and Fredericton',
  newfoundland: "St. John's, Mount Pearl and Corner Brook",
  pei: 'Charlottetown and Summerside',
  yukon: 'Whitehorse',
  'northwest-territories': 'Yellowknife',
  nunavut: 'Iqaluit',
};

const money = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');
const pct = (n: number) => (n * 100).toFixed(1) + '%';
const SALARIES = [40000, 60000, 80000, 100000, 150000];
const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');

type Guide = { slug: string; article: string };
const guides: Guide[] = [];

for (const cfg of PROVINCE_SEO_CONFIGS) {
  const { slug, name } = cfg;
  const code = STATCAN_CODE[slug];
  const cities = CITIES[slug] ?? name;

  const wages = code
    ? Object.keys(PROVINCIAL_WAGES)
        .filter((i) => i !== 'all-industries' && PROVINCIAL_WAGES[i]?.[code])
        .map((i) => ({ slug: i, label: INDUSTRY_LABELS[i], hourly: PROVINCIAL_WAGES[i][code] }))
        .sort((a, b) => b.hourly - a.hourly)
    : [];
  const allInd = code ? PROVINCIAL_WAGES['all-industries'][code] : null;

  // Take-home ladder — every figure computed, none typed by hand.
  const ladder = SALARIES.map((s) => {
    const f = getSalaryFigures(s, slug);
    return { s, net: f.netAnnual, monthly: f.netMonthly, rate: f.totalDeductionRate, marginal: f.marginalRate };
  });

  const medianAnnual = allInd ? annualFromHourly(allInd) : null;
  const medianFig = medianAnnual ? getSalaryFigures(medianAnnual, slug) : null;

  // Compare the same salary across every province, so the guide can say where
  // this one actually ranks instead of asserting it.
  const rank80 = PROVINCE_SEO_CONFIGS.map((p) => ({
    name: p.name,
    net: getSalaryFigures(80000, p.slug).netAnnual,
  })).sort((a, b) => b.net - a.net);
  const position = rank80.findIndex((r) => r.name === name) + 1;
  const best = rank80[0];
  const own = rank80[position - 1];
  const gapToBest = best.net - own.net;

  const ladderTable = [
    '| Gross salary | Take-home (year) | Per month | Kept |',
    '| --- | --- | --- | --- |',
    ...ladder.map(
      (r) => `| ${money(r.s)} | **${money(r.net)}** | ${money(r.monthly)} | ${pct(1 - r.rate)} |`
    ),
  ].join('\n');

  const wageTable = wages.length
    ? [
        '| Industry | Median wage | ≈ Annual | Take-home |',
        '| --- | --- | --- | --- |',
        ...wages.map((w) => {
          const a = annualFromHourly(w.hourly);
          return `| ${w.label} | $${w.hourly.toFixed(2)}/hr | ${money(a)} | ${money(
            getSalaryFigures(a, slug).netAnnual
          )} |`;
        }),
      ].join('\n')
    : '';

  const rankTable = [
    '| Rank | Province | Take-home on $80,000 |',
    '| --- | --- | --- |',
    ...rank80.slice(0, 6).map((r, i) => `| ${i + 1} | ${r.name}${r.name === name ? ' ←' : ''} | ${money(r.net)} |`),
  ].join('\n');

  const wageSection = wages.length
    ? `## What each industry pays in ${name}

Statistics Canada publishes the median wage of full-time employees by industry. Here is every sector it reports for ${name}, with what each one leaves after ${name} tax, federal tax, CPP and EI in 2026.

${wageTable}

The best-paid sector reported here is ${wages[0].label.toLowerCase()} at $${wages[0].hourly.toFixed(
        2
      )} an hour; the lowest is ${wages[wages.length - 1].label.toLowerCase()} at $${wages[
        wages.length - 1
      ].hourly.toFixed(2)}. That gap — $${(wages[0].hourly - wages[wages.length - 1].hourly).toFixed(
        2
      )} an hour — works out to about ${money(
        annualFromHourly(wages[0].hourly - wages[wages.length - 1].hourly)
      )} a year before tax.`
    : `## Wage data for ${name}

Statistics Canada does not publish median wages by industry for the territories in Table 14-10-0064-01, so this guide does not estimate them. The take-home figures below come from the 2026 tax rules, which do apply.`;

  const medianSection = medianAnnual && medianFig
    ? `## The typical ${name} paycheque

Across all industries, the median full-time wage in ${name} is $${allInd!.toFixed(
        2
      )} an hour — about ${money(medianAnnual)} a year. After federal tax, ${name} tax, CPP/CPP2 and EI, a single employee on that salary keeps roughly **${money(
        medianFig.netAnnual
      )} a year**, or ${money(medianFig.netMonthly)} a month. That is ${pct(
        1 - medianFig.totalDeductionRate
      )} of gross pay.`
    : '';

  const content = `${medianSection}

## Take-home pay in ${name} at every salary level

Nobody is paid an "average". Here is what specific salaries actually leave in ${name} for the 2026 tax year — federal tax, provincial tax, CPP/CPP2 and EI, for a single employee with no extra credits.

${ladderTable}

Notice how the share you keep falls as the salary rises: that is Canada's progressive tax system working as designed. At ${money(
    ladder[0].s
  )} you keep ${pct(1 - ladder[0].rate)}; at ${money(ladder[ladder.length - 1].s)} you keep ${pct(
    1 - ladder[ladder.length - 1].rate
  )}.

${wageSection}

## How ${name} compares with the rest of Canada

On an $80,000 salary, ${name} ranks **#${position} of 13** provinces and territories for take-home pay in 2026.

${rankTable}

${
  gapToBest > 0
    ? `The difference between ${name} and ${best.name}, the highest, is ${money(
        gapToBest
      )} a year on the same $80,000 salary — about ${money(gapToBest / 12)} a month.`
    : `${name} is the highest in the country on that salary. The next province keeps ${money(
        rank80[1].net
      )}, a difference of ${money(own.net - rank80[1].net)} a year.`
}

Take-home pay is only one side of a move, of course: rent, groceries and childcare vary as much as tax does. But it is the side most people guess at, and it is the side that can be calculated exactly.

## Where people work in ${name}

Most ${name} employees are in ${cities}. Wherever you are in the province, the provincial tax rules are the same — there is no city income tax anywhere in Canada, so your postal code changes your rent, not your deductions.

## Run your own numbers

Every figure above is a median or a computed example. Your own pay depends on your exact salary or hourly rate, overtime, shift premiums, RRSP contributions and benefits. The [take-home pay calculator](/) handles all of it for ${name} and every other province, for the 2026 tax year, with no signup.

*Wage figures: Statistics Canada, Table 14-10-0064-01, median hourly wage of full-time employees, ${WAGE_DATA_YEAR}, annualised at 2,080 hours. Take-home figures: CanPay Insights 2026 tax engine (federal and provincial income tax, CPP/CPP2, EI) for a single employee with no additional credits.*`;

  const faq = [
    {
      question: `What is the average salary in ${name}?`,
      answer: medianAnnual
        ? `The median full-time wage in ${name} is $${allInd!.toFixed(2)} an hour, about ${money(
            medianAnnual
          )} a year before tax, according to Statistics Canada's ${WAGE_DATA_YEAR} employee wage data. Median means half of full-time workers earn more and half earn less — a more useful number than an average, which a small number of very high earners can distort.`
        : `Statistics Canada does not publish a median wage for ${name} in its industry wage table, so this guide does not estimate one.`,
    },
    {
      question: `What is the take-home pay on $80,000 in ${name}?`,
      answer: `About ${money(
        getSalaryFigures(80000, slug).netAnnual
      )} a year, or ${money(
        getSalaryFigures(80000, slug).netMonthly
      )} a month, after federal tax, ${name} provincial tax, CPP/CPP2 and EI for the 2026 tax year, for a single employee with no additional credits.`,
    },
    {
      question: `Does ${name} have high taxes compared with other provinces?`,
      answer:
        gapToBest > 0
          ? `On an $80,000 salary, ${name} ranks #${position} of 13 provinces and territories for take-home pay in 2026, keeping ${money(
              own.net
            )}. That is ${money(gapToBest)} a year less than ${best.name}, the highest.`
          : `On an $80,000 salary, ${name} keeps the most take-home pay in the country in 2026 — ${money(
              own.net
            )} a year.`,
    },
    {
      question: `Which industry pays best in ${name}?`,
      answer: wages.length
        ? `Of the sectors Statistics Canada reports for ${name}, ${wages[0].label.toLowerCase()} has the highest median full-time wage at $${wages[0].hourly.toFixed(
            2
          )} an hour — roughly ${money(annualFromHourly(wages[0].hourly))} a year, or ${money(
            getSalaryFigures(annualFromHourly(wages[0].hourly), slug).netAnnual
          )} after tax.`
        : `Statistics Canada does not publish industry wage medians for ${name}.`,
    },
    {
      question: `How much of my pay do I keep in ${name}?`,
      answer: `It depends on the salary. In ${name} in 2026, someone earning ${money(
        40000
      )} keeps about ${pct(1 - ladder[0].rate)} of gross pay, while someone earning ${money(
        150000
      )} keeps about ${pct(1 - ladder[ladder.length - 1].rate)}. The rest goes to federal tax, provincial tax, CPP/CPP2 and EI.`,
    },
  ];

  const directAnswer = medianAnnual
    ? `The median full-time wage in ${name} is $${allInd!.toFixed(2)} an hour, about ${money(
        medianAnnual
      )} a year, which leaves roughly ${money(
        medianFig!.netAnnual
      )} after tax in 2026. On an $80,000 salary, ${name} ranks #${position} of 13 provinces and territories for take-home pay, keeping ${money(
        own.net
      )}.`
    : `On an $80,000 salary, ${name} ranks #${position} of 13 provinces and territories for take-home pay in 2026, keeping ${money(
        own.net
      )} after federal tax, territorial tax, CPP and EI.`;

  const article = `  {
    id: 'province-2026-${slug}',
    slug: '${slug}-take-home-pay-guide-2026',
    title: ${JSON.stringify(`${name} Take-Home Pay Guide 2026: Real Wages, Real Deductions`)},
    subtitle: ${JSON.stringify(
      `What ${name} workers actually earn by industry — and what lands in the bank after tax`
    )},
    excerpt: ${JSON.stringify(
      medianAnnual
        ? `The median full-time wage in ${name} is $${allInd!.toFixed(2)} an hour. Here is what that, and every other salary level, leaves after 2026 tax — with Statistics Canada wage data for every industry.`
        : `What salaries in ${name} leave after federal and territorial tax, CPP and EI in 2026, and how the territory compares with the rest of Canada.`
    )},
    metaTitle: ${JSON.stringify(`${name} Take-Home Pay Guide 2026 | Wages by Industry`)},
    metaDescription: ${JSON.stringify(
      medianAnnual
        ? `${name}'s median full-time wage is $${allInd!.toFixed(2)}/hr. See take-home pay at every salary, wages for every industry, and how ${name} ranks (#${position} of 13) for 2026.`
        : `See take-home pay at every salary level in ${name} for 2026, and how it ranks (#${position} of 13) against every other province and territory.`
    )},
    keywords: ${JSON.stringify([
      `${name} salary`,
      `${name} take home pay`,
      `${name} average salary 2026`,
      `${name} paycheck calculator`,
      `${name} income tax 2026`,
      `wages in ${name}`,
    ])},
    category: 'province',
    tags: ${JSON.stringify([name, 'take-home pay', 'wages', '2026'])},
    province: '${name}',
    publishedAt: '2026-08-08',
    readTime: ${wages.length ? 8 : 6},
    imageUrl: '/blog/${slug}-take-home-pay-guide-2026.png',
    directAnswer: ${JSON.stringify(directAnswer)},
    faq: ${JSON.stringify(faq, null, 6).replace(/\n/g, '\n    ')},
    content: \`${esc(content)}\`,
  },`;

  guides.push({ slug, article });
}

const file = `import type { Article } from './types';

// GENERATED by scripts/genProvinceGuides.ts — do not hand-edit.
// Every number comes from Statistics Canada's published wage medians or from
// the CanPay Insights 2026 tax engine. Re-run the script after either changes.

export const provinceGuides2026: Article[] = [
${guides.map((g) => g.article).join('\n')}
];
`;

writeFileSync('src/content/articles-province-2026.ts', file);
console.log('wrote', guides.length, 'guides');
