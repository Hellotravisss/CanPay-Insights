// ISO 3166-1 alpha-2 → English country name. Vercel's edge geo header gives us
// two-letter codes; nobody should have to decode "PH" to read their own
// dashboard, and the eventual public data report needs full names anyway.
export const COUNTRY_NAMES: Record<string, string> = {
  CA: 'Canada', US: 'United States', GB: 'United Kingdom', IN: 'India',
  PH: 'Philippines', CN: 'China', HK: 'Hong Kong', TW: 'Taiwan', MX: 'Mexico',
  FR: 'France', DE: 'Germany', NL: 'Netherlands', IE: 'Ireland', ES: 'Spain',
  IT: 'Italy', PT: 'Portugal', PL: 'Poland', UA: 'Ukraine', RO: 'Romania',
  RU: 'Russia', TR: 'Turkey', AU: 'Australia', NZ: 'New Zealand', JP: 'Japan',
  KR: 'South Korea', VN: 'Vietnam', TH: 'Thailand', MY: 'Malaysia',
  SG: 'Singapore', ID: 'Indonesia', PK: 'Pakistan', BD: 'Bangladesh',
  LK: 'Sri Lanka', NP: 'Nepal', IR: 'Iran', IQ: 'Iraq', IL: 'Israel',
  AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait',
  EG: 'Egypt', MA: 'Morocco', DZ: 'Algeria', TN: 'Tunisia', NG: 'Nigeria',
  GH: 'Ghana', KE: 'Kenya', ET: 'Ethiopia', ZA: 'South Africa',
  BR: 'Brazil', AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Peru',
  VE: 'Venezuela', EC: 'Ecuador', CU: 'Cuba', DO: 'Dominican Republic',
  JM: 'Jamaica', HT: 'Haiti', TT: 'Trinidad and Tobago', GT: 'Guatemala',
  SV: 'El Salvador', HN: 'Honduras', NI: 'Nicaragua', CR: 'Costa Rica',
  PA: 'Panama', BE: 'Belgium', CH: 'Switzerland', AT: 'Austria',
  SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', IS: 'Iceland',
  CZ: 'Czechia', SK: 'Slovakia', HU: 'Hungary', GR: 'Greece', BG: 'Bulgaria',
  HR: 'Croatia', RS: 'Serbia', LT: 'Lithuania', LV: 'Latvia', EE: 'Estonia',
  BY: 'Belarus', MD: 'Moldova', KZ: 'Kazakhstan', UZ: 'Uzbekistan',
  AF: 'Afghanistan', SY: 'Syria', LB: 'Lebanon', JO: 'Jordan', MM: 'Myanmar',
  KH: 'Cambodia', LA: 'Laos', MN: 'Mongolia', FJ: 'Fiji',
};

/**
 * Every browser ships the complete ISO 3166 list, in every language, via
 * Intl.DisplayNames. The hand-written table above is only a fallback for
 * environments that lack it.
 *
 * This matters because the previous fallback was the raw code itself: an
 * unlisted country printed as "MU" and stayed that way until someone noticed.
 * A table maintained by hand is guaranteed to be missing whichever country
 * shows up next, and the failure is silent — it looks like a design choice,
 * not a gap.
 */
const displayNames: Record<string, Intl.DisplayNames | null> = {};

function resolver(lang: string): Intl.DisplayNames | null {
  if (!(lang in displayNames)) {
    try {
      displayNames[lang] = new Intl.DisplayNames([lang], { type: 'region' });
    } catch {
      displayNames[lang] = null;
    }
  }
  return displayNames[lang];
}

export function countryName(code: string, lang: 'en' | 'zh' = 'en'): string {
  const upper = code?.toUpperCase();
  if (!upper) return code;
  try {
    const name = resolver(lang === 'zh' ? 'zh-Hans' : 'en')?.of(upper);
    // Intl echoes the input back when it does not recognise the code.
    if (name && name !== upper) return name;
  } catch {
    // Invalid code — fall through to the table.
  }
  return COUNTRY_NAMES[upper] ?? code;
}
