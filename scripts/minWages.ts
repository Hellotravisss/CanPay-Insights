/**
 * The 13 general adult minimum wages, with the government page each one comes
 * from and the rule that reads the rate off that page.
 *
 * WHY THIS FILE EXISTS
 *   These are INPUT rates, not tax rates, so the golden T4032 test cannot see
 *   them. They went stale once without anyone noticing (Nunavut and the NWT
 *   both rose on 2026-09-01). `npm run audit:minwage` (scripts/auditMinWage.ts)
 *   now fetches every source below and fails when a page disagrees with this
 *   table, when a known adjustment date passes without a re-check, or when a
 *   page can no longer be read.
 *
 * WHEN A RATE CHANGES
 *   Update `wage`, `effective`, `verified` (the day you read the government
 *   page yourself), move `next` into the past or clear it, and push `reviewBy`
 *   to the next adjustment date. Then regenerate the surfaces that print these
 *   figures (scripts/minwage-takehome.ts, scripts/_mwreport.ts) — never
 *   hand-edit their output.
 *
 * SOURCES BEHIND A BOT WALL
 *   gov.nu.ca, yukon.ca and princeedwardisland.ca answer automated clients with
 *   a Cloudflare / Radware browser challenge. The gate does not try to get past
 *   it. For those three, `wall` says so, the gate reports BLOCKED instead of a
 *   rate, and the `reviewBy` / `next` dates plus a maximum age on `verified`
 *   are what force a human re-check. If a wall ever disappears the gate fails
 *   and asks for an extractor to be written.
 */
import { Province } from '../types';

export type Extracted = {
  /** General adult rate in force on `today`, per the page. */
  rate: number;
  /** Date that rate took effect, if the page states it (YYYY-MM-DD). */
  effective?: string;
  /** A future rate the page announces, if any. */
  next?: { wage: number; date: string };
};

export type MinWage = {
  province: Province;
  /** Two-letter code: log lines and fixture file names. */
  code: string;
  label: string;
  /** Dollars per hour, general adult rate, in force today. */
  wage: number;
  /** Date `wage` took effect (YYYY-MM-DD). */
  effective: string;
  /** Last day a person read `wage` on the government's own page (YYYY-MM-DD). */
  verified: string;
  /**
   * Next date on which this rate is known to change or to be re-set by law
   * (annual CPI indexation, a scheduled step). On or after it, the gate fails
   * until `verified` is bumped past it — a page that still shows the old rate
   * a day after the adjustment date is exactly what must be looked at by hand.
   * null = no scheduled adjustment (rate only changes by new regulation).
   */
  reviewBy: string | null;
  /** Why `reviewBy` is that date — statute or announcement. */
  reviewBasis: string;
  /** An increase already announced by the government, with its date. */
  next?: { wage: number; date: string };
  source: {
    /** The government's own page. */
    url: string;
    /** In words, for a reviewer: which sentence the rate is read from. */
    rule: string;
    /** Pure function over the page's visible text; null when nothing matches. */
    extract: ((text: string, today: string) => Extracted | null) | null;
    /** Set when the page blocks automated clients; the reason, for the log. */
    wall?: string;
  };
};

// ── date helpers (pages print dates in prose) ───────────────────────────────
const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, november: 11, december: 12,
};
const pad = (n: number) => String(n).padStart(2, '0');
/** "June 1, 2026" or "1 October 2026" → "2026-06-01"; null if neither. */
export function proseDate(s: string): string | null {
  let m = s.match(/([A-Z][a-z]+)\s+(\d{1,2}),\s*(\d{4})/);
  if (m && MONTHS[m[1].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[1].toLowerCase()])}-${pad(+m[2])}`;
  m = s.match(/(\d{1,2})\s+([A-Z][a-z]+)\s+(\d{4})/);
  if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(+m[1])}`;
  return null;
}
const DATE = String.raw`(?:[A-Z][a-z]+ \d{1,2}, \d{4}|\d{1,2} [A-Z][a-z]+ \d{4})`;
const RATE = String.raw`(\d{1,2}(?:\.\d{2})?)`;
const num = (s: string) => Number(s.replace(',', '.'));

/** One sentence, one rate (and optionally its date). */
function sentence(re: RegExp, groups: { rate: number; date?: number }) {
  return (text: string): Extracted | null => {
    const m = text.match(re);
    if (!m) return null;
    const rate = num(m[groups.rate]);
    const effective = groups.date ? proseDate(m[groups.date]) ?? undefined : undefined;
    return Number.isFinite(rate) ? { rate, effective } : null;
  };
}

// ── the table ───────────────────────────────────────────────────────────────
// Verified 2026-11-01: ten rates read off each government page by the extractor
// and by eye. NU, YT and PE could not be fetched (bot wall); their `verified`
// is the last direct read (2026-09-17, recorded in the old minwage-takehome.ts
// header). On 2026-11-01 their rates were corroborated only through search-
// engine copies of the same government pages, which is not a direct read.
export const MIN_WAGES: MinWage[] = [
  {
    province: Province.AB, code: 'AB', label: 'Alberta', wage: 15.0, effective: '2018-10-01', verified: '2026-11-01',
    reviewBy: null, reviewBasis: 'No indexation; changes only by amending the Employment Standards Regulation.',
    source: {
      url: 'https://www.alberta.ca/minimum-wage',
      rule: 'Table row "Most employees (general minimum wage) $15/hour".',
      extract: sentence(new RegExp(String.raw`Most employees \(general minimum wage\) \$${RATE}\s*/\s*hour`), { rate: 1 }),
    },
  },
  {
    province: Province.SK, code: 'SK', label: 'Saskatchewan', wage: 15.7, effective: '2026-10-01', verified: '2026-11-01',
    reviewBy: '2027-10-01', reviewBasis: 'Indexed every October 1 (CPI + average hourly wage formula).',
    source: {
      url: 'https://www.saskatchewan.ca/business/employment-standards/payment-of-wages-payroll-administration-benefits-and-time-sheets/minimum-wage-and-reporting-for-duty-pay',
      rule: 'Sentence "Effective <date>, the minimum wage is $X per hour."',
      extract: sentence(new RegExp(String.raw`Effective (${DATE}), the minimum wage is \$${RATE} per hour`), { rate: 2, date: 1 }),
    },
  },
  {
    province: Province.NB, code: 'NB', label: 'New Brunswick', wage: 15.9, effective: '2026-04-01', verified: '2026-11-01',
    reviewBy: '2027-04-01', reviewBasis: 'Indexed every April 1 to New Brunswick CPI.',
    source: {
      // GNB retired its Employment Standards minimum-wage page (404 since at least
      // 2026-11-01); this is the department's own page that states the rate today.
      url: 'https://www.gnb.ca/en/gov/engagement-consultation/minimum-wage.html',
      rule: 'Sentence "Currently, the minimum wage in New Brunswick is $X."',
      extract: sentence(new RegExp(String.raw`Currently, the minimum wage in New Brunswick is \$${RATE}`), { rate: 1 }),
    },
  },
  {
    province: Province.MB, code: 'MB', label: 'Manitoba', wage: 16.4, effective: '2026-10-01', verified: '2026-11-01',
    reviewBy: '2027-10-01', reviewBasis: 'Indexed every October 1 to Manitoba CPI.',
    source: {
      url: 'https://www.gov.mb.ca/labour/standards/doc,minimum-wage,factsheet.html',
      rule: 'Sentence "Minimum wage is $X per hour effective <date>."',
      extract: sentence(new RegExp(String.raw`Minimum wage is \$${RATE} per hour effective (${DATE})`), { rate: 1, date: 2 }),
    },
  },
  {
    province: Province.NL, code: 'NL', label: 'Newfoundland and Labrador', wage: 16.35, effective: '2026-04-01', verified: '2026-11-01',
    reviewBy: '2027-04-01', reviewBasis: 'Labour Standards Regulations s. 8(4): adjusted every April 1 to national CPI.',
    source: {
      // gov.nl.ca has no standing minimum-wage page (the old /lsminimumwage/ is
      // 404), and the regulation states only the formula. The minister's release
      // for the current year is the government's own statement of the rate; the
      // April 1 reviewBy forces a new release URL to be found each year.
      url: 'https://www.gov.nl.ca/releases/2026/government-services/0226n02/',
      rule: 'Sentence "Effective <date>, minimum wage will increase to $X an hour".',
      extract: sentence(new RegExp(String.raw`Effective (${DATE}), minimum wage will increase to \$${RATE} an hour`), { rate: 2, date: 1 }),
    },
  },
  {
    province: Province.QC, code: 'QC', label: 'Quebec', wage: 16.6, effective: '2026-05-01', verified: '2026-11-01',
    reviewBy: '2027-05-01', reviewBasis: 'Set by regulation each year, in force May 1.',
    source: {
      // CNESST (cnesst.gouv.qc.ca) sits behind a Cloudflare challenge; the
      // regulation itself on LégisQuébec is the legal source and is reachable.
      url: 'https://www.legisquebec.gouv.qc.ca/fr/document/rc/N-1.1,%20r.%203',
      rule: 'Regulation respecting labour standards, s. 3: "le salaire minimum payable à un salarié est de X $ l’heure".',
      extract: sentence(/le salaire minimum payable à un salarié est de (\d{1,2},\d{2}) \$ l.heure/, { rate: 1 }),
    },
  },
  {
    province: Province.NS, code: 'NS', label: 'Nova Scotia', wage: 17.0, effective: '2026-10-01', verified: '2026-11-01',
    reviewBy: '2027-04-01', reviewBasis: 'Minimum Wage Review Committee; rates have changed April 1 (and October 1 in 2025–26).',
    source: {
      url: 'https://novascotia.ca/lae/employmentrights/minimumwage.asp',
      rule: 'Sentence "As of <date>, employers must pay employees at least $X per hour."',
      extract: sentence(new RegExp(String.raw`As of (${DATE}), employers must pay employees at least \$${RATE} per hour`), { rate: 2, date: 1 }),
    },
  },
  {
    province: Province.NT, code: 'NT', label: 'Northwest Territories', wage: 17.2, effective: '2026-09-01', verified: '2026-11-01',
    reviewBy: '2027-09-01', reviewBasis: 'Indexed every September 1.',
    source: {
      url: 'https://www.ece.gov.nt.ca/en/services/employment-standards/minimum-wage',
      rule: 'Sentence "In the Northwest Territories (NWT), the minimum wage is $X per hour."',
      extract: sentence(new RegExp(String.raw`Northwest Territories \(NWT\), the minimum wage is \$${RATE} per hour`), { rate: 1 }),
    },
  },
  {
    province: Province.PE, code: 'PE', label: 'Prince Edward Island', wage: 17.3, effective: '2026-10-01', verified: '2026-11-01',
    reviewBy: '2027-04-01',
    // Verified 2026-11-01 from the order itself (Royal Gazette, EC2026-379, 31 March 2026), a PDF
    // automated clients can read: https://www.princeedwardisland.ca/sites/default/files/89b2/20260331truwww_0.pdf
    reviewBasis: 'Minimum Wage Order EC2026-379: $17.30 from October 1, 2026, $17.60 from April 1, 2027.',
    next: { wage: 17.6, date: '2027-04-01' },
    source: {
      // The old minimum-wage-order page sent browsers to the site search (2026-11-01).
      url: 'https://www.princeedwardisland.ca/en/topic/hours-of-work-and-wage-standards',
      rule: 'None yet: the page has never been readable by the gate.',
      extract: null,
      wall: 'Radware "Verifying your browser" challenge for automated clients',
    },
  },
  {
    province: Province.ON, code: 'ON', label: 'Ontario', wage: 17.95, effective: '2026-10-01', verified: '2026-11-01',
    reviewBy: '2027-10-01', reviewBasis: 'ESA 2000 s. 23.1: indexed every October 1 to Ontario CPI.',
    source: {
      url: 'https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage',
      rule: 'Rate table: header "Rates from <date> to <date>" columns, row "General minimum wage"; the column whose period contains today.',
      extract: (text, today) => {
        const head = text.match(/Minimum wage rate((?: Rates from [A-Z][a-z]+ \d{1,2}, \d{4} to [A-Z][a-z]+ \d{1,2}, \d{4})+)/);
        const row = text.match(/General minimum wage((?: \$\d{1,2}\.\d{2} per hour)+)/);
        if (!head || !row) return null;
        const periods = [...head[1].matchAll(/Rates from ([A-Z][a-z]+ \d{1,2}, \d{4}) to ([A-Z][a-z]+ \d{1,2}, \d{4})/g)]
          .map((m) => ({ from: proseDate(m[1])!, to: proseDate(m[2])! }));
        const rates = [...row[1].matchAll(/\$(\d{1,2}\.\d{2})/g)].map((m) => Number(m[1]));
        if (rates.length < periods.length) return null;
        const i = periods.findIndex((p) => p.from <= today && today <= p.to);
        if (i < 0) return null;
        const future = periods.findIndex((p) => p.from > today);
        return {
          rate: rates[i],
          effective: periods[i].from,
          next: future >= 0 ? { wage: rates[future], date: periods[future].from } : undefined,
        };
      },
    },
  },
  {
    province: Province.BC, code: 'BC', label: 'British Columbia', wage: 18.25, effective: '2026-06-01', verified: '2026-11-01',
    reviewBy: '2027-06-01', reviewBasis: 'Indexed every June 1 to BC CPI.',
    source: {
      url: 'https://www2.gov.bc.ca/gov/content/employment-business/employment-standards-advice/employment-standards/wages/minimum-wage',
      rule: 'Sentence "The minimum wage in B.C. is currently $X per hour (as of <date>)"; dated list "June 1, YYYY – $X per hour" for a future step.',
      extract: (text, today) => {
        const m = text.match(new RegExp(String.raw`The minimum wage in B\.C\. is currently \$${RATE} per hour \(as of (${DATE})\)`));
        if (!m) return null;
        const future = [...text.matchAll(new RegExp(String.raw`(${DATE}) – \$${RATE} per hour`, 'g'))]
          .map((x) => ({ date: proseDate(x[1])!, wage: Number(x[2]) }))
          .filter((x) => x.date > today)
          .sort((a, b) => a.date.localeCompare(b.date))[0];
        return { rate: Number(m[1]), effective: proseDate(m[2]) ?? undefined, next: future };
      },
    },
  },
  {
    province: Province.YT, code: 'YT', label: 'Yukon', wage: 18.51, effective: '2026-04-01', verified: '2026-11-01',
    reviewBy: '2027-04-01', reviewBasis: 'Employment Standards Act: indexed every April 1 to Whitehorse CPI.',
    source: {
      url: 'https://yukon.ca/en/find-minimum-wage-yukon',
      rule: 'None yet: the page has never been readable by the gate.',
      extract: null,
      wall: 'Cloudflare "Just a moment..." challenge for automated clients',
    },
  },
  {
    province: Province.NU, code: 'NU', label: 'Nunavut', wage: 20.17, effective: '2026-09-01', verified: '2026-11-01',
    reviewBy: '2027-09-01', reviewBasis: 'Annual adjustment formula (2025): announced by July 31, in force September 1.',
    source: {
      // The old /employment-and-income-support/minimum-wage page is a 404 in a browser (2026-11-01);
      // behind the challenge the gate cannot tell a 404 from a live page, so check this URL by hand.
      url: 'https://www.gov.nu.ca/en/employment-training-and-career-development/labour-and-employment-standards-nunavut',
      rule: 'None yet: the page has never been readable by the gate.',
      extract: null,
      wall: 'Cloudflare "Just a moment..." challenge for automated clients',
    },
  },
];

/** A walled source's manual check may be at most this old. */
export const WALLED_MAX_AGE_DAYS = 183;
