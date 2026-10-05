import { prefersReducedMotion } from './utils.js';

/** Weich animiertes Auf- und Zuklappen der FAQ (natives <details> als Basis). */
export function initFaq() {
  document.querySelectorAll('.faq__list details').forEach((details) => {
    const summary = details.querySelector('summary');
    const answer = details.querySelector('.faq__answer');
    let animation = null;

    summary.addEventListener('click', (event) => {
      if (prefersReducedMotion()) {
        requestAnimationFrame(() => window.dispatchEvent(new Event('layout:change')));
        return;
      }
      event.preventDefault();
      animation?.cancel();

      const opening = !details.open;
      if (opening) details.open = true;
      const height = answer.scrollHeight;

      animation = answer.animate(
        { height: opening ? ['0px', `${height}px`] : [`${height}px`, '0px'], opacity: opening ? [0, 1] : [1, 0] },
        { duration: opening ? 450 : 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      );
      animation.onfinish = () => {
        if (!opening) details.open = false;
        animation = null;
        window.dispatchEvent(new Event('layout:change'));
      };
    });
  });
}
