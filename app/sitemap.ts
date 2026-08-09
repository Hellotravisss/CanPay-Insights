import type { MetadataRoute } from 'next';
import { isIndexable } from '../lib/indexableSalaryPages';
import allArticles from '../src/content/articles-data';
import { frenchLandingPages, landingPages } from './landing-page-data';
import { PROVINCIAL_WAGES } from '../lib/provincialWages';

const BASE_URL = 'https://canpayinsights.ca';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/data`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/widget`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/wages`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...Object.keys(PROVINCIAL_WAGES).flatMap((industry) =>
      Object.entries({
        ON: 'ontario', QC: 'quebec', BC: 'british-columbia', AB: 'alberta',
        MB: 'manitoba', SK: 'saskatchewan', NS: 'nova-scotia', NB: 'new-brunswick',
        NL: 'newfoundland-and-labrador', PE: 'prince-edward-island',
      })
        .filter(([code]) => PROVINCIAL_WAGES[industry]?.[code])
        .map(([, provinceSlug]) => ({
          url: `${BASE_URL}/wages/${industry}-wages-${provinceSlug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
    ),
    {
      url: `${BASE_URL}/changelog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/compare-provinces`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/link-to-canpay`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/zh`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/affiliate-disclosure`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = allArticles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Hubs, plus the permutation pages released from noindex. A page that is
  // indexable but missing from the sitemap sends a mixed signal, so the two
  // decisions come from the same function.
  const isHub = (slug: string) => isIndexable(slug);

  const calculatorPages: MetadataRoute.Sitemap = landingPages
    .filter((page) => isHub(page.slug))
    .map((page) => ({
      url: `${BASE_URL}/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    }));

  const frenchCalculatorPages: MetadataRoute.Sitemap = frenchLandingPages
    .filter((page) => isHub(page.slug))
    .map((page) => ({
      url: `${BASE_URL}/fr/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }));

  return [...staticPages, ...calculatorPages, ...frenchCalculatorPages, ...articlePages];
}
