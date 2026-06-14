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
  'common.province': 'Province',
  'common.active': 'Active',
  'annual.title': 'Annual Salary Calculator',
  'annual.subtitle': 'Enter your annual salary to see take-home pay',
  'annual.salaryLabel': 'Annual Salary',
  'annual.provinceHint': 'Tax rates and deductions vary by province',
  'annual.addIncome': 'Additional Income',
  'annual.addIncomeHint': 'Bonus, stat holiday, retroactive pay, etc.',
  'annual.statHoliday': 'Statutory Holiday Pay',
  'annual.perPeriod': 'Per pay period',
  'annual.sickPay': 'Sick Pay / Paid Leave',
  'annual.bonus': 'Bonus / Retroactive Pay',
  'annual.bonusHint': 'Per pay period (annualized)',
  'annual.otherIncome': 'Other Income',
  'annual.otherIncomeHint': 'Tips, commissions, allowances',
  'annual.taxBenefits': 'Taxable Benefits (Non-cash)',
  'annual.taxBenefitsHint': 'Life insurance, AD&D taxable benefits',
  'annual.otherDed': 'Other Deductions',
  'annual.otherDedHint': 'LTD, union dues — deducted after tax',
  'annual.ltd': 'LTD / Disability Insurance',
  'annual.unionDues': 'Union Dues',
  'annual.otherDedItem': 'Other (parking, tools…)',
  'annual.rrsp': 'RRSP Contribution',
  'annual.rrspHint': 'Per pay period — reduces taxable income',
  'annual.fixedAmount': 'Fixed Amount ($)',
  'annual.percentage': 'Percentage (%)',
  'annual.perPaycheque': 'Per-Paycheque Contribution ($)',
  'annual.myContribution': 'My Contribution (%)',
  'annual.employerMatch': 'Employer Match',
  'annual.match100': '100% Match',
  'annual.match50': '50% Match',
  'annual.matchNone': 'No Match',
  'annual.matchCustom': 'Custom %',
  'annual.customMatch': 'Custom Employer Match (%)',
  'annual.rrspNoteAmount': 'Reduces taxable income — lowers your federal & provincial tax',
  'annual.rrspNotePercent': 'You and your employer contribute a percentage of your gross pay to your RRSP.',
  'hourly.provinceTerritory': 'Province / Territory',
  'hourly.wage': 'Hourly Wage ($/hr)',
  'hourly.schedule': 'Work Schedule',
  'hourly.startTime': 'Start Time',
  'hourly.endTime': 'End Time',
  'hourly.unpaidBreak': 'Unpaid Break (mins)',
  'hourly.shiftPremium': 'Shift Premium',
  'hourly.premiumRate': 'Premium Rate ($/hr)',
  'hourly.from': 'From',
  'hourly.to': 'To',
  'hourly.addIncomeHint': 'Stat holiday pay, sick pay, bonus, etc. — added to gross this period',
  'hourly.statHolidayHint': 'Paid for public holidays worked or not worked',
  'hourly.sickPayHint': 'Employer-paid sick or personal days this period',
  'hourly.bonusHint': 'One-time or recurring bonus, gain-share, retro',
  'hourly.otherIncomeHint': 'Tips, commissions, allowances, etc.',
  'hourly.taxBenefitsHint': 'Group life insurance, AD&D, company-paid taxable benefits',
  'hourly.dedHint': 'LTD, union dues, and other after-tax deductions from your cheque',
  'hourly.ltdHint': 'Long-term disability premium per period',
  'hourly.unionDuesHint': 'Monthly dues deducted from your cheque',
  'hourly.otherDedHint': 'Parking, tool rental, garnishment, etc.',
  'hourly.dedNote': 'These are deducted after tax — they reduce your net pay but not your taxable income.',
  'common.cancel': 'Cancel',
  'ts.title': 'Timesheet Tracker',
  'ts.subtitle': 'Track your daily hours with precision',
  'ts.syncing': 'Syncing…',
  'ts.savedCloud': 'Saved to Cloud',
  'ts.hourlyWage': 'Hourly Wage',
  'ts.payFrequency': 'Pay Frequency',
  'ts.daily': 'Daily',
  'ts.weekly': 'Weekly',
  'ts.biweekly': 'Bi-Weekly (Every 2 weeks)',
  'ts.monthly': 'Monthly',
  'ts.quarterly': 'Quarterly',
  'ts.addEntry': '+ Add Entry',
  'ts.noEntries': 'No entries for this date',
  'ts.break': 'Break',
  'ts.tips': 'tips',
  'ts.addTimeEntry': 'Add Time Entry',
  'ts.checkIn': 'Check In',
  'ts.checkOut': 'Check Out',
  'ts.unpaidBreakMin': 'Unpaid Break (minutes)',
  'ts.tipsDeclared': 'Tips Declared',
  'ts.optionalTaxable': '(optional, taxable)',
  'ts.tipsHint': 'Added to gross income for this shift — affects CPP, EI, and tax',
  'ts.notesOpt': 'Notes (optional)',
  'ts.notesPlaceholder': 'e.g., Training session',
  'ts.totalHours': 'Total Hours Tracked',
  'ts.entries': 'entries',
  'ts.hours': 'hours',
  'ts.errCheckout': 'Check-out time must be after check-in time',
  'ts.errBreakExceed': 'Break time cannot exceed or equal work duration',
  'ts.errBreakNeg': 'Break time cannot be negative',
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
  'common.province': '省份',
  'common.active': '已启用',
  'annual.title': '年薪计算器',
  'annual.subtitle': '输入年薪查看税后收入',
  'annual.salaryLabel': '年薪',
  'annual.provinceHint': '税率和扣除项因省份而异',
  'annual.addIncome': '额外收入',
  'annual.addIncomeHint': '奖金、法定假日工资、补发工资等',
  'annual.statHoliday': '法定假日工资',
  'annual.perPeriod': '每个发薪周期',
  'annual.sickPay': '病假 / 带薪休假',
  'annual.bonus': '奖金 / 补发工资',
  'annual.bonusHint': '每个发薪周期（年化）',
  'annual.otherIncome': '其他收入',
  'annual.otherIncomeHint': '小费、佣金、津贴',
  'annual.taxBenefits': '应税福利（非现金）',
  'annual.taxBenefitsHint': '人寿保险、意外伤残等应税福利',
  'annual.otherDed': '其他扣除',
  'annual.otherDedHint': '长期伤残险、工会会费——税后扣除',
  'annual.ltd': '长期伤残 / 残疾保险',
  'annual.unionDues': '工会会费',
  'annual.otherDedItem': '其他（停车、工具等）',
  'annual.rrsp': 'RRSP 供款',
  'annual.rrspHint': '每个发薪周期——可减少应税收入',
  'annual.fixedAmount': '固定金额 ($)',
  'annual.percentage': '百分比 (%)',
  'annual.perPaycheque': '每次发薪供款 ($)',
  'annual.myContribution': '我的供款 (%)',
  'annual.employerMatch': '雇主匹配',
  'annual.match100': '100% 匹配',
  'annual.match50': '50% 匹配',
  'annual.matchNone': '不匹配',
  'annual.matchCustom': '自定义 %',
  'annual.customMatch': '自定义雇主匹配 (%)',
  'annual.rrspNoteAmount': '减少应税收入——降低你的联邦和省税',
  'annual.rrspNotePercent': '你和雇主按工资的一定百分比向你的 RRSP 供款。',
  'hourly.provinceTerritory': '省 / 地区',
  'hourly.wage': '时薪 ($/小时)',
  'hourly.schedule': '工作排班',
  'hourly.startTime': '开始时间',
  'hourly.endTime': '结束时间',
  'hourly.unpaidBreak': '无薪休息（分钟）',
  'hourly.shiftPremium': '班次津贴',
  'hourly.premiumRate': '津贴费率 ($/小时)',
  'hourly.from': '从',
  'hourly.to': '到',
  'hourly.addIncomeHint': '法定假日工资、病假工资、奖金等——计入本期总收入',
  'hourly.statHolidayHint': '公共假日工作或未工作的带薪报酬',
  'hourly.sickPayHint': '本期雇主支付的病假或事假',
  'hourly.bonusHint': '一次性或经常性奖金、利润分享、补发',
  'hourly.otherIncomeHint': '小费、佣金、津贴等',
  'hourly.taxBenefitsHint': '团体人寿保险、意外伤残、公司支付的应税福利',
  'hourly.dedHint': '长期伤残险、工会会费及其他税后扣除',
  'hourly.ltdHint': '每期长期伤残保险费',
  'hourly.unionDuesHint': '从工资中扣除的月度会费',
  'hourly.otherDedHint': '停车、工具租赁、扣款等',
  'hourly.dedNote': '这些为税后扣除——减少你的净收入，但不减少应税收入。',
  'common.cancel': '取消',
  'ts.title': '工时记录',
  'ts.subtitle': '精确记录你每天的工作时长',
  'ts.syncing': '同步中…',
  'ts.savedCloud': '已保存到云端',
  'ts.hourlyWage': '时薪',
  'ts.payFrequency': '发薪频率',
  'ts.daily': '每日',
  'ts.weekly': '每周',
  'ts.biweekly': '每两周',
  'ts.monthly': '每月',
  'ts.quarterly': '每季度',
  'ts.addEntry': '+ 添加记录',
  'ts.noEntries': '该日期暂无记录',
  'ts.break': '休息',
  'ts.tips': '小费',
  'ts.addTimeEntry': '添加工时记录',
  'ts.checkIn': '上班打卡',
  'ts.checkOut': '下班打卡',
  'ts.unpaidBreakMin': '无薪休息（分钟）',
  'ts.tipsDeclared': '申报小费',
  'ts.optionalTaxable': '（可选，应税）',
  'ts.tipsHint': '计入本班次的总收入——影响 CPP、EI 和税款',
  'ts.notesOpt': '备注（可选）',
  'ts.notesPlaceholder': '例如：培训',
  'ts.totalHours': '累计工时',
  'ts.entries': '条记录',
  'ts.hours': '小时',
  'ts.errCheckout': '下班时间必须晚于上班时间',
  'ts.errBreakExceed': '休息时间不能超过或等于工作时长',
  'ts.errBreakNeg': '休息时间不能为负',
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
  'common.province': 'Province',
  'common.active': 'Actif',
  'annual.title': 'Calculateur de salaire annuel',
  'annual.subtitle': 'Entrez votre salaire annuel pour voir la paie nette',
  'annual.salaryLabel': 'Salaire annuel',
  'annual.provinceHint': 'Les taux et retenues varient selon la province',
  'annual.addIncome': 'Revenus supplémentaires',
  'annual.addIncomeHint': 'Prime, congé férié, paie rétroactive, etc.',
  'annual.statHoliday': 'Paie de congé férié',
  'annual.perPeriod': 'Par période de paie',
  'annual.sickPay': 'Congé de maladie / payé',
  'annual.bonus': 'Prime / paie rétroactive',
  'annual.bonusHint': 'Par période de paie (annualisé)',
  'annual.otherIncome': 'Autres revenus',
  'annual.otherIncomeHint': 'Pourboires, commissions, allocations',
  'annual.taxBenefits': 'Avantages imposables (non monétaires)',
  'annual.taxBenefitsHint': 'Assurance vie, avantages imposables DMA',
  'annual.otherDed': 'Autres retenues',
  'annual.otherDedHint': 'ILD, cotisations syndicales — après impôt',
  'annual.ltd': 'Assurance ILD / invalidité',
  'annual.unionDues': 'Cotisations syndicales',
  'annual.otherDedItem': 'Autre (stationnement, outils…)',
  'annual.rrsp': 'Cotisation REER',
  'annual.rrspHint': 'Par période de paie — réduit le revenu imposable',
  'annual.fixedAmount': 'Montant fixe ($)',
  'annual.percentage': 'Pourcentage (%)',
  'annual.perPaycheque': 'Cotisation par paie ($)',
  'annual.myContribution': 'Ma cotisation (%)',
  'annual.employerMatch': 'Cotisation employeur',
  'annual.match100': 'Égale 100 %',
  'annual.match50': 'Égale 50 %',
  'annual.matchNone': 'Aucune',
  'annual.matchCustom': '% personnalisé',
  'annual.customMatch': 'Cotisation employeur personnalisée (%)',
  'annual.rrspNoteAmount': 'Réduit le revenu imposable — diminue vos impôts fédéral et provincial',
  'annual.rrspNotePercent': 'Vous et votre employeur cotisez un pourcentage de votre salaire brut à votre REER.',
  'hourly.provinceTerritory': 'Province / Territoire',
  'hourly.wage': 'Taux horaire ($/h)',
  'hourly.schedule': 'Horaire de travail',
  'hourly.startTime': 'Heure de début',
  'hourly.endTime': 'Heure de fin',
  'hourly.unpaidBreak': 'Pause non payée (min)',
  'hourly.shiftPremium': 'Prime de quart',
  'hourly.premiumRate': 'Taux de prime ($/h)',
  'hourly.from': 'De',
  'hourly.to': 'À',
  'hourly.addIncomeHint': 'Congé férié, congé de maladie, prime, etc. — ajouté au brut de la période',
  'hourly.statHolidayHint': 'Payé pour les jours fériés travaillés ou non',
  'hourly.sickPayHint': 'Congés de maladie ou personnels payés par l\'employeur cette période',
  'hourly.bonusHint': 'Prime ponctuelle ou récurrente, partage des gains, rétro',
  'hourly.otherIncomeHint': 'Pourboires, commissions, allocations, etc.',
  'hourly.taxBenefitsHint': 'Assurance vie collective, DMA, avantages imposables payés par l\'employeur',
  'hourly.dedHint': 'ILD, cotisations syndicales et autres retenues après impôt',
  'hourly.ltdHint': 'Prime d\'invalidité de longue durée par période',
  'hourly.unionDuesHint': 'Cotisations mensuelles retenues sur la paie',
  'hourly.otherDedHint': 'Stationnement, location d\'outils, saisie, etc.',
  'hourly.dedNote': 'Ces retenues sont après impôt — elles réduisent la paie nette mais pas le revenu imposable.',
  'common.cancel': 'Annuler',
  'ts.title': 'Suivi des heures',
  'ts.subtitle': 'Suivez vos heures quotidiennes avec précision',
  'ts.syncing': 'Synchronisation…',
  'ts.savedCloud': 'Enregistré dans le nuage',
  'ts.hourlyWage': 'Taux horaire',
  'ts.payFrequency': 'Fréquence de paie',
  'ts.daily': 'Quotidienne',
  'ts.weekly': 'Hebdomadaire',
  'ts.biweekly': 'Aux deux semaines',
  'ts.monthly': 'Mensuelle',
  'ts.quarterly': 'Trimestrielle',
  'ts.addEntry': '+ Ajouter',
  'ts.noEntries': 'Aucune entrée pour cette date',
  'ts.break': 'Pause',
  'ts.tips': 'pourboires',
  'ts.addTimeEntry': 'Ajouter une entrée',
  'ts.checkIn': 'Arrivée',
  'ts.checkOut': 'Départ',
  'ts.unpaidBreakMin': 'Pause non payée (minutes)',
  'ts.tipsDeclared': 'Pourboires déclarés',
  'ts.optionalTaxable': '(facultatif, imposable)',
  'ts.tipsHint': 'Ajouté au revenu brut de ce quart — affecte le RPC, l\'AE et l\'impôt',
  'ts.notesOpt': 'Notes (facultatif)',
  'ts.notesPlaceholder': 'p. ex., formation',
  'ts.totalHours': 'Heures totales suivies',
  'ts.entries': 'entrées',
  'ts.hours': 'heures',
  'ts.errCheckout': 'L\'heure de départ doit être après l\'arrivée',
  'ts.errBreakExceed': 'La pause ne peut pas dépasser ou égaler la durée travaillée',
  'ts.errBreakNeg': 'La pause ne peut pas être négative',
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
