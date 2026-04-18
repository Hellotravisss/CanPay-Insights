import type { Metadata } from 'next';
import App from '../App';

export const metadata: Metadata = {
  title: 'CanPay Insights - Free Canadian Payroll Calculator 2025/2026',
  description:
    'Free Canadian payroll calculator. Calculate your take-home pay, taxes, CPP, and EI deductions across all provinces instantly. Supports hourly, salary, and timesheet modes.',
  alternates: {
    canonical: 'https://www.canpayinsights.ca/',
  },
  openGraph: {
    title: 'CanPay Insights - Free Canadian Payroll Calculator',
    description: 'Calculate your take-home pay across all Canadian provinces. Free, instant, accurate.',
    url: 'https://www.canpayinsights.ca/',
  },
};

export default function HomePage() {
  return <App />;
}
