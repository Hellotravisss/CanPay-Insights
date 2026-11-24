'use client';

import { useEffect, useMemo, useState } from 'react';
import { GRID, TILE, bestOf, firstPlace, lastPlace, type Row, type Tier } from '../../lib/naRanking';

// The 2026-11 chart rules (PayFamily-brand/18-charts): country is the categorical colour
// (Canada = brand red, United States = ink), the share kept is lightness within that colour,
// text is ink or grey and never wears a series colour — the swatch beside it carries identity.
const RED = '#C8161A';
const INK = '#15171C';
const US_INK = '#2B2E36';
const LINE = '#E3E3EA';
const swatchOf = (r: Pick<Row, 'country'>) => (r.country === 'CA' ? RED : US_INK);

// Five lightness steps per country, lightest = least kept. Each step's label colour passes 4.5:1 on its fill.
const RAMP = {
  CA: ['#F7C3BA', '#EC8E80', '#DB5649', '#C8161A', '#9E0B10'],
  US: ['#DCDEE5', '#B9BCC6', '#8F939E', '#535866', '#2B2E36'],
} as const;
const LABEL_ON = ['#15171C', '#15171C', '#15171C', '#FFFFFF', '#FFFFFF'];

// The scale runs from the tier's lowest share to its highest, so the lightest and the darkest
// square are always the two ends; the legend prints the share each step stands for at the salary shown.
const STEPS = RAMP.CA.length - 1;
type Scale = { hi: number; lo: number };
const scaleOf = (t: Tier): Scale => ({ hi: t.rows[0].keptPct, lo: t.rows[t.rows.length - 1].keptPct });
const step = (keptPct: number, s: Scale) =>
  Math.round(Math.min(1, Math.max(0, (keptPct - s.lo) / (s.hi - s.lo || 1))) * STEPS);

const money = (r: Row, n: number) => `${r.country === 'CA' ? 'C$' : 'US$'}${Math.round(n).toLocaleString('en-US')}`;
const k = (usd: number) => `${usd / 1000}k`;

/** "=1" when a rank is shared, the way league tables have always printed it. */
function rankLabel(rows: Row[], r: Row) {
  return rows.filter((x) => x.rank === r.rank).length > 1 ? `=${r.rank}` : `${r.rank}`;
}

const Swatch = ({ color, className = '' }: { color: string; className?: string }) => (
  <i aria-hidden="true" className={`inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] ${className}`} style={{ background: color }} />
);

const S = 56; // tile pitch
const T = 52; // tile size

function Cartogram({ tier, selected, onSelect }: { tier: Tier; selected: string | null; onSelect: (c: string) => void }) {
  const s = scaleOf(tier);
  return (
    <svg viewBox={`-3 -3 ${GRID.cols * S + 2} ${GRID.rows * S + 2}`} className="w-full" aria-hidden="true">
      {tier.rows.map((r) => {
        const [c, row] = TILE[r.code];
        const x = c * S;
        const y = row * S;
        const on = selected === r.code;
        const b = step(r.keptPct, s);
        const fill = RAMP[r.country][b];
        const ink = LABEL_ON[b];
        return (
          <g key={r.code} onClick={() => onSelect(r.code)} className="cursor-pointer">
            <title>{`${r.name}: ${r.keptPct.toFixed(1)}% kept`}</title>
            <rect x={x} y={y} width={T} height={T} rx={8} fill={fill} stroke={on ? INK : 'none'} strokeWidth={on ? 3 : 0} />
            {on ? <rect x={x - 3} y={y - 3} width={T + 6} height={T + 6} rx={10} fill="none" stroke="#FFFFFF" strokeWidth={1.5} /> : null}
            <text x={x + T / 2} y={y + 23} textAnchor="middle" fill={ink} fontWeight={700} className="text-[15px] sm:text-[13px]">{r.code}</text>
            <text x={x + T / 2} y={y + 40} textAnchor="middle" fontSize="10.5" fill={ink} className="hidden tabular-nums sm:inline">
              {r.keptPct.toFixed(1)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Legend({ tier }: { tier: Tier }) {
  const s = scaleOf(tier);
  const marks = [0, 0.25, 0.5, 0.75, 1].map((f) => s.lo + f * (s.hi - s.lo));
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-3 text-xs text-mute">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]">% of gross kept</p>
        <div className="grid grid-cols-[auto_repeat(5,2.5rem)] items-center gap-x-1 gap-y-1">
          {(['CA', 'US'] as const).map((c) => (
            <div key={c} className="contents">
              <span className="pr-2 text-ink-2">{c === 'CA' ? 'Canada' : 'United States'}</span>
              {marks.map((m) => (
                <i key={m} aria-hidden="true" className="block h-3 rounded-[3px]" style={{ background: RAMP[c][step(m, s)] }} />
              ))}
            </div>
          ))}
          <span />
          {marks.map((m) => (
            <span key={m} className="text-center text-[10.5px] tabular-nums">{m.toFixed(1)}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Kept share on a ruled scale. The scale starts at 60%, so it is a dot, not a bar. */
function Strip({ r }: { r: Row }) {
  const lo = 60;
  const hi = 90;
  const at = ((r.keptPct - lo) / (hi - lo)) * 100;
  return (
    <div className="relative h-3 w-full" aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: LINE }} />
      {[65, 70, 75, 80, 85].map((t) => (
        <div key={t} className="absolute top-0.5 h-2 w-px" style={{ left: `${((t - lo) / (hi - lo)) * 100}%`, background: LINE }} />
      ))}
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ left: `${at}%`, background: swatchOf(r), boxShadow: '0 0 0 2px #FFFFFF' }}
      />
    </div>
  );
}

function Figure({ label, value, note, highlight = false }: { label: string; value: string; note: string; highlight?: boolean }) {
  return (
    <div className="min-w-0 rounded-2xl border border-line bg-white p-3 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-mute sm:text-[11px] sm:tracking-[0.12em]">{label}</p>
      <p className={`mt-2 font-display text-[1.6rem] font-semibold leading-none tabular-nums sm:text-[2.5rem] ${highlight ? 'text-red-600' : 'text-ink'}`}>{value}</p>
      <p className="mt-2 text-xs leading-4 text-ink-3 sm:text-sm sm:leading-5">{note}</p>
    </div>
  );
}

const names = (rows: Row[]) => (rows.length > 3 ? `${rows.length} places, ${rows.map((r) => r.code).join(' ')}` : rows.map((r) => r.name).join(', '));

export default function RankingPlate({ tiers, medians }: { tiers: Tier[]; medians: { CA: Row[]; US: Row[] } }) {
  const [usd, setUsd] = useState(60000);
  const [at, setAt] = useState<string | null>(null);
  const [read, setRead] = useState(false);

  // Shareable state: ?usd=60000&at=ON. Read once, then kept in the address bar —
  // and not written before it has been read, or the first render would erase it.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const u = Number(q.get('usd'));
    if (tiers.some((t) => t.usd === u)) setUsd(u);
    const a = q.get('at')?.toUpperCase();
    if (a && TILE[a]) setAt(a);
    setRead(true);
  }, [tiers]);
  useEffect(() => {
    if (!read) return;
    const q = new URLSearchParams(window.location.search);
    q.set('usd', String(usd));
    if (at) q.set('at', at); else q.delete('at');
    window.history.replaceState(null, '', `${window.location.pathname}?${q}`);
  }, [read, usd, at]);

  const tier = tiers.find((t) => t.usd === usd)!;
  const top = firstPlace(tier);
  const bottom = lastPlace(tier);
  const ca = bestOf(tier, 'CA');
  const pick = at ? tier.rows.find((r) => r.code === at)! : null;
  const ahead = pick ? tier.rows.filter((r) => r.rank < pick.rank).length : 0;
  const byName = useMemo(() => [...tiers[0].rows].sort((a, b) => a.name.localeCompare(b.name)), [tiers]);

  return (
    <div>
      {/* Salary */}
      <div role="group" aria-label="Salary" className="grid grid-cols-5 gap-1 rounded-2xl border border-line bg-white p-1">
        {tiers.map((t) => {
          const on = t.usd === usd;
          return (
            <button
              key={t.usd}
              type="button"
              aria-pressed={on}
              aria-label={`US$${t.usd.toLocaleString('en-US')}, C$${t.cad.toLocaleString('en-US')}`}
              onClick={() => setUsd(t.usd)}
              className={`min-w-0 rounded-xl px-1.5 py-2 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-1 sm:px-3 sm:py-2.5 ${on ? 'bg-ink text-white' : 'text-ink hover:bg-pearl-soft'}`}
            >
              <span className="block font-display text-base font-semibold leading-tight tabular-nums sm:text-xl"><span className="hidden sm:inline">US</span>${k(t.usd)}</span>
              <span className={`block text-[10px] tabular-nums sm:text-[11px] ${on ? 'text-pearl-shade' : 'text-mute'}`}>
                <span className="sm:hidden">C${Math.round(t.cad / 1000)}k</span>
                <span className="hidden sm:inline">C${t.cad.toLocaleString('en-US')}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Three figures */}
      <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        <Figure label="Keeps the most" value={`${top[0].keptPct.toFixed(1)}%`} note={names(top)} />
        <Figure label="Best in Canada" value={`#${ca.rank}`} highlight note={`${ca.name}, ${ca.keptPct.toFixed(1)}% kept — of 64`} />
        <Figure label="Keeps the least" value={`${bottom[0].keptPct.toFixed(1)}%`} note={names(bottom)} />
      </div>

      {/* Map */}
      <figure className="mt-6 rounded-2xl border border-line bg-white p-4 sm:p-8">
        <Cartogram tier={tier} selected={at} onSelect={(c) => setAt(c === at ? null : c)} />
        <figcaption className="mt-6 border-t border-line pt-5">
          <Legend tier={tier} />
        </figcaption>
      </figure>

      {/* You */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <label htmlFor="at" className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">Where you work</label>
        <select
          id="at"
          value={at ?? ''}
          onChange={(e) => setAt(e.target.value || null)}
          className="mt-2 block w-full rounded-xl border border-line bg-white px-3 py-2.5 text-base text-ink focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/10"
        >
          <option value="">Choose a province, territory or state</option>
          <optgroup label="Canada">{byName.filter((r) => r.country === 'CA').map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}</optgroup>
          <optgroup label="United States">{byName.filter((r) => r.country === 'US').map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}</optgroup>
        </select>
        {pick ? (
          <p className="mt-4 text-lg leading-7 text-ink-2" aria-live="polite">
            <span className="font-display text-4xl font-semibold leading-none tabular-nums text-ink">{rankLabel(tier.rows, pick)}</span>
            <span className="text-mute"> of 64 · </span>
            {pick.name} keeps <strong className="tabular-nums text-ink">{money(pick, pick.net)}</strong> of {money(pick, pick.gross)}, {pick.keptPct.toFixed(1)}%.{' '}
            {ahead ? `${ahead} place${ahead > 1 ? 's' : ''} keep more.` : 'Nowhere keeps more.'}
          </p>
        ) : null}
      </div>

      {/* Table */}
      <h2 className="mt-14 font-display text-2xl font-semibold text-ink md:text-[2rem]">All 64, at US${k(usd)}</h2>
      <ol className="mt-5 divide-y divide-line border-y border-line tabular-nums">
        {tier.rows.map((r) => (
          <li
            key={r.code}
            onClick={() => setAt(r.code)}
            className={`grid cursor-pointer grid-cols-[2.75rem_1fr_auto] items-center gap-x-3 px-1 py-2.5 transition-colors duration-150 hover:bg-white sm:grid-cols-[2.75rem_12rem_1fr_4rem_7.5rem] ${r.code === at ? 'bg-white' : ''}`}
            style={r.code === at ? { boxShadow: `inset 3px 0 0 ${INK}` } : undefined}
          >
            <span className="text-right font-display text-xl font-semibold leading-none text-ink-3">{rankLabel(tier.rows, r)}</span>
            <span className="leading-tight">
              <span className="text-ink">{r.name}</span>{' '}
              <span className="ml-1 inline-flex items-center gap-1 align-middle text-[10px] font-semibold tracking-wider text-mute">
                <Swatch color={swatchOf(r)} className="h-2 w-2" />{r.country === 'CA' ? 'CAN' : 'USA'}
              </span>
              <span className="block text-xs text-mute sm:hidden">{money(r, r.net)}</span>
            </span>
            <span className="hidden sm:block"><Strip r={r} /></span>
            <span className="text-right text-base font-semibold text-ink">{r.keptPct.toFixed(1)}%</span>
            <span className="hidden text-right text-sm text-ink-3 sm:block">{money(r, r.net)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 hidden justify-between text-[11px] text-mute sm:flex">
        <span>Places that print the same share share a rank.</span>
        <span>Dot scale 60–90% kept</span>
      </p>

      {/* Medians */}
      <details className="mt-12 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <summary className="cursor-pointer font-display text-2xl font-semibold text-ink">At each place&rsquo;s own median wage</summary>
        <p className="mt-3 text-sm text-ink-3">Ranked within each country. The two countries measure the median differently.</p>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          {(['CA', 'US'] as const).map((c) => (
            <ol key={c} className="tabular-nums">
              <li className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-mute">
                <Swatch color={c === 'CA' ? RED : US_INK} />{c === 'CA' ? 'Canada · provinces' : 'United States'}
              </li>
              {medians[c].map((r) => (
                <li key={r.code} className="grid grid-cols-[2.25rem_1fr_auto] gap-x-2 border-t border-line py-1.5 text-sm">
                  <span className="font-display font-semibold text-ink-3">{rankLabel(medians[c], r)}</span>
                  <span className="text-ink">{r.name} <span className="text-xs text-mute">{money(r, r.gross)}</span></span>
                  <span className="text-ink">{r.keptPct.toFixed(1)}%</span>
                </li>
              ))}
            </ol>
          ))}
        </div>
      </details>
    </div>
  );
}
