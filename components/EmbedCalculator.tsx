'use client';
import { useEffect, useMemo, useState } from 'react';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import { recordCalcEvent } from '../lib/telemetry';

// Compact take-home pay calculator designed to live inside an <iframe> on
// third-party sites (job boards, immigration services, finance blogs).
// The Ookla "Speedtest Custom" play: the tool itself becomes distribution.

type Lang = 'en' | 'fr' | 'zh';

const DICT: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Take-Home Pay Calculator',
    province: 'Province',
    salary: 'Salary',
    perYear: '/year',
    perHour: '/hour',
    net: 'Take-home pay',
    monthly: 'Monthly',
    biweekly: 'Bi-weekly',
    fed: 'Federal tax',
    prov: 'Provincial tax',
    cpp: 'CPP/QPP',
    ei: 'EI',
    poweredBy: 'Powered by',
    fullCalc: 'Full calculator →',
  },
  fr: {
    title: 'Calculateur de paie nette',
    province: 'Province',
    salary: 'Salaire',
    perYear: '/an',
    perHour: '/heure',
    net: 'Paie nette',
    monthly: 'Mensuel',
    biweekly: 'Aux 2 semaines',
    fed: 'Impôt fédéral',
    prov: 'Impôt provincial',
    cpp: 'RPC/RRQ',
    ei: 'AE',
    poweredBy: 'Propulsé par',
    fullCalc: 'Calculateur complet →',
  },
  zh: {
    title: '税后工资计算器',
    province: '省份',
    salary: '工资',
    perYear: '/年',
    perHour: '/小时',
    net: '税后到手',
    monthly: '每月',
    biweekly: '每两周',
    fed: '联邦税',
    prov: '省税',
    cpp: 'CPP/QPP',
    ei: 'EI',
    poweredBy: '技术支持',
    fullCalc: '完整计算器 →',
  },
};

const CODE_TO_SLUG: Record<string, string> = {
  ON: 'ontario', BC: 'bc', AB: 'alberta', QC: 'quebec', MB: 'manitoba',
  SK: 'saskatchewan', NS: 'nova-scotia', NB: 'new-brunswick', NL: 'newfoundland',
  PE: 'pei', YT: 'yukon', NT: 'northwest-territories', NU: 'nunavut',
};

const HOURS_PER_YEAR = 2080;

export default function EmbedCalculator({
  initialProvince,
  initialLang,
}: {
  initialProvince?: string;
  initialLang?: string;
}) {
  const lang: Lang = initialLang === 'fr' || initialLang === 'zh' ? initialLang : 'en';
  const t = DICT[lang];

  const startSlug =
    (initialProvince && CODE_TO_SLUG[initialProvince.toUpperCase()]) || 'ontario';
  const [slug, setSlug] = useState(startSlug);
  const [amount, setAmount] = useState('60000');
  const [unit, setUnit] = useState<'year' | 'hour'>('year');
  const [embedHost, setEmbedHost] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    // Which site embedded us — the publisher's hostname, never user data.
    try {
      if (document.referrer) setEmbedHost(new URL(document.referrer).hostname);
    } catch {
      /* ignore */
    }
  }, []);

  const annual = useMemo(() => {
    const n = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!n || n <= 0) return 0;
    return unit === 'hour' ? n * HOURS_PER_YEAR : n;
  }, [amount, unit]);

  const fig = useMemo(() => {
    if (!annual) return null;
    try {
      return getSalaryFigures(annual, slug);
    } catch {
      return null;
    }
  }, [annual, slug]);

  const provinceName = PROVINCE_SEO_CONFIGS.find((c) => c.slug === slug)?.name || 'Ontario';

  // Anonymous bucketed telemetry (source=widget) — only after real interaction.
  useEffect(() => {
    if (!touched || !annual) return;
    recordCalcEvent({
      mode: unit === 'hour' ? 'simple' : 'annual',
      province: provinceName,
      annualIncome: annual,
      lang,
      source: 'widget',
      embedHost,
    });
  }, [touched, annual, provinceName, lang, unit, embedHost]);

  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA';
  const money = (n: number) =>
    n.toLocaleString(locale, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

  return (
    <div className="flex min-h-screen flex-col bg-white p-4 font-sans">
      <div className="mb-3 flex items-center gap-2">
        <img src="/logo.png" alt="" width={22} height={22} className="rounded" />
        <span className="text-sm font-bold text-slate-800">{t.title}</span>
      </div>

      <label className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {t.province}
      </label>
      <select
        value={slug}
        onChange={(e) => { setSlug(e.target.value); setTouched(true); }}
        className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
      >
        {PROVINCE_SEO_CONFIGS.map((c) => (
          <option key={c.slug} value={c.slug}>{c.name}</option>
        ))}
      </select>

      <label className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {t.salary}
      </label>
      <div className="mb-4 flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setTouched(true); }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
        />
        <select
          value={unit}
          onChange={(e) => { setUnit(e.target.value as 'year' | 'hour'); setTouched(true); }}
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700"
        >
          <option value="year">{t.perYear}</option>
          <option value="hour">{t.perHour}</option>
        </select>
      </div>

      {fig && (
        <>
          <div className="mb-3 rounded-xl bg-red-600 px-4 py-3 text-white">
            <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{t.net}</div>
            <div className="text-2xl font-extrabold">{money(fig.netAnnual)}<span className="text-sm font-medium opacity-80">{t.perYear}</span></div>
            <div className="mt-1 flex gap-4 text-xs opacity-90">
              <span>{t.monthly}: <strong>{money(fig.netMonthly)}</strong></span>
              <span>{t.biweekly}: <strong>{money(fig.netBiWeekly)}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
            <span>{t.fed}: <strong className="text-slate-800">-{money(fig.federalTax)}</strong></span>
            <span>{t.prov}: <strong className="text-slate-800">-{money(fig.provincialTax)}</strong></span>
            <span>{t.cpp}: <strong className="text-slate-800">-{money(fig.pensionContribution)}</strong></span>
            <span>{t.ei}: <strong className="text-slate-800">-{money(fig.eiPremium)}</strong></span>
          </div>
        </>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400">
        <span>
          {t.poweredBy}{' '}
          <a
            href="https://canpayinsights.ca/?utm_source=embed&utm_medium=widget"
            target="_blank"
            rel="noopener"
            className="font-semibold text-red-600 hover:underline"
          >
            CanPay Insights
          </a>
        </span>
        <a
          href="https://canpayinsights.ca/?utm_source=embed&utm_medium=widget&utm_content=full"
          target="_blank"
          rel="noopener"
          className="text-slate-500 hover:text-red-600 hover:underline"
        >
          {t.fullCalc}
        </a>
      </div>
    </div>
  );
}
