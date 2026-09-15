import type { Metadata } from 'next';
import PrivacyPolicyFr from '../../../components/PrivacyPolicyFr';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité de CanPay Insights — ce que nous recueillons, pourquoi, et comment refuser.',
  alternates: { canonical: 'https://canpayinsights.ca/fr/confidentialite', languages: { en: 'https://canpayinsights.ca/privacy', 'fr-CA': 'https://canpayinsights.ca/fr/confidentialite' } },
  robots: { index: false },
};

export default function Confidentialite() {
  return <PrivacyPolicyFr />;
}
