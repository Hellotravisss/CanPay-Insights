'use client';
import { useState } from 'react';

// Donut chart in plain SVG — stroke-dasharray arcs, no charting library.

type Row = { k: string | number; n: number };

const PALETTE = ['#dc2626', '#f97316', '#facc15', '#0f766e', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899', '#64748b', '#78716c'];

export default function Donut({
  rows,
  label,
  centerLabel,
}: {
  rows: Row[];
  label?: (k: string | number) => string;
  centerLabel?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const total = rows.reduce((a, r) => a + r.n, 0);
  if (!total) return <p className="text-sm text-slate-400">No data yet.</p>;

  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" className="h-[150px] w-[150px] shrink-0 -rotate-90">
        {rows.map((r, i) => {
          const frac = r.n / total;
          const dash = frac * C;
          const el = (
            <circle
              key={String(r.k)}
              cx="80"
              cy="80"
              r={R}
              fill="none"
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={hover === i ? 30 : 24}
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-offset}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default transition-[stroke-width]"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="min-w-0 flex-1">
        {centerLabel && <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{centerLabel}</p>}
        <ul className="space-y-1.5">
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
                {Math.round((r.n / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
