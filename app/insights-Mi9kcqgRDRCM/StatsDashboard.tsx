'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Globe from './Globe';
import Donut from './Donut';

// Private data room. Deliberately styled the way a published data story would
// look — this doubles as the visual rehearsal for the eventual public /data
// report and the year-end Awards.

type Row = { k: string | number; n: number };
type Stats = {
  total: number;
  sessions: number;
  first_event: string | null;
  last_event: string | null;
  last_7d: number;
  geo_known: number;
  excluded_rows: number;
  by_province: Row[];
  by_bracket: Row[];
  by_lang: Row[];
  by_country: Row[];
  by_city: Row[];
  cities_geo: { city: string; lat: number; lon: number; n: number }[];
  by_device: Row[];
  by_mode: Row[];
  by_source: Row[];
  by_industry: Row[];
  by_hour: Row[];
  by_dow: Row[];
  by_daily: Row[];
  work: {
    n: number;
    unpaid_break_share: number | null;
    median_break: number | null;
    weekend_share: number | null;
    median_daily_hours: number | null;
    median_days_week: number | null;
  } | null;
  comparison_sessions: number;
  rrsp: { n: number; has_rrsp_share: number | null; employer_match_share: number | null } | null;
  by_rrsp_pct: Row[];
  by_ot: Row[];
  premium: { n: number; share: number | null } | null;
  by_premium_rate: Row[];
  by_tips: Row[];
  by_pay_freq: Row[];
  engagement: { report_share: number | null; median_calcs_per_session: number | null } | null;
};

const RRSP_LABEL: Record<string, string> = {
  '0': 'None', '1-5': '1–5% of pay', '5-10': '5–10%', '10-15': '10–15%', '15-plus': '15%+',
};
const OT_LABEL: Record<string, string> = {
  '0': 'No overtime', 'under-5': 'Under 5 h', '5-10': '5–10 h', '10-plus': '10 h+',
};
const TIPS_LABEL: Record<string, string> = {
  '0': 'No tips', '1-10': '1–10% of pay', '10-20': '10–20%', '20-30': '20–30%', '30-plus': '30%+',
};
const PREMIUM_LABEL: Record<string, string> = {
  'under-2': 'Under $2/h', '2-4': '$2–4/h', '4-6': '$4–6/h', '6-plus': '$6+/h',
};

const LANG_NAMES: Record<string, string> = {
  en: 'English', fr: 'Français', zh: '中文', pa: 'ਪੰਜਾਬੀ', hi: 'हिन्दी',
  tl: 'Tagalog', es: 'Español', uk: 'Українська', ko: '한국어', vi: 'Tiếng Việt',
};
const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const BRACKET_LABEL: Record<string, string> = {
  'under-30k': 'Under $30k', '30-50k': '$30–50k', '50-70k': '$50–70k',
  '70-90k': '$70–90k', '90-120k': '$90–120k', '120-160k': '$120–160k',
  '160k-plus': '$160k+',
};

function Bars({ rows, label, total }: { rows: Row[]; label?: (k: string | number) => string; total: number }) {
  if (!rows?.length) return <p className="text-sm text-slate-400">No data yet.</p>;
  const max = Math.max(...rows.map((r) => r.n));
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={String(r.k)} className="grid grid-cols-[9rem_1fr_4.5rem] items-center gap-3">
          <span className="truncate text-sm text-slate-600">{label ? label(r.k) : String(r.k)}</span>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className="h-2.5 rounded-full bg-red-600" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
          <span className="text-right text-xs tabular-nums text-slate-500">
            {r.n} · {total ? Math.round((r.n / total) * 100) : 0}%
          </span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {hint && <p className="mb-4 mt-0.5 text-xs leading-5 text-slate-400">{hint}</p>}
      <div className={hint ? '' : 'mt-4'}>{children}</div>
    </section>
  );
}

export default function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.rpc('calc_stats').then(({ data, error }) => {
      if (error) setError(error.message);
      else setStats(data as Stats);
    });
  }, []);

  if (error) return <div className="p-10 text-sm text-red-600">Could not load stats: {error}</div>;
  if (!stats) return <div className="p-10 text-sm text-slate-400">Loading…</div>;

  const t = stats.total;
  const days =
    stats.first_event && stats.last_event
      ? Math.max(1, Math.round((+new Date(stats.last_event) - +new Date(stats.first_event)) / 86400000))
      : 1;
  const hourRows = Array.from({ length: 24 }, (_, h) => ({
    k: h,
    n: stats.by_hour.find((r) => Number(r.k) === h)?.n ?? 0,
  }));
  const maxHour = Math.max(1, ...hourRows.map((r) => r.n));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">Private data room</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">What Canadians are calculating</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Anonymous aggregate statistics from the CanPay Insights calculator. Income is recorded as a
            bracket, never an exact amount; no IP addresses, accounts, or device fingerprints are stored.
            This page is unlisted and not indexed. Owner and testing traffic is excluded from every
            number here — add <code className="rounded bg-slate-100 px-1">?notelemetry=1</code> to any
            page URL to permanently silence a browser you test from.
          </p>
        </header>

        {/* Headline numbers */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { n: t.toLocaleString(), l: 'Calculations recorded' },
            { n: stats.sessions.toLocaleString(), l: 'Visits (with a visit id)' },
            { n: stats.last_7d.toLocaleString(), l: 'Last 7 days' },
            { n: `${days}d`, l: 'Collecting since' },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-3xl font-bold tabular-nums text-slate-900">{s.n}</div>
              <div className="mt-1 text-xs font-medium text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>

        <p className="mb-8 -mt-4 text-xs leading-5 text-slate-400">
          A visit id is minted per page load and discarded when the visitor leaves, so a returning
          person counts as a new visit, and the earliest events predate visit ids entirely. Treat the
          visit count as a floor, not a headcount — calculations recorded is the reliable number.
        </p>

        {/* Media-readiness gauge: how close the dataset is to being pitchable */}
        <div className="mb-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-base font-bold text-slate-800">Media-readiness</h2>
            <span className="text-xs text-slate-400">target: 5,000 events for a citable data story</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-red-400 to-red-600"
              style={{ width: `${Math.min(100, (t / 5000) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {t.toLocaleString()} / 5,000 ({Math.min(100, Math.round((t / 5000) * 100))}%)
            {/* Rate over the whole collection window, not last_7d/7 — with only
                a few days of history the 7-day divisor understates badly. */}
            {t < 5000 &&
              ` — ~${(t / days).toFixed(1)}/day so far, about ${Math.ceil((5000 - t) / Math.max(0.5, t / days))} days to target.`}
          </p>
        </div>

        {/* Globe — where in the world people are calculating Canadian pay */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-800">Live map</h2>
          <p className="mb-4 mt-0.5 text-xs leading-5 text-slate-400">
            City centroids only — the centre point of the city a visit came from, never a precise
            location and never an IP address. Dot size is volume. Based on {stats.geo_known} of{' '}
            {t} events; the earliest {t - stats.geo_known} predate location collection.
          </p>
          <Globe cities={stats.cities_geo ?? []} countries={stats.by_country} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Province calculated" hint="The province the user selected — the core, untamperable signal.">
            <Bars rows={stats.by_province} total={t} />
          </Card>

          <Card title="Income bracket" hint="Exact salaries are never stored — only these seven ranges.">
            <Bars rows={stats.by_bracket} total={t} label={(k) => BRACKET_LABEL[String(k)] ?? String(k)} />
          </Card>

          <Card title="Interface language" hint="Ten languages live. Language × country is the newcomer-intent signal.">
            <Bars rows={stats.by_lang} total={t} label={(k) => LANG_NAMES[String(k)] ?? String(k)} />
          </Card>

          <Card title="Calculator used">
            <Donut rows={stats.by_mode} />
          </Card>

          <Card title="Device">
            <Donut rows={stats.by_device} label={(k) => (k === '?' ? 'Unknown' : String(k))} />
          </Card>

          <Card title="Declared industry" hint="Voluntary — users pick it to see where their pay stands.">
            <Bars rows={stats.by_industry} total={t} />
          </Card>

          <Card title="Day of week" hint="Payday-cycle signal: most Canadian employers pay biweekly on Fridays.">
            <Bars rows={stats.by_dow} total={t} label={(k) => DOW[Number(k)] ?? String(k)} />
          </Card>

          <Card title="Source">
            <Bars rows={stats.by_source} total={t} />
          </Card>
        </div>

        {/* Hour of day — full 24h profile */}
        <div className="mt-6">
          <Card title="Hour of day (user's local time)" hint="When Canadians check their pay.">
            <div className="flex h-32 items-end gap-1">
              {hourRows.map((r) => (
                <div key={r.k} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-red-600"
                    style={{ height: `${(r.n / maxHour) * 100}%`, minHeight: r.n ? 3 : 0 }}
                    title={`${r.k}:00 — ${r.n}`}
                  />
                  <span className="text-[9px] text-slate-400">{Number(r.k) % 6 === 0 ? r.k : ''}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Work patterns — the story nobody else has */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card
            title="Work patterns"
            hint={`From ${stats.work?.n ?? 0} shift/timesheet calculations. Schedule shape only — never specific dates.`}
          >
            <dl className="space-y-3 text-sm">
              {[
                ['Have an unpaid break', stats.work?.unpaid_break_share != null ? `${stats.work.unpaid_break_share}%` : '—'],
                ['Median unpaid break', stats.work?.median_break != null ? `${stats.work.median_break} min` : '—'],
                ['Work weekends', stats.work?.weekend_share != null ? `${stats.work.weekend_share}%` : '—'],
                ['Median shift length', stats.work?.median_daily_hours != null ? `${stats.work.median_daily_hours} h` : '—'],
                ['Median days per week', stats.work?.median_days_week != null ? `${stats.work.median_days_week}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                  <dt className="text-slate-600">{k}</dt>
                  <dd className="text-lg font-bold tabular-nums text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card
            title="Relocation intent"
            hint="Visits where one person compared two or more provinces in a single session."
          >
            <div className="text-5xl font-bold tabular-nums text-red-600">{stats.comparison_sessions}</div>
            <p className="mt-2 text-sm text-slate-500">
              {stats.sessions
                ? `${Math.round((stats.comparison_sessions / stats.sessions) * 100)}% of all visits`
                : ''}
            </p>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              This is the dataset nobody else has: someone weighing a move sees two provinces side by
              side in one sitting. At scale it becomes the interprovincial-migration story.
            </p>
          </Card>
        </div>

        {/* Savings, premium pay, tips — signals nobody else collects */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card
            title="RRSP behaviour"
            hint={`From ${stats.rrsp?.n ?? 0} calculations. Contribution stored as a share of pay, bucketed.`}
          >
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-2xl font-bold tabular-nums text-slate-900">
                  {stats.rrsp?.has_rrsp_share != null ? `${stats.rrsp.has_rrsp_share}%` : '—'}
                </div>
                <div className="text-xs text-slate-500">contribute to an RRSP</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-2xl font-bold tabular-nums text-slate-900">
                  {stats.rrsp?.employer_match_share != null ? `${stats.rrsp.employer_match_share}%` : '—'}
                </div>
                <div className="text-xs text-slate-500">get an employer match</div>
              </div>
            </div>
            <Bars rows={stats.by_rrsp_pct} total={t} label={(k) => RRSP_LABEL[String(k)] ?? String(k)} />
          </Card>

          <Card title="Overtime & shift premium" hint="Canada has no systematic public data on night-shift premiums.">
            <div className="mb-4 rounded-xl bg-slate-50 p-3">
              <div className="text-2xl font-bold tabular-nums text-slate-900">
                {stats.premium?.share != null ? `${stats.premium.share}%` : '—'}
              </div>
              <div className="text-xs text-slate-500">receive a shift premium</div>
            </div>
            <Bars rows={stats.by_ot} total={t} label={(k) => OT_LABEL[String(k)] ?? String(k)} />
            {stats.by_premium_rate?.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Premium rate</p>
                <Bars rows={stats.by_premium_rate} total={t} label={(k) => PREMIUM_LABEL[String(k)] ?? String(k)} />
              </div>
            )}
          </Card>

          <Card title="Tips" hint="Declared tips as a share of pay, from the timesheet calculator. Official tip data barely exists.">
            <Bars rows={stats.by_tips} total={t} label={(k) => TIPS_LABEL[String(k)] ?? String(k)} />
          </Card>

          <Card title="Pay frequency">
            <Donut rows={stats.by_pay_freq} />
          </Card>

          <Card title="Engagement" hint="Product diagnostics — not for publication.">
            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-600">Open the deep tax report</dt>
                <dd className="text-lg font-bold tabular-nums text-slate-900">
                  {stats.engagement?.report_share != null ? `${stats.engagement.report_share}%` : '—'}
                </dd>
              </div>
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-2">
                <dt className="text-slate-600">Median calculations per visit</dt>
                <dd className="text-lg font-bold tabular-nums text-slate-900">
                  {stats.engagement?.median_calcs_per_session ?? '—'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Daily volume */}
        <div className="mt-6">
          <Card title="Daily volume (last 30 days)">
            <Bars rows={stats.by_daily} total={t} />
          </Card>
        </div>

        <p className="mt-10 text-center text-xs text-slate-400">
          Live from the anonymous events table · {stats.excluded_rows} owner/test event
          {stats.excluded_rows === 1 ? '' : 's'} excluded · last event{' '}
          {stats.last_event ? new Date(stats.last_event).toLocaleString('en-CA') : '—'}
        </p>
      </div>
    </div>
  );
}
