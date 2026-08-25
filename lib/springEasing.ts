/**
 * Spring physics, simulated once and compiled to a CSS `linear()` easing.
 *
 * Technique studied from github.com/Jakubantalik/Libraries (liquid-gooey's
 * spring.ts). The value of it is not the look — it is that a spring curve
 * becomes a plain CSS easing string, so the browser runs the whole animation
 * on the compositor with no JavaScript per frame. Physical motion, zero
 * runtime cost, and it cannot jank when the main thread is busy.
 *
 * We keep two presets and no more. Motion on this site exists to show that a
 * number changed, not to decorate a tax calculator.
 */

export type Spring = { stiffness: number; damping: number; mass: number };

export const SPRINGS = {
  /** Short and decisive — for a value settling into place. */
  snappy: { stiffness: 480, damping: 34, mass: 1 },
  /** Calmer — for something entering the page. */
  smooth: { stiffness: 190, damping: 26, mass: 1 },
} satisfies Record<string, Spring>;

const DT = 1 / 240;

/** Simulate to rest, then sample into a CSS linear() easing. */
export function springToLinear(c: Spring): { duration: number; easing: string } {
  let x = 0, v = 0, t = 0, settledAt = -1;
  const xs: number[] = [0];
  while (t < 10) {
    const a = (-c.stiffness * (x - 1) - c.damping * v) / c.mass;
    v += a * DT;
    x += v * DT;
    t += DT;
    xs.push(x);
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.02) {
      if (settledAt < 0) settledAt = t;
      if (t - settledAt >= 0.064) break;
    } else settledAt = -1;
  }
  const duration = settledAt > 0 ? settledAt : t;
  const n = Math.round(Math.min(120, Math.max(24, duration * 90)));
  const lastIdx = Math.min(xs.length - 1, Math.round(duration / DT));
  const values: number[] = [];
  for (let i = 0; i <= n; i++) {
    const idx = Math.min(xs.length - 1, Math.round((i / n) * lastIdx));
    values.push(Math.round(xs[idx] * 1e4) / 1e4);
  }
  return { duration: Math.round(duration * 1000), easing: `linear(${values.join(',')})` };
}
