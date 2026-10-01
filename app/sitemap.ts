import type { MetadataRoute } from 'next';
import { isIndexable } from '../lib/indexableSalaryPages';
import allArticles from '../src/content/articles-data';
import { frenchLandingPages, landingPages } from './landing-page-data';
import { PROVINCIAL_WAGES } from '../lib/provincialWages';
import { DATASET_VERSION } from '../lib/datasetVersion';

const BASE_URL = 'https://canpayinsights.ca';
// Computed pages change when the engine's output changes, and DATASET_VERSION
// moves exactly then (scripts/generate-dataset.ts). A build date on every URL
// told crawlers nothing.
const ENGINE_DATE = new Date(DATASET_VERSION);

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: ENGINE_DATE,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/data`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/research/pay-calculator-behaviour`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/widget`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/wages`,
      lastModified: ENGINE_DATE,
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
          lastModified: ENGINE_DATE,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }))
    ),
    {
      url: `${BASE_URL}/changelog`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/compare-provinces`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/link-to-canpay`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/zh`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/zh/100k-after-tax`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/zh/bc-payroll-tax`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/zh/newcomer-tax`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/affiliate-disclosure`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const articlePages: MetadataRoute.Sitemap = allArticles.map((article) => ({
    url: `${BASE_URL}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
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
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    }));

  const frenchCalculatorPages: MetadataRoute.Sitemap = frenchLandingPages
    .filter((page) => isHub(page.slug))
    .map((page) => ({
      url: `${BASE_URL}/fr/${page.slug}`,
      lastModified: ENGINE_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }));

  return [...staticPages, ...calculatorPages, ...frenchCalculatorPages, ...articlePages];
}
