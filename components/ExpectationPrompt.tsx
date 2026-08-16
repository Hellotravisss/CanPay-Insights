'use client';
import { useState } from 'react';
import { recordCalcEvent, type Expectation } from '../lib/telemetry';
import type { CalculationMode as CalcMode } from '../types';

/**
 * One tap: was that more or less than you expected?
 *
 * The only field on this site that no statistics agency can ever collect. A
 * payroll record knows what you take home; nobody records what you THOUGHT you
 * took home, and the gap between the two is the entire emotional premise of
 * this calculator. It is also the most quotable number the dataset will ever
 * produce.
 *
 * PLACEMENT IS THE WHOLE DESIGN. The existing intent prompt asks a comparable
 * question and has been answered 0.4% of the time — not because the question
 * is bad but because it sits two components below the result, and people leave
 * once they have their number. This sits directly under the figure, at the
 * moment of reaction, when "less than I thought" is what the person is already
 * feeling rather than a survey to fill in.
 *
 * Three options, no free text, no required answer, and it disappears once
 * answered. A forced version of this question would collect more rows and less
 * truth: whoever cannot be bothered picks the first button, and afterwards
 * there is no way to tell those apart from real answers.
 */

const DICT: Record<string, Record<string, string>> = {
  en: {
    prompt: 'Is that more or less than you expected?',
    lower: 'Less than I thought',
    higher: 'More than I thought',
    'as-expected': 'About right',
    thanks: 'Thanks — that helps.',
    hint: 'Anonymous. We publish only totals, never your figures.',
  },
  zh: {
    prompt: '这个数字比你预想的高还是低?',
    lower: '比我想的少',
    higher: '比我想的多',
    'as-expected': '差不多',
    thanks: '谢谢,这很有帮助。',
    hint: '匿名统计,只发布汇总数字,绝不公开你的金额。',
  },
  fr: {
    prompt: "Est-ce plus ou moins que ce que vous pensiez ?",
    lower: 'Moins que prévu',
    higher: 'Plus que prévu',
    'as-expected': 'À peu près juste',
    thanks: 'Merci, cela nous aide.',
    hint: 'Anonyme. Nous publions uniquement des totaux.',
  },
};

const OPTIONS: { key: Expectation; emoji: string }[] = [
  { key: 'lower', emoji: '😖' },
  { key: 'as-expected', emoji: '😐' },
  { key: 'higher', emoji: '🙂' },
];

// One answer per page load — a second tap is someone changing their mind, not
// a second data point.
let answeredThisPageLoad = false;

export default function ExpectationPrompt({
  mode,
  province,
  annualIncome,
  lang,
}: {
  mode: string;
  province: string;
  annualIncome: number;
  lang: string;
}) {
  const t = DICT[lang] ?? DICT.en;
  const [picked, setPicked] = useState<Expectation | null>(null);

  if (!annualIncome || annualIncome <= 0) return null;

  const choose = (expectation: Expectation) => {
    setPicked(expectation);
    if (answeredThisPageLoad) return;
    answeredThisPageLoad = true;
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, expectation });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      {picked ? (
        <p className="text-sm font-medium text-emerald-700">✓ {t.thanks}</p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-700">{t.prompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => choose(o.key)}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <span aria-hidden="true">{o.emoji}</span>
                {t[o.key]}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] leading-4 text-slate-400">{t.hint}</p>
        </>
      )}
    </div>
  );
}
