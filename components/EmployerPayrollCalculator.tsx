'use client';
import { useMemo, useState } from 'react';
import { employerPayroll, PERIODS } from '../lib/employerPayroll';
import { PayFrequency, Province } from '../types';

/**
 * Employer view of one employee's pay: what to withhold, what the employer adds,
 * what to remit. No telemetry — the open dataset is people checking their OWN
 * pay, and an employer running payroll is a different question.
 */
const FREQ_LABEL: Record<string, string> = {
  [PayFrequency.WEEKLY]: 'Weekly (52)',
  [PayFrequency.BI_WEEKLY]: 'Bi-weekly (26)',
  [PayFrequency.SEMI_MONTHLY]: 'Semi-monthly (24)',
  [PayFrequency.MONTHLY]: 'Monthly (12)',
};
const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const money = (n: number) => n.toLocaleString('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function EmployerPayrollCalculator() {
  const [province, setProvince] = useState<string>(Province.ON);
  const [freq, setFreq] = useState<PayFrequency>(PayFrequency.BI_WEEKLY);
  const [amount, setAmount] = useState('60000');
  const [unit, setUnit] = useState<'year' | 'pay'>('year');

  const n = PERIODS[freq];
  const perPay = useMemo(() => {
    const v = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!(v > 0)) return 0;
    return unit === 'year' ? v / n : v;
  }, [amount, unit, n]);
  const p = useMemo(() => (perPay > 0 ? employerPayroll(province, perPay, freq) : null), [province, perPay, freq]);

  const qc = province === Province.QC;
  const pension = qc ? 'QPP' : 'CPP';
  const monthOf = (pay: number) => MONTH[Math.min(11, Math.floor(((pay - 0.5) / n) * 12))];
  const capLabel: Record<string, string> = { cpp: pension, cpp2: `${pension}2`, ei: 'EI', qpip: 'QPIP' };

  const rows = p
    ? [
        { label: 'Federal income tax', emp: p.firstPay.federalTax, er: null as number | null },
        { label: `${qc ? 'Quebec' : 'Provincial'} income tax`, emp: p.firstPay.provincialTax, er: null },
        { label: pension, emp: p.firstPay.cpp, er: p.firstPay.employerCpp },
        ...(p.year.cpp2 > 0 ? [{ label: `${pension}2`, emp: p.firstPay.cpp2, er: p.firstPay.employerCpp2 }] : []),
        { label: 'EI', emp: p.firstPay.ei, er: p.firstPay.employerEi },
        ...(qc ? [{ label: 'QPIP', emp: p.firstPay.qpip, er: p.firstPay.employerQpip }] : []),
      ]
    : [];
  const withheld = rows.reduce((s, r) => s + r.emp, 0);
  const added = rows.reduce((s, r) => s + (r.er ?? 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Province of employment
          <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800">
            {Object.values(Province).map((pv) => <option key={pv} value={pv}>{pv}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Pay frequency
          <select value={freq} onChange={(e) => setFreq(e.target.value as PayFrequency)} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-800">
            {Object.keys(PERIODS).map((f) => <option key={f} value={f}>{FREQ_LABEL[f]}</option>)}
          </select>
        </label>
        <div className="sm:col-span-2">
          <label htmlFor="er-amount" className="text-xs font-semibold uppercase tracking-wide text-slate-600">Employee&apos;s gross pay</label>
          <div className="mt-1 flex gap-2">
            <input
              id="er-amount"
              type="number"
              inputMode="decimal"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/-/g, ''))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
            />
            <select
              aria-label="Amount is per year or per pay"
              value={unit}
              onChange={(e) => {
                const next = e.target.value as 'year' | 'pay';
                const v = parseFloat(amount);
                if (next !== unit && v > 0) setAmount(next === 'pay' ? (v / n).toFixed(2) : String(Math.round(v * n)));
                setUnit(next);
              }}
              className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700"
            >
              <option value="year">per year</option>
              <option value="pay">per pay</option>
            </select>
          </div>
        </div>
      </div>

      {p && (
        <>
          <div className="mt-5 overflow-x-auto" tabIndex={0} role="region" aria-label="Deductions on this pay">
            <table className="min-w-full text-sm">
              <caption className="mb-2 text-left text-sm font-bold text-slate-900">
                One pay of {money(p.grossPerPay)} — the first of the year
              </caption>
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-600">
                  <th scope="col" className="py-2 pr-3 font-semibold"></th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">Withhold from employee</th>
                  <th scope="col" className="py-2 text-right font-semibold">Employer adds</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((r) => (
                  <tr key={r.label}>
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-700">{r.label}</th>
                    <td className="py-2 pr-3 text-right tabular-nums text-slate-800">{money(r.emp)}</td>
                    <td className="py-2 text-right tabular-nums text-slate-800">{r.er === null ? '—' : money(r.er)}</td>
                  </tr>
                ))}
                <tr className="font-bold text-slate-900">
                  <th scope="row" className="py-2 pr-3 text-left">Total</th>
                  <td className="py-2 pr-3 text-right tabular-nums">{money(withheld)}</td>
                  <td className="py-2 text-right tabular-nums">{money(added)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Employee&apos;s net pay</p>
              <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">{money(p.firstPay.netPay)}</p>
            </div>
            <div className="rounded-xl bg-red-700 p-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Remit to the CRA</p>
              <p className="mt-1 text-xl font-extrabold tabular-nums">{money(p.firstPay.remitCra)}</p>
              {qc && <p className="mt-1 text-xs opacity-90">+ {money(p.firstPay.remitQuebec)} to Revenu Québec</p>}
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Cost of this pay</p>
              <p className="mt-1 text-xl font-extrabold tabular-nums text-slate-900">{money(p.firstPay.employerCost)}</p>
            </div>
          </div>

          <div className="mt-4 text-sm leading-6 text-slate-700">
            <p>
              <strong>Over the year:</strong> {money(p.year.gross)} gross costs you{' '}
              <strong>{money(p.year.employerCost)}</strong> ({money(p.year.employerCost - p.year.gross)} in employer{' '}
              {qc ? `${pension}, EI and QPIP` : `${pension} and EI`}).
            </p>
            {(p.caps.length > 0 || p.cpp2Starts) && (
              <ul className="mt-1 list-disc pl-5">
                {[
                  ...p.caps.map((c) => ({ pay: c.pay, text: `${capLabel[c.kind]} reaches its annual maximum on pay ${c.pay} (${monthOf(c.pay)}) — deduct and match nothing after it.` })),
                  ...(p.cpp2Starts ? [{ pay: p.cpp2Starts - 0.5, text: `${pension}2 starts on pay ${p.cpp2Starts} (${monthOf(p.cpp2Starts)}), once earnings pass the first ceiling.` }] : []),
                ]
                  .sort((a, b) => a.pay - b.pay)
                  .map((x) => <li key={x.text}>{x.text}</li>)}
              </ul>
            )}
          </div>
        </>
      )}

      <p className="mt-4 text-xs leading-5 text-slate-600">
        2026 rates, basic personal amounts (TD1 claim code 1), nothing deducted yet this year. Not included: provincial
        employer health taxes, Quebec HSF and CNESST, workers&apos; compensation, vacation pay, benefits.
      </p>
    </div>
  );
}
