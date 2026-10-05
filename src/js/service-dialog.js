import { gsap } from 'gsap';
import { serviceDetails } from './data/services.js';
import { lockScroll, unlockScroll } from './smooth.js';
import { prefersReducedMotion } from './utils.js';

const srcset = (name) => [800, 1400].map((w) => `/images/photos/${name}-${w}.webp ${w}w`).join(', ');

/**
 * Detail-Fenster zu jeder Leistung (Klick auf „+“ bzw. das Bild einer Leistungskarte).
 * Basis ist das native <dialog>: Fokus-Falle, Escape und Barrierefreiheit inklusive.
 */
export function initServiceDialog() {
  const triggers = document.querySelectorAll('[data-service-detail]');
  if (!triggers.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'sheet';
  dialog.setAttribute('aria-labelledby', 'sheet-title');
  dialog.innerHTML = `
    <div class="sheet__panel" data-lenis-prevent>
      <button class="sheet__close" type="button" aria-label="Schließen" data-sheet-close>
        <svg class="icon"><use href="#i-plus" /></svg>
      </button>
      <div class="sheet__media"><img alt="" data-sheet-img /></div>
      <div class="sheet__body">
        <p class="eyebrow">Leistung</p>
        <h2 id="sheet-title" data-sheet-title></h2>
        <p class="sheet__lead" data-sheet-lead></p>
        <div class="sheet__cols">
          <div>
            <h3>Im Leistungsumfang</h3>
            <ul class="sheet__list" data-sheet-includes></ul>
          </div>
          <div>
            <h3>Ideal für</h3>
            <ul class="sheet__tags" data-sheet-ideal></ul>
          </div>
        </div>
        <div class="sheet__actions">
          <a class="btn btn--primary btn--lg" href="#kontakt" data-sheet-cta>Angebot anfragen</a>
          <a class="btn btn--light btn--lg" href="#preisrechner" data-sheet-calc>Preis berechnen</a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  const panel = dialog.querySelector('.sheet__panel');
  const img = dialog.querySelector('[data-sheet-img]');
  const cta = dialog.querySelector('[data-sheet-cta]');
  const reduced = prefersReducedMotion();

  function open(key) {
    const d = serviceDetails[key];
    if (!d) return;
    img.srcset = srcset(d.image);
    img.sizes = '(max-width: 760px) 100vw, 880px';
    img.src = `/images/photos/${d.image}-1400.webp`;
    img.alt = d.title;
    dialog.querySelector('[data-sheet-title]').textContent = d.title;
    dialog.querySelector('[data-sheet-lead]').textContent = d.lead;
    dialog.querySelector('[data-sheet-includes]').innerHTML = d.includes
      .map((item) => `<li><svg class="icon"><use href="#i-check" /></svg>${item}</li>`)
      .join('');
    dialog.querySelector('[data-sheet-ideal]').innerHTML = d.ideal.map((item) => `<li>${item}</li>`).join('');
    cta.dataset.service = d.service;
    panel.scrollTop = 0;

    lockScroll();
    dialog.showModal();
    if (!reduced) {
      gsap.fromTo(dialog, { '--backdrop': 0 }, { '--backdrop': 1, duration: 0.4 });
      gsap.fromTo(panel, { y: 80, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out' });
    }
  }

  function close() {
    if (!dialog.open) return;
    const finish = () => {
      dialog.close();
      unlockScroll();
    };
    if (reduced) return finish();
    gsap.to(panel, { y: 60, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: finish });
    gsap.to(dialog, { '--backdrop': 0, duration: 0.3 });
  }

  triggers.forEach((trigger) => trigger.addEventListener('click', () => open(trigger.dataset.serviceDetail)));

  dialog.addEventListener('click', (event) => {
    // Klick auf den Hintergrund oder „Schließen“
    if (event.target === dialog || event.target.closest('[data-sheet-close]')) return close();
    // Links im Fenster: erst schließen, dann scrollt die Seite zum Ziel
    if (event.target.closest('a[href^="#"]')) {
      gsap.killTweensOf(panel);
      dialog.close();
      unlockScroll();
    }
  });
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });
}
