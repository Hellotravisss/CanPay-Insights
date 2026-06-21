'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const InukshukIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <rect x="10" y="2" width="4" height="3" rx="0.5" />
    <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    <rect x="9" y="10" width="6" height="4" rx="0.5" />
    <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
    <rect x="7" y="18" width="3" height="4" rx="0.5" />
    <rect x="14" y="18" width="3" height="4" rx="0.5" />
  </svg>
);

const Badge = ({ n }: { n: number }) => (
  <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg text-sm font-bold">{n}</span>
);

const AboutPage: React.FC = () => {
  const router = useRouter();
  const handleBack = () => router.push('/');
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-red-100 sticky top-0 z-30 shadow-sm" role="banner">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white shadow-red-200 shadow-lg hover:scale-105 transition-transform cursor-pointer" onClick={handleBack}>
              <InukshukIcon className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight cursor-pointer" onClick={handleBack}>
              CanPay <span className="text-red-600 font-light">Insights</span>
            </h1>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12" role="main">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">About CanPay Insights</h1>
          <p className="text-slate-500 mb-8 text-lg">A free, independent Canadian take-home pay calculator.</p>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              CanPay Insights is a free payroll and take-home pay calculator built for people who work in Canada.
              Enter an hourly wage, annual salary, or timesheet and instantly see what you actually keep after
              federal tax, provincial tax, CPP/CPP2, and EI — for any province or territory, in English, French,
              or Chinese. There is no signup, no paywall, and no data leaves your device.
            </p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <Badge n={1} /> Why we built it
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed">
                  Most Canadians find out their real take-home pay only after their first paycheque — when a chunk
                  of their gross salary has already disappeared into deductions. Comparing two job offers, two
                  provinces, or the impact of a raise should not require a spreadsheet or a meeting with an
                  accountant. We built CanPay Insights so anyone can get an accurate, transparent answer in seconds,
                  for free.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <Badge n={2} /> How our numbers are calculated
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed mb-4">
                  Every result comes from a transparent calculation engine that applies the current rules, not a
                  rough estimate. For the 2026 tax year, our engine accounts for:
                </p>
                <ul className="list-disc pl-5 text-slate-600 leading-relaxed space-y-2 mb-4">
                  <li><strong>Federal income tax</strong> — including the 2026 cut to the lowest bracket (15% → 14%) and the basic personal amount.</li>
                  <li><strong>Provincial &amp; territorial income tax</strong> — each province&apos;s own brackets and basic personal amount, plus Quebec&apos;s separate system.</li>
                  <li><strong>CPP and CPP2</strong> — 5.95% up to the YMPE (~$74,600), plus the second additional CPP2 (4%) up to the YAMPE (~$85,000).</li>
                  <li><strong>QPP, QPIP and the Quebec EI rate</strong> for workers in Quebec.</li>
                  <li><strong>Employment Insurance (EI)</strong> premiums and the annual maximum.</li>
                </ul>
                <p className="text-slate-600 leading-relaxed">
                  Our figures are based on published rates from the Canada Revenue Agency (CRA), Revenu Québec, and
                  each provincial government. We update the engine when new rates are announced.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <Badge n={3} /> Who builds it
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed">
                  CanPay Insights is built and maintained by <strong>Travis Zhang</strong> (Qi Zhang), an
                  independent developer based in Vancouver, British Columbia, who wrote the open rules engine
                  behind the calculator. It is a small, self-funded project — not a bank, payroll company, or
                  financial institution. That independence is the point: the tool exists to give workers a
                  straight answer, with no product to upsell. Connect on{" "}
                  <a href="https://www.linkedin.com/in/travis-z" target="_blank" rel="noopener noreferrer me" className="text-red-600 hover:text-red-700 font-medium underline underline-offset-2 transition-colors">LinkedIn</a>.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <Badge n={4} /> Open data — free to cite
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed mb-4">
                  Our 2026 take-home pay figures — net pay, federal and provincial tax, CPP/CPP2, EI and Quebec
                  QPP/QPIP for every province and territory across $30k–$200k — are published as an open dataset
                  under a{" "}
                  <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700 font-medium underline underline-offset-2">CC BY 4.0</a>{" "}
                  licence. Free to use, republish, or cite — please attribute and link to canpayinsights.ca.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="/data/canpay-take-home-2026.csv" download className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:border-red-200 hover:text-red-600 no-underline">Download CSV</a>
                  <a href="/data/canpay-take-home-2026.json" download className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700 hover:border-red-200 hover:text-red-600 no-underline">Download JSON</a>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <Badge n={5} /> A note on accuracy
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed">
                  CanPay Insights provides estimates for general information only and is not tax, legal, or financial
                  advice. Real paycheques can differ because of benefits, additional credits, union dues, pension
                  adjustments, or employer-specific deductions. For decisions that matter, confirm with a qualified
                  accountant or the CRA. Questions, corrections, or data requests are always welcome — see our{" "}
                  <a href="/contact" className="text-red-600 hover:text-red-700 font-medium underline underline-offset-2 transition-colors">Contact page</a>.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-8 space-y-4" role="contentinfo">
        <p>Calculations are estimates based on 2026 tax brackets and provincial employment standards.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <a href="/about" className="text-slate-400 hover:text-red-600 transition-colors">About</a>
          <a href="/contact" className="text-slate-400 hover:text-red-600 transition-colors">Contact</a>
          <a href="/privacy" className="text-slate-400 hover:text-red-600 transition-colors">Privacy</a>
        </div>
        <p className="mt-4 opacity-75">Proudly Canadian 🇨🇦 Built for Workers.</p>
      </footer>
    </div>
  );
};

export default AboutPage;
