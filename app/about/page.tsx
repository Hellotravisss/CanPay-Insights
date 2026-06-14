import type { Metadata } from 'next';
import AboutPage from '../../components/AboutPage';

export const metadata: Metadata = {
  title: 'About CanPay Insights — Free Canadian Take-Home Pay Calculator',
  description:
    'CanPay Insights is a free, independent Canadian payroll calculator. Learn who builds it, how take-home pay is calculated (federal tax, provincial tax, CPP/CPP2, EI), and the data sources behind every number.',
  alternates: { canonical: 'https://canpayinsights.ca/about' },
  openGraph: {
    title: 'About CanPay Insights',
    description:
      'A free, independent Canadian take-home pay calculator — how our numbers are calculated and who builds it.',
    url: 'https://canpayinsights.ca/about',
  },
};

export default function About() {
  return <AboutPage />;
}
