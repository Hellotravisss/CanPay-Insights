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
import { WageHeader, WageFooter } from '../WageChrome';
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
    title: `${industry} Salary in ${province} ${WAGE_DATA_YEAR}: $${hourly.toFixed(2)}/hr Take-Home`,
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

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <WageHeader />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
          {province} · {WAGE_DATA_YEAR} wage data
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
          {industry} salary in {province}: what you actually take home
        </h1>

        {/* Answer-first paragraph: the whole point in the first 40 words. */}
        <p className="mt-4 text-lg leading-8 text-slate-700">
          The median full-time {industry.toLowerCase()} wage in {province} is{' '}
          <strong>${hourly.toFixed(2)} an hour</strong>, about <strong>{money(annual)} a year</strong>{' '}
          before tax.
          {' '}After federal tax, {province} tax, CPP and EI, that leaves roughly{' '}
          <strong>{money(figures.netAnnual)} a year</strong> — {money(figures.netMonthly)} a month, or{' '}
          {money(figures.netBiWeekly)} on a bi-weekly paycheque.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { l: 'Gross salary', v: money(annual), tone: 'bg-slate-900 text-white' },
            { l: 'Take-home', v: money(figures.netAnnual), tone: 'bg-emerald-600 text-white' },
            { l: 'Total deductions', v: money(annual - figures.netAnnual), tone: 'bg-red-600 text-white' },
            { l: 'Per month', v: money(figures.netMonthly), tone: 'bg-white text-slate-900 ring-1 ring-slate-200' },
          ].map((s) => (
            <div key={s.l} className={`rounded-2xl p-4 shadow-sm ${s.tone}`}>
              <div className="text-xl font-bold tabular-nums md:text-2xl">{s.v}</div>
              <div className="mt-1 text-xs opacity-80">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Where the money goes */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-bold text-slate-900">Where the money goes</h2>
          <p className="mb-5 text-sm text-slate-500">
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
        </section>

        <h2 className="mt-12 text-2xl font-bold text-slate-900">
          How {province} compares for {industry.toLowerCase()} workers
        </h2>
        <p className="mt-2 leading-7 text-slate-600">
          Same job, same sector, different province — and different take-home pay, because each
          province sets its own tax brackets. This table takes the median full-time wage in each
          province and runs it through the 2026 tax rules.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-900">
                <th className="py-2 pr-4 font-bold">Province</th>
                <th className="py-2 pr-4 font-bold">Median wage</th>
                <th className="py-2 pr-4 font-bold">Gross year</th>
                <th className="py-2 font-bold">Take-home</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {acrossProvinces.map((r) => {
                const top = acrossProvinces[0].net;
                return (
                  <tr
                    key={r.code}
                    className={`border-b border-slate-200 ${r.code === combo.province ? 'bg-red-50 font-semibold text-slate-900' : ''}`}
                  >
                    <td className="py-2.5 pr-4 whitespace-nowrap">{PROVINCE_LABELS[r.code]}</td>
                    <td className="py-2.5 pr-4 tabular-nums">${r.wage.toFixed(2)}/hr</td>
                    <td className="py-2.5 pr-4 tabular-nums">{money(r.annual)}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 shrink-0 rounded-full bg-slate-100">
                          <div
                            className={`h-2 rounded-full ${r.code === combo.province ? 'bg-red-600' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.round((r.net / top) * 100)}%` }}
                          />
                        </div>
                        <span className="tabular-nums">{money(r.net)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-slate-900">Where this sits against other work</h2>
        <p className="mt-2 leading-7 text-slate-600">
          Across all industries in {province}, the median full-time wage is $
          {allIndustryHourly.toFixed(2)} an hour. {industry} therefore pays{' '}
          {vsAllIndustries >= 0 ? (
            <>
              <strong>${vsAllIndustries.toFixed(2)} an hour more</strong> than the typical {province}{' '}
              job — {money(Math.abs(annualFromHourly(vsAllIndustries)))} a year before tax.
            </>
          ) : (
            <>
              <strong>${Math.abs(vsAllIndustries).toFixed(2)} an hour less</strong> than the typical{' '}
              {province} job — {money(Math.abs(annualFromHourly(vsAllIndustries)))} a year before tax.
            </>
          )}{' '}
          Nationally, this sector's median is ${nationalHourly.toFixed(2)} an hour.
        </p>

        <div className="mt-10 rounded-2xl border border-red-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-900">Calculate your own pay</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These are medians — your own wage, overtime, RRSP contributions and benefits change the
            result. The calculator does the 2026 numbers for any salary or hourly rate, in every
            province and territory.
          </p>
          <a
            href="/"
            className="mt-4 inline-block rounded-xl bg-red-600 px-5 py-3 font-bold text-white hover:bg-red-700"
          >
            Open the take-home pay calculator →
          </a>
        </div>

        <h2 className="mt-12 text-2xl font-bold text-slate-900">Frequently asked questions</h2>
        <div className="mt-2">
          {faq.map((f, i) => (
            <details key={f.q} className={`group border-t border-slate-200 ${i === faq.length - 1 ? 'border-b' : ''}`}>
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-bold text-slate-800 marker:content-none [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="ml-3 text-slate-400 transition-transform group-open:rotate-90">›</span>
              </summary>
              <p className="pb-5 leading-7 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-8 text-xs leading-5 text-slate-400">
          Wage figures: Statistics Canada, Table 14-10-0064-01, “Employee wages by industry, annual”,
          median hourly wage of full-time employees, {WAGE_DATA_YEAR}. Annualised at 2,080 hours.
          Take-home figures computed with the CanPay Insights 2026 tax engine (federal and provincial
          income tax, CPP/CPP2, EI) for a single employee with no additional credits.
        </p>

        <nav className="mt-10 border-t border-slate-200 pt-6">
          <h2 className="mb-3 text-sm font-bold text-slate-700">Other sectors in {province}</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(PROVINCIAL_WAGES)
              .filter((i) => i !== combo.industry && PROVINCIAL_WAGES[i]?.[combo.province])
              .map((i) => (
                <a
                  key={i}
                  href={`/wages/${i}-wages-${PROVINCE_SLUGS[combo.province]}`}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
                >
                  {INDUSTRY_LABELS[i]}
                </a>
              ))}
          </div>
          <h2 className="mb-3 mt-6 text-sm font-bold text-slate-700">
            {industry} in other provinces
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROVINCE_SLUGS)
              .filter(([code]) => code !== combo.province && PROVINCIAL_WAGES[combo.industry]?.[code])
              .map(([code, pslug]) => (
                <a
                  key={code}
                  href={`/wages/${combo.industry}-wages-${pslug}`}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
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
