'use client';
import { useT } from '../lib/i18n';

// TD1 spouse or common-law partner amount. Ticking it adds the federal and
// provincial spouse amounts (reduced by the spouse's net income) to the claim
// the employer withholds against — what happens when the employee files a TD1
// claiming it. The amounts per province are in constants.ts, each with its form.
export default function SpouseClaim({ value, onChange }: {
  value: number | null | undefined;
  onChange: (v: number | null) => void;
}) {
  const { t } = useT();
  const on = value != null;
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
      <label className="flex cursor-pointer items-start gap-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => onChange(e.target.checked ? 0 : null)}
          className="mt-0.5 h-4 w-4 accent-red-600"
        />
        <span>{t('sp.toggle')}</span>
      </label>
      {on && (
        <div className="mt-2 pl-6">
          <label htmlFor="spouse-income" className="block text-xs font-bold text-slate-700 mb-1">{t('sp.income')}</label>
          <div className="relative max-w-[12rem]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
            <input
              id="spouse-income"
              type="number"
              min="0"
              step="100"
              value={value || ''}
              placeholder="0"
              onFocus={(e) => e.target.select()}
              onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full rounded-lg border border-slate-300 py-1.5 pl-7 pr-2 text-sm font-bold focus:border-red-500 focus:outline-none"
            />
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{t('sp.hint')}</p>
        </div>
      )}
    </div>
  );
}
