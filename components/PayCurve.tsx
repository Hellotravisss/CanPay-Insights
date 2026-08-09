'use client';
import { useMemo } from 'react';
import { useT } from '../lib/i18n';
import type { CalculationRecord } from '../hooks/useCalculationHistory';

// Your own pay history, drawn from calculations you saved.
//
// This is the payoff that makes saving worth an account: a promise that only
// pays out later. One saved calculation is a note to self; five saved over
// three years is a record of your working life that nobody else keeps — your
// employer doesn't hand it to you, and old pay stubs get thrown out.

type Point = { date: Date; gross: number; net: number; province: string; label: string };

export default function PayCurve({ records }: { records: CalculationRecord[] }) {
  const { t } = useT();

  const points = useMemo<Point[]>(() => {
    return records
      .map((r) => ({
        date: new Date(r.createdAt),
        gross: r.results?.grossPayAnnual ?? 0,
        net: r.results?.netPayAnnual ?? 0,
        province: r.province,
        label: r.name,
      }))
      .filter((p) => p.gross > 0 && !Number.isNaN(+p.date))
      .sort((a, b) => +a.date - +b.date);
  }, [records]);

  if (points.length === 0) return null;

  const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;
  const first = points[0];
  const last = points[points.length - 1];
  const spanDays = (+last.date - +first.date) / 86_400_000;
  const changePct = first.gross > 0 ? ((last.gross - first.gross) / first.gross) * 100 : 0;

  // A single saved calculation can't be a curve yet — show the promise instead
  // of a misleading one-point chart.
  if (points.length < 2) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
        <h3 className="text-sm font-bold text-slate-800">{t('curve.title')}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">{t('curve.firstSaved')}</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold tabular-nums text-slate-900">{money(first.gross)}</span>
          <span className="text-xs text-slate-400">
            {first.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    );
  }

  const W = 640;
  const H = 190;
  const PAD_L = 8;
  const PAD_R = 8;
  const PAD_T = 24;
  const PAD_B = 26;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const minV = Math.min(...points.map((p) => p.gross));
  const maxV = Math.max(...points.map((p) => p.gross));
  const lo = minV - (maxV - minV) * 0.25 - 1;
  const hi = maxV + (maxV - minV) * 0.25 + 1;
  const t0 = +first.date;
  const t1 = +last.date;
  const spanMs = Math.max(1, t1 - t0);

  const xy = points.map((p) => ({
    ...p,
    x: PAD_L + ((+p.date - t0) / spanMs) * innerW,
    y: PAD_T + innerH - ((p.gross - lo) / (hi - lo)) * innerH,
  }));

  const line = xy.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${PAD_L},${PAD_T + innerH} ${line} ${(PAD_L + innerW).toFixed(1)},${PAD_T + innerH}`;
  const up = changePct >= 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800">{t('curve.title')}</h3>
        <span className="text-xs text-slate-400">
          {points.length} {t('curve.savedCount')}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <div>
          <span className={`text-2xl font-bold tabular-nums ${up ? 'text-emerald-600' : 'text-slate-900'}`}>
            {up ? '+' : ''}
            {changePct.toFixed(1)}%
          </span>
          <span className="ml-2 text-xs text-slate-500">
            {t('curve.since')}{' '}
            {first.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          {money(first.gross)} → <strong className="text-slate-800">{money(last.gross)}</strong>
          {spanDays >= 60 && (
            <span className="text-slate-400">
              {' '}
              · {Math.round(spanDays / 30)} {t('curve.months')}
            </span>
          )}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="payFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dc2626" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </linearGradient>
        </defs>

        <polygon points={area} fill="url(#payFill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#dc2626"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {xy.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#fff" stroke="#dc2626" strokeWidth="2.5" />
            {(i === 0 || i === xy.length - 1) && (
              <text
                x={Math.min(Math.max(p.x, 30), W - 30)}
                y={p.y - 12}
                textAnchor="middle"
                className="fill-slate-700 text-[11px] font-bold"
              >
                {money(p.gross)}
              </text>
            )}
          </g>
        ))}

        {[first, last].map((p, i) => (
          <text
            key={`d${i}`}
            x={i === 0 ? PAD_L : PAD_L + innerW}
            y={H - 8}
            textAnchor={i === 0 ? 'start' : 'end'}
            className="fill-slate-400 text-[10px]"
          >
            {p.date.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
          </text>
        ))}
      </svg>

      <p className="mt-2 text-[11px] leading-4 text-slate-400">{t('curve.note')}</p>
    </div>
  );
}
