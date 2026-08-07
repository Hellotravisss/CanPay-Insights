'use client';
import { supabase } from './supabase';

// Anonymous calculation telemetry — the "Speedtest" data asset.
// Records WHAT Canadians are calculating (mode, province, income BRACKET, lang),
// never WHO: no exact amounts, no user id, no IP, no fingerprint. The table is
// write-only for the public key (RLS: insert allowed, select denied).

export type CalcMode = 'simple' | 'annual' | 'timesheet';

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

// Coarse geo (country code + region), resolved once per page load from our own
// /api/geo endpoint (Vercel edge headers). IP is never stored — see route.
let geoPromise: Promise<{ country: string | null; region: string | null }> | null = null;
function getGeo() {
  if (!geoPromise) {
    geoPromise = fetch('/api/geo', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { country: null, region: null }))
      .catch(() => ({ country: null, region: null }));
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
}) {
  if (!e.annualIncome || e.annualIncome <= 0 || !e.province) return;

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const bracket = bracketIncome(e.annualIncome);
    const lang = e.lang === 'zh' || e.lang === 'fr' ? e.lang : 'en';
    const source = e.source ?? 'web';
    const key = `${source}|${e.mode}|${e.province}|${bracket}|${lang}`;
    if (sentThisPageLoad.has(key)) return;
    sentThisPageLoad.add(key);

    const geo = await getGeo();
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
      })
      .then(({ error }) => {
        // Telemetry must never affect the user experience — swallow errors.
        if (error) console.debug('telemetry skipped:', error.message);
      });
  }, 3000);
}
