'use client';
import { supabase } from './supabase';

// Anonymous calculation telemetry — the "Speedtest" data asset.
// Records WHAT Canadians are calculating (mode, province, income BRACKET, lang),
// never WHO: no exact amounts, no user id, no IP, no fingerprint. The table is
// write-only for the public key (RLS: insert allowed, select denied).

export type CalcMode = 'simple' | 'annual' | 'timesheet';

// Work-schedule PATTERN only — hour-of-day buckets, days per week, break
// length. Never specific calendar dates (a list of exact shift dates could
// identify someone; the pattern is all the analysis needs).
export interface WorkPattern {
  shiftStartHour: number; // 0-23
  shiftEndHour: number; // 0-23
  unpaidBreakMin: number; // minutes, typical shift
  daysPerWeek: number; // 1-7
  worksWeekend: boolean;
  avgDailyHours: number; // paid hours per active day
}

export function bracketIncome(annual: number): string {
  if (annual < 30_000) return 'under-30k';
  if (annual < 50_000) return '30-50k';
  if (annual < 70_000) return '50-70k';
  if (annual < 90_000) return '70-90k';
  if (annual < 120_000) return '90-120k';
  if (annual < 160_000) return '120-160k';
  return '160k-plus';
}

const sentThisPageLoad = new Set<string>();
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// Anonymous per-page-load session: a random UUID minted in the browser, kept
// in memory only (gone on close, never reused across visits, no fingerprint).
// Lets analysis tell "2 people" apart from "1 person comparing 2 provinces",
// and surfaces comparison pairs (relocation intent). seq = order in session.
let sessionId: string | null = null;
let seqCounter = 0;
function getSessionId(): string {
  if (!sessionId) {
    sessionId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
  return sessionId;
}

// Coarse device class only — never the raw user-agent string (fingerprint risk).
function detectDevice(): 'mobile' | 'tablet' | 'desktop' {
  try {
    const ua = navigator.userAgent;
    if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) {
      return 'tablet';
    }
    if (/Mobi|iPhone|Android.*Mobile/i.test(ua)) return 'mobile';
    return 'desktop';
  } catch {
    return 'desktop';
  }
}

// Coarse geo (country / region / city), resolved once per page load from our
// own /api/geo endpoint (Vercel edge headers). IP is never stored — see route.
type Geo = {
  country: string | null;
  region: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
};
const EMPTY_GEO: Geo = { country: null, region: null, city: null, lat: null, lon: null };
let geoPromise: Promise<Geo> | null = null;
function getGeo() {
  if (!geoPromise) {
    geoPromise = fetch('/api/geo', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : EMPTY_GEO))
      .catch(() => EMPTY_GEO);
  }
  return geoPromise;
}

/**
 * Debounced + deduped, fire-and-forget. Call on every recalculation; it only
 * writes after the inputs have been stable for 3s, and only once per distinct
 * (mode, province, bracket, lang) per page load — so live typing produces a
 * single event, not a keystroke stream.
 */
export function recordCalcEvent(e: {
  mode: CalcMode;
  province: string;
  annualIncome: number;
  lang: string;
  source?: 'web' | 'widget';
  embedHost?: string | null;
  industry?: string | null;
  work?: WorkPattern | null;
}) {
  if (!e.annualIncome || e.annualIncome <= 0 || !e.province) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const bracket = bracketIncome(e.annualIncome);
    const lang = e.lang === 'zh' || e.lang === 'fr' ? e.lang : 'en';
    const source = e.source ?? 'web';
    const w = e.work ?? null;
    const workKey = w
      ? `${w.shiftStartHour}-${w.shiftEndHour}-${w.unpaidBreakMin}-${w.daysPerWeek}`
      : '';
    const key = `${source}|${e.mode}|${e.province}|${bracket}|${lang}|${e.industry ?? ''}|${workKey}`;
    if (sentThisPageLoad.has(key)) return;
    sentThisPageLoad.add(key);

    const geo = await getGeo();
    seqCounter += 1;
    supabase
      .from('anon_calc_events')
      .insert({
        mode: e.mode,
        province: e.province,
        income_bracket: bracket,
        lang,
        source,
        embed_host: e.embedHost ?? null,
        country: geo.country,
        region: geo.region,
        city: geo.city,
        lat: geo.lat,
        lon: geo.lon,
        device: detectDevice(),
        industry: e.industry ?? null,
        shift_start_hour: w?.shiftStartHour ?? null,
        shift_end_hour: w?.shiftEndHour ?? null,
        unpaid_break_min: w?.unpaidBreakMin ?? null,
        days_per_week: w?.daysPerWeek ?? null,
        works_weekend: w?.worksWeekend ?? null,
        avg_daily_hours: w?.avgDailyHours ?? null,
        session_id: getSessionId(),
        seq: seqCounter,
      })
      .then(({ error }) => {
        // Telemetry must never affect the user experience — swallow errors.
        if (error) console.debug('telemetry skipped:', error.message);
      });
  }, 3000);
}
