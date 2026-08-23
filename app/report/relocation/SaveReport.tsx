'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

/**
 * The "keep this" block at the top of a paid report.
 *
 * Two things a buyer wants right after paying: the PDF, and a way back.
 * The PDF is one click (and already in their inbox). The way back is an
 * account — created from the email Stripe already has, with one tap and a
 * magic link, no password. When they come back signed in, the purchase is
 * claimed to the account so it shows up under "My reports" and their saved
 * calculations. Registration is sold on what it gives, never required.
 */
export default function SaveReport({
  email: initialEmail,
  sessionId,
  permalink,
}: {
  email: string | null;
  sessionId: string;
  permalink: string;
}) {
  const [email, setEmail] = useState(initialEmail ?? '');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'signedin' | 'claimed' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  // Already signed in (came back through the magic link)? Claim the purchase.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session || cancelled) return;
      setState('signedin');
      const res = await fetch('/api/report/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${data.session.access_token}` },
        body: JSON.stringify({ session_id: sessionId }),
      }).then((r) => r.json()).catch(() => ({ claimed: false }));
      if (!cancelled && res.claimed) setState('claimed');
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  const createAccount = async () => {
    const e = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { setErr('Please enter a valid email.'); return; }
    setState('sending'); setErr(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: permalink, shouldCreateUser: true },
    });
    if (error) { setErr(error.message); setState('error'); return; }
    setState('sent');
  };

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto]">
      {/* Account */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        {state === 'claimed' ? (
          <>
            <p className="text-sm font-bold text-emerald-700">✓ Saved to your account</p>
            <p className="mt-1 text-sm text-slate-500">
              This report now lives under <span className="font-medium text-slate-700">My reports</span> on canpayinsights.ca, next to your saved calculations.
            </p>
          </>
        ) : state === 'signedin' ? (
          <p className="text-sm text-slate-500">Signed in — attaching this report to your account…</p>
        ) : state === 'sent' ? (
          <>
            <p className="text-sm font-bold text-slate-900">Check your inbox</p>
            <p className="mt-1 text-sm text-slate-500">
              We sent a sign-in link to <span className="font-medium text-slate-700">{email}</span>. Open it on any device and this report is saved to your account — no password to remember.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-slate-900">Keep this report, and your pay history</p>
            <p className="mt-1 text-sm text-slate-500">
              A free account saves every calculation you run, shows your pay over time, and keeps this report one click away on any device.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                onClick={createAccount}
                disabled={state === 'sending'}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {state === 'sending' ? 'Sending link…' : 'Create free account'}
              </button>
            </div>
            {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
            <p className="mt-2 text-[11px] text-slate-400">One sign-in link by email. No password, no newsletter.</p>
          </>
        )}
      </div>

      {/* PDF */}
      <a
        href={`/api/report/pdf?session_id=${encodeURIComponent(sessionId)}`}
        className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-900 px-5 py-4 text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white print:hidden"
      >
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 2a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V3a1 1 0 011-1z" />
          <path d="M3 15a1 1 0 011 1v1h12v-1a1 1 0 112 0v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2a1 1 0 011-1z" />
        </svg>
        Download PDF
      </a>
    </div>
  );
}
