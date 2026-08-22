'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { recordCalcEvent, type ProductInterest } from '../lib/telemetry';
import type { CalculationMode as CalcMode } from '../types';

/**
 * Three paid products that do not exist yet. Each tap is counted; the tapper
 * sees "coming soon" and can leave an email. Nothing is charged.
 *
 * Why a fake door instead of building one: the deep tax report is free and
 * was opened by 0.7% of visits. Pricing a thing nobody wanted for free is a
 * guaranteed zero, so the question "which of these would anyone pay for" is
 * answered by three hundred real taps before a line of product code exists.
 * Whichever door gets opened most gets built first — that decision is made by
 * users, not by Travis, his friend, or me.
 *
 * The wall is deliberately NOT on the result. Take-home pay stays free for
 * everyone; these sit below it and sell a DECISION (move / accept / top up),
 * not more detail.
 */

const DICT: Record<string, Record<string, string>> = {
  en: {
    kicker: 'Going further',
    relocation: 'Province move report',
    relocationDesc: 'Your exact take-home in both provinces, the Dec 31 rule that can cost a full year of provincial tax, rent and cost-of-living from official sources.',
    offer: 'Offer comparison',
    offerDesc: 'Two offers side by side, after tax: RRSP match, vacation and bonus valued at your marginal rate — plus what to ask HR before signing.',
    rrsp: 'RRSP season calculator',
    rrspDesc: 'How much each extra RRSP dollar saves you at your income and province, and where the sweet spot is before the March deadline.',
    once: 'one-time',
    soon: 'Coming soon — want to hear when it launches?',
    email: 'Email',
    notify: 'Notify me',
    thanks: 'Got it — we will email you once.',
    none: 'No spam, one email when it ships.',
  },
  zh: {
    kicker: '更进一步',
    relocation: '省际搬迁报告',
    relocationDesc: '你的工资在两省的精确到手、可能让你多交整整一年省税的 12 月 31 日规则、官方来源的租金与生活成本。',
    offer: 'Offer 对比',
    offerDesc: '两份 offer 税后并排:RRSP 配比、年假、奖金按你的边际税率折算 —— 外加签字前该问 HR 的问题。',
    rrsp: '报税季 RRSP 精算',
    rrspDesc: '按你的收入和省份,每多供一块 RRSP 省多少税,3 月截止前供到哪一档最划算。',
    once: '一次性',
    soon: '即将上线 —— 上线时通知你?',
    email: '邮箱',
    notify: '通知我',
    thanks: '收到,上线时发一封邮件给你。',
    none: '不发广告,只发一封上线通知。',
  },
  fr: {
    kicker: 'Aller plus loin',
    relocation: 'Rapport de déménagement interprovincial',
    relocationDesc: 'Votre salaire net exact dans les deux provinces, la règle du 31 décembre qui peut coûter une année entière d’impôt provincial, loyers et coût de la vie de sources officielles.',
    offer: 'Comparaison d’offres',
    offerDesc: 'Deux offres côte à côte, après impôt : cotisation REER de l’employeur, vacances et prime évaluées à votre taux marginal — et quoi demander aux RH avant de signer.',
    rrsp: 'Calculateur REER saison d’impôt',
    rrspDesc: 'Combien chaque dollar de REER supplémentaire vous fait économiser selon votre revenu et province, et jusqu’où cotiser avant la date limite de mars.',
    once: 'paiement unique',
    soon: 'Bientôt disponible — voulez-vous être averti ?',
    email: 'Courriel',
    notify: 'Prévenez-moi',
    thanks: 'Noté — un seul courriel au lancement.',
    none: 'Pas de pourriel, un courriel au lancement.',
  },
};

const PRODUCTS: { key: ProductInterest; name: string; desc: string; price: string; perYear?: boolean }[] = [
  { key: 'relocation', name: 'relocation', desc: 'relocationDesc', price: '$9' },
  { key: 'offer-compare', name: 'offer', desc: 'offerDesc', price: '$9' },
  { key: 'rrsp-season', name: 'rrsp', desc: 'rrspDesc', price: '$19' },
];

export default function FakeDoors({
  mode, province, annualIncome, lang,
}: { mode: string; province: string; annualIncome: number; lang: string }) {
  const t = DICT[lang] ?? DICT.en;
  const [open, setOpen] = useState<ProductInterest | null>(null);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState<ProductInterest | null>(null);

  if (!annualIncome || annualIncome <= 0) return null;

  const tap = (p: ProductInterest) => {
    setOpen(p);
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, productInterest: p });
  };

  const join = async (p: ProductInterest) => {
    const e = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
    setJoined(p);
    // PII goes to its own table, unlinked from the anonymous events.
    await supabase.from('product_waitlist').insert({ product: p, email: e, lang });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">{t.kicker}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {PRODUCTS.map((p) => (
          <div key={p.key} className="flex flex-col rounded-lg border border-slate-200 p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800">{t[p.name]}</h3>
              <span className="shrink-0 text-sm font-bold tabular-nums text-slate-900">
                {p.price} <span className="text-[10px] font-medium text-slate-400">{t.once}</span>
              </span>
            </div>
            <p className="mt-1.5 flex-1 text-xs leading-5 text-slate-500">{t[p.desc]}</p>

            {open !== p.key ? (
              <button
                onClick={() => tap(p.key)}
                className="mt-3 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600"
              >
                {t[p.name]} →
              </button>
            ) : joined === p.key ? (
              <p className="mt-3 text-xs font-medium text-emerald-700">✓ {t.thanks}</p>
            ) : (
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-700">{t.soon}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder={t.email}
                    className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  <button
                    onClick={() => join(p.key)}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {t.notify}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-400">{t.none}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
