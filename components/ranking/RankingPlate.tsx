'use client';

import { useEffect, useMemo, useState } from 'react';
import { GRID, TILE, bestOf, firstPlace, lastPlace, type Row, type Tier } from '../../lib/naRanking';

// The plate's inks. Paper and ink follow the engraving language of avowd.ai;
// Canada is printed in a second, red ink so the 13 read as one block.
const PAPER = '#FBF5E7';
const INK = '#1A1408';
const INK70 = '#4A3D22';
const DIM = '#6E6043';
const RULE = '#DCCBA4';
const RED = '#A3271B';
const inkOf = (r: Pick<Row, 'country'>) => (r.country === 'CA' ? RED : INK);

const display = { fontFamily: 'var(--font-display), Didot, Georgia, serif' };
const mono = { fontFamily: 'var(--font-mono), ui-monospace, monospace' };

// Hatching weight carries the share that goes to tax: more ink, less kept.
// The scale runs from the tier's highest share to its lowest, so the lightest
// and the darkest square are always the two ends; the legend prints the
// shares each weight stands for at the salary shown.
const STEPS = 20;
type Scale = { hi: number; lo: number };
const scaleOf = (t: Tier): Scale => ({ hi: t.rows[0].keptPct, lo: t.rows[t.rows.length - 1].keptPct });
const bucket = (keptPct: number, s: Scale) =>
  Math.round(Math.min(1, Math.max(0, (s.hi - keptPct) / (s.hi - s.lo))) * STEPS);

function HatchDefs() {
  const defs = [];
  for (const [key, color] of [['us', INK], ['ca', RED]] as const) {
    for (let b = 0; b <= STEPS; b++) {
      const d = b / STEPS;
      const w = 0.3 + d * 2.4;
      const cross = d > 0.55 ? (d - 0.55) * 3 : 0;
      defs.push(
        <pattern key={`${key}${b}`} id={`hatch-${key}-${b}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="2" x2="4" y2="2" stroke={color} strokeWidth={w} />
          {cross ? <line x1="2" y1="0" x2="2" y2="4" stroke={color} strokeWidth={cross} /> : null}
        </pattern>,
      );
    }
  }
  return <defs>{defs}</defs>;
}

const money = (r: Row, n: number) => `${r.country === 'CA' ? 'C$' : 'US$'}${Math.round(n).toLocaleString('en-US')}`;
const k = (usd: number) => `${usd / 1000}k`;

/** "=1" when a rank is shared, the way league tables have always printed it. */
function rankLabel(rows: Row[], r: Row) {
  return rows.filter((x) => x.rank === r.rank).length > 1 ? `=${r.rank}` : `${r.rank}`;
}

const S = 56; // tile pitch
const T = 50; // tile size
const BAND = 17; // the paper label at the foot of each tile

function Cartogram({ tier, selected, onSelect }: { tier: Tier; selected: string | null; onSelect: (c: string) => void }) {
  const s = scaleOf(tier);
  return (
    <svg viewBox={`-2 -2 ${GRID.cols * S + 2} ${GRID.rows * S + 2}`} className="w-full" aria-hidden="true">
      <HatchDefs />
      {tier.rows.map((r) => {
        const [c, row] = TILE[r.code];
        const x = c * S;
        const y = row * S;
        const on = selected === r.code;
        return (
          <g key={r.code} onClick={() => onSelect(r.code)} className="cursor-pointer">
            <rect x={x} y={y} width={T} height={T - BAND} fill={`url(#hatch-${r.country === 'CA' ? 'ca' : 'us'}-${bucket(r.keptPct, s)})`} />
            <rect x={x} y={y + T - BAND} width={T} height={BAND} fill={PAPER} />
            <line x1={x} x2={x + T} y1={y + T - BAND} y2={y + T - BAND} stroke={inkOf(r)} strokeWidth="0.75" />
            <rect x={x} y={y} width={T} height={T} fill="none" stroke={inkOf(r)} strokeWidth={on ? 3 : 0.9} />
            <text x={x + 4} y={y + T - 4} fill={inkOf(r)} style={mono} fontWeight={600} className="text-[14px] sm:text-[10.5px]">{r.code}</text>
            <text x={x + T - 4} y={y + T - 5} fontSize="10" fill={INK70} textAnchor="end" style={mono} className="hidden sm:inline">
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
  const marks = [0, 0.25, 0.5, 0.75, 1].map((f) => s.hi - f * (s.hi - s.lo));
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]" style={{ ...mono, color: DIM }}>
      <span>% of gross kept</span>
      {/* Patterns come from the cartogram's <defs> on the same page — one copy, no duplicate ids. */}
      <svg width={marks.length * 40} height="26" aria-hidden="true">
        {marks.map((m, i) => (
          <g key={m}>
            <rect x={i * 40} y="0" width="34" height="14" fill={`url(#hatch-us-${bucket(m, s)})`} stroke={INK} strokeWidth="0.75" />
            <text x={i * 40 + 17} y="25" fontSize="9.5" textAnchor="middle" fill={DIM}>{m.toFixed(1)}</text>
          </g>
        ))}
      </svg>
      <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 border" style={{ borderColor: RED, background: RED }} /> Canada</span>
      <span className="flex items-center gap-2"><i className="inline-block h-3 w-3 border" style={{ borderColor: INK, background: INK }} /> United States</span>
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
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: RULE }} />
      {[65, 70, 75, 80, 85].map((t) => (
        <div key={t} className="absolute top-0 h-3 w-px" style={{ left: `${((t - lo) / (hi - lo)) * 100}%`, background: RULE }} />
      ))}
      <div className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${at}%`, background: inkOf(r) }} />
    </div>
  );
}

function Figure({ label, value, note, color = INK }: { label: string; value: string; note: string; color?: string }) {
  return (
    <div className="min-w-0 border-t pt-3" style={{ borderColor: INK }}>
      <p className="text-[10px] uppercase tracking-[0.14em] sm:text-[11px] sm:tracking-[0.18em]" style={{ ...mono, color: DIM }}>{label}</p>
      <p className="mt-1 text-[1.9rem] leading-none sm:text-5xl" style={{ ...display, color }}>{value}</p>
      <p className="mt-2 text-xs leading-4 sm:text-sm sm:leading-5" style={{ color: INK70 }}>{note}</p>
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
      <div role="group" aria-label="Salary" className="grid grid-cols-5 border" style={{ borderColor: INK }}>
        {tiers.map((t) => {
          const on = t.usd === usd;
          return (
            <button
              key={t.usd}
              type="button"
              aria-pressed={on}
              aria-label={`US$${t.usd.toLocaleString('en-US')}, C$${t.cad.toLocaleString('en-US')}`}
              onClick={() => setUsd(t.usd)}
              className="min-w-0 border-r px-1.5 py-2 text-left last:border-r-0 sm:px-3"
              style={{ borderColor: INK, background: on ? INK : 'transparent', color: on ? PAPER : INK }}
            >
              <span className="block text-base leading-tight sm:text-xl" style={display}><span className="hidden sm:inline">US</span>${k(t.usd)}</span>
              <span className="block text-[10px] sm:text-[11px]" style={{ ...mono, opacity: 0.75 }}>
                <span className="sm:hidden">C${Math.round(t.cad / 1000)}k</span>
                <span className="hidden sm:inline">C${t.cad.toLocaleString('en-US')}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Three figures */}
      <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-8">
        <Figure label="Keeps the most" value={`${top[0].keptPct.toFixed(1)}%`} note={names(top)} />
        <Figure label="Best in Canada" value={`#${ca.rank}`} color={RED} note={`${ca.name}, ${ca.keptPct.toFixed(1)}% kept — of 64`} />
        <Figure label="Keeps the least" value={`${bottom[0].keptPct.toFixed(1)}%`} note={names(bottom)} />
      </div>

      {/* Map */}
      <figure className="mt-12">
        <Cartogram tier={tier} selected={at} onSelect={(c) => setAt(c === at ? null : c)} />
        <figcaption className="mt-4">
          <Legend tier={tier} />
        </figcaption>
      </figure>

      {/* You */}
      <div className="mt-10 border p-5" style={{ borderColor: INK, background: '#FFFCF4' }}>
        <label htmlFor="at" className="text-[11px] uppercase tracking-[0.18em]" style={{ ...mono, color: DIM }}>Where you work</label>
        <select
          id="at"
          value={at ?? ''}
          onChange={(e) => setAt(e.target.value || null)}
          className="mt-2 block w-full border bg-transparent px-3 py-2 text-base"
          style={{ borderColor: INK, color: INK }}
        >
          <option value="">Choose a province, territory or state</option>
          <optgroup label="Canada">{byName.filter((r) => r.country === 'CA').map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}</optgroup>
          <optgroup label="United States">{byName.filter((r) => r.country === 'US').map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}</optgroup>
        </select>
        {pick ? (
          <p className="mt-4 text-lg leading-7" style={{ color: INK }} aria-live="polite">
            <span className="text-4xl leading-none" style={{ ...display, color: inkOf(pick) }}>{rankLabel(tier.rows, pick)}</span>
            <span style={{ color: DIM }}> of 64 · </span>
            {pick.name} keeps <strong>{money(pick, pick.net)}</strong> of {money(pick, pick.gross)}, {pick.keptPct.toFixed(1)}%.{' '}
            {ahead ? `${ahead} place${ahead > 1 ? 's' : ''} keep more.` : 'Nowhere keeps more.'}
          </p>
        ) : null}
      </div>

      {/* Table */}
      <h2 className="mt-14 text-3xl" style={display}>All 64, at US${k(usd)}</h2>
      <ol className="mt-4 border-t" style={{ borderColor: INK }}>
        {tier.rows.map((r) => (
          <li
            key={r.code}
            onClick={() => setAt(r.code)}
            className="grid cursor-pointer grid-cols-[2.75rem_1fr_auto] items-center gap-x-3 border-b py-2 sm:grid-cols-[2.75rem_11rem_1fr_4rem_7.5rem]"
            style={{ borderColor: RULE, background: r.code === at ? '#FDF0C4' : undefined }}
          >
            <span className="text-xl leading-none" style={{ ...display, color: inkOf(r) }}>{rankLabel(tier.rows, r)}</span>
            <span className="leading-tight">
              <span style={{ color: INK }}>{r.name}</span>{' '}
              <span className="text-[10px] tracking-wider" style={{ ...mono, color: inkOf(r) }}>{r.country === 'CA' ? 'CAN' : 'USA'}</span>
              <span className="block text-xs sm:hidden" style={{ ...mono, color: DIM }}>{money(r, r.net)}</span>
            </span>
            <span className="hidden sm:block"><Strip r={r} /></span>
            <span className="text-right text-base" style={{ ...mono, color: INK }}>{r.keptPct.toFixed(1)}%</span>
            <span className="hidden text-right text-sm sm:block" style={{ ...mono, color: INK70 }}>{money(r, r.net)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-2 hidden justify-between text-[10px] sm:flex" style={{ ...mono, color: DIM }}>
        <span>Places that print the same share share a rank.</span>
        <span>Dot scale 60–90% kept</span>
      </p>

      {/* Medians */}
      <details className="mt-12 border-t pt-4" style={{ borderColor: INK }}>
        <summary className="cursor-pointer text-2xl" style={display}>At each place&rsquo;s own median wage</summary>
        <p className="mt-3 text-sm" style={{ color: INK70 }}>Ranked within each country. The two countries measure the median differently.</p>
        <div className="mt-6 grid gap-10 md:grid-cols-2">
          {(['CA', 'US'] as const).map((c) => (
            <ol key={c}>
              <li className="mb-2 text-[11px] uppercase tracking-[0.18em]" style={{ ...mono, color: c === 'CA' ? RED : DIM }}>{c === 'CA' ? 'Canada · provinces' : 'United States'}</li>
              {medians[c].map((r) => (
                <li key={r.code} className="grid grid-cols-[2.25rem_1fr_auto] gap-x-2 border-b py-1 text-sm" style={{ borderColor: RULE }}>
                  <span style={{ ...display, color: inkOf(r) }}>{rankLabel(medians[c], r)}</span>
                  <span style={{ color: INK }}>{r.name} <span style={{ ...mono, color: DIM }} className="text-xs">{money(r, r.gross)}</span></span>
                  <span style={{ ...mono, color: INK }}>{r.keptPct.toFixed(1)}%</span>
                </li>
              ))}
            </ol>
          ))}
        </div>
      </details>
    </div>
  );
}
