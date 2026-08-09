// Replays the exact projection + arc logic over a full rotation and flags any
// polygon that covers an implausible share of the disk, or any segment long
// enough to be a chord across it. Catching this in a loop is the check that was
// missing when the "all green" bug shipped.
import { readFileSync } from 'node:fs';

const src = readFileSync(
  '/Users/travis/Documents/Vibe_Coding/CanPay-Insights/app/insights-Mi9kcqgRDRCM/landData.ts',
  'utf8'
);
const body = src.slice(src.indexOf('=', src.indexOf('LAND')) + 1);
const LAND = JSON.parse(body.slice(body.indexOf('['), body.lastIndexOf(']') + 1));

const R = 148, CX = 170, CY = 170;
const project = (lat0, lon0) => (lat, lon) => {
  const p0 = (lat0 * Math.PI) / 180, l0 = (lon0 * Math.PI) / 180;
  const p = (lat * Math.PI) / 180, l = (lon * Math.PI) / 180;
  const cosc = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l - l0);
  const x = R * Math.cos(p) * Math.sin(l - l0);
  const y = -R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l - l0));
  return { x: CX + x, y: CY + y, visible: cosc >= 0 };
};

const ringArcs = (ring, proj) => {
  const arcs = [[]];
  for (const [lon, lat] of ring) {
    const q = proj(lat, lon);
    if (q.visible) arcs[arcs.length - 1].push([q.x, q.y]);
    else if (arcs[arcs.length - 1].length) arcs.push([]);
  }
  if (arcs.length > 1 && arcs[0].length && arcs[arcs.length - 1].length) {
    const first = arcs.shift();
    arcs[arcs.length - 1] = arcs[arcs.length - 1].concat(first);
  }
  return arcs.filter((a) => a.length > 2);
};

const area = (pts) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i], [x2, y2] = pts[(i + 1) % pts.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
};

const diskArea = Math.PI * R * R;
let worstArea = 0, worstSeg = 0, worstAt = null;
for (let lon0 = -180; lon0 < 180; lon0 += 5) {
  for (const lat0 of [-60, -28, 0, 28, 60]) {
    const proj = project(lat0, lon0);
    for (const ring of LAND) {
      for (const arc of ringArcs(ring, proj)) {
        const share = area(arc) / diskArea;
        if (share > worstArea) { worstArea = share; worstAt = { lon0, lat0 }; }
        for (let i = 1; i < arc.length; i++) {
          const d = Math.hypot(arc[i][0] - arc[i - 1][0], arc[i][1] - arc[i - 1][1]);
          if (d > worstSeg) worstSeg = d;
        }
      }
    }
  }
}
console.log('rotations checked: 72 lon x 5 lat = 360');
console.log('largest single landmass as share of disk:', (worstArea * 100).toFixed(1) + '%', 'at', worstAt);
console.log('longest segment:', worstSeg.toFixed(1), 'px (sphere diameter', 2 * R + ')');
console.log(worstArea < 0.55 && worstSeg < 60 ? 'PASS' : 'FAIL');
