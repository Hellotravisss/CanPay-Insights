import type { Metadata } from 'next';
import ProvinceComparisonClient from './ProvinceComparisonClient';

export const metadata: Metadata = {
  title: 'Compare Canadian Provinces — Tax & Salary 2025',
  description:
    'Compare take-home pay, tax rates, and salary benchmarks across all Canadian provinces side by side for 2025.',
  alternates: {
    canonical: 'https://www.canpayinsights.ca/compare-provinces',
  },
};

export default function CompareProvincesPage() {
  return <ProvinceComparisonClient />;
}
