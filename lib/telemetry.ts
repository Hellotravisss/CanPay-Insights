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
// Savings / premium-pay / tips behaviour. All bucketed, all derived from what
// the user already typed into the calculator — no extra questions asked.
export interface BehaviourSignals {
  hasRrsp: boolean;
  rrspPctBucket: '0' | '1-5' | '5-10' | '10-15' | '15-plus';
  employerMatch: boolean;
  shiftPremium: boolean;
  premiumRateBucket: 'under-2' | '2-4' | '4-6' | '6-plus' | null;
  otHoursBucket: '0' | 'under-5' | '5-10' | '10-plus';
  tipsPctBucket: '0' | '1-10' | '10-20' | '20-30' | '30-plus' | null;
  payFrequency: string | null;
}

export function bucketRrspPct(pct: number): BehaviourSignals['rrspPctBucket'] {
  if (pct <= 0) return '0';
  if (pct < 5) return '1-5';
  if (pct < 10) return '5-10';
  if (pct < 15) return '10-15';
  return '15-plus';
}

export function bucketPremiumRate(rate: number): BehaviourSignals['premiumRateBucket'] {
  if (rate <= 0) return null;
  if (rate < 2) return 'under-2';
  if (rate < 4) return '2-4';
  if (rate < 6) return '4-6';
  return '6-plus';
}

export function bucketOtHours(hours: number): BehaviourSignals['otHoursBucket'] {
  if (hours <= 0) return '0';
  if (hours < 5) return 'under-5';
  if (hours < 10) return '5-10';
  return '10-plus';
}

export function bucketTipsPct(pct: number): BehaviourSignals['tipsPctBucket'] {
  if (pct <= 0) return '0';
  if (pct < 10) return '1-10';
  if (pct < 20) return '10-20';
  if (pct < 30) return '20-30';
  return '30-plus';
}

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

// Bot guard. Crawlers mostly can't reach here anyway (events only fire after a
// user edits an input), but headless/automation traffic would otherwise count
// as real people and poison a dataset whose whole value is being trustworthy.
const BOT_UA =
  /bot|crawl|spider|slurp|bingpreview|headless|phantom|puppeteer|playwright|selenium|lighthouse|pagespeed|gtmetrix|pingdom|uptime|curl|wget|python-requests|axios|node-fetch|scrapy|semrush|ahrefs|mj12|dotbot|petalbot|yandex|baiduspider|gptbot|claudebot|ccbot|perplexity|applebot|facebookexternalhit|preview/i;

function isLikelyBot(): boolean {
  try {
    const nav = navigator as Navigator & { webdriver?: boolean };
    if (nav.webdriver) return true; // automation flag (Playwright/Puppeteer/Selenium)
    if (BOT_UA.test(nav.userAgent)) return true;
    // Real browsers report a plugin list, a language, and a non-zero screen.
    if (!nav.languages || nav.languages.length === 0) return true;
    if (!window.screen || window.screen.width === 0) return true;
    return false;
  } catch {
    return true; // if we can't tell, don't record
  }
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
  behaviour?: BehaviourSignals | null;
  viewedReport?: boolean;
}) {
  if (!e.annualIncome || e.annualIncome <= 0 || !e.province) return;
  if (isLikelyBot()) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const bracket = bracketIncome(e.annualIncome);
    const KNOWN_LANGS = ['en', 'zh', 'fr', 'pa', 'tl', 'hi', 'es', 'uk', 'ko', 'vi'];
    const lang = KNOWN_LANGS.includes(e.lang) ? e.lang : 'en';
    const source = e.source ?? 'web';
    const w = e.work ?? null;
    const b = e.behaviour ?? null;
    const workKey = w
      ? `${w.shiftStartHour}-${w.shiftEndHour}-${w.unpaidBreakMin}-${w.daysPerWeek}`
      : '';
    const behaviourKey = b ? `${b.rrspPctBucket}-${b.otHoursBucket}-${b.tipsPctBucket ?? ''}-${b.shiftPremium}` : '';
    const key = `${source}|${e.mode}|${e.province}|${bracket}|${lang}|${e.industry ?? ''}|${workKey}|${behaviourKey}`;
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
        has_rrsp: b?.hasRrsp ?? null,
        rrsp_pct_bucket: b?.rrspPctBucket ?? null,
        employer_match: b?.employerMatch ?? null,
        shift_premium: b?.shiftPremium ?? null,
        premium_rate_bucket: b?.premiumRateBucket ?? null,
        ot_hours_bucket: b?.otHoursBucket ?? null,
        tips_pct_bucket: b?.tipsPctBucket ?? null,
        pay_frequency: b?.payFrequency ?? null,
        viewed_report: e.viewedReport ?? false,
        session_id: getSessionId(),
        seq: seqCounter,
        // User's LOCAL clock (not UTC): powers "what hour / which weekday do
        // Canadians check their pay" and payday-cycle analysis.
        local_hour: new Date().getHours(),
        local_dow: new Date().getDay(),
      })
      .then(({ error }) => {
        // Telemetry must never affect the user experience — swallow errors.
        if (error) console.debug('telemetry skipped:', error.message);
      });
  }, 3000);
}
