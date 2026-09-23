'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Page-view tags, with two exclusions.
 *
 * /embed runs inside other people's pages. A script served from
 * avowd-analytics.qharbert.workers.dev shows up in their devtools as an
 * unfamiliar third-party domain, and the first publisher to do due diligence
 * asked about exactly that (FindJobs Canada, 2026-09-21). Page-view counting is
 * ours to want, not theirs to carry.
 *
 * And the opt-out. The privacy policy says ?notelemetry=1 means "this browser
 * will record nothing from then on", but that flag only ever stopped the
 * calculation record — this tag kept firing. The same reviewer caught it on
 * 2026-09-22. It now reads the same flag lib/telemetry.ts writes.
 *
 * The flag lives in localStorage, which the server cannot see, so the decision
 * has to happen in the browser. The tag is therefore appended with
 * document.createElement after mount, NOT rendered as JSX: React 19 does not
 * reliably execute a non-async <script> it inserts on the client, and a tag
 * that silently never runs would have ended the site's page counts without a
 * single error.
 */
const OPTOUT_KEY = 'canpay_no_telemetry';

function optedOut(): boolean {
  try {
    const param = new URLSearchParams(window.location.search).get('notelemetry');
    if (param === '1') return true;
    if (param === '0') return false;
    return localStorage.getItem(OPTOUT_KEY) === '1';
  } catch {
    return false;
  }
}

function useScript(src: string, attrs: Record<string, string>) {
  const pathname = usePathname();
  useEffect(() => {
    // /report/* carries Stripe's session id in its address, and that address
    // is the only key to a page showing the buyer's email and exact salary.
    // The page-view tag sends the full address, so it must never run there.
    if (pathname?.startsWith('/embed') || pathname?.startsWith('/report') || optedOut()) return;
    if (document.querySelector(`script[src="${src}"]`)) return; // once per page
    const el = document.createElement('script');
    el.src = src;
    el.defer = true;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
  }, [pathname, src]); // eslint-disable-line react-hooks/exhaustive-deps
}

export default function PageTag() {
  useScript('https://avowd-analytics.qharbert.workers.dev/t.js', { 'data-site': 'canpay' });
  return null;
}

/** Same rules for Cloudflare's beacon. */
export function CfBeacon({ token }: { token: string }) {
  useScript('https://static.cloudflareinsights.com/beacon.min.js', { 'data-cf-beacon': `{"token": "${token}"}` });
  return null;
}
