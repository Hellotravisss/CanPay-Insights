'use client';
import { useMemo, useState } from 'react';
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { PayFrequency } from '../types';

// The paid Province Move Report, offered where people are already comparing
// provinces. Same checkout as the calculator's results page; the free
// take-home gap shown here is computed exactly as the report computes it.
const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`;

export default function CompareMoveOffer({ provinces, annualSalary }: { provinces: string[]; annualSalary: number }) {
  const [from, setFrom] = useState(provinces[0] ?? '');
  const [to, setTo] = useState(provinces[1] ?? '');
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gap = useMemo(() => {
    if (!from || !to || from === to || !annualSalary) return null;
    const net = (p: string) =>
      calculateFromAnnualSalary({ province: p, annualSalary, payFrequency: PayFrequency.MONTHLY }).netPayAnnual;
    return Math.round(net(to)) - Math.round(net(from));
  }, [from, to, annualSalary]);

  if (provinces.length < 2 || !annualSalary) return null;

  const buy = async () => {
    if (!from || !to || from === to) return;
    setBuying(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product: 'relocation', from, to, income: Math.round(annualSalary), lang: 'en' }),
      });
      let data: { url?: string; error?: string } = {};
      try { data = await res.json(); } catch { /* empty body */ }
      if (!res.ok || !data.url) throw new Error(data.error || 'Payments are unavailable right now. Please try again in a few minutes.');
      window.location.href = data.url;
    } catch (e) {
      setError((e as Error).message);
      setBuying(false);
    }
  };

  const pick = (value: string, set: (v: string) => void, label: string) => (
    <label className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">{label}</span>
      <select value={value} onChange={(e) => set(e.target.value)} className="rounded-lg border border-line bg-white px-2.5 py-2 text-sm text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10">
        {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </label>
  );

  return (
    <div className="mb-8 rounded-2xl border border-line bg-white p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">Actually moving?</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">Province Move Report</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-3">
            Your take-home in both provinces, which province taxes you for the year (where you live on December 31),
            the moving-expense deduction, and the sales-tax difference, computed from your salary.
          </p>
        </div>
        <span className="shrink-0 font-display text-3xl font-semibold tabular-nums text-ink">$9</span>
      </div>

      <div className="mt-4 flex gap-3">
        {pick(from, setFrom, 'Moving from')}
        {pick(to, setTo, 'Moving to')}
      </div>

      <div className="mt-3 rounded-xl bg-pearl-soft px-4 py-3">
        {gap === null ? (
          <p className="text-sm text-mute">Pick two different provinces.</p>
        ) : (
          <p className="flex items-baseline gap-2">
            <span className={`font-display text-3xl font-semibold tabular-nums ${gap >= 0 ? 'text-red-600' : 'text-ink'}`}>
              {gap >= 0 ? '+' : '−'}{money(gap)}
            </span>
            <span className="text-sm text-mute">a year in take-home pay, free. The report covers the rest.</span>
          </p>
        )}
      </div>

      <button
        onClick={buy}
        disabled={gap === null || buying}
        className="mt-3 w-full rounded-xl btn-brand-3d px-3 py-3 text-sm font-semibold text-white disabled:bg-pearl-shade disabled:text-ink-3"
      >
        {buying ? 'Opening secure checkout…' : 'Get the full report: $9'}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      <p className="mt-1.5 text-[11px] text-mute">Paid through Stripe · link works forever</p>
    </div>
  );
}
