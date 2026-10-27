import type { Metadata } from 'next';
import EmployerPayrollCalculator from '../../components/EmployerPayrollCalculator';
import {
  TAX_YEAR, CPP_EXEMPTION, CPP_RATE, CPP2_RATE, CPP_MAX_CONTRIBUTION, CPP2_MAX_CONTRIBUTION, CPP_MAX_PENSIONABLE_EARNINGS,
  CPP2_MAX_PENSIONABLE_EARNINGS, EI_RATE, EI_MAX_CONTRIBUTION, EI_MAX_INSURABLE_EARNINGS, EI_EMPLOYER_MULTIPLIER,
} from '../../constants';

/**
 * The employer's payroll calculator (2026-10-26). "payroll calculator" drew
 * 20,834 impressions in four weeks at position 8, with a 0.3% click rate: the
 * people searching it run payroll (the results above us are PDOC, ADP,
 * QuickBooks), and every page we had answered an employee's question instead.
 * Every figure in the copy below comes from constants.ts.
 */
const URL = 'https://canpayinsights.ca/payroll-calculator';
const $ = (n: number, d = 0) => '$' + n.toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d });
const pct = (r: number) => `${+(r * 100).toFixed(3)}%`;

const TITLE = `Payroll Calculator Canada ${TAX_YEAR} for Employers: Deductions, Remittance and Cost`;
const DESCRIPTION = `What to withhold from an employee's pay, what you add as the employer (CPP match, EI × ${EI_EMPLOYER_MULTIPLIER}), and what to remit — every province, ${TAX_YEAR} rates, from an engine that reproduces the CRA's payroll tables.`;

const FAQ = [
  {
    q: 'How much does an employer pay on top of salary in Canada?',
    a: `You match the employee's CPP dollar for dollar (${pct(CPP_RATE)} of pensionable earnings above the ${$(CPP_EXEMPTION)} exemption, up to ${$(CPP_MAX_CONTRIBUTION, 2)} in ${TAX_YEAR}), plus CPP2 (${pct(CPP2_RATE)} between ${$(CPP_MAX_PENSIONABLE_EARNINGS)} and ${$(CPP2_MAX_PENSIONABLE_EARNINGS)}, up to ${$(CPP2_MAX_CONTRIBUTION, 2)}), and you pay ${EI_EMPLOYER_MULTIPLIER} times the employee's EI premium (${pct(EI_RATE * EI_EMPLOYER_MULTIPLIER)} up to ${$(EI_MAX_CONTRIBUTION * EI_EMPLOYER_MULTIPLIER, 2)}). In Quebec it is QPP instead of CPP, a lower EI rate, and QPIP. Provincial employer health taxes and workers' compensation come on top and are not included here.`,
  },
  {
    q: 'When do I stop deducting CPP and EI?',
    a: `When the employee's contributions for the year reach the maximum: ${$(CPP_MAX_CONTRIBUTION, 2)} CPP, ${$(CPP2_MAX_CONTRIBUTION, 2)} CPP2 and ${$(EI_MAX_CONTRIBUTION, 2)} EI (insurable earnings ${$(EI_MAX_INSURABLE_EARNINGS)}) in ${TAX_YEAR}. Your matching stops on the same pay. The calculator shows which pay that is.`,
  },
  {
    q: 'Is this the same as the CRA Payroll Deductions Online Calculator (PDOC)?',
    a: 'It uses the same method for a regular pay early in the year, and its income tax comes from an engine that reproduces the CRA T4032 payroll tables row by row. Use PDOC when an employee has TD1 claims above the basic amounts, a bonus or retroactive pay, or contributions already made with another employer this year.',
  },
  {
    q: 'Where does the money go in Quebec?',
    a: 'Federal income tax and EI go to the CRA. Quebec income tax, QPP and QPIP — the employee and employer shares — go to Revenu Québec, which also collects the Health Services Fund and other employer contributions not included here.',
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'website', images: [{ url: '/og-image.png', width: 1200, height: 630 }] },
};

export default function PayrollCalculatorPage() {
  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Canadian Payroll Calculator for Employers',
      url: URL, applicationCategory: 'FinanceApplication', operatingSystem: 'Web Browser', inLanguage: 'en-CA',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CAD' },
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ];
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
          <a href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-red-600 no-underline">
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg" />
            CanPay Insights
          </a>
          <p className="mb-3 text-sm font-bold uppercase tracking-wide text-red-700">For employers · {TAX_YEAR}</p>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Canadian Payroll Calculator</h1>
          <p className="mb-8 max-w-2xl text-lg leading-8 text-slate-600">
            What to withhold from an employee&apos;s pay, what you add as the employer, and what to remit.
            Income tax comes from an engine that reproduces the CRA&apos;s T4032 payroll tables row by row.
          </p>
          <EmployerPayrollCalculator />
          <p className="mt-4 text-sm text-slate-600">
            Paying yourself or checking your own pay? Use the{' '}
            <a href="/" className="font-semibold text-red-700">take-home pay calculator</a>.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="mb-4 text-2xl font-bold text-slate-950">Questions employers ask</h2>
        <div className="space-y-3">
          {FAQ.map((f) => (
            <details key={f.q} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-semibold text-slate-900">{f.q}</summary>
              <p className="mt-2 leading-7 text-slate-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  );
}
