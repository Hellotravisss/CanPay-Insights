import React from 'react';

/**
 * Cross-recommendation to Take-Home Almanac (takehomealmanac.com), our U.S.
 * sister site. The almanac links back to CanPay the same way — a deliberate,
 * honest "same team" pair of links, not a faked third-party endorsement:
 * the shared authorship IS the reason the recommendation can be trusted, and
 * same-author cross-links are a real entity signal for search and AI engines.
 *
 * The palette here is the ALMANAC's, not CanPay's — Old Glory Blue #0A3161 /
 * Old Glory Red #B31942 / Paper #FBFAF7, the U.S. flag's official values —
 * so the card reads instantly as "another country's tool". Do not "fix" the
 * colours to match CanPay's red-on-slate; standing apart is the point.
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
    className={`group relative block overflow-hidden rounded-2xl bg-[#0A3161] p-6 no-underline shadow-md transition-all hover:-translate-y-0.5 hover:shadow-xl sm:p-8 ${className}`}
  >
    {/* Star field — quiet, structural, top-right. */}
    <svg
      className="pointer-events-none absolute -right-4 -top-6 h-40 w-40 opacity-[0.14] transition-opacity group-hover:opacity-25"
      viewBox="0 0 100 100"
      fill="#FBFAF7"
      aria-hidden="true"
    >
      {[
        [20, 18], [52, 10], [84, 20], [36, 40], [68, 44], [16, 58], [50, 64], [84, 60], [32, 84], [66, 88],
      ].map(([x, y], i) => (
        <path
          key={i}
          transform={`translate(${x} ${y}) scale(0.9)`}
          d="M0-6l1.76 3.57 3.94.57-2.85 2.78.67 3.93L0 2.99l-3.52 1.86.67-3.93-2.85-2.78 3.94-.57z"
        />
      ))}
    </svg>

    {/* Flag-stripe accent along the left edge. */}
    <span className="absolute inset-y-0 left-0 flex w-1.5 flex-col" aria-hidden="true">
      <span className="flex-1 bg-[#B31942]" />
      <span className="flex-1 bg-[#FBFAF7]" />
      <span className="flex-1 bg-[#B31942]" />
    </span>

    <div className="relative pl-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#8FA6C4]">
        Same team · U.S. edition
      </p>
      <h2 className="mb-2 text-xl font-extrabold text-[#FBFAF7] sm:text-2xl">
        Working in the U.S. instead?
      </h2>
      <p className="mb-5 max-w-xl text-sm leading-relaxed text-[#8FA6C4]">
        <strong className="font-semibold text-[#FBFAF7]">Take-Home Almanac</strong> is our American
        sister site — the same calculator, rebuilt for U.S. taxes: federal and state brackets for
        all 50 states and D.C., FICA, and filing status.
      </p>
      <span className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#B31942] px-5 py-2 text-sm font-bold text-[#FBFAF7] shadow-sm transition-colors group-hover:bg-[#c92552]">
        takehomealmanac.com
        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M3 10a1 1 0 011-1h9.586L10.293 5.707a1 1 0 111.414-1.414l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L13.586 11H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </span>
    </div>
  </a>
);

export default SisterSiteCard;
