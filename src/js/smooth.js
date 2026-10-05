import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let lenis = null;

/** Seite festhalten, z. B. während ein Dialog offen ist */
export function lockScroll() {
  if (lenis) lenis.stop();
  else document.documentElement.style.overflow = 'hidden';
}

export function unlockScroll() {
  if (lenis) lenis.start();
  else document.documentElement.style.overflow = '';
}

/**
 * Weiches Scrollen (Lenis), synchronisiert mit GSAP/ScrollTrigger.
 * Auf Touch-Geräten bleibt das native Scrollen aktiv. Bei „Bewegung reduzieren“ wird Lenis nicht gestartet.
 */
export function initSmoothScroll({ reduced }) {
  if (!reduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anker-Links (#leistungen, /#kontakt …) weich ansteuern
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"], a[href^="/#"]');
    if (!link) return;
    const hash = link.getAttribute('href').replace(/^\//, '');
    if (hash.length < 2 || (link.pathname !== window.location.pathname && link.getAttribute('href').startsWith('/'))) return;
    let target = document.querySelector(hash);
    if (!target) return;
    // Gepinnte Sektionen: zum Anfang des Pin-Bereichs scrollen, nicht zur aktuellen (verschobenen) Position
    if (target.parentElement?.classList.contains('pin-spacer')) target = target.parentElement;

    event.preventDefault();
    // Lenis zieht scroll-padding-top bereits ab – Sektionen haben genug eigenen Innenabstand
    const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const offset = hash === '#top' ? 0 : padding;
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });

  return lenis;
}
