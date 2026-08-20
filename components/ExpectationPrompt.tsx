'use client';
import { useState } from 'react';
import {
  recordCalcEvent,
  type Expectation,
  type WorkArrangement,
  type AgeBand,
} from '../lib/telemetry';
import type { CalculationMode as CalcMode } from '../types';

/**
 * A progressive prompt: one tap, one question, and the next question only
 * appears after the previous one is answered. Stop anywhere — nothing is
 * required, and whatever was answered is already recorded.
 *
 * Q1 (expectation) is the field no statistics agency can ever collect: nobody
 * records what people THOUGHT they would take home. Q2 (where you work) rides
 * on a real tax hook — remote and hybrid workers have a home-office deduction
 * question every March. Q3 (age band) is the softest ask, so it goes last;
 * whoever answers three questions in a row is engaged, not clicking through.
 *
 * PLACEMENT IS THE WHOLE DESIGN. The intent prompt two components below the
 * result was answered 0.4% of the time; this sits directly under the figure at
 * the moment of reaction. Progressive order also protects data quality: a
 * junk-clicker bails after one tap, so the later answers are self-selected
 * toward people answering honestly.
 *
 * Gender is deliberately not asked. No calculation uses it, an unmotivated
 * answer is indistinguishable from a real one, and gender × city × industry ×
 * bracket is a re-identification risk this dataset promised never to carry.
 */

const DICT: Record<string, Record<string, string>> = {
  en: {
    prompt: 'Is that more or less than you expected?',
    lower: 'Less than I thought',
    higher: 'More than I thought',
    'as-expected': 'About right',
    workPrompt: 'Where do you work? (Remote and hybrid workers may qualify for the home-office deduction.)',
    onsite: 'On-site',
    remote: 'Remote',
    hybrid: 'Hybrid',
    agePrompt: 'Last one — your age group. CPP and some credits differ by age.',
    'under-25': 'Under 25',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65+',
    thanks: 'Thanks — that helps.',
    hint: 'Anonymous. We publish only totals, never your figures.',
  },
  zh: {
    prompt: '这个数字比你预想的高还是低?',
    lower: '比我想的少',
    higher: '比我想的多',
    'as-expected': '差不多',
    workPrompt: '你在哪办公?(远程和混合办公可能符合家庭办公抵扣条件。)',
    onsite: '到岗',
    remote: '远程',
    hybrid: '混合',
    agePrompt: '最后一个 —— 年龄段。CPP 和部分税收抵免按年龄不同。',
    'under-25': '25 岁以下',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65 岁以上',
    thanks: '谢谢,这很有帮助。',
    hint: '匿名统计,只发布汇总数字,绝不公开你的金额。',
  },
  fr: {
    prompt: "Est-ce plus ou moins que ce que vous pensiez ?",
    lower: 'Moins que prévu',
    higher: 'Plus que prévu',
    'as-expected': 'À peu près juste',
    workPrompt: 'Où travaillez-vous ? (Le télétravail peut donner droit à la déduction pour bureau à domicile.)',
    onsite: 'Sur place',
    remote: 'À distance',
    hybrid: 'Hybride',
    agePrompt: 'Dernière question — votre groupe d’âge. Le RPC et certains crédits varient selon l’âge.',
    'under-25': 'Moins de 25 ans',
    '25-34': '25–34',
    '35-44': '35–44',
    '45-54': '45–54',
    '55-64': '55–64',
    '65-plus': '65 et plus',
    thanks: 'Merci, cela nous aide.',
    hint: 'Anonyme. Nous publions uniquement des totaux.',
  },
};

const EXPECT_OPTIONS: { key: Expectation; emoji: string }[] = [
  { key: 'lower', emoji: '😖' },
  { key: 'as-expected', emoji: '😐' },
  { key: 'higher', emoji: '🙂' },
];
const WORK_OPTIONS: { key: WorkArrangement; emoji: string }[] = [
  { key: 'onsite', emoji: '🏢' },
  { key: 'remote', emoji: '🏠' },
  { key: 'hybrid', emoji: '🔀' },
];
const AGE_OPTIONS: AgeBand[] = ['under-25', '25-34', '35-44', '45-54', '55-64', '65-plus'];

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
  const [expectation, setExpectation] = useState<Expectation | null>(null);
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement | null>(null);
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);

  if (!annualIncome || annualIncome <= 0) return null;

  // Each answer records the cumulative state; the dedupe key inside
  // recordCalcEvent includes all three fields, so each step lands.
  const send = (ex: Expectation, wa: WorkArrangement | null, ab: AgeBand | null) =>
    recordCalcEvent({
      mode: mode as CalcMode,
      province,
      annualIncome,
      lang,
      expectation: ex,
      workArrangement: wa,
      ageBand: ab,
    });

  const pill =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700';

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      {!expectation ? (
        <>
          <p className="text-sm font-medium text-slate-700">{t.prompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {EXPECT_OPTIONS.map((o) => (
              <button key={o.key} onClick={() => { setExpectation(o.key); send(o.key, null, null); }} className={pill}>
                <span aria-hidden="true">{o.emoji}</span>
                {t[o.key]}
              </button>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] leading-4 text-slate-400">{t.hint}</p>
        </>
      ) : !workArrangement ? (
        <>
          <p className="text-sm font-medium text-emerald-700">✓ {t.thanks}</p>
          <p className="mt-2 text-sm font-medium text-slate-700">{t.workPrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {WORK_OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => { setWorkArrangement(o.key); send(expectation, o.key, null); }}
                className={pill}
              >
                <span aria-hidden="true">{o.emoji}</span>
                {t[o.key]}
              </button>
            ))}
          </div>
        </>
      ) : !ageBand ? (
        <>
          <p className="text-sm font-medium text-slate-700">{t.agePrompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {AGE_OPTIONS.map((k) => (
              <button
                key={k}
                onClick={() => { setAgeBand(k); send(expectation, workArrangement, k); }}
                className={pill}
              >
                {t[k]}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm font-medium text-emerald-700">✓ {t.thanks}</p>
      )}
    </div>
  );
}
