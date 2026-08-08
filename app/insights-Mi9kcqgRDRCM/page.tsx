import type { Metadata } from 'next';
import StatsDashboard from './StatsDashboard';

// PRIVATE dashboard — unlisted URL, noindex, never in the sitemap and never
// linked from anywhere on the site. Reads aggregates only, through the
// calc_stats() database function; individual rows stay unreadable.
export const metadata: Metadata = {
  title: 'CanPay Data Room',
  robots: { index: false, follow: false, nocache: true },
};

export default function PrivateStatsPage() {
  return <StatsDashboard />;
}
