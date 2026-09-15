import type { Metadata } from 'next';
import RefundPolicyPage from '../../components/RefundPolicyPage';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'When and how CanPay Insights refunds its paid reports.',
  alternates: { canonical: 'https://canpayinsights.ca/refunds' },
  robots: { index: false },
};

export default function Refunds() {
  return <RefundPolicyPage />;
}
