import type { Metadata } from 'next';
import TermsPage from '../../components/TermsPage';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern the CanPay Insights calculator, app, widget and paid reports.',
  alternates: { canonical: 'https://canpayinsights.ca/terms' },
  robots: { index: false },
};

export default function Terms() {
  return <TermsPage />;
}
