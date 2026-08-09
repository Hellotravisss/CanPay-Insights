'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { countryName } from './countries';
import { LAND } from './landData';

// Orthographic globe, hand-rolled in SVG — no mapping library, no tiles, no
// external requests. Coastlines are a hand-digitised low-poly set: dense enough
// to recognise Hudson Bay, the Great Lakes and Vancouver Island, cheap enough
// to re-project sixty times a second in plain JS.

type City = { city: string; lat: number; lon: number; n: number };



// Deterministic star field — no Math.random, so server and client markup agree.
const STARS = Array.from({ length: 90 }, (_, i) => {
  const a = (i * 2.399963) % (Math.PI * 2);
  const r = 0.62 + ((i * 37) % 100) / 240;
  return {
    x: 170 + Math.cos(a) * 170 * r,
    y: 170 + Math.sin(a) * 170 * r,
    r: 0.4 + ((i * 13) % 7) / 10,
    o: 0.2 + ((i * 29) % 50) / 120,
  };
});

export default function Globe({
  cities,
  countries,
}: {
  cities: City[];
  countries: { k: string | number; n: number }[];
}) {
  const [lon0, setLon0] = useState(-96);
  const [lat0, setLat0] = useState(28);
  const [spinning, setSpinning] = useState(true);
  const drag = useRef<{ x: number; y: number; lon: number; lat: number } | null>(null);
  const [hoverCity, setHoverCity] = useState<string | null>(null);

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => setLon0((l) => (l + 0.22) % 360), 50);
    return () => clearInterval(id);
  }, [spinning]);

  const R = 148;
  const CX = 170;
  const CY = 170;

  // Orthographic projection: screen point plus whether it is on the near side.
  const project = useMemo(() => {
    const p0 = (lat0 * Math.PI) / 180;
    const l0 = (lon0 * Math.PI) / 180;
    return (lat: number, lon: number): { x: number; y: number; visible: boolean } => {
      const p = (lat * Math.PI) / 180;
      const l = (lon * Math.PI) / 180;
      const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
      const x = R * Math.cos(p) * Math.sin(l - l0);
      const y = -R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0));
      return { x: CX + x, y: CY + y, visible: cosc >= 0 };
    };
  }, [lon0, lat0]);

  // Visible-only helper for point markers.
  const projectVisible = (lat: number, lon: number): [number, number] | null => {
    const q = project(lat, lon);
    return q.visible ? [q.x, q.y] : null;
  };

  // Coastlines are drawn as OPEN polylines: stroke only, never closed, never
  // filled. This is the approach VisaScout's globe uses, and it removes the
  // whole class of bug outright — a line across the sphere can only appear when
  // a shape is closed or filled, so two earlier fixes here (chords between
  // disjoint arcs, then a rim-hugging fill that flooded the globe) were both
  // fighting a problem that simply does not exist without a fill.
  const visibleArcs = (coords: Array<[number, number]>): string[] => {
    const arcs: string[][] = [[]];
    for (const [lat, lon] of coords) {
      const q = project(lat, lon);
      if (q.visible) arcs[arcs.length - 1].push(`${q.x.toFixed(1)},${q.y.toFixed(1)}`);
      else if (arcs[arcs.length - 1].length) arcs.push([]);
    }
    return arcs.filter((a) => a.length > 1).map((a) => a.join(' '));
  };

  const ringArcs = (ring: number[][]): string[] =>
    visibleArcs(ring.map(([lon, lat]) => [lat, lon] as [number, number]));

  const maxCity = Math.max(1, ...cities.map((c) => c.n));
  // Which cities get a name on the globe. The old rule — at least half the
  // busiest city's volume — meant only ever the single top city qualified once
  // one place pulled ahead, which reads as "the map only knows Toronto".
  // A fixed top three always labels something meaningful, and hovering any dot
  // names it, so nothing is hidden, just unlabelled by default.
  const labelled = new Set(
    [...cities].sort((a, b) => b.n - a.n).slice(0, 3).map((c) => c.city)
  );

  const onDown = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, lon: lon0, lat: lat0 };
    setSpinning(false);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    // Drag moves the globe's SURFACE with the pointer: dragging right spins the
    // Earth eastward under your finger, which means decreasing the centre
    // longitude. Same logic vertically.
    setLon0(drag.current.lon - dx * 0.4);
    setLat0(Math.max(-80, Math.min(80, drag.current.lat + dy * 0.4)));
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8">
      <div className="shrink-0">
        <svg
          viewBox="0 0 340 340"
          className="h-[340px] w-[340px] cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={onUp}
        >
          <defs>
            <radialGradient id="ocean" cx="34%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="55%" stopColor="#122a45" />
              <stop offset="100%" stopColor="#050b16" />
            </radialGradient>
            <radialGradient id="atmo" cx="50%" cy="50%">
              <stop offset="84%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="shade" cx="32%" cy="26%" r="80%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
              <stop offset="58%" stopColor="#000000" stopOpacity="0" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
            </radialGradient>
            <clipPath id="sphere">
              <circle cx={CX} cy={CY} r={R} />
            </clipPath>
          </defs>

          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#e2e8f0" opacity={s.o} />
          ))}

          <circle cx={CX} cy={CY} r={R + 10} fill="url(#atmo)" />
          <circle cx={CX} cy={CY} r={R} fill="url(#ocean)" />

          <g clipPath="url(#sphere)">
            {/* graticule every 15° */}
            {Array.from({ length: 11 }, (_, i) => (i - 5) * 15).flatMap((lat) => {
              const coords: Array<[number, number]> = [];
              for (let lon = -180; lon <= 180; lon += 3) coords.push([lat, lon]);
              return visibleArcs(coords).map((pts, j) => (
                <polyline
                  key={`p${lat}-${j}`}
                  points={pts}
                  fill="none"
                  stroke="#1e4468"
                  strokeWidth={lat === 0 ? 0.9 : 0.4}
                />
              ));
            })}
            {Array.from({ length: 24 }, (_, i) => i * 15 - 180).flatMap((lon) => {
              const coords: Array<[number, number]> = [];
              for (let lat = -90; lat <= 90; lat += 3) coords.push([lat, lon]);
              return visibleArcs(coords).map((pts, j) => (
                <polyline key={`m${lon}-${j}`} points={pts} fill="none" stroke="#1e4468" strokeWidth="0.4" />
              ));
            })}

            {LAND.flatMap((ring, i) =>
              ringArcs(ring).map((pts, j) => (
                <polyline
                  key={`l${i}-${j}`}
                  points={pts}
                  fill="none"
                  stroke="#7dd3fc"
                  strokeOpacity="0.75"
                  strokeWidth="0.6"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))
            )}


            {/* lighting last so land is lit consistently */}
            <circle cx={CX} cy={CY} r={R} fill="url(#shade)" />
          </g>

          {cities.map((c) => {
            const p = projectVisible(c.lat, c.lon);
            if (!p) return null;
            const r = 2.5 + (c.n / maxCity) * 5;
            return (
              <g key={c.city}>
                <circle cx={p[0]} cy={p[1]} r={r} fill="#f87171" opacity="0.35">
                  <animate attributeName="r" values={`${r};${r * 3};${r}`} dur="2.6s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.4;0;0.4" dur="2.6s" repeatCount="indefinite" />
                </circle>
                <circle cx={p[0]} cy={p[1]} r={r} fill="#ef4444" stroke="#ffffff" strokeWidth="0.9" />
                {/* generous invisible hit area — the dots are only a few px */}
                <circle
                  cx={p[0]}
                  cy={p[1]}
                  r={Math.max(r + 6, 9)}
                  fill="transparent"
                  onMouseEnter={() => setHoverCity(c.city)}
                  onMouseLeave={() => setHoverCity((v) => (v === c.city ? null : v))}
                />
                {(labelled.has(c.city) || hoverCity === c.city) && (
                  <text
                    x={p[0] + r + 3}
                    y={p[1] + 3}
                    className="fill-white text-[9px] font-semibold"
                    style={{ paintOrder: 'stroke', stroke: '#0b1220', strokeWidth: 2.5 }}
                  >
                    {c.city} · {c.n}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        <p className="mt-1 text-center text-[10px] text-slate-400">
          {spinning ? (
            'Drag to spin the globe'
          ) : (
            <button onClick={() => setSpinning(true)} className="underline hover:text-slate-600">
              Resume rotation
            </button>
          )}
        </p>
      </div>

      <div className="w-full">
        <h3 className="mb-3 text-sm font-bold text-slate-700">Where the calculations come from</h3>
        <ul className="mb-5 space-y-1.5">
          {cities.slice(0, 8).map((c) => (
            <li key={c.city} className="flex items-baseline justify-between border-b border-slate-100 pb-1.5 text-sm">
              <span className="text-slate-600">{c.city}</span>
              <span className="tabular-nums font-semibold text-slate-800">{c.n}</span>
            </li>
          ))}
        </ul>
        <h3 className="mb-2 text-sm font-bold text-slate-700">By country</h3>
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <span key={String(c.k)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {countryName(String(c.k))} · {c.n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
