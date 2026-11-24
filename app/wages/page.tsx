import type { Metadata } from 'next';
import {
  PROVINCIAL_WAGES,
  PROVINCE_LABELS,
  INDUSTRY_LABELS,
  WAGE_DATA_YEAR,
  annualFromHourly,
} from '../../lib/provincialWages';
import { WageHeader, WageFooter, chipClass } from './WageChrome';
import { PageHero, Card } from '@/components/site/ui';

export const metadata: Metadata = {
  title: `Canadian Wages by Industry and Province (${WAGE_DATA_YEAR} data) — Take-Home Pay at 2026 Rates`,
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
    <div className="min-h-screen bg-pearl font-sans">
      <WageHeader />
      <main className="mx-auto max-w-4xl px-4 pb-16" role="main">
        <PageHero
          eyebrow={<>Statistics Canada {WAGE_DATA_YEAR}</>}
          title="Canadian wages by industry and province"
          lead={
            <>
              Statistics Canada publishes what each industry pays. It does not tell you what you keep.
              These pages put the two together: the official median wage for {industries.length}{' '}
              industries in every province, and the take-home pay it produces under the 2026 tax rules.
            </>
          }
        />

        <h2 className="font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">
          Median full-time wage by industry, Canada ({WAGE_DATA_YEAR})
        </h2>
        <Card className="pc mt-6 overflow-x-auto px-4 py-2 sm:px-6">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-ink-5 text-[11px] uppercase tracking-[0.12em] text-mute">
                <th scope="col" className="py-3 pr-4 font-semibold">Industry</th>
                <th scope="col" className="py-3 pr-4 text-right font-semibold">Median wage</th>
                <th scope="col" className="py-3 text-right font-semibold">≈ Annual, full-time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-ink-2">
              {national.map((r, i) => (
                <tr key={r.slug}>
                  <td className="py-3 pr-4 font-medium text-ink">{INDUSTRY_LABELS[r.slug]}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center justify-end gap-3">
                      <div className="hidden h-1.5 w-24 shrink-0 rounded-full bg-pearl sm:block" aria-hidden="true">
                        <div
                          className="pm-x h-1.5 rounded-full bg-ink-2"
                          style={{ width: `${Math.round((r.hourly / national[0].hourly) * 100)}%`, ['--i' as string]: Math.min(i, 16) }}
                        />
                      </div>
                      <span className="whitespace-nowrap tabular-nums">${r.hourly.toFixed(2)}/hr</span>
                    </div>
                  </td>
                  <td className="py-3 text-right tabular-nums">${annualFromHourly(r.hourly).toLocaleString('en-CA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <h2 className="mt-14 font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">Pick an industry and province</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {national.map((r) => (
            <div key={r.slug} className="py-4">
              <h3 className="mb-3 text-sm font-semibold text-ink">{INDUSTRY_LABELS[r.slug]}</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PROVINCE_SLUGS)
                  .filter(([code]) => PROVINCIAL_WAGES[r.slug]?.[code])
                  .map(([code, pslug]) => (
                    <a
                      key={code}
                      href={`/wages/${r.slug}-wages-${pslug}`}
                      className={chipClass}
                    >
                      {PROVINCE_LABELS[code]}
                    </a>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl text-xs leading-5 text-mute">
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
