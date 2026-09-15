import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { db } from '../../../lib/d1/db';

export const dynamic = 'force-dynamic';

/**
 * Anonymous calculation events → D1. Replaces the browser's direct Supabase
 * insert. Two things improve in the move:
 *   - geo is attached HERE from request.cf (country, region, city centroid),
 *     so the browser never fetches or sends a location at all;
 *   - the column list is a whitelist — a client cannot add a field the
 *     schema does not know, and anything outside the bucket vocabulary is
 *     dropped rather than stored.
 * IP is never read into a variable, let alone stored.
 */
const COLS = [
  'mode', 'province', 'income_bracket', 'lang', 'source', 'embed_host', 'device', 'browser',
  'shift_start_hour', 'shift_end_hour', 'unpaid_break_min', 'days_per_week', 'works_weekend', 'avg_daily_hours',
  'has_rrsp', 'rrsp_pct_bucket', 'employer_match', 'shift_premium', 'premium_rate_bucket', 'ot_hours_bucket',
  'tips_pct_bucket', 'pay_frequency', 'viewed_report', 'entry_path', 'referrer_path', 'local_hour', 'local_dow',
  'session_id', 'seq', 'industry', 'industry_rank', 'industry_returning', 'intent', 'expectation',
  'work_arrangement', 'age_band', 'employment_shape', 'product_interest', 'is_registered', 'from_history',
  'tenure_band', 'union_member', 'employer_size', 'vacation_band',
  'os_family', 'device_brand',
  'change_direction', 'change_pct_bucket', 'days_since_saved_bucket', 'province_changed',
  'median_ratio_bucket', 'median_wage_ref', 'schema_version',
  'fsa', 'fsa_source', 'lat2', 'lon2', 'tz', 'is_returning',
] as const;

/**
 * Neighbourhood fields are the only ones a visitor supplies about where they
 * are, so they are checked here as well as in the browser. An FSA must look
 * like one (three characters, never a full postal code); a device position is
 * kept only at two decimals and only when the visitor's source really was the
 * device; a zone name is a name, not a coordinate.
 */
const FSA_RE = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z]$/;
const FSA_SOURCES = new Set(['typed', 'device', 'remembered']);
function sanitiseNeighbourhood(body: Record<string, unknown>): void {
  const fsa = typeof body.fsa === 'string' ? body.fsa.trim().toUpperCase() : '';
  body.fsa = FSA_RE.test(fsa) ? fsa : null;
  const src = typeof body.fsa_source === 'string' && FSA_SOURCES.has(body.fsa_source) ? body.fsa_source : null;
  body.fsa_source = body.fsa || src === 'device' ? src : null;
  const two = (v: unknown, lim: number) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) && Math.abs(n) <= lim ? Math.round(n * 100) / 100 : null;
  };
  body.lat2 = body.fsa_source === 'device' ? two(body.lat2, 90) : null;
  body.lon2 = body.fsa_source === 'device' ? two(body.lon2, 180) : null;
  // Rural FSAs (second character 0) and positions that matched no FSA keep
  // one decimal (~11 km): a 1 km cell outside a city can be a single house.
  const rural = !body.fsa || (body.fsa as string)[1] === '0';
  if (rural) {
    body.lat2 = typeof body.lat2 === 'number' ? Math.round(body.lat2 * 10) / 10 : null;
    body.lon2 = typeof body.lon2 === 'number' ? Math.round(body.lon2 * 10) / 10 : null;
  }
  const tz = typeof body.tz === 'string' ? body.tz : '';
  body.tz = /^[A-Za-z_]+(\/[A-Za-z_+\-]+){0,2}$/.test(tz) ? tz.slice(0, 64) : null;
  body.is_returning = body.is_returning === 1 || body.is_returning === true ? 1 : body.is_returning === 0 || body.is_returning === false ? 0 : null;
}

function norm(v: unknown): string | number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') return v.slice(0, 200);
  return null;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }); }
  if (!body.mode || !body.province || !body.income_bracket || !body.lang) return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  sanitiseNeighbourhood(body);

  let cf: Record<string, unknown> = {};
  try { cf = ((await getCloudflareContext({ async: true })).cf ?? {}) as Record<string, unknown>; } catch { /* local dev */ }
  // One decimal place is ~11 km: enough to put a dot on a globe, not enough
  // to find a street. The edge hands us five decimals; we never keep them.
  const coarse = (v: unknown) => { const n = parseFloat(String(v)); return Number.isFinite(n) ? Math.round(n * 10) / 10 : null; };
  const geo = {
    country: (cf.country as string) ?? request.headers.get('cf-ipcountry') ?? null,
    region: (cf.regionCode as string) ?? (cf.region as string) ?? null,
    city: (cf.city as string) ?? null,
    lat: cf.latitude ? coarse(cf.latitude) : null,
    lon: cf.longitude ? coarse(cf.longitude) : null,
  };

  // The iOS app never sends schema_version; the column is NOT NULL. Binding an
  // explicit null bypasses the column default and the insert fails — which is
  // how every app calculation from 2026-08-27 to 2026-09-15 was lost without a
  // trace. An absent field takes the default; anything else is what was sent.
  const vals = COLS.map((c) => (c === 'schema_version' && body[c] == null ? 1 : norm(body[c])));
  const cols = [...COLS, 'country', 'region', 'city', 'lat', 'lon', 'created_at'];
  vals.push(geo.country, geo.region, geo.city, geo.lat, geo.lon, new Date().toISOString());
  const d = await db();
  try {
    await d.prepare(`insert into events (${cols.join(',')}) values (${cols.map(() => '?').join(',')})`).bind(...vals).run();
  } catch (e) {
    // A constraint failure is the client's problem to see, not a 500 to swallow.
    const msg = (e as Error).message ?? String(e);
    return NextResponse.json({ error: 'rejected', detail: msg.slice(0, 200) }, { status: 422, headers: { 'cache-control': 'no-store' } });
  }
  return NextResponse.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}
