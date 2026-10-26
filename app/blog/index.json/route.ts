import { allArticles } from '../../../src/content/articles-data';

/**
 * The article list as JSON, for the iOS app's "Tax guides" screen and the
 * related-guides card on its results page. Built at deploy time from the same
 * registry as /blog, so an article the twice-weekly routine publishes appears
 * in the app without an app release.
 *
 * No personal data in or out: the app requests this file and nothing else.
 */
export const dynamic = 'force-static';

const ORIGIN = 'https://canpayinsights.ca';

export function GET() {
  const articles = allArticles.map((a) => ({
    slug: a.slug,
    url: `${ORIGIN}/blog/${a.slug}`,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category,
    province: a.province ?? null,
    lang: a.lang ?? 'en',
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt ?? null,
    readTime: a.readTime,
    image: a.imageUrl ? `${ORIGIN}${a.imageUrl}` : null,
  }));
  return Response.json(
    { version: 1, generated: allArticles[0]?.publishedAt ?? null, count: articles.length, articles },
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}
