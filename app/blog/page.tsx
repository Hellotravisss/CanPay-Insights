import type { Metadata } from 'next';
import BlogListPage from './BlogListPage';
import { allArticles } from '../src/content/articles-data';

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
  return (
    <>
      {/* 🚀 Static Internal Links & Content matrix for Search Engine Crawlers */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <h1>Canadian Payroll & Tax Insights Hub</h1>
        <p>Explore our directory of expert tax guides and salary analysis for Canadian workers:</p>
        <ul>
          {allArticles.map((article) => (
            <li key={article.id}>
              <a href={`/blog/${article.slug}`}>{article.title}</a>
              <p>{article.excerpt}</p>
              <span>Category: {article.category} | Published: {article.publishedAt}</span>
            </li>
          ))}
        </ul>
      </div>

      <BlogListPage />
    </>
  );
}
