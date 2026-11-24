import { FIRST_WEEKS, SPOUSE_JOB, SCHOOLS, WHO_HELPS } from '../../../lib/landingGuide';
import type { RelocationReport as R } from '../../../lib/relocationReport';
import SaveReport from './SaveReport';

const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`;
const signed = (n: number) => (n >= 0 ? '+' : '−') + money(n);

/**
 * The Province Move Report. Every figure is computed; the prose only says
 * what the figures mean. Built to be scanned in thirty seconds (tiles, one
 * big number, colour for direction) and read properly a month later.
 */
export default function RelocationReport({
  report: r,
  salesTax,
  email,
  permalink,
  sessionId,
}: {
  report: R;
  salesTax: { from: { gst: number; pst: number; label: string }; to: { gst: number; pst: number; label: string } };
  email: string | null;
  permalink: string;
  sessionId: string;
}) {
  const gain = r.netGapAnnual >= 0;
  const isQC = (p: string) => p === 'Quebec';
  const cppLabel = isQC(r.from.province) || isQC(r.to.province) ? 'CPP / QPP' : 'CPP';
  const eiLabel = isQC(r.from.province) || isQC(r.to.province) ? 'EI (+ QPIP in Quebec)' : 'EI';
  const perTenK = Math.round(r.salesTaxGapPoints * 100);
  const a = r.analysis;
  const tone = gain ? 'text-red-600' : 'text-ink';
  const toneBg = 'bg-white border-line';

  const rows: [string, number, number, 'cost' | 'gain'][] = [
    ['Federal tax', r.from.federalTax, r.to.federalTax, 'cost'],
    ['Provincial tax', r.from.provincialTax, r.to.provincialTax, 'cost'],
    [cppLabel, r.from.cpp, r.to.cpp, 'cost'],
    [eiLabel, r.from.ei, r.to.ei, 'cost'],
  ];
  const maxNet = a.ladder[0].net;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 font-sans text-ink md:py-14 print:py-4" role="main">
      {/* Masthead */}
      <header className="border-b border-line pb-6">
        <div className="mb-5 hidden items-center gap-3 print:flex">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg" />
          <span className="text-lg"><span className="font-brand font-extrabold tracking-tight">CanPay</span> <span className="font-brand font-normal tracking-tight text-red-600">Insights</span></span>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">Province Move Report · {r.taxYear}</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-[1.1] tracking-[-0.01em] text-ink sm:text-[2.5rem]">
          {r.from.province} <span className="text-red-600">→</span> {r.to.province}
        </h1>
        <p className="mt-3 text-sm leading-6 text-mute">
          On a {money(r.income)} salary · {r.taxYear} federal and provincial rates · single filer, standard credits
        </p>
      </header>

      {/* Keep it: account + PDF */}
      <SaveReport email={email} sessionId={sessionId} permalink={permalink} />

      {/* The number */}
      <section className={`mt-8 rounded-2xl border p-6 ${toneBg}`}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">Take-home pay after the move</p>
        <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
          <span className={`font-display text-5xl font-semibold tabular-nums ${tone}`}>{signed(r.netGapAnnual)}</span>
          <span className="text-lg text-mute">a year</span>
          <span className="text-lg text-mute">·</span>
          <span className="text-lg text-mute">{signed(r.netGapMonthly)} a month</span>
        </p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-ink-2">
          Same salary, {money(r.netGapAnnual)} {gain ? 'more' : 'less'} in your account each year in {r.to.province}.{' '}
          {Math.abs(r.netGapAnnual) < r.income * 0.01
            ? 'At this income the two provinces are close enough that taxes should not decide the move — the sections below matter more.'
            : `Over five years that is ${money(a.fiveYearGap)}.`}
        </p>
      </section>

      {/* Stat tiles — the analysis */}
      <section className="mt-4 grid gap-3 sm:grid-cols-3">
        <Tile
          label={`Same take-home in ${r.to.province} needs`}
          value={money(a.matchingSalaryInTo)}
          sub={`${signed(a.matchingSalaryInTo - r.income)} on your salary`}
        />
        <Tile
          label="Your next $1,000 raise keeps"
          value={`${money(a.keepPer1000To)}`}
          sub={`in ${r.to.province} · ${money(a.keepPer1000From)} in ${r.from.province}`}
        />
        <Tile
          label={`Take-home rank at ${money(r.income)}`}
          value={`#${a.rankTo} of 13`}
          sub={`${r.to.province} · ${r.from.province} is #${a.rankFrom}`}
        />
      </section>

      {/* Breakdown */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Where each dollar goes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm [&_td+td]:pl-3 [&_th+th]:pl-3">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-mute">
                <th className="py-2 pr-4 font-bold">Annual</th>
                <th className="py-2 text-right font-bold">{r.from.province}</th>
                <th className="py-2 text-right font-bold">{r.to.province}</th>
                <th className="py-2 text-right font-bold">Difference</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              <tr className="border-t border-line">
                <td className="py-2.5 pr-4 text-ink-3">Gross salary</td>
                <td className="py-2.5 text-right">{money(r.from.gross)}</td>
                <td className="py-2.5 text-right">{money(r.to.gross)}</td>
                <td className="py-2.5 text-right text-ink-5">—</td>
              </tr>
              {rows.map(([label, x, y]) => {
                const d = y - x;
                return (
                  <tr key={label} className="border-t border-line">
                    <td className="py-2.5 pr-4 text-ink-3">{label}</td>
                    <td className="py-2.5 text-right">{money(x)}</td>
                    <td className="py-2.5 text-right">{money(y)}</td>
                    <td className={`py-2.5 text-right font-medium ${d === 0 ? 'text-ink-5' : 'text-ink-2'}`}>
                      {d === 0 ? '—' : signed(d)}
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t border-line bg-pearl-soft">
                <td className="py-2.5 pr-4 font-semibold text-ink-2">Total deductions</td>
                <td className="py-2.5 text-right font-semibold">{money(r.from.totalDeductions)}</td>
                <td className="py-2.5 text-right font-semibold">{money(r.to.totalDeductions)}</td>
                <td className={`py-2.5 text-right font-semibold text-ink`}>
                  {signed(r.to.totalDeductions - r.from.totalDeductions)}
                </td>
              </tr>
              <tr className={'border-t-2 border-ink bg-pearl-soft'}>
                <td className="py-3 pr-4 text-base font-extrabold text-ink">Take-home</td>
                <td className="py-3 text-right text-base font-extrabold text-ink">{money(r.from.net)}</td>
                <td className="py-3 text-right text-base font-extrabold text-ink">{money(r.to.net)}</td>
                <td className={`py-3 text-right text-base font-extrabold ${tone}`}>{signed(r.netGapAnnual)}</td>
              </tr>
              <tr className="border-t border-line text-mute">
                <td className="py-2 pr-4">Monthly take-home</td>
                <td className="py-2 text-right">{money(r.from.netMonthly)}</td>
                <td className="py-2 text-right">{money(r.to.netMonthly)}</td>
                <td className={`py-2 text-right ${tone}`}>{signed(r.to.netMonthly - r.from.netMonthly)}</td>
              </tr>
              <tr className="border-t border-line text-mute">
                <td className="py-2 pr-4">Bi-weekly take-home</td>
                <td className="py-2 text-right">{money(r.from.netBiweekly)}</td>
                <td className="py-2 text-right">{money(r.to.netBiweekly)}</td>
                <td className={`py-2 text-right ${tone}`}>{signed(r.to.netBiweekly - r.from.netBiweekly)}</td>
              </tr>
              <tr className="border-t border-line text-mute">
                <td className="py-2 pr-4">Effective deduction rate</td>
                <td className="py-2 text-right">{r.from.effectiveRate}%</td>
                <td className="py-2 text-right">{r.to.effectiveRate}%</td>
                <td className="py-2 text-right">{(r.to.effectiveRate - r.from.effectiveRate).toFixed(1)} pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Ladder */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">All 13 provinces at {money(r.income)}</h2>
        <p className="mt-1 text-sm text-mute">Take-home pay on the same salary, everywhere in Canada. Yours are highlighted.</p>
        <div className="mt-4 space-y-1.5">
          {a.ladder.map((row, i) => {
            const mine = row.province === r.from.province || row.province === r.to.province;
            return (
              <div key={row.province} className="grid grid-cols-[1.5rem_9rem_1fr_5rem] items-center gap-2 text-sm">
                <span className="text-xs tabular-nums text-mute">{i + 1}</span>
                <span className={`truncate ${mine ? 'font-bold text-ink' : 'text-mute'}`}>{row.province}</span>
                <div className="h-3 rounded-full bg-pearl">
                  <div className={`h-3 rounded-full ${mine ? 'bg-red-600' : 'bg-ink-5'}`} style={{ width: `${(row.net / maxNet) * 100}%` }} />
                </div>
                <span className={`text-right tabular-nums ${mine ? 'font-bold text-ink' : 'text-mute'}`}>{money(row.net)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Dec 31 rule */}
      <section className="mt-10 rounded-2xl border border-line bg-white p-6 shadow-[inset_3px_0_0_#C8161A]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">The rule most people learn too late</p>
        <h2 className="mt-1 text-lg font-bold text-ink">Your December 31 address taxes the whole year</h2>
        <p className="mt-2 text-sm leading-6 text-ink-3">
          The CRA applies the provincial rates of wherever you live on <strong>December 31</strong> to your <strong>entire year’s</strong> income. Move in November and the whole year is re-rated by {r.to.province}; move in January and last year stays with {r.from.province}.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-pearl-soft p-4">
            <p className="text-xs font-semibold text-mute">Resident in {r.to.province} on Dec 31</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{money(r.dec31.ifResidentInToOnDec31)}</p>
            <p className="text-xs text-mute">provincial tax for the year</p>
          </div>
          <div className="rounded-xl bg-pearl-soft p-4">
            <p className="text-xs font-semibold text-mute">Resident in {r.from.province} on Dec 31</p>
            <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{money(r.dec31.ifResidentInFromOnDec31)}</p>
            <p className="text-xs text-mute">provincial tax for the year</p>
          </div>
        </div>
        <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold bg-pearl-soft text-ink`}>
          The swing a December 31 address makes: {signed(r.dec31.swing)} on this year’s provincial tax.
        </p>
        <p className="mt-3 text-xs leading-5 text-mute">
          Your employer withholds at the rates of the province where you work, so a late-year move usually shows up as a balance owing or a refund when you file — not on the paycheque.
        </p>
      </section>

      {/* Moving expenses */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Moving expenses you can deduct (line 21900)</h2>
        <p className="mt-2 text-sm leading-6 text-ink-3">
          If the new home is at least <strong>40 km closer</strong> to your new work or study location, eligible costs are deductible against income earned at the new location. Unused amounts carry forward.
        </p>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {[
            'Movers, truck rental, packing and storage',
            'Travel and meals for you and your household en route',
            'Up to 15 days of temporary lodging near either home',
            'Cost of cancelling a lease on the old home',
            'Selling costs on the old home (agent fees, legal)',
            'Utility hook-ups, disconnections, address changes',
          ].map((item) => (
            <li key={item} className="flex gap-2 rounded-lg border border-line bg-white px-3 py-2 text-ink-2">
              <span className="text-ink-4" aria-hidden="true">✓</span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-mute">Keep every receipt. The deduction is claimed on form T1-M with your return.</p>
      </section>

      {/* Sales tax */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink">Sales tax at the till</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[[r.from.province, salesTax.from, r.from.salesTaxTotal], [r.to.province, salesTax.to, r.to.salesTaxTotal]].map(([p, st, total]) => (
            <div key={String(p)} className="rounded-xl border border-line p-4">
              <p className="text-xs font-semibold text-mute">{String(p)}</p>
              <p className="mt-1 font-display text-2xl font-semibold tabular-nums text-ink">{String(total)}%</p>
              <p className="text-xs text-mute">{(st as { label: string }).label}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-ink-3">
          {r.salesTaxGapPoints === 0
            ? 'No difference at the till.'
            : `${Math.abs(r.salesTaxGapPoints)} percentage points ${r.salesTaxGapPoints > 0 ? 'more' : 'less'} on taxable spending — about ${money(Math.abs(perTenK))} per $10,000 of taxable purchases a year.`}
        </p>
      </section>

      {/* Honest scope */}
      {/* Landing guide */}
      <section className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600">The move after the move</p>
        <h2 className="mt-1 text-lg font-bold text-ink">Landing in {r.to.province}</h2>

        <ol className="mt-4 space-y-3">
          {FIRST_WEEKS.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-line bg-white p-4">
              <p className="text-sm font-bold text-ink"><span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white">{i + 1}</span>{step.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-ink-3">{step.body(r.to.province)}</p>
            </li>
          ))}
        </ol>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-line bg-white p-4">
            <h3 className="font-display text-base font-semibold text-ink">If your partner is job-hunting</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-6 text-ink-3">
              {SPOUSE_JOB(r.to.province).map((l) => <li key={l}>{l}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-white p-4">
            <h3 className="font-display text-base font-semibold text-ink">Schools, if you are moving with kids</h3>
            <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-6 text-ink-3">
              {SCHOOLS(r.to.province).map((l) => <li key={l}>{l}</li>)}
            </ul>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-line bg-white p-4">
          <h3 className="font-display text-base font-semibold text-ink">Who can help (free)</h3>
          <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm leading-6 text-ink-3">
            {WHO_HELPS.map((l) => <li key={l}>{l}</li>)}
          </ul>
          <p className="mt-2 text-xs text-mute">Institution names are the official bodies for {r.to.province}. Deadlines and waiting periods change, so none are printed here — the named office is always the current source.</p>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-ink">What this report does not price</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink-3">
          <li>Rent and housing costs — they vary more by city than by province; check CMHC’s rental market data for your destination.</li>
          <li>Car insurance, which differs sharply between public and private systems (BC, Saskatchewan, Manitoba, Quebec vs. the rest).</li>
          <li>Provincial health premiums, child benefits, and credits tied to family situation.</li>
        </ul>
        <p className="mt-3 text-xs text-mute">
          Every figure above is computed by the same tax engine as the free calculator for {r.taxYear}, single filer, standard credits. This is a calculation, not tax advice.
        </p>
      </section>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5 text-xs text-mute print:hidden">
        <span>Permanent link: <span className="font-mono">{permalink.replace('https://', '')}</span></span>
      </footer>
    </main>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">{value}</p>
      <p className="mt-0.5 text-xs text-mute">{sub}</p>
    </div>
  );
}
