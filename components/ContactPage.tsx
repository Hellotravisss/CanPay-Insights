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

const ContactPage: React.FC = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Contact Us</h1>
          <p className="text-slate-500 mb-8 text-lg">Questions, corrections, data requests, or press — we&apos;d love to hear from you.</p>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              CanPay Insights is built and maintained by an independent developer in Vancouver, British Columbia.
              We read every message and aim to reply within a few business days.
            </p>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 mb-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-1">Email</p>
              <a
                href="mailto:info@canpayinsights.ca"
                className="text-2xl font-bold text-red-600 hover:text-red-700 underline underline-offset-4 transition-colors"
              >
                info@canpayinsights.ca
              </a>
              <p className="text-slate-500 mt-3 text-sm">Vancouver, British Columbia, Canada 🇨🇦</p>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 mb-4">What you can reach us about</h2>
            <ul className="list-disc pl-5 text-slate-600 leading-relaxed space-y-2 mb-8">
              <li><strong>Spotted an error?</strong> If a number looks off for your province or year, tell us — we&apos;ll check the engine and fix it.</li>
              <li><strong>Data &amp; media requests.</strong> Journalists and bloggers are welcome to cite our take-home pay, CPP/EI, and minimum-wage data; we&apos;re happy to pull a custom figure for any province.</li>
              <li><strong>Feature ideas.</strong> Want a new year, a new breakdown, or another language? Let us know.</li>
              <li><strong>General feedback.</strong> Good or bad, it helps make the tool better for everyone.</li>
            </ul>

            <p className="text-slate-600 leading-relaxed">
              Please note that CanPay Insights provides general information only and cannot give personalized tax,
              legal, or financial advice. For decisions that matter, please consult a qualified accountant or the
              Canada Revenue Agency.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-8 space-y-4" role="contentinfo">
        <p>Calculations are estimates based on 2025/2026 tax brackets and provincial employment standards.</p>
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

export default ContactPage;
