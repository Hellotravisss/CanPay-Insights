import type { Metadata } from 'next';
import SalaryHourlyConverter from '../../components/SalaryHourlyConverter';
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-10 md:py-14">
          <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-red-600 no-underline">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
            CanPay Insights
          </a>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-red-700">Salary ↔ hourly · {TAX_YEAR}</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Salary to Hourly Calculator</h1>
          <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">
            {$(EX_SALARY)} a year is {$(EX_SALARY / FULL, 2)} an hour at 40 hours a week. Enter yours — and see what is left after tax.
          </p>
          <SalaryHourlyConverter />
          <p className="mt-4 text-sm text-slate-600">
            Shifts, overtime or a full pay stub? Use the{' '}
            <a href="/hourly-wage-calculator" className="font-semibold text-red-700">hourly wage calculator</a>.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-bold text-slate-950">Questions</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">{f.q}</summary>
              <p className="mt-2 leading-7 text-slate-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
