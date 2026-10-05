# ADU Cleaning – Website

Website für **ADU Cleaning – Glas- & Gebäudereinigung** im Umkreis Weilheim-Schongau.
Gebaut mit [Vite](https://vitejs.dev), [GSAP](https://gsap.com) (ScrollTrigger + SplitText) und
[Lenis](https://lenis.darkroom.engineering) für weiches Scrollen.

## Schnellstart

```bash
npm install
npm run build        # baut die Website nach ./dist UND startet sie direkt im Browser (http://localhost:4173)
npm start            # dasselbe wie npm run build
npm run dev          # Entwicklungsserver mit Live-Reload (http://localhost:5173)
npm run build:only   # nur bauen, ohne Server
npm run photos       # Fotos neu optimieren (nach Austausch in scripts/src-photos/)
```

Auf Hosting-Plattformen (Netlify, Vercel, GitHub Actions – erkennbar an der Variable `CI`) baut `npm run build`
automatisch nur, ohne Server zu starten. Den Inhalt von `dist/` auf einen beliebigen Webspace hochladen – fertig.

> `dist/index.html` nicht per Doppelklick öffnen – Browser blockieren Skripte über `file://`. Immer über
> `npm run build` bzw. einen Webserver aufrufen.

## Vor dem Livegang (Checkliste)

1. **Firmendaten** in [`src/config.js`](src/config.js) eintragen – aktuell stehen dort **Mockup-Daten**
   (Max Mustermann, Musterstraße 12, Musterhosting GmbH …).
2. **Domain** anpassen: `https://www.adu-cleaning.de` steht in `index.html` (canonical, Open Graph, JSON-LD),
   `public/robots.txt` und `public/sitemap.xml`.
3. **Formular-Versand**: Standardmäßig öffnet das Formular das E-Mail-Programm des Besuchers mit einer fertig
   ausgefüllten Anfrage. Für echten Versand im Hintergrund in `src/config.js` einen `formEndpoint` eintragen
   (z. B. [Formspree](https://formspree.io) oder [Web3Forms](https://web3forms.com)).
4. **Aussagen prüfen** (mit dem Kunden abstimmen): Leistungen, „Antwort in 24 h“, „0 € Angebot“, „Festpreis“,
   „Streifenfrei-Garantie“, Orte im Einsatzgebiet, FAQ-Antworten.
5. **Impressum, Datenschutz & AGB** sind ausformulierte Muster – vor dem Livegang rechtlich prüfen lassen.
6. **Fotos**: Aktuell Stockfotos von Pexels (siehe unten). Eigene Fotos des Kunden wirken noch glaubwürdiger –
   einfach gleichnamig in `scripts/src-photos/` ablegen (JPG, mind. 2200 px breit) und `npm run photos` ausführen.

## Interaktive Funktionen

| Funktion | Was sie tut | Anpassen in |
| --- | --- | --- |
| **Preisrechner** | Fensteranzahl, Größe, Umfang, Extras und Rhythmus wählen → live berechnete Preisspanne. „Festpreis anfragen“ füllt das Formular vor, „Per WhatsApp senden“ öffnet WhatsApp mit fertiger Nachricht. | `pricing` in `src/config.js` (**Mockup-Preise!**) |
| **Orts-Check** | PLZ oder Ort eingeben (mit Vorschlägen und Pfeiltasten) → „Ja, wir kommen“ / „nach Absprache“ inkl. Entfernung. | `serviceArea` in `src/config.js`, Orte in `src/js/data/places.js` |
| **Leistungs-Details** | „+“ auf jeder Leistungskarte öffnet ein Detailfenster (Leistungsumfang, ideal für, Direktanfrage). | `src/js/data/services.js` |
| **Formular-Vorbelegung** | Jede „Anfragen“-Schaltfläche wählt Leistung, Objektart, Ort bzw. Fensteranzahl im Formular vor. | – |
| **Vorher/Nachher-Regler** | Ziehen, Tippen oder per Tastatur. | – |

## Responsive

Getestet auf 320 × 568, 390 × 844, 844 × 390 (Handy quer), 768 × 1024, 1024 × 768, 1366 × 768, 1920 × 1080
und 2560 × 1440: kein seitliches Verschieben, Pin-Szenen nur bei genug Bildschirmhöhe (sonst Wisch-Karussell),
eigene Anpassungen für kleine Handys, Querformat und große Monitore (`src/styles/responsive.css`).

## Animationen (Überblick)

| Sektion | Effekt |
| --- | --- |
| Hero | Intro: Bild zoomt heraus, Headline fährt zeilenweise aus einer Maske, Lichtreflex gleitet über das Glas. Beim Scrollen schrumpft das Vollbild zu einer abgerundeten Karte. |
| Statement | Text leuchtet Wort für Wort auf, gekoppelt an die Scrollposition. |
| „Streifenfrei.“ | Gepinnte Szene: kleines Bild öffnet sich zum Vollbild, danach erscheint die Botschaft. |
| Leistungen | Horizontal scrollende Galerie (Desktop) mit Tiefen-Parallax in den Bildern und Fortschrittsbalken. Auf dem Handy: Wisch-Karussell. |
| Vorher/Nachher | Bild-Reveal, verschiebbarer Regler mit kurzer Hinweis-Animation. |
| Versprechen | Zähler, Linien zeichnen sich, gestaffeltes Einblenden. |
| Ablauf | Fortschrittslinie füllt sich, Schritte werden aktiv. |
| Region | Parallax-Hintergrund, Laufband mit Ortsnamen (wird beim schnellen Scrollen schneller). |
| Überall | Headlines zeilenweise, weiches Scrollen, magnetische Buttons (Desktop), Footer-Schriftzug. |

„Bewegung reduzieren“ (Systemeinstellung) schaltet alle Animationen und das weiche Scrollen ab.

## Projektstruktur

```
├── index.html               Startseite
├── impressum.html · datenschutz.html · agb.html
├── vite.config.js           Build + Plugin, das {{platzhalter}} aus src/config.js ersetzt
├── public/
│   ├── images/photos/       optimierte WebP-Fotos (800/1400/2200 px) + Schmutz-Textur
│   └── images/instagram/    Instagram-Vorschaubilder
├── scripts/
│   ├── build.mjs            npm run build: bauen + lokalen Server starten
│   ├── optimize-photos.py   npm run photos: WebP-Varianten erzeugen
│   └── src-photos/          Original-Fotos
└── src/
    ├── config.js            ← Firmendaten & Formular-Endpoint
    ├── main.js · legal.js   JavaScript-Einstiege
    ├── styles/
    │   ├── main.css         CSS-Einstieg Startseite (wird im <head> verlinkt)
    │   ├── legal-page.css   CSS-Einstieg Rechtsseiten
    │   └── base · components · sections · interactive · responsive · consent · legal
    └── js/
        ├── animations.js    alle GSAP-Scroll- und Intro-Animationen
        ├── smooth.js        Lenis (weiches Scrollen) + Anker-Links
        ├── calculator.js    Preisrechner
        ├── place-check.js   Orts-Check (PLZ/Ort → Einsatzgebiet)
        ├── service-dialog.js Leistungs-Detailfenster
        ├── data/            Orte (places.js) und Leistungsdetails (services.js)
        ├── consent.js       Cookie-Banner
        ├── nav.js           Navigation (hell/dunkel, ausblenden beim Scrollen), Mobile-Menü, CTA-Leiste
        ├── compare.js · faq.js · quote-form.js · utils.js
```

## Technische Hinweise

- **Performance:** CSS wird direkt im `<head>` geladen (kein Aufblitzen ohne Styles), Hero-Bild per `preload`,
  alle anderen Bilder lazy und responsiv (`srcset`). Animationen nutzen nur `transform`, `opacity` und
  `clip-path` – keine teuren Live-Filter.
- **DSGVO-freundlich:** kein Tracking, keine externen Fonts/CDNs. Inter wird lokal mitgeliefert; auf
  Apple-Geräten wird SF Pro verwendet.
- **Cookie-Banner:** Kategorien Notwendig / Statistik / Externe Medien, „Nur notwendige“ und „Alle akzeptieren“
  gleichwertig, jederzeit über „Cookie-Einstellungen“ im Footer änderbar. Optionale Skripte so einbinden:
  `<script type="text/plain" data-consent="statistik" src="…"></script>`
- **SEO:** Meta-Tags, Open-Graph-Bild, strukturierte Daten (`HousekeepingService`), Sitemap.

## Bildnachweise

Alle Fotos stammen von [Pexels](https://www.pexels.com) und stehen unter der
[Pexels-Lizenz](https://www.pexels.com/license/) (kostenlos, kommerzielle Nutzung erlaubt, keine Namensnennung
nötig). Pexels-IDs: hero 30650521 · detail 4239145 · fenster 713297 · fassade 4767875 · wohnraum 9989504 ·
unterhalt 3801167 · eingang 6794929 · bauend 6197111 · privat 28729467 · gewerbe 9847049 · vergleich 5982764 ·
region 29825311 · kontakt 2736843.
