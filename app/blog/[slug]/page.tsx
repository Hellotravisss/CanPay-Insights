import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { allArticles, getArticleBySlug } from '../../../src/content/articles-data';
import ArticlePageClient from './ArticlePageClient';

interface Props {
  params: Promise<{ slug: string }>;
}

// Pre-render all 40 article pages at build time
export async function generateStaticParams() {
  return allArticles.map((article) => ({ slug: article.slug }));
}

// Per-article SEO metadata — this is what Google actually reads
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt,
    keywords: article.keywords,
    alternates: {
      canonical: `https://www.canpayinsights.ca/blog/${slug}`,
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      url: `https://www.canpayinsights.ca/blog/${slug}`,
      type: 'article',
      publishedTime: article.publishedAt,
      images: article.imageUrl
        ? [{ url: article.imageUrl, width: 800, alt: article.title }]
        : [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : ['/og-image.png'],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Inject article content as static HTML for Google to read
  // The client component handles interactive elements (share, related articles)
  return (
    <>
      {/* Static HTML for SEO — visible to crawlers before JS loads */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: article.title,
              description: article.excerpt,
              datePublished: article.publishedAt,
              dateModified: article.publishedAt,
              author: { '@type': 'Organization', name: 'CanPay Insights', url: 'https://www.canpayinsights.ca' },
              publisher: {
                '@type': 'Organization',
                name: 'CanPay Insights',
                url: 'https://www.canpayinsights.ca',
                logo: { '@type': 'ImageObject', url: 'https://www.canpayinsights.ca/logo.png' },
              },
              mainEntityOfPage: { '@type': 'WebPage', '@id': `https://www.canpayinsights.ca/blog/${slug}` },
              image: article.imageUrl || 'https://www.canpayinsights.ca/og-image.png',
              keywords: article.keywords?.join(', '),
              articleSection: article.category,
              inLanguage: 'en-CA',
              isPartOf: { '@type': 'WebSite', name: 'CanPay Insights', url: 'https://www.canpayinsights.ca' },
            },
            {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.canpayinsights.ca' },
                { '@type': 'ListItem', position: 2, name: 'Tax Guides', item: 'https://www.canpayinsights.ca/blog' },
                { '@type': 'ListItem', position: 3, name: article.title, item: `https://www.canpayinsights.ca/blog/${slug}` },
              ],
            },
          ]),
        }}
      />
      <ArticlePageClient slug={slug} />
    </>
  );
}
