import type { Metadata } from 'next';
import ShareLinks from '../../components/ShareLinks';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { PageHero, Card } from '../../components/site/ui';

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

const PAGE_LINK = "flex items-center justify-between gap-3 py-3 after:text-red-600 after:content-['→'] text-sm font-semibold text-ink no-underline transition-colors hover:text-red-600";

export default function LinkToCanPayPage() {
  return (
    <div className="min-h-screen bg-pearl font-sans text-ink">
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-6xl px-4" role="main">
        <PageHero
          eyebrow="Share the calculator"
          title="Link to a Free Canadian Payroll Calculator"
          lead="CanPay Insights helps Canadian workers estimate take-home pay by province. Use the snippets below when adding the calculator to a job offer guide, HR resource page, newcomer checklist, payroll article, or personal finance newsletter."
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {snippets.map((snippet) => (
              <Card as="article" key={snippet.title} className="p-6">
                <h2 className="mb-3 font-display text-xl font-semibold text-ink">{snippet.title}</h2>
                <pre className={`whitespace-pre-wrap break-words rounded-xl border border-line bg-pearl-soft p-4 text-sm leading-7 text-ink-2 ${snippet.body.startsWith("<") ? "font-mono" : "font-sans"}`}>
                  {snippet.body}
                </pre>
              </Card>
            ))}

            <Card as="article" className="p-6">
              <h2 className="mb-2 font-display text-xl font-semibold text-ink">Best pages to link</h2>
              <div className="divide-y divide-line border-y border-line">
                <a className={PAGE_LINK} href="/">
                  Free Canadian Payroll Calculator
                </a>
                <a className={PAGE_LINK} href="/salary-after-tax-canada">
                  Salary After Tax Canada
                </a>
                <a className={PAGE_LINK} href="/cpp-ei-calculator">
                  CPP and EI Calculator
                </a>
                <a className={PAGE_LINK} href="/compare-provinces">
                  Compare Provinces
                </a>
              </div>
            </Card>
          </div>

          <aside className="space-y-4">
            <ShareLinks
              compact
              url="https://canpayinsights.ca/"
              title="Free Canadian Payroll Calculator 2026"
              description="Estimate Canadian take-home pay by province with CPP, EI, income tax, salary, hourly wage, and timesheet tools."
            />
            <Card className="p-6">
              <h2 className="mb-2 font-display text-xl font-semibold text-ink">Who should use it?</h2>
              <p className="text-sm leading-6 text-ink-3">
                Workers comparing job offers, newcomers planning a budget, students starting hourly work, HR teams,
                bookkeepers, and Canadian personal finance writers.
              </p>
            </Card>
          </aside>
        </div>
      </main>
      <SiteFooter lang="en" />
    </div>
  );
}
