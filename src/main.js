import { initAnimations } from './js/animations.js';
import { initCalculator } from './js/calculator.js';
import { initCompare } from './js/compare.js';
import { initConsent } from './js/consent.js';
import { initFaq } from './js/faq.js';
import { initNav } from './js/nav.js';
import { initPlaceCheck } from './js/place-check.js';
import { initQuoteForm } from './js/quote-form.js';
import { initServiceDialog } from './js/service-dialog.js';
import { initSmoothScroll } from './js/smooth.js';
import { prefersReducedMotion } from './js/utils.js';

const reduced = prefersReducedMotion();

initSmoothScroll({ reduced });
initNav();
initAnimations({ reduced });
initCompare();
initFaq();
initQuoteForm();
initCalculator();
initPlaceCheck();
initServiceDialog();
initConsent();
