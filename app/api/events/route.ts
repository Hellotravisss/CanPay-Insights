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
  'change_direction', 'change_pct_bucket', 'days_since_saved_bucket', 'province_changed',
  'median_ratio_bucket', 'median_wage_ref', 'schema_version',
] as const;

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

  let cf: Record<string, unknown> = {};
  try { cf = ((await getCloudflareContext({ async: true })).cf ?? {}) as Record<string, unknown>; } catch { /* local dev */ }
  const geo = {
    country: (cf.country as string) ?? request.headers.get('cf-ipcountry') ?? null,
    region: (cf.regionCode as string) ?? (cf.region as string) ?? null,
    city: (cf.city as string) ?? null,
    lat: cf.latitude ? parseFloat(String(cf.latitude)) || null : null,
    lon: cf.longitude ? parseFloat(String(cf.longitude)) || null : null,
  };

  const cols = [...COLS, 'country', 'region', 'city', 'lat', 'lon', 'created_at'];
  const vals = [...COLS.map((c) => norm(body[c])), geo.country, geo.region, geo.city, geo.lat, geo.lon, new Date().toISOString()];
  const d = await db();
  await d.prepare(`insert into events (${cols.join(',')}) values (${cols.map(() => '?').join(',')})`).bind(...vals).run();
  return NextResponse.json({ ok: true }, { headers: { 'cache-control': 'no-store' } });
}
