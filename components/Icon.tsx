/**
 * CanPay's own icon set, replacing emoji (2026-11). Stone-slab shapes taken from
 * the inukshuk in public/logo.png: red #DC2625 with a darker #A51C1C facet, or
 * tone="white" (white with a light grey facet, like the logo) on red or dark panels.
 * Source sheets and the trace script: design/icons/ (build.py writes public/icons).
 *
 * Decorative only: every use sits next to text that says the same thing, so the
 * image has empty alt text and is hidden from screen readers.
 */
export type IconName =
  | 'bank' | 'book' | 'box' | 'briefcase' | 'bulb' | 'calendar' | 'camera' | 'chart'
  | 'checklist' | 'coins' | 'compass' | 'confetti' | 'face-higher' | 'face-lower'
  | 'face-same' | 'folder' | 'globe' | 'home' | 'hybrid' | 'link' | 'lock' | 'office'
  | 'phone' | 'piggy' | 'pin' | 'question' | 'raise' | 'receipt' | 'robot' | 'save'
  | 'warning' | 'stopwatch' | 'check' | 'checkbox' | 'sparkle' | 'maple';

export default function Icon({ name, size = 20, tone = 'red', className = '' }: {
  name: IconName; size?: number; tone?: 'red' | 'white'; className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static SVG, next/image adds nothing
    <img
      src={`/icons/${name}${tone === 'white' ? '-white' : ''}.svg`}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={`inline-block shrink-0 align-[-0.2em] ${className}`}
    />
  );
}
