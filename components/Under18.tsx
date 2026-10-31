'use client';
import { useT } from '../lib/i18n';

// Under 18: no CPP/QPP. Contributions start with the first pay dated in the
// month after the 18th birthday (CRA; Revenu Québec for QPP). EI and income
// tax do not depend on age, so nothing else changes.
export default function Under18({ value, onChange }: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
}) {
  const { t } = useT();
  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
      <label className="flex cursor-pointer items-start gap-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-red-600"
        />
        <span>{t('u18.toggle')}</span>
      </label>
      {value && <p className="mt-1.5 pl-6 text-xs leading-5 text-slate-500">{t('u18.hint')}</p>}
    </div>
  );
}
