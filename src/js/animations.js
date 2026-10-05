import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

/**
 * Alle Scroll- und Intro-Animationen der Startseite.
 * Läuft nur, wenn „Bewegung reduzieren“ nicht aktiv ist – sonst bleibt alles statisch sichtbar.
 */
export function initAnimations({ reduced }) {
  if (reduced) {
    showHeroStatic();
    return;
  }

  ScrollTrigger.config({ ignoreMobileResize: true });

  heroIntro();
  scrollProgress();

  // „desktop“ = genug Breite UND Höhe für gepinnte Szenen (Handy im Querformat zählt als mobil)
  const mm = gsap.matchMedia();
  mm.add({ desktop: '(min-width: 768px) and (min-height: 560px)', mobile: '(max-width: 767px), (max-height: 559px)' }, (context) => {
    const { desktop } = context.conditions;
    const cleanups = [];
    heroScroll();
    if (desktop) cleanups.push(heroPointer());
    splitHeadings();
    fadeIns();
    statement();
    detailScene(desktop);
    services(desktop);
    imageReveals();
    promise();
    steps();
    parallaxMedia();
    marquee();
    instagram(desktop);
    wordmark();
    if (desktop) cleanups.push(magnetic());
    return () => cleanups.forEach((cleanup) => cleanup?.());
  });

  // Höhenänderungen (FAQ, Formular, nachgeladene Bilder) → Positionen neu berechnen
  let refreshTimer;
  const refresh = () => {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 120);
  };
  window.addEventListener('layout:change', refresh);
  window.addEventListener('load', refresh);
  document.fonts?.ready.then(refresh);
}

/* ---------------------------------------------------------------- Hero -- */

function showHeroStatic() {
  gsap.set('[data-hero-content], .hero__meta', { opacity: 1, animation: 'none' });
}

function heroIntro() {
  const hero = $('[data-hero]');
  if (!hero) return;

  const title = $('[data-hero-title]', hero);
  const split = SplitText.create(title, { type: 'lines', mask: 'lines', linesClass: 'split-line' });

  gsap.set(['[data-hero-content]', '.hero__meta'], { opacity: 1, animation: 'none' });

  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .from($('[data-hero-media]', hero), { scale: 1.22, duration: 2.6 }, 0)
    .from($('.hero__shade', hero), { opacity: 0.4, duration: 2 }, 0)
    .from(split.lines, { yPercent: 115, duration: 1.5, stagger: 0.12 }, 0.2)
    .from($$('[data-hero-item]', hero), { y: 34, opacity: 0, duration: 1.4, stagger: 0.1 }, 0.55)
    .fromTo($('[data-hero-glint]', hero), { xPercent: -60 }, { xPercent: 60, duration: 2.4, ease: 'power2.inOut' }, 0.3)
    .from('.nav__inner', { y: -24, opacity: 0, duration: 1.2 }, 0.7);
}

/** Feiner Tiefeneffekt: Bild und Text reagieren gegenläufig auf die Maus */
function heroPointer() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const hero = $('[data-hero]');
  if (!hero) return;
  const img = $('.hero__img', hero);
  const content = $('[data-hero-content]', hero);
  const imgX = gsap.quickTo(img, 'xPercent', { duration: 1.2, ease: 'power3.out' });
  const imgY = gsap.quickTo(img, 'yPercent', { duration: 1.2, ease: 'power3.out' });
  const txtX = gsap.quickTo(content, 'x', { duration: 1.2, ease: 'power3.out' });
  const txtY = gsap.quickTo(content, 'y', { duration: 1.2, ease: 'power3.out' });

  const onMove = (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
    imgX(x * -2.4);
    imgY(y * -2.4);
    txtX(x * 14);
    txtY(y * 10);
  };
  hero.addEventListener('pointermove', onMove);
  return () => hero.removeEventListener('pointermove', onMove);
}

/** Dünner Fortschrittsbalken am oberen Rand */
function scrollProgress() {
  const bar = $('[data-progress]');
  if (!bar) return;
  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
  });
}

function heroScroll() {
  const hero = $('[data-hero]');
  if (!hero) return;

  gsap
    .timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=90%', pin: true, scrub: true },
      defaults: { ease: 'none' },
    })
    .fromTo(
      $('[data-hero-frame]', hero),
      { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
      { clipPath: 'inset(9% 6% 9% 6% round 40px)' },
      0,
    )
    .to($('.hero__img', hero), { scale: 1.15 }, 0)
    .to($('[data-hero-content]', hero), { yPercent: -14, opacity: 0, scale: 0.94 }, 0)
    .to($('.hero__meta', hero), { y: 40, opacity: 0 }, 0)
    .to($('[data-hero-glint]', hero), { xPercent: 20 }, 0);
}

/* ------------------------------------------------------ Text & Einblenden -- */

function splitHeadings() {
  $$('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.3,
          ease: 'expo.out',
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        }),
    });
  });
}

function fadeIns() {
  gsap.set('[data-fade]', { opacity: 0, y: 40 });
  ScrollTrigger.batch('[data-fade]', {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: 0.08 }),
  });
}

function statement() {
  const text = $('[data-statement-text]');
  if (!text) return;
  const split = SplitText.create(text, { type: 'words' });
  gsap.fromTo(
    split.words,
    { opacity: 0.14 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.1,
      scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: true },
    },
  );
}

/* ------------------------------------------------------- Detail-Szene -- */

function detailScene(desktop) {
  const section = $('[data-detail]');
  if (!section) return;

  const start = desktop ? 'inset(46% 31% 9% 31% round 28px)' : 'inset(50% 8% 12% 8% round 24px)';

  gsap
    .timeline({
      scrollTrigger: { trigger: section, start: 'top top', end: '+=150%', pin: true, scrub: true },
    })
    .fromTo(
      $('[data-detail-media]', section),
      { clipPath: start },
      { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power2.inOut', duration: 1 },
      0,
    )
    .fromTo($('.detail__img', section), { scale: 1.4 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
    .fromTo(
      $('[data-detail-title]', section),
      { yPercent: 0, opacity: 1 },
      { yPercent: -60, opacity: 0, ease: 'power1.in', duration: 0.7 },
      0,
    )
    .fromTo($('[data-detail-copy]', section), { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.35 }, 0.8)
    .to({}, { duration: 0.25 });
}

/* ------------------------------------------- Leistungen (horizontal) -- */

function services(desktop) {
  const section = $('[data-services]');
  if (!section) return;
  const track = $('[data-services-track]', section);
  const cards = $$('.svc', track);

  if (!desktop) {
    gsap.from(cards, {
      opacity: 0,
      x: 60,
      duration: 1.2,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: track, start: 'top 85%', once: true },
    });
    return;
  }

  const distance = () => track.scrollWidth - document.documentElement.clientWidth;
  const bar = $('[data-services-bar]', section);

  const scroll = gsap.to(track, {
    x: () => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    },
  });

  // Bilder bewegen sich innerhalb der Karten leicht gegenläufig (Tiefe)
  cards.forEach((card) => {
    gsap.fromTo(
      $('.svc__img', card),
      { xPercent: -7 },
      {
        xPercent: 7,
        ease: 'none',
        scrollTrigger: { trigger: card, containerAnimation: scroll, start: 'left right', end: 'right left', scrub: true },
      },
    );
  });

  gsap.from(cards, {
    opacity: 0,
    x: 120,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.08,
    scrollTrigger: { trigger: section, start: 'top 70%', once: true },
  });
}

/* ------------------------------------------------------- Bild-Reveals -- */

function imageReveals() {
  $$('[data-img-reveal]').forEach((el) => {
    const radius = getComputedStyle(el).borderTopLeftRadius || '0px';
    const img = $('img', el);
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top 92%', end: 'top 40%', scrub: true },
      defaults: { ease: 'none' },
    });
    tl.fromTo(
      el,
      { clipPath: `inset(12% 9% 12% 9% round ${radius})` },
      { clipPath: `inset(0% 0% 0% 0% round ${radius})` },
      0,
    );
    if (img && !el.matches('[data-compare]')) tl.fromTo(img, { scale: 1.25 }, { scale: 1 }, 0);
  });
}

/* --------------------------------------------------------- Versprechen -- */

function promise() {
  const items = $$('[data-promise]');
  if (!items.length) return;

  gsap.fromTo(
    items,
    { '--line-progress': 0, y: 50, opacity: 0 },
    {
      '--line-progress': 1,
      y: 0,
      opacity: 1,
      duration: 1.5,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: items[0].parentElement, start: 'top 82%', once: true },
    },
  );

  $$('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const counter = { value: target === 0 ? 99 : 0 };
    el.textContent = counter.value;
    gsap.to(counter, {
      value: target,
      duration: 2.2,
      ease: 'power3.out',
      onUpdate: () => (el.textContent = Math.round(counter.value)),
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });
}

/* --------------------------------------------------------------- Ablauf -- */

function steps() {
  const list = $('[data-steps]');
  if (!list) return;

  gsap.fromTo(
    $('[data-steps-line]', list),
    { scaleY: 0 },
    { scaleY: 1, ease: 'none', scrollTrigger: { trigger: list, start: 'top 62%', end: 'bottom 62%', scrub: true } },
  );

  $$('[data-step-item]', list).forEach((step) => {
    ScrollTrigger.create({ trigger: step, start: 'top 62%', toggleClass: 'is-active' });
    gsap.from(step, {
      opacity: 0,
      x: 50,
      duration: 1.2,
      ease: 'expo.out',
      scrollTrigger: { trigger: step, start: 'top 88%', once: true },
    });
  });
}

/* ------------------------------------------------------------ Parallax -- */

function parallaxMedia() {
  $$('[data-parallax-media]').forEach((media) => {
    gsap.fromTo(
      media,
      { yPercent: -9 },
      {
        yPercent: 9,
        ease: 'none',
        scrollTrigger: { trigger: media.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      },
    );
  });
}

/* ------------------------------------------------------------- Marquee -- */

function marquee() {
  const rows = $$('[data-marquee]');
  if (!rows.length) return;

  const tweens = rows.map((row) => {
    const dir = Number(row.dataset.marquee);
    return gsap.fromTo(
      row,
      { xPercent: dir > 0 ? 0 : -50 },
      { xPercent: dir > 0 ? -50 : 0, duration: 48, ease: 'none', repeat: -1 },
    );
  });

  // Läuft nur, wenn sichtbar – und wird beim schnellen Scrollen kurz schneller
  ScrollTrigger.create({
    trigger: rows[0].closest('section'),
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => tweens.forEach((t) => (self.isActive ? t.play() : t.pause())),
    onUpdate: (self) => {
      const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 250, 8);
      gsap.to(tweens, {
        timeScale: boost,
        duration: 0.15,
        overwrite: true,
        onComplete: () => gsap.to(tweens, { timeScale: 1, duration: 1.2, ease: 'power2.out', overwrite: true }),
      });
    },
  });
  tweens.forEach((t) => t.pause());
}

/* ----------------------------------------------------------- Instagram -- */

function instagram(desktop) {
  const tiles = $$('.insta__tile');
  if (!tiles.length) return;

  gsap.from(tiles, {
    opacity: 0,
    y: 90,
    duration: 1.4,
    ease: 'expo.out',
    stagger: 0.1,
    scrollTrigger: { trigger: tiles[0].parentElement, start: 'top 85%', once: true },
  });

  if (!desktop) return;
  tiles.forEach((tile, i) => {
    gsap.to($('img', tile), {
      yPercent: i % 2 ? -8 : 8,
      scale: 1.12,
      ease: 'none',
      scrollTrigger: { trigger: tile, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* --------------------------------------------------------- Footer-Logo -- */

function wordmark() {
  const el = $('[data-wordmark]');
  if (!el) return;
  gsap.fromTo(
    el,
    { yPercent: 45, opacity: 0 },
    {
      yPercent: 0,
      opacity: 1,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 85%', scrub: true },
    },
  );
}

/* ------------------------------------------------- Magnetische Buttons -- */

function magnetic() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const offs = $$('[data-magnetic]').map((btn) => {
    const toX = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const toY = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (event) => {
      const rect = btn.getBoundingClientRect();
      toX((event.clientX - rect.left - rect.width / 2) * 0.25);
      toY((event.clientY - rect.top - rect.height / 2) * 0.35);
    };
    const leave = () => {
      toX(0);
      toY(0);
    };
    btn.addEventListener('pointermove', move);
    btn.addEventListener('pointerleave', leave);
    return () => {
      btn.removeEventListener('pointermove', move);
      btn.removeEventListener('pointerleave', leave);
      gsap.set(btn, { x: 0, y: 0 });
    };
  });
  return () => offs.forEach((off) => off());
}
