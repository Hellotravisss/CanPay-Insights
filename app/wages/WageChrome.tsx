import React from 'react';
import SiteHeader from '@/components/site/SiteHeader';
import SiteFooter from '@/components/site/SiteFooter';

// The wage pages use the site's one header and footer (2026-11 design system).
// Before, they had their own bar ("All wages" + Calculator) and a short footer;
// the shared footer keeps every one of those links.

export function WageHeader() {
  return <SiteHeader lang="en" current="wages" />;
}

export function WageFooter() {
  return <SiteFooter lang="en" />;
}

/** a small outlined link chip (industry / province pickers) */
export const chipClass =
  'inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink-2 no-underline transition-colors hover:border-ink-5 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600';
