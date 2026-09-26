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
    date: '2026-09-26',
    title: 'Work backwards from the take-home you want',
    points: [
      'In the annual-salary calculator, enter the take-home you want each month or year and it finds the salary that leaves exactly that, to the dollar, for your province, pay frequency, RRSP and extras. The answer comes from the same engine that is checked against the CRA tables, and every release now also checks that it lands on the exact dollar for every province.',
      'If you use it, the anonymous record of that calculation includes the monthly take-home you asked for as a range, never the amount. The privacy policy lists it.',
      'The yearly summary now says how many of the year\'s 260 working days\' pay go to income tax, and separately how many go into CPP/QPP and EI, which come back as a pension and insurance rather than being spent by government.',
    ],
  },
  {
    date: '2026-09-25',
    title: 'Clearer privacy policy, a more accessible site, and a widget that works in a strict sandbox',
    points: [
      'The privacy policy now opens with exactly what stays on your device and what is sent. The previous version said hours were never sent, while a later section listed the work pattern the shift and timesheet calculators send; both now say the same thing. It also lists every item the site keeps in your browser. The About page no longer says that no data leaves your device.',
      'It also now says plainly that buying a report is the one case where the salary you enter reaches us: the report is built from it, and Stripe keeps it with the payment so the report can be reopened. Our own records keep only the income range.',
      'The location section now says that a postal-code prefix you entered is included with each later calculation in the same browser until you change or clear it, and that the connection-based point is an approximation rather than a city centre.',
      'Text across the site was too faint for some readers. Every public page now meets the WCAG 2.1 AA contrast standard, and this is checked automatically after every update.',
      'The embeddable calculator now labels its fields for screen readers and announces the result once you stop typing, and it works inside the strictest iframe sandbox a publishing site can set.',
      'The open take-home dataset now carries the date its figures last changed (September 15, 2026), which updates automatically whenever a correction changes them.',
    ],
  },
  {
    date: '2026-09-22',
    title: 'Six withholding rules corrected against the CRA\'s own guides',
    points: [
      'Timesheets: overtime is now counted by calendar week wherever you are in Canada; near midnight the week could previously be split in the wrong place.',
      'A one-off payment such as a bonus, entered in the hourly calculator, is now taxed the way employers are told to withhold it (the CRA\'s bonus method) rather than as if it were earned every pay.',
      'Taxable benefits that are not paid in cash no longer attract EI premiums, which the CRA does not charge on them.',
      'Daily pay is now treated as 240 pay periods a year, as the CRA\'s tables do.',
      'An employer\'s matching contribution to a group RRSP now adds to CPP and EI, as the CRA requires.',
      'The timesheet asks how your tips are paid. Tips a customer hands you directly have no CPP or EI withheld; they are still taxable.',
      'The tax tips panel now takes its marginal rate and RRSP savings from the same engine as the calculator. Its own formula had shown some rates too low (19.05% instead of 31.48% at $100,000 in Ontario).',
    ],
  },
  {
    date: '2026-09-15',
    title: 'Every paycheque figure is now checked against the government\'s own withholding tables',
    points: [
      'The calculator is now tested, before every update goes live, against the payroll deduction tables the Canada Revenue Agency publishes for employers — more than 10,000 rows covering federal tax, every province\'s and territory\'s tax, CPP and EI — and against Revenu Québec\'s table for Quebec income tax. If any figure drifts more than a few cents from the official tables, the update is blocked.',
      'Building that check found two more errors, now fixed. Quebec: the calculator gave Quebec income-tax credits for QPP and EI contributions, which Quebec does not allow, and left out Quebec\'s deduction for workers. Quebec take-home figures were too high by about $300 a year and are now lower; on $80,000, from $57,390 to $57,012.',
      'Yukon: above $181,440 of income, Yukon\'s basic personal amount shrinks the same way the federal one does. The calculator did not apply that, so Yukon withholding for high earners was about $100 a year too low.',
      'Where British Columbia\'s mid-year rate change makes the official July tables differ from a full-year figure, the calculator shows the full-year amount; the difference is at most about $2 a pay for incomes between roughly $42,000 and $48,000.',
    ],
  },
  {
    date: '2026-09-15',
    title: 'Take-home pay corrected upward in every province — two CRA payroll rules were missing',
    points: [
      'A reader asked whether the calculator was using Saskatchewan\'s 2026 basic personal amount of $20,381. It was — but checking every step against the Canada Revenue Agency\'s payroll formulas turned up two rules the calculator did not apply, in every province.',
      'The Canada employment amount: every employee gets a federal credit on the first $1,501 of employment income, worth about $210 a year. It was not being given.',
      'Enhanced CPP: since 2019 the "enhanced" part of your CPP contribution (and all of CPP2) is deducted from your income before tax, which is worth your marginal tax rate, instead of a credit at the lowest rate. The calculator treated all of it as a credit.',
      'What changed for you: most take-home figures rise by about $200 to $500 a year. On a $60,000 Saskatchewan salary, total deductions drop from $13,739 to $13,480; on $80,000 in Ontario, take-home rises from $59,994 to $60,303. Your actual pay has not changed — the estimate now matches what your employer withholds.',
      'Every published figure on the site — province guides, comparisons, studies and French articles — was recalculated with the corrected rules, and the iPhone app gets the same fix in its next update.',
    ],
  },
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
              <time dateTime={e.date} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-center text-xs text-slate-500" role="contentinfo">
        <p>© CanPay Insights · <AvowdCredit /></p>
      </footer>
      </main>
    </div>
  );
}
