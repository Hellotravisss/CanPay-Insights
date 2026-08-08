'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { countryName } from './countries';

// Orthographic globe, hand-rolled in SVG — no mapping library, no tiles, no
// external requests. Coastlines are a hand-digitised low-poly set: dense enough
// to recognise Hudson Bay, the Great Lakes and Vancouver Island, cheap enough
// to re-project sixty times a second in plain JS.

type City = { city: string; lat: number; lon: number; n: number };

// Each ring is [lon, lat] pairs, filled as a landmass.
const LAND: number[][][] = [
  // ---- North America: Alaska → BC coast → California → Gulf → east coast → Labrador → Arctic
  [
    [-168, 65.5], [-166, 68.5], [-162, 70.5], [-156, 71.4], [-148, 70.5], [-141, 70],
    [-133, 69.5], [-128, 70.2], [-124, 69.5], [-115, 68.8], [-110, 68.5], [-105, 68.8],
    [-100, 68.5], [-96, 68], [-94, 66], [-95, 64], [-92, 63], [-88, 63.5], [-86, 62],
    [-85, 60], [-87, 57.5], [-92, 57], [-94, 58.8], [-93, 61], [-90, 62], [-86, 61],
    [-82, 59], [-79, 57], [-78, 53], [-79, 51], [-82, 51.5], [-80, 53], [-78, 56],
    [-77, 58], [-74, 61], [-70, 62], [-66, 60], [-64, 58], [-62, 56], [-56, 53.5],
    [-55, 51], [-58, 51], [-60, 50], [-64, 49], [-66, 48], [-64, 46], [-61, 45.5],
    [-66, 44], [-67, 45], [-70, 43], [-71, 41.5], [-74, 40.5], [-76, 38], [-76, 35],
    [-79, 33.5], [-81, 31], [-80, 27], [-80, 25], [-82, 26], [-83, 29], [-85, 30],
    [-89, 29], [-93, 29.5], [-97, 28], [-97, 26], [-98, 22], [-95, 18.5], [-92, 18],
    [-90, 21], [-87, 21.5], [-88, 18], [-88, 16], [-84, 15], [-83, 12], [-79, 9],
    [-77, 8], [-79, 9.5], [-83, 10], [-86, 12], [-90, 14], [-93, 15.5], [-96, 16],
    [-101, 17], [-105, 20], [-106, 23], [-110, 24], [-112, 27], [-114, 28], [-113, 31],
    [-117, 32.5], [-120, 34], [-122, 37], [-124, 40], [-124, 43], [-124, 46.5],
    [-123, 48], [-125, 49.5], [-128, 52], [-130, 54], [-132, 54.5], [-135, 57],
    [-140, 59.5], [-146, 60.5], [-150, 59], [-153, 58], [-157, 56], [-161, 58],
    [-165, 60], [-166, 62], [-168, 65.5],
  ],
  // ---- Greenland
  [
    [-45, 60], [-43, 62], [-42, 65], [-38, 66], [-32, 68], [-25, 70.5], [-21, 72],
    [-20, 75], [-18, 77], [-22, 79], [-28, 81], [-38, 83], [-50, 83.5], [-60, 82.5],
    [-68, 80], [-72, 78], [-73, 76], [-68, 74], [-62, 70], [-55, 68], [-52, 65],
    [-50, 62], [-45, 60],
  ],
  // ---- Iceland
  [[-24, 65.5], [-22, 66.5], [-18, 66.5], [-14, 65.5], [-16, 64], [-20, 63.4], [-23, 64], [-24, 65.5]],
  // ---- South America
  [
    [-81, 6], [-78, 8], [-75, 11], [-71, 12], [-66, 10.5], [-62, 10.5], [-60, 8],
    [-56, 6], [-52, 5], [-50, 1], [-48, -1], [-44, -2.5], [-38, -5], [-35, -8],
    [-37, -12], [-39, -17], [-42, -22], [-48, -25], [-53, -33], [-57, -35], [-62, -39],
    [-63, -42], [-65, -45], [-68, -50], [-69, -53], [-68, -55], [-72, -54], [-75, -50],
    [-75, -45], [-74, -40], [-73, -35], [-72, -30], [-70, -23], [-70, -18], [-76, -14],
    [-79, -8], [-81, -5], [-80, -2], [-78, 1], [-77, 4], [-81, 6],
  ],
  // ---- Europe
  [
    [-9, 38.7], [-9, 41], [-9, 43.5], [-4, 43.5], [-1.5, 46], [-4, 48], [-1, 49.5],
    [2, 51], [4, 52], [6, 53.5], [8, 55], [10, 57.5], [8, 58], [6, 58], [5, 61],
    [8, 63], [12, 65], [16, 68.5], [21, 70.5], [26, 71], [30, 70], [32, 69.5],
    [33, 66], [30, 63], [26, 60], [22, 60], [21, 63], [17, 61], [19, 59], [24, 59.5],
    [28, 59.5], [30, 60], [28, 57], [24, 57], [21, 56], [19, 54.5], [15, 54.5],
    [12, 54], [10, 54.5], [13, 54], [16, 54.5], [19, 54.5], [21, 56], [24, 57],
    [28, 55], [32, 52], [36, 46.5], [34, 45], [31, 46.5], [30, 45.5], [28, 44],
    [28, 43], [25, 42], [23, 41.5], [20, 40], [19, 41], [18, 43], [15, 44.5],
    [13, 45.5], [12, 45.5], [13, 43], [15, 42], [17, 41], [18, 40], [16, 38],
    [15, 38], [16, 40], [14, 41], [12, 41.5], [10, 44], [8, 44], [4, 43.5],
    [3, 42], [0, 41], [-2, 39.5], [-5, 36.5], [-7, 37], [-9, 38.7],
  ],
  // ---- Britain, Ireland
  [[-5, 50], [-3, 51.5], [1, 51.5], [0, 53], [-1, 54], [-2, 56], [-5, 58.5], [-6, 57.5], [-5, 55.5], [-4, 54], [-5, 52], [-5, 50]],
  [[-10, 51.5], [-8, 52], [-6, 53], [-6, 55], [-8, 55.3], [-10, 54], [-10, 51.5]],
  // ---- Africa
  [
    [-17, 21], [-17, 15], [-16, 12], [-13, 9], [-8, 5], [-3, 5], [1, 6], [6, 4],
    [9, 4], [9, 2], [11, -3], [12, -6], [12, -12], [14, -17], [15, -22], [17, -28],
    [19, -34], [23, -34], [27, -33.5], [31, -30], [33, -26], [35, -23], [40, -16],
    [40, -10], [40, -6], [42, -2], [46, 3], [48, 5], [51, 10], [51, 12], [45, 11],
    [43, 12], [40, 15], [38, 18], [37, 21], [34, 28], [33, 31], [30, 31], [25, 32],
    [20, 31], [15, 32], [11, 34], [10, 37], [8, 37], [3, 36.5], [-1, 35.5],
    [-6, 35.5], [-10, 30], [-13, 27], [-17, 21],
  ],
  // ---- Madagascar
  [[43, -12], [50, -15], [50, -20], [47, -25], [45, -25], [43, -21], [43, -16], [43, -12]],
  // ---- Asia
  [
    [33, 66], [40, 68], [50, 69], [58, 70], [60, 72], [69, 73], [73, 71], [78, 73],
    [86, 74], [95, 76], [105, 78], [113, 76], [120, 74], [128, 73], [140, 73],
    [148, 70], [156, 71], [162, 70], [170, 69], [178, 68], [178, 65], [172, 62],
    [163, 59], [160, 55], [156, 51], [155, 48], [143, 46], [140, 46], [137, 50],
    [140, 53], [136, 55], [133, 52], [130, 46], [128, 42], [126, 38], [128, 35],
    [126, 34], [122, 37], [120, 40], [122, 41], [121, 39], [119, 37], [121, 33],
    [122, 30], [120, 26], [117, 24], [113, 22], [110, 21], [108, 16], [106, 10],
    [104, 8], [100, 8], [99, 12], [97, 16], [94, 18], [91, 22], [88, 21.5],
    [85, 20], [81, 16], [80, 13], [77, 8], [75, 12], [73, 16], [72, 21], [70, 23],
    [67, 24], [61, 25], [57, 25], [56, 26.5], [50, 28.5], [48, 30], [43, 29],
    [40, 24], [39, 21], [43, 13], [45, 13], [43, 15], [42, 18], [40, 22],
    [35, 28], [34, 31], [35, 33], [36, 36], [30, 40.5], [27, 41], [30, 41],
    [36, 41.5], [40, 43], [45, 40], [49, 41], [51, 44], [47, 46], [48, 50],
    [55, 51], [61, 54], [68, 55], [73, 54], [77, 53], [83, 51], [88, 49],
    [95, 50], [103, 51], [108, 50], [116, 49], [120, 53], [127, 50], [130, 48],
    [133, 46], [130, 44], [126, 41], [119, 40], [113, 38], [107, 39], [100, 39],
    [95, 40], [88, 45], [83, 45], [75, 43], [70, 42], [65, 41], [60, 42],
    [55, 41], [52, 41], [50, 44], [47, 46], [42, 47], [38, 48], [35, 47],
    [32, 47], [30, 50], [28, 52], [30, 55], [33, 58], [36, 60], [33, 63], [33, 66],
  ],
  // ---- Japan
  [[130, 31], [132, 34], [136, 34], [138, 35], [141, 38], [141, 41], [144, 43], [145, 44], [141, 45], [140, 42], [139, 39], [136, 37], [133, 35], [131, 33], [130, 31]],
  // ---- Maritime Southeast Asia (rough)
  [[95, 5], [104, 2], [106, -3], [112, -8], [118, -9], [124, -9], [131, -8], [141, -9], [147, -8], [150, -10], [144, -5], [138, -2], [132, -1], [127, 1], [119, 5], [117, 7], [110, 2], [104, 2], [98, 2], [95, 5]],
  // ---- Australia
  [
    [113, -22], [113, -26], [115, -30], [116, -35], [120, -34], [126, -32], [131, -32],
    [135, -35], [138, -35], [140, -38], [146, -39], [150, -37], [153, -32], [153, -28],
    [152, -25], [149, -21], [146, -19], [143, -14], [142, -11], [137, -12], [133, -12],
    [130, -12], [127, -14], [124, -16], [121, -19], [117, -21], [113, -22],
  ],
  // ---- New Zealand
  [[173, -35], [176, -37], [178, -38], [177, -40], [174, -41], [172, -43], [170, -45], [167, -46], [166, -45], [170, -43], [172, -41], [173, -35]],
];

// Inland water, drawn over the land fill.
const LAKES: number[][][] = [
  // Great Lakes (simplified single basin)
  [[-92, 47], [-87, 49], [-84, 47], [-82, 45], [-83, 43], [-79, 43], [-77, 44], [-80, 45.5], [-84, 46], [-87, 45], [-88, 43], [-87, 42], [-85, 42], [-85, 45], [-88, 46.5], [-90, 46.5], [-92, 47]],
  // Great Bear, Great Slave
  [[-125, 66], [-119, 67], [-118, 65], [-123, 65], [-125, 66]],
  [[-117, 62], [-109, 62.5], [-109, 61], [-116, 61], [-117, 62]],
  // Caspian Sea
  [[47, 45], [52, 45], [54, 41], [53, 38], [50, 37], [48, 39], [47, 42], [47, 45]],
];

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

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => setLon0((l) => (l + 0.22) % 360), 50);
    return () => clearInterval(id);
  }, [spinning]);

  const R = 148;
  const CX = 170;
  const CY = 170;

  // Orthographic projection. Returns the screen point plus whether the point is
  // on the near side; far-side points are CLAMPED to the limb rather than
  // dropped, so a coastline that wraps around the edge stays glued to the rim
  // instead of being closed off with a straight line across the sphere.
  const project = useMemo(() => {
    const p0 = (lat0 * Math.PI) / 180;
    const l0 = (lon0 * Math.PI) / 180;
    return (lat: number, lon: number): { x: number; y: number; visible: boolean } => {
      const p = (lat * Math.PI) / 180;
      const l = (lon * Math.PI) / 180;
      const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
      let x = R * Math.cos(p) * Math.sin(l - l0);
      let y = -R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0));
      if (cosc < 0) {
        const d = Math.hypot(x, y) || 1;
        x = (x / d) * R;
        y = (y / d) * R;
      }
      return { x: CX + x, y: CY + y, visible: cosc >= 0 };
    };
  }, [lon0, lat0]);

  // Visible-only helper for point markers.
  const projectVisible = (lat: number, lon: number): [number, number] | null => {
    const q = project(lat, lon);
    return q.visible ? [q.x, q.y] : null;
  };

  // A ring becomes ONE polygon of clamped points. Rings with nothing on the
  // near side are skipped entirely (otherwise their limb-clamped outline would
  // smear a meaningless arc across the edge).
  const ringPoints = (ring: number[][]): string | null => {
    let anyVisible = false;
    const pts = ring.map(([lon, lat]) => {
      const q = project(lat, lon);
      if (q.visible) anyVisible = true;
      return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
    });
    return anyVisible ? pts.join(' ') : null;
  };

  const maxCity = Math.max(1, ...cities.map((c) => c.n));

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
            {Array.from({ length: 11 }, (_, i) => (i - 5) * 15).map((lat) => {
              const pts: string[] = [];
              for (let lon = -180; lon <= 180; lon += 3) {
                const p = projectVisible(lat, lon);
                if (p) pts.push(p.join(','));
              }
              return (
                <polyline
                  key={`p${lat}`}
                  points={pts.join(' ')}
                  fill="none"
                  stroke="#1e4468"
                  strokeWidth={lat === 0 ? 0.9 : 0.4}
                />
              );
            })}
            {Array.from({ length: 24 }, (_, i) => i * 15 - 180).map((lon) => {
              const pts: string[] = [];
              for (let lat = -90; lat <= 90; lat += 3) {
                const p = projectVisible(lat, lon);
                if (p) pts.push(p.join(','));
              }
              return <polyline key={`m${lon}`} points={pts.join(' ')} fill="none" stroke="#1e4468" strokeWidth="0.4" />;
            })}

            {LAND.map((ring, i) => {
              const pts = ringPoints(ring);
              return pts ? (
                <polygon
                  key={`l${i}`}
                  points={pts}
                  fill="#1f3d2e"
                  stroke="#4d8f6a"
                  strokeWidth="0.7"
                  strokeLinejoin="round"
                />
              ) : null;
            })}

            {LAKES.map((ring, i) => {
              const pts = ringPoints(ring);
              return pts ? (
                <polygon key={`w${i}`} points={pts} fill="#12314f" stroke="#2b628f" strokeWidth="0.4" />
              ) : null;
            })}

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
                {c.n >= maxCity * 0.5 && (
                  <text
                    x={p[0] + r + 3}
                    y={p[1] + 3}
                    className="fill-white text-[9px] font-semibold"
                    style={{ paintOrder: 'stroke', stroke: '#0b1220', strokeWidth: 2.5 }}
                  >
                    {c.city}
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
