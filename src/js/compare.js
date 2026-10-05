import { easeInOutCubic, prefersReducedMotion, tween } from './utils.js';

/** Vorher/Nachher-Regler. Bewegt sich beim ersten Sichtbarwerden einmal kurz als Hinweis. */
export function initCompare() {
  document.querySelectorAll('[data-compare]').forEach((el) => {
    const range = el.querySelector('input[type="range"]');
    let touched = false;

    const set = (value) => {
      el.style.setProperty('--pos', `${value}%`);
    };

    range.addEventListener('input', () => {
      touched = true;
      set(range.value);
    });
    range.addEventListener('pointerdown', () => el.classList.add('is-dragging'));
    window.addEventListener('pointerup', () => el.classList.remove('is-dragging'));

    if (prefersReducedMotion() || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const keyframes = [50, 22, 74, 50];
        let i = 0;
        const next = () => {
          if (touched || i >= keyframes.length - 1) return;
          const from = keyframes[i];
          const to = keyframes[++i];
          tween({
            from,
            to,
            duration: 900,
            delay: i === 1 ? 500 : 0,
            ease: easeInOutCubic,
            onUpdate: (v) => {
              if (touched) return;
              set(v);
              range.value = String(Math.round(v));
            },
            onDone: next,
          });
        };
        next();
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
  });
}
