'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * The take-home figure, counting to its new value instead of snapping.
 *
 * This is the one number on the page people are actually reading, and it
 * changes while they type. Snapping gives no signal that it moved or which
 * way; a short count makes the change legible — and the direction of travel
 * is the information.
 *
 * Three rules this follows, because it is a money figure and not decoration:
 *  1. prefers-reduced-motion → no animation at all, the value is simply set.
 *  2. The FINAL frame is always the exact prop value. Interpolated frames are
 *     rounded display noise; the number the reader ends up looking at is the
 *     engine's, never an artefact of the tween.
 *  3. First render does not animate — a page load should show the answer, not
 *     count up from zero at it.
 */
export default function AnimatedAmount({
  value,
  format,
  className = '',
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef<number | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; from.current = value; setShown(value); return; }
    if (from.current === value) return;

    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // A hidden tab does not run requestAnimationFrame at all. Animating there
    // would leave the figure frozen at its old value until the tab is looked
    // at again — a stale number on a money field, which is worse than no
    // animation. Same reasoning as reduced motion: show the answer.
    const hidden = typeof document !== 'undefined' && document.hidden;
    if (reduced || hidden) { from.current = value; setShown(value); return; }

    const start = performance.now();
    const a = from.current;
    const b = value;
    const DURATION = 420;
    // easeOutCubic: fast to begin, settling — matches --ease-snappy's shape
    // without paying for a spring library on a single scalar.
    const ease = (p: number) => 1 - Math.pow(1 - p, 3);

    const settle = () => { setShown(b); from.current = b; };

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      if (p >= 1) { settle(); raf.current = null; return; }
      setShown(a + (b - a) * ease(p));
      raf.current = requestAnimationFrame(step);
    };
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(step);

    // Backstop: whatever happens to the frame loop — throttled, backgrounded,
    // never scheduled — the exact engine value lands. The animation is an
    // enhancement; correctness of the figure is not allowed to depend on it.
    const guard = setTimeout(() => {
      if (raf.current !== null) { cancelAnimationFrame(raf.current); raf.current = null; settle(); }
    }, DURATION + 120);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      clearTimeout(guard);
    };
  }, [value]);

  return <span className={className}>{format(shown)}</span>;
}
