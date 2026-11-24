import React from 'react';

/**
 * The one header every page outside the calculator uses (2026-11 redesign).
 * Before this the site had five: a "Back to Home" pill, a bare small logo, a "← CanPay Insights" text link,
 * the wages bar and the calculator's own. A reader moving between them could not tell it was one product.
 *
 * Server-renderable: plain links, and the phone menu is a <details> element, so it works without JS.
 */
type Lang = 'en' | 'fr' | 'zh';
export type NavKey = 'calculator' | 'guides' | 'compare' | 'wages' | 'data';

const NAV: Record<Lang, { key: NavKey; href: string; label: string }[]> = {
  en: [
    { key: 'calculator', href: '/', label: 'Calculator' },
    { key: 'guides', href: '/blog', label: 'Guides & news' },
    { key: 'compare', href: '/compare-provinces', label: 'Compare provinces' },
    { key: 'wages', href: '/wages', label: 'Wages' },
    { key: 'data', href: '/data', label: 'Open data' },
  ],
  fr: [
    { key: 'calculator', href: '/fr', label: 'Calculateur' },
    { key: 'guides', href: '/blog', label: 'Guides' },
    { key: 'compare', href: '/compare-provinces', label: 'Comparer les provinces' },
    { key: 'wages', href: '/wages', label: 'Salaires' },
    { key: 'data', href: '/data', label: 'Données' },
  ],
  zh: [
    { key: 'calculator', href: '/zh', label: '计算器' },
    { key: 'guides', href: '/blog', label: '指南与资讯' },
    { key: 'compare', href: '/compare-provinces', label: '各省对比' },
    { key: 'wages', href: '/wages', label: '行业工资' },
    { key: 'data', href: '/data', label: '开放数据' },
  ],
};

export function Wordmark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <span className={`${cls} whitespace-nowrap leading-none tracking-tight text-ink`}>
      <span className="font-brand font-extrabold">CanPay</span>{' '}
      <span className="font-brand font-normal text-red-600">Insights</span>
    </span>
  );
}

export default function SiteHeader({ lang = 'en', current, extra, onHome }: {
  lang?: Lang; current?: NavKey;
  /** controls the calculator adds on the right (language, account) */
  extra?: React.ReactNode;
  /** the calculator is one client page: "home" there is a state change, not a navigation */
  onHome?: () => void;
}) {
  const nav = NAV[lang];
  const home = nav[0].href;
  const cta = nav[0];
  const menuLabel = lang === 'zh' ? '菜单' : lang === 'fr' ? 'Menu' : 'Menu';
  return (
    <header className="glass-bar sticky top-0 z-30 border-b border-line/80" role="banner">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <a href={home} onClick={onHome ? (e) => { e.preventDefault(); onHome(); } : undefined} className="flex items-center gap-2.5 no-underline" aria-label="CanPay Insights — home">
          <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 rounded-[10px] shadow-[0_4px_10px_-4px_rgba(158,11,16,0.55)]" />
          <Wordmark />
        </a>

        <nav aria-label="Site" className="hidden items-center gap-1 md:flex">
          {nav.map((n) => (
            <a
              key={n.key}
              href={n.href}
              aria-current={current === n.key ? 'page' : undefined}
              className={`rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                current === n.key ? 'bg-white text-ink shadow-[inset_0_0_0_1px_#E3E3EA]' : 'text-mute hover:text-ink'
              }`}
            >
              {n.label}
            </a>
          ))}
        </nav>

        {extra && <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-2 md:gap-2">{extra}</div>}
        <div className="flex items-center gap-2 md:hidden">
          {current !== 'calculator' && (
            <a href={cta.href} className="btn-brand-3d rounded-lg px-3.5 py-2 text-sm font-semibold text-white no-underline">
              {cta.label}
            </a>
          )}
          <details className="site-menu relative">
            <summary
              className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-lg border border-line bg-white text-ink"
              aria-label={menuLabel}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <div className="absolute right-0 top-11 w-56 rounded-xl border border-line bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(21,23,28,0.35)]">
              {nav.map((n) => (
                <a
                  key={n.key}
                  href={n.href}
                  aria-current={current === n.key ? 'page' : undefined}
                  className={`block rounded-lg px-3 py-2.5 text-sm no-underline ${current === n.key ? 'bg-pearl font-semibold text-ink' : 'text-ink-2 hover:bg-pearl-soft'}`}
                >
                  {n.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
