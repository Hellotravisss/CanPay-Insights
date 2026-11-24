'use client';
import React from 'react';
import DataPulse from './DataPulse';
import { DATASET_VERSION } from '../lib/datasetVersion';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import SiteHeader from './site/SiteHeader';
import SiteFooter from './site/SiteFooter';
import { PageHero, Card, Eyebrow, Stat } from './site/ui';

// Illustrative slice of the full 455-row dataset (net take-home at $80,000, 2026).
// Computed by the engine, not typed: no gate can check a figure typed into a table
// whose salary appears only in a comment (review 2026-10-26).
const PREVIEW_SALARY = 80000;
const PREVIEW = (['bc', 'alberta', 'ontario', 'quebec'] as const).map((slug) => ({
  prov: PROVINCE_SEO_CONFIGS.find((p) => p.slug === slug)!.name,
  net: '$' + Math.round(getSalaryFigures(PREVIEW_SALARY, slug).netAnnual).toLocaleString('en-CA'),
}));

const LINK = 'font-medium text-red-600 underline decoration-red-200 underline-offset-4 transition-colors hover:decoration-red-600';
const BTN_PRIMARY = 'btn-brand-3d inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white no-underline';
const BTN_SECONDARY = 'inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink no-underline transition-colors hover:border-ink-5';
const H2 = 'font-display text-2xl font-semibold leading-tight text-ink';
const SUMMARY = 'cursor-pointer font-semibold text-ink marker:text-ink-4';

const DataPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-pearl font-sans">
      <SiteHeader lang="en" current="data" />

      <main className="mx-auto max-w-5xl px-4" role="main">
        <PageHero
          title="Open dataset: Canadian take-home pay 2026"
          lead={<>Net pay, federal &amp; provincial tax, CPP/CPP2, and EI for every province and territory — free to download and cite under CC BY 4.0.</>}
        />

        <DataPulse />

        {/* Two datasets, side by side: computed (anyone could rebuild it from the
            rates) and observed (nobody else has it). Same sentences as before —
            they are registered claims — only the layout changed (2026-10-16). */}
        <div className="mb-10 grid gap-5 md:grid-cols-2">
          <Card as="section" className="flex flex-col p-6">
            <Eyebrow>Free · CC BY 4.0</Eyebrow>
            <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-ink">Take-home pay, every province</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-ink-3">
              We compute take-home pay for <strong className="text-ink">13 provinces and territories × 35 income levels ($30,000–$200,000) =
              455 rows</strong> straight from our open 2026 calculation engine, and publish the full result as a
              machine-readable dataset. Journalists, bloggers, and researchers are welcome to use it.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/data/canpay-take-home-2026.csv" download className={BTN_PRIMARY}>Download CSV</a>
              <a href="/data/canpay-take-home-2026.json" download className={BTN_SECONDARY}>Download JSON</a>
            </div>
          </Card>

          {/* The second dataset. The one on the left is computed from published
              tax rates — reproducible by anyone with the rates. This one is
              observed, and nobody else has it. */}
          <Card as="section" className="flex flex-col p-6">
            <Eyebrow>Free for research · CC BY-NC-SA 4.0</Eyebrow>
            <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-ink">Second dataset: what Canadians actually check</h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-ink-3">
              <strong className="text-ink">These are people who went looking for a pay
              calculator, not a random sample of Canadians</strong> — the file carries that warning
              and the rest of the method inside it, so it stays attached to the data after
              download.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="/data/usage.json" className={BTN_SECONDARY}>Open usage dataset (JSON, CC BY-NC-SA 4.0)</a>
            </div>
            <p className="mt-3 text-xs leading-5 text-mute">
              Updated hourly · <code className="break-all rounded-md border border-line bg-pearl-soft px-1.5 py-0.5 font-mono text-ink-2">GET
              canpayinsights.ca/data/usage.json</code> · CORS open
            </p>
            <details className="mt-4 border-t border-line pt-3 text-sm text-ink-3">
              <summary className={SUMMARY}>What it records, and what it never does</summary>
              <p className="mt-2 leading-6">
                Anonymous aggregates from the calculator itself — which income ranges people check,
                from which province, on which weekday and at what hour of their own evening, and,
                where a visitor chose to give it, from which postal-code area. Income is recorded
                only as a range, never an amount; location is a city centre from the connection or a
                postal-code prefix the visitor typed or a position rounded on their own device. Small
                cells are withheld rather than shown (twenty people for any postal-area figure), and
                the file says how many were withheld so you can see what is missing.
              </p>
              <p className="mt-2 text-xs leading-5 text-mute">
                Free for research, journalism and personal use under{' '}
                <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer" className={LINK}>CC BY-NC-SA 4.0</a>.
                Commercial use needs a licence — see below.
              </p>
            </details>
          </Card>
        </div>

        {/* The paid tier. Ookla gives its measurements away as coarse open
            tiles and sells the fine-grained version; the free file is the proof
            that the paid one exists. Only claims the data can back today. */}
        <Card as="section" id="licensing" className="mb-10 scroll-mt-24 p-6 md:p-8">
          <h2 className={`${H2} mb-2`}>Licensed data for organisations</h2>
          <p className="mb-5 max-w-2xl text-sm leading-6 text-ink-3">
            The open file is the coarse view. Under licence we provide extracts that no public
            statistic carries, because they come from what people do at the moment they check
            their pay:
          </p>
          <ul className="mb-6 grid list-none gap-x-8 border-t border-line p-0 sm:grid-cols-2">
            {[
              ['Neighbourhood demand', 'calculations by postal-code area (FSA) and income range, month by month.'],
              ['Relocation intent', 'which province pairs people compare in one visit, and at what income.'],
              ['Observed pay changes', 'direction and size of real raises and cuts, from people who reopen a saved calculation.'],
              ['Work patterns', 'shift hours, unpaid breaks, overtime and tips by province and sector.'],
            ].map(([t, d]) => (
              <li key={t} className="border-b border-line py-3 text-sm leading-6 text-ink-3">
                <strong className="text-ink">{t}</strong> — {d}
              </li>
            ))}
            <li className="border-b border-dashed border-ink-5 py-3 text-sm leading-6 text-mute sm:col-span-2">
              <strong className="text-ink-2">Expectation gap</strong> (still building; not yet large enough to license) — who finds their take-home lower than they thought, by province and income.
            </li>
          </ul>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[['CA$250', 'monthly feed', '/month'], ['CA$750', 'one custom extract', ''], ['CA$2,400', 'annual research licence', '']].map(([p, l, u]) => (
              <Stat
                key={l}
                label={l}
                value={<>{p}<span className="ml-0.5 font-sans text-xs font-normal text-mute">{u}</span></>}
                className="bg-pearl-soft"
              />
            ))}
          </div>
          <p className="sr-only">
            <strong>Prices from:</strong> monthly feed CA$250/month · one custom extract CA$750 · annual research licence CA$2,400.
          </p>

          <p className="mb-5 text-sm leading-6 text-ink-3">
            <strong className="text-ink">Free sample, September 2026:</strong>{' '}
            <a href="/data/sample/2026-09_volume_by_province_income_paytype.csv" className={LINK}>volume</a> ·{' '}
            <a href="/data/sample/2026-09_province_language.csv" className={LINK}>language</a> ·{' '}
            <a href="/data/sample/2026-09_monthly_indicators.csv" className={LINK}>monthly indicators</a> ·{' '}
            <a href="/data/sample/README.txt" className={LINK}>field guide</a>
          </p>
          <a href="mailto:info@canpayinsights.ca?subject=Data%20licence" className={BTN_PRIMARY}>
            Ask about a licence
          </a>

          <details className="mt-6 border-t border-line pt-4 text-sm text-ink-3">
            <summary className={SUMMARY}>Who uses which, and the privacy rules</summary>
            <p className="mt-2 leading-6">
              Who it is for: <strong className="text-ink">recruiters and compensation-data teams</strong>,
              the pay ranges people actually test and the expectation gap;{' '}
              <strong className="text-ink">lenders and mortgage teams</strong>, neighbourhood demand by income;{' '}
              <strong className="text-ink">real-estate and relocation firms</strong>, the province pairs people
              compare; <strong className="text-ink">immigration consultants and settlement agencies</strong>,
              demand by interface language and province;{' '}
              <strong className="text-ink">payroll and scheduling software</strong>, work patterns by sector.
            </p>
            <p className="mt-2 text-xs leading-5 text-mute">
              Always aggregates, never individual records. Any figure for a postal-code area needs at
              least twenty people behind it; smaller cells are withheld. The sample is people who used
              the calculator, not a random sample of Canadians, and every extract says so. Licensees
              agree not to attempt re-identification or resale.
            </p>
          </details>
        </Card>

        <Card as="details" className="mb-10 p-6 md:p-8">
          <summary className="cursor-pointer font-display text-xl font-semibold text-ink marker:text-ink-4">Preview and methodology — take-home dataset</summary>
          <h2 className="mb-3 mt-6 font-display text-lg font-semibold text-ink">Preview — take-home on an $80,000 salary (2026)</h2>
          <div className="mb-3 overflow-hidden rounded-xl border border-line">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-line bg-pearl-soft">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Province / territory</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Net take-home (annual)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PREVIEW.map((row) => (
                  <tr key={row.prov}>
                    <td className="px-4 py-3 text-sm font-medium text-ink">{row.prov}</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-red-600">{row.net}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mb-8 text-sm text-mute">
            The full download covers all 13 jurisdictions across $30,000–$200,000 — this is one slice.
          </p>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Methodology</h2>
          <p className="mb-3 text-sm leading-6 text-ink-3">
            Figures are verified against published 2026 rates from the Canada Revenue Agency (CRA), Revenu Québec, and
            each provincial government, and apply:
          </p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-ink-3 marker:text-ink-5">
            <li>Federal income tax — lowest bracket cut to 14% for 2026 — plus each province/territory&apos;s own brackets.</li>
            <li>CPP at 5.95% to the YMPE (~$74,600) and CPP2 (extra 4%) to the YAMPE (~$85,000); QPP/QPIP for Quebec.</li>
            <li>EI at 1.63% to the maximum insurable earnings ($68,900); Quebec uses the lower 1.30% rate.</li>
            <li>The basic personal amount only (no other credits or deductions), so figures are a clean, comparable baseline.</li>
          </ul>
        </Card>

        <section>
          <h2 className={`${H2} mb-4`}>Cite this dataset</h2>
          <div className="mb-6 rounded-2xl border border-line bg-white p-5 md:p-6" style={{ boxShadow: 'inset 3px 0 0 #15171C' }}>
            <p className="text-sm leading-6 text-ink-2">
              CanPay Insights, <em>Canadian Take-Home Pay &amp; Payroll Deductions 2026</em> (open dataset), Vancouver,
              Canada. Version {DATASET_VERSION} (2026 tax year). Licensed under{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className={LINK}>CC BY 4.0</a>.
              Retrieved from canpayinsights.ca/data.
            </p>
          </div>

          {/* A citable dataset with no version and no stated update policy
              cannot be cited responsibly — the reader has no way to say WHICH
              figures they used. Both are real commitments here, not
              aspirations: a scheduled quarterly job re-checks every rate
              against the CRA and provincial sources, and the site's build
              refuses to complete while any published figure disagrees with
              the engine. */}
          <Card className="mb-6 p-5 md:p-6">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
              Version and updates
            </h3>
            <ul className="divide-y divide-line text-sm leading-6 text-ink-3">
              <li className="py-2.5 first:pt-0">
                <strong className="text-ink">Current version:</strong> {DATASET_VERSION}, covering the 2026
                tax year. Cite the version — figures change when rates do.
              </li>
              <li className="py-2.5">
                <strong className="text-ink">Re-checked quarterly</strong> (January, April,
                July, November) against the CRA, Revenu Québec and each provincial government,
                and regenerated whenever the engine is corrected in between. January is when a
                new tax year&apos;s rates take effect, and a new version is published then.
              </li>
              <li className="py-2.5">
                <strong className="text-ink">Every figure is machine-checked.</strong> A
                build of this site fails if any published number — in this dataset, in an article,
                or on any page — disagrees with the tax engine that computes it. Nothing stale can
                reach the site without the deployment breaking first.
              </li>
              <li className="py-2.5 last:pb-0">
                <strong className="text-ink">Corrections</strong> are made in place and the
                version date moves. Email info@canpayinsights.ca if you find one; superseded
                figures can be supplied on request.
              </li>
            </ul>
          </Card>
          <p className="leading-7 text-ink-2">
            You&apos;re free to share and adapt the data, including commercially, with attribution and a link to{' '}
            <a href="https://canpayinsights.ca" className={LINK}>canpayinsights.ca</a>.
            Need a custom cut (a specific province, income range, or pay frequency)? Email{' '}
            <a href="mailto:info@canpayinsights.ca" className={LINK}>info@canpayinsights.ca</a>.
          </p>
        </section>
      </main>

      <SiteFooter lang="en" note="Figures are estimates based on 2026 tax brackets and a basic-personal-amount baseline." />
    </div>
  );
};

export default DataPage;
