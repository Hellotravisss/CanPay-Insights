'use client';
import { ThinkingOrb } from 'thinking-orbs';
import { useState } from 'react';
import { currentSessionId } from '../lib/telemetry';

/**
 * Share the calculator, get $3 off any report.
 *
 * The reward is a real, single-use promotion code minted at the moment of
 * sharing — not a coupon everyone can pass around. Two honest constraints
 * shaped this:
 *
 *   1. No platform tells you whether a share actually landed. Rather than
 *      pretend to verify, the reward is small, capped at one per session per
 *      day, and single-use. Cheap enough to give on trust.
 *   2. The shared link carries NO salary and no province — the visitor's own
 *      numbers stay theirs. What travels is the calculator, not the paycheque.
 */

const DICT: Record<string, Record<string, string>> = {
  en: {
    kicker: 'Share & save',
    title: 'Know someone comparing paycheques?',
    line: 'Share the calculator and we will take $3 off any report — yours to use whenever you want one.',
    copy: 'Copy link',
    copied: 'Link copied',
    more: 'More…',
    unlocked: 'Your $3 code',
    useIt: 'Paste it at checkout — it takes $3 off any report. Single use, good for 30 days.',
    copyCode: 'Copy code',
    codeCopied: 'Code copied',
    working: 'Getting your code…',
    failed: 'Could not create a code right now — the link still works.',
    shareText: 'Canadian take-home pay, calculated properly — every province, free:',
  },
  zh: {
    kicker: '分享有奖',
    title: '身边有人在比工资吗?',
    line: '分享这个计算器,任意报告立减 $3 —— 什么时候想买都能用。',
    copy: '复制链接',
    copied: '链接已复制',
    more: '更多…',
    unlocked: '你的 $3 优惠码',
    useIt: '结账时粘贴,任意报告立减 $3。一次性使用,30 天内有效。',
    copyCode: '复制优惠码',
    codeCopied: '优惠码已复制',
    working: '正在生成优惠码…',
    failed: '暂时生成不了优惠码 —— 链接依然可用。',
    shareText: '加拿大到手工资,算得明明白白 —— 全部省份,免费:',
  },
  fr: {
    kicker: 'Partagez et économisez',
    title: 'Quelqu’un compare son salaire net ?',
    line: 'Partagez le calculateur et nous retirons 3 $ de n’importe quel rapport.',
    copy: 'Copier le lien',
    copied: 'Lien copié',
    more: 'Plus…',
    unlocked: 'Votre code de 3 $',
    useIt: 'Collez-le au paiement — 3 $ de moins sur tout rapport. Usage unique, 30 jours.',
    copyCode: 'Copier le code',
    codeCopied: 'Code copié',
    working: 'Création du code…',
    failed: 'Impossible de créer un code pour l’instant — le lien fonctionne toujours.',
    shareText: 'Salaire net au Canada, calculé correctement — toutes les provinces, gratuit :',
  },
  es: {
    kicker: 'Comparta y ahorre',
    title: '¿Conoce a alguien comparando sueldos?',
    line: 'Comparta la calculadora y le descontamos $3 de cualquier informe.',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    more: 'Más…',
    unlocked: 'Su código de $3',
    useIt: 'Péguelo al pagar: $3 menos en cualquier informe. Un solo uso, válido 30 días.',
    copyCode: 'Copiar código',
    codeCopied: 'Código copiado',
    working: 'Generando su código…',
    failed: 'No se pudo crear un código ahora; el enlace sigue funcionando.',
    shareText: 'Sueldo neto en Canadá, bien calculado — todas las provincias, gratis:',
  },
  pa: {
    kicker: 'ਸਾਂਝਾ ਕਰੋ ਤੇ ਬਚਾਓ',
    title: 'ਕੀ ਕੋਈ ਜਾਣੂ ਤਨਖਾਹ ਦੀ ਤੁਲਨਾ ਕਰ ਰਿਹਾ ਹੈ?',
    line: 'ਕੈਲਕੁਲੇਟਰ ਸਾਂਝਾ ਕਰੋ, ਕਿਸੇ ਵੀ ਰਿਪੋਰਟ ਤੇ $3 ਦੀ ਛੋਟ ਲਵੋ।',
    copy: 'ਲਿੰਕ ਕਾਪੀ ਕਰੋ',
    copied: 'ਲਿੰਕ ਕਾਪੀ ਹੋ ਗਿਆ',
    more: 'ਹੋਰ…',
    unlocked: 'ਤੁਹਾਡਾ $3 ਕੋਡ',
    useIt: 'ਭੁਗਤਾਨ ਵੇਲੇ ਪੇਸਟ ਕਰੋ — ਕਿਸੇ ਵੀ ਰਿਪੋਰਟ ਤੇ $3 ਘੱਟ। ਇੱਕ ਵਾਰ, 30 ਦਿਨ ਵੈਧ।',
    copyCode: 'ਕੋਡ ਕਾਪੀ ਕਰੋ',
    codeCopied: 'ਕੋਡ ਕਾਪੀ ਹੋ ਗਿਆ',
    working: 'ਤੁਹਾਡਾ ਕੋਡ ਬਣ ਰਿਹਾ ਹੈ…',
    failed: 'ਹੁਣੇ ਕੋਡ ਨਹੀਂ ਬਣ ਸਕਿਆ — ਲਿੰਕ ਫਿਰ ਵੀ ਚੱਲਦਾ ਹੈ।',
    shareText: 'ਕੈਨੇਡਾ ਵਿੱਚ ਟੈਕਸ ਤੋਂ ਬਾਅਦ ਤਨਖਾਹ, ਸਹੀ ਹਿਸਾਬ ਨਾਲ — ਸਾਰੇ ਸੂਬੇ, ਮੁਫ਼ਤ:',
  },
  hi: {
    kicker: 'शेयर करें और बचाएं',
    title: 'कोई परिचित वेतन की तुलना कर रहा है?',
    line: 'कैलकुलेटर शेयर करें और किसी भी रिपोर्ट पर $3 की छूट पाएं।',
    copy: 'लिंक कॉपी करें',
    copied: 'लिंक कॉपी हो गया',
    more: 'और…',
    unlocked: 'आपका $3 कोड',
    useIt: 'भुगतान के समय पेस्ट करें — किसी भी रिपोर्ट पर $3 कम। एक बार, 30 दिन तक वैध।',
    copyCode: 'कोड कॉपी करें',
    codeCopied: 'कोड कॉपी हो गया',
    working: 'आपका कोड बन रहा है…',
    failed: 'अभी कोड नहीं बन सका — लिंक फिर भी काम करता है।',
    shareText: 'कनाडा में टैक्स के बाद वेतन, सही गणना के साथ — सभी प्रांत, मुफ़्त:',
  },
  tl: {
    kicker: 'Ibahagi at makatipid',
    title: 'May kakilala kang naghahambing ng sahod?',
    line: 'Ibahagi ang calculator at babawasan namin ng $3 ang kahit anong ulat.',
    copy: 'Kopyahin ang link',
    copied: 'Nakopya ang link',
    more: 'Iba pa…',
    unlocked: 'Ang iyong $3 na code',
    useIt: 'I-paste sa checkout — $3 na bawas sa kahit anong ulat. Isang beses, 30 araw.',
    copyCode: 'Kopyahin ang code',
    codeCopied: 'Nakopya ang code',
    working: 'Ginagawa ang iyong code…',
    failed: 'Hindi makagawa ng code ngayon — gumagana pa rin ang link.',
    shareText: 'Take-home pay sa Canada, tama ang kuwenta — lahat ng probinsya, libre:',
  },
  uk: {
    kicker: 'Поділіться та заощадьте',
    title: 'Знаєте когось, хто порівнює зарплати?',
    line: 'Поділіться калькулятором — і ми знімемо $3 з будь-якого звіту.',
    copy: 'Копіювати посилання',
    copied: 'Посилання скопійовано',
    more: 'Ще…',
    unlocked: 'Ваш код на $3',
    useIt: 'Вставте його при оплаті — $3 знижки на будь-який звіт. Одноразово, 30 днів.',
    copyCode: 'Копіювати код',
    codeCopied: 'Код скопійовано',
    working: 'Створюємо ваш код…',
    failed: 'Не вдалося створити код зараз — посилання все одно працює.',
    shareText: 'Зарплата на руки в Канаді, порахована правильно — усі провінції, безкоштовно:',
  },
  ko: {
    kicker: '공유하고 할인받기',
    title: '주변에 연봉을 비교 중인 사람이 있나요?',
    line: '계산기를 공유하면 어떤 리포트든 $3 할인해 드립니다.',
    copy: '링크 복사',
    copied: '링크 복사됨',
    more: '더보기…',
    unlocked: '$3 할인 코드',
    useIt: '결제 시 붙여넣으세요 — 어떤 리포트든 $3 할인. 1회 사용, 30일 유효.',
    copyCode: '코드 복사',
    codeCopied: '코드 복사됨',
    working: '코드를 만드는 중…',
    failed: '지금은 코드를 만들 수 없습니다 — 링크는 정상 작동합니다.',
    shareText: '캐나다 실수령액, 제대로 계산 — 전 주 지원, 무료:',
  },
  vi: {
    kicker: 'Chia sẻ để tiết kiệm',
    title: 'Bạn biết ai đang so sánh lương không?',
    line: 'Chia sẻ công cụ này và nhận $3 giảm giá cho bất kỳ báo cáo nào.',
    copy: 'Sao chép liên kết',
    copied: 'Đã sao chép liên kết',
    more: 'Thêm…',
    unlocked: 'Mã giảm $3 của bạn',
    useIt: 'Dán khi thanh toán — giảm $3 cho mọi báo cáo. Dùng một lần, có hiệu lực 30 ngày.',
    copyCode: 'Sao chép mã',
    codeCopied: 'Đã sao chép mã',
    working: 'Đang tạo mã của bạn…',
    failed: 'Hiện chưa tạo được mã — liên kết vẫn hoạt động.',
    shareText: 'Lương thực nhận tại Canada, tính chuẩn xác — mọi tỉnh bang, miễn phí:',
  },
};

const LINK = 'https://canpayinsights.ca/?utm_source=share';

export default function ShareReward({ lang }: { lang: string }) {
  const t = DICT[lang] ?? DICT.en;
  const [code, setCode] = useState<string | null>(null);
  const [state, setState] = useState<'idle' | 'working' | 'done' | 'failed'>('idle');
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const reward = async (channel: string) => {
    if (code || state === 'working') return;
    setState('working');
    try {
      const r = await fetch('/api/share/reward', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ session_id: currentSessionId(), channel, lang }),
      });
      const d = (await r.json()) as { code?: string };
      if (!d.code) throw new Error('no code');
      setCode(d.code);
      setState('done');
    } catch {
      setState('failed');
    }
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(`${t.shareText} ${LINK}`).catch(() => {});
    setCopied('link');
    setTimeout(() => setCopied(null), 2000);
    reward('copy');
  };

  const nativeShare = async () => {
    const nav = navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> };
    if (nav.share) {
      await nav.share({ title: 'CanPay Insights', text: t.shareText, url: LINK }).catch(() => {});
      reward('native');
    } else {
      copyLink();
    }
  };

  const open = (url: string, channel: string) => {
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=520');
    reward(channel);
  };

  const btn =
    'inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700';

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-red-600">{t.kicker}</p>
      <p className="mt-2 text-base font-bold text-slate-900">{t.title}</p>
      <p className="mt-0.5 text-sm text-slate-500">{t.line}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={copyLink} className={btn}>
          🔗 {copied === 'link' ? t.copied : t.copy}
        </button>
        <button
          onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${t.shareText} ${LINK}`)}`, 'whatsapp')}
          className={btn}
        >
          WhatsApp
        </button>
        <button
          onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(LINK)}`, 'facebook')}
          className={btn}
        >
          Facebook
        </button>
        <button
          onClick={() => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(t.shareText)}&url=${encodeURIComponent(LINK)}`, 'x')}
          className={btn}
        >
          X
        </button>
        <button onClick={nativeShare} className={btn}>
          {t.more}
        </button>
      </div>

      {state === 'working' && (
        <p className="mt-3 flex items-center gap-2 text-sm text-slate-400">
          <ThinkingOrb state="weaving" size={20} theme="light" aria-label={t.working} />
          {t.working}
        </p>
      )}
      {state === 'failed' && <p className="mt-3 text-sm text-slate-400">{t.failed}</p>}
      {code && (
        <div className="mt-4 rounded-lg border-2 border-dashed border-red-300 bg-red-50 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-red-600">{t.unlocked}</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="font-mono text-xl font-extrabold tracking-wider text-slate-900">{code}</span>
            <button
              onClick={async () => {
                await navigator.clipboard?.writeText(code).catch(() => {});
                setCopied('code');
                setTimeout(() => setCopied(null), 2000);
              }}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
            >
              {copied === 'code' ? t.codeCopied : t.copyCode}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-600">{t.useIt}</p>
        </div>
      )}
    </div>
  );
}
