'use client';
import { supabase } from './supabase';
import { bracketIncome } from './brackets';

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


// Schema version for every row written by this build. Bump it — and document
// the change in docs/telemetry-methodology.md — whenever the MEANING of a
// field changes. Old rows keep their old version; they are never reinterpreted.
export const SCHEMA_VERSION = 1;

// National median full-time wage, used to express income as a ratio that stays
// comparable across decades. Nominal brackets drift with inflation; this does
// not. Sourced from Statistics Canada and refreshed with the wage data.
export const NATIONAL_MEDIAN_ANNUAL = 71_760; // $34.50/h x 2080, StatCan 2025

export function bucketMedianRatio(annual: number): string {
  const r = annual / NATIONAL_MEDIAN_ANNUAL;
  if (r < 0.5) return 'under-0.5';
  if (r < 0.75) return '0.5-0.75';
  if (r < 1) return '0.75-1';
  if (r < 1.25) return '1-1.25';
  if (r < 1.5) return '1.25-1.5';
  if (r < 2) return '1.5-2';
  if (r < 3) return '2-3';
  return '3-plus';
}


// A reopened saved calculation, compared with what was saved. Derived in the
// browser; only direction, size band and elapsed band are sent. The account id
// is never included, so these rows stay unlinkable to a person while still
// forming a genuine panel of observed pay changes.
export interface PayChange {
  fromHistory: true;
  direction: 'up' | 'down' | 'same';
  pctBucket: '0' | 'under-3' | '3-5' | '5-10' | '10-20' | '20-plus';
  daysBucket:
    | 'same-day' | 'under-week' | '1-4-weeks' | '1-3-months'
    | '3-6-months' | '6-12-months' | 'over-year';
  provinceChanged: boolean;
}

export function bucketChangePct(pct: number): PayChange['pctBucket'] {
  const a = Math.abs(pct);
  if (a < 0.5) return '0';
  if (a < 3) return 'under-3';
  if (a < 5) return '3-5';
  if (a < 10) return '5-10';
  if (a < 20) return '10-20';
  return '20-plus';
}

export function bucketDaysSince(days: number): PayChange['daysBucket'] {
  if (days < 1) return 'same-day';
  if (days < 7) return 'under-week';
  if (days < 28) return '1-4-weeks';
  if (days < 90) return '1-3-months';
  if (days < 180) return '3-6-months';
  if (days < 365) return '6-12-months';
  return 'over-year';
}

/** Builds the pay-change signal from a saved record and the current state. */
export function buildPayChange(
  savedGross: number,
  savedProvince: string,
  savedAt: string,
  nowGross: number,
  nowProvince: string
): PayChange | null {
  if (!savedGross || savedGross <= 0 || !nowGross || nowGross <= 0) return null;
  const pct = ((nowGross - savedGross) / savedGross) * 100;
  const days = (Date.now() - new Date(savedAt).getTime()) / 86_400_000;
  if (!Number.isFinite(days) || days < 0) return null;
  return {
    fromHistory: true,
    direction: Math.abs(pct) < 0.5 ? 'same' : pct > 0 ? 'up' : 'down',
    pctBucket: bucketChangePct(pct),
    daysBucket: bucketDaysSince(days),
    provinceChanged: savedProvince !== nowProvince,
  };
}

export type Intent = 'new-job' | 'raise' | 'moving' | 'budgeting' | 'tax-filing' | 'curious';

/** Whether the number landed below, above, or near what the person expected. */
export type Expectation = 'lower' | 'higher' | 'as-expected';

/**
 * How someone is employed, INFERRED from what they already entered — never
 * asked. Fields that require a separate answer are effectively dead on this
 * site (industry 3.6%, intent 0.4%) while fields derived from what the user
 * had to type anyway run 67-88%, so this dimension is built from the
 * calculator they chose, the hours they entered, and whether they declared
 * tips or a shift premium.
 *
 * Order matters: tips are the most specific signal, and a tipped server on a
 * night shift is more usefully counted as tipped-service than as shift-worker.
 */
export type EmploymentShape =
  | 'salaried'
  | 'full-time-hourly'
  | 'part-time-hourly'
  | 'shift-worker'
  | 'tipped-service';

export function deriveEmploymentShape(
  mode: string,
  work: WorkPattern | null,
  behaviour: BehaviourSignals | null
): EmploymentShape | null {
  if (mode === 'annual') return 'salaried';
  if (behaviour?.tipsPctBucket) return 'tipped-service';
  if (behaviour?.shiftPremium) return 'shift-worker';
  if (!work) return null;
  const weekly = work.daysPerWeek * work.avgDailyHours;
  if (!Number.isFinite(weekly) || weekly <= 0) return null;
  // Statistics Canada treats under 30 hours a week as part time; matching that
  // definition is what lets this column be compared with official figures.
  return weekly < 30 ? 'part-time-hourly' : 'full-time-hourly';
}

export { bracketIncome } from './brackets';

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


// Owner / tester opt-out. Visiting any page with ?notelemetry=1 stores a
// permanent flag in this browser; ?notelemetry=0 clears it. Our own testing
// then never enters the dataset — the value of this data is that it reflects
// real users, and corporate WiFi can even egress in another country, which
// would distort the geography badly.
const OPTOUT_KEY = 'canpay_no_telemetry';

// Read the switch as soon as this module loads, not only when an event is about
// to be sent: someone told to "open this URL once on each device" expects that
// to be enough, and on a page where they never touch the calculator no event is
// ever attempted.
function applyOptOutParam(): void {
  try {
    if (typeof window === 'undefined') return; // prerender
    const param = new URLSearchParams(window.location.search).get('notelemetry');
    if (param === '1') {
      localStorage.setItem(OPTOUT_KEY, '1');
      console.info('CanPay: telemetry disabled on this device.');
    } else if (param === '0') {
      localStorage.removeItem(OPTOUT_KEY);
      console.info('CanPay: telemetry re-enabled on this device.');
    }
  } catch {
    /* private mode, blocked storage — nothing to do */
  }
}

applyOptOutParam();

function isOptedOut(): boolean {
  try {
    applyOptOutParam();
    return localStorage.getItem(OPTOUT_KEY) === '1';
  } catch {
    return false;
  }
}


/**
 * Where on this site the visitor was before the calculation.
 *
 * `entry_path` is the first page of the tab's visit, kept in sessionStorage so
 * it survives navigating from an article into the calculator but disappears
 * when the tab closes — the same lifetime as the visit id, and never a
 * cross-visit identifier.
 *
 * Only same-origin PATHS are recorded. An external referrer can carry the
 * user's search terms or an auth token in its query string, so those are
 * dropped entirely rather than trimmed.
 */
const ENTRY_KEY = 'canpay_entry_path';

function samePath(url: string): string | null {
  try {
    const u = new URL(url, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    return u.pathname.slice(0, 200) || '/';
  } catch {
    return null;
  }
}

function getEntryPath(): string | null {
  try {
    const stored = sessionStorage.getItem(ENTRY_KEY);
    if (stored) return stored;
    // First page of this visit: whichever page is loading right now.
    const here = window.location.pathname.slice(0, 200) || '/';
    sessionStorage.setItem(ENTRY_KEY, here);
    return here;
  } catch {
    return null; // private mode / storage blocked
  }
}

function getReferrerPath(): string | null {
  try {
    return document.referrer ? samePath(document.referrer) : null;
  } catch {
    return null;
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

// Browser family only — never a version, never the raw user-agent string.
// Family alone is 5-6 buckets and adds nothing to a fingerprint, but it is a
// real product signal: an audience skewing Safari is an iPhone audience, and
// an in-app browser (WeChat, Instagram) explains odd engagement patterns.
// Order matters: every Chrome derivative also says "Chrome", Chrome also
// says "Safari", so the most specific token is tested first.
function detectBrowser(): string | null {
  try {
    const ua = navigator.userAgent;
    if (/MicroMessenger/i.test(ua)) return 'wechat';
    if (/Instagram|FBAN|FBAV/i.test(ua)) return 'in-app';
    if (/SamsungBrowser/i.test(ua)) return 'samsung';
    if (/Edg\//i.test(ua)) return 'edge';
    if (/OPR\/|Opera/i.test(ua)) return 'opera';
    if (/Firefox\//i.test(ua)) return 'firefox';
    if (/Chrome\/|CriOS/i.test(ua)) return 'chrome';
    if (/Safari\//i.test(ua)) return 'safari';
    return 'other';
  } catch {
    return null;
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
// Neither of these can be derived, so both are asked — but only inside the
// progressive prompt, one question at a time, after the answer the user came
// for. Gender is deliberately NOT collected: no calculation uses it, an
// unmotivated answer is indistinguishable from a real one, and gender × city ×
// industry × bracket is a re-identification risk this dataset promised never
// to carry.
export type WorkArrangement = 'onsite' | 'remote' | 'hybrid';
/** Fake-door products: which paid offer a visitor tapped. */
export type ProductInterest = 'relocation' | 'offer-compare' | 'rrsp-season';
export type AgeBand = 'under-25' | '25-34' | '35-44' | '45-54' | '55-64' | '65-plus';

export function recordCalcEvent(e: {
  mode: CalcMode;
  province: string;
  annualIncome: number;
  lang: string;
  source?: 'web' | 'widget';
  embedHost?: string | null;
  industry?: string | null;
  /** Position of that industry in the dropdown — detects top-of-list clicking. */
  industryRank?: number | null;
  /** The reader arrived with a previously stored industry choice. */
  industryReturning?: boolean | null;
  work?: WorkPattern | null;
  behaviour?: BehaviourSignals | null;
  viewedReport?: boolean;
  intent?: Intent | null;
  expectation?: Expectation | null;
  employmentShape?: EmploymentShape | null;
  isRegistered?: boolean;
  payChange?: PayChange | null;
  workArrangement?: WorkArrangement | null;
  ageBand?: AgeBand | null;
  productInterest?: ProductInterest | null;
}) {
  if (!e.annualIncome || e.annualIncome <= 0 || !e.province) return;
  if (isLikelyBot() || isOptedOut()) return;

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
    const key = `${source}|${e.mode}|${e.province}|${bracket}|${lang}|${e.industry ?? ''}|${workKey}|${behaviourKey}|${e.intent ?? ''}|${e.expectation ?? ''}|${e.workArrangement ?? ''}|${e.ageBand ?? ''}|${e.viewedReport ? 'r' : ''}|${e.productInterest ?? ''}|${e.payChange ? `${e.payChange.direction}-${e.payChange.pctBucket}` : ''}`;
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
        browser: detectBrowser(),
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
        schema_version: SCHEMA_VERSION,
        median_ratio_bucket: bucketMedianRatio(e.annualIncome),
        median_wage_ref: NATIONAL_MEDIAN_ANNUAL,
        intent: e.intent ?? null,
        industry_rank: e.industryRank ?? null,
        industry_returning: e.industryReturning ?? null,
        expectation: e.expectation ?? null,
        work_arrangement: e.workArrangement ?? null,
        age_band: e.ageBand ?? null,
        product_interest: e.productInterest ?? null,
        employment_shape: e.employmentShape ?? null,
        is_registered: e.isRegistered ?? null,
        from_history: e.payChange ? true : null,
        change_direction: e.payChange?.direction ?? null,
        change_pct_bucket: e.payChange?.pctBucket ?? null,
        days_since_saved_bucket: e.payChange?.daysBucket ?? null,
        province_changed: e.payChange?.provinceChanged ?? null,
        session_id: getSessionId(),
        seq: seqCounter,
        // User's LOCAL clock (not UTC): powers "what hour / which weekday do
        // Canadians check their pay" and payday-cycle analysis.
        entry_path: getEntryPath(),
        referrer_path: getReferrerPath(),
        local_hour: new Date().getHours(),
        local_dow: new Date().getDay(),
      })
      .then(({ error }) => {
        // Telemetry must never affect the user experience — swallow errors.
        if (error) console.debug('telemetry skipped:', error.message);
      });
  }, 3000);
}
