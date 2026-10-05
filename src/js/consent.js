/**
 * Cookie- / Einwilligungs-Banner (DSGVO & TDDDG).
 *
 * - „Alle akzeptieren“ und „Nur notwendige“ sind gleichwertig erreichbar.
 * - Die Auswahl wird in localStorage gespeichert und kann jederzeit über
 *   Elemente mit [data-consent-open] (z. B. im Footer) geändert werden.
 * - Optionale Skripte werden erst nach Einwilligung aktiviert:
 *     <script type="text/plain" data-consent="statistik" src="…"></script>
 * - Abfrage im Code:  window.aduConsent.has('statistik')
 *   Ereignis bei Änderung:  window.addEventListener('consent:change', (e) => e.detail)
 */

const STORAGE_KEY = 'adu-consent';
const VERSION = 1; // erhöhen, wenn neue Dienste hinzukommen → Banner erscheint erneut

const CATEGORIES = [
  {
    id: 'notwendig',
    title: 'Notwendig',
    text: 'Speichert Ihre Datenschutz-Auswahl. Ohne diese Speicherung funktioniert die Website nicht wie vorgesehen.',
    required: true,
  },
  {
    id: 'statistik',
    title: 'Statistik',
    text: 'Hilft uns anonym zu verstehen, wie Besucher die Website nutzen, um sie zu verbessern.',
  },
  {
    id: 'medien',
    title: 'Externe Medien',
    text: 'Erlaubt das Laden von Inhalten externer Plattformen, z. B. Karten oder Videos.',
  },
];

const read = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return value?.version === VERSION ? value : null;
  } catch {
    return null;
  }
};

const write = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* privater Modus o. Ä. – Auswahl gilt dann nur für diesen Seitenaufruf */
  }
};

let state = read();

/** Aktiviert zurückgehaltene Skripte, für die eine Einwilligung vorliegt. */
function activateScripts() {
  document.querySelectorAll('script[type="text/plain"][data-consent]').forEach((placeholder) => {
    if (!state?.[placeholder.dataset.consent]) return;
    const script = document.createElement('script');
    [...placeholder.attributes].forEach(({ name, value }) => {
      if (name !== 'type' && name !== 'data-consent') script.setAttribute(name, value);
    });
    script.textContent = placeholder.textContent;
    placeholder.replaceWith(script);
  });
}

function apply(choices) {
  state = { version: VERSION, date: new Date().toISOString(), notwendig: true, ...choices };
  write(state);
  activateScripts();
  window.dispatchEvent(new CustomEvent('consent:change', { detail: state }));
}

export function initConsent() {
  window.aduConsent = { has: (category) => Boolean(state?.[category]), get: () => state };

  const banner = document.createElement('section');
  banner.className = 'cookie';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'consent-title');
  banner.setAttribute('aria-describedby', 'consent-text');
  banner.hidden = true;
  banner.innerHTML = `
    <div class="cookie__card">
      <div class="cookie__head">
        <span class="cookie__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>
        </span>
        <h2 id="consent-title">Ihre Privatsphäre</h2>
      </div>
      <p id="consent-text">
        Wir verwenden nur technisch notwendige Speicherungen. Optionale Dienste nutzen wir ausschließlich mit Ihrer
        Einwilligung, die Sie jederzeit widerrufen können. Mehr in der
        <a href="/datenschutz.html">Datenschutzerklärung</a> · <a href="/impressum.html">Impressum</a>.
      </p>

      <div class="cookie__settings" data-consent-settings hidden>
        ${CATEGORIES.map(
          (c) => `
          <label class="cookie__option">
            <span>
              <strong>${c.title}${c.required ? ' <em>immer aktiv</em>' : ''}</strong>
              <small>${c.text}</small>
            </span>
            <input class="switch" type="checkbox" role="switch" name="${c.id}" ${c.required ? 'checked disabled' : ''} />
          </label>`,
        ).join('')}
      </div>

      <div class="cookie__actions">
        <button type="button" class="cookie__btn" data-consent-action="necessary">Nur notwendige</button>
        <button type="button" class="cookie__btn cookie__btn--primary" data-consent-action="all">Alle akzeptieren</button>
      </div>
      <button type="button" class="cookie__more" data-consent-action="toggle" aria-expanded="false">Einstellungen anpassen</button>
      <button type="button" class="cookie__btn cookie__btn--save" data-consent-action="save" hidden>Auswahl speichern</button>
    </div>`;
  document.body.appendChild(banner);

  const settings = banner.querySelector('[data-consent-settings]');
  const toggleBtn = banner.querySelector('[data-consent-action="toggle"]');
  const saveBtn = banner.querySelector('[data-consent-action="save"]');
  const boxes = [...settings.querySelectorAll('input:not([disabled])')];

  const open = ({ withSettings = false, focus = false } = {}) => {
    boxes.forEach((box) => (box.checked = Boolean(state?.[box.name])));
    showSettings(withSettings);
    banner.hidden = false;
    document.documentElement.classList.add('consent-open');
    requestAnimationFrame(() => banner.classList.add('is-visible'));
    if (focus) banner.querySelector('button').focus();
  };

  const close = () => {
    banner.classList.remove('is-visible');
    document.documentElement.classList.remove('consent-open');
    setTimeout(() => (banner.hidden = true), 500);
  };

  function showSettings(show) {
    settings.hidden = !show;
    saveBtn.hidden = !show;
    toggleBtn.hidden = show;
    toggleBtn.setAttribute('aria-expanded', String(show));
  }

  banner.addEventListener('click', (event) => {
    const action = event.target.closest('[data-consent-action]')?.dataset.consentAction;
    if (!action) return;
    if (action === 'toggle') return showSettings(true);

    const choices = Object.fromEntries(
      boxes.map((box) => [box.name, action === 'all' ? true : action === 'save' ? box.checked : false]),
    );
    apply(choices);
    close();
  });

  document.querySelectorAll('[data-consent-open]').forEach((trigger) =>
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      open({ withSettings: true, focus: true });
    }),
  );

  if (state) activateScripts();
  else setTimeout(() => open(), 900);
}
