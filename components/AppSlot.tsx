'use client';
import { useEffect, useState } from 'react';
import { recordCalcEvent } from '../lib/telemetry';
import type { CalculationMode } from '../types';

/**
 * The iPhone app, offered where it is actually worth having — under a finished
 * calculation, to the people already doing that calculation on an iPhone.
 *
 * Why here: on 2026-09-16, iOS was 47% of recent calculations (583 of 1,244
 * with a known platform) and 71% of all calculations were on a phone, against
 * roughly 200 app downloads a month. The only links to the App Store were one
 * on the home screen and one in the footer — nothing at the moment a visitor
 * has just seen their number and might want to keep it.
 *
 * It names what the app does that the web cannot do well (a timesheet that
 * survives losing signal, saved calculations at hand), never "we have an app".
 * Shown only on iOS, and the tap is recorded so the next look can answer
 * whether this slot earns its place.
 */
const APP_URL = 'https://apps.apple.com/app/canpayinsights/id6759822038';

const DICT: Record<string, { title: string; body: string; cta: string }> = {
  en: {
    title: 'Keep this on your phone',
    body: 'The iPhone app runs the same engine offline.',
    cta: 'Get the free app',
  },
  zh: {
    title: '把它放进手机',
    body: 'iPhone App 用的是同一套计算引擎,而且可以离线使用。',
    cta: '免费下载',
  },
  fr: {
    title: 'Gardez-le sur votre téléphone',
    body: 'L’application iPhone utilise le même moteur, hors ligne.',
    cta: 'Télécharger gratuitement',
  },
  es: {
    title: 'Llévelo en su teléfono',
    body: 'La app para iPhone usa el mismo motor y funciona sin conexión.',
    cta: 'Descargar gratis',
  },
  pa: {
    title: 'ਇਸਨੂੰ ਆਪਣੇ ਫ਼ੋਨ ਵਿੱਚ ਰੱਖੋ',
    body: 'iPhone ਐਪ ਉਹੀ ਇੰਜਣ ਵਰਤਦੀ ਹੈ ਅਤੇ ਬਿਨਾਂ ਇੰਟਰਨੈੱਟ ਚੱਲਦੀ ਹੈ.',
    cta: 'ਮੁਫ਼ਤ ਐਪ ਲਵੋ',
  },
  hi: {
    title: 'इसे अपने फ़ोन में रखें',
    body: 'iPhone ऐप वही इंजन चलाता है और ऑफ़लाइन काम करता है.',
    cta: 'मुफ़्त ऐप लें',
  },
  tl: {
    title: 'Dalhin ito sa telepono mo',
    body: 'Ang iPhone app ay gumagamit ng parehong makina at gumagana offline.',
    cta: 'Kunin ang libreng app',
  },
  uk: {
    title: 'Тримайте це в телефоні',
    body: 'Застосунок для iPhone працює на тому самому рушії та офлайн.',
    cta: 'Завантажити безкоштовно',
  },
  ko: {
    title: '휴대폰에 담아두세요',
    body: 'iPhone 앱은 동일한 계산 엔진을 오프라인에서도 사용합니다.',
    cta: '무료 앱 받기',
  },
  vi: {
    title: 'Giữ nó trong điện thoại',
    body: 'Ứng dụng iPhone dùng cùng một công cụ tính và chạy ngoại tuyến.',
    cta: 'Tải ứng dụng miễn phí',
  },
};

export default function AppSlot({
  mode,
  province,
  annualIncome,
  lang,
}: {
  mode: CalculationMode | string;
  province: string;
  annualIncome: number;
  lang: string;
}) {
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    try {
      const ua = navigator.userAgent;
      // iPadOS reports as a Mac with touch points; both can install the app.
      setIsIOS(/iPhone|iPod/.test(ua) || (/iPad|Macintosh/.test(ua) && navigator.maxTouchPoints > 1));
    } catch { /* leave it hidden */ }
  }, []);

  if (!isIOS || !annualIncome || annualIncome <= 0) return null;
  const t = DICT[lang] ?? DICT.en;

  return (
    <a
      href={APP_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        recordCalcEvent({
          mode: mode as CalculationMode,
          province,
          annualIncome,
          lang,
          productInterest: 'ios-app',
        })
      }
      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 no-underline transition-colors hover:border-red-300 hover:bg-red-50/40"
    >
      <img src="/logo.png" alt="" className="mt-0.5 h-10 w-10 shrink-0 rounded-lg object-contain" />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-800">{t.title}</span>
        <span className="mt-0.5 block text-xs leading-5 text-slate-500">{t.body}</span>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-red-600">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.05.8 1.13-.23 2.21-.89 3.42-.8 1.45.12 2.54.7 3.26 1.74-2.99 1.79-2.28 5.73.46 6.83-.55 1.44-1.26 2.87-2.2 4.41zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          {t.cta}
        </span>
      </span>
    </a>
  );
}
