'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { getSalaryFigures, PROVINCE_SEO_CONFIGS } from '../lib/salaryFigures';
import { recordCalcEvent } from '../lib/telemetry';
import { provinceLabel } from '../lib/provinceNames';

// Compact take-home pay calculator designed to live inside an <iframe> on
// third-party sites (job boards, immigration services, finance blogs).
// The Ookla "Speedtest Custom" play: the tool itself becomes distribution.

import { embed as paEmbed } from '../lib/translations/pa';
import { embed as tlEmbed } from '../lib/translations/tl';
import { embed as hiEmbed } from '../lib/translations/hi';
import { embed as esEmbed } from '../lib/translations/es';
import { embed as ukEmbed } from '../lib/translations/uk';
import { embed as koEmbed } from '../lib/translations/ko';
import { embed as viEmbed } from '../lib/translations/vi';

type Lang = 'en' | 'fr' | 'zh' | 'pa' | 'tl' | 'hi' | 'es' | 'uk' | 'ko' | 'vi';

const DICT: Record<string, Record<string, string>> = {
  pa: paEmbed, tl: tlEmbed, hi: hiEmbed, es: esEmbed, uk: ukEmbed, ko: koEmbed, vi: viEmbed,
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
    qpp: 'QPP',
    qpip: 'QPIP',
    rates: '2026 tax rates',
    hours: 'Hourly pay × 2,080 hours a year (40 × 52)',
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
    qpp: 'RRQ',
    qpip: 'RQAP',
    rates: 'Taux d’imposition 2026',
    hours: 'Taux horaire × 2 080 heures par an (40 × 52)',
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
    qpp: 'QPP',
    qpip: 'QPIP',
    rates: '2026 年税率',
    hours: '时薪 × 每年 2,080 小时（40 × 52）',
  },
};

const CODE_TO_SLUG: Record<string, string> = {
  ON: 'ontario', BC: 'bc', AB: 'alberta', QC: 'quebec', MB: 'manitoba',
  SK: 'saskatchewan', NS: 'nova-scotia', NB: 'new-brunswick', NL: 'newfoundland',
  PE: 'pei', YT: 'yukon', NT: 'northwest-territories', NU: 'nunavut',
};

const HOURS_PER_YEAR = 2080;
const LANG_SHORT: Record<Lang, string> = {
  en: 'EN', fr: 'FR', zh: '中文', pa: 'ਪੰਜਾਬੀ', tl: 'TL', hi: 'हिंदी', es: 'ES', uk: 'УКР', ko: '한국어', vi: 'VI',
};

export default function EmbedCalculator({
  initialProvince,
  initialLang,
}: {
  initialProvince?: string;
  initialLang?: string;
}) {
  // The site picks a language with ?lang=; the reader can switch between that
  // language and Canada's two official ones (2026-10-16 — a Quebec site asked
  // for both). Ten buttons would crowd a 420px widget, so it is at most three.
  const baseLang: Lang = initialLang && DICT[initialLang] ? (initialLang as Lang) : 'en';
  const [lang, setLang] = useState<Lang>(baseLang);
  const langChoices = [...new Set<Lang>([baseLang, 'en', 'fr'])];
  const t = DICT[lang];
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const startSlug =
    (initialProvince && CODE_TO_SLUG[initialProvince.toUpperCase()]) || 'ontario';
  const [slug, setSlug] = useState(startSlug);
  const [amount, setAmount] = useState('60000');
  const [unit, setUnit] = useState<'year' | 'hour'>('year');
  const [embedHost, setEmbedHost] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => { document.title = t.title; }, [t.title]);

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
      lang: langRef.current,
      source: 'widget',
      embedHost,
    });
    // Not keyed on lang: switching language is not a new calculation.
  }, [touched, annual, provinceName, unit, embedHost]);

  const locale = lang === 'fr' ? 'fr-CA' : 'en-CA';
  const [announce, setAnnounce] = useState('');
  useEffect(() => {
    if (!touched || !fig) return;
    const id = setTimeout(() => {
      const m = (n: number) => n.toLocaleString(locale, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
      setAnnounce(`${t.net}: ${m(fig.netAnnual)}${t.perYear}, ${t.monthly}: ${m(fig.netMonthly)}`);
    }, 900);
    return () => clearTimeout(id);
  }, [touched, fig, locale, t]);
  const money = (n: number) =>
    n.toLocaleString(locale, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });

  return (
    <div className="flex min-h-screen flex-col bg-white p-4 font-sans">
      <div className="mb-3 flex items-center gap-2">
        <img src="/logo.png" alt="" width={22} height={22} className="rounded" />
        <span className="text-sm font-bold text-slate-800">{t.title}</span>
        <div role="group" aria-label="Language / Langue" className="ml-auto flex overflow-hidden rounded-md border border-slate-300 text-[11px] font-semibold">
          {langChoices.map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              aria-pressed={l === lang}
              onClick={() => setLang(l)}
              className={`px-2 py-1 ${l === lang ? 'bg-slate-800 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}
            >
              {LANG_SHORT[l]}
            </button>
          ))}
        </div>
      </div>

      <label htmlFor="cp-province" className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {t.province}
      </label>
      <select
        id="cp-province"
        value={slug}
        onChange={(e) => { setSlug(e.target.value); setTouched(true); }}
        className="mb-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
      >
        {PROVINCE_SEO_CONFIGS.map((c) => (
          <option key={c.slug} value={c.slug}>{provinceLabel(c.slug, lang, c.name)}</option>
        ))}
      </select>

      <label htmlFor="cp-amount" className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {t.salary}
      </label>
      <div className="mb-4 flex gap-2">
        <input
          id="cp-amount"
          type="number"
          inputMode="decimal"
          min={0}
          value={amount}
          // No minus sign: the number used to drop it silently, pricing −5,000 as 5,000.
          onChange={(e) => { setAmount(e.target.value.replace(/-/g, '')); setTouched(true); }}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
        />
        <select
          aria-label={`${t.salary} (${t.perYear.replace('/', '').trim()} / ${t.perHour.replace('/', '').trim()})`}
          value={unit}
          onChange={(e) => {
            // Convert the amount with the unit: 60000 a year used to become $60,000 an hour.
            const next = e.target.value as 'year' | 'hour';
            const n = parseFloat(amount.replace(/[^0-9.]/g, ''));
            if (next !== unit && n > 0) setAmount(next === 'hour' ? (n / HOURS_PER_YEAR).toFixed(2) : String(Math.round(n * HOURS_PER_YEAR)));
            setUnit(next);
            setTouched(true);
          }}
          className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700"
        >
          <option value="year">{t.perYear}</option>
          <option value="hour">{t.perHour}</option>
        </select>
      </div>

      {fig && (
        <>
          <div className="mb-3 rounded-xl bg-red-700 px-4 py-3 text-white">
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
            {/* Quebec: QPP and QPIP are different programmes, so they get a line
                each. pensionContribution includes QPIP; subtract it for QPP. */}
            {fig.qpip > 0 ? (
              <>
                <span>{t.qpp}: <strong className="text-slate-800">-{money(fig.pensionContribution - fig.qpip)}</strong></span>
                <span>{t.qpip}: <strong className="text-slate-800">-{money(fig.qpip)}</strong></span>
              </>
            ) : (
              <span>{t.cpp}: <strong className="text-slate-800">-{money(fig.pensionContribution)}</strong></span>
            )}
            <span>{t.ei}: <strong className="text-slate-800">-{money(fig.eiPremium)}</strong></span>
          </div>
          {/* State the assumptions a reader would otherwise have to guess. */}
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {t.rates}{unit === 'hour' ? ` · ${t.hours}` : ''}
          </p>
        </>
      )}

      {/* One quiet announcement once typing pauses, not one per keystroke. */}
      <p role="status" aria-live="polite" className="sr-only">{announce}</p>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
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
