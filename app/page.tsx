import type { Metadata } from 'next';
import App from '../App';

export const metadata: Metadata = {
  title: 'Free Canadian Payroll Calculator 2025/2026 - CPP, EI & Take-Home Pay',
  description:
    'Calculate Canadian take-home pay by province with federal tax, provincial tax, CPP, EI, hourly wage, annual salary, overtime, and timesheet tools.',
  alternates: {
    canonical: 'https://canpayinsights.ca/',
  },
  openGraph: {
    title: 'Free Canadian Payroll Calculator 2025/2026',
    description: 'Calculate Canadian take-home pay by province with CPP, EI, income tax, salary, hourly wage, and timesheet tools.',
    url: 'https://canpayinsights.ca/',
  },
};

export default function HomePage() {
  return <App />;
}
