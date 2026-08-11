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
  async redirects() {
    return [
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
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
};

export default nextConfig;
