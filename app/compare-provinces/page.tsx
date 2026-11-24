import type { Metadata } from 'next';
import ProvinceComparisonClient from './ProvinceComparisonClient';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

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
  { prov: 'Nunavut', net: '$62,299', mo: '$5,192', ded: '$17,701', rate: '22.1%' },
  { prov: 'Northwest Territories', net: '$61,166', mo: '$5,097', ded: '$18,834', rate: '23.5%' },
  { prov: 'British Columbia', net: '$61,157', mo: '$5,096', ded: '$18,843', rate: '23.6%' },
  { prov: 'Yukon', net: '$61,039', mo: '$5,087', ded: '$18,961', rate: '23.7%' },
  { prov: 'Alberta', net: '$60,698', mo: '$5,058', ded: '$19,302', rate: '24.1%' },
  { prov: 'Ontario', net: '$60,303', mo: '$5,025', ded: '$19,697', rate: '24.6%' },
  { prov: 'Saskatchewan', net: '$59,022', mo: '$4,918', ded: '$20,978', rate: '26.2%' },
  { prov: 'New Brunswick', net: '$58,246', mo: '$4,854', ded: '$21,754', rate: '27.2%' },
  { prov: 'Manitoba', net: '$58,228', mo: '$4,852', ded: '$21,772', rate: '27.2%' },
  { prov: 'Newfoundland and Labrador', net: '$57,857', mo: '$4,821', ded: '$22,143', rate: '27.7%' },
  { prov: 'Quebec', net: '$57,012', mo: '$4,751', ded: '$22,988', rate: '28.7%' },
  { prov: 'Prince Edward Island', net: '$57,335', mo: '$4,778', ded: '$22,665', rate: '28.3%' },
  { prov: 'Nova Scotia', net: '$56,439', mo: '$4,703', ded: '$23,561', rate: '29.5%' },
];

const compareFaq = [
  {
    question: 'Which Canadian province has the highest take-home pay in 2026?',
    answer:
      'On an $80,000 salary in 2026, Nunavut has the highest take-home pay at about $62,299 a year, followed by the Northwest Territories (about $61,166) and British Columbia (about $61,157) — nine dollars apart. The territories and BC keep the most because of lower provincial and territorial tax rates.',
  },
  {
    question: 'Which province has the lowest take-home pay?',
    answer:
      'On the same $80,000 salary, Nova Scotia has the lowest take-home pay at about $56,439 a year, with Prince Edward Island (about $57,335) and Quebec (about $57,012) close behind. The gap between the highest and lowest province is nearly $5,900 a year for the same gross salary.',
  },
  {
    question: 'How much does take-home pay vary between provinces?',
    answer:
      'For an $80,000 salary in 2026, take-home pay ranges from about $56,439 (Nova Scotia) to $62,299 (Nunavut) — a spread of about $5,900 a year, or roughly $490 a month, on identical gross pay. Federal tax is the same everywhere; the difference is entirely provincial and territorial tax.',
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
    <div className="min-h-screen bg-pearl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compareJsonLd) }}
      />
      <SiteHeader lang="en" current="compare" />
      <main className="mx-auto max-w-6xl px-4" role="main">
        <ProvinceComparisonClient />
        <section className="border-t border-line py-12 md:py-16">
          <div className="max-w-3xl">
            <h2 className="mb-3 font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">
              Take-home pay by province in 2026: an $80,000 salary compared
            </h2>
            <p className="mb-6 leading-7 text-ink-2">
              On an $80,000 salary in 2026, take-home pay ranges from about $56,439 a year in Nova
              Scotia to about $62,299 in Nunavut — a spread of nearly $5,900 a year, or about $490 a
              month, on the exact same gross salary. Federal tax is identical across Canada; the entire
              difference comes from provincial and territorial income tax. The table below ranks all 13
              provinces and territories by annual take-home pay (single employee, after federal and
              provincial tax, CPP/CPP2, and EI).
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full border-collapse text-left text-sm tabular-nums">
              <thead>
                <tr className="border-b border-line bg-pearl-soft text-[11px] uppercase tracking-[0.1em] text-mute">
                  <th scope="col" className="px-4 py-3 font-semibold">Province / territory</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Take-home (year)</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Per month</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Total deductions</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Deduction rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-ink-2">
                {COMPARISON_2026.map((row) => (
                  <tr key={row.prov}>
                    <td className="px-4 py-3 font-medium text-ink">{row.prov}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">{row.net}</td>
                    <td className="px-4 py-3 text-right text-ink">{row.mo}</td>
                    <td className="px-4 py-3 text-right">{row.ded}</td>
                    <td className="px-4 py-3 text-right">{row.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-xs leading-5 text-mute">
            2026 estimates for employment income, single with no additional credits, from the CanPay
            Insights rules engine using CRA and provincial/territorial rates. Use the interactive tool
            above to compare your own salary across provinces.
          </p>

          <h2 className="mb-6 mt-14 font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">
            Frequently asked questions
          </h2>
          <div className="max-w-3xl divide-y divide-line border-y border-line">
            {compareFaq.map((item) => (
              <div key={item.question} className="py-6">
                <h3 className="mb-2 text-lg font-semibold text-ink">{item.question}</h3>
                <p className="leading-7 text-ink-2">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter lang="en" />
    </div>
  );
}
