import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  PROVINCIAL_WAGES,
  PROVINCE_LABELS,
  INDUSTRY_LABELS,
  WAGE_DATA_YEAR,
  annualFromHourly,
} from '../../../lib/provincialWages';
import { getSalaryFigures } from '../../../lib/salaryFigures';
import { WageHeader, WageFooter, chipClass } from '../WageChrome';
import { PageHero, Card, Stat, ButtonLink } from '@/components/site/ui';
import PayDonut from '../PayDonut';

// One page per industry × province, built entirely from Statistics Canada's
// published median wage plus our own tax engine. Every number here is either
// official or computed — nothing is filled in from a template.
//
// The searchable gap this fills: StatCan publishes GROSS wages, every other
// calculator asks you to type a number. Nobody answers "the median electrician
// in Alberta earns X — what does that leave after tax?" in one place.

const PROVINCE_SLUGS: Record<string, string> = {
  ON: 'ontario', QC: 'quebec', BC: 'british-columbia', AB: 'alberta',
  MB: 'manitoba', SK: 'saskatchewan', NS: 'nova-scotia', NB: 'new-brunswick',
  NL: 'newfoundland-and-labrador', PE: 'prince-edward-island',
};
// The engine takes full province names.
const ENGINE_PROVINCE: Record<string, string> = {
  ON: 'ontario', QC: 'quebec', BC: 'bc', AB: 'alberta', MB: 'manitoba',
  SK: 'saskatchewan', NS: 'nova-scotia', NB: 'new-brunswick',
  NL: 'newfoundland', PE: 'pei',
};

type Combo = { industry: string; province: string; slug: string };

function allCombos(): Combo[] {
  const out: Combo[] = [];
  for (const industry of Object.keys(PROVINCIAL_WAGES)) {
    for (const [code, provSlug] of Object.entries(PROVINCE_SLUGS)) {
      if (PROVINCIAL_WAGES[industry]?.[code]) {
        out.push({ industry, province: code, slug: `${industry}-wages-${provSlug}` });
      }
    }
  }
  return out;
}

export function generateStaticParams() {
  return allCombos().map((c) => ({ slug: c.slug }));
}

function findCombo(slug: string) {
  return allCombos().find((c) => c.slug === slug) ?? null;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const combo = findCombo(slug);
  if (!combo) return {};
  const industry = INDUSTRY_LABELS[combo.industry];
  const province = PROVINCE_LABELS[combo.province];
  const hourly = PROVINCIAL_WAGES[combo.industry][combo.province];
  const annual = annualFromHourly(hourly);
  return {
    title: `${industry} Salary in ${province} (${WAGE_DATA_YEAR} data): $${hourly.toFixed(2)}/hr, 2026 Take-Home`,
    description: `The median full-time ${industry.toLowerCase()} wage in ${province} is $${hourly.toFixed(
      2
    )} an hour — about $${annual.toLocaleString('en-CA')} a year. See exactly what that leaves after federal tax, provincial tax, CPP and EI.`,
    alternates: { canonical: `https://canpayinsights.ca/wages/${combo.slug}` },
  };
}

export default async function IndustryProvincePage({ params }: Props) {
  const { slug } = await params;
  const combo = findCombo(slug);
  if (!combo) notFound();

  const industry = INDUSTRY_LABELS[combo.industry];
  const province = PROVINCE_LABELS[combo.province];
  const hourly = PROVINCIAL_WAGES[combo.industry][combo.province];
  const nationalHourly = PROVINCIAL_WAGES[combo.industry].CA;
  const allIndustryHourly = PROVINCIAL_WAGES['all-industries'][combo.province];
  const annual = annualFromHourly(hourly);

  const figures = getSalaryFigures(annual, ENGINE_PROVINCE[combo.province]);
  const vsNational = hourly - nationalHourly;
  const vsAllIndustries = hourly - allIndustryHourly;

  // Same industry, every province — the comparison nobody else publishes.
  const acrossProvinces = Object.entries(PROVINCIAL_WAGES[combo.industry])
    .filter(([code]) => code !== 'CA' && PROVINCE_SLUGS[code])
    .map(([code, wage]) => {
      const a = annualFromHourly(wage);
      const f = getSalaryFigures(a, ENGINE_PROVINCE[code]);
      return { code, wage, annual: a, net: f.netAnnual };
    })
    .sort((a, b) => b.net - a.net);

  const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

  const faq = [
    {
      q: `What is the average ${industry.toLowerCase()} salary in ${province}?`,
      a: `The median full-time wage is $${hourly.toFixed(2)} an hour — roughly ${money(
        annual
      )} a year before tax — according to Statistics Canada's ${WAGE_DATA_YEAR} employee wage data. Median means half of full-time workers in this sector earn more and half earn less.`,
    },
    {
      q: `What is the take-home pay on ${money(annual)} in ${province}?`,
      a: `About ${money(figures.netAnnual)} a year, or ${money(
        figures.netMonthly
      )} a month, after federal tax, ${province} provincial tax, CPP/CPP2 and EI for the 2026 tax year.`,
    },
    {
      q: `Does ${industry.toLowerCase()} pay more in ${province} than elsewhere in Canada?`,
      a:
        vsNational >= 0
          ? `Yes. At $${hourly.toFixed(2)} an hour, ${province} sits $${vsNational.toFixed(
              2
            )} above the national median of $${nationalHourly.toFixed(2)} for this sector.`
          : `No. At $${hourly.toFixed(2)} an hour, ${province} sits $${Math.abs(vsNational).toFixed(
              2
            )} below the national median of $${nationalHourly.toFixed(2)} for this sector.`,
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const h2 = 'font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]';

  return (
    <div className="min-h-screen bg-pearl font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WageHeader />
      <main className="mx-auto max-w-3xl px-4 pb-16" role="main">
        <PageHero
          eyebrow={<>{province} · {WAGE_DATA_YEAR} wage data</>}
          title={<>{industry} salary in {province}: what you actually take home</>}
          lead={
            /* Answer-first paragraph: the whole point in the first 40 words. */
            <>
              The median full-time {industry.toLowerCase()} wage in {province} is{' '}
              <strong className="font-semibold text-ink">${hourly.toFixed(2)} an hour</strong>, about <strong className="font-semibold text-ink">{money(annual)} a year</strong>{' '}
              before tax.
              {' '}After federal tax, {province} tax, CPP and EI, that leaves roughly{' '}
              <strong className="font-semibold text-ink">{money(figures.netAnnual)} a year</strong> — {money(figures.netMonthly)} a month, or{' '}
              {money(figures.netBiWeekly)} on a bi-weekly paycheque.
            </>
          }
        />

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Gross salary" value={money(annual)} />
          <Stat label="Take-home" value={money(figures.netAnnual)} tone="kept" />
          <Stat label="Total deductions" value={money(annual - figures.netAnnual)} />
          <Stat label="Per month" value={money(figures.netMonthly)} />
        </div>

        {/* Where the money goes */}
        <Card as="section" className="mt-6 p-6 md:p-8">
          <h2 className="mb-1 font-display text-xl font-semibold text-ink md:text-2xl">Where the money goes</h2>
          <p className="mb-6 text-sm text-mute">
            Every dollar of that {money(annual)}, split between what you keep and what is deducted.
          </p>
          <PayDonut
            gross={annual}
            netAnnual={figures.netAnnual}
            federalTax={figures.federalTax}
            provincialTax={figures.provincialTax}
            pension={figures.pensionContribution}
            ei={figures.eiPremium}
            provinceLabel={province}
          />
        </Card>

        <h2 className={`mt-14 ${h2}`}>
          How {province} compares for {industry.toLowerCase()} workers
        </h2>
        <p className="mt-3 leading-7 text-ink-3">
          Same job, same sector, different province — and different take-home pay, because each
          province sets its own tax brackets. This table takes the median full-time wage in each
          province and runs it through the 2026 tax rules.
        </p>
        <Card className="pc mt-6 overflow-x-auto px-3 py-2 sm:px-6">
          <table className="w-full border-collapse text-left text-[13px] sm:text-sm">
            <thead>
              <tr className="border-b border-ink-5 text-[11px] uppercase tracking-[0.12em] text-mute">
                <th scope="col" className="py-3 pr-2 font-semibold sm:pr-4">Province</th>
                <th scope="col" className="py-3 pr-2 text-right font-semibold sm:pr-4">Median wage</th>
                <th scope="col" className="py-3 pr-2 text-right font-semibold sm:pr-4">Gross year</th>
                <th scope="col" className="py-3 text-right font-semibold">Take-home</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2">
              {acrossProvinces.map((r, i) => {
                const top = acrossProvinces[0].net;
                const current = r.code === combo.province;
                return (
                  <tr
                    key={r.code}
                    aria-current={current ? 'true' : undefined}
                    className={current ? 'bg-pearl-soft font-semibold text-ink' : ''}
                  >
                    <td className={`py-3 pr-2 sm:pr-4 sm:whitespace-nowrap ${current ? 'pl-2 shadow-[inset_2px_0_0_#C8161A]' : ''}`}>{PROVINCE_LABELS[r.code]}</td>
                    <td className="py-3 pr-2 text-right tabular-nums whitespace-nowrap sm:pr-4">${r.wage.toFixed(2)}/hr</td>
                    <td className="py-3 pr-2 text-right tabular-nums sm:pr-4">{money(r.annual)}</td>
                    <td className="py-3">
                      <div className="flex items-center justify-end gap-3">
                        <div className="hidden h-1.5 w-20 shrink-0 rounded-full bg-pearl sm:block" aria-hidden="true">
                          <div
                            className={`pm-x h-1.5 rounded-full ${current ? 'bg-red-600' : 'bg-ink-2'}`}
                            style={{ width: `${Math.round((r.net / top) * 100)}%`, ['--i' as string]: Math.min(i, 16) }}
                          />
                        </div>
                        <span className={`tabular-nums ${current ? 'text-red-600' : ''}`}>{money(r.net)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <h2 className={`mt-14 ${h2}`}>Where this sits against other work</h2>
        <p className="mt-3 leading-7 text-ink-2">
          Across all industries in {province}, the median full-time wage is $
          {allIndustryHourly.toFixed(2)} an hour. {industry} therefore pays{' '}
          {vsAllIndustries >= 0 ? (
            <>
              <strong className="font-semibold text-ink">${vsAllIndustries.toFixed(2)} an hour more</strong> than the typical {province}{' '}
              job — {money(Math.abs(annualFromHourly(vsAllIndustries)))} a year before tax.
            </>
          ) : (
            <>
              <strong className="font-semibold text-ink">${Math.abs(vsAllIndustries).toFixed(2)} an hour less</strong> than the typical{' '}
              {province} job — {money(Math.abs(annualFromHourly(vsAllIndustries)))} a year before tax.
            </>
          )}{' '}
          Nationally, this sector's median is ${nationalHourly.toFixed(2)} an hour.
        </p>

        <Card className="mt-10 p-6 md:p-8">
          <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">Calculate your own pay</h2>
          <p className="mt-2 text-sm leading-6 text-ink-3">
            These are medians — your own wage, overtime, RRSP contributions and benefits change the
            result. The calculator does the 2026 numbers for any salary or hourly rate, in every
            province and territory.
          </p>
          <ButtonLink href="/" className="mt-5">
            Open the take-home pay calculator →
          </ButtonLink>
        </Card>

        <h2 className={`mt-14 ${h2}`}>Frequently asked questions</h2>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {faq.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-semibold text-ink marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="ml-3 text-mute transition-transform group-open:rotate-90" aria-hidden="true">›</span>
              </summary>
              <p className="pb-5 leading-7 text-ink-2">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-mute">
          Wage figures: Statistics Canada, Table 14-10-0064-01, “Employee wages by industry, annual”,
          median hourly wage of full-time employees, {WAGE_DATA_YEAR}. Annualised at 2,080 hours.
          Take-home figures computed with the CanPay Insights 2026 tax engine (federal and provincial
          income tax, CPP/CPP2, EI) for a single employee with no additional credits.
        </p>

        <nav className="mt-10 border-t border-line pt-6">
          <h2 className="mb-3 text-sm font-semibold text-ink">Other sectors in {province}</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PROVINCIAL_WAGES)
              .filter((i) => i !== combo.industry && PROVINCIAL_WAGES[i]?.[combo.province])
              .map((i) => (
                <a
                  key={i}
                  href={`/wages/${i}-wages-${PROVINCE_SLUGS[combo.province]}`}
                  className={chipClass}
                >
                  {INDUSTRY_LABELS[i]}
                </a>
              ))}
          </div>
          <h2 className="mb-3 mt-6 text-sm font-semibold text-ink">
            {industry} in other provinces
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROVINCE_SLUGS)
              .filter(([code]) => code !== combo.province && PROVINCIAL_WAGES[combo.industry]?.[code])
              .map(([code, pslug]) => (
                <a
                  key={code}
                  href={`/wages/${combo.industry}-wages-${pslug}`}
                  className={chipClass}
                >
                  {PROVINCE_LABELS[code]}
                </a>
              ))}
          </div>
        </nav>
      </main>
      <WageFooter />
    </div>
  );
}
