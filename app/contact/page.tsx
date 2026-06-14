import type { Metadata } from 'next';
import ContactPage from '../../components/ContactPage';

export const metadata: Metadata = {
  title: 'Contact CanPay Insights',
  description:
    'Contact CanPay Insights — questions, corrections, custom data requests, and media enquiries. Email info@canpayinsights.ca. Built by an independent developer in Vancouver, Canada.',
  alternates: { canonical: 'https://canpayinsights.ca/contact' },
  openGraph: {
    title: 'Contact CanPay Insights',
    description: 'Questions, corrections, data requests, or press — reach us at info@canpayinsights.ca.',
    url: 'https://canpayinsights.ca/contact',
  },
};

export default function Contact() {
  return <ContactPage />;
}
