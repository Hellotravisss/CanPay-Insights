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

export function countryName(code: string): string {
  return COUNTRY_NAMES[code?.toUpperCase()] ?? code;
}
