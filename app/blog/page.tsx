import type { Metadata } from 'next';
import BlogList, { type BlogCard } from '../../src/content/components/BlogList';
import { allArticles } from '../../src/content/articles-data';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Canadian Payroll & Tax Insights Hub 2025',
  description:
    'Expert guides on Canadian taxes, salaries, provincial comparisons, CPP, EI, RRSP, and personal finance for 2025. Stay informed with CanPay Insights.',
  alternates: {
    canonical: 'https://canpayinsights.ca/blog',
  },
  openGraph: {
    title: 'Canadian Payroll & Tax Insights Hub 2025 | CanPay Insights',
    description:
      'Expert guides on Canadian taxes, salaries, provincial comparisons, CPP, EI, RRSP, and personal finance for 2025.',
    url: 'https://canpayinsights.ca/blog',
  },
};

export default function BlogPage() {
  // Trimmed on the server: BlogList needs eight fields per card, while the
  // article modules are 232 KB of full markdown bodies this page never renders.
  const cards: BlogCard[] = allArticles.map((a) => ({
    id: a.id, slug: a.slug, title: a.title, excerpt: a.excerpt,
    category: a.category, publishedAt: a.publishedAt, readTime: a.readTime,
    imageUrl: a.imageUrl,
  }));
  return <BlogList articles={cards} />;
}
