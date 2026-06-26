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

// Illustrative slice of the full 455-row dataset (net take-home at $80,000, 2026).
const PREVIEW = [
  { prov: 'British Columbia', net: '$61,038' },
  { prov: 'Ontario', net: '$60,744' },
  { prov: 'Alberta', net: '$60,409' },
  { prov: 'Quebec', net: '$57,077' },
];

const DataPage: React.FC = () => {
  const router = useRouter();
  const handleBack = () => router.push('/');
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
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

      <main className="max-w-4xl mx-auto px-4 py-12" role="main">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Open dataset: Canadian take-home pay 2026</h1>
          <p className="text-slate-500 mb-8 text-lg">
            Net pay, federal &amp; provincial tax, CPP/CPP2, and EI for every province and territory — free to download and cite under CC BY 4.0.
          </p>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              We compute take-home pay for <strong>13 provinces and territories × 35 income levels ($30,000–$200,000) =
              455 rows</strong> straight from our open 2026 calculation engine, and publish the full result as a
              machine-readable dataset. Journalists, bloggers, and researchers are welcome to use it.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href="/data/canpay-take-home-2026.csv"
                download
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-bold text-white no-underline transition-colors hover:bg-red-700"
              >
                Download CSV
              </a>
              <a
                href="/data/canpay-take-home-2026.json"
                download
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 font-bold text-slate-700 no-underline transition-colors hover:bg-slate-50"
              >
                Download JSON
              </a>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">Preview — take-home on an $80,000 salary (2026)</h2>
            <div className="mb-3 overflow-hidden rounded-xl border border-slate-200">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Province / territory</th>
                    <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Net take-home (annual)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PREVIEW.map((row) => (
                    <tr key={row.prov}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">{row.prov}</td>
                      <td className="px-4 py-3 text-right text-sm text-slate-600">{row.net}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-slate-500 mb-10">
              The full download covers all 13 jurisdictions across $30,000–$200,000 — this is one slice.
            </p>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">Methodology</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Figures are verified against published 2026 rates from the Canada Revenue Agency (CRA), Revenu Québec, and
              each provincial government, and apply:
            </p>
            <ul className="list-disc pl-5 text-slate-600 leading-relaxed space-y-2 mb-4">
              <li>Federal income tax — lowest bracket cut to 14% for 2026 — plus each province/territory&apos;s own brackets.</li>
              <li>CPP at 5.95% to the YMPE (~$74,600) and CPP2 (extra 4%) to the YAMPE (~$85,000); QPP/QPIP for Quebec.</li>
              <li>EI at 1.63% to the maximum insurable earnings ($68,900); Quebec uses the lower 1.30% rate.</li>
              <li>The basic personal amount only (no other credits or deductions), so figures are a clean, comparable baseline.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">Cite this dataset</h2>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 mb-6">
              <p className="text-sm leading-relaxed text-slate-700">
                CanPay Insights, <em>Canadian Take-Home Pay &amp; Payroll Deductions 2026</em> (open dataset), Vancouver,
                Canada. Licensed under{' '}
                <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-red-600 underline hover:text-red-700">CC BY 4.0</a>.
                Retrieved from canpayinsights.ca/data.
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed">
              You&apos;re free to share and adapt the data, including commercially, with attribution and a link to{' '}
              <a href="https://canpayinsights.ca" className="text-red-600 underline hover:text-red-700">canpayinsights.ca</a>.
              Need a custom cut (a specific province, income range, or pay frequency)? Email{' '}
              <a href="mailto:info@canpayinsights.ca" className="text-red-600 underline hover:text-red-700">info@canpayinsights.ca</a>.
            </p>
          </div>
        </div>
      </main>

      <footer className="text-center text-slate-400 text-xs py-8 space-y-4" role="contentinfo">
        <p>Figures are estimates based on 2026 tax brackets and a basic-personal-amount baseline.</p>
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

export default DataPage;
