import type { Metadata } from 'next';
import SalaryHourlyConverter from '../../components/SalaryHourlyConverter';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { PageHero } from '../../components/site/ui';
import { getSalaryFigures } from '../../lib/salaryFigures';
import { TAX_YEAR } from '../../constants';

/**
 * Salary ↔ hourly converter (2026-10-26). "salary to hourly calculator" had 545
 * impressions in four weeks at position 6.6 and no clicks — we had no page that
 * converted. Every figure in the copy below is computed, not typed.
 */
const URL = 'https://canpayinsights.ca/salary-to-hourly-calculator';
const $ = (n: number, d = 0) => '$' + n.toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d });

const EX_SALARY = 60000;
const EX_WAGE = 25;
const FULL = 40 * 52;
const SHORT = 37.5 * 52;
const exNet = getSalaryFigures(EX_SALARY, 'ontario').netAnnual;

const TITLE = `Salary to Hourly Calculator Canada ${TAX_YEAR}: Before and After Tax`;
const DESCRIPTION = `Convert a salary to an hourly wage, or hourly to yearly, weekly and monthly pay — with what is left after ${TAX_YEAR} tax, CPP and EI in every province.`;

const FAQ = [
  {
    q: 'How do I convert an annual salary to an hourly wage?',
    a: `Divide the salary by the hours you are paid for in a year. At 40 hours a week that is 40 × 52 = ${FULL.toLocaleString('en-CA')} hours, so ${$(EX_SALARY)} a year is ${$(EX_SALARY / FULL, 2)} an hour. At 37.5 hours a week it is ${SHORT.toLocaleString('en-CA')} hours, or ${$(EX_SALARY / SHORT, 2)} an hour.`,
  },
  {
    q: `How much is ${$(EX_WAGE)} an hour a year?`,
    a: `${$(EX_WAGE)} × ${FULL.toLocaleString('en-CA')} hours = ${$(EX_WAGE * FULL)} a year before tax at 40 hours a week, or ${$(EX_WAGE * FULL / 12)} a month.`,
  },
  {
    q: 'What is my hourly wage after tax?',
    a: `Take-home pay divided by the same hours. In Ontario in ${TAX_YEAR}, ${$(EX_SALARY)} leaves about ${$(exNet)} after income tax, CPP and EI — ${$(exNet / FULL, 2)} an hour at 40 hours a week, against ${$(EX_SALARY / FULL, 2)} before tax.`,
  },
  {
    q: 'Do paid holidays and vacation count?',
    a: 'Yes. A salary pays for all 52 weeks, including statutory holidays and paid vacation, so the hourly figure divides by every week of the year. If you are paid only for the hours you work, use your actual hours.',
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};

export default function SalaryToHourlyPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Salary to Hourly Calculator (Canada)',
      url: URL, applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', inLanguage: 'en-CA',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return (
    <div className="min-h-screen bg-pearl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader current="calculator" />
      <main className="mx-auto max-w-3xl px-4" role="main">
        <PageHero
          eyebrow={<>Salary ↔ hourly · {TAX_YEAR}</>}
          title="Salary to Hourly Calculator"
          lead={<>
            {$(EX_SALARY)} a year is {$(EX_SALARY / FULL, 2)} an hour at 40 hours a week. Enter yours — and see what is left after tax.
          </>}
        />
        <SalaryHourlyConverter />
        <p className="mt-4 text-sm text-ink-3">
          Shifts, overtime or a full pay stub? Use the{' '}
          <a href="/hourly-wage-calculator" className="font-semibold text-red-700">hourly wage calculator</a>.
        </p>
        <section className="pb-16 pt-12">
          <h2 className="mb-5 font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">Questions</h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="rounded-2xl border border-line bg-white p-5">
                <summary className="cursor-pointer font-display text-lg font-semibold leading-snug text-ink marker:text-red-600">{f.q}</summary>
                <p className="mt-3 leading-7 text-ink-3">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
