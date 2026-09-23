import type { Metadata } from 'next';
import { payBehaviour } from '../../../lib/payBehaviour';
import AvowdCredit from '../../../components/AvowdCredit';

/**
 * Rendered from D1 on every request. It was `revalidate = 3600`, which let the
 * build prerender the page against the build machine's empty local database —
 * so from 2026-09-22 the live page said "4 calculations across 0 visits" and
 * every share was 0%, while its own JSON and charts said 4,944. Every other
 * page and route that reads D1 is force-dynamic; this one now is too, and
 * scripts/auditDbRoutes.ts fails the build if one ever isn't.
 */
export const dynamic = 'force-dynamic';

/**
 * The public face of the usage data: five findings, the count behind each, and
 * how each was tested. Figures are computed from D1 on render (hourly), so the
 * page keeps itself current.
 *
 * What makes that safe, and must stay that way:
 *  - Nothing here is finer than a national share. The postal-code detail that
 *    the data room shows, and that licensees pay for, never reaches this file.
 *  - No sentence may encode a reading of a number that would stop being true if
 *    the number moved. "17% — about one in six" was removed for this reason.
 *  - Every chart is drawn from the same object as the prose (researchCharts.ts).
 *  - `research_daily` keeps one dated row a day, rendered as a table. That is
 *    what replaces snapshot-freezing as the citation guarantee: a figure quoted
 *    on a given day stays visible on the page for ever.
 */
const URL = 'https://canpayinsights.ca/research/pay-calculator-behaviour';
const n = (x: number) => x.toLocaleString('en-CA');
const longDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
const description = 'What hundreds of thousands of anonymous calculations show about how people use a pay number: pricing raises, shifts that start before 7 a.m., comparing provinces, and the languages it is done in. Counts, tests and limits for every figure. Free to cite.';

// Static, because metadata is not the place to put a number that moves hourly —
// a title that changed under a shared link would make the page look unstable.
export const metadata: Metadata = {
  title: 'How People Use a Pay Number — CanPay Insights Research',
  description,
  alternates: { canonical: URL },
  openGraph: {
    title: 'What people do with a pay number',
    description, url: URL, type: 'article',
    images: [{ url: 'https://canpayinsights.ca/research/pricing-the-raise.svg' }],
  },
};

const jsonLdFor = (generated: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Report',
  headline: 'What people do with a pay number',
  description,
  url: URL,
  datePublished: '2026-09-18',
  dateModified: generated,
  author: { '@type': 'Person', name: 'Travis Zhang' },
  publisher: { '@type': 'Organization', name: 'CanPay Insights', url: 'https://canpayinsights.ca' },
  license: 'https://creativecommons.org/licenses/by/4.0/',
  isAccessibleForFree: true,
});

function Finding({ k, figure, claim, children, img, alt }: { k: string; figure: string; claim: string; children: React.ReactNode; img?: string; alt?: string }) {
  return (
    <section className="border-t border-slate-200 py-12">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-red-600">{k}</p>
      <div className="grid gap-x-10 gap-y-4 md:grid-cols-[auto_1fr] md:items-baseline">
        <p className="text-7xl font-extrabold leading-none tracking-tight text-slate-900 md:text-8xl">{figure}</p>
        <h2 className="text-2xl font-bold leading-snug text-slate-900">{claim}</h2>
      </div>
      <div className="mt-6 max-w-2xl space-y-4 text-[15px] leading-7 text-slate-700">{children}</div>
      {img ? (
      <figure className="mt-8">
        <img src={`/research/${img}.svg`} alt={alt} width={1200} height={630} className="w-full rounded-xl border border-slate-200" loading="lazy" />
        <figcaption className="mt-2 text-xs text-slate-500">
          Free to reuse with credit to CanPay Insights ·{' '}
          <a href={`/research/${img}.svg`} download className="font-semibold text-red-600 hover:underline">Download SVG</a>
        </figcaption>
      </figure>
      ) : null}
    </section>
  );
}

const Test = ({ children }: { children: React.ReactNode }) => (
  <p className="rounded-lg border-l-4 border-slate-300 bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-600">
    <strong className="text-slate-800">How this was tested. </strong>{children}
  </p>
);

export default async function Page() {
  const snap = await payBehaviour();
  const { raise, shifts, move, lang, weekend, sample, history } = snap;
  const day = longDate(snap.generated);
  const since = longDate(snap.since);
  return (
    <div className="min-h-screen bg-slate-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFor(snap.generated)) }} />
      <article className="mx-auto max-w-4xl px-4 py-12">
        <a href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:underline">← CanPay Insights</a>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Research note · figures as of {day}</p>
        <h1 className="mb-5 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">
          What people do with a pay number
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-slate-600">
          CanPay Insights is a free Canadian take-home pay calculator. Between {since} and {day} it
          recorded {n(snap.n)} anonymous calculations across {n(snap.sessions)} visits. It never learns
          what anyone earns — income is kept only as one of seven ranges — but it does see something no
          wage survey records: how people use a pay figure once they have one.
        </p>

        <div className="mt-8 max-w-2xl rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
          <strong>Read this first.</strong> These are people who went looking for a pay calculator, not
          a sample of Canadians: {snap.belowMedianShare}% of the calculations sit below the median wage
          for the province chosen. Every figure on this page is a share of calculator use. None of it is
          a statement about what Canadians earn or how many Canadians do anything.
        </div>

        <div className="mt-12">
          <Finding
            k="1 · Pricing the raise"
            figure={`${raise.net.upShare}%`}
            claim="of visitors who changed the income ended on a higher figure than they started with."
            img="pricing-the-raise"
            alt={`${raise.net.upShare}% of visitors who changed the income ended on a higher figure`}
          >
            <p>
              {raise.multiShare}% of visits run more than one calculation, and {raise.variedIncomeShare}% of
              those change the income between runs. Among the {n(raise.net.n)} visits that ended in a
              different income range from the one they began in, {n(raise.net.up)} ended higher
              and {n(raise.net.down)} ended lower. People are mostly not modelling a pay cut. They are
              pricing the raise, the offer or the extra hours in front of them.
            </p>
            <Test>
              One visitor trying twenty figures should not count twenty times, so the headline gives each
              visit a single vote: where it ended against where it began. Counting every individual change
              instead gives {raise.steps.upShare}% ({n(raise.steps.up)} up, {n(raise.steps.down)} down).
              The form opens on a $20 hourly wage, so a visitor who picks a province before typing their
              own wage records that default first; ignoring each visit&rsquo;s first change
              gives {raise.later.upShare}% ({n(raise.later.up)} up, {n(raise.later.down)} down). The
              direction holds under all three counts. Income is stored in seven ranges, so a change that
              stays inside one range is invisible here.
            </Test>
          </Finding>

          <Finding
            k="2 · When shifts start"
            figure={`${shifts.editedBefore7}%`}
            claim="of the shifts people typed in start before 7 a.m."
            img="night-shift-canada"
            alt={`Start hour of ${n(shifts.editedTotal)} shift schedules entered into the calculator`}
          >
            <p>
              Hourly workers enter the shift they actually work. Of {n(shifts.editedTotal)} schedules that
              visitors changed from the form&rsquo;s default, {shifts.editedBefore7}% start before 7 a.m.
              and {shifts.editedNight}% start between 6 p.m. and 6 a.m. Statistics Canada reports how many
              hours people work; we know of no public Canadian dataset of the hour a shift begins.
            </p>
            <Test>
              The form opens on a 9-to-5 with a 30-minute break. {n(shifts.defaultRows)} of
              the {n(shifts.allTotal)} shift calculations carry exactly that schedule, and a real
              nine-to-five cannot be told apart from a schedule nobody touched. Those rows are therefore
              left out above, which removes genuine nine-to-fives too — so read the figures as the spread
              of start times among people who adjusted their schedule. Keeping every row instead gives a
              floor: at least {shifts.notNineFloor}% of all shift calculations do not start at 9 a.m., and
              at least {shifts.nightFloor}% start between 6 p.m. and 6 a.m.
            </Test>
          </Finding>

          <Finding
            k="3 · Weighing a move"
            figure={`${move.share}%`}
            claim="of visits price the same pay in two or more provinces in one sitting."
            img="weighing-a-move"
            alt={`${move.share}% of visits compare pay in two or more provinces`}
          >
            <p>
              {n(move.multiProv)} of {n(move.sessions)} visits calculated take-home pay for more than one
              province. Interprovincial migration appears in official statistics after the move has
              happened. This is what it looks like while someone is still deciding.
            </p>
            <Test>
              A visit counts when two or more different provinces appear in its calculations. Some of those
              visitors are curious rather than moving, and some are correcting a wrong first choice, so
              this is an upper reading of intent to relocate, not a count of movers.
            </Test>
          </Finding>
          <Finding
            k="4 · In which language"
            figure={`${lang.nonEnglishShare}%`}
            claim="worked out their Canadian pay in a language other than English."
            img="in-which-language"
            alt={`Interface language of ${n(lang.total)} calculations`}
          >
            <p>
              {lang.zhShare}% of all the calculations were done in Chinese. The
              calculator offers ten languages, and the rest of the traffic spreads thinly across
              French, Korean, Spanish, Punjabi, Hindi, Tagalog, Ukrainian and Vietnamese. Working out
              what a job pays after tax is one of the first things anyone does on arriving in Canada,
              and a good deal of it is not happening in English or French.
            </p>
            <Test>
              This is the language the page was displayed in: either one the visitor chose from the
              menu, or the language their phone or computer is set to. Unlike the shift and income
              figures it involves no form default — a device language is a real setting either way.
              It is not a measure of what anyone speaks at home or how well they read English; a
              bilingual person may simply prefer their own language for a page full of numbers.
              Thinly-served languages will also be understated, because a language nobody knows the
              calculator offers is a language nobody arrives in.
            </Test>
          </Finding>

          <Finding
            k="5 · The weekend"
            figure={`${weekend.share}%`}
            claim="of the work schedules people typed in include a Saturday or a Sunday."
          >
            <p>
              Of {n(weekend.n)} schedules entered by hourly workers, {weekend.share}% cover at least
              one weekend day. Taken with the start times above, the picture is of a calculator being
              used mostly by people whose week is not the standard one.
            </p>
            <Test>
              The form opens on Monday to Friday with both weekend days switched off, so a weekend
              day is only ever present because somebody switched it on. That makes this figure a
              floor and never an inflated one — the opposite of the trap in finding 2, where the
              default worked the other way. Anyone who works weekends but left the days alone is
              counted here as not working them.
            </Test>
          </Finding>
        </div>

        {/* A journalist's first doubt is not the arithmetic — it is whether
            there is a real, continuous stream of Canadians behind the figures,
            and whether they were picked on a flattering day. This section
            answers both with evidence rather than assurance, and hands over
            the file so nobody has to take our word for the sums. */}
        <section className="border-t border-slate-200 py-12">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-red-600">Checking this</p>
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Where the numbers come from, and whether they hold</h2>

          <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-slate-700">
            <p>
              The {n(snap.n)} calculations arrived across {sample.days} {sample.days === 1 ? 'day' : 'days'} without a gap, from{' '}
              {since} onward — between a few dozen and {n(sample.busiest)} a day.{' '}
              <strong className="text-slate-900">{sample.caShare}% came from inside Canada.</strong>{' '}
              The busiest provinces are{' '}
              {sample.provinces.slice(0, 4).map((p) => `${p.k} (${n(p.n)})`).join(', ')}.
            </p>
          </div>

          <figure className="mt-8">
            <img src="/research/the-sample.svg" alt={`Daily calculations across ${sample.days} days`} width={1200} height={630} className="w-full rounded-xl border border-slate-200" loading="lazy" />
            <figcaption className="mt-2 text-xs text-slate-500">
              Free to reuse with credit to CanPay Insights ·{' '}
              <a href="/research/the-sample.svg" download className="font-semibold text-red-600 hover:underline">Download SVG</a>
            </figcaption>
          </figure>

          <h3 className="mb-3 mt-10 text-lg font-bold text-slate-900">Have the figures moved as the sample grew?</h3>
          <p className="mb-4 max-w-2xl text-[15px] leading-7 text-slate-700">
            The page writes down what it said the first time it was opened each day, and never edits
            those rows; the figures at the top are live. A figure that stays put while the sample grows
            was not a lucky week — and if you quoted this page on a particular day, that day's row is
            here from the next day on.
          </p>
          <div className="max-w-2xl overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-left text-slate-500">
                  <th className="py-2 pr-4 font-semibold">Date</th>
                  <th className="py-2 pr-4 font-semibold">Calculations</th>
                  <th className="py-2 pr-4 font-semibold">Ended higher</th>
                  <th className="py-2 pr-4 font-semibold">Start before 7 a.m.</th>
                  <th className="py-2 font-semibold">Two provinces</th>
                </tr>
              </thead>
              <tbody>
                {history.filter((h) => h.day < snap.generated).map((h) => (
                  <tr key={h.day} className="border-b border-slate-200 text-slate-700">
                    <td className="py-2 pr-4">{h.day}</td>
                    <td className="py-2 pr-4 tabular-nums">{n(h.n)}</td>
                    <td className="py-2 pr-4 tabular-nums">{h.raise}%</td>
                    <td className="py-2 pr-4 tabular-nums">{h.before7}%</td>
                    <td className="py-2 tabular-nums">{h.move}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mb-3 mt-10 text-lg font-bold text-slate-900">Every number on this page, as a file</h3>
          <p className="max-w-2xl text-[15px] leading-7 text-slate-700">
            The page and its charts are rendered from one object, and that object is served as JSON
            at the link below. It holds the counts behind every percentage — including the rows that
            were left out and why — so the arithmetic can be checked without asking us for anything.
          </p>
          <a
            href="/research/pay-behaviour.json"
            download
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800 no-underline hover:border-red-300 hover:text-red-700"
          >
            Download the figures (JSON)
          </a>
        </section>

        <section className="border-t border-slate-200 py-12">
          <h2 className="mb-5 text-2xl font-bold text-slate-900">Method</h2>
          <ul className="max-w-2xl list-disc space-y-3 pl-5 text-[15px] leading-7 text-slate-700">
            <li><strong className="text-slate-900">Source.</strong> Calculations made on canpayinsights.ca and in the CanPay Insights iPhone app, {since} to {day}. Calculations made by the site&rsquo;s owner or in testing are excluded.</li>
            <li><strong className="text-slate-900">What is recorded.</strong> The province, one of seven income ranges, the kind of calculation and, for hourly workers, the shift. No name, account, exact income, IP address or device fingerprint. A &ldquo;visit&rdquo; is a random identifier held in the page&rsquo;s memory and gone when the page is closed or reloaded; it cannot link one day to the next, or one device to another. Details are in the <a href="/privacy" className="font-semibold text-red-600 hover:underline">privacy policy</a>.</li>
            <li><strong className="text-slate-900">What is not recorded.</strong> A calculator opened and left on its default values sends nothing, so the defaults do not count as calculations.</li>
            <li><strong className="text-slate-900">This page keeps itself current.</strong> The figures are recomputed from the record at most once an hour, so they move as the sample grows. What each figure was on any given day stays in the table above, which is where a citation should point.</li>
            <li><strong className="text-slate-900">The tax engine behind the calculator</strong> is compared with the CRA&rsquo;s payroll deduction tables before every release. That concerns the pay figures visitors see, not the usage figures on this page.</li>
          </ul>
        </section>

        <section className="border-t border-slate-200 py-12">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">Citing and reusing</h2>
          <p className="max-w-2xl text-[15px] leading-7 text-slate-700">
            The text, figures and charts on this page are free to quote and republish with credit
            (<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="font-semibold text-red-600 hover:underline">CC BY 4.0</a>).
            Please describe the source as &ldquo;people who used the CanPay Insights pay calculator&rdquo;.
          </p>
          <p className="mt-4 max-w-2xl rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700">
            CanPay Insights, <em>What people do with a pay number</em>, {n(snap.n)} anonymous calculations,
            figures as of {day}. {URL}
          </p>
          <p className="mt-6 max-w-2xl text-[15px] leading-7 text-slate-700">
            Journalists and researchers: if a cut by province or income range would help, write to{' '}
            <a href="mailto:info@canpayinsights.ca?subject=Research%20note" className="font-semibold text-red-600 hover:underline">info@canpayinsights.ca</a>.
            Any figure we send has at least twenty visits behind it. The coarse open files are on the{' '}
            <a href="/data" className="font-semibold text-red-600 hover:underline">data page</a>.
          </p>
        </section>
      </article>
      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-center text-xs text-slate-400" role="contentinfo">
        <p>© CanPay Insights · <AvowdCredit /></p>
      </footer>
    </div>
  );
}
