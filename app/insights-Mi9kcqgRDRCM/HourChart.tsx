'use client';

/**
 * A 24-hour column chart, shared by "when people check their pay" and "when
 * shifts start" so the two clocks are literally the same shape and can be read
 * against each other.
 *
 * The bug this component exists to prevent: a percentage height only resolves
 * against a parent with a definite height. The previous markup put the bars
 * inside auto-height flex columns under `items-end`, so every bar — including
 * the 219-event 9am peak — collapsed to the 3px minimum and the chart looked
 * like a flat line of dashes. The column here is `h-full` with `justify-end`,
 * which gives the percentage something real to resolve against.
 */
export default function HourChart({
  rows,
  color = 'bg-red-600',
  peakLabel,
}: {
  rows: { k: number; n: number }[];
  color?: string;
  peakLabel: (hour: number, n: number) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  const total = rows.reduce((a, r) => a + r.n, 0);
  const peak = rows.reduce((a, r) => (r.n > a.n ? r : a), rows[0]);

  return (
    <div>
      {/* Gridlines give the height a scale — without them a tall bar says
          "many" but not "how many". */}
      <div className="relative h-44">
        {[1, 0.5].map((f) => (
          <div key={f} className="absolute inset-x-0 border-t border-dashed border-slate-100" style={{ top: `${(1 - f) * 100}%` }}>
            <span className="absolute -top-2 right-0 bg-white pl-1 text-[9px] tabular-nums text-slate-300">
              {Math.round(max * f)}
            </span>
          </div>
        ))}
        <div className="flex h-full items-stretch gap-[3px]">
          {rows.map((r) => (
            <div key={r.k} className="flex h-full flex-1 flex-col justify-end">
              <div
                className={`w-full rounded-t ${color} transition-[height]`}
                style={{ height: `${(r.n / max) * 100}%`, minHeight: r.n ? 2 : 0 }}
                title={`${r.k}:00 — ${r.n}`}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-1 flex gap-[3px]">
        {rows.map((r) => (
          <span key={r.k} className="flex-1 text-center text-[9px] tabular-nums text-slate-400">
            {r.k % 3 === 0 ? r.k : ''}
          </span>
        ))}
      </div>
      <p className="mt-3 border-t border-slate-100 pt-2 text-xs text-slate-500">
        {peakLabel(Number(peak?.k ?? 0), peak?.n ?? 0)}
        <span className="text-slate-300"> · n={total}</span>
      </p>
    </div>
  );
}
