/**
 * npm run build
 *  1. baut die Website nach ./dist
 *  2. startet danach einen lokalen Server und öffnet die Seite im Browser
 *
 * Auf Hosting-Plattformen (Netlify, Vercel, GitHub Actions …) ist die Umgebungsvariable CI gesetzt –
 * dort wird nur gebaut, damit das Deployment nicht hängen bleibt. Nur bauen: npm run build:only
 */
import { build, preview } from 'vite';

const serve = !process.env.CI && !process.argv.includes('--no-serve');

await build();

if (serve) {
  const server = await preview({ preview: { port: 4173, open: true } });
  console.log('\n  Website läuft – Beenden mit Strg + C\n');
  server.printUrls();
}
