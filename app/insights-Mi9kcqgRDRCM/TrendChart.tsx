'use client';
import { useEffect, useMemo, useState } from 'react';

/**
 * How many points fit before the bars stop being legible.
 *
 * The chart used to keep a 520px minimum inside a horizontal scroller, which
 * on a phone meant a scrollbar Travis disliked and, on the sparkline beside
 * it, a chart clipped clean off the card. Shrinking the type was ruled out,
 * so the window shortens instead: two weeks on a phone, the full run on a
 * desktop. Same bar size either way.
 */
function useMaxPoints() {
  const [n, setN] = useState(60);
  useEffect(() => {
    const q = window.matchMedia('(max-width: 640px)');
    const apply = () => setN(q.matches ? 14 : 60);
    apply();
    q.addEventListener('change', apply);
    return () => q.removeEventListener('change', apply);
  }, []);
  return n;
}

// Activity over time. Bars are calculations, the line is a moving average so a
// single quiet day doesn't read as a collapse, and the dashed line marks the
// average across the visible window. Pure SVG — no chart library.

type Point = { k: string; n: number; v: number };
type Series = {
  daily: Point[];
  weekly: Point[];
  monthly: Point[];
  today: number;
  yesterday: number;
  this_week: number;
  last_week: number;
  this_month: number;
  last_month: number;
  best_day: { k: string; n: number } | null;
};

type Grain = 'daily' | 'weekly' | 'monthly';

const W = 900;
const H = 260;
const PAD_L = 44;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 34;

function label(grain: Grain, k: string) {
  if (grain === 'monthly') {
    const [y, m] = k.split('-');
    return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m - 1]} ${y.slice(2)}`;
  }
  const [, m, d] = k.split('-');
  return `${+m}/${+d}`;
}

function Delta({ now, prev, unit }: { now: number; prev: number; unit: string }) {
  if (prev === 0) {
    return <span className="text-xs text-slate-400">no {unit} to compare</span>;
  }
  const pct = Math.round(((now - prev) / prev) * 100);
  const up = pct >= 0;
  return (
    <span className={`text-xs font-semibold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
      {up ? '▲' : '▼'} {Math.abs(pct)}% vs {unit}
    </span>
  );
}

export default function TrendChart({ series }: { series: Series }) {
  const [grain, setGrain] = useState<Grain>('daily');
  const [hover, setHover] = useState<number | null>(null);

  // Trim to the tail: the recent end is the part anyone reads.
  const maxPoints = useMaxPoints();
  const allPoints = series[grain] ?? [];
  const points = allPoints.slice(-maxPoints);
  const maWindow = grain === 'daily' ? 7 : 3;

  const { bars, ma, max, avg } = useMemo(() => {
    const max = Math.max(1, ...points.map((p) => p.n));
    const avg = points.length ? points.reduce((a, p) => a + p.n, 0) / points.length : 0;
    const innerW = W - PAD_L - PAD_R;
    const innerH = H - PAD_T - PAD_B;
    const step = innerW / Math.max(1, points.length);
    const barW = Math.max(2, Math.min(38, step * 0.62));

    const bars = points.map((p, i) => {
      const h = (p.n / max) * innerH;
      return {
        ...p,
        x: PAD_L + step * i + (step - barW) / 2,
        y: PAD_T + innerH - h,
        w: barW,
        h,
        cx: PAD_L + step * i + step / 2,
      };
    });

    // Trailing moving average — only drawn once enough periods exist.
    const ma = points.map((_, i) => {
      const from = Math.max(0, i - maWindow + 1);
      const slice = points.slice(from, i + 1);
      const m = slice.reduce((a, p) => a + p.n, 0) / slice.length;
      return {
        x: PAD_L + step * i + step / 2,
        y: PAD_T + innerH - (m / max) * innerH,
        v: m,
      };
    });

    return { bars, ma, max, avg };
  }, [points, maWindow]);

  const innerH = H - PAD_T - PAD_B;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD_T + innerH - f * innerH,
    v: Math.round(max * f),
  }));
  const avgY = PAD_T + innerH - (avg / max) * innerH;

  const hovered = hover !== null ? bars[hover] : null;
  const total = points.reduce((a, p) => a + p.n, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-800">Activity over time</h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Bars are calculations; the line is a {maWindow}-period moving average.
          </p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-0.5">
          {(['daily', 'weekly', 'monthly'] as Grain[]).map((g) => (
            <button
              key={g}
              onClick={() => {
                setGrain(g);
                setHover(null);
              }}
              className={`rounded-md px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                grain === g ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {g === 'daily' ? 'Day' : g === 'weekly' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </div>

      {/* period comparisons */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { l: 'Today', v: series.today, d: <Delta now={series.today} prev={series.yesterday} unit="yesterday" /> },
          { l: 'This week', v: series.this_week, d: <Delta now={series.this_week} prev={series.last_week} unit="last week" /> },
          { l: 'This month', v: series.this_month, d: <Delta now={series.this_month} prev={series.last_month} unit="last month" /> },
          {
            l: 'Best day',
            v: series.best_day?.n ?? 0,
            d: <span className="text-xs text-slate-400">{series.best_day ? label('daily', series.best_day.k) : '—'}</span>,
          },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <div className="text-lg font-bold tabular-nums text-slate-900">{s.v.toLocaleString()}</div>
            <div className="text-[11px] font-medium text-slate-500">{s.l}</div>
            <div className="mt-0.5">{s.d}</div>
          </div>
        ))}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* gridlines */}
          {ticks.map((t) => (
            <g key={t.y}>
              <line x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={PAD_L - 8} y={t.y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
                {t.v}
              </text>
            </g>
          ))}

          {/* average line */}
          {avg > 0 && (
            <>
              <line
                x1={PAD_L}
                y1={avgY}
                x2={W - PAD_R}
                y2={avgY}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="5 4"
              />
              <text x={W - PAD_R} y={avgY - 5} textAnchor="end" className="fill-slate-400 text-[10px]">
                avg {avg.toFixed(1)}
              </text>
            </>
          )}

          {/* bars */}
          {bars.map((b, i) => (
            <g key={b.k} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect
                x={b.x - 2}
                y={PAD_T}
                width={b.w + 4}
                height={H - PAD_T - PAD_B}
                fill="transparent"
              />
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={Math.max(b.h, b.n > 0 ? 2 : 0)}
                rx={Math.min(4, b.w / 2)}
                fill={hover === i ? '#b91c1c' : '#dc2626'}
                opacity={b.n === 0 ? 0.15 : 1}
              />
            </g>
          ))}

          {/* moving average */}
          {points.length > 1 && (
            <polyline
              points={ma.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity="0.75"
            />
          )}

          {/* x labels — thinned so they never collide */}
          {bars.map((b, i) => {
            const every = Math.ceil(bars.length / 12);
            if (i % every !== 0 && i !== bars.length - 1) return null;
            return (
              <text
                key={`x${b.k}`}
                x={b.cx}
                y={H - 12}
                textAnchor="middle"
                className="fill-slate-400 text-[10px]"
              >
                {label(grain, b.k)}
              </text>
            );
          })}

          {/* hover readout */}
          {hovered && (
            <g>
              <line
                x1={hovered.cx}
                y1={PAD_T}
                x2={hovered.cx}
                y2={H - PAD_B}
                stroke="#0f172a"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.35"
              />
              <circle cx={hovered.cx} cy={hovered.y} r="4" fill="#0f172a" />
            </g>
          )}
        </svg>

        {hovered && (
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 rounded-lg bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg">
            <span className="font-bold">{label(grain, hovered.k)}</span>
            {' · '}
            {hovered.n} calculation{hovered.n === 1 ? '' : 's'}
            {' · '}
            {hovered.v} visit{hovered.v === 1 ? '' : 's'}
          </div>
        )}
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        {total.toLocaleString()} calculations across the visible window. Days with no activity are shown
        as empty slots rather than skipped, so a gap reads as a gap.
      </p>
    </section>
  );
}
