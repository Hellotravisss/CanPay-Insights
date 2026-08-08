'use client';
import { useEffect, useMemo, useState } from 'react';

// Orthographic globe, hand-rolled in SVG — no mapping library, no tiles, no
// external requests. Coastlines are a coarse polyline set (enough to read
// "that's North America"), and city dots come from the telemetry centroids.

type City = { city: string; lat: number; lon: number; n: number };

// Coarse continental outlines [lon, lat] — deliberately low-fidelity.
const LAND: number[][][] = [
  // North America
  [[-168,65],[-160,71],[-140,70],[-128,70],[-115,69],[-95,72],[-85,70],[-80,64],[-78,57],[-64,60],[-56,52],[-53,47],[-60,45],[-66,44],[-70,41],[-75,35],[-81,31],[-80,25],[-84,30],[-90,29],[-97,26],[-97,21],[-95,16],[-87,16],[-83,9],[-78,8],[-82,15],[-88,21],[-95,29],[-105,32],[-117,32],[-124,40],[-124,48],[-133,55],[-146,60],[-155,58],[-165,55],[-168,65]],
  // South America
  [[-81,7],[-76,1],[-80,-4],[-75,-14],[-70,-18],[-71,-30],[-73,-42],[-75,-52],[-68,-55],[-64,-51],[-62,-40],[-57,-35],[-53,-33],[-48,-25],[-40,-20],[-35,-8],[-44,-2],[-50,0],[-60,6],[-70,11],[-77,8],[-81,7]],
  // Europe + Africa
  [[-10,36],[-6,43],[-9,44],[-2,48],[2,51],[8,54],[10,58],[18,60],[25,65],[30,70],[40,68],[35,60],[30,55],[38,48],[40,44],[36,42],[28,41],[24,38],[20,40],[14,38],[12,45],[3,43],[-6,36],[-16,28],[-17,21],[-16,14],[-13,9],[-8,5],[0,6],[6,4],[9,4],[13,-5],[12,-15],[15,-22],[18,-28],[20,-34],[27,-34],[32,-28],[35,-22],[40,-16],[41,-10],[40,-3],[43,2],[51,12],[45,12],[40,15],[37,22],[34,28],[32,31],[25,32],[18,31],[10,34],[0,36],[-10,36]],
  // Asia
  [[30,70],[60,72],[75,73],[90,76],[105,78],[120,74],[140,73],[160,70],[170,66],[178,65],[170,60],[160,58],[155,50],[142,46],[135,43],[130,38],[122,40],[120,35],[122,30],[118,24],[110,20],[105,10],[100,6],[95,16],[90,22],[80,15],[77,8],[72,20],[68,24],[62,25],[57,22],[50,28],[45,38],[50,45],[55,52],[62,55],[70,60],[75,65],[65,68],[55,68],[45,68],[35,68],[30,70]],
  // Australia
  [[113,-22],[114,-30],[118,-35],[128,-32],[138,-35],[146,-39],[150,-37],[153,-28],[148,-20],[142,-11],[135,-12],[130,-11],[125,-14],[118,-20],[113,-22]],
];

export default function Globe({
  cities,
  countries,
}: {
  cities: City[];
  countries: { k: string | number; n: number }[];
}) {
  // Slow auto-rotation, starting centred on Canada.
  const [lon0, setLon0] = useState(-96);
  useEffect(() => {
    const id = setInterval(() => setLon0((l) => (l + 0.35) % 360), 60);
    return () => clearInterval(id);
  }, []);

  const R = 150;
  const CX = 170;
  const CY = 170;
  const lat0 = 25; // slight northern tilt, where the users are

  // Orthographic projection; returns null when the point is on the far side.
  const project = useMemo(() => {
    const p0 = (lat0 * Math.PI) / 180;
    const l0 = (lon0 * Math.PI) / 180;
    return (lat: number, lon: number): [number, number] | null => {
      const p = (lat * Math.PI) / 180;
      const l = (lon * Math.PI) / 180;
      const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
      if (cosc < 0) return null;
      return [
        CX + R * Math.cos(p) * Math.sin(l - l0),
        CY - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0)),
      ];
    };
  }, [lon0]);

  const maxCity = Math.max(1, ...cities.map((c) => c.n));

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8">
      <svg viewBox="0 0 340 340" className="h-[340px] w-[340px] shrink-0">
        <defs>
          <radialGradient id="ocean" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
          <radialGradient id="glow" cx="50%" cy="50%">
            <stop offset="88%" stopColor="#dc2626" stopOpacity="0" />
            <stop offset="96%" stopColor="#dc2626" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={R + 8} fill="url(#glow)" />
        <circle cx={CX} cy={CY} r={R} fill="url(#ocean)" />

        {/* graticule */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const pts: string[] = [];
          for (let lon = -180; lon <= 180; lon += 4) {
            const p = project(lat, lon);
            if (p) pts.push(p.join(','));
          }
          return <polyline key={lat} points={pts.join(' ')} fill="none" stroke="#334155" strokeWidth="0.5" />;
        })}
        {Array.from({ length: 12 }, (_, i) => i * 30 - 180).map((lon) => {
          const pts: string[] = [];
          for (let lat = -90; lat <= 90; lat += 4) {
            const p = project(lat, lon);
            if (p) pts.push(p.join(','));
          }
          return <polyline key={lon} points={pts.join(' ')} fill="none" stroke="#334155" strokeWidth="0.5" />;
        })}

        {/* land */}
        {LAND.map((poly, i) => {
          const segs: string[][] = [[]];
          poly.forEach(([lon, lat]) => {
            const p = project(lat, lon);
            if (p) segs[segs.length - 1].push(p.join(','));
            else if (segs[segs.length - 1].length) segs.push([]);
          });
          return segs.map((s, j) =>
            s.length > 1 ? (
              <polyline key={`${i}-${j}`} points={s.join(' ')} fill="#0f172a" stroke="#64748b" strokeWidth="0.9" />
            ) : null
          );
        })}

        {/* city dots */}
        {cities.map((c) => {
          const p = project(c.lat, c.lon);
          if (!p) return null;
          const r = 3 + (c.n / maxCity) * 6;
          return (
            <g key={c.city}>
              <circle cx={p[0]} cy={p[1]} r={r * 2.2} fill="#dc2626" opacity="0.18">
                <animate attributeName="r" values={`${r};${r * 2.6};${r}`} dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle cx={p[0]} cy={p[1]} r={r} fill="#ef4444" stroke="#fff" strokeWidth="0.8" />
            </g>
          );
        })}
      </svg>

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
              {c.k} · {c.n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
