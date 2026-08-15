'use client';
import { useMemo, useState } from 'react';

/**
 * Daily income mix, drawn as candlesticks.
 *
 * This is NOT a price chart and must never be read as one. Exact incomes are
 * never stored — only a bracket — so what moves here is WHO turned up: the
 * body spans the 25th–75th percentile bracket of the day's visitors, the wick
 * spans the lowest and highest bracket seen, and the colour compares the day's
 * median bracket with the previous day's.
 *
 * Days with few events are drawn faint and their bodies hollow. A quartile
 * over a handful of visits is decoration, not evidence, and the whole point of
 * this room is that the numbers in it can be trusted.
 *
 * Hand-rolled SVG like Globe and Donut — a chart library is not worth a
 * dependency, a bundle, and a second set of theming rules for one panel.
 */

export type Candle = {
  d: string;
  n: number;
  lo: number;
  hi: number;
  q1: number;
  q3: number;
  med: number;
  dir: 'up' | 'down' | 'flat';
};
export type CandleData = { levels: { lvl: number; label: string }[]; candles: Candle[] };

const THIN = 20; // below this many events a day is shown, but not asserted

// Same palette as the bar chart above it: brand red for the mark, slate for
// structure, on the white card every other panel uses. This began as a
// near-black panel with green-up / red-down candles, which was wrong twice
// over — it read as a foreign object dropped into a light dashboard, and
// stock-market colours quietly assert that a day with more high earners is a
// good day, which is not a claim this data can make. Direction stays legible
// from where the median ticks sit.
const BODY = '#dc2626';
const BODY_HOVER = '#b91c1c';
const WICK = '#94a3b8';
const GRID = '#e2e8f0';

export default function Candles({ data }: { data: CandleData | null }) {
  const [hover, setHover] = useState<Candle | null>(null);

  const view = useMemo(() => {
    if (!data?.candles?.length) return null;
    const W = 720;
    const H = 300;
    const padL = 96;
    const padR = 16;
    const padT = 18;
    const padB = 34;
    const lo = 1;
    const hi = Math.max(...data.levels.map((l) => l.lvl));
    const plotH = H - padT - padB;
    const plotW = W - padL - padR;
    // Half a slot of margin at each end so the first and last candles are not
    // welded to the axis.
    const slot = plotW / data.candles.length;
    const body = Math.min(26, Math.max(6, slot * 0.55));
    const x = (i: number) => padL + slot * (i + 0.5);
    const y = (lvl: number) => padT + plotH - ((lvl - lo) / (hi - lo)) * plotH;
    return { W, H, padL, padR, padT, padB, plotH, plotW, slot, body, x, y, hi };
  }, [data]);

  if (!data || !view) {
    return <p className="text-sm text-slate-400">No calculations recorded yet.</p>;
  }

  const { W, H, padL, padT, plotH, plotW, body, x, y } = view;
  const shown = hover ?? data.candles[data.candles.length - 1];
  const labelOf = (lvl: number) =>
    data.levels.find((l) => l.lvl === Math.round(lvl))?.label ?? String(lvl);

  return (
    <div>
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
             aria-label="Daily distribution of income brackets checked">
          <defs>
            {/* Hatching marks the thin days, so "not enough data" is visible
                in the mark itself rather than only in a footnote. */}
            <pattern id="thin" width="5" height="5" patternTransform="rotate(45)"
                     patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="5" stroke="#fca5a5" strokeWidth="2" />
            </pattern>
          </defs>

          {/* bracket gridlines */}
          {data.levels.map((l) => (
            <g key={l.lvl}>
              <line x1={padL} x2={padL + plotW} y1={y(l.lvl)} y2={y(l.lvl)}
                    stroke={GRID} strokeWidth="1" />
              <text x={padL - 12} y={y(l.lvl) + 4} textAnchor="end"
                    className="fill-slate-400" style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace' }}>
                {l.label}
              </text>
            </g>
          ))}

          {data.candles.map((c, i) => {
            const hot = hover?.d === c.d;
            const col = hot ? BODY_HOVER : BODY;
            const thin = c.n < THIN;
            const top = y(Math.max(c.q1, c.q3));
            const bot = y(Math.min(c.q1, c.q3));
            const h = Math.max(2, bot - top);
            return (
              <g key={c.d}
                 onMouseEnter={() => setHover(c)}
                 onMouseLeave={() => setHover((v) => (v?.d === c.d ? null : v))}
                 style={{ cursor: 'pointer' }}>
                {/* generous hit area — the candle itself is a thin target */}
                <rect x={x(i) - view.slot / 2} y={padT} width={view.slot} height={plotH} fill="transparent" />
                <line x1={x(i)} x2={x(i)} y1={y(c.hi)} y2={y(c.lo)}
                      stroke={WICK} strokeWidth="1.5" opacity={thin ? 0.5 : 1} />
                <rect x={x(i) - body / 2} y={top} width={body} height={h} rx="2"
                      fill={thin ? 'url(#thin)' : col}
                      stroke={thin ? '#fca5a5' : 'none'} strokeWidth={thin ? 1 : 0}
                      opacity={thin ? 1 : hover && !hot ? 0.5 : 1} />
                {/* median tick */}
                <line x1={x(i) - body / 2} x2={x(i) + body / 2} y1={y(c.med)} y2={y(c.med)}
                      stroke="#ffffff" strokeWidth="2" opacity={thin ? 0.9 : 1} />
                <text x={x(i)} y={H - 12} textAnchor="middle"
                      className={hot ? 'fill-slate-700' : 'fill-slate-400'}
                      style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace' }}>
                  {c.d.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-xs text-slate-500">
        <span className="font-mono uppercase tracking-widest text-slate-400">
          {shown.d} <span className="tabular-nums">· {shown.n}</span> calcs
        </span>
        <span>
          middle half <strong className="text-slate-700">{labelOf(shown.q1)} – {labelOf(shown.q3)}</strong>
        </span>
        <span>
          median <strong className="text-slate-700">{labelOf(shown.med)}</strong>
        </span>
        {shown.n < THIN && <span className="text-amber-600">thin day — read with caution</span>}
      </div>

      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        Not a price chart. Exact incomes are never stored, so this plots the income
        <em> mix</em> of who checked their pay: the body is the middle half of that day&apos;s
        visitors by bracket, the wick is the full range, and the tick across the body is
        the median. Hatched bodies are days under {THIN} calculations.
      </p>
    </div>
  );
}
