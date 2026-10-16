'use client';
import React, { useEffect, useState } from 'react';

/**
 * The top of /data: the behaviour dataset drawn from its own public file, live.
 *
 * Reads /data/usage.json — the same CC BY-NC-SA file anyone can download — so
 * every number here is one a visitor can check, and the k >= 20 suppression in
 * that file applies to the charts too. Nothing is hard-coded: a stale "7,000"
 * on a data page is the kind of claim that loses a researcher's trust.
 * If the file cannot be read, the block simply does not render.
 */
type Usage = {
  totals: { calculations: number; first_day: string; last_day: string };
  breakdowns: Record<string, { shown: Record<string, number> }>;
};

const INCOME_ORDER = ['under-30k', '30-50k', '50-70k', '70-90k', '90-120k', '120-160k', '160k-plus'];
const INCOME_LABEL: Record<string, string> = {
  'under-30k': '<$30k', '30-50k': '$30–50k', '50-70k': '$50–70k', '70-90k': '$70–90k',
  '90-120k': '$90–120k', '120-160k': '$120–160k', '160k-plus': '$160k+',
};
const fmt = (n: number) => n.toLocaleString('en-CA');
const day = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });

const DataPulse: React.FC = () => {
  const [u, setU] = useState<Usage | null>(null);
  useEffect(() => {
    fetch('/data/usage.json').then((r) => (r.ok ? r.json() : null)).then(setU).catch(() => {});
  }, []);
  if (!u) return null;

  const hours = u.breakdowns.local_hour?.shown ?? {};
  const hourVals = Array.from({ length: 24 }, (_, h) => hours[String(h)] ?? 0);
  const hourMax = Math.max(...hourVals, 1);
  const income = u.breakdowns.income_bracket?.shown ?? {};
  const incomeRows = INCOME_ORDER.filter((k) => income[k] != null).map((k) => ({ k, n: income[k] }));
  const incomeMax = Math.max(...incomeRows.map((r) => r.n), 1);
  const provinces = Object.keys(u.breakdowns.province?.shown ?? {}).length;
  const languages = Object.keys(u.breakdowns.language?.shown ?? {}).length;

  return (
    <section aria-labelledby="pulse-h" className="mb-10 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-white md:p-8">
      <p id="pulse-h" className="text-xs font-bold uppercase tracking-[0.18em] text-red-300">Live from the calculator</p>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-3xl font-bold tabular-nums md:text-4xl">{fmt(u.totals.calculations)}</p>
          <p className="mt-1 text-xs text-slate-300">anonymous calculations</p>
        </div>
        <div>
          <p className="text-3xl font-bold md:text-4xl">{day(u.totals.first_day).replace(/, \d{4}$/, '')}</p>
          <p className="mt-1 text-xs text-slate-300">first day logged ({u.totals.first_day.slice(0, 4)})</p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums md:text-4xl">{provinces}</p>
          <p className="mt-1 text-xs text-slate-300">provinces and territories shown</p>
        </div>
        <div>
          <p className="text-3xl font-bold tabular-nums md:text-4xl">{languages}</p>
          <p className="mt-1 text-xs text-slate-300">interface languages shown</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <figure>
          <figcaption className="mb-3 text-sm font-semibold text-slate-200">When people check their pay (their local hour)</figcaption>
          <div className="flex h-28 items-end gap-[3px]" role="img" aria-label="Calculations by local hour of day, midnight to 11 pm">
            {hourVals.map((v, h) => (
              <div key={h} className="flex-1 rounded-t-sm bg-red-500/80" style={{ height: `${Math.max(2, (v / hourMax) * 100)}%` }} title={`${h}:00 — ${fmt(v)}`} />
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-300"><span>midnight</span><span>6 am</span><span>noon</span><span>6 pm</span><span>11 pm</span></div>
        </figure>
        <figure>
          <figcaption className="mb-3 text-sm font-semibold text-slate-200">Income range people enter</figcaption>
          <div className="space-y-1.5">
            {incomeRows.map((r) => (
              <div key={r.k} className="flex items-center gap-2 text-xs">
                <span className="w-16 shrink-0 text-right text-slate-300">{INCOME_LABEL[r.k]}</span>
                <span className="h-3 rounded-sm bg-slate-300/80" style={{ width: `${(r.n / incomeMax) * 100}%` }} />
                <span className="tabular-nums text-slate-300">{fmt(r.n)}</span>
              </div>
            ))}
          </div>
        </figure>
      </div>
      <p className="mt-6 text-xs text-slate-300">
        Read from <a href="/data/usage.json" className="text-red-300 underline">usage.json</a>; categories under 20 are withheld. People who looked for a pay calculator, not a random sample of Canadians.
      </p>
    </section>
  );
};

export default DataPulse;
