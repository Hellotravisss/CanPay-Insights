import type { Metadata } from 'next';
import AffiliateDisclosurePage from '../../components/AffiliateDisclosurePage';

export const metadata: Metadata = {
  title: 'Affiliate & Referral Disclosure',
  description:
    'How CanPay Insights stays free: we sometimes use clearly labelled referral links (such as Wealthsimple) and may earn a sign-up bonus at no extra cost to you. It never affects our calculator or recommendations.',
  alternates: { canonical: 'https://canpayinsights.ca/affiliate-disclosure' },
  openGraph: {
    title: 'Affiliate & Referral Disclosure — CanPay Insights',
    description: 'Clearly labelled referral links, no cost to you, and never affecting our numbers.',
    url: 'https://canpayinsights.ca/affiliate-disclosure',
  },
};

export default function AffiliateDisclosure() {
  return <AffiliateDisclosurePage />;
}
