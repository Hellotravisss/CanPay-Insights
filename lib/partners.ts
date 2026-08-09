/**
 * Every commercial link on the site lives here, in one file.
 *
 * WHY ONE FILE
 *   Affiliate links rot: programs change URLs, tracking ids get reissued, deals
 *   end. Scattering them through components guarantees a dead link survives for
 *   months. One config means swapping a partner is a one-line change, and it is
 *   possible to answer "what do we actually monetise?" by reading a single file.
 *
 * HONESTY RULES (not negotiable)
 *   - Every partner slot renders a visible "paid referral link" marker.
 *   - Nothing here influences a calculation, a ranking, or a recommendation.
 *     The tax engine and the wage data never look at this file.
 *   - A partner with no url is simply not rendered. No placeholder, no fake
 *     offer, no "coming soon" — an empty slot shows nothing at all.
 *
 * TO ACTIVATE A PARTNER
 *   Set its url below (or the matching env var) once the affiliate account is
 *   approved. Nothing else needs to change.
 */

export type Partner = {
  id: string;
  /** Shown as the link text. */
  label: string;
  /** One line explaining why this is relevant here, in the user's terms. */
  blurb: string;
  /** Empty string = not approved yet = renders nothing. */
  url: string;
  /** Whether we earn from it — drives the visible disclosure. */
  paid: boolean;
  /** Optional month window (1-12, inclusive) for seasonal offers. */
  months?: number[];
};

const env = (key: string): string =>
  (typeof process !== 'undefined' && process.env?.[key]) || '';

// Canadian tax filing runs roughly February to the April 30 deadline, which is
// also when "what do I actually take home" traffic peaks. A tax-software slot
// outside that window is just clutter, so it hides itself.
const TAX_SEASON = [2, 3, 4];

export const PARTNERS: Partner[] = [
  {
    id: 'wealthsimple-invest',
    label: 'Open an RRSP with Wealthsimple',
    blurb: 'RRSP contributions cut the tax you owe — this is where to start one.',
    url: env('NEXT_PUBLIC_WS_INVEST_URL') || 'https://www.wealthsimple.com/invite/KGAAWL',
    paid: true,
  },
  {
    id: 'wealthsimple-tax',
    label: 'File with Wealthsimple Tax',
    blurb: 'Pay-what-you-want Canadian tax filing, including RRSP and T4 imports.',
    // Awaiting the referral/affiliate link — see docs/monetization.md.
    url: env('NEXT_PUBLIC_WS_TAX_URL'),
    paid: true,
    months: TAX_SEASON,
  },
  {
    id: 'turbotax-ca',
    label: 'File with TurboTax Canada',
    blurb: 'Guided filing with a free tier for simple returns.',
    url: env('NEXT_PUBLIC_TURBOTAX_URL'),
    paid: true,
    months: TAX_SEASON,
  },
];

export function getPartner(id: string, now = new Date()): Partner | null {
  const p = PARTNERS.find((x) => x.id === id);
  if (!p || !p.url) return null;
  if (p.months && !p.months.includes(now.getMonth() + 1)) return null;
  return p;
}

/** All partners that should render right now, in config order. */
export function activePartners(now = new Date()): Partner[] {
  return PARTNERS.filter((p) => p.url && (!p.months || p.months.includes(now.getMonth() + 1)));
}

/**
 * Job-search links for a salary page.
 *
 * Someone looking up "$65,000 after tax in Ontario" is very often weighing an
 * offer or job hunting, so listing roles at that pay is genuinely useful even
 * before it earns anything. Publisher ids turn the same links into paid clicks
 * once an account exists; without them these are ordinary links and we earn
 * nothing — which is exactly what the disclosure says.
 */
export function jobSearchLinks(amount: number, provinceName: string) {
  const q = encodeURIComponent(`$${Math.round(amount / 1000)}k`);
  const loc = encodeURIComponent(provinceName);
  const talentPub = env('NEXT_PUBLIC_TALENT_PUBLISHER');
  const jooblePub = env('NEXT_PUBLIC_JOOBLE_PUBLISHER');
  return [
    {
      id: 'talent',
      label: 'Talent.com',
      url:
        `https://ca.talent.com/jobs?k=${q}&l=${loc}` +
        (talentPub ? `&utm_source=${talentPub}` : ''),
      paid: Boolean(talentPub),
    },
    {
      id: 'jooble',
      label: 'Jooble',
      url:
        `https://ca.jooble.org/SearchResult?ukw=${q}&rgn=${loc}` +
        (jooblePub ? `&p=${jooblePub}` : ''),
      paid: Boolean(jooblePub),
    },
  ];
}
