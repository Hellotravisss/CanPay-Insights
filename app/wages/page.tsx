import type { Metadata } from 'next';
import {
  PROVINCIAL_WAGES,
  PROVINCE_LABELS,
  INDUSTRY_LABELS,
  WAGE_DATA_YEAR,
  annualFromHourly,
} from '../../lib/provincialWages';
import { WageHeader, WageFooter } from './WageChrome';

export const metadata: Metadata = {
  title: `Canadian Wages by Industry and Province ${WAGE_DATA_YEAR} — With Take-Home Pay`,
  description: `Median full-time wages for 17 industries across every Canadian province, from Statistics Canada — plus what each one leaves after federal tax, provincial tax, CPP and EI.`,
  alternates: { canonical: 'https://canpayinsights.ca/wages' },
};

const PROVINCE_SLUGS: Record<string, string> = {
  ON: 'ontario', QC: 'quebec', BC: 'british-columbia', AB: 'alberta',
  MB: 'manitoba', SK: 'saskatchewan', NS: 'nova-scotia', NB: 'new-brunswick',
  NL: 'newfoundland-and-labrador', PE: 'prince-edward-island',
};

export default function WagesIndex() {
  const industries = Object.keys(PROVINCIAL_WAGES);
  const national = industries
    .map((i) => ({ slug: i, hourly: PROVINCIAL_WAGES[i].CA }))
    .filter((r) => r.hourly)
    .sort((a, b) => b.hourly - a.hourly);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <WageHeader />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">
          Statistics Canada {WAGE_DATA_YEAR}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
          Canadian wages by industry and province
        </h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-slate-700">
          Statistics Canada publishes what each industry pays. It does not tell you what you keep.
          These pages put the two together: the official median wage for {industries.length}{' '}
          industries in every province, and the take-home pay it produces under the 2026 tax rules.
        </p>

        <h2 className="mt-10 text-xl font-bold text-slate-900">
          Median full-time wage by industry, Canada ({WAGE_DATA_YEAR})
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-300 text-slate-900">
                <th className="py-2 pr-4 font-bold">Industry</th>
                <th className="py-2 pr-4 font-bold">Median wage</th>
                <th className="py-2 font-bold">≈ Annual, full-time</th>
              </tr>
            </thead>
            <tbody className="text-slate-600">
              {national.map((r) => (
                <tr key={r.slug} className="border-b border-slate-200">
                  <td className="py-2.5 pr-4 font-medium text-slate-800">{INDUSTRY_LABELS[r.slug]}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 shrink-0 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-red-600"
                          style={{ width: `${Math.round((r.hourly / national[0].hourly) * 100)}%` }}
                        />
                      </div>
                      <span className="tabular-nums">${r.hourly.toFixed(2)}/hr</span>
                    </div>
                  </td>
                  <td className="py-2.5 tabular-nums">${annualFromHourly(r.hourly).toLocaleString('en-CA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-xl font-bold text-slate-900">Pick an industry and province</h2>
        <div className="mt-4 space-y-6">
          {national.map((r) => (
            <div key={r.slug}>
              <h3 className="mb-2 text-sm font-bold text-slate-700">{INDUSTRY_LABELS[r.slug]}</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PROVINCE_SLUGS)
                  .filter(([code]) => PROVINCIAL_WAGES[r.slug]?.[code])
                  .map(([code, pslug]) => (
                    <a
                      key={code}
                      href={`/wages/${r.slug}-wages-${pslug}`}
                      className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-100"
                    >
                      {PROVINCE_LABELS[code]}
                    </a>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs leading-5 text-slate-400">
          Source: Statistics Canada, Table 14-10-0064-01, “Employee wages by industry, annual”, median
          hourly wage of full-time employees, {WAGE_DATA_YEAR}. Annualised at 2,080 hours. Take-home
          figures on each page are computed with the CanPay Insights 2026 tax engine. The three
          territories are not published separately in this table.
        </p>
      </main>
      <WageFooter />
    </div>
  );
}
