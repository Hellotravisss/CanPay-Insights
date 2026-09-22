'use client';
import { usePathname } from 'next/navigation';

/**
 * The page-view tag, kept off the embeddable widget.
 *
 * /embed runs inside other people's pages. A script served from
 * avowd-analytics.qharbert.workers.dev shows up in their devtools as an
 * unfamiliar third-party domain, and the first publisher to do due diligence
 * asked about exactly that (FindJobs Canada, 2026-09-21) before agreeing to
 * embed. Page-view counting is ours to want, not theirs to carry: the widget
 * still records its own calculation event, which is first-party to us and
 * disclosed in the privacy policy.
 */
export default function PageTag() {
  const pathname = usePathname();
  if (pathname?.startsWith('/embed')) return null;
  return <script defer src="https://avowd-analytics.qharbert.workers.dev/t.js" data-site="canpay" />;
}

/** Same rule for Cloudflare's beacon: not inside someone else's page. */
export function CfBeacon({ token }: { token: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/embed')) return null;
  return <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "${token}"}`} />;
}
