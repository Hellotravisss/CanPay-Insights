'use client';
import { useMemo, useState } from 'react';
import type { AnnualSalaryInputs } from '../types';
import { useT } from '../lib/i18n';
import { grossForNet } from '../utils/reverseSalary';
import { recordCalcEvent } from '../lib/telemetry';

// Net → gross: "I want to keep $X; what salary is that?" The answer comes from
// the engine itself (utils/reverseSalary), with every other input the visitor
// has set, so it can never disagree with the forward calculation.
const money = (n: number) => '$' + Math.round(n).toLocaleString('en-CA');

export default function ReverseSalary({ inputs, setInputs }: {
  inputs: AnnualSalaryInputs;
  setInputs: React.Dispatch<React.SetStateAction<AnnualSalaryInputs>>;
}) {
  const { t, lang } = useT();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState<'month' | 'year'>('month');

  const targetAnnual = useMemo(() => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ''));
    return n > 0 ? (unit === 'month' ? n * 12 : n) : 0;
  }, [amount, unit]);

  const gross = useMemo(
    () => (targetAnnual ? grossForNet(targetAnnual, { ...inputs, annualSalary: 0 }) : null),
    [targetAnnual, inputs],
  );

  const use = () => {
    if (!gross) return;
    setInputs({ ...inputs, annualSalary: gross });
    recordCalcEvent({ mode: 'annual', province: inputs.province, annualIncome: gross, lang, reverseTargetMonthly: targetAnnual / 12 });
  };

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left text-sm font-semibold text-red-700 hover:text-red-800"
      >
        {open ? '− ' : '+ '}{t('annual.revToggle')}
      </button>
      {open && (
        <div className="mt-3">
          <label htmlFor="rev-amount" className="block text-xs font-bold text-slate-700 mb-1">{t('annual.revLabel')}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <input
                id="rev-amount"
                type="number"
                inputMode="decimal"
                min="0"
                value={amount}
                onFocus={(e) => e.target.select()}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={unit === 'month' ? '5,000' : '60,000'}
                className="w-full rounded-lg border-2 border-slate-200 py-2 pl-7 pr-3 font-bold focus:border-red-500 focus:outline-none"
              />
            </div>
            <select
              aria-label={t('annual.revLabel')}
              value={unit}
              onChange={(e) => setUnit(e.target.value as 'month' | 'year')}
              className="rounded-lg border-2 border-slate-200 bg-white px-2 text-sm"
            >
              <option value="month">{t('annual.revMonth')}</option>
              <option value="year">{t('annual.revYear')}</option>
            </select>
          </div>
          {targetAnnual > 0 && (
            <div className="mt-3" role="status" aria-live="polite">
              {gross === null ? (
                <p className="text-sm text-slate-600">{t('annual.revNone')}</p>
              ) : (
                <>
                  <p className="text-sm text-slate-700">
                    {t('annual.revResult')}
                    <strong className="text-lg text-slate-900"> {money(gross)}</strong>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{t('annual.revBasis')}</p>
                  <button
                    type="button"
                    onClick={use}
                    className="mt-2 rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    {t('annual.revUse')}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
