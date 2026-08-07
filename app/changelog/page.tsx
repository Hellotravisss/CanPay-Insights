import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog – What’s New at CanPay Insights',
  description:
    'Every meaningful update to the CanPay Insights take-home pay calculator: new languages, new features, tax-engine updates, and data releases.',
  alternates: { canonical: 'https://canpayinsights.ca/changelog' },
};

// Newest first. Keep entries honest and concrete — this page doubles as a
// freshness signal for search/AI engines and as proof of maintenance for
// widget publishers.
const ENTRIES: { date: string; title: string; points: string[] }[] = [
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
      </main>
    </div>
  );
}
