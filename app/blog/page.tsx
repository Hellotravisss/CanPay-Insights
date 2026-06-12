import type { Metadata } from 'next';
import BlogList from '../../src/content/components/BlogList';

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
  return <BlogList />;
}
