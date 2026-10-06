'use client';
import { useState } from 'react';
import { recordCalcEvent } from '../lib/telemetry';

/**
 * One question where it fits best: right after someone compares provinces.
 * Whether they are actually moving is the line between curiosity and
 * relocation intent, and only this moment can ask it. One tap, optional,
 * recorded as a label next to the provinces compared and the income range.
 */
const OPTIONS: { key: 'planning' | 'maybe' | 'curious'; label: string }[] = [
  { key: 'planning', label: 'Yes, planning to move' },
  { key: 'maybe', label: 'Maybe' },
  { key: 'curious', label: 'Just curious' },
];

export default function MoveIntentPrompt({ provinces, annualSalary }: { provinces: string[]; annualSalary: number }) {
  const [picked, setPicked] = useState<string | null>(null);
  if (provinces.length < 2 || !annualSalary) return null;
  const pick = (k: 'planning' | 'maybe' | 'curious') => {
    setPicked(k);
    recordCalcEvent({ mode: 'annual', province: provinces[0], annualIncome: annualSalary, lang: 'en', comparedProvinces: provinces, moveIntent: k });
  };
  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-4">
      {picked ? (
        <p className="text-sm leading-6 text-slate-700">
          Thanks. Worth knowing if you do move: you pay that year’s provincial tax to the province you live in on
          December 31, for the whole year.
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700">Are you actually thinking of moving?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {OPTIONS.map((o) => (
              <button key={o.key} onClick={() => pick(o.key)}
                className="inline-flex min-h-10 items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-red-300 hover:bg-red-50 hover:text-red-700">
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
