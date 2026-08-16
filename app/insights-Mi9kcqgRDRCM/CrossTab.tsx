'use client';
import { useState } from 'react';
import { PROVINCIAL_WAGES, WAGE_DATA_YEAR } from '../../lib/provincialWages';

/**
 * Income bracket crossed with province (or industry), plus a calibration mark
 * against Statistics Canada.
 *
 * Two things this panel exists to do that no single-dimension chart can:
 *
 * 1. CROSSING. A list of provinces and a list of brackets are both free to
 *    obtain. Which brackets a given province actually checks is the part that
 *    is worth something, and it is the first question a buyer asks.
 *
 * 2. CALIBRATION. This sample is people who went looking for a pay calculator,
 *    which is not the same population as "Canadians". Rather than hope nobody
 *    notices, each row carries a caret at the bracket containing that
 *    province's StatCan median full-time wage, so the skew is measured on the
 *    page. A dataset that states its own bias is far more usable than one that
 *    pretends to have none — and it is the first thing an editor will ask.
 *
 * Rows under MIN_ROW are suppressed rather than drawn faint: a distribution
 * over seven events is not a weak signal, it is noise, and Statistics Canada
 * suppresses its own low-count cells for the same reason.
 */

type Row = { k: string; total: number; med: number; cells: Record<string, number> };
export type CrossTabData = {
  levels: { lvl: number; label: string }[];
  by_province: Row[];
  by_industry: Row[];
  total: number;
};

const MIN_ROW = 30; // below this a row is counted but its shape is not shown
const FULL_TIME_HOURS = 2080;

// Province names as stored by the calculator -> StatCan's two-letter keys.
const PROV_KEY: Record<string, string> = {
  Ontario: 'ON', Quebec: 'QC', 'British Columbia': 'BC', Alberta: 'AB',
  Manitoba: 'MB', Saskatchewan: 'SK', 'Nova Scotia': 'NS', 'New Brunswick': 'NB',
  'Prince Edward Island': 'PE', 'Newfoundland and Labrador': 'NL',
};

/** Which bracket level an annual salary falls in — must mirror bracketIncome(). */
function levelOfAnnual(annual: number): number {
  if (annual < 30_000) return 1;
  if (annual < 50_000) return 2;
  if (annual < 70_000) return 3;
  if (annual < 90_000) return 4;
  if (annual < 120_000) return 5;
  if (annual < 160_000) return 6;
  return 7;
}

function statcanLevel(province: string): number | null {
  const key = PROV_KEY[province];
  const hourly = key ? PROVINCIAL_WAGES['all-industries']?.[key] : undefined;
  return hourly ? levelOfAnnual(hourly * FULL_TIME_HOURS) : null;
}

export default function CrossTab({ data }: { data: CrossTabData | null }) {
  const [axis, setAxis] = useState<'province' | 'industry'>('province');
  if (!data) return <p className="text-sm text-slate-400">No calculations recorded yet.</p>;

  const rows = axis === 'province' ? data.by_province : data.by_industry;
  const shown = rows.filter((r) => r.total >= MIN_ROW);
  const held = rows.filter((r) => r.total < MIN_ROW);
  const labelOf = (lvl: number) => data.levels.find((l) => l.lvl === lvl)?.label ?? String(lvl);

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {(['province', 'industry'] as const).map((a) => (
          <button
            key={a}
            onClick={() => setAxis(a)}
            className={`rounded-lg px-3 py-1 text-xs font-semibold capitalize transition-colors ${
              axis === a ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            by {a}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-separate border-spacing-0 text-xs">
          <thead>
            <tr>
              <th className="pb-2 pr-3 text-left font-semibold uppercase tracking-wider text-slate-400">
                {axis}
              </th>
              {data.levels.map((l) => (
                <th key={l.lvl} className="pb-2 text-center font-medium text-slate-400">
                  {l.label.replace('Under ', '<').replace('$', '')}
                </th>
              ))}
              <th className="pb-2 pl-3 text-right font-semibold uppercase tracking-wider text-slate-400">n</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => {
              const sc = axis === 'province' ? statcanLevel(r.k) : null;
              return (
                <tr key={r.k}>
                  <td className="border-t border-slate-100 py-1.5 pr-3 font-medium text-slate-700">{r.k}</td>
                  {data.levels.map((l) => {
                    const c = r.cells[String(l.lvl)] ?? 0;
                    const share = c / r.total;
                    const isMed = Math.round(r.med) === l.lvl;
                    return (
                      <td key={l.lvl} className="border-t border-slate-100 px-0.5 py-1.5">
                        <div
                          className="relative flex h-8 items-center justify-center rounded"
                          style={{ backgroundColor: `rgba(220, 38, 38, ${(share * 2.2).toFixed(3)})` }}
                          title={`${r.k} · ${labelOf(l.lvl)} · ${c} of ${r.total} (${(share * 100).toFixed(0)}%)`}
                        >
                          <span className={`tabular-nums ${share > 0.28 ? 'font-semibold text-white' : 'text-slate-600'}`}>
                            {c || ''}
                          </span>
                          {isMed && (
                            <span className="absolute -bottom-0.5 h-0.5 w-4 rounded bg-slate-900" title="our median" />
                          )}
                          {sc === l.lvl && (
                            <span className="absolute -top-1 text-[10px] leading-none text-sky-600" title={`StatCan ${WAGE_DATA_YEAR} median full-time wage falls here`}>
                              ▼
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="border-t border-slate-100 py-1.5 pl-3 text-right font-semibold tabular-nums text-slate-900">
                    {r.total}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {held.length > 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Held back until they reach {MIN_ROW}:{' '}
          {held.map((r, i) => (
            <span key={r.k}>
              {i > 0 && ', '}
              <span className="text-slate-500">{r.k}</span>{' '}
              <span className="tabular-nums">({r.total})</span>
            </span>
          ))}
          . Counted in every total, but a shape drawn from a handful of visits would be noise.
        </p>
      )}

      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        Each row is one {axis}, split across the seven income brackets; darker means a larger share
        of that row. The <span className="font-semibold text-slate-600">▬</span> under a cell is our
        median bracket.{' '}
        {axis === 'province' && (
          <>
            The <span className="text-sky-600">▼</span> marks where Statistics Canada&apos;s{' '}
            {WAGE_DATA_YEAR} median full-time wage for that province lands (Table 14-10-0064-01,
            hourly × {FULL_TIME_HOURS.toLocaleString()}h). Where the two disagree, this sample skews
            — people who go looking for a pay calculator are not a random sample of Canadians, and
            that gap is the honest measure of it.
          </>
        )}
      </p>
    </div>
  );
}
