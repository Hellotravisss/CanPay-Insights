'use client';
import { useMemo, useState } from 'react';
import { recordCalcEvent, type CalcMode } from '../lib/telemetry';

// Optional industry selector + "where does your wage sit in this industry"
// visual. The Glassdoor/levels.fyi voluntary-data play: the user selects an
// industry to see their standing; the dataset gains a declared industry
// dimension — no popup, no tracking, still anonymous.

type Lang = 'en' | 'fr' | 'zh';

// Module-level = once per page load, matching the telemetry session model.
let industrySentThisPageLoad = false;

// Approximate full-time annual wage percentiles by broad sector, Canada-wide,
// based on Statistics Canada Labour Force Survey wage data (rounded).
// [p10, p25, p50, p75, p90]
const BENCHMARKS: { slug: string; p: [number, number, number, number, number] }[] = [
  { slug: 'food-hospitality', p: [26000, 30000, 35000, 45000, 58000] },
  { slug: 'retail', p: [28000, 33000, 42000, 55000, 72000] },
  { slug: 'arts-media', p: [30000, 38000, 48000, 65000, 85000] },
  { slug: 'transportation', p: [34000, 45000, 55000, 70000, 88000] },
  { slug: 'manufacturing', p: [36000, 46000, 58000, 75000, 95000] },
  { slug: 'healthcare', p: [34000, 45000, 58000, 78000, 105000] },
  { slug: 'education', p: [36000, 48000, 62000, 80000, 98000] },
  { slug: 'construction', p: [38000, 48000, 62000, 78000, 100000] },
  { slug: 'public-admin', p: [46000, 60000, 75000, 92000, 112000] },
  { slug: 'finance', p: [42000, 55000, 72000, 95000, 130000] },
  { slug: 'professional', p: [42000, 55000, 72000, 95000, 128000] },
  { slug: 'tech', p: [50000, 65000, 85000, 110000, 145000] },
  { slug: 'all-industries', p: [28000, 42000, 62000, 86000, 115000] },
];

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    prompt: 'Optional: pick your industry to see where your pay stands',
    industry: 'Your industry',
    choose: 'Select an industry…',
    youAreHere: 'You',
    median: 'Industry median',
    low: 'Lower',
    high: 'Higher',
    verdictTop: 'Your gross pay is in the top {pct}% of {industry} in Canada.',
    verdictAbove: 'Your gross pay is above the median for {industry} in Canada.',
    verdictBelow: 'Your gross pay is below the median for {industry} in Canada.',
    note: 'Approximate benchmarks based on Statistics Canada full-time wage data, Canada-wide.',
    'food-hospitality': 'Food service & hospitality',
    retail: 'Retail',
    'arts-media': 'Arts & media',
    transportation: 'Transportation & warehousing',
    manufacturing: 'Manufacturing',
    healthcare: 'Healthcare & social assistance',
    education: 'Education',
    construction: 'Construction & trades',
    'public-admin': 'Government & public administration',
    finance: 'Finance & insurance',
    professional: 'Professional services',
    tech: 'Technology & IT',
    'all-industries': 'All industries (Canada average)',
  },
  fr: {
    prompt: 'Facultatif : choisissez votre secteur pour situer votre salaire',
    industry: 'Votre secteur',
    choose: 'Choisir un secteur…',
    youAreHere: 'Vous',
    median: 'Médiane du secteur',
    low: 'Moins',
    high: 'Plus',
    verdictTop: 'Votre salaire brut se situe dans le top {pct}% du secteur {industry} au Canada.',
    verdictAbove: 'Votre salaire brut est au-dessus de la médiane du secteur {industry} au Canada.',
    verdictBelow: 'Votre salaire brut est sous la médiane du secteur {industry} au Canada.',
    note: 'Repères approximatifs basés sur les données salariales de Statistique Canada (temps plein).',
    'food-hospitality': 'Restauration et hôtellerie',
    retail: 'Commerce de détail',
    'arts-media': 'Arts et médias',
    transportation: 'Transport et entreposage',
    manufacturing: 'Fabrication',
    healthcare: 'Santé et assistance sociale',
    education: 'Éducation',
    construction: 'Construction et métiers',
    'public-admin': 'Administration publique',
    finance: 'Finance et assurances',
    professional: 'Services professionnels',
    tech: 'Technologies et TI',
    'all-industries': 'Tous les secteurs (moyenne canadienne)',
  },
  zh: {
    prompt: '可选:选择你的行业,看看你的工资在行业中的位置',
    industry: '你的行业',
    choose: '选择行业…',
    youAreHere: '你',
    median: '行业中位数',
    low: '较低',
    high: '较高',
    verdictTop: '你的税前工资位于加拿大{industry}行业的前 {pct}%。',
    verdictAbove: '你的税前工资高于加拿大{industry}行业的中位数。',
    verdictBelow: '你的税前工资低于加拿大{industry}行业的中位数。',
    note: '近似基准,基于加拿大统计局全职工资数据(全国范围)。',
    'food-hospitality': '餐饮与酒店',
    retail: '零售',
    'arts-media': '文化艺术与媒体',
    transportation: '运输与仓储',
    manufacturing: '制造业',
    healthcare: '医疗与社会服务',
    education: '教育',
    construction: '建筑与技工',
    'public-admin': '政府与公共管理',
    finance: '金融与保险',
    professional: '专业服务',
    tech: '科技/IT',
    'all-industries': '全行业平均(加拿大)',
  },
};

// Piecewise-linear percentile estimate through the five known points.
function estimatePercentile(annual: number, p: [number, number, number, number, number]): number {
  const pts: Array<[number, number]> = [[p[0], 10], [p[1], 25], [p[2], 50], [p[3], 75], [p[4], 90]];
  if (annual <= pts[0][0]) return Math.max(3, 10 * (annual / pts[0][0]));
  if (annual >= pts[4][0]) return Math.min(97, 90 + 7 * Math.min(1, (annual - pts[4][0]) / pts[4][0]));
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    if (annual >= x1 && annual <= x2) {
      return y1 + ((annual - x1) / (x2 - x1)) * (y2 - y1);
    }
  }
  return 50;
}

export default function IndustryComparison({
  mode,
  province,
  annualIncome,
  lang: rawLang,
}: {
  mode: string;
  province: string;
  annualIncome: number;
  lang: string;
}) {
  const lang: Lang = rawLang === 'fr' || rawLang === 'zh' ? rawLang : 'en';
  const t = DICT[lang];
  const [slug, setSlug] = useState('');

  const bench = useMemo(() => BENCHMARKS.find((b) => b.slug === slug) ?? null, [slug]);
  const pct = useMemo(
    () => (bench && annualIncome > 0 ? estimatePercentile(annualIncome, bench.p) : null),
    [bench, annualIncome]
  );

  if (!annualIncome || annualIncome <= 0) return null;

  const onSelect = (value: string) => {
    setSlug(value);
    // Only the FIRST selection per page load is telemetry: that's the honest
    // self-declaration. Later switches are curiosity-browsing ("how would I
    // rank in tech?") and would poison the declared-industry dataset.
    if (value && !industrySentThisPageLoad) {
      industrySentThisPageLoad = true;
      recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, industry: value });
    }
  };

  const money = (n: number) =>
    n.toLocaleString(lang === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    });

  // Chart geometry: map [p10 *0.85, p90 *1.15] onto 0..100%.
  let chart: null | {
    youX: number;
    medX: number;
    verdict: string;
  } = null;
  if (bench && pct !== null) {
    const lo = bench.p[0] * 0.85;
    const hi = bench.p[4] * 1.15;
    const clamp = (x: number) => Math.min(98, Math.max(2, ((x - lo) / (hi - lo)) * 100));
    // The all-industries benchmark reads awkwardly inside the "{industry} in
    // Canada" verdict templates ("All industries (Canada average) in Canada"),
    // so it gets a short verdict name.
    const industryName =
      slug === 'all-industries'
        ? { en: 'all workers', fr: 'l’ensemble des travailleurs', zh: '全体打工人' }[lang]
        : t[slug] ?? slug;
    const fill = (tpl: string) => {
      let s = tpl;
      if (slug === 'all-industries') {
        if (lang === 'zh') s = s.replace('{industry}行业', '{industry}');
        if (lang === 'fr') s = s.replace('du secteur {industry}', 'de {industry}');
      }
      return s.replace('{industry}', industryName);
    };
    let verdict: string;
    if (pct >= 75) {
      verdict = fill(t.verdictTop).replace('{pct}', String(Math.max(1, Math.round(100 - pct))));
    } else if (pct >= 50) {
      verdict = fill(t.verdictAbove);
    } else {
      verdict = fill(t.verdictBelow);
    }
    chart = {
      youX: clamp(annualIncome),
      medX: clamp(bench.p[2]),
      verdict,
    };
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm font-medium text-slate-600">{t.prompt}</p>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {t.industry}
      </label>
      <select
        value={slug}
        onChange={(e) => onSelect(e.target.value)}
        className="mb-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
      >
        <option value="">{t.choose}</option>
        {BENCHMARKS.map((b) => (
          <option key={b.slug} value={b.slug}>{t[b.slug] ?? b.slug}</option>
        ))}
      </select>

      {bench && chart && (
        <div className="mt-4">
          {/* Position band: gradient track, median tick, "you" dot */}
          <div className="relative mt-8 mb-7 h-3 w-full rounded-full bg-gradient-to-r from-slate-200 via-red-200 to-red-600">
            {/* median tick */}
            <div
              className="absolute -top-1 h-5 w-0.5 bg-slate-500"
              style={{ left: `${chart.medX}%` }}
            />
            <div
              className="absolute top-6 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-500"
              style={{ left: `${chart.medX}%` }}
            >
              {t.median} {money(bench.p[2])}
            </div>
            {/* you */}
            <div
              className="absolute -top-1.5 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-red-600 shadow-md"
              style={{ left: `${chart.youX}%` }}
            />
            <div
              className="absolute -top-8 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-bold text-white"
              style={{ left: `${chart.youX}%` }}
            >
              {t.youAreHere}: {money(annualIncome)}
            </div>
          </div>
          <div className="mb-3 flex justify-between text-[10px] text-slate-400">
            <span>← {t.low}</span>
            <span>{t.high} →</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{chart.verdict}</p>
          <p className="mt-2 text-[11px] leading-4 text-slate-400">{t.note}</p>
        </div>
      )}
    </div>
  );
}
