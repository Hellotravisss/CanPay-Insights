import { getPartner } from '../lib/partners';

/**
 * Renders one commercial slot, or nothing at all.
 *
 * The "or nothing at all" is the important half: if the partner has no approved
 * link, or we are outside its season, this component emits no markup — no empty
 * box, no placeholder. A reader should never see a slot advertising that a slot
 * exists.
 */
export default function PartnerSlot({ id }: { id: string }) {
  const p = getPartner(id);
  if (!p) return null;

  return (
    <aside className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-sm leading-6 text-slate-600">{p.blurb}</p>
      <a
        href={p.url}
        target="_blank"
        rel={p.paid ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
        className="mt-3 inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white no-underline hover:bg-slate-800"
      >
        {p.label} →
      </a>
      {p.paid && (
        <p className="mt-2 text-[11px] text-slate-400">
          Paid referral link — we may earn a commission at no cost to you. It never affects our
          numbers. <a href="/affiliate-disclosure" className="underline">How this works</a>.
        </p>
      )}
    </aside>
  );
}
