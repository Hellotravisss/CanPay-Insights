'use client';

/**
 * Income-bracket strip per declared industry — where each industry's users
 * actually sit across the seven brackets, not just how many declared.
 *
 * Rendering choice: a heat strip rather than stacked bars. With n this small
 * a stacked bar implies proportions it cannot support; a strip of filled
 * cells reads as "these brackets were seen", which is exactly the strength
 * of the evidence. Each row carries its own n so the reader weighs it.
 */
const ORDER = ['under-30k', '30-50k', '50-70k', '70-90k', '90-120k', '120-160k', '160k-plus'];
const SHORT = ['<30k', '30–50', '50–70', '70–90', '90–120', '120–160', '160k+'];

export type IndustryIncomeRow = {
  industry: string;
  n: number;
  brackets: Record<string, number>;
};

export default function IndustryIncome({
  rows,
  zh,
  label,
}: {
  rows: IndustryIncomeRow[];
  zh: boolean;
  label: (industry: string) => string;
}) {
  if (!rows?.length) return <p className="text-sm text-slate-400">{zh ? '还没有数据。' : 'No data yet.'}</p>;

  return (
    <div>
      {/* Bracket axis, shared by every row */}
      <div className="mb-1.5 grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3">
        <span />
        <div className="grid grid-cols-7 gap-[3px]">
          {SHORT.map((s) => (
            <span key={s} className="text-center text-[9px] tabular-nums text-slate-400">
              {s}
            </span>
          ))}
        </div>
        <span className="text-right text-[9px] text-slate-400">n</span>
      </div>

      <div className="space-y-1.5">
        {rows.map((r) => {
          const max = Math.max(1, ...ORDER.map((b) => r.brackets[b] ?? 0));
          return (
            <div key={r.industry} className="grid grid-cols-[8.5rem_1fr_2.5rem] items-center gap-3">
              <span className="truncate text-sm text-slate-600">{label(r.industry)}</span>
              <div className="grid grid-cols-7 gap-[3px]">
                {ORDER.map((b) => {
                  const c = r.brackets[b] ?? 0;
                  return (
                    <div
                      key={b}
                      title={`${label(r.industry)} · ${SHORT[ORDER.indexOf(b)]} · ${c}`}
                      className="h-5 rounded"
                      style={{
                        background: c
                          ? `rgba(220, 38, 38, ${0.25 + 0.75 * (c / max)})`
                          : 'rgb(241 245 249)', // slate-100
                      }}
                    >
                      {c > 0 && (
                        <span className="flex h-full items-center justify-center text-[9px] font-semibold text-white">
                          {c}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <span className="text-right text-xs tabular-nums text-slate-500">{r.n}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] leading-4 text-slate-400">
        {zh
          ? '每格 = 该行业用户落在该收入档的次数;颜色越深,该档在这个行业里越集中。样本还小,读行不读格 —— 每行右侧的 n 是这一行全部的证据量。'
          : 'Each cell = calculations from that industry landing in that bracket; darker means more concentrated within the industry. The sample is small — read rows, not cells, and weigh each row by its n.'}
      </p>
    </div>
  );
}
