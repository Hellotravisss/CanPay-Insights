import React from 'react';

/**
 * Cross-recommendation to Take-Home Almanac (takehomealmanac.com), our U.S.
 * sister site. The almanac links back to CanPay the same way — a deliberate,
 * honest "same team" pair of links, not a faked third-party endorsement:
 * the shared authorship IS the reason the recommendation can be trusted, and
 * same-author cross-links are a real entity signal for search and AI engines.
 *
 * Brand here is the ALMANAC's real one, read from its repo (USPay/tailwind
 * .config.ts and public/logo.png), not an invented palette: violet #33015b
 * surface, money-band lime #95fc02 for the hero, hot pink #fc2862 for the
 * "taken" accent, and the actual logo file. An earlier version of this card
 * guessed "Old Glory blue and red" — it looked like a different product.
 * If the almanac's brand changes, change it there first and copy here.
 *
 * The utm pair mirrors the almanac's link back (utm_source=takehomealmanac);
 * both sides can measure exactly how many people the channel moves.
 */
const ALMANAC_URL =
  'https://takehomealmanac.com/?utm_source=canpayinsights&utm_medium=sister-site';

const SisterSiteCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <a
    href={ALMANAC_URL}
    target="_blank"
    rel="noopener"
    className={`group relative block overflow-hidden rounded-2xl bg-[#33015b] p-6 no-underline shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl sm:p-8 ${className}`}
  >
    {/* The almanac's own accent: a thin pink edge, the "taken" colour. */}
    <span className="absolute inset-y-0 left-0 w-1.5 bg-[#fc2862]" aria-hidden="true" />

    <div className="relative flex flex-col gap-5 pl-3 sm:flex-row sm:items-center sm:gap-8">
      {/* Real logo, not a drawing of it. */}
      <img
        src="/takehomealmanac-logo.png"
        alt=""
        aria-hidden="true"
        width={96}
        height={96}
        className="h-20 w-20 shrink-0 rounded-2xl shadow-lg sm:h-24 sm:w-24"
      />

      <div className="min-w-0 flex-1">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#9a86b8]">
          Same team · U.S. edition
        </p>
        <h2 className="mb-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">
          Take-Home <span className="font-light text-[#95fc02]">Almanac</span>
        </h2>
        <p className="mb-4 max-w-xl text-sm leading-relaxed text-[#c9bfe0]">
          Working in the U.S. instead? Our American sister site is the same calculator, rebuilt for
          U.S. taxes: federal and state brackets for all 50 states and D.C., FICA, and filing status.
        </p>
        <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#95fc02] px-5 py-2 text-sm font-bold text-[#33015b] shadow-sm transition-colors group-hover:bg-[#bbfa4e]">
          takehomealmanac.com
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h9.586L10.293 5.707a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </span>
      </div>
    </div>
  </a>
);

export default SisterSiteCard;
