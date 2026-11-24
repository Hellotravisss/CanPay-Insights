'use client';
import React from 'react';
import { calculateFromAnnualSalary } from '../utils/taxEngine';
import { AnnualSalaryInputs, PayFrequency, Province } from '../types';
import { useT } from '../lib/i18n';

/**
 * The home page's worked example: one real pay cheque, computed by the engine on render (never typed in),
 * so the figure on the front page is always the current rules. $60,000 in Ontario, paid every two weeks.
 * Uses only existing translation keys plus numbers, so it reads in all ten languages.
 */
const money = (v: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(v);
const whole = (v: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v);

export default function HomeExample({ base, onTry }: { base: AnnualSalaryInputs; onTry: () => void }) {
  const { t } = useT();
  const r = React.useMemo(
    () => calculateFromAnnualSalary({ ...base, province: Province.ON, annualSalary: 60000, payFrequency: PayFrequency.BI_WEEKLY }),
    [base],
  );
  const gross = r.grossPayPerPeriod || r.grossPayBiWeekly;
  const net = r.netPayPerPeriod || r.netPayBiWeekly;
  const rows: [string, number, string][] = [
    [t('res.federalTax'), r.federalTax, '#2B2E36'],
    [`${t('res.provincialTax')} (ON)`, r.provincialTax, '#535866'],
    [t('res.cppEiAmp'), r.cppDeduction + r.eiDeduction, '#7C818D'],
  ];
  const keptPct = gross > 0 ? (net / gross) * 100 : 0;

  return (
    <figure className="relative" aria-label={`${whole(60000)} · Ontario · ${t('res.biweekly')}`}>
      {/* the stub sits on a second sheet, slightly turned: a pay cheque on a desk, not a dashboard */}
      <div aria-hidden="true" className="absolute inset-x-6 -bottom-3 top-6 rotate-[2.5deg] rounded-[28px] border border-line bg-white/70" />
      <div className="relative rounded-[28px] border border-line bg-white p-5 shadow-[0_30px_60px_-30px_rgba(21,23,28,0.35)] sm:p-6">
        <div className="mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">
          <span>{whole(60000)} · Ontario</span>
          <span>{t('res.biweekly')}</span>
        </div>

        <div className="card-brand-3d relative overflow-hidden rounded-2xl p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-100">{t('res.netPay')}</p>
          <p className="mt-1 font-display text-[2.75rem] font-semibold leading-none tabular-nums">{money(net)}</p>
          <p className="mt-2 text-sm text-red-100 tabular-nums">{t('res.grossPay')} {money(gross)}</p>
        </div>

        <div className="mt-5 flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
          <div className="h-full rounded-l-full bg-[#C8161A]" style={{ width: `${keptPct}%` }} />
          {rows.map(([name, v, c], i) => (
            <div key={name} className={`h-full ${i === rows.length - 1 ? 'rounded-r-full' : ''}`} style={{ width: `${(v / gross) * 100}%`, background: c }} />
          ))}
        </div>

        <dl className="mt-4 divide-y divide-line text-sm tabular-nums">
          {rows.map(([name, v, c]) => (
            <div key={name} className="flex items-center justify-between gap-3 py-2.5">
              <dt className="flex items-center gap-2 text-ink-3">
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c }} />
                {name}
              </dt>
              <dd className="text-ink-2">− {money(v)}</dd>
            </div>
          ))}
        </dl>

        <button
          type="button"
          onClick={onTry}
          className="mt-4 w-full rounded-xl border border-line bg-pearl-soft py-3 text-sm font-semibold text-ink transition-colors hover:border-ink-5"
        >
          {t('res.annualProjection')}: <span className="text-red-600 tabular-nums">{whole(r.netPayAnnual)}</span> →
        </button>
      </div>
    </figure>
  );
}
