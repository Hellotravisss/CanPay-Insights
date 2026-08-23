'use client';
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

      {state === 'working' && <p className="mt-3 text-sm text-slate-400">{t.working}</p>}
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
