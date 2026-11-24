import type { Metadata } from 'next';
import RankingPlate from '../../../components/ranking/RankingPlate';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import { PageHero } from '../../../components/site/ui';
import { DATA_PATH, ranking } from '../../../lib/naRanking';

const URL = 'https://canpayinsights.ca/rankings/north-america';
const description =
  'Take-home pay in all 13 Canadian provinces and territories and all 50 US states plus DC, at five equal salaries. Two engines, checked against official tables; every row downloadable.';

// Not linked from anywhere yet, and kept out of the index until it is: the
// launch adds it to the sitemap, llms.txt, the a11y list and claims.json.
export const metadata: Metadata = {
  title: 'Take-Home Pay Across North America, 2026: 64 Places Ranked',
  description,
  alternates: { canonical: URL },
  robots: { index: false, follow: true },
  openGraph: { title: 'Where a salary keeps the most: 64 places ranked', description, url: URL, type: 'article' },
};

const longDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

export default function NorthAmericaRankingPage() {
  const { tiers, medians, method, fx, engines, updated } = ranking;
  return (
    <div className="min-h-screen bg-pearl">
      <SiteHeader lang="en" />
      <main className="mx-auto max-w-4xl px-4" role="main">
        <article>
          <PageHero
            eyebrow={<>Ranking · {longDate(updated)}</>}
            title="Where a salary keeps the most"
            lead="The same pay in 64 places: 13 Canadian, 51 American. Single, no dependants, paid every two weeks."
          />

          <RankingPlate tiers={tiers} medians={{ CA: medians.CA.rows, US: medians.US.rows }} />

          <details className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <summary className="cursor-pointer font-display text-2xl font-semibold text-ink">How it is calculated</summary>
            <dl className="mt-5 divide-y divide-line text-sm leading-6 text-ink-2">
              <div className="py-3 first:pt-0"><dt className="font-semibold text-ink">Canada</dt><dd>{method.canada}</dd></div>
              <div className="py-3"><dt className="font-semibold text-ink">United States</dt><dd>{method.us} Engine {engines.us.package} {engines.us.version}, commit {engines.us.commit}.</dd></div>
              <div className="py-3"><dt className="font-semibold text-ink">Withheld or owed</dt><dd>{method.basis}</dd></div>
              <div className="py-3"><dt className="font-semibold text-ink">Exchange rate</dt><dd>{method.fx}</dd></div>
              <div className="py-3"><dt className="font-semibold text-ink">Ranks</dt><dd>{method.ranks}</dd></div>
              <div className="py-3 last:pb-0"><dt className="font-semibold text-ink">Not included</dt><dd>{ranking.persona} Health premiums, sales tax and cost of living are not in it.</dd></div>
            </dl>
          </details>

          <p className="mb-16 mt-8 text-sm text-mute">
            <a href={DATA_PATH} className="font-semibold text-red-600 underline decoration-red-200 underline-offset-4 hover:decoration-red-600">Download every row (JSON)</a>
            {' '}· Free to reuse with credit to CanPay Insights (CC BY 4.0) · USD/CAD <span className="tabular-nums">{fx.usdcad}</span>
          </p>
        </article>
      </main>
      <SiteFooter lang="en" />
    </div>
  );
}
