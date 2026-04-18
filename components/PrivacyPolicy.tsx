'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

interface PrivacyPolicyProps {
  onBackToHome?: () => void;
}

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

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBackToHome }) => {
  const router = useRouter();
  const handleBack = onBackToHome ?? (() => router.push('/'));
  return (
    <>
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Privacy Policy for CanPay Insights</h1>
          <p className="text-slate-500 mb-8 text-lg"><strong>Effective Date: March 1, 2026</strong></p>

          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 text-lg leading-relaxed mb-8">
              CanPay Insights ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains our practices regarding the collection, use, and disclosure of information when you use our mobile application and website (collectively, the "Service").
            </p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg text-sm font-bold">1</span>
                Information We Do Not Collect
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed mb-4">
                  We strongly believe in your right to privacy. <strong className="text-slate-800">CanPay Insights does not collect, store, transmit, or share any personal data, financial information, or usage metrics.</strong> All payroll and tax calculations are performed entirely locally on your device. The numbers you input (such as hourly wages, annual salary, or timesheet hours) never leave your phone or computer. We do not have servers that store your financial data.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg text-sm font-bold">2</span>
                No Third-Party Tracking
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed">
                  We do not integrate any third-party analytics, tracking cookies, or advertising frameworks that monitor your behavior across other apps or websites.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg text-sm font-bold">3</span>
                App Permissions
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed">
                  The CanPay Insights app does not require any special permissions (such as camera, contacts, or location access) to function.
                </p>
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg text-sm font-bold">4</span>
                Changes to This Privacy Policy
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg text-sm font-bold">5</span>
                Contact Us
              </h2>
              <div className="pl-11">
                <p className="text-slate-600 leading-relaxed">
                  If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at:{" "}
                  <a 
                    href="mailto:qharbert@me.com" 
                    className="text-red-600 hover:text-red-700 font-medium underline underline-offset-2 transition-colors"
                  >
                    qharbert@me.com
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-slate-400 text-xs py-8 space-y-4" role="contentinfo">
        <p>Calculations are estimates based on 2025/2026 tax brackets and provincial employment standards.</p>
        <div className="mt-2 flex justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
          <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
          <span className="w-2 h-2 rounded-full bg-red-400 opacity-50"></span>
        </div>
        <p className="mt-4 opacity-75">Proudly Canadian 🇨🇦 Built for Workers.</p>
      </footer>
    </div>
    </>
  );
};

export default PrivacyPolicy;
