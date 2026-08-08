'use client';
import { useState } from 'react';

// Donut chart drawn as real SVG arc PATHS rather than stroke-dasharray circles.
// The dasharray approach mis-renders when a slice wraps the 12 o'clock origin
// and can't grow a slice without shifting the ring; paths are exact.

type Row = { k: string | number; n: number };

const PALETTE = ['#dc2626', '#f97316', '#eab308', '#0d9488', '#0284c7', '#4f46e5', '#9333ea', '#db2777', '#64748b', '#78716c'];

const CX = 80;
const CY = 80;
const R_OUT = 70;
const R_IN = 44;

function arc(startFrac: number, endFrac: number, rOut: number, rIn: number) {
  // Fractions run clockwise from 12 o'clock.
  const a0 = startFrac * 2 * Math.PI - Math.PI / 2;
  const a1 = endFrac * 2 * Math.PI - Math.PI / 2;
  const large = endFrac - startFrac > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)},${(CY + r * Math.sin(a)).toFixed(2)}`;
  // A single slice covering the whole circle can't be drawn as one arc.
  if (endFrac - startFrac >= 0.999) {
    return `M ${p(rOut, 0)} A ${rOut} ${rOut} 0 1 1 ${p(rOut, Math.PI)} A ${rOut} ${rOut} 0 1 1 ${p(rOut, 0)} Z
            M ${p(rIn, 0)} A ${rIn} ${rIn} 0 1 0 ${p(rIn, Math.PI)} A ${rIn} ${rIn} 0 1 0 ${p(rIn, 0)} Z`;
  }
  return `M ${p(rOut, a0)} A ${rOut} ${rOut} 0 ${large} 1 ${p(rOut, a1)} L ${p(rIn, a1)} A ${rIn} ${rIn} 0 ${large} 0 ${p(rIn, a0)} Z`;
}

export default function Donut({
  rows,
  label,
}: {
  rows: Row[];
  label?: (k: string | number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = rows.reduce((a, r) => a + r.n, 0);
  if (!total) return <p className="text-sm text-slate-400">No data yet.</p>;

  let acc = 0;
  const slices = rows.map((r, i) => {
    const start = acc / total;
    acc += r.n;
    return { i, row: r, start, end: acc / total };
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="h-[150px] w-[150px] shrink-0">
        {slices.map((s) => (
          <path
            key={String(s.row.k)}
            d={arc(s.start, s.end, hover === s.i ? R_OUT + 4 : R_OUT, R_IN)}
            fill={PALETTE[s.i % PALETTE.length]}
            stroke="#fff"
            strokeWidth="1.5"
            onMouseEnter={() => setHover(s.i)}
            onMouseLeave={() => setHover(null)}
            className="cursor-default transition-[d]"
          />
        ))}
        {hover !== null && (
          <text x={CX} y={CY + 5} textAnchor="middle" className="fill-slate-800 text-[15px] font-bold">
            {Math.round((rows[hover].n / total) * 100)}%
          </text>
        )}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5">
        {rows.map((r, i) => (
          <li
            key={String(r.k)}
            className={`flex items-center gap-2 text-sm ${hover === i ? 'font-semibold' : ''}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          >
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="truncate text-slate-600">{label ? label(r.k) : String(r.k)}</span>
            <span className="ml-auto shrink-0 tabular-nums text-xs text-slate-500">
              {r.n} · {Math.round((r.n / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
