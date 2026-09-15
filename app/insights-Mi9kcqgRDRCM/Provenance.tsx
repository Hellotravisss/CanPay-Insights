'use client';

/**
 * Where the numbers come from and why they can be trusted.
 *
 * This is the panel a buyer's diligence asks for first — "how do I know this
 * has not been edited?" — and the answer here is genuinely stronger than most
 * commercial data sources have. It was invisible on this page until now, which
 * meant the strongest thing about the dataset was the one thing nobody saw.
 *
 * Every figure is read live from the database, so the panel cannot drift out of
 * date. What CANNOT be read from a web request — the off-site copies and their
 * per-day checksums, which live on a Mac and in a private repo — is described
 * as a mechanism instead of printed as a number. A provenance panel quoting a
 * stale count would defeat its own purpose.
 */

export type ProvenanceData = {
  events: number;
  events_raw: number;
  first_event: string | null;
  last_event: string | null;
  schema_versions: { v: number; n: number }[];
  gsc_days: number;
  gsc_first: string | null;
  gsc_last: string | null;
  gsc_queries: number;
  gsc_pages: number;
  snapshots: { month: string; taken: string }[];
  excluded: number;
  sources?: { source: string; last: string; n: number; silent_days: number }[];
};

/**
 * Known gaps. A provenance panel that only counts what arrived would present
 * a hole in the data as a quiet month; this list says what is missing and why,
 * and whether it was ever filled in (it was not, and must not be).
 */
const INCIDENTS: { from: string; to: string; what: string }[] = [
  {
    from: '2026-08-27',
    to: '2026-09-15',
    what: 'iOS app events rejected by the server (a required field the app did not send). Roughly 120 app calculations were never stored. Not backfilled: the rows do not exist anywhere, and reconstructing them from account history would fabricate data.',
  },
];

// A source that has not written in this many days is shown as an alarm.
const SILENT_AFTER_DAYS = 7;

const n = (v: number) => v.toLocaleString('en-CA');

export default function Provenance({ data }: { data: ProvenanceData | null }) {
  if (!data) return null;

  const rows: { label: string; value: string; note: string }[] = [
    {
      label: 'Calculation events',
      value: `${n(data.events)} of ${n(data.events_raw)}`,
      note: `${n(data.excluded)} excluded as owner or test traffic and never counted anywhere on this page. Collected ${data.first_event} → ${data.last_event}.`,
    },
    {
      label: 'Search Console archive',
      value: `${n(data.gsc_days)} days`,
      note: `${data.gsc_first} → ${data.gsc_last}. ${n(data.gsc_queries)} query rows and ${n(data.gsc_pages)} page rows copied out of Google daily, because Google deletes it after 16 months.`,
    },
    {
      label: 'Schema version',
      value: data.schema_versions.map((s) => `v${s.v}`).join(', ') || '—',
      note: 'Stamped on every row. Fields have only ever been added, so old rows stay readable and are never rewritten to fit a newer shape.',
    },
    {
      label: 'Monthly snapshots',
      value: n(data.snapshots.length),
      note:
        data.snapshots.length > 0
          ? `Immutable aggregate per month, taken once and never recomputed: ${data.snapshots.map((s) => s.month).join(', ')}.`
          : 'The first is taken at the end of the current month.',
    },
  ];

  const sources = data.sources ?? [];
  const quiet = sources.filter((s) => s.silent_days >= SILENT_AFTER_DAYS && s.source !== 'widget');

  return (
    <div>
      {quiet.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900" role="alert">
          <strong>Source silent:</strong>{' '}
          {quiet.map((s) => `${s.source} last wrote ${s.last} (${s.silent_days} days ago)`).join('; ')}. A live source that stops writing is a bug until proven otherwise — the app went quiet for 19 days in August 2026 before anyone looked.
        </div>
      )}
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{r.label}</dt>
            <dd className="mt-0.5 text-xl font-bold tabular-nums text-slate-900">{r.value}</dd>
            <dd className="mt-1 text-xs leading-5 text-slate-500">{r.note}</dd>
          </div>
        ))}
      </dl>

      {sources.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Heartbeat by source</p>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
            {sources.map((s) => (
              <li key={s.source} className="tabular-nums">
                <span className="font-mono font-semibold text-slate-800">{s.source}</span> · {n(s.n)} rows · last {s.last}
                {s.silent_days >= SILENT_AFTER_DAYS && s.source !== 'widget' ? <span className="ml-1 font-semibold text-amber-700">({s.silent_days}d silent)</span> : null}
                {s.source === 'widget' ? <span className="ml-1 text-slate-400">(rare by design)</span> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Known gaps</p>
        <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-500">
          {INCIDENTS.map((i) => (
            <li key={i.from}>
              <strong className="text-slate-700">{i.from} → {i.to}</strong> — {i.what}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Three copies, and a way to prove they agree
        </p>
        <ol className="mt-2 space-y-1.5 text-xs leading-5 text-slate-500">
          <li>
            <strong className="text-slate-700">1. The database</strong> — live, and the source these
            figures are read from.
          </li>
          <li>
            <strong className="text-slate-700">2. A daily file export</strong> — every row of every
            day written to its own file. A day&apos;s file is never overwritten with fewer rows than
            it already holds, so a partial run cannot quietly truncate history.
          </li>
          <li>
            <strong className="text-slate-700">3. An append-only private repository</strong> — those
            files committed off-machine, with a manifest carrying per-table row counts and a SHA-256
            over every day. A verify command re-reads the files against the database and exits
            non-zero on any mismatch.
          </li>
        </ol>
        <p className="mt-3 text-xs leading-5 text-slate-400">
          Copies 2 and 3 live outside this web application and cannot be read from a page request,
          so they are described here rather than counted — a provenance panel printing a number that
          had gone stale would be worse than printing none.
        </p>
      </div>
    </div>
  );
}
