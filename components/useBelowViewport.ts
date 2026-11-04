import * as React from 'react';

/**
 * True while the element is still below the bottom of the screen.
 *
 * Drives the mobile take-home bar (docs/playbooks/设计.md §3): on a phone the
 * inputs sit above the result, so the answer is off screen while the reader
 * edits them. Once they reach the result, or scroll past it to read on, the
 * bar goes away instead of covering the text.
 *
 * A scroll check, not an IntersectionObserver: a jump straight past the
 * element (fast fling, anchor link) never makes it intersect, so an observer
 * never fires and the bar stays up over the page below (CanPay, 2026-11-03).
 */
export function useBelowViewport(ref: React.RefObject<HTMLElement | null>, margin = 48): boolean {
  const [below, setBelow] = React.useState(false);
  React.useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const el = ref.current;
      if (el) setBelow(el.getBoundingClientRect().top > window.innerHeight - margin);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(check); };
    check();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, margin]);
  return below;
}
