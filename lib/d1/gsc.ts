import type { D1 } from './db';
import { today, blogEntries, type Ev } from './events';

/**
 * Search Console archive on D1 — gsc_stats, content_stats, the ingest the
 * daily GitHub Actions robot calls, and the per-day export the backup robot
 * reads. Plain sums and averages, so these stay in SQL.
 */

function daysAgo(n: number): string {
  const t = new Date(`${today()}T00:00:00Z`); t.setUTCDate(t.getUTCDate() - n); return t.toISOString().slice(0, 10);
}
const r1 = (x: number | null) => (x === null ? null : Math.round(x * 10) / 10);

export async function gscStats(d: D1) {
  const t = today();
  const q = async <T = Record<string, unknown>>(sql: string, ...b: unknown[]) => (await d.prepare(sql).bind(...b).all<T>()).results;
  const one = async <T = Record<string, unknown>>(sql: string, ...b: unknown[]) => (await d.prepare(sql).bind(...b).first<T>())!;
  const hdr = await one<{ archived_days: number; first_day: string | null; last_day: string | null }>(
    'select count(*) archived_days, min(date) first_day, max(date) last_day from gsc_daily');
  const uq = await one<{ n: number }>('select count(distinct query) n from gsc_queries');
  const recent = await one<{ c: number; i: number; p: number | null }>(
    'select coalesce(sum(clicks),0) c, coalesce(sum(impressions),0) i, avg(position) p from gsc_daily where date > ?', daysAgo(29));
  const prev = await one<{ c: number; i: number }>(
    'select coalesce(sum(clicks),0) c, coalesce(sum(impressions),0) i from gsc_daily where date > ? and date <= ?', daysAgo(57), daysAgo(29));
  const daily = await q<{ k: string; n: number; i: number }>(
    'select date k, clicks n, impressions i from gsc_daily where date > ? order by date', daysAgo(60));
  const topQ = await q('select query k, sum(clicks) clicks, sum(impressions) impressions, avg(position) position from gsc_queries where date > ? group by query order by sum(clicks) desc, sum(impressions) desc limit 15', daysAgo(29));
  const topP = await q('select page k, sum(clicks) clicks, sum(impressions) impressions, avg(position) position from gsc_pages where date > ? group by page order by sum(clicks) desc, sum(impressions) desc limit 12', daysAgo(29));
  const near = await q('select query k, sum(impressions) impressions, sum(clicks) clicks, avg(position) position from gsc_queries where date > ? group by query having avg(position) between 5 and 20 and sum(impressions) >= 50 order by sum(impressions) desc limit 12', daysAgo(29));
  const fix = (rows: Record<string, unknown>[]) => rows.map((r) => ({ ...r, position: r1(r.position as number) }));
  void t;
  return {
    archived_days: hdr.archived_days, first_day: hdr.first_day, last_day: hdr.last_day,
    unique_queries: uq.n,
    clicks_28: recent.c, impressions_28: recent.i, position_28: r1(recent.p),
    clicks_prev_28: prev.c, impressions_prev_28: prev.i,
    daily, top_queries: fix(topQ), top_pages: fix(topP), near_miss: fix(near),
  };
}

export async function contentStats(d: D1, ev: Ev[]) {
  const since = daysAgo(90);
  const blog = (await d.prepare(
    "select replace(replace(page,'https://canpayinsights.ca',''),'http://canpayinsights.ca','') path, sum(clicks) clicks, sum(impressions) impressions from gsc_pages where page like '%/blog/%' and date > ? group by path",
  ).bind(since).all<{ path: string; clicks: number; impressions: number }>()).results;
  const { started, entries } = blogEntries(ev);
  const byPath = new Map(blog.map((b) => [b.path, b]));
  const entryPaths = new Set(entries.map((e) => e.path));
  return {
    window_days: 90,
    entry_tracking_started: started,
    top_read: [...blog].sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions).slice(0, 15)
      .map((b) => ({ ...b, ctr: b.impressions ? Math.round((1000 * b.clicks) / b.impressions) / 10 : null })),
    top_converting: [...entries].sort((a, b) => b.calcs - a.calcs).slice(0, 15)
      .map((e) => ({ ...e, clicks: byPath.get(e.path)?.clicks ?? null })),
    read_not_converting: blog.filter((b) => !entryPaths.has(b.path) && b.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 10),
    totals: {
      blog_clicks_90d: blog.reduce((a, b) => a + b.clicks, 0),
      blog_impressions_90d: blog.reduce((a, b) => a + b.impressions, 0),
      calcs_from_articles: entries.reduce((a, e) => a + e.calcs, 0),
      articles_with_data: blog.length,
    },
  };
}

export async function gscArchivedDays(d: D1, since: string): Promise<string[]> {
  return (await d.prepare('select date from gsc_daily where date >= ? order by date').bind(since).all<{ date: string }>()).results.map((r) => r.date);
}

type Payload = { date: string; totals?: { clicks?: number; impressions?: number; ctr?: number; position?: number }; queries?: { key: string; clicks: number; impressions: number; ctr: number; position: number }[]; pages?: { key: string; clicks: number; impressions: number; ctr: number; position: number }[] };

export async function gscIngest(d: D1, p: Payload) {
  const date = p.date;
  const stmts: unknown[] = [
    d.prepare('insert into gsc_daily (date,clicks,impressions,ctr,position,fetched_at) values (?,?,?,?,?,?) on conflict(date) do update set clicks=excluded.clicks, impressions=excluded.impressions, ctr=excluded.ctr, position=excluded.position, fetched_at=excluded.fetched_at')
      .bind(date, p.totals?.clicks ?? 0, p.totals?.impressions ?? 0, p.totals?.ctr ?? null, p.totals?.position ?? null, new Date().toISOString()),
  ];
  for (const r of p.queries ?? []) stmts.push(d.prepare('insert into gsc_queries (date,query,clicks,impressions,ctr,position) values (?,?,?,?,?,?) on conflict(date,query) do update set clicks=excluded.clicks, impressions=excluded.impressions, ctr=excluded.ctr, position=excluded.position').bind(date, r.key, r.clicks, r.impressions, r.ctr, r.position));
  for (const r of p.pages ?? []) stmts.push(d.prepare('insert into gsc_pages (date,page,clicks,impressions,ctr,position) values (?,?,?,?,?,?) on conflict(date,page) do update set clicks=excluded.clicks, impressions=excluded.impressions, ctr=excluded.ctr, position=excluded.position').bind(date, r.key, r.clicks, r.impressions, r.ctr, r.position));
  // D1 batches are transactional; chunk to stay under the statement cap.
  for (let i = 0; i < stmts.length; i += 100) await d.batch(stmts.slice(i, i + 100));
  return { date, queries: (p.queries ?? []).length, pages: (p.pages ?? []).length };
}

/** export_day: everything for one Vancouver-local day, for the git backup. */
export async function exportDay(d: D1, date: string) {
  const q = async (sql: string) => (await d.prepare(sql).bind(date).all()).results;
  // Events are stored in UTC; the day boundary is Vancouver-local, so a
  // window a day either side is scanned and filtered precisely in code.
  const { localDate } = await import('./events');
  const lo = new Date(`${date}T00:00:00Z`); lo.setUTCDate(lo.getUTCDate() - 1);
  const hi = new Date(`${date}T00:00:00Z`); hi.setUTCDate(hi.getUTCDate() + 2);
  const wide = (await d.prepare('select * from events where created_at >= ? and created_at < ? order by id').bind(lo.toISOString(), hi.toISOString()).all<Ev>()).results;
  return {
    date,
    gsc_daily: await q('select * from gsc_daily where date = ? order by date'),
    gsc_queries: await q('select * from gsc_queries where date = ? order by impressions desc, query'),
    gsc_pages: await q('select * from gsc_pages where date = ? order by impressions desc, page'),
    calc_events: wide.filter((r) => localDate(r.created_at as string) === date),
  };
}

export async function exportManifest(d: D1) {
  const counts = (await d.prepare('select (select count(*) from gsc_daily) gsc_daily, (select count(*) from gsc_queries) gsc_queries, (select count(*) from gsc_pages) gsc_pages, (select count(*) from events) calc_events').first())!;
  const gscDays = (await d.prepare('select date from gsc_daily').all<{ date: string }>()).results.map((r) => r.date);
  const { localDate } = await import('./events');
  const evDays = (await d.prepare('select created_at from events').all<{ created_at: string }>()).results.map((r) => localDate(r.created_at));
  const snaps = (await d.prepare('select month, payload, taken_at from monthly_snapshots order by month').all<{ month: string; payload: string; taken_at: string }>()).results
    .map((s) => ({ month: s.month, payload: JSON.parse(s.payload), taken_at: s.taken_at }));
  return { generated_at: new Date().toISOString(), row_counts: counts, days: [...new Set([...gscDays, ...evDays])].sort(), monthly_snapshots: snaps };
}
