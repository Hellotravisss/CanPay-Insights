'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * My Reports: every purchase attached to this account, newest first.
 * Each row reopens the live report (rebuilt from the Stripe session) —
 * the link that "works forever" now has a home.
 */
type Row = { created_at: string; product: string; from_province: string | null; to_province: string | null; stripe_session_id: string };

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
    <main className="mx-auto max-w-2xl px-5 py-12 font-sans text-slate-800">
      <header className="border-b-4 border-red-600 pb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
          <span className="text-lg font-bold">CanPay <span className="font-normal text-red-600">Insights</span></span>
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">My Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Every report you have bought, one click away — the links never expire.</p>
      </header>

      {authed === false && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-semibold text-slate-800">Sign in to see your reports.</p>
          <p className="mt-1 text-sm text-slate-500">Use the account menu on the calculator page — one email link, no password.</p>
          <Link href="/" className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">← Back to the calculator</Link>
        </div>
      )}

      {authed && rows && rows.length === 0 && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-semibold text-slate-800">No reports yet.</p>
          <p className="mt-1 text-sm text-slate-500">Reports you buy show up here automatically when you are signed in.</p>
          <Link href="/" className="mt-4 inline-block rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white">← Back to the calculator</Link>
        </div>
      )}

      {authed && rows && rows.length > 0 && (
        <ul className="mt-8 space-y-3">
          {rows.map((r) => {
            const isMove = r.product === 'relocation';
            const href = `/report/${isMove ? 'relocation' : 'offer'}?session_id=${encodeURIComponent(r.stripe_session_id)}`;
            const date = new Date(r.created_at + (r.created_at.endsWith('Z') ? '' : 'Z')).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
            return (
              <li key={r.stripe_session_id}>
                <Link href={href} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-red-300">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{isMove ? 'Province Move Report' : 'Offer Comparison'}</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {isMove && r.from_province && r.to_province ? `${r.from_province} → ${r.to_province} · ` : ''}{date}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-red-600">Open →</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {authed === null && <p className="mt-10 text-center text-sm text-slate-400">Loading…</p>}
    </main>
  );
}
