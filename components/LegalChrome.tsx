'use client';
import React from 'react';
import SiteHeader from './site/SiteHeader';
import SiteFooter from './site/SiteFooter';

/**
 * The shared frame for the legal pages (privacy, terms, refunds, and their
 * French versions): the same header and footer the About and Contact pages
 * use, so a fourth copy of that markup does not have to be kept in step.
 */
export const Badge = ({ n }: { n: number | string }) => (
  <span className="mt-1 w-8 shrink-0 font-display text-lg font-semibold tabular-nums text-red-600">{n}</span>
);

export function Section({ n, id, title, children }: { n: number | string; id?: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12 scroll-mt-24 border-t border-line pt-8 first:border-t-0 first:pt-0" id={id}>
      <h2 className="mb-4 flex items-start gap-3 font-display text-2xl font-semibold leading-snug text-ink">
        <Badge n={n} />
        <span>{title}</span>
      </h2>
      <div className="space-y-4 leading-7 text-ink-2 md:pl-11">{children}</div>
    </section>
  );
}

export default function LegalChrome({
  title,
  effective,
  intro,
  lang = 'en',
  footnote,
  links,
  children,
}: {
  title: string;
  effective: string;
  intro?: React.ReactNode;
  lang?: string;
  /** kept for older callers; the shared header has no back button */
  backLabel?: string;
  footnote?: string;
  links?: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const l = lang === 'fr' ? 'fr' : lang === 'zh' ? 'zh' : 'en';
  return (
    <div className="min-h-screen bg-pearl font-sans" lang={lang === 'fr' ? 'fr-CA' : undefined}>
      <SiteHeader lang={l} />
      <main className="mx-auto max-w-3xl px-4" role="main">
        <div className="pb-8 pt-10 md:pt-16">
          <h1 className="font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.01em] text-ink md:text-5xl">{title}</h1>
          <p className="mt-4 text-sm font-medium text-mute">{effective}</p>
          {links && links.length > 0 && (
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {links.map((x) => (
                <a key={x.href} href={x.href} className="font-medium text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600">{x.label}</a>
              ))}
            </p>
          )}
        </div>
        <article className="rounded-2xl border border-line bg-white p-6 md:p-12">
          {intro && <div className="mb-10 text-lg leading-8 text-ink-2">{intro}</div>}
          <div className="prose prose-slate max-w-none">{children}</div>
        </article>
      </main>
      <SiteFooter lang={l} note={footnote} />
    </div>
  );
}
