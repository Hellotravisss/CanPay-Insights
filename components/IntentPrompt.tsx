'use client';
import { useState } from 'react';
import { recordCalcEvent, type CalcMode, type Intent } from '../lib/telemetry';

// One optional tap: why are you calculating? Voluntary declared data, the same
// play as the industry picker — no popup, no tracking, nothing required.
//
// Why this one question is worth asking: the share of calculations that are job
// offers is a leading indicator of labour-market churn, visible months before
// official statistics. Nobody else can measure it, because nobody else sits at
// the moment a Canadian evaluates an offer.

type Lang = 'en' | 'fr' | 'zh' | 'pa' | 'tl' | 'hi' | 'es' | 'uk' | 'ko' | 'vi';

const OPTIONS: { key: Intent; emoji: string }[] = [
  { key: 'new-job', emoji: '💼' },
  { key: 'raise', emoji: '📈' },
  { key: 'moving', emoji: '📦' },
  { key: 'budgeting', emoji: '🧾' },
  { key: 'tax-filing', emoji: '🗂️' },
  { key: 'curious', emoji: '🤔' },
];

const DICT: Record<string, Record<string, string>> = {
  en: {
    prompt: 'Optional: what brings you here today?',
    hint: 'Anonymous — it helps us publish better data on Canadian pay.',
    thanks: 'Thanks — that helps.',
    'new-job': 'New job offer',
    raise: 'A raise',
    moving: 'Moving province',
    budgeting: 'Budgeting',
    'tax-filing': 'Tax filing',
    curious: 'Just curious',
  },
  fr: {
    prompt: 'Facultatif : qu’est-ce qui vous amène aujourd’hui ?',
    hint: 'Anonyme — cela nous aide à publier de meilleures données sur les salaires.',
    thanks: 'Merci — c’est utile.',
    'new-job': 'Nouvelle offre d’emploi',
    raise: 'Une augmentation',
    moving: 'Déménagement',
    budgeting: 'Budget',
    'tax-filing': 'Déclaration de revenus',
    curious: 'Simple curiosité',
  },
  zh: {
    prompt: '可选:你今天为什么来算工资?',
    hint: '匿名 —— 这能帮我们发布更好的加拿大工资数据。',
    thanks: '谢谢,这很有帮助。',
    'new-job': '拿到新 offer',
    raise: '涨薪',
    moving: '搬去别的省',
    budgeting: '做预算',
    'tax-filing': '报税',
    curious: '就是好奇',
  },
  pa: {
    prompt: 'ਵਿਕਲਪਿਕ: ਅੱਜ ਤੁਸੀਂ ਕਿਉਂ ਹਿਸਾਬ ਲਗਾ ਰਹੇ ਹੋ?',
    hint: 'ਗੁਪਤ — ਇਹ ਸਾਨੂੰ ਬਿਹਤਰ ਡਾਟਾ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦਾ ਹੈ।',
    thanks: 'ਧੰਨਵਾਦ।',
    'new-job': 'ਨਵੀਂ ਨੌਕਰੀ ਦੀ ਪੇਸ਼ਕਸ਼',
    raise: 'ਤਨਖਾਹ ਵਾਧਾ',
    moving: 'ਸੂਬਾ ਬਦਲਣਾ',
    budgeting: 'ਬਜਟ',
    'tax-filing': 'ਟੈਕਸ ਭਰਨਾ',
    curious: 'ਬਸ ਉਤਸੁਕਤਾ',
  },
  tl: {
    prompt: 'Opsyonal: bakit ka nagkakalkula ngayon?',
    hint: 'Anonymous — nakakatulong ito para makapaglathala kami ng mas magandang datos.',
    thanks: 'Salamat!',
    'new-job': 'Bagong job offer',
    raise: 'Taas ng sahod',
    moving: 'Lilipat ng probinsya',
    budgeting: 'Budget',
    'tax-filing': 'Pag-file ng tax',
    curious: 'Curious lang',
  },
  hi: {
    prompt: 'वैकल्पिक: आज आप क्यों गणना कर रहे हैं?',
    hint: 'गुमनाम — इससे हमें बेहतर डेटा प्रकाशित करने में मदद मिलती है।',
    thanks: 'धन्यवाद!',
    'new-job': 'नई नौकरी का ऑफ़र',
    raise: 'वेतन वृद्धि',
    moving: 'दूसरे प्रांत जाना',
    budgeting: 'बजट बनाना',
    'tax-filing': 'टैक्स फाइलिंग',
    curious: 'बस जिज्ञासा',
  },
  es: {
    prompt: 'Opcional: ¿qué te trae por aquí hoy?',
    hint: 'Anónimo — nos ayuda a publicar mejores datos sobre los salarios en Canadá.',
    thanks: '¡Gracias!',
    'new-job': 'Nueva oferta de trabajo',
    raise: 'Un aumento',
    moving: 'Mudanza de provincia',
    budgeting: 'Presupuesto',
    'tax-filing': 'Declaración de impuestos',
    curious: 'Solo curiosidad',
  },
  uk: {
    prompt: 'Необов’язково: що привело вас сюди?',
    hint: 'Анонімно — це допомагає нам публікувати кращі дані про зарплати.',
    thanks: 'Дякуємо!',
    'new-job': 'Нова пропозиція роботи',
    raise: 'Підвищення зарплати',
    moving: 'Переїзд в іншу провінцію',
    budgeting: 'Бюджет',
    'tax-filing': 'Подання податків',
    curious: 'Просто цікаво',
  },
  ko: {
    prompt: '선택 사항: 오늘 왜 계산하시나요?',
    hint: '익명입니다 — 더 나은 캐나다 급여 데이터를 공개하는 데 도움이 됩니다.',
    thanks: '감사합니다!',
    'new-job': '새 입사 제안',
    raise: '연봉 인상',
    moving: '다른 주로 이사',
    budgeting: '예산 계획',
    'tax-filing': '세금 신고',
    curious: '그냥 궁금해서',
  },
  vi: {
    prompt: 'Tùy chọn: hôm nay điều gì đưa bạn đến đây?',
    hint: 'Ẩn danh — giúp chúng tôi công bố dữ liệu lương tốt hơn.',
    thanks: 'Cảm ơn bạn!',
    'new-job': 'Lời mời làm việc mới',
    raise: 'Tăng lương',
    moving: 'Chuyển tỉnh',
    budgeting: 'Lập ngân sách',
    'tax-filing': 'Khai thuế',
    curious: 'Chỉ tò mò',
  },
};

// Once per page load, like the industry picker: the first answer is the honest
// one; letting people click through all six would only add noise.
let answeredThisPageLoad = false;

export default function IntentPrompt({
  mode,
  province,
  annualIncome,
  lang,
}: {
  mode: string;
  province: string;
  annualIncome: number;
  lang: string;
}) {
  const t = DICT[lang] ?? DICT.en;
  const [picked, setPicked] = useState<Intent | null>(null);

  if (!annualIncome || annualIncome <= 0) return null;

  const choose = (intent: Intent) => {
    setPicked(intent);
    if (answeredThisPageLoad) return;
    answeredThisPageLoad = true;
    recordCalcEvent({ mode: mode as CalcMode, province, annualIncome, lang, intent });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {picked ? (
        <p className="text-sm font-medium text-emerald-700">
          ✓ {t.thanks} <span className="font-normal text-slate-500">({t[picked]})</span>
        </p>
      ) : (
        <>
          <p className="text-sm font-medium text-slate-600">{t.prompt}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {OPTIONS.map((o) => (
              <button
                key={o.key}
                onClick={() => choose(o.key)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <span className="mr-1">{o.emoji}</span>
                {t[o.key]}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-4 text-slate-400">{t.hint}</p>
        </>
      )}
    </div>
  );
}
