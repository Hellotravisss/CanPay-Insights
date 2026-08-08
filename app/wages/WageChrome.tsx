import React from 'react';

// Shared header/footer for the wage pages so they look like part of the site
// rather than bare data dumps. Server component — no interactivity needed.

export const InukshukIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="10" y="2" width="4" height="3" rx="0.5" />
    <path d="M4 6h16a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />
    <rect x="9" y="10" width="6" height="4" rx="0.5" />
    <path d="M5 14h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1z" />
    <rect x="7" y="18" width="3" height="4" rx="0.5" />
    <rect x="14" y="18" width="3" height="4" rx="0.5" />
  </svg>
);

export function WageHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-red-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <a href="/" className="flex items-center gap-3 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white shadow-lg shadow-red-200">
            <InukshukIcon className="h-6 w-6" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-800">
            CanPay <span className="font-light text-red-600">Insights</span>
          </span>
        </a>
        <nav className="flex items-center gap-2 text-sm">
          <a
            href="/wages"
            className="rounded-lg px-3 py-1.5 font-medium text-slate-600 no-underline hover:bg-slate-100"
          >
            All wages
          </a>
          <a
            href="/"
            className="rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white no-underline hover:bg-red-700"
          >
            Calculator
          </a>
        </nav>
      </div>
    </header>
  );
}

export function WageFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-4xl px-4 py-8 text-center text-xs text-slate-400">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span>© CanPay Insights</span>
          <a href="/about" className="text-slate-400 no-underline hover:text-red-600">About</a>
          <a href="/data" className="text-slate-400 no-underline hover:text-red-600">Open data</a>
          <a href="/widget" className="text-slate-400 no-underline hover:text-red-600">Embed this calculator</a>
          <a href="/privacy" className="text-slate-400 no-underline hover:text-red-600">Privacy</a>
        </div>
        <p>Proudly Canadian 🇨🇦 Built for workers.</p>
      </div>
    </footer>
  );
}
