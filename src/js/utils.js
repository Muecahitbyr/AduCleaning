export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Animiert einen Wert per requestAnimationFrame. */
export function tween({ from = 0, to = 1, duration = 1000, delay = 0, ease = easeInOutCubic, onUpdate, onDone }) {
  let start = null;
  let frame;
  const step = (now) => {
    if (start === null) start = now + delay;
    const t = clamp((now - start) / duration);
    if (now >= start) onUpdate(from + (to - from) * ease(t));
    if (t < 1) frame = requestAnimationFrame(step);
    else onDone?.();
  };
  frame = requestAnimationFrame(step);
  return () => cancelAnimationFrame(frame);
}
