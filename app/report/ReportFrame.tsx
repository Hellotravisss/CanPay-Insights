import React from 'react';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';
import { Eyebrow } from '../../components/site/ui';

/**
 * The frame for the two paid reports (/report/offer, /report/relocation) and their
 * "unavailable" states: the site header and footer on the pearl page, so a buyer who
 * opens a report from a receipt lands on the same product they paid on.
 * Header and footer are hidden in print — the report keeps its own masthead for the PDF.
 */
export function ReportFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pearl font-sans print:bg-white">
      <div className="print:hidden"><SiteHeader lang="en" /></div>
      {children}
      <div className="print:hidden"><SiteFooter lang="en" /></div>
    </div>
  );
}

/** The empty / error state of a report link: one card, one title, one way back. */
export function ReportGate({ eyebrow, title, children }: { eyebrow?: string; title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-pearl font-sans">
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-xl px-4 py-16 md:py-24" role="main">
        <div className="rounded-2xl border border-line bg-white p-8 text-center md:p-10">
          {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
          <h1 className="font-display text-[1.75rem] font-semibold leading-tight text-ink">{title}</h1>
          {children}
        </div>
      </main>
      <SiteFooter lang="en" />
    </div>
  );
}
