import type { Metadata } from 'next';
import ProvinceComparisonClient from './ProvinceComparisonClient';

export const metadata: Metadata = {
  title: 'Compare Canadian Provinces — Tax & Salary 2026',
  description:
    'Compare take-home pay, tax rates, and salary benchmarks across all Canadian provinces side by side for 2026.',
  alternates: {
    canonical: 'https://canpayinsights.ca/compare-provinces',
  },
};

// 2026 take-home on an $80,000 salary, single employee, computed from the
// CanPay Insights rules engine. Sorted highest take-home first.
const COMPARISON_2026 = [
  { prov: 'Nunavut', net: '$62,001', mo: '$5,167', ded: '$17,999', rate: '22.5%' },
  { prov: 'British Columbia', net: '$61,038', mo: '$5,086', ded: '$18,962', rate: '23.7%' },
  { prov: 'Northwest Territories', net: '$60,871', mo: '$5,073', ded: '$19,129', rate: '23.9%' },
  { prov: 'Ontario', net: '$60,744', mo: '$5,062', ded: '$19,256', rate: '24.1%' },
  { prov: 'Yukon', net: '$60,648', mo: '$5,054', ded: '$19,352', rate: '24.2%' },
  { prov: 'Alberta', net: '$60,409', mo: '$5,034', ded: '$19,591', rate: '24.5%' },
  { prov: 'Saskatchewan', net: '$58,733', mo: '$4,894', ded: '$21,267', rate: '26.6%' },
  { prov: 'Manitoba', net: '$57,940', mo: '$4,828', ded: '$22,060', rate: '27.6%' },
  { prov: 'New Brunswick', net: '$57,933', mo: '$4,828', ded: '$22,067', rate: '27.6%' },
  { prov: 'Newfoundland and Labrador', net: '$57,533', mo: '$4,794', ded: '$22,467', rate: '28.1%' },
  { prov: 'Quebec', net: '$57,077', mo: '$4,756', ded: '$22,923', rate: '28.7%' },
  { prov: 'Prince Edward Island', net: '$56,999', mo: '$4,750', ded: '$23,001', rate: '28.8%' },
  { prov: 'Nova Scotia', net: '$56,095', mo: '$4,675', ded: '$23,905', rate: '29.9%' },
];

const compareFaq = [
  {
    question: 'Which Canadian province has the highest take-home pay in 2026?',
    answer:
      'On an $80,000 salary in 2026, Nunavut has the highest take-home pay at about $62,001 a year, followed by British Columbia (about $61,038) and the Northwest Territories (about $60,871). The territories and BC keep the most because of lower provincial and territorial tax rates.',
  },
  {
    question: 'Which province has the lowest take-home pay?',
    answer:
      'On the same $80,000 salary, Nova Scotia has the lowest take-home pay at about $56,095 a year, with Prince Edward Island (about $56,999) and Quebec (about $57,077) close behind. The gap between the highest and lowest province is nearly $5,900 a year for the same gross salary.',
  },
  {
    question: 'How much does take-home pay vary between provinces?',
    answer:
      'For an $80,000 salary in 2026, take-home pay ranges from about $56,095 (Nova Scotia) to $62,001 (Nunavut) — a spread of about $5,900 a year, or roughly $490 a month, on identical gross pay. Federal tax is the same everywhere; the difference is entirely provincial and territorial tax.',
  },
];

const compareJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: compareFaq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  },
];

export default function CompareProvincesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      <ProvinceComparisonClient />
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="mb-3 text-2xl font-bold text-slate-900">
            Take-home pay by province in 2026: an $80,000 salary compared
          </h2>
          <p className="mb-6 leading-7 text-slate-600">
            On an $80,000 salary in 2026, take-home pay ranges from about $56,095 a year in Nova
            Scotia to about $62,001 in Nunavut — a spread of nearly $5,900 a year, or about $490 a
            month, on the exact same gross salary. Federal tax is identical across Canada; the entire
            difference comes from provincial and territorial income tax. The table below ranks all 13
            provinces and territories by annual take-home pay (single employee, after federal and
            provincial tax, CPP/CPP2, and EI).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-slate-300 text-slate-900">
                  <th scope="col" className="py-2 pr-4 font-bold">Province / territory</th>
                  <th scope="col" className="py-2 pr-4 font-bold">Take-home (year)</th>
                  <th scope="col" className="py-2 pr-4 font-bold">Per month</th>
                  <th scope="col" className="py-2 pr-4 font-bold">Total deductions</th>
                  <th scope="col" className="py-2 font-bold">Deduction rate</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {COMPARISON_2026.map((row) => (
                  <tr key={row.prov} className="border-b border-slate-200 last:border-0">
                    <td className="py-2 pr-4 font-medium text-slate-800">{row.prov}</td>
                    <td className="py-2 pr-4">{row.net}</td>
                    <td className="py-2 pr-4">{row.mo}</td>
                    <td className="py-2 pr-4">{row.ded}</td>
                    <td className="py-2">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-400">
            2026 estimates for employment income, single with no additional credits, from the CanPay
            Insights rules engine using CRA and provincial/territorial rates. Use the interactive tool
            above to compare your own salary across provinces.
          </p>

          <h2 className="mb-5 mt-12 text-2xl font-bold text-slate-900">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {compareFaq.map((item) => (
              <div key={item.question}>
                <h3 className="mb-2 text-lg font-bold text-slate-900">{item.question}</h3>
                <p className="leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
