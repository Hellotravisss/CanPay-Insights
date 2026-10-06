import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { db } from '../../../lib/d1/db';

export const dynamic = 'force-dynamic';

/**
 * Anonymous calculation events → D1. Replaces the browser's direct Supabase
 * insert. Two things improve in the move:
 *   - connection geo is attached HERE from request.cf (country, region, city,
 *     approximate point rounded to one decimal); the only location the
 *     browser sends is what the visitor chose to give (FSA, or a device
 *     position rounded on the device), checked again in sanitiseNeighbourhood;
 *   - the column list is a whitelist — a client cannot add a field the
 *     schema does not know, and anything outside the bucket vocabulary is
 *     dropped rather than stored.
 * IP is never read into a variable, let alone stored.
 */
const COLS = [
  'mode', 'province', 'income_bracket', 'lang', 'source', 'embed_host', 'device', 'browser',
  'shift_start_hour', 'shift_end_hour', 'unpaid_break_min', 'days_per_week', 'works_weekend', 'avg_daily_hours',
  'has_rrsp', 'rrsp_pct_bucket', 'employer_match', 'shift_premium', 'premium_rate_bucket', 'ot_hours_bucket',
  'tips_pct_bucket', 'pay_frequency',
  'union_dues_bucket', 'ltd', 'other_deductions_bucket', 'bonus_bucket', 'other_income_bucket',
  'stat_or_sick_pay', 'taxable_benefits', 'rsu_bucket', 'match_policy', 'tips_paid',
  'offer_change_bucket', 'offer_to_province', 'offer_vacation_diff', 'compared_provinces', 'viewed_report', 'entry_path', 'referrer_path', 'local_hour', 'local_dow',
  'session_id', 'seq', 'industry', 'industry_rank', 'industry_returning', 'intent', 'expectation',
  'work_arrangement', 'age_band', 'employment_shape', 'product_interest', 'is_registered', 'from_history',
  'tenure_band', 'union_member', 'employer_size', 'vacation_band',
  'os_family', 'device_brand',
  'change_direction', 'change_pct_bucket', 'days_since_saved_bucket', 'province_changed',
  'median_ratio_bucket', 'median_wage_ref', 'schema_version',
  'fsa', 'fsa_source', 'lat2', 'lon2', 'tz', 'is_returning',
  'reverse_target_bucket', 'spouse_claim', 'time_to_result_bucket', 'edits_bucket',
] as const;

/**
 * Neighbourhood fields are the only ones a visitor supplies about where they
 * are, so they are checked here as well as in the browser. An FSA must look
 * like one (three characters, never a full postal code); a device position is
 * kept only at two decimals and only when the visitor's source really was the
 * device; a zone name is a name, not a coordinate.
 */
// Same fixed labels as lib/telemetry.ts; anything else is dropped.
const PROVINCE_NAMES = ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Nova Scotia', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Northwest Territories', 'Nunavut', 'Yukon'];
const TIME_BUCKETS = new Set(['under-10s', '10-30s', '30-90s', '90s-plus']);
const EDIT_BUCKETS = new Set(['1-3', '4-10', '11-30', '31-plus']);
const REVERSE_BUCKETS = new Set(['under-2k', '2-3k', '3-4k', '4-5k', '5-6k', '6-8k', '8-10k', '10k-plus']);
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
  // A range label from a fixed list, or nothing: never a number.
  if (!REVERSE_BUCKETS.has(String(body.reverse_target_bucket))) body.reverse_target_bucket = null;
  if (!TIME_BUCKETS.has(String(body.time_to_result_bucket))) body.time_to_result_bucket = null;
  if (!EDIT_BUCKETS.has(String(body.edits_bucket))) body.edits_bucket = null;
  const only = (k: string, allowed: string[]) => { if (!allowed.includes(String(body[k]))) body[k] = null; };
  only('union_dues_bucket', ['0', 'under-1', '1-2', '2-plus']);
  only('other_deductions_bucket', ['0', 'under-2', '2-5', '5-plus']);
  for (const k of ['bonus_bucket', 'other_income_bucket', 'rsu_bucket']) only(k, ['0', 'under-10', '10-25', '25-plus']);
  only('match_policy', ['equal', 'half', 'custom', 'none']);
  only('tips_paid', ['payroll', 'direct']);
  only('offer_change_bucket', ['down-10-plus', 'down-0-10', 'up-0-5', 'up-5-10', 'up-10-20', 'up-20-plus']);
  only('offer_vacation_diff', ['more', 'same', 'fewer']);
  only('offer_to_province', PROVINCE_NAMES);
  { const parts = String(body.compared_provinces ?? '').split('|');
    body.compared_provinces = parts.length >= 2 && parts.length <= 6 && parts.every((x) => PROVINCE_NAMES.includes(x)) ? parts.join('|') : null; }
  for (const k of ['ltd', 'stat_or_sick_pay', 'taxable_benefits']) body[k] = body[k] === 1 || body[k] === 0 ? body[k] : null;
  body.spouse_claim = body.spouse_claim === 1 || body.spouse_claim === true ? 1 : body.spouse_claim === 0 || body.spouse_claim === false ? 0 : null;

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
