import type { Metadata } from 'next';
import ShareLinks from '../../components/ShareLinks';

export const metadata: Metadata = {
  title: 'Link to CanPay Insights - Free Canadian Payroll Calculator',
  description:
    'Share or link to CanPay Insights, a free Canadian payroll calculator for take-home pay, CPP, EI, salary, hourly wage, and province comparisons.',
  alternates: {
    canonical: 'https://canpayinsights.ca/link-to-canpay',
  },
  openGraph: {
    title: 'Link to CanPay Insights',
    description:
      'Free Canadian payroll calculator for take-home pay, CPP, EI, salary, hourly wage, and province comparisons.',
    url: 'https://canpayinsights.ca/link-to-canpay',
    type: 'website',
  },
};

const snippets = [
  {
    title: 'Short directory blurb',
    body: 'CanPay Insights is a free Canadian payroll calculator that estimates take-home pay by province, including federal tax, provincial tax, CPP, EI, hourly wage, annual salary, overtime, and timesheet tools.',
  },
  {
    title: 'For job offer articles',
    body: 'Before comparing job offers, use CanPay Insights to estimate what your gross salary becomes after Canadian income tax, CPP, EI, and province-specific deductions.',
  },
  {
    title: 'HTML link',
    body: '<a href="https://canpayinsights.ca/">Free Canadian Payroll Calculator</a>',
  },
];

export default function LinkToCanPayPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-16">
          <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-red-600 no-underline">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
            CanPay Insights
          </a>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-red-600">Share the calculator</p>
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Link to a Free Canadian Payroll Calculator
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-slate-600">
            CanPay Insights helps Canadian workers estimate take-home pay by province. Use the snippets below when
            adding the calculator to a job offer guide, HR resource page, newcomer checklist, payroll article, or
            personal finance newsletter.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {snippets.map((snippet) => (
            <article key={snippet.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-slate-900">{snippet.title}</h2>
              <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                {snippet.body}
              </pre>
            </article>
          ))}

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-xl font-bold text-slate-900">Best pages to link</h2>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <a className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 no-underline hover:text-red-600" href="/">
                Free Canadian Payroll Calculator
              </a>
              <a className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 no-underline hover:text-red-600" href="/salary-after-tax-canada">
                Salary After Tax Canada
              </a>
              <a className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 no-underline hover:text-red-600" href="/cpp-ei-calculator">
                CPP and EI Calculator
              </a>
              <a className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 no-underline hover:text-red-600" href="/compare-provinces">
                Compare Provinces
              </a>
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <ShareLinks
            compact
            url="https://canpayinsights.ca/"
            title="Free Canadian Payroll Calculator 2026"
            description="Estimate Canadian take-home pay by province with CPP, EI, income tax, salary, hourly wage, and timesheet tools."
          />
          <div className="rounded-xl bg-slate-900 p-6 text-white shadow-sm">
            <h2 className="mb-2 text-xl font-bold">Who should use it?</h2>
            <p className="text-sm leading-6 text-slate-300">
              Workers comparing job offers, newcomers planning a budget, students starting hourly work, HR teams,
              bookkeepers, and Canadian personal finance writers.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
