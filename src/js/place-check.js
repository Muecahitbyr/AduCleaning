import { serviceArea } from '../config.js';
import { places } from './data/places.js';

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim();

/** Luftlinie in km (Haversine) */
function distanceKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

const index = places.map(([name, zip, lat, lng]) => ({ name, zip, lat, lng, key: normalize(name) }));

/**
 * Orts-Check: PLZ oder Ort eingeben → sofortige Antwort, ob wir dorthin kommen.
 * Zugängliche Combobox mit Pfeiltasten-Navigation.
 */
export function initPlaceCheck() {
  const root = document.querySelector('[data-placecheck]');
  if (!root) return;

  const input = root.querySelector('input');
  const list = root.querySelector('[role="listbox"]');
  const result = root.querySelector('[data-place-result]');
  const go = root.querySelector('[data-place-go]');
  let matches = [];
  let active = -1;

  function search(query) {
    const q = normalize(query);
    if (!q) return [];
    if (/^\d+$/.test(q)) return index.filter((p) => p.zip.startsWith(q)).slice(0, 6);
    return index
      .filter((p) => p.key.includes(q))
      .sort((a, b) => a.key.indexOf(q) - b.key.indexOf(q))
      .slice(0, 6);
  }

  function setActive(i) {
    active = i;
    [...list.children].forEach((li, n) => li.setAttribute('aria-selected', String(n === i)));
    input.setAttribute('aria-activedescendant', i >= 0 ? `place-opt-${i}` : '');
  }

  function openList() {
    matches = search(input.value);
    list.innerHTML = matches
      .map((p, i) => `<li id="place-opt-${i}" role="option" aria-selected="false" data-i="${i}"><b>${p.name}</b><span>${p.zip}</span></li>`)
      .join('');
    const show = matches.length > 0 && input.value.trim().length > 0;
    list.hidden = !show;
    input.setAttribute('aria-expanded', String(show));
    setActive(-1);
  }

  function closeList() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  function show(place, rawQuery) {
    closeList();
    let html;
    let state;

    if (place) {
      input.value = place.name;
      const km = Math.round(distanceKm(serviceArea.center, place));
      if (km <= serviceArea.radiusKm) {
        state = 'yes';
        html = `<strong>Ja, wir kommen zu Ihnen!</strong><span>${place.name} liegt mitten in unserem Einsatzgebiet – ca. ${km} km von Weilheim.</span>`;
      } else if (km <= serviceArea.extendedKm) {
        state = 'maybe';
        html = `<strong>Gerne – nach Absprache.</strong><span>${place.name} ist ca. ${km} km entfernt. Für regelmäßige oder größere Aufträge kommen wir gerne zu Ihnen.</span>`;
      } else {
        state = 'ask';
        html = `<strong>Sprechen Sie uns an.</strong><span>${place.name} liegt ca. ${km} km entfernt. Wir prüfen gerne, ob sich eine Lösung findet.</span>`;
      }
    } else {
      const zip = rawQuery.trim();
      state = /^(82|86)\d{3}$/.test(zip) ? 'maybe' : 'ask';
      html =
        state === 'maybe'
          ? `<strong>Sehr wahrscheinlich!</strong><span>PLZ ${zip} liegt in unserer Region. Fragen Sie einfach an – wir bestätigen es sofort.</span>`
          : `<strong>Wir prüfen das gerne.</strong><span>Diesen Ort kennen wir noch nicht. Schicken Sie uns eine kurze Anfrage.</span>`;
    }

    const ort = place ? `${place.zip} ${place.name}` : rawQuery.trim();
    result.className = `placecheck__result is-${state}`;
    result.innerHTML = `
      <span class="placecheck__badge" aria-hidden="true"></span>
      <div>${html}</div>
      <a class="btn btn--sm ${state === 'yes' ? 'btn--primary' : 'btn--glass'}" href="#kontakt" data-place-cta>Jetzt anfragen</a>`;
    result.hidden = false;
    result.querySelector('[data-place-cta]').addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('quote:prefill', { detail: { ort } }));
    });
    window.dispatchEvent(new Event('layout:change'));
  }

  function submit() {
    if (!input.value.trim()) return input.focus();
    const exact = index.find((p) => p.key === normalize(input.value) || p.zip === input.value.trim());
    show(active >= 0 ? matches[active] : exact || (matches.length === 1 ? matches[0] : null), input.value);
  }

  input.addEventListener('input', openList);
  input.addEventListener('focus', () => input.value && openList());
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && matches.length) {
      event.preventDefault();
      setActive((active + 1) % matches.length);
    } else if (event.key === 'ArrowUp' && matches.length) {
      event.preventDefault();
      setActive((active - 1 + matches.length) % matches.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    } else if (event.key === 'Escape') {
      closeList();
    }
  });
  list.addEventListener('pointerdown', (event) => {
    const li = event.target.closest('li');
    if (!li) return;
    event.preventDefault();
    show(matches[Number(li.dataset.i)], input.value);
  });
  go.addEventListener('click', submit);
  document.addEventListener('click', (event) => !root.contains(event.target) && closeList());
}
