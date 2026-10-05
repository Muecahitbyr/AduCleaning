/**
 * Zentrale Firmendaten.
 * Alle Werte werden beim Build automatisch in sämtliche Seiten eingesetzt
 * (Platzhalter {{schluessel}} im HTML, siehe vite.config.js).
 *
 * ⚠️  Aktuell MOCKUP-DATEN – vor dem Livegang durch die echten Angaben ersetzen.
 */
export const company = {
  name: 'ADU Cleaning',
  legalName: 'ADU Cleaning – Glas- & Gebäudereinigung',
  owner: 'Max Mustermann',
  street: 'Musterstraße 12',
  zip: '82362',
  city: 'Weilheim i. OB',
  phone: '+49 881 1234567', // internationales Format (für Links)
  phoneDisplay: '0881 / 123 45 67', // Anzeige auf der Website
  whatsapp: '4915112345678', // nur Ziffern, ohne +
  email: 'info@adu-cleaning.de',
  instagram: 'https://www.instagram.com/adu.cleaning/',
  instagramHandle: '@adu.cleaning',
  vatId: 'DE123456789',
  hours: 'Mo – Fr 7:00 – 18:00 · Sa nach Vereinbarung',

  // Impressum: Gebäudereiniger ist ein zulassungsfreies Handwerk
  profession: 'Gebäudereiniger (verliehen in der Bundesrepublik Deutschland)',
  chamber: 'Handwerkskammer für München und Oberbayern, Max-Joseph-Straße 4, 80333 München',

  // Datenschutz: Hosting-Anbieter
  hostName: 'Musterhosting GmbH',
  hostAddress: 'Beispielweg 5, 10115 Berlin',

  // Stand der Rechtstexte
  legalDate: 'Oktober 2026',
};

/**
 * Formular-Versand.
 * - Leer lassen  → das Formular öffnet das E-Mail-Programm mit einer fertig ausgefüllten Anfrage.
 * - Endpoint eintragen (z. B. Formspree, Web3Forms, eigenes PHP-Skript) → Versand per POST (JSON).
 */
export const formEndpoint = '';

/**
 * Preisrechner (Startseite → „Was kostet das?“).
 * ⚠️  MOCKUP-WERTE – mit dem Kunden abstimmen. Alle Preise Privatkunden inkl. MwSt.;
 * für Gewerbekunden wird automatisch der Nettobetrag angezeigt.
 */
export const pricing = {
  perWindow: { standard: 7, gross: 11, bodentief: 14 }, // je Fensterflügel, innen + außen
  outsideOnlyFactor: 0.6, // nur außen
  framesPerWindow: 2.5, // Rahmen & Falze
  hardToReachSurcharge: 0.15, // Obergeschoss / schwer erreichbar
  conservatory: 69, // Wintergarten / Glasdach (pauschal)
  minimum: 59, // Mindestauftrag
  discount: { einmalig: 0, halbjaehrlich: 0.05, quartalsweise: 0.1, monatlich: 0.15 },
  spread: 0.12, // ± Spanne der Schätzung
  vat: 0.19,
};

/**
 * Einsatzgebiet für den Orts-Check (Mittelpunkt = Firmensitz).
 */
export const serviceArea = {
  center: { lat: 47.8394, lng: 11.1428 }, // Weilheim i. OB
  radiusKm: 32, // „Ja, wir kommen“
  extendedKm: 55, // „Nach Absprache“
};
