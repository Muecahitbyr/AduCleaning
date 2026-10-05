import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { defineConfig } from 'vite';

const configFile = resolve(__dirname, 'src/config.js');

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Ersetzt {{schluessel}} in allen HTML-Seiten durch die Werte aus src/config.js.
 * So stehen Telefonnummer, E-Mail usw. schon im ausgelieferten HTML (gut für SEO)
 * und müssen trotzdem nur an einer Stelle gepflegt werden.
 */
function injectCompany() {
  return {
    name: 'inject-company',
    async transformIndexHtml(html) {
      const { company } = await import(`${pathToFileURL(configFile).href}?t=${Date.now()}`);
      const values = {
        ...company,
        phoneHref: company.phone.replace(/[^+\d]/g, ''),
        year: new Date().getFullYear(),
      };
      return html.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) =>
        key in values ? escapeHtml(values[key]) : match,
      );
    },
    handleHotUpdate({ file, server }) {
      if (file === configFile) server.ws.send({ type: 'full-reload' });
    },
  };
}

export default defineConfig({
  plugins: [injectCompany()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        impressum: resolve(__dirname, 'impressum.html'),
        datenschutz: resolve(__dirname, 'datenschutz.html'),
        agb: resolve(__dirname, 'agb.html'),
      },
    },
  },
});
