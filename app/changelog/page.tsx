import type { Metadata } from 'next';
import AvowdCredit from '../../components/AvowdCredit';

export const metadata: Metadata = {
  title: 'Changelog – What’s New at CanPay Insights',
  description:
    'Every meaningful update to the CanPay Insights take-home pay calculator: new languages, new features, tax-engine updates, and data releases.',
  alternates: { canonical: 'https://canpayinsights.ca/changelog' },
};

// Newest first. Keep entries honest and concrete — this page doubles as a
// freshness signal for search/AI engines and as proof of maintenance for
// widget publishers.
//
// MAINTENANCE RULE: add an entry whenever a user-visible capability ships —
// new languages, new features, tax-year or benchmark updates, app releases.
// Write for a non-technical reader: no file names, no code, no commit hashes.
// Routine blog articles do NOT belong here (they have their own index); this
// page is the product's history, not a publishing log.
const ENTRIES: { date: string; title: string; points: string[] }[] = [
  {
    date: '2026-09-15',
    title: 'Where your pay sits in your neighbourhood; new privacy policy, terms and refund policy',
    points: [
      'Under every result you can now enter the first three characters of your postal code, or press "use my location", and see where that income sits among the people who file taxes in that exact area — from the Canada Revenue Agency\'s tax-filer statistics by postal area. Both are optional and off until you act.',
      'What is kept, stated plainly: the three characters only (never a full postal code), and a shared location rounded to about 1 km on your device before it is sent — about 11 km in rural areas. The privacy policy now says this, says that the resulting neighbourhood statistics are published and may be licensed to researchers and real-estate or financial companies as counts for areas of thousands of households, and names the person in charge of privacy.',
      'The privacy policy was rewritten in full and now exists in French as well. It also describes the one cookie the site uses (only if you sign in), local storage, and the page-view counters.',
      'New pages: Terms of Service and Refund Policy — the two $9 reports are refunded on request within 14 days.',
      'Every article cover that was a stock photo loaded from another company\'s server is now an image we made and host ourselves, so reading an article no longer contacts any third party.',
      'The usage dataset (what people check, observed from the calculator) is now free for research, journalism and personal use under CC BY-NC-SA 4.0; commercial use needs a licence. The take-home pay dataset, computed from published tax rules, stays CC BY 4.0. Copies downloaded before today keep the licence they came with.',
      'The data room now shows calculations by postal area (with small groups withheld), a heartbeat per data source so a silent source is noticed within a week, and a list of known gaps in the data.',
    ],
  },
  {
    date: '2026-09-15',
    title: 'Alberta tax description corrected; location data made coarser',
    points: [
      'The province comparison said Alberta has a "flat 10%" tax rate. It has not since 2015, and since 2025 the first $61,200 is taxed at 8%. The text now states the brackets the calculator actually uses.',
      'Anonymous usage statistics now store a map position rounded to about 11 km instead of a city-centre point with street-level precision. Existing records were rounded the same way. No IP address was ever stored; this narrows what is kept even further, and the privacy policy now describes exactly what is recorded.',
      'The iPhone app\'s anonymous usage statistics had been silently rejected since August 27 because of a missing field; the server now accepts them. Nothing changes for app users.',
      'Page titles: the Ontario calculator now says "Salary & Hourly Take-Home" so people searching for a salary calculator can see it does that too.',
    ],
  },
  {
    date: '2026-09-02',
    title: 'Ontario Health Premium added — Ontario take-home figures are now lower',
    points: [
      'Ontario paycheques have a health premium withheld alongside income tax, and this calculator was not deducting it. Ontario take-home figures were too high by $300 to $750 a year depending on income, and are now correct.',
      'What changed for you: on a $50,000 Ontario salary the annual take-home shown drops from $40,535 to $39,935; on $85,000, from $64,100 to $63,350. Nothing about your actual pay has changed — only the estimate on this site, which now matches your pay stub.',
      'Also added: the Ontario and British Columbia tax reductions, which cut provincial tax to zero at low incomes, and the federal basic personal amount phase-out that applies above $181,440 of income.',
      'These come from the Canada Revenue Agency payroll formulas — the same rules your employer uses to decide what to withhold. Every province was rechecked against them; New Brunswick, Prince Edward Island and Newfoundland and Labrador needed no change.',
      'One deliberate omission: Nova Scotia has a low-income tax reduction worth up to $300, but it is claimed when you file your return, not taken off your pay. Including it would make the paycheque figure wrong, so it stays out — you get it back at tax time.',
      'Published figures across the site were rechecked and the affected minimum-wage article was recalculated.',
    ],
  },
  {
    date: '2026-08-16',
    title: 'Tech wage benchmark updated in the pay-comparison chart',
    points: [
      'The technology industry benchmark in the wage-comparison chart was refreshed to reflect the latest Job Bank wage report — the typical full-time tech salary now shows as roughly $100,000, up from roughly $90,000.',
      'Every other industry benchmark and all provincial wage figures were checked against the latest Statistics Canada release and found unchanged.',
      'Figures throughout the calculator come from Statistics Canada and Job Bank, and are reviewed every six months.',
    ],
  },
  {
    date: '2026-08-08',
    title: 'iOS app 1.1.0 — ten languages',
    points: [
      'The iPhone app now matches the website: English, French, Chinese, Punjabi, Hindi, Tagalog, Spanish, Ukrainian, Korean, and Vietnamese.',
      'The app picks your language automatically from your iPhone settings, and you can switch any time from the globe button.',
      'Same 2026 tax engine as the website, verified line for line.',
    ],
  },
  {
    date: '2026-08-08',
    title: 'Industry wage benchmarks recalibrated to Statistics Canada 2025 data',
    points: [
      'All 13 industry benchmarks in the wage-comparison chart were rebased on Statistics Canada Table 14-10-0064-01 (median wage, full-time employees, 2025 reference year).',
      'Technology uses the Job Bank occupation median rather than a payroll average; retail is adjusted for the wholesale-retail blend in the source table.',
      'These benchmarks are now audited every six months.',
    ],
  },
  {
    date: '2026-08-07',
    title: '7 new languages — now 10 in total',
    points: [
      'Added Punjabi (ਪੰਜਾਬੀ), Hindi (हिन्दी), Tagalog, Spanish (Español), Ukrainian (Українська), Korean (한국어), and Vietnamese (Tiếng Việt) across the full calculator, joining English, French, and Chinese.',
      'The embeddable widget accepts all ten languages via the ?lang= parameter.',
      'New industry wage-comparison chart: pick your industry and see where your pay sits against Canada-wide benchmarks.',
      'Cleaner mobile reading: long explainer sections are now tap-to-expand.',
    ],
  },
  {
    date: '2026-08-06',
    title: 'Free embeddable widget for publishers',
    points: [
      'Any site can embed the take-home pay calculator with a copy-paste iframe — see /widget.',
      'Anonymous aggregate usage statistics program launched (income brackets only, never exact amounts — details in the privacy policy).',
    ],
  },
  {
    date: '2026-07-15',
    title: 'iOS app 1.0.9 — trilingual',
    points: [
      'The iOS app now matches the website in English, French, and Chinese.',
    ],
  },
  {
    date: '2026-07-02',
    title: 'iOS app 1.0.8 — 2026 tax engine',
    points: [
      'App updated to the full 2026 engine, including the 14% federal first-bracket rate.',
      'Fixed decimal input on hourly wages.',
    ],
  },
  {
    date: '2026-06-27',
    title: 'Provincial comparison tables and open FAQ',
    points: [
      'Homepage now answers the big questions directly: 2026 take-home by province at $80,000, and take-home at $50k/$75k/$100k across BC, Ontario, Alberta, and Quebec.',
      'Compare-provinces page gained a full 13-province/territory static table.',
    ],
  },
  {
    date: '2026-06-26',
    title: 'Open dataset',
    points: [
      'Published the calculator’s 2026 rules output as an open CC-BY dataset (CSV/JSON) — see /data.',
    ],
  },
  {
    date: '2026-06-11',
    title: 'Salary-after-tax pages for real numbers',
    points: [
      'Hundreds of precomputed salary-by-province pages with exact 2026 figures from the rules engine.',
    ],
  },
  {
    date: '2026-05-20',
    title: 'French and Chinese interfaces',
    points: [
      'Full calculator UI available in French and Chinese with automatic browser-language detection.',
    ],
  },
  {
    date: '2026-03-01',
    title: 'CanPay Insights launches',
    points: [
      'Free Canadian take-home pay calculator: hourly, annual salary, and timesheet modes, all 13 provinces and territories, 2026 tax year, no signup.',
      'iOS app live on the App Store.',
    ],
  },
];

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <main className="mx-auto max-w-3xl px-4 py-12">
        <a href="/" className="text-sm font-medium text-red-600 hover:text-red-700">← CanPay Insights</a>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">Changelog</h1>
        <p className="mt-2 mb-10 text-slate-500">
          Every meaningful update to the calculator, newest first. Built continuously since March 2026.
        </p>
        <ol className="relative space-y-10 border-l-2 border-slate-200 pl-6">
          {ENTRIES.map((e) => (
            <li key={e.date + e.title} className="relative">
              <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-red-600" />
              <time dateTime={e.date} className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {e.date}
              </time>
              <h2 className="mt-1 text-lg font-bold text-slate-800">{e.title}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-center text-xs text-slate-400" role="contentinfo">
        <p>© CanPay Insights · <AvowdCredit /></p>
      </footer>
      </main>
    </div>
  );
}
