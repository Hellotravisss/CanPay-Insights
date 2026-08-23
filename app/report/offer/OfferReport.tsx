import Link from 'next/link';
import type { OfferReport as R, OfferSide } from '../../../lib/offerReport';
import SaveReport from '../relocation/SaveReport';

const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`;
const signed = (n: number) => (n >= 0 ? '+' : '−') + money(n);

/**
 * Two offers, after tax. One verdict number, then the lines that make it.
 */
export default function OfferReport({ report: r, email, sessionId, permalink }: { report: R; email: string | null; sessionId: string; permalink: string }) {
  const win = r.winner;
  const W = win === 'b' ? r.b : r.a;
  const tone = win === 'tie' ? 'text-slate-700' : 'text-emerald-700';
  const rows: [string, (s: OfferSide) => number, 'money' | 'hours'][] = [
    ['Salary', (s) => s.salary, 'money'],
    ['Cash bonus', (s) => s.bonus, 'money'],
    ['Federal tax', (s) => -s.federalTax, 'money'],
    ['Provincial tax', (s) => -s.provincialTax, 'money'],
    ['CPP / QPP', (s) => -s.cpp, 'money'],
    ['EI', (s) => -s.ei, 'money'],
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 font-sans text-slate-800 print:py-4">
      <header className="border-b-4 border-red-600 pb-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-bold">CanPay <span className="font-normal text-red-600">Insights</span></span>
          <span className="ml-auto text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Offer Comparison · {r.taxYear}</span>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {money(r.a.salary)} in {r.a.province} <span className="text-red-600">vs</span> {money(r.b.salary)} in {r.b.province}
        </h1>
        <p className="mt-2 text-sm text-slate-500">{r.taxYear} federal and provincial rates · single filer, standard credits · bonus, RRSP match and vacation priced in</p>
      </header>

      <SaveReport email={email} sessionId={sessionId} permalink={permalink} />

      {/* Verdict */}
      <section className={`mt-8 rounded-2xl border p-6 ${win === 'tie' ? 'border-slate-200 bg-slate-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Total package, after tax</p>
        {win === 'tie' ? (
          <p className="mt-2 text-3xl font-extrabold text-slate-800">Effectively a tie</p>
        ) : (
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
            <span className={`text-5xl font-extrabold tabular-nums ${tone}`}>{signed(Math.abs(r.gap.total))}</span>
            <span className="text-lg text-slate-500">a year for <strong className="text-slate-800">{W.label}</strong> · {money(Math.abs(r.gap.monthly))} a month</span>
          </p>
        )}
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700">
          Cash after tax {signed(r.gap.netCash)} for Offer B; with the employer match counted, {signed(r.gap.total)}. Per hour actually worked, {r.b.label} pays {money(r.b.perWorkingHour)} to {r.a.label}’s {money(r.a.perWorkingHour)}.
        </p>
      </section>

      {/* Tiles */}
      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile label="Break-even salary for Offer B" value={money(r.breakEvenSalaryForB)} sub={`matches Offer A’s total package (${signed(r.breakEvenSalaryForB - r.b.salary)} vs the offer)`} />
        <Tile label="Per hour worked" value={`${money(r.b.perWorkingHour)} vs ${money(r.a.perWorkingHour)}`} sub={`${r.b.workingHours.toLocaleString()} vs ${r.a.workingHours.toLocaleString()} paid-working hours a year`} />
        <Tile label="Next $1,000 raise keeps" value={`${money(r.b.keepPer1000)} vs ${money(r.a.keepPer1000)}`} sub={`${r.b.province} vs ${r.a.province}`} />
      </section>

      {/* Side by side */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">Line by line</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-2 pr-4">Annual</th><th className="py-2 text-right">{r.a.label} · {r.a.province}</th><th className="py-2 text-right">{r.b.label} · {r.b.province}</th><th className="py-2 text-right">B − A</th>
            </tr></thead>
            <tbody className="tabular-nums">
              {rows.map(([label, f]) => { const x = f(r.a), y = f(r.b), d = y - x; return (
                <tr key={label} className="border-t border-slate-100">
                  <td className="py-2.5 pr-4 text-slate-600">{label}</td>
                  <td className="py-2.5 text-right">{x < 0 ? `−${money(x)}` : money(x)}</td>
                  <td className="py-2.5 text-right">{y < 0 ? `−${money(y)}` : money(y)}</td>
                  <td className={`py-2.5 text-right font-medium ${d === 0 ? 'text-slate-300' : d > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{d === 0 ? '—' : signed(d)}</td>
                </tr>); })}
              <Row label="Cash after tax" a={r.a.netCash} b={r.b.netCash} strong />
              <tr className="border-t border-slate-100 text-slate-500"><td className="py-2 pr-4 pl-4">of which bonus, after tax</td><td className="py-2 text-right">{money(r.a.bonusAfterTax)}</td><td className="py-2 text-right">{money(r.b.bonusAfterTax)}</td><td className="py-2 text-right">{signed(r.b.bonusAfterTax - r.a.bonusAfterTax)}</td></tr>
              <Row label={`Employer RRSP match (${r.a.matchPct}% · ${r.b.matchPct}%)`} a={r.a.employerMatch} b={r.b.employerMatch} />
              <tr className="border-t-2 border-slate-900 bg-emerald-50"><td className="py-3 pr-4 text-base font-extrabold text-slate-900">Total package</td><td className="py-3 text-right text-base font-extrabold">{money(r.a.total)}</td><td className="py-3 text-right text-base font-extrabold">{money(r.b.total)}</td><td className={`py-3 text-right text-base font-extrabold ${r.gap.total >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{signed(r.gap.total)}</td></tr>
              <Row label={`Paid vacation (${r.a.vacationDays} · ${r.b.vacationDays} days), value`} a={r.a.vacationValue} b={r.b.vacationValue} muted />
              <Row label="Monthly cash" a={r.a.netMonthly} b={r.b.netMonthly} muted />
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Vacation is shown as the pay attached to the days off, not added to the package — it is the reason the per-hour figure differs from the annual one. The RRSP match is counted at face value because it goes in pre-tax.
        </p>
      </section>

      {/* What to ask */}
      <section className="mt-10 rounded-2xl border-2 border-red-200 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Before you sign</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">Eight questions that change this math</h2>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {[
            'Is the bonus guaranteed, targeted, or discretionary — and when is it paid?',
            'Does the RRSP match vest immediately, or after a cliff?',
            'Is vacation accrued or front-loaded, and does unused time pay out?',
            'What does the health and dental plan cost per pay, and who is covered?',
            'Is there a pension (DB or DC) beyond the RRSP match?',
            'Salary review cycle: when is the first raise, and on what scale?',
            'Remote or hybrid — and is there a home-office or commuting allowance?',
            'Probation length, notice period, and non-compete terms.',
          ].map((q) => <li key={q} className="flex gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-700"><span className="text-red-600">?</span>{q}</li>)}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl bg-slate-50 p-6">
        <h2 className="text-base font-bold text-slate-900">What this comparison does not price</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600">
          <li>Benefits plans, pensions beyond the match, stock or equity.</li>
          <li>Cost of living if the two offers are in different cities.</li>
          <li>Commute, schedule, and the work itself.</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500">Every figure is computed by the same tax engine as the free calculator for {r.taxYear}, single filer, standard credits. This is a calculation, not advice.</p>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 print:hidden">
        <span>Permanent link: <span className="font-mono">{permalink.replace('https://', '')}</span></span>
        <Link href="/" className="text-red-600 hover:underline">← Back to the calculator</Link>
      </footer>
    </main>
  );
}

function Row({ label, a, b, strong, muted }: { label: string; a: number; b: number; strong?: boolean; muted?: boolean }) {
  const d = b - a;
  return (
    <tr className={`border-t ${strong ? 'border-slate-200 bg-slate-50' : 'border-slate-100'} ${muted ? 'text-slate-500' : ''}`}>
      <td className={`py-2.5 pr-4 ${strong ? 'font-semibold text-slate-700' : ''}`}>{label}</td>
      <td className={`py-2.5 text-right ${strong ? 'font-semibold' : ''}`}>{money(a)}</td>
      <td className={`py-2.5 text-right ${strong ? 'font-semibold' : ''}`}>{money(b)}</td>
      <td className={`py-2.5 text-right ${strong ? 'font-semibold' : ''} ${d === 0 ? 'text-slate-300' : d > 0 ? 'text-emerald-700' : 'text-red-600'}`}>{d === 0 ? '—' : signed(d)}</td>
    </tr>
  );
}
function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  );
}
