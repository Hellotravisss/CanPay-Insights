import React from 'react';

/**
 * Cross-recommendation to USAPay Insights (usapayinsights.com, called
 * Take-Home Almanac until 2026-09-25), our U.S. sister site — the second site
 * in the <Country>Pay Insights family. It links back to CanPay the same way — a deliberate,
 * honest "same team" pair of links, not a faked third-party endorsement:
 * the shared authorship IS the reason the recommendation can be trusted, and
 * same-author cross-links are a real entity signal for search and AI engines.
 *
 * Just the name (Travis, 2026-11-24: "美国版留个名字就行"). The violet + lime card before it out-shouted
 * everything else on the home page.
 *
 * The utm pair mirrors the US site's link back (utm_source=usapayinsights);
 * both sides can measure exactly how many people the channel moves.
 */
const ALMANAC_URL =
  'https://usapayinsights.com/?utm_source=canpayinsights&utm_medium=sister-site';

const SisterSiteCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <a
    href={ALMANAC_URL}
    target="_blank"
    rel="noopener"
    className={`group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-3 no-underline transition-colors hover:text-ink ${className}`}
  >
    USAPay Insights
    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
  </a>
);

export default SisterSiteCard;
