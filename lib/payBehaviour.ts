import { db, type D1 } from './d1/db';
import { loadEvents, calcStats, calcStatsExtra, calcJourneys, calcSeries, calcIncomeBarometer, type Ev } from './d1/events';

/**
 * The public research note's figures, computed from D1 at render time.
 *
 * This replaced a snapshot file that only changed when someone remembered to
 * regenerate it. Two things had to come with the change, or "live" would have
 * been worse than stale:
 *
 *  - Every chart is drawn from this same object (see researchCharts.ts). The
 *    charts used to be committed SVGs with the numbers baked in, so a live page
 *    would have contradicted its own illustrations.
 *  - The figures each day are written to `research_daily` and shown as a table.
 *    A page that silently rewrites itself cannot be cited; a page that keeps a
 *    dated record of what it said can. That table IS the citation guarantee now.
 *
 * The definitions here are the ones that survived the default-value audit on
 * 2026-09-18 — read the "how this was tested" notes on the page before changing
 * any of them, especially the shift and income-move ones.
 */
export type PayBehaviour = Awaited<ReturnType<typeof computePayBehaviour>>;
export type HistoryRow = { day: string; n: number; raise: number; before7: number; move: number };

const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const LANG_NAMES: [string, string][] = [['zh', 'Chinese'], ['fr', 'French'], ['ko', 'Korean'],
  ['es', 'Spanish'], ['pa', 'Punjabi'], ['hi', 'Hindi'], ['tl', 'Tagalog'], ['uk', 'Ukrainian'], ['vi', 'Vietnamese']];

/** Vancouver's date, not UTC's — a page whose promise is a checkable date must not be stamped tomorrow. */
export const vancouverToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' });

export async function computePayBehaviour(d: D1, ev: Ev[]) {
  const stats = calcStats(ev, 0);
  const extra = calcStatsExtra(ev);
  const j = calcJourneys(ev);
  const series = calcSeries(ev);
  const baro = calcIncomeBarometer(ev);

  const N = stats.total;
  const share = (m: { up: number; down: number }) => ({ up: m.up, down: m.down, n: m.up + m.down, upShare: pct(m.up, m.up + m.down) });
  const net = share(j.income_moves_net), steps = share(j.income_moves), later = share(j.income_moves_later);

  const hoursOf = (rows: { k: string | number | null; n: number }[]) =>
    Array.from({ length: 24 }, (_, h) => rows.find((r) => r.k !== null && Number(r.k) === h)?.n ?? 0);
  const night = (h: number[]) => sum(h.filter((_, i) => i >= 18 || i < 6));
  const all = hoursOf(extra.by_shift_start), edited = hoursOf(extra.by_shift_start_edited);
  const allTotal = sum(all), editedTotal = sum(edited);

  // Sessions that priced two or more provinces. Done in SQL because it is a
  // per-session distinct count, not a row count.
  const mp = await d.prepare(
    `select count(*) n from (select session_id from events
       where session_id is not null and (excluded is null or excluded = 0)
       group by session_id having count(distinct province) > 1)`).first<{ n: number }>();
  const sessions = j.sessions;

  const langRows = stats.by_lang.filter((r) => r.k !== null);
  const langTotal = sum(langRows.map((r) => r.n));
  const langOf = (k: string) => langRows.find((r) => r.k === k)?.n ?? 0;
  const days = series.daily.filter((x) => x.n > 0);

  return {
    generated: vancouverToday(),
    since: (stats.first_event ?? '').slice(0, 10),
    n: N,
    sessions,
    raise: { multiShare: pct(j.multi, j.sessions), variedIncomeShare: pct(j.varied.income, j.multi), net, steps, later },
    shifts: {
      allTotal, editedTotal, defaultRows: allTotal - editedTotal,
      notNineFloor: pct(allTotal - all[9], allTotal), nightFloor: pct(night(all), allTotal),
      editedBefore7: pct(sum(edited.slice(0, 7)), editedTotal), editedNight: pct(night(edited), editedTotal),
      edited,
    },
    move: { share: pct(mp?.n ?? 0, sessions), sessions, multiProv: mp?.n ?? 0 },
    lang: {
      total: langTotal,
      nonEnglishShare: pct(langTotal - langOf('en'), langTotal),
      zhShare: pct(langOf('zh'), langTotal),
      // Languages under twenty calculations are folded into one "other" bar:
      // the page promises that any figure it publishes has at least twenty
      // behind it, and it was publishing Punjabi 1 and Vietnamese 1.
      bars: (() => {
        const all = LANG_NAMES.map(([k, name]) => ({ name, n: langOf(k) })).filter((x) => x.n > 0);
        const big = all.filter((x) => x.n >= 20).sort((a, b) => b.n - a.n);
        const small = all.filter((x) => x.n < 20).reduce((t, x) => t + x.n, 0);
        return small > 0 ? [...big, { name: 'other languages', n: small }] : big;
      })(),
    },
    weekend: { share: Math.round(stats.work.weekend_share), n: stats.work.n },
    belowMedianShare: Math.round(baro.year[baro.year.length - 1]?.below_median_share ?? 0),
    sample: {
      days: days.length, caShare: pct(stats.by_country.find((r) => r.k === 'CA')?.n ?? 0, N),
      first: days[0]?.k ?? null, busiest: Math.max(...days.map((x) => x.n), 0),
      provinces: stats.by_province.slice(0, 6), daily: days.map((x) => ({ k: x.k, n: x.n })),
    },
  };
}

/**
 * One row a day, written the first time the page renders that day. Upsert, so
 * a re-render is harmless; the row is never updated once written, because the
 * point of it is to record what the page said at the time.
 */
export async function recordAndReadHistory(d: D1, s: { generated: string; n: number; raise: { net: { upShare: number } }; shifts: { editedBefore7: number }; move: { share: number } }): Promise<HistoryRow[]> {
  try {
    await d.prepare(
      `insert into research_daily (day, n, raise_up, before7, move_share) values (?, ?, ?, ?, ?)
       on conflict(day) do nothing`)
      .bind(s.generated, s.n, s.raise.net.upShare, s.shifts.editedBefore7, s.move.share).run();
  } catch { /* a read-only failure must not take the page down */ }
  try {
    const { results } = await d.prepare(
      'select day, n, raise_up, before7, move_share from research_daily order by day').all<Record<string, number | string>>();
    return results.map((r) => ({ day: String(r.day), n: Number(r.n), raise: Number(r.raise_up), before7: Number(r.before7), move: Number(r.move_share) }));
  } catch { return []; }
}

export async function payBehaviour() {
  const d = await db();
  const ev = await loadEvents(d);
  const snapshot = await computePayBehaviour(d, ev);
  const history = await recordAndReadHistory(d, snapshot);
  return { ...snapshot, history };
}
