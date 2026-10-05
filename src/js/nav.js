/**
 * Navigation: Glas-Hintergrund beim Scrollen, hell/dunkel je nach Sektion darunter,
 * Ausblenden beim Runterscrollen, mobiles Menü, aktiver Link und mobile CTA-Leiste.
 */
export function initNav() {
  const nav = document.querySelector('[data-nav]');
  if (!nav) return;

  const toggle = nav.querySelector('[data-nav-toggle]');
  const sheet = nav.querySelector('[data-nav-sheet]');
  const dock = document.querySelector('[data-dock]');
  const hero = document.querySelector('[data-hero]');
  const contact = document.getElementById('kontakt');

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    nav.classList.remove('is-hidden');
    toggle?.setAttribute('aria-expanded', String(open));
    toggle?.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  };

  toggle?.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  sheet?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && setOpen(false));

  // Helle oder dunkle Navigation – je nachdem, welche Sektion gerade darunter liegt
  const updateTheme = () => {
    if (nav.classList.contains('is-open')) return;
    const behind = document
      .elementsFromPoint(window.innerWidth / 2, nav.offsetHeight / 2)
      .find((el) => !nav.contains(el));
    const host = behind?.closest('section, footer, main');
    if (!host) return;
    nav.classList.toggle('is-light', host.matches('.section--light, .legal'));
  };

  let lastY = window.scrollY;
  let contactVisible = false;
  let queued = false;

  const update = () => {
    queued = false;
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40 || !hero);

    // Beim Runterscrollen ausblenden, beim Hochscrollen sofort wieder zeigen
    if (!nav.classList.contains('is-open')) {
      if (y > window.innerHeight * 1.2 && y > lastY + 6) nav.classList.add('is-hidden');
      else if (y < lastY - 6 || y < window.innerHeight) nav.classList.remove('is-hidden');
    }
    lastY = y;

    updateTheme();

    if (dock) {
      const pastHero = y > (hero ? window.innerHeight * 0.8 : 200);
      dock.classList.toggle('is-visible', pastHero && !contactVisible);
    }
  };
  const request = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  update();

  if (!('IntersectionObserver' in window)) return;

  if (contact && dock) {
    new IntersectionObserver(([entry]) => {
      contactVisible = entry.isIntersecting;
      request();
    }).observe(contact);
  }

  // Aktiven Menüpunkt markieren
  const links = [...nav.querySelectorAll('.nav__links a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`));
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  sections.forEach((s) => spy.observe(s));
}
