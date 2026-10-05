import { gsap } from 'gsap';
import { company, pricing } from '../config.js';

const euro = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const round5 = (value) => Math.round(value / 5) * 5;

const SIZE_LABEL = { standard: 'Standard', gross: 'Groß', bodentief: 'Bodentief' };
const FREQ_LABEL = { einmalig: 'Einmalig', halbjaehrlich: '2× im Jahr', quartalsweise: '4× im Jahr', monatlich: 'Monatlich' };

/**
 * Preisrechner: berechnet live eine unverbindliche Preisspanne
 * und übergibt die Auswahl auf Wunsch an das Angebotsformular oder WhatsApp.
 */
export function initCalculator() {
  const root = document.querySelector('[data-calc]');
  if (!root) return;

  const $ = (sel) => root.querySelector(sel);
  const range = $('[data-calc-count]');
  const countOut = $('[data-calc-count-out]');
  const lowEl = $('[data-calc-low]');
  const highEl = $('[data-calc-high]');
  const unitEl = $('[data-calc-unit]');
  const savingEl = $('[data-calc-saving]');
  const linesEl = $('[data-calc-lines]');
  const cta = $('[data-calc-cta]');
  const wa = $('[data-calc-wa]');
  const live = $('[data-calc-live]');
  const shown = { low: 0, high: 0 };
  let current = null;

  const value = (name) => root.querySelector(`[name="${name}"]:checked`)?.value;
  const checked = (name) => root.querySelector(`[name="${name}"]`).checked;

  const read = () => ({
    type: value('calc-type'),
    count: Number(range.value),
    size: value('calc-size'),
    scope: value('calc-scope'),
    frames: checked('calc-frames'),
    conservatory: checked('calc-conservatory'),
    hard: checked('calc-hard'),
    frequency: value('calc-frequency'),
  });

  function compute(s) {
    const net = s.type === 'Gewerbe';
    const factor = net ? 1 / (1 + pricing.vat) : 1;
    const scope = s.scope === 'aussen' ? pricing.outsideOnlyFactor : 1;
    const lines = [];

    const windows = s.count * pricing.perWindow[s.size] * scope;
    lines.push([`${s.count} Fensterflügel · ${SIZE_LABEL[s.size]}${s.scope === 'aussen' ? ' · nur außen' : ''}`, windows]);

    let subtotal = windows;
    if (s.frames) {
      const frames = s.count * pricing.framesPerWindow * scope;
      lines.push(['Rahmen & Falze', frames]);
      subtotal += frames;
    }
    if (s.conservatory) {
      lines.push(['Wintergarten / Glasdach', pricing.conservatory]);
      subtotal += pricing.conservatory;
    }
    if (s.hard) {
      const surcharge = subtotal * pricing.hardToReachSurcharge;
      lines.push(['Zuschlag schwer erreichbar', surcharge]);
      subtotal += surcharge;
    }
    if (subtotal < pricing.minimum) {
      lines.push(['Aufrundung auf Mindestauftrag', pricing.minimum - subtotal]);
      subtotal = pricing.minimum;
    }

    const rate = pricing.discount[s.frequency] || 0;
    const discount = subtotal * rate;
    if (discount) lines.push([`Rabatt ${FREQ_LABEL[s.frequency]}`, -discount]);
    const total = (subtotal - discount) * factor;

    return {
      low: round5(total * (1 - pricing.spread)),
      high: round5(total * (1 + pricing.spread)),
      lines: lines.map(([label, amount]) => [label, amount * factor]),
      rate,
      net,
    };
  }

  function summary(s, r) {
    return [
      `Preisrechner-Auswahl (${s.type}):`,
      `• ${s.count} Fensterflügel, überwiegend ${SIZE_LABEL[s.size]}, ${s.scope === 'aussen' ? 'nur außen' : 'innen & außen'}`,
      s.frames ? '• inkl. Rahmen & Falze' : null,
      s.conservatory ? '• Wintergarten / Glasdach' : null,
      s.hard ? '• Obergeschoss / schwer erreichbar' : null,
      `• Häufigkeit: ${FREQ_LABEL[s.frequency]}`,
      `Geschätzt: ca. ${r.low}–${r.high} € ${r.net ? 'netto' : 'inkl. MwSt.'} pro Reinigung`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  function render() {
    const s = read();
    const r = compute(s);
    current = { s, r };

    countOut.textContent = s.count >= Number(range.max) ? `${range.max}+` : s.count;
    range.style.setProperty('--fill', `${((s.count - range.min) / (range.max - range.min)) * 100}%`);

    gsap.to(shown, {
      low: r.low,
      high: r.high,
      duration: 0.6,
      ease: 'power3.out',
      overwrite: true,
      onUpdate: () => {
        lowEl.textContent = euro.format(Math.round(shown.low));
        highEl.textContent = euro.format(Math.round(shown.high));
      },
    });

    if (live) live.textContent = `ca. ${euro.format(r.low)}–${euro.format(r.high)} €`;
    unitEl.textContent = `pro Reinigung · ${r.net ? 'netto, zzgl. MwSt.' : 'inkl. MwSt.'}`;
    savingEl.hidden = !r.rate;
    if (r.rate) savingEl.textContent = `Sie sparen ${Math.round(r.rate * 100)} % im festen Rhythmus`;

    linesEl.innerHTML = r.lines
      .map(
        ([label, amount]) =>
          `<li><span>${label}</span><span>${amount < 0 ? '−' : ''}${euro.format(Math.abs(Math.round(amount)))} €</span></li>`,
      )
      .join('');

    wa.href = `https://wa.me/${company.whatsapp}?text=${encodeURIComponent(`Hallo ADU Cleaning,\n\n${summary(s, r)}\n\nIch freue mich auf Ihr Festpreis-Angebot.`)}`;
  }

  // Plus / Minus
  const step = (delta) => {
    range.value = String(Math.min(Number(range.max), Math.max(Number(range.min), Number(range.value) + delta)));
    render();
  };
  $('[data-calc-minus]').addEventListener('click', () => step(-1));
  $('[data-calc-plus]').addEventListener('click', () => step(1));

  root.addEventListener('input', render);
  root.addEventListener('change', render);

  // Auswahl ins Angebotsformular übernehmen
  cta.addEventListener('click', () => {
    const { s, r } = current;
    const leistungen = ['Fensterreinigung'];
    if (s.conservatory) leistungen.push('Wintergarten & Glasdach');
    window.dispatchEvent(
      new CustomEvent('quote:prefill', {
        detail: { objektart: s.type, leistungen, umfang: s.count, nachricht: summary(s, r) },
      }),
    );
  });

  render();
}
