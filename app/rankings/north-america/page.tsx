import type { Metadata } from 'next';
import { Bodoni_Moda, JetBrains_Mono } from 'next/font/google';
import RankingPlate from '../../../components/ranking/RankingPlate';
import AvowdCredit from '../../../components/AvowdCredit';
import { DATA_PATH, ranking } from '../../../lib/naRanking';

const bodoni = Bodoni_Moda({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

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
    <div className={`${bodoni.variable} ${jetbrains.variable} min-h-screen`} style={{ background: '#FBF5E7', color: '#1A1408' }}>
      <article className="mx-auto max-w-4xl px-4 py-10">
        <a href="/" className="text-sm font-semibold underline-offset-4 hover:underline" style={{ color: '#A3271B' }}>← CanPay Insights</a>

        <header className="mt-10 border-b-2 pb-8" style={{ borderColor: '#1A1408' }}>
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-mono)', color: '#6E6043' }}>
            Ranking · {longDate(updated)}
          </p>
          <h1 className="mt-4 text-5xl leading-[1.02] md:text-7xl" style={{ fontFamily: 'var(--font-display), Didot, Georgia, serif' }}>
            Where a salary keeps the most
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7" style={{ color: '#4A3D22' }}>
            The same pay in 64 places: 13 Canadian, 51 American. Single, no dependants, paid every two weeks.
          </p>
        </header>

        <div className="mt-10">
          <RankingPlate tiers={tiers} medians={{ CA: medians.CA.rows, US: medians.US.rows }} />
        </div>

        <details className="mt-12 border-t pt-4" style={{ borderColor: '#1A1408' }}>
          <summary className="cursor-pointer text-2xl" style={{ fontFamily: 'var(--font-display), Didot, Georgia, serif' }}>How it is calculated</summary>
          <dl className="mt-4 space-y-4 text-sm leading-6" style={{ color: '#4A3D22' }}>
            <div><dt className="font-semibold" style={{ color: '#1A1408' }}>Canada</dt><dd>{method.canada}</dd></div>
            <div><dt className="font-semibold" style={{ color: '#1A1408' }}>United States</dt><dd>{method.us} Engine {engines.us.package} {engines.us.version}, commit {engines.us.commit}.</dd></div>
            <div><dt className="font-semibold" style={{ color: '#1A1408' }}>Withheld or owed</dt><dd>{method.basis}</dd></div>
            <div><dt className="font-semibold" style={{ color: '#1A1408' }}>Exchange rate</dt><dd>{method.fx}</dd></div>
            <div><dt className="font-semibold" style={{ color: '#1A1408' }}>Ranks</dt><dd>{method.ranks}</dd></div>
            <div><dt className="font-semibold" style={{ color: '#1A1408' }}>Not included</dt><dd>{ranking.persona} Health premiums, sales tax and cost of living are not in it.</dd></div>
          </dl>
        </details>

        <p className="mt-8 text-sm" style={{ color: '#4A3D22' }}>
          <a href={DATA_PATH} className="font-semibold underline underline-offset-4" style={{ color: '#A3271B' }}>Download every row (JSON)</a>
          {' '}· Free to reuse with credit to CanPay Insights (CC BY 4.0) · USD/CAD {fx.usdcad}
        </p>
      </article>
      {/* slate-500 fails AA on the cream stock; the plate's own dim ink passes. */}
      <footer className="mx-auto max-w-4xl px-4 pb-10 pt-6 text-center text-xs [&_a]:!text-[#6E6043]" style={{ color: '#6E6043' }} role="contentinfo">
        <p>© CanPay Insights · <AvowdCredit /></p>
      </footer>
    </div>
  );
}
