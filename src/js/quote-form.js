import { company, formEndpoint } from '../config.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Zweistufiges Angebotsformular mit Validierung und Versand (Endpoint oder E-Mail-Programm). */
export function initQuoteForm() {
  const form = document.querySelector('[data-quote]');
  if (!form) return;

  const steps = [...form.querySelectorAll('[data-step]')];
  const bar = form.querySelector('[data-quote-bar]');
  const stepLabel = form.querySelector('[data-quote-step]');
  const done = form.querySelector('[data-done]');
  const doneText = form.querySelector('[data-done-text]');
  const submitBtn = form.querySelector('[type="submit"]');

  /* ---- Schritte ---- */
  const goTo = (index) => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
    bar.style.width = `${((index + 1) / steps.length) * 100}%`;
    stepLabel.textContent = `Schritt ${index + 1} von ${steps.length}`;
    const firstInput = steps[index].querySelector('input:not([type="radio"]):not([type="checkbox"]), textarea');
    if (index > 0) firstInput?.focus({ preventScroll: true });
    window.dispatchEvent(new Event('layout:change'));
  };

  form.querySelector('[data-next]').addEventListener('click', () => {
    if (validateStep1()) goTo(1);
  });
  form.querySelector('[data-prev]').addEventListener('click', () => goTo(0));

  /* ---- Schieberegler ---- */
  const range = form.querySelector('[data-range]');
  const rangeOut = form.querySelector('[data-range-out]');
  const syncRange = () => {
    const max = Number(range.max);
    rangeOut.textContent = Number(range.value) >= max ? `${max}+` : range.value;
    range.style.setProperty('--fill', `${((range.value - range.min) / (range.max - range.min)) * 100}%`);
  };
  range.addEventListener('input', syncRange);
  syncRange();

  /* ---- Vorauswahl über Links auf der Seite (auch für später erzeugte Elemente) ---- */
  const selectService = (service) => {
    const box = form.querySelector(`input[name="leistungen"][value="${CSS.escape(service)}"]`);
    if (box) box.checked = true;
    clearError('leistungen');
  };
  const selectType = (type) => {
    const radio = form.querySelector(`input[name="objektart"][value="${CSS.escape(type)}"]`);
    if (radio) radio.checked = true;
  };

  document.addEventListener('click', (event) => {
    const service = event.target.closest('[data-service]');
    if (service) selectService(service.dataset.service);
    const audience = event.target.closest('[data-audience]');
    if (audience) selectType(audience.dataset.audience);
  });

  // Übergabe aus Preisrechner und Orts-Check
  window.addEventListener('quote:prefill', ({ detail }) => {
    if (detail.objektart) selectType(detail.objektart);
    detail.leistungen?.forEach(selectService);
    if (detail.umfang) {
      range.value = String(Math.min(Number(range.max), detail.umfang));
      syncRange();
    }
    if (detail.ort) form.elements.ort.value = detail.ort;
    if (detail.nachricht) form.elements.nachricht.value = detail.nachricht;
    goTo(0);
  });

  /* ---- Validierung ---- */
  function showError(name, show = true) {
    const error = form.querySelector(`[data-error="${name}"]`);
    error?.classList.toggle('is-shown', show);
    error?.closest('.field')?.classList.toggle('has-error', show);
    return !show;
  }
  const clearError = (name) => showError(name, false);

  function validateStep1() {
    const ok = form.querySelectorAll('input[name="leistungen"]:checked').length > 0;
    return showError('leistungen', !ok);
  }

  function validateStep2() {
    const data = new FormData(form);
    const results = [
      showError('name', !String(data.get('name')).trim()),
      showError('telefon', String(data.get('telefon')).replace(/\D/g, '').length < 6),
      showError('email', !!String(data.get('email')).trim() && !EMAIL_RE.test(String(data.get('email')).trim())),
      showError('datenschutz', !data.get('datenschutz')),
    ];
    const firstInvalid = form.querySelector('.is-shown')?.closest('.field, .consent')?.querySelector('input, textarea');
    firstInvalid?.focus();
    return results.every(Boolean);
  }

  form.addEventListener('input', (event) => {
    const { name } = event.target;
    if (name) clearError(name);
  });

  /* ---- Versand ---- */
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!validateStep1()) return goTo(0);
    if (!validateStep2()) return;

    const data = new FormData(form);
    if (data.get('website')) return finish(); // Honeypot: Bots stillschweigend ignorieren

    const payload = {
      objektart: data.get('objektart'),
      leistungen: data.getAll('leistungen').join(', '),
      umfang: rangeOut.textContent,
      ort: data.get('ort'),
      termin: data.get('termin'),
      name: data.get('name'),
      telefon: data.get('telefon'),
      email: data.get('email'),
      nachricht: data.get('nachricht'),
    };

    if (formEndpoint) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Wird gesendet …';
      try {
        const res = await fetch(formEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(res.statusText);
        return finish();
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Angebot anfordern';
        // Fallback: E-Mail-Programm öffnen, damit keine Anfrage verloren geht
      }
    }

    openMail(payload);
    finish(
      'Ihr E-Mail-Programm wurde mit Ihrer Anfrage geöffnet. Bitte senden Sie die Nachricht ab – wir melden uns innerhalb von 24 Stunden.',
    );
  });

  function openMail(p) {
    const subject = `Angebotsanfrage (${p.objektart}) – ${p.name}`;
    const body = [
      'Hallo ADU Cleaning,',
      '',
      'ich interessiere mich für ein Angebot:',
      '',
      `Objektart: ${p.objektart}`,
      `Leistungen: ${p.leistungen}`,
      `Anzahl Fenster/Glasflächen (ca.): ${p.umfang}`,
      `PLZ / Ort: ${p.ort || '–'}`,
      `Wunschtermin: ${p.termin}`,
      '',
      `Name: ${p.name}`,
      `Telefon: ${p.telefon}`,
      `E-Mail: ${p.email || '–'}`,
      '',
      p.nachricht ? `Nachricht:\n${p.nachricht}` : '',
    ].join('\n');
    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function finish(message) {
    steps.forEach((step) => step.classList.remove('is-active'));
    form.querySelector('.quote__step-label').hidden = true;
    bar.style.width = '100%';
    if (message) doneText.textContent = message;
    done.hidden = false;
    window.dispatchEvent(new Event('layout:change'));
  }
}
