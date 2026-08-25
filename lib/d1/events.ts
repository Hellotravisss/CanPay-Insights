import type { D1 } from './db';

/**
 * The analysis layer, ported from the Supabase SQL functions (calc_*,
 * public_usage_dataset, build_monthly_snapshot) to TypeScript over D1.
 *
 * Why not port the SQL itself: the originals lean on percentile_cont,
 * date_trunc in a named time zone, json_object_agg and array_position —
 * none of which SQLite has. Re-expressing them in SQLite would be a second
 * chance to get every one subtly wrong. The dataset is small (one thousand
 * events, tens of thousands of Search Console rows), so the events are
 * loaded once per request and the aggregates computed here, with the same
 * output keys and bucket orders as before so the dashboard did not change.
 *
 * Parity with the Supabase output was checked field by field at migration.
 */

export type Ev = Record<string, string | number | null>;

const TZ = 'America/Vancouver';
const BRACKETS = ['under-30k', '30-50k', '50-70k', '70-90k', '90-120k', '120-160k', '160k-plus'];
const BRACKET_LABELS = ['Under $30k', '$30–50k', '$50–70k', '$70–90k', '$90–120k', '$120–160k', '$160k+'];

// ── helpers ───────────────────────────────────────────────────────────────
const fmtDate = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
/** ISO timestamp → YYYY-MM-DD in Vancouver (Postgres: created_at at time zone 'America/Vancouver')::date */
export function localDate(iso: string): string {
  return fmtDate.format(new Date(iso)); // en-CA yields YYYY-MM-DD
}
export function today(): string {
  return fmtDate.format(new Date());
}
function addDays(d: string, n: number): string {
  const t = new Date(`${d}T00:00:00Z`); t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}
function dow(d: string): number { return new Date(`${d}T00:00:00Z`).getUTCDay(); }
/** Postgres date_trunc('week') = Monday. */
function weekStart(d: string): string { const w = dow(d); return addDays(d, -((w + 6) % 7)); }
function monthStart(d: string): string { return d.slice(0, 7) + '-01'; }
function addMonths(d: string, n: number): string {
  const t = new Date(`${d}T00:00:00Z`); t.setUTCMonth(t.getUTCMonth() + n); return t.toISOString().slice(0, 10);
}
const round1 = (x: number) => Math.round(x * 10) / 10;
const pct1 = (num: number, den: number) => (den ? round1((100 * num) / den) : null);
const truthy = (v: unknown) => v === 1 || v === true;

/** percentile_cont: linear interpolation between order statistics. */
export function percentile(values: number[], p: number): number | null {
  const v = values.filter((x) => x !== null && x !== undefined && Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const pos = (v.length - 1) * p, lo = Math.floor(pos), frac = pos - lo;
  return lo + 1 < v.length ? v[lo] + frac * (v[lo + 1] - v[lo]) : v[lo];
}
type Row = { k: string | number; n: number };
function countBy(rows: Ev[], key: string, opts: { order?: string[]; limit?: number; nonNull?: boolean; desc?: boolean } = {}): Row[] {
  const m = new Map<string | number, number>();
  for (const r of rows) {
    const v = r[key];
    if (v === null || v === undefined) { if (opts.nonNull !== false) continue; }
    m.set(v as string | number, (m.get(v as string | number) ?? 0) + 1);
  }
  let out = [...m.entries()].map(([k, n]) => ({ k, n }));
  if (opts.order) {
    const pos = (k: string | number) => { const i = opts.order!.indexOf(String(k)); return i === -1 ? 1e9 : i; };
    out.sort((a, b) => pos(a.k) - pos(b.k));
  } else if (opts.desc !== false) out.sort((a, b) => b.n - a.n || String(a.k).localeCompare(String(b.k)));
  else out.sort((a, b) => Number(a.k) - Number(b.k));
  if (opts.limit) out = out.slice(0, opts.limit);
  return out;
}
function distinct(rows: Ev[], key: string): number {
  return new Set(rows.map((r) => r[key]).filter((v) => v !== null && v !== undefined)).size;
}
function sessionsComparing(rows: Ev[]): number {
  const m = new Map<string, Set<string>>();
  for (const r of rows) if (r.session_id) {
    const s = m.get(r.session_id as string) ?? new Set(); s.add(r.province as string); m.set(r.session_id as string, s);
  }
  return [...m.values()].filter((s) => s.size > 1).length;
}

// ── loaders ───────────────────────────────────────────────────────────────
export async function loadEvents(d: D1, includeExcluded = false): Promise<Ev[]> {
  const sql = includeExcluded ? 'select * from events' : 'select * from events where excluded is not 1';
  return (await d.prepare(sql).all<Ev>()).results;
}

// ── calc_stats ────────────────────────────────────────────────────────────
export function calcStats(all: Ev[], excludedCount: number) {
  const ev = all;
  const work = ev.filter((r) => r.unpaid_break_min !== null);
  const rrsp = ev.filter((r) => r.has_rrsp !== null);
  const prem = ev.filter((r) => r.shift_premium !== null);
  const viewed = ev.filter((r) => r.viewed_report !== null);
  const nowMs = Date.now();
  const thirty = addDays(today(), -30);
  const daily = new Map<string, number>();
  for (const r of ev) { const d = localDate(r.created_at as string); if (d > thirty) daily.set(d, (daily.get(d) ?? 0) + 1); }
  const cities = new Map<string, { lat: number[]; lon: number[]; n: number }>();
  for (const r of ev) if (r.city && r.lat !== null && r.lon !== null) {
    const c = cities.get(r.city as string) ?? { lat: [], lon: [], n: 0 };
    c.lat.push(r.lat as number); c.lon.push(r.lon as number); c.n++; cities.set(r.city as string, c);
  }
  const perSession = new Map<string, number>();
  for (const r of ev) if (r.session_id) perSession.set(r.session_id as string, (perSession.get(r.session_id as string) ?? 0) + 1);
  return {
    total: ev.length,
    sessions: distinct(ev, 'session_id'),
    first_event: ev.length ? ev.reduce((a, r) => (r.created_at! < a ? (r.created_at as string) : a), ev[0].created_at as string) : null,
    last_event: ev.length ? ev.reduce((a, r) => (r.created_at! > a ? (r.created_at as string) : a), ev[0].created_at as string) : null,
    last_7d: ev.filter((r) => nowMs - new Date(r.created_at as string).getTime() < 7 * 864e5).length,
    geo_known: ev.filter((r) => r.country).length,
    excluded_rows: excludedCount,
    by_province: countBy(ev, 'province'),
    by_bracket: countBy(ev, 'income_bracket', { order: BRACKETS }),
    by_lang: countBy(ev, 'lang'),
    by_country: countBy(ev, 'country', { limit: 15 }),
    by_city: countBy(ev, 'city', { limit: 15 }),
    cities_geo: [...cities.entries()].map(([city, c]) => ({
      city, lat: Math.round((c.lat.reduce((a, b) => a + b, 0) / c.n) * 1000) / 1000,
      lon: Math.round((c.lon.reduce((a, b) => a + b, 0) / c.n) * 1000) / 1000, n: c.n,
    })).sort((a, b) => b.n - a.n).slice(0, 40),
    by_device: countBy(ev, 'device'),
    by_mode: countBy(ev, 'mode'),
    by_source: countBy(ev, 'source'),
    by_industry: countBy(ev, 'industry'),
    by_hour: countBy(ev, 'local_hour', { desc: false }),
    by_dow: countBy(ev, 'local_dow', { desc: false }),
    by_daily: [...daily.entries()].sort().map(([k, n]) => ({ k, n })),
    work: {
      n: work.length,
      unpaid_break_share: pct1(work.filter((r) => (r.unpaid_break_min as number) > 0).length, work.length),
      median_break: percentile(work.map((r) => r.unpaid_break_min as number), 0.5),
      weekend_share: pct1(work.filter((r) => truthy(r.works_weekend)).length, work.length),
      median_daily_hours: percentile(work.map((r) => r.avg_daily_hours as number), 0.5),
      median_days_week: percentile(work.map((r) => r.days_per_week as number), 0.5),
    },
    comparison_sessions: sessionsComparing(ev),
    rrsp: {
      n: rrsp.length,
      has_rrsp_share: pct1(rrsp.filter((r) => truthy(r.has_rrsp)).length, rrsp.length),
      employer_match_share: pct1(rrsp.filter((r) => truthy(r.employer_match)).length, rrsp.length),
    },
    by_rrsp_pct: countBy(ev, 'rrsp_pct_bucket', { order: ['0', '1-5', '5-10', '10-15', '15-plus'] }),
    by_ot: countBy(ev, 'ot_hours_bucket', { order: ['0', 'under-5', '5-10', '10-plus'] }),
    premium: { n: prem.length, share: pct1(prem.filter((r) => truthy(r.shift_premium)).length, prem.length) },
    by_premium_rate: countBy(ev, 'premium_rate_bucket', { order: ['under-2', '2-4', '4-6', '6-plus'] }),
    by_tips: countBy(ev, 'tips_pct_bucket', { order: ['0', '1-10', '10-20', '20-30', '30-plus'] }),
    by_pay_freq: countBy(ev, 'pay_frequency'),
    engagement: {
      report_share: pct1(viewed.filter((r) => truthy(r.viewed_report)).length, viewed.length),
      median_calcs_per_session: percentile([...perSession.values()], 0.5),
    },
  };
}

// ── calc_stats_extra ──────────────────────────────────────────────────────
export function calcStatsExtra(ev: Ev[]) {
  const reg = ev.filter((r) => r.is_registered !== null);
  return {
    by_median: countBy(ev, 'median_ratio_bucket', { order: ['under-0.5', '0.5-0.75', '0.75-1', '1-1.25', '1.25-1.5', '1.5-2', '2-3', '3-plus'] }),
    by_shape: countBy(ev, 'employment_shape'),
    by_expectation: countBy(ev, 'expectation', { order: ['lower', 'as-expected', 'higher'] }),
    by_paychange: countBy(ev, 'change_direction'),
    by_intent: countBy(ev, 'intent'),
    by_shift_start: countBy(ev, 'shift_start_hour', { desc: false }),
    by_entry: countBy(ev, 'entry_path', { limit: 12 }),
    by_browser: countBy(ev, 'browser'),
    by_work_arrangement: countBy(ev, 'work_arrangement', { order: ['onsite', 'remote', 'hybrid'] }),
    by_age: countBy(ev, 'age_band', { order: ['under-25', '25-34', '35-44', '45-54', '55-64', '65-plus'] }),
    registered: { n: reg.length, share: pct1(reg.filter((r) => truthy(r.is_registered)).length, reg.length) },
  };
}

// ── calc_industry_income ──────────────────────────────────────────────────
export function calcIndustryIncome(ev: Ev[]) {
  const m = new Map<string, { n: number; brackets: Record<string, number> }>();
  for (const r of ev) if (r.industry) {
    const x = m.get(r.industry as string) ?? { n: 0, brackets: {} };
    x.n++; x.brackets[r.income_bracket as string] = (x.brackets[r.income_bracket as string] ?? 0) + 1;
    m.set(r.industry as string, x);
  }
  return [...m.entries()].map(([industry, x]) => ({ industry, ...x })).sort((a, b) => b.n - a.n || a.industry.localeCompare(b.industry));
}

// ── calc_fake_doors ───────────────────────────────────────────────────────
export function calcFakeDoors(ev: Ev[], waitlist: { k: string; n: number }[]) {
  const bySession = new Map<string, Set<string>>();
  for (const r of ev) if (r.product_interest && r.session_id) {
    const s = bySession.get(r.product_interest as string) ?? new Set(); s.add(r.session_id as string); bySession.set(r.product_interest as string, s);
  }
  const comparers = new Set<string>();
  const provBySession = new Map<string, Set<string>>();
  for (const r of ev) if (r.session_id) { const s = provBySession.get(r.session_id as string) ?? new Set(); s.add(r.province as string); provBySession.set(r.session_id as string, s); }
  for (const [sid, s] of provBySession) if (s.size > 1) comparers.add(sid);
  const reloc = bySession.get('relocation') ?? new Set();
  return {
    visits: distinct(ev, 'session_id'),
    clicks: [...bySession.entries()].map(([k, s]) => ({ k, n: s.size })).sort((a, b) => b.n - a.n),
    waitlist,
    relocation_click_among_comparers: [...reloc].filter((sid) => comparers.has(sid)).length,
  };
}

// ── calc_accounts ─────────────────────────────────────────────────────────
export function calcAccounts(ev: Ev[]) {
  const hist = ev.filter((r) => truthy(r.from_history));
  const same = hist.filter((r) => !truthy(r.province_changed));
  return {
    known: ev.filter((r) => r.is_registered !== null).length,
    registered: ev.filter((r) => truthy(r.is_registered)).length,
    anonymous: ev.filter((r) => r.is_registered === 0).length,
    from_history: hist.length,
    pay_changes: {
      n: same.length,
      up: same.filter((r) => r.change_direction === 'up').length,
      down: same.filter((r) => r.change_direction === 'down').length,
      same: same.filter((r) => r.change_direction === 'same').length,
    },
    by_change_size: countBy(same.filter((r) => r.change_direction === 'up'), 'change_pct_bucket', { order: ['0', 'under-3', '3-5', '5-10', '10-20', '20-plus'], nonNull: false }),
    by_elapsed: countBy(hist, 'days_since_saved_bucket', { order: ['same-day', 'under-week', '1-4-weeks', '1-3-months', '3-6-months', '6-12-months', 'over-year'] }),
    raise_vs_jobhop: (() => {
      const m = new Map<string, { n: number; up: number }>();
      for (const r of hist) if (r.intent === 'raise' || r.intent === 'new-job') {
        const x = m.get(r.intent as string) ?? { n: 0, up: 0 }; x.n++; if (r.change_direction === 'up') x.up++; m.set(r.intent as string, x);
      }
      return [...m.entries()].map(([k, x]) => ({ k, ...x }));
    })(),
  };
}

// ── calc_journeys ─────────────────────────────────────────────────────────
export function calcJourneys(ev: Ev[]) {
  const s = new Map<string, { n: number; prov: Set<string>; br: Set<string>; rr: Set<string>; ot: Set<string>; seq: { t: string; rank: number }[] }>();
  for (const r of ev) if (r.session_id) {
    const x = s.get(r.session_id as string) ?? { n: 0, prov: new Set(), br: new Set(), rr: new Set(), ot: new Set(), seq: [] };
    x.n++; x.prov.add(r.province as string); x.br.add(r.income_bracket as string);
    x.rr.add((r.rrsp_pct_bucket as string) ?? '-'); x.ot.add((r.ot_hours_bucket as string) ?? '-');
    x.seq.push({ t: r.created_at as string, rank: BRACKETS.indexOf(r.income_bracket as string) + 1 });
    s.set(r.session_id as string, x);
  }
  const v = [...s.values()];
  let up = 0, down = 0, same = 0;
  for (const x of v) {
    const seq = [...x.seq].sort((a, b) => a.t.localeCompare(b.t));
    for (let i = 1; i < seq.length; i++) { if (seq[i].rank > seq[i - 1].rank) up++; else if (seq[i].rank < seq[i - 1].rank) down++; else same++; }
  }
  const multi = v.filter((x) => x.n > 1);
  return {
    sessions: v.length,
    multi: multi.length,
    depth: { one: v.filter((x) => x.n === 1).length, two_four: v.filter((x) => x.n >= 2 && x.n <= 4).length, five_plus: v.filter((x) => x.n >= 5).length, max: v.length ? Math.max(...v.map((x) => x.n)) : null },
    varied: {
      income: multi.filter((x) => x.br.size > 1).length,
      overtime: multi.filter((x) => x.ot.size > 1).length,
      rrsp: multi.filter((x) => x.rr.size > 1).length,
      province: multi.filter((x) => x.prov.size > 1).length,
      nothing: multi.filter((x) => x.prov.size === 1 && x.br.size === 1 && x.rr.size === 1 && x.ot.size === 1).length,
    },
    income_moves: { up, down, same },
  };
}

// ── calc_series ───────────────────────────────────────────────────────────
export function calcSeries(ev: Ev[]) {
  const days = ev.map((r) => ({ d: localDate(r.created_at as string), s: r.session_id as string | null }));
  const t = today();
  const minD = days.length ? days.reduce((a, x) => (x.d < a ? x.d : a), days[0].d) : t;
  const agg = (keyOf: (d: string) => string, from: string, step: (d: string) => string, fmt: (d: string) => string) => {
    const out: { k: string; n: number; v: number }[] = [];
    for (let d = from; d <= keyOf(t); d = step(d)) {
      const k = keyOf(d);
      const rows = days.filter((x) => keyOf(x.d) === k);
      out.push({ k: fmt(k), n: rows.length, v: new Set(rows.map((x) => x.s).filter(Boolean)).size });
    }
    return out;
  };
  const cnt = (from: string, to?: string) => days.filter((x) => x.d >= from && (!to || x.d < to)).length;
  const wk = weekStart(t), mo = monthStart(t);
  const best = (() => { const m = new Map<string, number>(); for (const x of days) m.set(x.d, (m.get(x.d) ?? 0) + 1); const e = [...m.entries()].sort((a, b) => b[1] - a[1] || b[0].localeCompare(a[0]))[0]; return e ? { k: e[0], n: e[1] } : null; })();
  return {
    daily: agg((d) => d, minD > addDays(t, -59) ? minD : addDays(t, -59), (d) => addDays(d, 1), (d) => d),
    weekly: agg(weekStart, weekStart(minD > addDays(t, -17 * 7) ? minD : addDays(t, -17 * 7)), (d) => addDays(d, 7), (d) => d),
    monthly: agg(monthStart, monthStart(minD > addMonths(t, -11) ? minD : addMonths(t, -11)), (d) => addMonths(d, 1), (d) => d.slice(0, 7)),
    today: cnt(t, addDays(t, 1)),
    yesterday: cnt(addDays(t, -1), t),
    this_week: cnt(wk),
    last_week: cnt(addDays(wk, -7), wk),
    this_month: cnt(mo),
    last_month: cnt(addMonths(mo, -1), mo),
    best_day: best,
  };
}

// ── calc_candles ──────────────────────────────────────────────────────────
export function calcCandles(ev: Ev[]) {
  const from = addDays(today(), -59);
  const byDay = new Map<string, number[]>();
  for (const r of ev) {
    const lvl = BRACKETS.indexOf(r.income_bracket as string) + 1; if (!lvl) continue;
    const d = localDate(r.created_at as string); if (d < from) continue;
    byDay.set(d, [...(byDay.get(d) ?? []), lvl]);
  }
  let prev: number | null = null;
  const candles = [...byDay.entries()].sort().map(([d, l]) => {
    const med = percentile(l, 0.5)!;
    const dir = prev === null ? 'flat' : med > prev ? 'up' : med < prev ? 'down' : 'flat';
    prev = med;
    return { d, n: l.length, lo: Math.min(...l), hi: Math.max(...l), q1: percentile(l, 0.25), q3: percentile(l, 0.75), med, dir };
  });
  return { levels: BRACKETS.map((b, i) => ({ lvl: i + 1, label: BRACKET_LABELS[i] })), candles };
}

// ── calc_crosstab ─────────────────────────────────────────────────────────
export function calcCrosstab(ev: Ev[]) {
  const rows = ev.filter((r) => r.province).map((r) => ({ p: r.province as string, i: r.industry as string | null, lvl: BRACKETS.indexOf(r.income_bracket as string) + 1 })).filter((r) => r.lvl);
  const group = (key: 'p' | 'i') => {
    const m = new Map<string, number[]>();
    for (const r of rows) { const k = r[key]; if (k === null) continue; m.set(k, [...(m.get(k) ?? []), r.lvl]); }
    return [...m.entries()].map(([k, l]) => {
      const cells: Record<string, number> = {}; for (const v of l) cells[v] = (cells[v] ?? 0) + 1;
      return { k, total: l.length, med: percentile(l, 0.5), cells };
    }).sort((a, b) => b.total - a.total);
  };
  return { levels: BRACKETS.map((b, i) => ({ lvl: i + 1, label: BRACKET_LABELS[i] })), by_province: group('p'), by_industry: group('i'), total: rows.length };
}

// ── calc_cities_geo ───────────────────────────────────────────────────────
export function calcCitiesGeo(ev: Ev[]) {
  const named = new Map<string, { lat: number[]; lon: number[] }>();
  const unnamed = new Map<string, { city: string; country: string; lat: number[]; lon: number[] }>();
  for (const r of ev) {
    if (r.lat === null || r.lon === null) continue;
    if (r.city) { const c = named.get(r.city as string) ?? { lat: [], lon: [] }; c.lat.push(r.lat as number); c.lon.push(r.lon as number); named.set(r.city as string, c); }
    else {
      const key = `${r.country ?? '?'}|${Math.round((r.lat as number) * 10) / 10}|${Math.round((r.lon as number) * 10) / 10}`;
      const c = unnamed.get(key) ?? { city: (r.country as string) ?? '?', country: (r.country as string) ?? '?', lat: [], lon: [] }; c.lat.push(r.lat as number); c.lon.push(r.lon as number); unnamed.set(key, c);
    }
  }
  const avg = (a: number[]) => Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 1000) / 1000;
  const out = [
    ...[...named.entries()].map(([city, c]) => ({ city, lat: avg(c.lat), lon: avg(c.lon), n: c.lat.length, intl: !inCanada(c.lat[0], c.lon[0]) })),
    ...[...unnamed.values()].map((c) => ({ city: c.city, lat: avg(c.lat), lon: avg(c.lon), n: c.lat.length, intl: c.country !== 'CA' })),
  ];
  // Keep EVERY point outside Canada, then fill the rest with the busiest
  // Canadian ones. A plain top-60 sorted the globe by volume, so as Canadian
  // cities accumulated they pushed the rare foreign visits off the map:
  // Hong Kong (3 visits) fell out at the n=3 cutoff and looked like lost data.
  // Reach is the point of this globe — one visit from Hong Kong says more than
  // the sixtieth Canadian suburb.
  const intl = out.filter((p) => p.intl).sort((a, b) => b.n - a.n);
  const dom = out.filter((p) => !p.intl).sort((a, b) => b.n - a.n);
  return [...intl, ...dom.slice(0, Math.max(20, 80 - intl.length))].map(({ intl: _i, ...p }) => p);
}

/** Rough Canada bounding box — good enough to tell a domestic dot from a foreign one. */
function inCanada(lat: number, lon: number) {
  return lat >= 41.5 && lat <= 83.5 && lon >= -141.5 && lon <= -52;
}

// ── calc_provenance (events part) ─────────────────────────────────────────
export function provenanceEvents(all: Ev[]) {
  const dates = all.map((r) => (r.created_at as string).slice(0, 10));
  const sv = new Map<number, number>(); for (const r of all) sv.set(r.schema_version as number, (sv.get(r.schema_version as number) ?? 0) + 1);
  return {
    events: all.filter((r) => !truthy(r.excluded)).length,
    events_raw: all.length,
    first_event: dates.length ? dates.reduce((a, b) => (b < a ? b : a)) : null,
    last_event: dates.length ? dates.reduce((a, b) => (b > a ? b : a)) : null,
    schema_versions: [...sv.entries()].sort((a, b) => a[0] - b[0]).map(([v, n]) => ({ v, n })),
    excluded: all.filter((r) => truthy(r.excluded)).length,
  };
}

// ── content_stats (events part: entries) ──────────────────────────────────
export function blogEntries(ev: Ev[]) {
  const m = new Map<string, { calcs: number; visits: Set<string> }>();
  let started: string | null = null;
  for (const r of ev) {
    if (r.entry_path) { const d = (r.created_at as string).slice(0, 10); if (!started || d < started) started = d; }
    if (typeof r.entry_path === 'string' && r.entry_path.startsWith('/blog/')) {
      const x = m.get(r.entry_path) ?? { calcs: 0, visits: new Set() }; x.calcs++; if (r.session_id) x.visits.add(r.session_id as string); m.set(r.entry_path, x);
    }
  }
  return { started, entries: [...m.entries()].map(([path, x]) => ({ path, calcs: x.calcs, visits: x.visits.size })) };
}

// ── public_usage_dataset ──────────────────────────────────────────────────
export function publicDataset(ev: Ev[]) {
  const min_cell = 5, min_city = 20, min_month = 100;
  const dates = ev.map((r) => localDate(r.created_at as string));
  const months = new Map<string, number>(); for (const d of dates) months.set(d.slice(0, 7), (months.get(d.slice(0, 7)) ?? 0) + 1);
  const dim = (name: string, key: string) => {
    const rows = countBy(ev, key);
    const shown: Record<string, number> = {}; let wc = 0, wn = 0;
    for (const r of rows) { if (r.n >= min_cell) shown[String(r.k)] = r.n; else { wc++; wn += r.n; } }
    return [name, { shown, withheld_categories: wc, withheld_calculations: wn }] as const;
  };
  const dims = Object.fromEntries([
    dim('province', 'province'), dim('income_bracket', 'income_bracket'), dim('device', 'device'), dim('language', 'lang'),
    dim('calculator', 'mode'), dim('country', 'country'), dim('employment_shape', 'employment_shape'), dim('expectation', 'expectation'),
    dim('weekday', 'local_dow'), dim('local_hour', 'local_hour'),
  ]);
  const cityRows = countBy(ev, 'city');
  const cities: Record<string, number> = {}; let wcC = 0, wnC = 0;
  for (const r of cityRows) { if (r.n >= min_city) cities[String(r.k)] = r.n; else { wcC++; wnC += r.n; } }
  const t = today();
  return {
    name: 'CanPay Insights — What Canadians check about their pay',
    publisher: 'CanPay Insights, Vancouver, Canada',
    url: 'https://canpayinsights.ca/data',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    license_name: 'CC BY 4.0',
    cite_as: `CanPay Insights, "What Canadians check about their pay" (open dataset), ${t}. CC BY 4.0. https://canpayinsights.ca/data`,
    generated: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
    schema_version: 1,
    what_this_counts: {
      unit: 'One completed calculation — somebody entering a wage and receiving an answer.',
      not_page_views: 'This is NOT web analytics. Page analytics counts everyone who loads a page, most of whom never calculate. The two will never agree and are not meant to.',
      self_selected: 'These are people who went looking for a take-home pay calculator. They are NOT a random sample of Canadians and must never be described as one. Compared with Statistics Canada wage medians the group skews toward lower brackets and toward mobile devices.',
      income_is_a_range: 'Exact incomes are never collected. A calculation is recorded only as one of seven brackets, so no figure here can be traced to an amount anyone typed.',
      excluded: 'Owner traffic, testing, and detected bots are marked and excluded from every count.',
    },
    privacy: {
      no_ip: 'IP addresses are never stored. Country, region and city come from an edge lookup at request time and only the coarse result is kept.',
      no_identity: 'No accounts, names or device fingerprints are attached to any row.',
      city_is_a_centroid: 'Where a city appears it is the centre point of that city, never a position.',
      suppression: 'Cells below the thresholds below are withheld entirely rather than shown small.',
    },
    suppression: {
      min_cell, min_city, min_month_for_final: min_month,
      rule: `Any category with fewer than ${min_cell} calculations is withheld. Cities need ${min_city} because a small town is identifying in a way a province is not. Months under ${min_month} calculations are marked provisional — published, but too thin to quote.`,
    },
    totals: { calculations: ev.length, first_day: dates.length ? dates.reduce((a, b) => (b < a ? b : a)) : null, last_day: dates.length ? dates.reduce((a, b) => (b > a ? b : a)) : null },
    monthly: [...months.entries()].sort().map(([month, n]) => ({ month, calculations: n, provisional: n < min_month })),
    breakdowns: dims,
    cities: { shown: cities, withheld_cities: wcC, withheld_calculations: wnC },
    field_notes: {
      employment_shape: 'Inferred from the calculator used, hours entered, declared tips and shift premium — never asked. Part-time follows the Statistics Canada definition of under 30 hours.',
      expectation: 'Self-reported in one tap directly under the result: lower, higher, or about what the person expected. Optional, so the answered share is far below the calculation count.',
      income_bracket: 'The bracket the gross annual figure falls into, including any overtime and premiums the person entered.',
      weekday: '0 = Sunday. Local to the reader, not UTC.',
      local_hour: "0-23 in the reader's own clock — this is what makes payday-cycle analysis possible.",
    },
  };
}

// ── build_monthly_snapshot ────────────────────────────────────────────────
export function monthlySnapshot(ev: Ev[], month: string /* YYYY-MM */) {
  const rows = ev.filter((r) => localDate(r.created_at as string).startsWith(month));
  const obj = (key: string, min = 0) => Object.fromEntries(countBy(rows, key).filter((r) => r.n >= min).map((r) => [String(r.k), r.n]));
  const work = rows.filter((r) => r.unpaid_break_min !== null);
  const rrsp = rows.filter((r) => r.has_rrsp !== null);
  return {
    month, schema_version: 1, methodology: 'docs/telemetry-methodology.md',
    events: rows.length, visits: distinct(rows, 'session_id'),
    by_province: obj('province'), by_bracket: obj('income_bracket'), by_median_ratio: obj('median_ratio_bucket'),
    by_lang: obj('lang'), by_country: obj('country'), by_city: obj('city', 3), by_device: obj('device'),
    by_source: obj('source'), by_mode: obj('mode'), by_industry: obj('industry'), by_intent: obj('intent'),
    by_hour: obj('local_hour'), by_dow: obj('local_dow'),
    work: {
      n: work.length,
      unpaid_break_share: pct1(work.filter((r) => (r.unpaid_break_min as number) > 0).length, work.length),
      median_break: percentile(work.map((r) => r.unpaid_break_min as number), 0.5),
      weekend_share: pct1(work.filter((r) => truthy(r.works_weekend)).length, work.length),
      median_daily_hours: percentile(work.map((r) => r.avg_daily_hours as number), 0.5),
    },
    rrsp: { n: rrsp.length, has_rrsp_share: pct1(rrsp.filter((r) => truthy(r.has_rrsp)).length, rrsp.length) },
    comparison_sessions: sessionsComparing(rows),
  };
}
