import React from 'react';
import {
  PROVINCIAL_WAGES,
  PROVINCE_LABELS,
  INDUSTRY_LABELS,
  WAGE_DATA_YEAR,
  annualFromHourly,
} from '../lib/provincialWages';

// Unique context for a salary x province page.
//
// These pages were noindexed because they were near-identical templates, and
// that criticism was fair: swap two numbers and every page read the same. The
// fix is not to remove the template but to give each page something only it can
// say — where this exact salary sits against Statistics Canada wages for that
// exact province, and which sectors actually pay it. Every figure here is
// official data or computed by our own engine.

const PROV_CODE: Record<string, string> = {
  ontario: 'ON', quebec: 'QC', bc: 'BC', 'british-columbia': 'BC', alberta: 'AB',
  manitoba: 'MB', saskatchewan: 'SK', 'nova-scotia': 'NS', 'new-brunswick': 'NB',
  newfoundland: 'NL', 'newfoundland-and-labrador': 'NL', pei: 'PE',
  'prince-edward-island': 'PE',
};

const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

export default function SalaryContext({
  amount,
  provinceSlug,
}: {
  amount: number;
  provinceSlug: string;
}) {
  const code = PROV_CODE[provinceSlug];
  // The three territories are not published in the wage table; rather than
  // borrowing a province's figures, the section simply does not render.
  if (!code || !PROVINCIAL_WAGES['all-industries']?.[code]) return null;

  const province = PROVINCE_LABELS[code];
  const medianHourly = PROVINCIAL_WAGES['all-industries'][code];
  const medianAnnual = annualFromHourly(medianHourly);
  const ratio = amount / medianAnnual;
  const hourly = amount / 2080;

  // Sectors whose provincial median lands closest to this salary — the honest
  // way to answer "who actually earns this?" without inventing job titles.
  const sectors = Object.keys(PROVINCIAL_WAGES)
    .filter((k) => k !== 'all-industries' && PROVINCIAL_WAGES[k]?.[code])
    .map((k) => ({
      slug: k,
      label: INDUSTRY_LABELS[k],
      hourly: PROVINCIAL_WAGES[k][code],
      annual: annualFromHourly(PROVINCIAL_WAGES[k][code]),
    }))
    .sort((a, b) => Math.abs(a.annual - amount) - Math.abs(b.annual - amount))
    .slice(0, 4);

  const pct = Math.round((ratio - 1) * 100);
  const verdict =
    Math.abs(pct) <= 5
      ? `almost exactly the ${province} median`
      : pct > 0
        ? `about ${pct}% above the ${province} median`
        : `about ${Math.abs(pct)}% below the ${province} median`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-2xl font-bold text-slate-900">
        Is {money(amount)} a good salary in {province}?
      </h2>

      <p className="leading-8 text-slate-600">
        The median full-time wage in {province} is{' '}
        <strong className="text-slate-800">${medianHourly.toFixed(2)} an hour</strong> — about{' '}
        <strong className="text-slate-800">{money(medianAnnual)} a year</strong>. At {money(amount)},
        this salary is <strong className="text-slate-800">{verdict}</strong>, and works out to{' '}
        <strong className="text-slate-800">${hourly.toFixed(2)} an hour</strong> on a 40-hour week.
      </p>

      {/* Position bar: one glance instead of a paragraph of comparison. */}
      <div className="mt-5">
        <div className="relative h-2.5 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-red-500">
          <div
            className="absolute -top-1 h-4.5 w-1 rounded bg-slate-600"
            style={{ left: '50%', height: '18px', top: '-4px' }}
            aria-hidden="true"
          />
          <div
            className="absolute -top-1.5 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-red-600 shadow"
            style={{ left: `${Math.min(97, Math.max(3, (ratio / 2) * 100))}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-slate-400">
          <span>lower</span>
          <span>{province} median · {money(medianAnnual)}</span>
          <span>2× median</span>
        </div>
      </div>

      <h3 className="mb-2 mt-8 text-lg font-bold text-slate-800">
        Which industries pay around {money(amount)} in {province}?
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b-2 border-slate-300 text-slate-900">
              <th className="py-2 pr-4 font-bold">Industry</th>
              <th className="py-2 pr-4 font-bold">Median wage</th>
              <th className="py-2 font-bold">Median salary</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            {sectors.map((s) => (
              <tr key={s.slug} className="border-b border-slate-200">
                <td className="py-2 pr-4">
                  <a
                    href={`/wages/${s.slug}-wages-${provinceSlug === 'bc' ? 'british-columbia' : provinceSlug}`}
                    className="font-medium text-slate-800 underline-offset-2 hover:text-red-600 hover:underline"
                  >
                    {s.label}
                  </a>
                </td>
                <td className="py-2 pr-4 tabular-nums">${s.hourly.toFixed(2)}/hr</td>
                <td className="py-2 tabular-nums">{money(s.annual)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-400">
        Wage figures: Statistics Canada, Table 14-10-0064-01, median hourly wage of full-time
        employees, {WAGE_DATA_YEAR}. Take-home figures on this page are computed with the CanPay
        Insights 2026 tax engine.
      </p>
    </section>
  );
}
