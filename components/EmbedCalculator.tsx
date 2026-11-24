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
    fullCalcInline: 'Overtime, RRSP, bonus or a pay stub breakdown? Use the full calculator →',
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
    fullCalcInline: 'Heures sup., REER, prime ou détail de la paie? Calculateur complet →',
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
    fullCalcInline: '加班、RRSP、奖金或工资单明细？用完整计算器 →',
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
  initialAmount = '60000',
  initialUnit = 'year',
  inline = false,
}: {
  initialProvince?: string;
  initialLang?: string;
  initialAmount?: string;
  initialUnit?: 'year' | 'hour';
  /**
   * Rendered inside one of our own pages rather than in a publisher's iframe
   * (2026-10-26: the "paycheck calculator" pages had no calculator on them).
   * Inline it leaves the page's title and language alone, records its
   * calculations as source=web like the home page, and links to the full
   * calculator in the same tab.
   */
  inline?: boolean;
}) {
  // The site picks a language with ?lang=; the reader can switch between that
  // language and Canada's two official ones (2026-10-16 — a Quebec site asked
  // for both). Ten buttons would crowd a 420px widget, so it is at most three.
  // Own keys only: ?lang=constructor found Object's prototype and rendered blank labels.
  const baseLang: Lang = initialLang && Object.prototype.hasOwnProperty.call(DICT, initialLang) ? (initialLang as Lang) : 'en';
  const [lang, setLang] = useState<Lang>(baseLang);
  const langChoices = [...new Set<Lang>([baseLang, 'en', 'fr'])];
  const t = DICT[lang];
  const langRef = useRef<Lang>(lang);
  langRef.current = lang;
  useEffect(() => { if (!inline) document.documentElement.lang = lang; }, [lang, inline]);

  const startSlug =
    (initialProvince && CODE_TO_SLUG[initialProvince.toUpperCase()]) || 'ontario';
  const [slug, setSlug] = useState(startSlug);
  const [amount, setAmount] = useState(initialAmount);
  const [unit, setUnit] = useState<'year' | 'hour'>(initialUnit);
  const [embedHost, setEmbedHost] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  useEffect(() => { if (!inline) document.title = t.title; }, [t.title, inline]);

  useEffect(() => {
    // Which site embedded us — the publisher's hostname, never user data.
    try {
      if (!inline && document.referrer) setEmbedHost(new URL(document.referrer).hostname);
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
      source: inline ? 'web' : 'widget',
      embedHost: inline ? null : embedHost,
      wageEdited: amount !== initialAmount,
    });
    // Not keyed on lang: switching language is not a new calculation.
  }, [touched, annual, provinceName, unit, embedHost, inline, amount, initialAmount]);

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
    <div className={inline ? 'flex flex-col rounded-2xl border border-line bg-white p-4 sm:p-5 font-sans' : 'flex min-h-screen flex-col bg-white p-4 font-sans'}>
      <div className="mb-3 flex items-center gap-2">
        <img src="/logo.png" alt="" width={22} height={22} className="rounded" />
        <span className="text-sm font-semibold text-ink">{t.title}</span>
        {!inline && <div role="group" aria-label="Language / Langue" className="ml-auto flex overflow-hidden rounded-md border border-line text-[11px] font-semibold">
          {langChoices.map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              aria-pressed={l === lang}
              onClick={() => setLang(l)}
              className={`px-2 py-1 ${l === lang ? 'bg-ink text-white' : 'bg-white text-ink-2 hover:bg-pearl'}`}
            >
              {LANG_SHORT[l]}
            </button>
          ))}
        </div>}
      </div>

      <label htmlFor="cp-province" className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
        {t.province}
      </label>
      <select
        id="cp-province"
        value={slug}
        onChange={(e) => { setSlug(e.target.value); setTouched(true); }}
        className="mb-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-ink-3 focus:outline-none focus:ring-2 focus:ring-ink/10"
      >
        {PROVINCE_SEO_CONFIGS.map((c) => (
          <option key={c.slug} value={c.slug}>{provinceLabel(c.slug, lang, c.name)}</option>
        ))}
      </select>

      <label htmlFor="cp-amount" className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
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
          className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-ink-3 focus:outline-none focus:ring-2 focus:ring-ink/10"
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
          className="rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink focus:border-ink-3 focus:outline-none focus:ring-2 focus:ring-ink/10"
        >
          <option value="year">{t.perYear}</option>
          <option value="hour">{t.perHour}</option>
        </select>
      </div>

      {fig && (
        <>
          <div className="card-brand-3d mb-3 rounded-xl px-4 py-3 text-white shadow-[0_10px_24px_-14px_rgba(158,11,16,0.7)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-red-100">{t.net}</div>
            <div className="mt-1 font-display text-[1.75rem] font-semibold leading-none tabular-nums">{money(fig.netAnnual)}<span className="font-sans text-sm font-medium text-red-100">{t.perYear}</span></div>
            <div className="mt-2 flex gap-4 text-xs tabular-nums text-red-50">
              <span>{t.monthly}: <strong>{money(fig.netMonthly)}</strong></span>
              <span>{t.biweekly}: <strong>{money(fig.netBiWeekly)}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs tabular-nums text-mute">
            <span>{t.fed}: <strong className="text-ink">-{money(fig.federalTax)}</strong></span>
            <span>{t.prov}: <strong className="text-ink">-{money(fig.provincialTax)}</strong></span>
            {/* Quebec: QPP and QPIP are different programmes, so they get a line
                each. pensionContribution includes QPIP; subtract it for QPP. */}
            {fig.qpip > 0 ? (
              <>
                <span>{t.qpp}: <strong className="text-ink">-{money(fig.pensionContribution - fig.qpip)}</strong></span>
                <span>{t.qpip}: <strong className="text-ink">-{money(fig.qpip)}</strong></span>
              </>
            ) : (
              <span>{t.cpp}: <strong className="text-ink">-{money(fig.pensionContribution)}</strong></span>
            )}
            <span>{t.ei}: <strong className="text-ink">-{money(fig.eiPremium)}</strong></span>
          </div>
          {/* State the assumptions a reader would otherwise have to guess. */}
          <p className="mt-2 text-xs leading-5 text-mute">
            {t.rates}{unit === 'hour' ? ` · ${t.hours}` : ''}
          </p>
        </>
      )}

      {/* One quiet announcement once typing pauses, not one per keystroke. */}
      <p role="status" aria-live="polite" className="sr-only">{announce}</p>

      {inline ? (
        <div className="mt-3 border-t border-line pt-3 text-xs">
          <a href="/" className="font-semibold text-red-600 no-underline hover:underline">{t.fullCalcInline}</a>
        </div>
      ) : (
      <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-[11px] text-mute">
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
          href={`https://canpayinsights.ca/?${lang === 'en' ? '' : `lang=${lang}&`}utm_source=embed&utm_medium=widget&utm_content=full`}
          target="_blank"
          rel="noopener"
          className="text-mute hover:text-red-600 hover:underline"
        >
          {t.fullCalc}
        </a>
      </div>
      )}
    </div>
  );
}
