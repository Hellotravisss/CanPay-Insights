'use client';
import { useEffect, useState } from 'react';

// Lightweight client-side i18n for the CALCULATOR TOOL UI only.
// Articles/blog stay English. No provider needed — components call useT().
export type Lang = 'en' | 'zh' | 'fr';
export const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
  { code: 'fr', label: 'FR' },
];

type Dict = Record<string, string>;

// Translation dictionaries. Add keys here as more components are localized.
const en: Dict = {
  'brand.tagline': 'Canadian Payroll Calculator',
  'nav.taxGuides': 'Tax guides',
  'nav.compare': 'Compare provinces',
  'nav.signIn': 'Sign In',
  'nav.back': 'Back',
  'mode.hourly.title': 'Hourly Wage',
  'mode.hourly.subtitle': 'Calculate from hourly rate',
  'mode.annual.title': 'Annual Salary',
  'mode.annual.subtitle': 'Calculate from yearly salary',
  'mode.timesheet.title': 'Timesheet',
  'mode.timesheet.subtitle': 'Track exact work hours',
  'home.subtitle': 'Start with the pay type that matches your situation. No signup, no spreadsheet, just a quick take-home pay estimate.',
};

const zh: Dict = {
  'brand.tagline': '加拿大工资计算器',
  'nav.taxGuides': '税务指南',
  'nav.compare': '各省对比',
  'nav.signIn': '登录',
  'nav.back': '返回',
  'mode.hourly.title': '时薪',
  'mode.hourly.subtitle': '按小时工资计算',
  'mode.annual.title': '年薪',
  'mode.annual.subtitle': '按年薪计算',
  'mode.timesheet.title': '工时表',
  'mode.timesheet.subtitle': '记录实际工作时长',
  'home.subtitle': '选择适合你的工资类型开始。无需注册、无需表格，几秒得到税后工资估算。',
};

const fr: Dict = {
  'brand.tagline': 'Calculateur de paie canadien',
  'nav.taxGuides': 'Guides fiscaux',
  'nav.compare': 'Comparer les provinces',
  'nav.signIn': 'Connexion',
  'nav.back': 'Retour',
  'mode.hourly.title': 'Taux horaire',
  'mode.hourly.subtitle': 'Calculer à partir du taux horaire',
  'mode.annual.title': 'Salaire annuel',
  'mode.annual.subtitle': 'Calculer à partir du salaire annuel',
  'mode.timesheet.title': 'Feuille de temps',
  'mode.timesheet.subtitle': 'Suivre les heures travaillées',
  'home.subtitle': 'Commencez par le type de paie qui correspond à votre situation. Sans inscription, sans tableur — une estimation rapide du salaire net.',
};

const dicts: Record<Lang, Dict> = { en, zh, fr };

// Module-level state + subscriber broadcast (so all components re-render on change)
let current: Lang = 'en';
const listeners = new Set<(l: Lang) => void>();

export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem('canpay_lang', l);
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(l));
}

export function useT() {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    // Apply stored language after mount (SSR renders English to avoid hydration mismatch)
    let stored: Lang | null = null;
    try {
      stored = localStorage.getItem('canpay_lang') as Lang | null;
    } catch {
      /* ignore */
    }
    if (stored && dicts[stored]) {
      current = stored;
      setLangState(stored);
    }
    const fn = (l: Lang) => setLangState(l);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const t = (key: string) => dicts[lang][key] ?? en[key] ?? key;
  return { t, lang, setLang };
}

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div className={`inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 ${className}`}>
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={`rounded-md px-2 py-1 text-xs font-bold transition-colors ${
            lang === code ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-pressed={lang === code}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
