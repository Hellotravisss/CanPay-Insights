'use client';
import { useEffect } from 'react';

/**
 * Plays each chart's entrance once, when it first reaches the screen: adds .pm-in to `.pc` (charts), `.pr`
 * (ranking lists) and `[data-motion]` blocks. The motion itself is CSS (app/globals.css, "Motion"; canonical
 * PayFamily-brand/18-charts/pay-motion.css). Without JS, or with reduced motion, that CSS does not apply and
 * everything is simply drawn.
 *
 * A scroll check, not an IntersectionObserver: a fling or anchor jump straight past a chart never makes it
 * intersect, so it would stay hidden (same lesson as useBelowViewport, 2026-11-03). Anything at or above the
 * fold line counts as seen. Client-rendered charts (the calculator's results) are picked up by a MutationObserver.
 */
const SEL = '.pc:not(.pm-in), .pr:not(.pm-in), [data-motion]:not(.pm-in)';

export default function MotionRuntime() {
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const line = window.innerHeight * 0.88;
      document.querySelectorAll<HTMLElement>(SEL).forEach((el) => {
        if (el.getBoundingClientRect().top < line) el.classList.add('pm-in');
      });
    };
    const soon = () => { if (!frame) frame = requestAnimationFrame(check); };
    // a chart that mounts already on screen: one frame in the hidden state first, so the transition has a start
    const mo = new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(() => requestAnimationFrame(check)); });
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', soon, { passive: true });
    window.addEventListener('resize', soon);
    soon();
    return () => {
      mo.disconnect();
      window.removeEventListener('scroll', soon);
      window.removeEventListener('resize', soon);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
