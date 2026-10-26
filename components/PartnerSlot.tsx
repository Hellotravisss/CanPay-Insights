'use client';
import { getPartner } from '../lib/partners';
import { recordCalcEvent, type ProductInterest } from '../lib/telemetry';
import type { CalculationMode } from '../types';

/**
 * Renders one commercial slot, or nothing at all.
 *
 * The "or nothing at all" is the important half: if the partner has no approved
 * link, or we are outside its season, this component emits no markup — no empty
 * box, no placeholder. A reader should never see a slot advertising that a slot
 * exists.
 *
 * With `track`, a click is recorded as a product-interest event in the same
 * anonymous, bucketed stream every calculation goes into — which partner slot,
 * on which mode/province/income bracket. It is the only way "does anyone click
 * this" can ever be answered with a number instead of a guess: the referral
 * link sat on the site for months with no way of knowing.
 */
// The results page is in ten languages; this slot was English in all of them
// (2026-10-26). Translated copy per partner, plus the disclosure; anything not
// listed falls back to the English in lib/partners.ts.
const COPY: Record<string, Record<string, { label: string; blurb: string }>> = {
  'wealthsimple-invest': {
    fr: { label: 'Ouvrir un REER avec Wealthsimple', blurb: 'Les cotisations au REER réduisent l’impôt à payer — voici où en ouvrir un.' },
    zh: { label: '在 Wealthsimple 开设 RRSP', blurb: 'RRSP 供款能减少你要交的税 —— 可以从这里开户。' },
    es: { label: 'Abrir un RRSP con Wealthsimple', blurb: 'Los aportes al RRSP reducen los impuestos que pagas: aquí puedes abrir uno.' },
    ko: { label: 'Wealthsimple에서 RRSP 개설하기', blurb: 'RRSP 납입금은 내야 할 세금을 줄여 줍니다. 여기에서 시작할 수 있습니다.' },
    hi: { label: 'Wealthsimple के साथ RRSP खोलें', blurb: 'RRSP योगदान से आपका देय टैक्स घटता है — यहाँ से शुरू करें।' },
    pa: { label: 'Wealthsimple ਨਾਲ RRSP ਖੋਲ੍ਹੋ', blurb: 'RRSP ਯੋਗਦਾਨ ਤੁਹਾਡਾ ਬਣਦਾ ਟੈਕਸ ਘਟਾਉਂਦੇ ਹਨ — ਇੱਥੋਂ ਸ਼ੁਰੂ ਕਰੋ।' },
    tl: { label: 'Magbukas ng RRSP sa Wealthsimple', blurb: 'Binabawasan ng kontribusyon sa RRSP ang buwis na babayaran mo — dito ka puwedeng magsimula.' },
    uk: { label: 'Відкрити RRSP у Wealthsimple', blurb: 'Внески в RRSP зменшують податок, який ви сплачуєте, — почати можна тут.' },
    vi: { label: 'Mở RRSP với Wealthsimple', blurb: 'Đóng góp RRSP giúp giảm số thuế bạn phải nộp — bạn có thể bắt đầu tại đây.' },
  },
};
const DISCLOSURE: Record<string, { text: string; how: string }> = {
  en: { text: 'Paid referral link — we may earn a commission at no cost to you. It never affects our numbers.', how: 'How this works' },
  fr: { text: 'Lien de parrainage rémunéré — nous pouvons toucher une commission, sans frais pour vous. Cela n’influence jamais nos chiffres.', how: 'Comment ça marche' },
  zh: { text: '付费推荐链接：我们可能获得佣金，你不需要多付钱。这不会影响我们的任何数字。', how: '了解详情' },
  es: { text: 'Enlace de referido pagado: podemos recibir una comisión sin costo para ti. Nunca afecta nuestras cifras.', how: 'Cómo funciona' },
  ko: { text: '유료 추천 링크입니다. 추가 비용 없이 저희가 수수료를 받을 수 있으며, 계산 결과에는 전혀 영향을 주지 않습니다.', how: '자세히 보기' },
  hi: { text: 'सशुल्क रेफ़रल लिंक — आपको बिना किसी अतिरिक्त लागत के हमें कमीशन मिल सकता है। इससे हमारे आंकड़ों पर कभी असर नहीं पड़ता।', how: 'यह कैसे काम करता है' },
  pa: { text: 'ਭੁਗਤਾਨ ਵਾਲਾ ਰੈਫ਼ਰਲ ਲਿੰਕ — ਤੁਹਾਡੇ ਲਈ ਬਿਨਾਂ ਕਿਸੇ ਵਾਧੂ ਖਰਚੇ ਦੇ ਸਾਨੂੰ ਕਮਿਸ਼ਨ ਮਿਲ ਸਕਦਾ ਹੈ। ਇਹ ਸਾਡੇ ਅੰਕੜਿਆਂ ਨੂੰ ਕਦੇ ਪ੍ਰਭਾਵਿਤ ਨਹੀਂ ਕਰਦਾ।', how: 'ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ' },
  tl: { text: 'Bayad na referral link — maaari kaming kumita ng komisyon nang walang dagdag na gastos sa iyo. Hindi nito kailanman naaapektuhan ang aming mga numero.', how: 'Paano ito gumagana' },
  uk: { text: 'Платне реферальне посилання — ми можемо отримати комісію без жодних витрат для вас. Це ніколи не впливає на наші розрахунки.', how: 'Як це працює' },
  vi: { text: 'Liên kết giới thiệu có trả phí — chúng tôi có thể nhận hoa hồng mà bạn không mất thêm chi phí. Điều này không bao giờ ảnh hưởng đến các con số của chúng tôi.', how: 'Cách hoạt động' },
};

export type PartnerTrack = { mode: CalculationMode; province: string; annualIncome: number; lang: string };

export default function PartnerSlot({ id, track }: { id: string; track?: PartnerTrack }) {
  const p = getPartner(id);
  if (!p) return null;
  const lang = track?.lang ?? 'en';
  const copy = COPY[id]?.[lang] ?? { label: p.label, blurb: p.blurb };
  const disc = DISCLOSURE[lang] ?? DISCLOSURE.en;
  const interest = (id === 'wealthsimple-invest' ? 'wealthsimple-invest' : null) as ProductInterest | null;
  const onClick = () => {
    if (track && interest) recordCalcEvent({ ...track, productInterest: interest });
  };

  return (
    <aside className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm leading-6 text-slate-600">{copy.blurb}</p>
      <a
        href={p.url}
        target="_blank"
        rel={p.paid ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
        onClick={onClick}
        className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-slate-800"
      >
        {copy.label} →
      </a>
      {p.paid && (
        <p className="mt-2 text-[11px] text-slate-500">
          {disc.text} <a href="/affiliate-disclosure" className="underline">{disc.how}</a>.
        </p>
      )}
    </aside>
  );
}
