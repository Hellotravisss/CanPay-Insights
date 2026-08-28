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
  lang = 'en',
}: {
  cities: City[];
  countries: { k: string | number; n: number }[];
  lang?: 'en' | 'zh';
}) {
  const T = (en: string, zh: string) => (lang === 'zh' ? zh : en);
  const HOME_LAT = 28;
  const [lon0, setLon0] = useState(-96);
  const [lat0, setLat0] = useState(HOME_LAT);
  const [spinning, setSpinning] = useState(true);
  const drag = useRef<{ x: number; y: number; lon: number; lat: number } | null>(null);
  const [hoverCity, setHoverCity] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!spinning) return;
    const id = setInterval(() => {
      setLon0((l) => (l + 0.22) % 360);
      // Drift the tilt back to the home latitude while spinning, so a globe
      // someone dragged toward a pole quietly levels itself out.
      setLat0((la) => (Math.abs(la - HOME_LAT) < 0.3 ? HOME_LAT : la + (HOME_LAT - la) * 0.03));
    }, 50);
    return () => clearInterval(id);
  }, [spinning]);


  const CX = 170;
  const CY = 170;
  // Zooming grows the sphere and lets it overflow the frame — the same feel as
  // zooming a map. The clip path grows with it, so land is still cut at the
  // horizon rather than at the old radius.
  const BASE_R = 148;
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 8;
  const R = BASE_R * zoom;

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
    // R must be a dependency: it is derived from zoom, and leaving it out meant
    // the projection kept the previous radius after a zoom. The sphere circles
    // resized immediately (they use R directly) while every coastline stayed at
    // the old scale until some other state change — the spin tick — happened to
    // rebuild this memo. That is the "nothing moves until I click" symptom.
  }, [lon0, lat0, R]);

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

  // Sample the graticule more finely when zoomed, or the curves turn into
  // visible straight facets.
  const step = zoom > 3 ? 1 : zoom > 1.5 ? 2 : 3;

  const maxCity = Math.max(1, ...cities.map((c) => c.n));

  /**
   * The globe's array is ordered for COVERAGE — every international point
   * first, then the busiest Canadian ones — so that a single visit from Hong
   * Kong cannot be pushed off the map by Canadian volume. Taking its first
   * eight as a ranking showed Miami (11) above Toronto (248) and made it look
   * as though Canadian cities were being filtered out. Rank by count here, and
   * leave out the points whose only label is a country code: they are real
   * dots on the globe but they are not cities.
   */
  const topCities = [...cities]
    .filter((c) => (c as City & { named?: boolean }).named !== false)
    .sort((a, b) => b.n - a.n)
    .slice(0, 8);
  // No labels are drawn by default. Two earlier rules both failed for the same
  // reason: Canada's traffic clusters in southern Ontario, so any always-on
  // label set puts Toronto, Nepean and Brampton on top of each other. Hover is
  // the only presentation that stays readable no matter how the dots bunch up.

  // All interaction lives on the wrapping DIV, not the SVG. It was on the SVG
  // first, and desktop worked while every phone froze on first touch: iOS
  // Safari does not reliably honour touch-action or setPointerCapture on SVG
  // elements, so the browser reclaimed the gesture for scrolling and
  // pointermove simply stopped arriving. On an HTML element both are solid.
  //
  // Pointers are tracked in a map so two fingers become a pinch: one active
  // pointer rotates, two zoom around their spread. pointercancel must clear
  // state too — iOS fires it whenever it takes the gesture back.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  // Drives the window-listener effect below; a ref would not re-run it.
  const [dragging, setDragging] = useState(false);

  // Rotation resumes by itself five seconds after the last touch. The
  // "Resume rotation" button used to be the only way back, which meant every
  // phone visitor who tapped the globe once left it frozen forever.
  useEffect(() => {
    if (spinning) return;
    if (dragging) return; // never restart under someone's finger
    const id = setTimeout(() => setSpinning(true), 5000);
    return () => clearTimeout(id);
  }, [spinning, dragging, lon0, lat0, zoom]);
  const pinch = useRef<{ dist: number; zoom: number } | null>(null);

  const pinchDist = () => {
    const [a, b] = [...pointers.current.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setDragging(true);
    setSpinning(false);
    if (pointers.current.size === 2) {
      pinch.current = { dist: pinchDist(), zoom };
      drag.current = null;
    } else {
      drag.current = { x: e.clientX, y: e.clientY, lon: lon0, lat: lat0 };
    }
    // Last, and allowed to fail: capture only insures against the pointer
    // straying off the element mid-drag (onPointerLeave ends the drag then).
    // It can throw NotFoundError, and when it sat above the state assignment
    // that exception silently killed every drag before it began.
    try {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    } catch {}
  };
  const onMoveRaw = (e: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size >= 2) {
      const d = pinchDist();
      if (d > 0 && pinch.current.dist > 0) setZoom(clampZoom(pinch.current.zoom * (d / pinch.current.dist)));
      return;
    }
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    // Drag moves the globe's SURFACE with the pointer: dragging right spins the
    // Earth eastward under your finger, which means decreasing the centre
    // longitude. Same logic vertically.
    // Same pixel drag should move the same amount of SURFACE, so sensitivity
    // falls as the sphere grows — otherwise one flick spins the globe wildly
    // when zoomed in.
    const k = 0.4 / zoom;
    setLon0(drag.current.lon - dx * k);
    setLat0(Math.max(-80, Math.min(80, drag.current.lat + dy * k)));
  };
  /**
   * Once a finger is down, the rest of the gesture is tracked on WINDOW.
   *
   * Element handlers looked correct and failed on every phone: the first
   * pointermove retargets from the wrapper to the SVG inside it, which fires
   * pointerleave on the wrapper, which ended the drag before it moved. A mouse
   * never does this — pointerleave only fires on actually leaving the box —
   * so the bug was invisible on desktop. Window listeners cannot be retargeted
   * away, and they also survive the re-render that setSpinning(false) causes,
   * which can drop pointer capture.
   */
  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => onMoveRaw(e);
    const end = (e: PointerEvent) => onUpRaw(e);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  });

  const onUpRaw = (e: PointerEvent | React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 1) {
      // Pinch ended with one finger still down: restart the drag from where
      // that finger is, or the globe would jump on its next move.
      const [p] = [...pointers.current.values()];
      drag.current = { x: p.x, y: p.y, lon: lon0, lat: lat0 };
    } else if (pointers.current.size === 0) {
      drag.current = null;
      setDragging(false);
    }
  };

  const clampZoom = (z: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));
  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    setZoom((z) => clampZoom(z * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
  };

  return (
    <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-8">
      <div className="w-full min-w-0 shrink-0 md:w-auto">
        {/* The interactive layer wraps ONLY the sphere — with the controls
            inside it, tapping "+" twice was a double-click and reset the
            zoom the user was in the middle of adjusting. */}
        <div
          className="cursor-grab select-none active:cursor-grabbing"
          // Inline, not a class: this style being missed is the difference
          // between a globe and a frozen circle on iOS, so it must not depend
          // on a utility surviving a purge.
          style={{ touchAction: 'none' }}
          onPointerDown={onDown}
          // No onPointerMove / onPointerUp / onPointerLeave here: the gesture
          // is tracked on window from pointerdown onward. onPointerLeave in
          // particular was ending every touch drag on its first move.
          onWheel={onWheel}
          onDoubleClick={() => setZoom(1)}
        >
          <svg viewBox="0 0 340 340" className="aspect-square h-auto w-full max-w-[340px]">
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

          <circle cx={CX} cy={CY} r={R + 10 * zoom} fill="url(#atmo)" />
          <circle cx={CX} cy={CY} r={R} fill="url(#ocean)" />

          <g clipPath="url(#sphere)">
            {/* graticule every 15° */}
            {Array.from({ length: 11 }, (_, i) => (i - 5) * 15).flatMap((lat) => {
              const coords: Array<[number, number]> = [];
              for (let lon = -180; lon <= 180; lon += step) coords.push([lat, lon]);
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
              for (let lat = -90; lat <= 90; lat += step) coords.push([lat, lon]);
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
            // Identify a dot by its POSITION, not its label. Points whose city
            // name the edge could not resolve are labelled with their country,
            // so several now share the string "CA" — and while the key was the
            // label, React could not tell those dots apart. At twenty redraws a
            // second it stopped reclaiming them and they piled up along the
            // limb, which is the "dots accumulating at the edge" symptom.
            // Coordinates are unique by construction.
            const id = `${c.lat},${c.lon}`;
            return (
              <g key={id}>
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
                  onMouseEnter={() => setHoverCity(id)}
                  onMouseLeave={() => setHoverCity((v) => (v === id ? null : v))}
                />
                {hoverCity === id && (
                  <text
                    x={p[0] + r + 3}
                    y={p[1] + 3}
                    className="fill-white text-[9px] font-semibold"
                    style={{ paintOrder: 'stroke', stroke: '#0b1220', strokeWidth: 2.5 }}
                  >
                    {/* Unnamed points carry a country code as their label;
                        show the country's name so a tooltip never reads "CA". */}
                    {c.city.length === 2 && c.city === c.city.toUpperCase()
                      ? countryName(c.city, lang)
                      : c.city}{' '}
                    · {c.n}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        </div>
        <div className="mt-1 flex items-center justify-center gap-2">
          <button
            onClick={() => setZoom((z) => clampZoom(z / 1.4))}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="h-6 w-6 rounded-md border border-slate-200 text-sm font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-100"
          >
            −
          </button>
          <span className="w-10 text-center text-[10px] tabular-nums text-slate-400">
            {zoom.toFixed(1)}×
          </span>
          <button
            onClick={() => setZoom((z) => clampZoom(z * 1.4))}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="h-6 w-6 rounded-md border border-slate-200 text-sm font-bold text-slate-500 disabled:opacity-30 hover:bg-slate-100"
          >
            +
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] text-slate-400">
          {spinning ? (
            T('Drag to spin · scroll to zoom · double-click to reset', '拖动旋转 · 滚轮缩放 · 双击复位')
          ) : (
            <button onClick={() => setSpinning(true)} className="underline hover:text-slate-600">
              {T('Resume rotation', '恢复旋转')}
            </button>
          )}
        </p>
      </div>

      <div className="w-full">
        <h3 className="mb-3 text-sm font-bold text-slate-700">
          {T('Top cities', '城市排行')}
        </h3>
        <ul className="mb-2 space-y-1.5">
          {topCities.map((c) => (
            <li key={c.city} className="flex items-baseline justify-between border-b border-slate-100 pb-1.5 text-sm">
              <span className="text-slate-600">{c.city}</span>
              <span className="tabular-nums font-semibold text-slate-800">{c.n}</span>
            </li>
          ))}
        </ul>
        {/* The country list is not a summary of the city list — some visits
            arrive with a country and no city at all, so a country can be
            present here while appearing in no city row above. Saying so stops
            the two lists reading as a contradiction. */}
        <p className="mb-5 text-[11px] leading-4 text-slate-400">
          {T(
            'Cities only appear when the edge network resolves one. Some networks — mobile carriers and corporate VPNs especially — report a country and nothing finer, so those visits are counted below but named in no city row above.',
            '只有边缘节点解析出城市时才会出现在这里。有些网络 —— 尤其是手机运营商和企业 VPN —— 只报到国家一级,所以那些访问会计入下面的国家,但不会出现在上面任何一行城市里。',
          )}
        </p>
        <h3 className="mb-2 text-sm font-bold text-slate-700">{T('By country', '按国家')}</h3>
        <div className="flex flex-wrap gap-2">
          {countries.map((c) => (
            <span key={String(c.k)} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {countryName(String(c.k), lang)} · {c.n}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
