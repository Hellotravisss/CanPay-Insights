'use client';
import { useMemo, useState } from 'react';
import type { BarometerRow } from '../../lib/d1/events';

export type BarometerData = {
  month: BarometerRow[]; quarter: BarometerRow[]; year: BarometerRow[];
  labels: string[]; midpoints: number[]; midpoint_top: number; thin: number;
};

type Grain = 'month' | 'quarter' | 'year';
const money = (n: number | null) => (n === null ? '—' : '$' + Math.round(n).toLocaleString('en-CA'));

/**
 * The income people typed in, over time. A sparkline of the midpoint estimate
 * plus a table that shows, for every period, the two things the estimate
 * cannot: the median bracket (no assumption) and how many sat below their own
 * province's median wage (measured against StatCan, not against this site).
 *
 * The grain toggle is honest about history: with two months of data a
 * "yearly" view is one row, and it says so rather than drawing a line
 * through a single point.
 */
export default function IncomeBarometer({ data, zh }: { data: BarometerData; zh: boolean }) {
  const T = (en: string, z: string) => (zh ? z : en);
  const [grain, setGrain] = useState<Grain>('month');
  const rows = data[grain];
  const withMean = rows.filter((r) => r.mean_est !== null);

  const spark = useMemo(() => {
    if (withMean.length < 2) return null;
    const W = 560, H = 120, P = 12;
    const ys = withMean.map((r) => r.mean_est as number);
    const lo = Math.min(...ys), hi = Math.max(...ys), span = Math.max(1, hi - lo);
    const x = (i: number) => P + (i * (W - 2 * P)) / (withMean.length - 1);
    const y = (v: number) => H - P - ((v - lo) * (H - 2 * P)) / span;
    return { W, H, lo, hi, pts: withMean.map((r, i) => ({ x: x(i), y: y(r.mean_est as number), r })) };
  }, [withMean]);

  const first = withMean[0]?.mean_est ?? null, last = withMean[withMean.length - 1]?.mean_est ?? null;
  const delta = first !== null && last !== null && withMean.length > 1 ? last - first : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
        {(['month', 'quarter', 'year'] as Grain[]).map((g) => (
          <button
            key={g}
            onClick={() => setGrain(g)}
            className={`rounded-md border px-2.5 py-1 ${grain === g ? 'border-red-600 bg-red-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
          >
            {g === 'month' ? T('Monthly', '按月') : g === 'quarter' ? T('Quarterly', '按季') : T('Yearly', '按年')}
          </button>
        ))}
        {delta !== null && (
          <span className="ml-auto text-slate-500">
            {T('First → latest period', '首期 → 最新')}: <b className={delta >= 0 ? 'text-emerald-700' : 'text-red-700'}>{delta >= 0 ? '+' : '−'}{money(Math.abs(delta))}</b>
          </span>
        )}
      </div>

      {spark ? (
        <svg viewBox={`0 0 ${spark.W} ${spark.H}`} className="mb-4 block w-full" role="img" aria-label={T('Estimated mean income over time', '收入估计均值随时间变化')}>
          <line x1="12" x2={spark.W - 12} y1={spark.H - 12} y2={spark.H - 12} stroke="#e2e8f0" />
          <polyline fill="none" stroke="#dc2626" strokeWidth="2" strokeLinejoin="round" points={spark.pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')} />
          {spark.pts.map((p) => (
            <g key={p.r.k}>
              <circle cx={p.x} cy={p.y} r={p.r.thin ? 2.5 : 3.5} fill={p.r.thin ? '#fff' : '#dc2626'} stroke="#dc2626" strokeWidth="1.5">
                <title>{p.r.k} · {money(p.r.mean_est)} · n={p.r.n}</title>
              </circle>
              <text x={p.x} y={spark.H - 1} fontSize="9" textAnchor="middle" fill="#94a3b8">{p.r.k}</text>
            </g>
          ))}
          <text x="12" y="10" fontSize="9" fill="#94a3b8">{money(spark.hi)}</text>
          <text x="12" y={spark.H - 16} fontSize="9" fill="#94a3b8">{money(spark.lo)}</text>
        </svg>
      ) : (
        <p className="mb-4 text-xs text-slate-400">
          {T(`Only ${rows.length} period at this grain so far — a trend needs at least two. Switch to a finer grain, or wait.`,
             `这个粒度目前只有 ${rows.length} 期 —— 趋势至少要两期。换更细的粒度，或者等。`)}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 pr-4">{T('Period', '期间')}</th>
              <th className="py-2 pr-4 text-right">{T('Calculations', '计算次数')}</th>
              <th className="py-2 pr-4 text-right">{T('Est. mean', '估计均值')}</th>
              <th className="py-2 pr-4">{T('Median bracket', '中位区间')}</th>
              <th className="py-2 pr-4 text-right">{T('Below own province median', '低于本省中位数')}</th>
              <th className="py-2">{T('Bracket mix', '区间构成')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const tot = r.brackets.reduce((a, b) => a + b, 0) || 1;
              return (
                <tr key={r.k} className={`border-b border-slate-100 ${r.thin ? 'text-slate-400' : 'text-slate-800'}`}>
                  <td className="py-2 pr-4 font-medium">{r.k}{r.thin && <span className="ml-1 text-[10px] uppercase tracking-wide text-amber-600">{T('thin', '样本少')}</span>}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.n.toLocaleString('en-CA')}</td>
                  <td className="py-2 pr-4 text-right tabular-nums font-semibold">{money(r.mean_est)}</td>
                  <td className="py-2 pr-4">{r.median_label ?? '—'}</td>
                  <td className="py-2 pr-4 text-right tabular-nums">{r.below_median_share === null ? '—' : `${r.below_median_share}%`}</td>
                  <td className="py-2">
                    <div className="flex h-3 w-40 overflow-hidden rounded-sm" title={r.brackets.map((c, i) => `${data.labels[i]}: ${c}`).join(' · ')}>
                      {r.brackets.map((c, i) => (
                        <div key={i} style={{ width: `${(100 * c) / tot}%`, backgroundColor: `hsl(0 ${25 + i * 10}% ${72 - i * 7}%)` }} />
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs leading-5 text-slate-400">
        {T(
          `How to read it: nobody's exact income is stored — only a bracket — so the mean is an estimate from bracket midpoints (${data.midpoints.slice(0, -1).map((m) => '$' + m / 1000 + 'k').join(', ')}; the open $160k+ bracket is counted at $${data.midpoint_top / 1000}k). The median bracket makes no such assumption. "Below own province median" compares each person with Statistics Canada's median wage for the province they chose, at the time they calculated. This is a self-selected sample — people who check a pay calculator skew lower-income than the country — so read the direction of change, not the level. Periods under ${data.thin} calculations are marked thin.`,
          `怎么读：这里从不存任何人的精确收入，只存区间，所以「估计均值」是按区间中值算的（${data.midpoints.slice(0, -1).map((m) => '$' + m / 1000 + 'k').join('、')}；开口的 $160k+ 按 $${data.midpoint_top / 1000}k 计）。「中位区间」不依赖这个假设。「低于本省中位数」是把每个人和加拿大统计局公布的、其所选省份的中位工资相比，以计算当时为准。这是自选样本 —— 来查工资计算器的人整体偏低收入 —— 所以看变化方向，别看绝对水平。少于 ${data.thin} 次计算的期间标为「样本少」。`,
        )}
      </p>
    </div>
  );
}
