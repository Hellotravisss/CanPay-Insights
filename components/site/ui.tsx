import React from 'react';

/**
 * Page-level building blocks for the 2026-11 site (see docs/DESIGN-SYSTEM.md).
 * Colour rule: red marks the money you keep (or the one subject of a chart); deductions use the ink ramp.
 */

export function Eyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] text-red-600 ${className}`}>{children}</p>;
}

/** eyebrow + display title + lead. One per page, at the top of <main>. */
export function PageHero({
  eyebrow, title, lead, children, align = 'left',
}: { eyebrow?: React.ReactNode; title: React.ReactNode; lead?: React.ReactNode; children?: React.ReactNode; align?: 'left' | 'center' }) {
  return (
    <div className={`pb-8 pt-10 md:pb-12 md:pt-16 ${align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}`}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h1 className="font-display text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.01em] text-ink md:text-[3.25rem]">{title}</h1>
      {lead && <p className="mt-5 text-lg leading-8 text-ink-3">{lead}</p>}
      {children && <div className={`mt-7 flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''}`}>{children}</div>}
    </div>
  );
}

export function Card({ children, className = '', as: Tag = 'div', ...rest }: { children: React.ReactNode; className?: string; as?: any } & React.HTMLAttributes<HTMLElement>) {
  return <Tag className={`rounded-2xl border border-line bg-white ${className}`} {...rest}>{children}</Tag>;
}

/** section heading inside a page: display face, optional eyebrow and one-line lead */
export function SectionTitle({ eyebrow, title, lead, id }: { eyebrow?: React.ReactNode; title: React.ReactNode; lead?: React.ReactNode; id?: string }) {
  return (
    <div className="mb-6 max-w-2xl" id={id}>
      {eyebrow && <Eyebrow className="mb-2">{eyebrow}</Eyebrow>}
      <h2 className="font-display text-2xl font-semibold leading-tight text-ink md:text-[2rem]">{title}</h2>
      {lead && <p className="mt-2 text-base leading-7 text-ink-3">{lead}</p>}
    </div>
  );
}

/**
 * One number with its label. tone="kept" is the red banknote card (money you keep);
 * "ink" is the plain white tile used for everything else, deductions included.
 */
export function Stat({ label, value, sub, tone = 'ink', className = '' }: { label: React.ReactNode; value: React.ReactNode; sub?: React.ReactNode; tone?: 'kept' | 'ink'; className?: string }) {
  const kept = tone === 'kept';
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 ${kept ? 'card-brand-3d text-white shadow-[0_10px_24px_-14px_rgba(158,11,16,0.7)]' : 'border border-line bg-white'} ${className}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${kept ? 'text-red-100' : 'text-mute'}`}>{label}</p>
      <p className={`mt-2 font-display text-[1.75rem] font-semibold leading-none tabular-nums ${kept ? 'text-white' : 'text-ink'}`}>{value}</p>
      {sub && <p className={`mt-2 text-xs ${kept ? 'text-red-100' : 'text-mute'}`}>{sub}</p>}
    </div>
  );
}

/**
 * A note the reader should not miss. "note" = context, "caution" = read before trusting the figure.
 * No yellow, blue or green boxes: the left rule and the label carry the meaning.
 */
export function Callout({ title, children, tone = 'note', className = '' }: { title?: React.ReactNode; children: React.ReactNode; tone?: 'note' | 'caution'; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-line bg-white p-4 pl-5 text-sm leading-6 text-ink-2 ${className}`}
      style={{ boxShadow: `inset 3px 0 0 ${tone === 'caution' ? '#C8161A' : '#15171C'}` }}
    >
      {title && <p className="mb-1 font-semibold text-ink">{title}</p>}
      {children}
    </div>
  );
}

export function ButtonLink({ href, children, variant = 'primary', className = '', ...rest }: { href: string; children: React.ReactNode; variant?: 'primary' | 'secondary' } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const cls = variant === 'primary'
    ? 'btn-brand-3d text-white'
    : 'border border-line bg-white text-ink hover:border-ink-5';
  return (
    <a href={href} className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold no-underline transition-colors ${cls} ${className}`} {...rest}>
      {children}
    </a>
  );
}

/** the standard page frame: header, pearl background, centred main, footer */
export function PageShell({ children, header, footer, width = 'max-w-6xl' }: { children: React.ReactNode; header: React.ReactNode; footer: React.ReactNode; width?: string }) {
  return (
    <div className="min-h-screen bg-pearl">
      {header}
      <main className={`mx-auto ${width} px-4`} role="main">{children}</main>
      {footer}
    </div>
  );
}
