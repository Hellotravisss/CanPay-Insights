import type { Metadata } from 'next';
import BlogListPage from './BlogListPage';

export const metadata: Metadata = {
  title: 'Canadian Payroll & Tax Insights Hub 2025',
  description:
    'Expert guides on Canadian taxes, salaries, provincial comparisons, CPP, EI, RRSP, and personal finance for 2025. Stay informed with CanPay Insights.',
  alternates: {
    canonical: 'https://www.canpayinsights.ca/blog',
  },
  openGraph: {
    title: 'Canadian Payroll & Tax Insights Hub 2025 | CanPay Insights',
    description:
      'Expert guides on Canadian taxes, salaries, provincial comparisons, CPP, EI, RRSP, and personal finance for 2025.',
    url: 'https://www.canpayinsights.ca/blog',
  },
};

export default function BlogPage() {
  return <BlogListPage />;
}
