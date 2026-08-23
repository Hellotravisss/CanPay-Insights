import Link from 'next/link';
import type { RelocationReport as R } from '../../../lib/relocationReport';

const money = (n: number) => `$${Math.abs(n).toLocaleString('en-CA')}`;
const signed = (n: number) => (n >= 0 ? '+' : '−') + money(n);

/**
 * The Province Move Report. Every figure is computed; the prose only says
 * what the figures mean. Built to be printed and to be read a month later.
 */
export default function RelocationReport({
  report: r,
  salesTax,
  email,
  permalink,
}: {
  report: R;
  salesTax: { from: { gst: number; pst: number; label: string }; to: { gst: number; pst: number; label: string } };
  email: string | null;
  permalink: string;
}) {
  const gain = r.netGapAnnual >= 0;
  const isQC = (p: string) => p === 'Quebec';
  const cppLabel = isQC(r.from.province) || isQC(r.to.province) ? 'CPP / QPP' : 'CPP';
  const eiLabel = isQC(r.from.province) || isQC(r.to.province) ? 'EI (+ QPIP in Quebec)' : 'EI';
  const perTenK = Math.round(r.salesTaxGapPoints * 100); // $ difference per $10,000 taxable spend

  const rows: [string, number, number][] = [
    ['Gross salary', r.from.gross, r.to.gross],
    ['Federal tax', r.from.federalTax, r.to.federalTax],
    ['Provincial tax', r.from.provincialTax, r.to.provincialTax],
    [cppLabel, r.from.cpp, r.to.cpp],
    [eiLabel, r.from.ei, r.to.ei],
    ['Total deductions', r.from.totalDeductions, r.to.totalDeductions],
  ];

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 font-sans text-slate-800 print:py-4">
      {/* Masthead */}
      <header className="border-b-4 border-red-600 pb-5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg" />
          <span className="text-lg font-bold">
            CanPay <span className="font-normal text-red-600">Insights</span>
          </span>
          <span className="ml-auto text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
            Province Move Report · {r.taxYear}
          </span>
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          {r.from.province} <span className="text-red-600">→</span> {r.to.province}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          On a {money(r.income)} salary · {r.taxYear} federal and provincial rates · single filer, standard credits
        </p>
      </header>

      {/* The number */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Take-home pay after the move</p>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <span className={`text-5xl font-extrabold tabular-nums ${gain ? 'text-emerald-700' : 'text-red-600'}`}>
            {signed(r.netGapAnnual)}
          </span>
          <span className="text-lg text-slate-600">a year</span>
          <span className="text-lg text-slate-400">·</span>
          <span className="text-lg tabular-nums text-slate-600">{signed(r.netGapMonthly)} a month</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {gain
            ? `Same salary, ${money(r.netGapAnnual)} more in your account each year in ${r.to.province}. `
            : `Same salary, ${money(r.netGapAnnual)} less in your account each year in ${r.to.province}. `}
          {Math.abs(r.netGapAnnual) < 500
            ? 'At this income the two provinces are close enough that taxes should not decide the move — the sections below matter more.'
            : 'This is payroll only; the December 31 rule and sales tax below can move the real answer further.'}
        </p>
      </section>

      {/* Side by side */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-slate-900">Where each dollar goes</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4 font-semibold">Annual</th>
                <th className="py-2 px-3 text-right font-semibold">{r.from.province}</th>
                <th className="py-2 px-3 text-right font-semibold">{r.to.province}</th>
                <th className="py-2 pl-3 text-right font-semibold">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, a, b]) => (
                <tr key={label} className="border-b border-slate-100">
                  <td className="py-2 pr-4 text-slate-600">{label}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{money(a)}</td>
                  <td className="py-2 px-3 text-right tabular-nums">{money(b)}</td>
                  <td className={`py-2 pl-3 text-right tabular-nums ${b - a === 0 ? 'text-slate-400' : b - a > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {b - a === 0 ? '—' : signed(b - a)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 font-bold">
                <td className="py-2.5 pr-4">Take-home</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{money(r.from.net)}</td>
                <td className="py-2.5 px-3 text-right tabular-nums">{money(r.to.net)}</td>
                <td className={`py-2.5 pl-3 text-right tabular-nums ${gain ? 'text-emerald-700' : 'text-red-600'}`}>{signed(r.netGapAnnual)}</td>
              </tr>
              <tr className="text-slate-500">
                <td className="py-1.5 pr-4">Monthly take-home</td>
                <td className="py-1.5 px-3 text-right tabular-nums">{money(r.from.netMonthly)}</td>
                <td className="py-1.5 px-3 text-right tabular-nums">{money(r.to.netMonthly)}</td>
                <td className="py-1.5 pl-3 text-right tabular-nums">{signed(r.to.netMonthly - r.from.netMonthly)}</td>
              </tr>
              <tr className="text-slate-500">
                <td className="py-1.5 pr-4">Bi-weekly take-home</td>
                <td className="py-1.5 px-3 text-right tabular-nums">{money(r.from.netBiweekly)}</td>
                <td className="py-1.5 px-3 text-right tabular-nums">{money(r.to.netBiweekly)}</td>
                <td className="py-1.5 pl-3 text-right tabular-nums">{signed(r.to.netBiweekly - r.from.netBiweekly)}</td>
              </tr>
              <tr className="text-slate-500">
                <td className="py-1.5 pr-4">Effective deduction rate</td>
                <td className="py-1.5 px-3 text-right tabular-nums">{r.from.effectiveRate}%</td>
                <td className="py-1.5 px-3 text-right tabular-nums">{r.to.effectiveRate}%</td>
                <td className="py-1.5 pl-3 text-right tabular-nums">{(r.to.effectiveRate - r.from.effectiveRate).toFixed(1)} pts</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          In the Difference column, red means more is deducted in {r.to.province}; green means less.
        </p>
      </section>

      {/* Dec 31 rule */}
      <section className="mt-10 rounded-2xl border-2 border-red-200 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">The rule most movers learn too late</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900">Your December 31 address taxes the whole year</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The CRA charges provincial income tax for the entire year based on where you live on December 31 —
          not on how many months you spent in each province. Move on December 20 and all twelve months are
          taxed at {r.to.province} rates. Move on January 5 and the previous year stays at {r.from.province} rates.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Resident in {r.from.province} on Dec 31</div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{money(r.dec31.ifResidentInFromOnDec31)}</div>
            <div className="text-xs text-slate-500">provincial tax for the year</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="text-xs text-slate-500">Resident in {r.to.province} on Dec 31</div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{money(r.dec31.ifResidentInToOnDec31)}</div>
            <div className="text-xs text-slate-500">provincial tax for the year</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          <strong>What the date is worth to you: {money(r.dec31.swing)} of provincial tax on this salary.</strong>{' '}
          {r.dec31.swing < 0
            ? `${r.to.province} is the lighter province, so being resident there by December 31 saves ${money(r.dec31.swing)} on the whole year — even if you arrived in December.`
            : r.dec31.swing > 0
              ? `${r.to.province} is the heavier province, so if the timing is yours to choose, arriving in early January keeps the previous year at ${r.from.province} rates and avoids ${money(r.dec31.swing)}.`
              : 'The two provinces tax this salary identically, so the date does not matter for provincial tax.'}
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Your employer keeps withholding at the old province’s rates until you hand in a new TD1 for the new
          province, so a mid-year move usually shows up as a refund or a balance owing at filing time — the
          difference above is roughly that amount.
        </p>
      </section>

      {/* Moving expenses */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">Moving expenses you can deduct (line 21900)</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          If your new home is at least <strong>40 km closer</strong> to your new job, business, or full-time
          post-secondary program than the old one was, the move itself is deductible against the income you earn
          at the new location. Unused amounts carry forward to the next year.
        </p>
        <ul className="mt-3 grid gap-1.5 text-sm text-slate-700 sm:grid-cols-2">
          {[
            'Movers, truck rental, packing, and storage in transit',
            'Travel for you and your household (vehicle, flights, meals)',
            'Up to 15 days of temporary lodging and meals near either home',
            'Lease-cancellation costs on the old rental',
            'Selling the old home: commission, legal fees, advertising',
            'Buying the new home: legal fees and land-transfer tax (if you sold the old one)',
            'Utility hookups and disconnections, address changes, document replacement',
            'Up to $5,000 of carrying costs on a vacant old home you are trying to sell',
          ].map((t) => (
            <li key={t} className="flex gap-2">
              <span className="text-red-600">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-slate-500">
          Keep every receipt. Claim on form T1-M with your return; the CRA asks for support on this line more
          often than on most others.
        </p>
      </section>

      {/* Sales tax */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-slate-900">Sales tax at the till</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            { p: r.from.province, s: salesTax.from, total: r.from.salesTaxTotal },
            { p: r.to.province, s: salesTax.to, total: r.to.salesTaxTotal },
          ].map(({ p, s, total }) => (
            <div key={p} className="rounded-xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500">{p}</div>
              <div className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{total}%</div>
              <div className="text-xs text-slate-500">
                {s.label}
                {s.pst > 0 && s.label.startsWith('GST') ? ` — ${s.gst}% federal + ${s.pst}% provincial` : ''}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {perTenK === 0
            ? 'Both provinces charge the same rate at the till, so everyday spending is a wash.'
            : `That is ${money(perTenK)} ${perTenK > 0 ? 'more' : 'less'} tax for every $10,000 of taxable spending in ${r.to.province}. On $20,000 a year of taxable purchases — furniture, electronics, restaurants, services — the gap is ${money(perTenK * 2)}.`}
        </p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          Basic groceries, rent, and most prescription drugs are not taxed at the till in any province, which
          is why the figure is shown per $10,000 of taxable spending rather than per dollar of income.
        </p>
      </section>

      {/* What's not here */}
      <section className="mt-10 rounded-2xl bg-slate-50 p-6">
        <h2 className="text-base font-bold text-slate-900">What this report does not price</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Rent, home prices, auto insurance, and provincial health premiums differ between provinces and can
          outweigh every number above. They are not in this report because they depend on the city and on
          you, not on the tax tables — and we only print figures we can compute. The official sources:
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          <li>
            <a className="text-red-700 underline" href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market/rental-market-report-data-tables" rel="noopener" target="_blank">
              CMHC Rental Market Report
            </a>{' '}
            <span className="text-slate-500">— average rents by city and bedroom count</span>
          </li>
          <li>
            <a className="text-red-700 underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-21900-moving-expenses.html" rel="noopener" target="_blank">
              CRA — Line 21900 moving expenses
            </a>
          </li>
          <li>
            <a className="text-red-700 underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/provincial-territorial-tax-credits-individuals.html" rel="noopener" target="_blank">
              CRA — which province’s tax you pay
            </a>
          </li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
        <p>
          <strong className="text-slate-700">How this was computed.</strong> Every dollar figure comes from the
          same {r.taxYear} tax engine that powers the free CanPay Insights calculator — the one our build
          pipeline audits against published CRA and provincial rates before anything goes live. Assumes a
          single filer with basic personal amounts, standard CPP/QPP and EI/QPIP, no RRSP contributions, and
          no other credits. Sales tax rates are the statutory rates in force for {r.taxYear}.
        </p>
        <p className="mt-2">
          This is a calculation, not tax advice. For a move involving self-employment, a spouse, or
          significant investment income, a CPA’s review is worth the fee.
        </p>
        <p className="mt-3">
          <strong className="text-slate-700">Keep this link — it is your receipt’s twin and works forever:</strong>
          <br />
          <span className="break-all font-mono text-[11px]">{permalink}</span>
          {email && <><br />A copy of the receipt went to {email}.</>}
        </p>
        <p className="mt-3 print:hidden">
          <Link href="/" className="text-red-700 underline">Back to the calculator</Link> ·{' '}
          <span className="text-slate-400">Press ⌘P / Ctrl+P to save as PDF.</span>
        </p>
      </footer>
    </main>
  );
}
