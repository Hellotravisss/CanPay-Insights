'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// What to write next.
//
// Two measures, kept apart on purpose:
//   READ      — Search Console clicks. Did the topic get found at all?
//   CONVERTED — calculations from visits that started on that article. Did the
//               piece actually send anyone to the tool?
// A piece can win one and lose the other, and the gap is the instruction: high
// reads with no conversions means the topic attracts the wrong reader, or the
// article never hands them a reason to calculate.

type Read = { path: string; clicks: number; impressions: number; ctr: number | null };
type Conv = { path: string; calcs: number; visits: number; clicks: number | null };
type Stats = {
  window_days: number;
  entry_tracking_started: string | null;
  top_read: Read[];
  top_converting: Conv[];
  read_not_converting: Read[];
  totals: {
    blog_clicks_90d: number;
    blog_impressions_90d: number;
    calcs_from_articles: number;
    articles_with_data: number;
  };
};

const title = (path: string) =>
  path
    .replace('/blog/', '')
    .replace(/-/g, ' ')
    .replace(/\b(\d{4})\b/g, '$1')
    .replace(/^./, (c) => c.toUpperCase());

function Row({
  path,
  primary,
  secondary,
  bar,
}: {
  path: string;
  primary: string;
  secondary: string;
  bar: number;
}) {
  return (
    <li className="border-b border-slate-100 py-2.5 last:border-0">
      <div className="flex items-baseline justify-between gap-4">
        <a
          href={path}
          target="_blank"
          rel="noreferrer"
          className="truncate text-sm text-slate-700 no-underline hover:text-red-600"
          title={path}
        >
          {title(path)}
        </a>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">{primary}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full bg-red-600" style={{ width: `${bar}%` }} />
        </div>
        <span className="shrink-0 text-[11px] tabular-nums text-slate-400">{secondary}</span>
      </div>
    </li>
  );
}

export default function ContentPanel() {
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    supabase.rpc('content_stats').then(({ data }) => {
      if (data) setS(data as Stats);
    });
  }, []);

  if (!s) return null;

  const maxClicks = Math.max(1, ...s.top_read.map((r) => r.clicks || r.impressions / 100));
  const maxCalcs = Math.max(1, ...s.top_converting.map((r) => r.calcs));

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800">Which articles are working</h2>
        <span className="text-xs text-slate-400">last {s.window_days} days</span>
      </div>
      <p className="mb-5 text-xs leading-5 text-slate-400">
        Getting read and getting someone to calculate are different things. The first column is
        Search Console clicks; the second counts calculations from visits that began on that article.
      </p>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { n: s.totals.blog_clicks_90d.toLocaleString(), l: 'Article clicks' },
          { n: s.totals.blog_impressions_90d.toLocaleString(), l: 'Article impressions' },
          { n: s.totals.calcs_from_articles.toLocaleString(), l: 'Calculations from articles' },
          { n: s.totals.articles_with_data.toLocaleString(), l: 'Articles with any data' },
        ].map((x) => (
          <div key={x.l} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="text-lg font-bold tabular-nums text-slate-900">{x.n}</div>
            <div className="text-[11px] font-medium text-slate-500">{x.l}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="mb-1 text-sm font-bold text-slate-700">Most read</h3>
          <p className="mb-2 text-[11px] leading-4 text-slate-400">
            Search Console clicks, with impressions and click-through rate underneath.
          </p>
          <ul>
            {s.top_read.slice(0, 10).map((r) => (
              <Row
                key={r.path}
                path={r.path}
                primary={`${r.clicks} click${r.clicks === 1 ? '' : 's'}`}
                secondary={`${r.impressions.toLocaleString()} impr · ${r.ctr ?? 0}% CTR`}
                bar={(r.clicks / maxClicks) * 100}
              />
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-1 text-sm font-bold text-slate-700">Most likely to start a calculation</h3>
          {s.top_converting.length === 0 ? (
            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-3 text-[11px] leading-5 text-slate-500">
              Nothing yet. This counts calculations whose visit began on an article, and that
              signal only started being recorded on{' '}
              {s.entry_tracking_started ?? 'the deploy that added it'} — it cannot be backfilled,
              so give it a couple of weeks of traffic.
            </p>
          ) : (
            <ul>
              {s.top_converting.slice(0, 10).map((r) => (
                <Row
                  key={r.path}
                  path={r.path}
                  primary={`${r.calcs} calc${r.calcs === 1 ? '' : 's'}`}
                  secondary={`${r.visits} visit${r.visits === 1 ? '' : 's'}${
                    r.clicks ? ` · ${r.clicks} search clicks` : ''
                  }`}
                  bar={(r.calcs / maxCalcs) * 100}
                />
              ))}
            </ul>
          )}
        </div>
      </div>

      {s.read_not_converting.length > 0 && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-bold text-amber-900">Read, but nobody calculated</h3>
          <p className="mt-1 text-[11px] leading-5 text-amber-800">
            These earn clicks and send no one to the tool. Either the topic attracts a reader who
            was never going to calculate, or the piece never gives them a reason to. Worth rewriting
            before writing more like them.
          </p>
          <ul className="mt-3 space-y-1">
            {s.read_not_converting.slice(0, 6).map((r) => (
              <li key={r.path} className="flex items-baseline justify-between gap-4 text-sm">
                <a
                  href={r.path}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-amber-900 no-underline hover:underline"
                >
                  {title(r.path)}
                </a>
                <span className="shrink-0 tabular-nums text-amber-800">
                  {r.clicks} click{r.clicks === 1 ? '' : 's'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
