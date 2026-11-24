import React from 'react';

// Where the money goes, at a glance: take-home versus each deduction.
// Server-rendered SVG arc paths — no chart library, no client JS, so it shows
// up in the HTML for crawlers and AI engines too.

type Slice = { label: string; value: number; color: string };

const CX = 100;
const CY = 100;
const R_OUT = 88;
const R_IN = 58;

function arc(startFrac: number, endFrac: number) {
  const a0 = startFrac * 2 * Math.PI - Math.PI / 2;
  const a1 = endFrac * 2 * Math.PI - Math.PI / 2;
  const large = endFrac - startFrac > 0.5 ? 1 : 0;
  const p = (r: number, a: number) =>
    `${(CX + r * Math.cos(a)).toFixed(2)},${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(R_OUT, a0)} A ${R_OUT} ${R_OUT} 0 ${large} 1 ${p(R_OUT, a1)} L ${p(R_IN, a1)} A ${R_IN} ${R_IN} 0 ${large} 0 ${p(R_IN, a0)} Z`;
}

export default function PayDonut({
  gross,
  netAnnual,
  federalTax,
  provincialTax,
  pension,
  ei,
  provinceLabel,
}: {
  gross: number;
  netAnnual: number;
  federalTax: number;
  provincialTax: number;
  pension: number;
  ei: number;
  provinceLabel: string;
}) {
  const slices: Slice[] = [
    { label: 'Take-home pay', value: netAnnual, color: '#C8161A' },
    { label: 'Federal tax', value: federalTax, color: '#2B2E36' },
    { label: `${provinceLabel} tax`, value: provincialTax, color: '#535866' },
    { label: 'CPP / QPP', value: pension, color: '#7C818D' },
    { label: 'EI', value: ei, color: '#A2A6B0' },
  ].filter((s) => s.value > 0);

  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const money = (n: number) => `$${Math.round(n).toLocaleString('en-CA')}`;
  const keptPct = Math.round((netAnnual / gross) * 100);

  let acc = 0;
  const drawn = slices.map((s) => {
    const start = acc / total;
    acc += s.value;
    return { ...s, d: arc(start, acc / total), pct: Math.round((s.value / total) * 100) };
  });

  return (
    <div className="pc flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <svg viewBox="0 0 200 200" className="h-[190px] w-[190px] shrink-0" role="img"
        aria-label={`Of ${money(gross)} gross, ${money(netAnnual)} is take-home pay`}>
        {/* revealed once by a ring that sweeps clockwise from 12 o'clock (globals.css .pm-sweep); without JS or
            with reduced motion the mask is simply full */}
        <defs>
          <mask id="paydonut-sweep" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200">
            <circle className="pm-sweep" cx={CX} cy={CY} r={(R_OUT + R_IN) / 2} fill="none" stroke="#fff"
              strokeWidth={R_OUT - R_IN + 6} pathLength={1} strokeDasharray="1" transform={`rotate(-90 ${CX} ${CY})`} />
          </mask>
        </defs>
        <g mask="url(#paydonut-sweep)">
          {drawn.map((s) => (
            <path key={s.label} d={s.d} fill={s.color} stroke="#fff" strokeWidth="2" />
          ))}
        </g>
        <text x={CX} y={CY - 4} textAnchor="middle" className="pm-fade fill-red-600 font-display text-[26px] font-semibold">
          {keptPct}%
        </text>
        <text x={CX} y={CY + 15} textAnchor="middle" className="pm-fade fill-mute text-[10px]">
          you keep
        </text>
      </svg>

      <ul className="w-full divide-y divide-line">
        {drawn.map((s, i) => (
          <li key={s.label} className="pm-fade flex items-center gap-3 py-2 text-sm" style={{ ['--i' as string]: 4 + i * 2 }}>
            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: s.color }} />
            <span className="text-ink-2">{s.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink">{money(s.value)}</span>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-mute">{s.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
