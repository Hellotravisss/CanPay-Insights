'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import AvowdCredit from './AvowdCredit';

/**
 * The shared frame for the legal pages (privacy, terms, refunds, and their
 * French versions): the same header and footer the About and Contact pages
 * use, so a fourth copy of that markup does not have to be kept in step.
 */
export const Badge = ({ n }: { n: number | string }) => (
  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-sm font-bold text-red-700">{n}</span>
);

export function Section({ n, id, title, children }: { n: number | string; id?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 scroll-mt-24" id={id}>
      <h2 className="mb-4 flex items-center gap-3 text-2xl font-bold text-slate-800">
        <Badge n={n} />
        {title}
      </h2>
      <div className="space-y-4 pl-11 text-slate-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function LegalChrome({
  title,
  effective,
  intro,
  lang = 'en',
  backLabel = 'Back to Home',
  footnote = 'Calculations are estimates based on 2026 tax brackets and provincial employment standards.',
  links,
  children,
}: {
  title: string;
  effective: string;
  intro?: React.ReactNode;
  lang?: string;
  backLabel?: string;
  footnote?: string;
  links?: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const home = lang === 'fr' ? '/fr' : '/';
  const handleBack = () => router.push(home);
  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans" lang={lang === 'fr' ? 'fr-CA' : undefined}>
      <header className="sticky top-0 z-30 border-b border-red-100 bg-white shadow-sm" role="banner">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="CanPay Insights"
              onClick={handleBack}
              className="h-10 w-10 cursor-pointer rounded-lg object-contain shadow-lg shadow-red-200 transition-transform hover:scale-105"
            />
            <h1 className="cursor-pointer text-xl font-bold tracking-tight text-slate-800" onClick={handleBack}>
              CanPay <span className="font-light text-red-600">Insights</span>
            </h1>
          </div>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {backLabel}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12" role="main">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm md:p-12">
          <h1 className="mb-2 text-3xl font-bold text-slate-800 md:text-4xl">{title}</h1>
          <p className="mb-2 text-lg text-slate-500"><strong>{effective}</strong></p>
          {links && links.length > 0 && (
            <p className="mb-8 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {links.map((l) => (
                <a key={l.href} href={l.href} className="font-medium text-red-600 underline underline-offset-2 hover:text-red-700">{l.label}</a>
              ))}
            </p>
          )}
          {intro && <div className="mb-8 text-lg leading-relaxed text-slate-600">{intro}</div>}
          <div className="prose prose-slate max-w-none">{children}</div>
        </div>
      </main>

      <footer className="space-y-4 py-8 text-center text-xs text-slate-500" role="contentinfo">
        <p>{footnote}</p>
        <div className="mt-2 flex justify-center gap-2" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-red-400 opacity-50"></span>
          <span className="h-2 w-2 rounded-full bg-red-400 opacity-50"></span>
          <span className="h-2 w-2 rounded-full bg-red-400 opacity-50"></span>
        </div>
        <p className="mt-4">Proudly Canadian 🇨🇦 Built for Workers.</p>
        <p><AvowdCredit /></p>
      </footer>
    </div>
  );
}
