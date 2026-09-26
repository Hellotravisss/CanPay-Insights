import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Retired articles, redirected rather than deleted.
   *
   * These were 2025-dated guides with zero Search Console impressions across a
   * 19-month life. The problem was never that nobody read them — it was that a
   * "2025" guide in 2026 hands out stale numbers to anyone who does find it,
   * and accuracy is the whole product.
   *
   * Each one has a newer page that answers the same question with current data,
   * so a permanent redirect passes on whatever equity the old URL earned. A
   * deletion would throw that away and leave a 404 for anyone holding the link.
   */
  // Report pages are opened with Stripe's session id in the address, and that
  // address is the only key to the buyer's report (email, exact salary). No
  // referrer may carry it to any link the page contains.
  async headers() {
    return [
      { source: '/report/:path*', headers: [{ key: 'Referrer-Policy', value: 'no-referrer' }] },
      // Static files (fonts etc.) get their headers from public/_headers.
    ];
  },
  async redirects() {
    return [
      {
        // www → apex. Vercel did this at the platform level; on Cloudflare the
        // Worker serves both hosts, so the canonical host is enforced here.
        source: '/:path*',
        has: [{ type: 'host', value: 'www.canpayinsights.ca' }],
        destination: 'https://canpayinsights.ca/:path*',
        permanent: true,
      },
      {
        source: '/blog/bc-tax-guide-2025',
        destination: '/blog/bc-take-home-pay-guide-2026',
        permanent: true,
      },
      {
        source: '/blog/alberta-vs-ontario-taxes-2025',
        destination: '/compare-provinces',
        permanent: true,
      },
      {
        // Same topic as the October 2026 minimum-wage piece, which has current
        // figures — two pages competing for one query helps neither.
        source: '/blog/minimum-wage-canada-2025-comparison',
        destination: '/blog/minimum-wage-increases-october-2026',
        permanent: true,
      },
      {
        // 2025 rates presented as current; the 2026 study has every province.
        source: '/blog/minimum-wage-provincial-guide-canada-2025',
        destination: '/blog/minimum-wage-take-home-pay-canada-2026',
        permanent: true,
      },
      {
        // Duplicate of the study on the same benefit, which has the CRA's figures.
        source: '/blog/cra-grocery-essentials-benefit-canada-2026',
        destination: '/blog/canada-groceries-essentials-benefit-2026',
        permanent: true,
      },
      {
        // Retired page with search impressions: 150 impressions (GSC, to 2026-08-17). Speculative 2025 ranges; /wages has StatCan medians by industry and province, with take-home.
        source: '/blog/canadian-tech-salaries-2025',
        destination: '/wages',
        permanent: true,
      },
      {
        // Retired page with search impressions: 55 impressions. Same reason; /wages covers finance, insurance & real estate.
        source: '/blog/finance-banking-salaries-canada-2025',
        destination: '/wages',
        permanent: true,
      },
      {
        // Retired page with search impressions: 268 impressions on the www property (Apr-May 2026). /wages covers public administration.
        source: '/blog/public-vs-private-sector-pay-canada-2025',
        destination: '/wages',
        permanent: true,
      },
      {
        // Retired page with search impressions: 19 impressions. Same question, answered by the live TFSA vs RRSP article.
        source: '/blog/rrsp-vs-tfsa-canada-2025',
        destination: '/blog/tfsa-vs-rrsp-canada-2025',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
