import type { Metadata } from 'next';
import App from '../App';
import SiteFooter from '../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Canadian Payroll & Take-Home Pay Calculator 2026 – Paycheck After Tax',
  description:
    // 2026-09-26: "payroll calculator" had ~10,500 impressions a fortnight at
    // position ~8 but a 0.2% click rate. Searchers are often employers working
    // out deductions, so the snippet now speaks to them too. Review the click
    // rate for that query on 2026-10-10 against the GSC archive.
    'Free Canadian payroll calculator: CPP, EI and federal & provincial income tax deductions per pay period for any province, and the take-home pay that is left. 2026 rates, salary or hourly. No signup.',
  alternates: {
    canonical: 'https://canpayinsights.ca/',
  },
  openGraph: {
    title: 'Canadian Payroll & Take-Home Pay Calculator 2026 – Paycheck After Tax',
    description: 'How much do you really keep from your paycheck? Free Canadian take-home pay & income tax calculator for employees — CPP, EI, provincial tax, salary or hourly.',
    url: 'https://canpayinsights.ca/',
  },
};

export default function HomePage() {
  return (
    <>
      <App />
      <SiteFooter note="Calculations are estimates based on 2025/2026 tax brackets and provincial employment standards." />
    </>
  );
}
