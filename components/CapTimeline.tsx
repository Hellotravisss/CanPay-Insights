'use client';
import { buildCapTimeline } from '../lib/capTimeline';

/**
 * "Why your cheques get bigger late in the year."
 *
 * CPP/QPP, CPP2 and EI are deducted every pay until the year's maximum, then
 * STOP — so above the ceilings the deposit jumps mid-year. The even-split
 * figures shown elsewhere are honest yearly averages, but the first time
 * someone meets the real behaviour they think payroll made a mistake, and in
 * January they think they took a pay cut when deductions restart. This card
 * names the month it happens and the exact size of the jump.
 *
 * Renders nothing below the ceilings — no cap, no story.
 */

const LANG_TAG: Record<string, string> = {
  en: 'en-CA', zh: 'zh-CN', fr: 'fr-CA', es: 'es', pa: 'pa', hi: 'hi', tl: 'fil', uk: 'uk', ko: 'ko', vi: 'vi',
};

const D: Record<string, Record<string, string>> = {
  en: {
    title: 'Your cheques grow near year-end',
    intro: 'CPP and EI are deducted each pay only until the annual maximum, then stop. On this salary:',
    cpp: 'CPP maxes out', cpp2: 'CPP2 (second ceiling) maxes out', ei: 'EI maxes out', qpip: 'QPIP maxes out',
    from: 'from {m}, each cheque is {v} bigger',
    total: 'Your final cheques of the year are about {v} larger than January’s.',
    warn: 'In January the deductions restart — the drop is normal, not a pay cut.',
  },
  zh: {
    title: '年底的工资会变多',
    intro: 'CPP 和 EI 每期扣,缴满全年上限就停。按这个年薪:',
    cpp: 'CPP 缴满', cpp2: 'CPP2(第二上限)缴满', ei: 'EI 缴满', qpip: 'QPIP 缴满',
    from: '{m}起,每张支票多 {v}',
    total: '年底几张支票比一月的大约多 {v}。',
    warn: '一月扣款重新开始,到手变少是正常的,不是降薪。',
  },
  fr: {
    title: 'Vos paies grossissent en fin d’année',
    intro: 'Le RPC/RRQ et l’AE sont retenus à chaque paie jusqu’au maximum annuel, puis s’arrêtent. À ce salaire :',
    cpp: 'RPC/RRQ atteint le maximum', cpp2: 'RPC2 (2e plafond) atteint le maximum', ei: 'AE atteint le maximum', qpip: 'RQAP atteint le maximum',
    from: 'dès {m}, chaque paie augmente de {v}',
    total: 'Vos dernières paies de l’année dépassent celles de janvier d’environ {v}.',
    warn: 'En janvier les retenues reprennent — la baisse est normale, pas une réduction.',
  },
  es: {
    title: 'Sus pagos crecen al final del año',
    intro: 'El CPP y el EI se retienen en cada paga solo hasta el máximo anual; después se detienen. Con este salario:',
    cpp: 'El CPP llega a su tope', cpp2: 'El CPP2 (segundo tope) llega a su máximo', ei: 'El EI llega a su tope', qpip: 'El QPIP llega a su tope',
    from: 'desde {m}, cada paga es {v} mayor',
    total: 'Sus últimas pagas del año son unos {v} más altas que las de enero.',
    warn: 'En enero las retenciones vuelven a empezar: la bajada es normal, no es una reducción de sueldo.',
  },
  pa: {
    title: 'ਸਾਲ ਦੇ ਅੰਤ ਵਿੱਚ ਤੁਹਾਡੀ ਤਨਖਾਹ ਵਧ ਜਾਂਦੀ ਹੈ',
    intro: 'CPP ਤੇ EI ਹਰ ਤਨਖਾਹ ਵਿੱਚੋਂ ਸਿਰਫ਼ ਸਾਲਾਨਾ ਹੱਦ ਤੱਕ ਕੱਟੇ ਜਾਂਦੇ ਹਨ, ਫਿਰ ਰੁਕ ਜਾਂਦੇ ਹਨ। ਇਸ ਤਨਖਾਹ ਉੱਤੇ:',
    cpp: 'CPP ਪੂਰਾ ਹੋ ਜਾਂਦਾ ਹੈ', cpp2: 'CPP2 (ਦੂਜੀ ਹੱਦ) ਪੂਰਾ ਹੋ ਜਾਂਦਾ ਹੈ', ei: 'EI ਪੂਰਾ ਹੋ ਜਾਂਦਾ ਹੈ', qpip: 'QPIP ਪੂਰਾ ਹੋ ਜਾਂਦਾ ਹੈ',
    from: '{m} ਤੋਂ, ਹਰ ਤਨਖਾਹ {v} ਵੱਧ ਹੁੰਦੀ ਹੈ',
    total: 'ਸਾਲ ਦੀਆਂ ਆਖਰੀ ਤਨਖਾਹਾਂ ਜਨਵਰੀ ਨਾਲੋਂ ਲਗਭਗ {v} ਵੱਧ ਹੁੰਦੀਆਂ ਹਨ।',
    warn: 'ਜਨਵਰੀ ਵਿੱਚ ਕਟੌਤੀਆਂ ਮੁੜ ਸ਼ੁਰੂ ਹੋ ਜਾਂਦੀਆਂ ਹਨ — ਘਟਣਾ ਆਮ ਗੱਲ ਹੈ, ਤਨਖਾਹ ਨਹੀਂ ਘਟੀ।',
  },
  hi: {
    title: 'साल के अंत में आपका वेतन बढ़ जाता है',
    intro: 'CPP और EI हर वेतन से केवल वार्षिक सीमा तक कटते हैं, फिर रुक जाते हैं। इस वेतन पर:',
    cpp: 'CPP की सीमा पूरी', cpp2: 'CPP2 (दूसरी सीमा) पूरी', ei: 'EI की सीमा पूरी', qpip: 'QPIP की सीमा पूरी',
    from: '{m} से, हर वेतन {v} अधिक होता है',
    total: 'साल के आखिरी वेतन जनवरी से लगभग {v} अधिक होते हैं।',
    warn: 'जनवरी में कटौतियाँ फिर शुरू होती हैं — कम होना सामान्य है, वेतन कटौती नहीं।',
  },
  tl: {
    title: 'Lumalaki ang sahod mo malapit sa katapusan ng taon',
    intro: 'Ang CPP at EI ay ibinabawas kada sahod hanggang sa taunang maximum lamang, pagkatapos ay hihinto. Sa sahod na ito:',
    cpp: 'Naabot ng CPP ang maximum', cpp2: 'Naabot ng CPP2 (ikalawang hangganan) ang maximum', ei: 'Naabot ng EI ang maximum', qpip: 'Naabot ng QPIP ang maximum',
    from: 'mula {m}, mas malaki ng {v} ang bawat sahod',
    total: 'Ang huling mga sahod mo sa taon ay humigit-kumulang {v} na mas malaki kaysa sa Enero.',
    warn: 'Sa Enero ay muling magsisimula ang mga bawas — normal ang pagbaba, hindi ito pagbawas ng sahod.',
  },
  uk: {
    title: 'Наприкінці року виплати зростають',
    intro: 'CPP та EI утримують із кожної виплати лише до річного максимуму, а потім припиняють. За такої зарплати:',
    cpp: 'CPP досягає максимуму', cpp2: 'CPP2 (друга стеля) досягає максимуму', ei: 'EI досягає максимуму', qpip: 'QPIP досягає максимуму',
    from: 'з {m} кожна виплата більша на {v}',
    total: 'Останні виплати року приблизно на {v} більші за січневі.',
    warn: 'У січні утримання починаються знову — зниження нормальне, це не зменшення зарплати.',
  },
  ko: {
    title: '연말에는 실수령액이 늘어납니다',
    intro: 'CPP와 EI는 매 급여에서 연간 한도까지만 공제되고, 한도에 도달하면 멈춥니다. 이 연봉 기준:',
    cpp: 'CPP 한도 도달', cpp2: 'CPP2(2차 한도) 도달', ei: 'EI 한도 도달', qpip: 'QPIP 한도 도달',
    from: '{m}부터 급여가 매번 {v} 늘어납니다',
    total: '연말 급여는 1월보다 약 {v} 많습니다.',
    warn: '1월에 공제가 다시 시작됩니다 — 줄어드는 것은 정상이며 감봉이 아닙니다.',
  },
  vi: {
    title: 'Lương cuối năm của bạn tăng lên',
    intro: 'CPP và EI chỉ bị trừ mỗi kỳ lương cho đến khi đạt mức tối đa cả năm, sau đó dừng lại. Với mức lương này:',
    cpp: 'CPP đạt mức tối đa', cpp2: 'CPP2 (trần thứ hai) đạt mức tối đa', ei: 'EI đạt mức tối đa', qpip: 'QPIP đạt mức tối đa',
    from: 'từ {m}, mỗi kỳ lương nhiều hơn {v}',
    total: 'Những kỳ lương cuối năm cao hơn tháng Một khoảng {v}.',
    warn: 'Sang tháng Một các khoản trừ bắt đầu lại — giảm là bình thường, không phải bị cắt lương.',
  },
};

const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;

export default function CapTimeline({ annualIncome, province, lang }: { annualIncome: number; province: string; lang: string }) {
  const t = D[lang] ?? D.en;
  const isQuebec = province === 'Quebec';
  const timeline = buildCapTimeline(annualIncome, 26, isQuebec);
  if (!timeline) return null;

  // Intl does not carry month names for every locale in every browser — pa
  // renders "M09" instead of a month. Detect that placeholder shape and fall
  // back to English rather than print a code nobody recognises. Checked at
  // runtime, not hardcoded per language: which locales are missing depends on
  // the ICU data the visitor's browser shipped, not on our list.
  const monthName = (m: number) => {
    const d = new Date(2026, m - 1, 15);
    const local = new Intl.DateTimeFormat(LANG_TAG[lang] ?? 'en-CA', { month: 'long' }).format(d);
    if (/^M?\d+$/.test(local)) return new Intl.DateTimeFormat('en-CA', { month: 'long' }).format(d);
    return local;
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4">
      <p className="text-sm font-bold text-emerald-900">📈 {t.title}</p>
      <p className="mt-1 text-sm text-slate-600">{t.intro}</p>
      <ul className="mt-2 space-y-1">
        {timeline.events.map((e) => (
          <li key={e.kind} className="flex items-baseline gap-2 text-sm text-slate-700">
            <span className="font-semibold">{t[e.kind]}:</span>
            <span>{t.from.replace('{m}', monthName(e.month)).replace('{v}', money(e.perChequeBump))}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm font-semibold text-emerald-900">
        {t.total.replace('{v}', money(timeline.lastChequeBump))}
      </p>
      <p className="mt-1 text-xs text-slate-500">{t.warn}</p>
    </div>
  );
}
