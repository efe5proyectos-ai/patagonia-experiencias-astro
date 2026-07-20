import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync } from 'node:fs';

// ── Sitemap unificado: rutas generadas + páginas históricas de public/ ──
const NO_INDEXAR = new Set([
  'index', 'patagonia-experiencias', // la app: la vidriera indexable es /experiencias/
  'admin-master', 'dashboard-prestadores', 'estadisticas-aike', 'generador', 'generador-destinos',
  'pago-confirmado', 'pago-pendiente', 'pago-rechazado',
  'email-bienvenida-prestador', 'verificar-paginas', 'guia-confirmada',
  'billetera-turista', 'qr-puntos', 'manual-prestador',
]);
let paginasPublicas = [];
try {
  paginasPublicas = readdirSync('./public')
    .filter((f) => f.endsWith('.html'))
    .map((f) => f.replace(/\.html$/, ''))
    .filter((n) => !NO_INDEXAR.has(n) && !/\d{3,}$/.test(n)) // excluye backups tipo footer1507
    .map((n) => `https://patagoniaexperiencias.com/${n}`);
} catch {}

export default defineConfig({
  site: 'https://patagoniaexperiencias.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date(), customPages: paginasPublicas })],
  vite: { plugins: [tailwindcss()] },
  build: { format: 'directory' },
});
