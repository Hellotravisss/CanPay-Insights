'use client';
import { buildCapTimeline } from '../lib/capTimeline';

/**
 * "Why your cheques get bigger late in the year."
 *
 * CPP/QPP, CPP2 and EI are deducted every pay until the year's maximum, then
 * STOP — so above the ceilings the deposit jumps mid-year. The even-split
 * figures shown elsewhere are honest yearly averages, but the first time
 * someone meets the real behaviour they think payroll made a mistake, and in
 * January they think they took a pay cut when deductions restart. This card
 * names the month it happens and the exact size of the jump.
 *
 * Renders nothing below the ceilings — no cap, no story.
 */

const LANG_TAG: Record<string, string> = {
  en: 'en-CA', zh: 'zh-CN', fr: 'fr-CA', es: 'es', pa: 'pa', hi: 'hi', tl: 'fil', uk: 'uk', ko: 'ko', vi: 'vi',
};

const D: Record<string, Record<string, string>> = {
  en: {
    title: 'Your cheques grow near year-end',
    intro: 'CPP and EI are deducted each pay only until the annual maximum, then stop. On this salary:',
    cpp: 'CPP maxes out', cpp2: 'CPP2 (second ceiling) maxes out', ei: 'EI maxes out', qpip: 'QPIP maxes out',
    from: 'from {m}, each cheque is {v} bigger',
    total: 'Your final cheques of the year are about {v} larger than January’s.',
    warn: 'In January the deductions restart — the drop is normal, not a pay cut.',
  },
  zh: {
    title: '年底的工资会变多',
    intro: 'CPP 和 EI 每期扣,缴满全年上限就停。按这个年薪:',
    cpp: 'CPP 缴满', cpp2: 'CPP2(第二上限)缴满', ei: 'EI 缴满',qpip: 'QPIP 缴满',
    from: '{m}起,每张支票多 {v}',
    total: '年底几张支票比一月的大约多 {v}。',
    warn: '一月扣款重新开始,到手变少是正常的,不是降薪。',
  },
  fr: {
    title: 'Vos paies grossissent en fin d’année',
    intro: 'Le RPC/RRQ et l’AE sont retenus à chaque paie jusqu’au maximum annuel, puis s’arrêtent. À ce salaire :',
    cpp: 'RPC/RRQ atteint le maximum', cpp2: 'RPC2 (2e plafond) atteint le maximum', ei: 'AE atteint le maximum', qpip: 'RQAP atteint le maximum',
    from: 'dès {m}, chaque paie augmente de {v}',
    total: 'Vos dernières paies de l’année dépassent celles de janvier d’environ {v}.',
    warn: 'En janvier les retenues reprennent — la baisse est normale, pas une réduction.',
  },
};

const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

export default function CapTimeline({ annualIncome, province, lang }: { annualIncome: number; province: string; lang: string }) {
  const t = D[lang] ?? D.en;
  const isQuebec = province === 'Quebec';
  const timeline = buildCapTimeline(annualIncome, 26, isQuebec);
  if (!timeline) return null;

  const monthName = (m: number) =>
    new Intl.DateTimeFormat(LANG_TAG[lang] ?? 'en-CA', { month: 'long' }).format(new Date(2026, m - 1, 15));

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4">
      <p className="text-sm font-bold text-emerald-900">📈 {t.title}</p>
      <p className="mt-1 text-sm text-slate-600">{t.intro}</p>
      <ul className="mt-2 space-y-1">
        {timeline.events.map((e) => (
          <li key={e.kind} className="flex items-baseline gap-2 text-sm text-slate-700">
            <span className="font-semibold">{t[e.kind]}:</span>
            <span>{t.from.replace('{m}', monthName(e.month)).replace('{v}', money(e.perChequeBump))}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm font-semibold text-emerald-900">
        {t.total.replace('{v}', money(timeline.lastChequeBump))}
      </p>
      <p className="mt-1 text-xs text-slate-500">{t.warn}</p>
    </div>
  );
}
