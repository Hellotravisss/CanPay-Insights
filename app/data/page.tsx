import type { Metadata } from 'next';
import DataPage from '../../components/DataPage';

export const metadata: Metadata = {
  title: 'Open Dataset: Canadian Take-Home Pay 2026 (CSV + JSON, CC BY)',
  description:
    'Free, downloadable 2026 Canadian take-home pay dataset — net pay, federal & provincial tax, CPP/CPP2, EI for all 13 provinces/territories across $30k–$200k (455 rows). CSV + JSON, CC BY 4.0, free to cite.',
  alternates: { canonical: 'https://canpayinsights.ca/data' },
  openGraph: {
    title: 'Open Dataset: Canadian Take-Home Pay 2026',
    description:
      'Net pay, tax, CPP/CPP2 and EI for every province/territory across $30k–$200k. CSV + JSON, free to cite under CC BY 4.0.',
    url: 'https://canpayinsights.ca/data',
  },
};

export default function Data() {
  return <DataPage />;
}
