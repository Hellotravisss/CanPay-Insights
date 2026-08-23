'use client';
import { useMemo, useState } from 'react';
import { recordCalcEvent, type ProductInterest } from '../lib/telemetry';
import { Province, PayFrequency, type CalculationMode as CalcMode } from '../types';
import { calculateFromAnnualSalary } from '../utils/taxEngine';

/**
 * Paid products under the result. The Province Move Report is REAL (Stripe
 * Checkout). The offer comparison is still a fake door: taps are counted and
 * the tapper can leave an email; nothing is charged. The RRSP door was
 * retired — the free deep report already computes the RRSP optimum, and
 * charging for what is given away two scrolls up is the wrong kind of money.
 *
 * Design rule for this block: show a NUMBER, not a paragraph. The relocation
 * card computes the take-home gap for the chosen province live, in the
 * browser, with the same engine as the calculator — the report then sells
 * what the free number cannot show (the Dec 31 rule, the deduction, the tax
 * at the till).
 *
 * The wall is deliberately NOT on the result. Take-home pay stays free.
 */

const DICT: Record<string, Record<string, string>> = {
  en: {
    kicker: 'Going further',
    relocation: 'Province move report',
    relocationLine: 'Same salary, another province — what actually changes.',
    moveTo: 'Moving to',
    pick: 'Pick a province to see the gap',
    perYear: 'a year',
    chips: 'Dec 31 rule · Moving deduction · Sales tax · Printable',
    buy: 'Full report — $9',
    buying: 'Opening secure checkout…',
    offer: 'Offer comparison',
    offerLine: 'Two offers, after tax, with the match and vacation priced in.',
    offerChips: 'Total comp · RRSP match · Questions for HR',
    price9: '$9',
    once: 'one-time',
    soon: 'Coming soon — want to hear when it launches?',
    email: 'Email',
    notify: 'Notify me',
    thanks: 'Got it — one email when it ships.',
    secure: 'Paid through Stripe · link works forever',
  },
  zh: {
    kicker: '更进一步',
    relocation: '省际搬迁报告',
    relocationLine: '同样的工资,换个省 —— 到底什么会变。',
    moveTo: '搬去',
    pick: '选一个省,看差多少',
    perYear: '每年',
    chips: '12 月 31 日规则 · 搬家费抵扣 · 消费税 · 可打印',
    buy: '完整报告 —— $9',
    buying: '正在打开安全支付页…',
    offer: 'Offer 对比',
    offerLine: '两份 offer 税后并排,配比和年假都折成钱。',
    offerChips: '总薪酬 · RRSP 配比 · 该问 HR 的问题',
    price9: '$9',
    once: '一次性',
    soon: '即将上线 —— 上线时通知你?',
    email: '邮箱',
    notify: '通知我',
    thanks: '收到,上线时发一封邮件。',
    secure: '通过 Stripe 付款 · 链接永久有效',
  },
  fr: {
    kicker: 'Aller plus loin',
    relocation: 'Rapport de déménagement',
    relocationLine: 'Même salaire, autre province — ce qui change vraiment.',
    moveTo: 'Déménager vers',
    pick: 'Choisissez une province pour voir l’écart',
    perYear: 'par an',
    chips: 'Règle du 31 déc. · Déduction déménagement · Taxes de vente · Imprimable',
    buy: 'Rapport complet — 9 $',
    buying: 'Ouverture du paiement sécurisé…',
    offer: 'Comparaison d’offres',
    offerLine: 'Deux offres, après impôt, cotisation et vacances incluses.',
    offerChips: 'Rémunération totale · REER · Questions aux RH',
    price9: '9 $',
    once: 'paiement unique',
    soon: 'Bientôt — voulez-vous être averti ?',
    email: 'Courriel',
    notify: 'Prévenez-moi',
    thanks: 'Noté — un seul courriel au lancement.',
    secure: 'Paiement via Stripe · lien permanent',
  },
};

const money = (n: number) => `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`;

export default function FakeDoors({
  mode, province, annualIncome, lang,
}: { mode: string; province: string; annualIncome: number; lang: string }) {
  const t = DICT[lang] ?? DICT.en;
  const [dest, setDest] = useState<string>('');
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);
  const [offerOpen, setOfferOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  // The free number: take-home gap, computed here with the calculator's engine.
  const gap = useMemo(() => {
    if (!dest || !annualIncome) return null;
    const net = (p: string) =>
      calculateFromAnnualSalary({ province: p, annualSalary: annualIncome, payFrequency: PayFrequency.MONTHLY }).netPayAnnual;
    // Round each side first, exactly as the report does, so the teaser and
    // the paid page never disagree by a dollar.
    return Math.round(net(dest)) - Math.round(net(province));
  }, [dest, province, annualIncome]);

  if (!annualIncome || annualIncome <= 0) return null;

  const buyRelocation = async () => {
    if (!dest || dest === province) return;
    setBuying(true);
    setBuyError(null);
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, productInterest: 'relocation' });
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ product: 'relocation', from: province, to: dest, income: Math.round(annualIncome), lang }),
      });
      let data: { url?: string; error?: string } = {};
      try { data = await res.json(); } catch { /* empty body */ }
      if (!res.ok || !data.url) throw new Error(data.error || 'Payments are unavailable right now. Please try again in a few minutes.');
      window.location.href = data.url;
    } catch (e) {
      setBuyError((e as Error).message);
      setBuying(false);
    }
  };

  const tapOffer = () => {
    setOfferOpen(true);
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, productInterest: 'offer-compare' as ProductInterest });
  };
  const joinOffer = async () => {
    const e = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return;
    setJoined(true);
    await fetch('/api/waitlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ product: 'offer-compare', email: e, lang }) }).catch(() => {});
  };

  const Chips = ({ text }: { text: string }) => (
    <p className="mt-2 text-[11px] tracking-wide text-slate-400">{text}</p>
  );
  const Price = () => (
    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold tabular-nums text-slate-700">
      {t.price9} <span className="font-medium text-slate-400">{t.once}</span>
    </span>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">{t.kicker}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {/* Province move — real */}
        <div className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.relocation}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{t.relocationLine}</p>
            </div>
            <Price />
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{t.moveTo}</span>
            <select
              value={dest}
              onChange={(e) => setDest(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              <option value="">—</option>
              {Object.values(Province)
                .filter((pv) => pv !== province)
                .map((pv) => (
                  <option key={pv} value={pv}>{pv}</option>
                ))}
            </select>
          </div>

          {/* The live number */}
          <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3">
            {gap === null ? (
              <p className="text-sm text-slate-400">{t.pick}</p>
            ) : (
              <p className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold tabular-nums ${gap >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {gap >= 0 ? '+' : '−'}{money(gap)}
                </span>
                <span className="text-sm text-slate-500">{t.perYear}</span>
              </p>
            )}
          </div>
          <Chips text={t.chips} />

          <button
            onClick={buyRelocation}
            disabled={!dest || buying}
            className="mt-3 w-full rounded-md bg-red-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400"
          >
            {buying ? t.buying : t.buy}
          </button>
          {buyError && <p className="mt-1.5 text-[11px] text-red-600">{buyError}</p>}
          <p className="mt-1.5 text-[10px] text-slate-400">{t.secure}</p>
        </div>

        {/* Offer comparison — fake door */}
        <div className="flex flex-col rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.offer}</h3>
              <p className="mt-0.5 text-sm text-slate-500">{t.offerLine}</p>
            </div>
            <Price />
          </div>
          <Chips text={t.offerChips} />
          <div className="mt-auto pt-3">
            {!offerOpen ? (
              <button
                onClick={tapOffer}
                className="w-full rounded-md bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
              >
                {t.offer} →
              </button>
            ) : joined ? (
              <p className="text-sm font-medium text-emerald-700">✓ {t.thanks}</p>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-700">{t.soon}</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                    placeholder={t.email}
                    className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1.5 text-xs"
                  />
                  <button onClick={joinOffer} className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white">
                    {t.notify}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
