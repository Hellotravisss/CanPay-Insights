'use client';
import { useMemo, useState } from 'react';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';

/**
 * Salary ↔ hourly, before and after tax. "salary to hourly calculator" had 545
 * impressions in four weeks and no clicks: no page of ours did the conversion.
 * Gross is plain arithmetic (hours × 52 weeks); after-tax comes from the
 * engine's annual net, spread over the same hours. No telemetry.
 */
const money = (n: number, d = 2) => n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: d, maximumFractionDigits: d });

export default function SalaryHourlyConverter() {
  const [amount, setAmount] = useState('60000');
  const [unit, setUnit] = useState<'year' | 'hour'>('year');
  const [hours, setHours] = useState('40');
  const [slug, setSlug] = useState('ontario');

  const h = Math.min(80, Math.max(1, parseFloat(hours) || 40));
  const perYear = h * 52;
  const annual = useMemo(() => {
    const v = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!(v > 0)) return 0;
    return unit === 'year' ? v : v * perYear;
  }, [amount, unit, perYear]);
  const net = useMemo(() => (annual > 0 ? getSalaryFigures(annual, slug).netAnnual : 0), [annual, slug]);
  const province = PROVINCE_SEO_CONFIGS.find((p) => p.slug === slug)?.name ?? 'Ontario';

  const rows: Array<[string, number]> = [
    ['Hourly', perYear],
    [`Daily (${+(h / 5).toFixed(2)} h)`, 5 * 52],
    ['Weekly', 52],
    ['Bi-weekly', 26],
    ['Semi-monthly', 24],
    ['Monthly', 12],
    ['Yearly', 1],
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="sh-amount" className="text-xs font-semibold uppercase tracking-wide text-slate-600">Pay</label>
          <div className="mt-1 flex gap-2">
            <input
              id="sh-amount"
              type="number"
              inputMode="decimal"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/-/g, ''))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
            <select
              aria-label="Pay is per year or per hour"
              value={unit}
              onChange={(e) => {
                const next = e.target.value as 'year' | 'hour';
                const v = parseFloat(amount);
                if (next !== unit && v > 0) setAmount(next === 'hour' ? (v / perYear).toFixed(2) : String(Math.round(v * perYear)));
                setUnit(next);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700"
            >
              <option value="year">per year</option>
              <option value="hour">per hour</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="sh-hours" className="text-xs font-semibold uppercase tracking-wide text-slate-600">Hours a week</label>
          <input
            id="sh-hours"
            type="number"
            inputMode="decimal"
            min={1}
            max={80}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(e.target.value.replace(/-/g, ''))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
          />
        </div>
        <div className="sm:col-span-3">
          <label htmlFor="sh-province" className="text-xs font-semibold uppercase tracking-wide text-slate-600">Province for after-tax pay</label>
          <select id="sh-province" value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800">
            {PROVINCE_SEO_CONFIGS.map((p) => <option key={p.slug} value={p.slug}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {annual > 0 && (
        <div className="mt-5 overflow-x-auto" tabIndex={0} role="region" aria-label="Pay converted">
          <table className="min-w-full text-sm">
            <caption className="mb-2 text-left text-sm font-bold text-slate-900">
              {money(annual, 0)} a year = {money(annual / perYear)} an hour at {h} hours a week
            </caption>
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-600">
                <th scope="col" className="py-2 pr-3 font-semibold"></th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Before tax</th>
                <th scope="col" className="py-2 text-right font-semibold">After tax · {province}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(([label, per]) => (
                <tr key={label}>
                  <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-700">{label}</th>
                  <td className="py-2 pr-3 text-right tabular-nums text-slate-800">{money(annual / per, label === 'Yearly' ? 0 : 2)}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-slate-900">{money(net / per, label === 'Yearly' ? 0 : 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-600">
        {h} hours × 52 weeks = {perYear.toLocaleString('en-CA')} hours a year, paid holidays and vacation counted as worked.
        After tax: 2026 federal and provincial income tax, CPP or QPP, EI (and QPIP in Quebec), basic personal amounts.
      </p>
    </div>
  );
}
