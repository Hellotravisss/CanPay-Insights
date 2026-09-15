import type { Metadata } from 'next';
import PrivacyPolicyClient from './PrivacyPolicyClient';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'CanPay Insights privacy policy — how we collect, use, and protect your data.',
  alternates: { canonical: 'https://canpayinsights.ca/privacy', languages: { en: 'https://canpayinsights.ca/privacy', 'fr-CA': 'https://canpayinsights.ca/fr/confidentialite' } },
  robots: { index: false },
};

export default function PrivacyPage() {
  return <PrivacyPolicyClient />;
}
