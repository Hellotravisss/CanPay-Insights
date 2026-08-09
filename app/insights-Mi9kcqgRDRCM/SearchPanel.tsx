'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Search Console, archived daily into our own database.
//
// Google discards this after 16 months. Everything here is a copy we own, which
// is the only reason a decade-long view of Canadian pay-search demand can exist
// at all — and pairing it with the calculator telemetry (what people searched
// vs what they then calculated) is something neither GSC nor an analytics tool
// can show on its own.

type Q = { k: string; clicks: number; impressions: number; position: number };
type Day = { k: string; n: number; i: number };
type Gsc = {
  archived_days: number;
  first_day: string | null;
  last_day: string | null;
  unique_queries: number;
  clicks_28: number;
  impressions_28: number;
  position_28: number | null;
  clicks_prev_28: number;
  impressions_prev_28: number;
  daily: Day[];
  top_queries: Q[];
  top_pages: Q[];
  near_miss: Q[];
};

function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev) return <span className="text-xs text-slate-400">no prior period</span>;
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}% vs previous 28 days
    </span>
  );
}

function QueryTable({ rows, caption }: { rows: Q[]; caption: string }) {
  if (!rows?.length) return <p className="text-sm text-slate-400">No data yet.</p>;
  const max = Math.max(...rows.map((r) => r.impressions), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <th className="py-1.5 pr-3 font-semibold">Query</th>
            <th className="py-1.5 pr-3 text-right font-semibold">Clicks</th>
            <th className="py-1.5 pr-3 font-semibold">Impressions</th>
            <th className="py-1.5 text-right font-semibold">Position</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.k} className="border-b border-slate-100">
              <td className="max-w-[15rem] truncate py-2 pr-3 text-slate-700">{r.k}</td>
              <td className="py-2 pr-3 text-right tabular-nums font-semibold text-slate-900">
                {r.clicks}
              </td>
              <td className="py-2 pr-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 shrink-0 rounded-full bg-slate-100">
                    <div
                      className="h-1.5 rounded-full bg-sky-500"
                      style={{ width: `${(r.impressions / max) * 100}%` }}
                    />
                  </div>
                  <span className="tabular-nums text-xs text-slate-500">{r.impressions}</span>
                </div>
              </td>
              <td className="py-2 text-right tabular-nums text-slate-500">{r.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SearchPanel() {
  const [g, setG] = useState<Gsc | null>(null);

  useEffect(() => {
    supabase.rpc('gsc_stats').then(({ data }) => {
      if (data) setG(data as Gsc);
    });
  }, []);

  if (!g) return null;

  const W = 900;
  const H = 150;
  const PAD = 28;
  const maxI = Math.max(1, ...g.daily.map((d) => d.i));
  const stepX = (W - PAD * 2) / Math.max(1, g.daily.length - 1);
  const line = (key: 'n' | 'i', scale: number) =>
    g.daily
      .map((d, i) => `${PAD + i * stepX},${H - PAD - (d[key] / scale) * (H - PAD * 2)}`)
      .join(' ');
  const maxC = Math.max(1, ...g.daily.map((d) => d.n));

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800">Search demand (Google)</h2>
        <span className="text-xs text-slate-400">
          {g.archived_days} days archived · {g.first_day} → {g.last_day}
        </span>
      </div>
      <p className="mb-5 text-xs leading-5 text-slate-400">
        Copied daily out of Search Console into our own database, because Google deletes it after
        16 months. {g.unique_queries.toLocaleString()} distinct queries captured so far.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-slate-900">{g.clicks_28}</div>
          <div className="text-[11px] font-medium text-slate-500">Clicks, 28 days</div>
          <Delta now={g.clicks_28} prev={g.clicks_prev_28} />
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-slate-900">
            {g.impressions_28.toLocaleString()}
          </div>
          <div className="text-[11px] font-medium text-slate-500">Impressions, 28 days</div>
          <Delta now={g.impressions_28} prev={g.impressions_prev_28} />
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-slate-900">
            {g.impressions_28 ? ((g.clicks_28 / g.impressions_28) * 100).toFixed(1) : '0'}%
          </div>
          <div className="text-[11px] font-medium text-slate-500">Click-through rate</div>
        </div>
        <div className="rounded-xl bg-slate-50 px-3 py-2.5">
          <div className="text-lg font-bold tabular-nums text-slate-900">{g.position_28 ?? '—'}</div>
          <div className="text-[11px] font-medium text-slate-500">Average position</div>
        </div>
      </div>

      {g.daily.length > 1 && (
        <div className="mb-6">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 480 }}>
            <polyline points={line('i', maxI)} fill="none" stroke="#7dd3fc" strokeWidth="2" />
            <polyline points={line('n', maxC)} fill="none" stroke="#dc2626" strokeWidth="2" />
            <text x={PAD} y={14} className="fill-slate-400 text-[10px]">
              impressions (light) · clicks (red) — last 60 days, each scaled to its own maximum
            </text>
          </svg>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-bold text-slate-700">Top queries, 28 days</h3>
          <QueryTable rows={g.top_queries} caption="Top queries" />
        </div>
        <div>
          <h3 className="mb-1 text-sm font-bold text-slate-700">Closest to the first page</h3>
          <p className="mb-2 text-[11px] leading-4 text-slate-400">
            Real demand where we rank 5–20. Moving these up a few places is worth more than finding
            new keywords — clicks rise steeply between position 10 and position 5.
          </p>
          <QueryTable rows={g.near_miss} caption="Near-miss queries" />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-bold text-slate-700">Top pages, 28 days</h3>
        <QueryTable
          rows={g.top_pages.map((p) => ({ ...p, k: p.k.replace('https://canpayinsights.ca', '') || '/' }))}
          caption="Top pages"
        />
      </div>
    </section>
  );
}
