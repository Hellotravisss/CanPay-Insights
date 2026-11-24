'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import { PageHero } from '../../../components/site/ui';

/**
 * My Reports: every purchase attached to this account, newest first.
 * Each row reopens the live report (rebuilt from the Stripe session) —
 * the link that "works forever" now has a home.
 */
type Row = { created_at: string; product: string; from_province: string | null; to_province: string | null; income: number | null; income_bracket: string | null; stripe_session_id: string };

const EMPTY = 'rounded-2xl border border-line bg-white p-8 text-center md:p-10';
const BTN = 'btn-brand-3d mt-5 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white no-underline';

export default function MyReports() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/me/purchases', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (r) => {
        if (r.status === 401) { setAuthed(false); return; }
        setAuthed(true);
        setRows(await r.json());
      })
      .catch(() => setAuthed(false));
  }, []);

  return (
    <div className="min-h-screen bg-pearl font-sans text-ink">
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-2xl px-4" role="main">
        <PageHero title="My Reports" lead="Every report you have bought, one click away — the links never expire." />

        {authed === false && (
          <div className={EMPTY}>
            <p className="font-display text-xl font-semibold text-ink">Sign in to see your reports.</p>
            <p className="mt-2 text-sm leading-6 text-mute">Use the account menu on the calculator page — one email link, no password.</p>
            <Link href="/" className={BTN}>← Back to the calculator</Link>
          </div>
        )}

        {authed && rows && rows.length === 0 && (
          <div className={EMPTY}>
            <p className="font-display text-xl font-semibold text-ink">No reports yet.</p>
            <p className="mt-2 text-sm leading-6 text-mute">Reports you buy show up here automatically when you are signed in.</p>
            <Link href="/" className={BTN}>← Back to the calculator</Link>
          </div>
        )}

        {authed && rows && rows.length > 0 && (
          <ul className="space-y-3">
            {rows.map((r) => {
              const isMove = r.product === 'relocation';
              const href = `/report/${isMove ? 'relocation' : 'offer'}?session_id=${encodeURIComponent(r.stripe_session_id)}`;
              const date = new Date(r.created_at + (r.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
              return (
                <li key={r.stripe_session_id}>
                  <Link href={href} className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5 no-underline transition-colors hover:border-ink-5">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold text-ink">{isMove ? 'Province Move Report' : 'Offer Comparison'}</p>
                      <p className="mt-0.5 text-sm tabular-nums text-mute">
                        {isMove && r.from_province && r.to_province ? `${r.from_province} → ${r.to_province} · ` : ''}
                        {r.income ? `$${r.income.toLocaleString('en-CA')} · ` : r.income_bracket ? `$${r.income_bracket} · ` : ''}{date}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-red-600">Open →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {authed === null && <p className="text-center text-sm text-mute">Loading…</p>}
      </main>
      <SiteFooter lang="en" />
    </div>
  );
}
