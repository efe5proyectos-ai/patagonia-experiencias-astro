import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, existsSync } from 'node:fs';

const SITIO = 'https://patagoniaexperiencias.com';

// ── Sitemap unificado: rutas generadas por Astro + páginas de public/ ──
//
// Cambio 07/08/2026: pasamos de lista negra a LISTA BLANCA.
// Con la lista negra se colaban artefactos internos (-FUENTE, -COMPILADO),
// creativos publicitarios (banner-fauna), previews y hasta un archivo con
// espacio en el nombre que el filtro no matcheaba. Y al mismo tiempo NO
// entraban las guías, porque readdirSync no mira dentro de subcarpetas.
//
// Para agregar una página nueva al sitemap: sumala a la lista de abajo.
// Si no está acá, no se indexa. Es a propósito.

// Páginas sueltas en public/ (sin la extensión .html)
const PAGINAS_PUBLICAS = [
  // Guías de temporada
  'calendario-fauna',
  'que-hacer-patagonia',
  // Landings de destino
  'puerto-madryn',
  'valle-del-chubut',
  'esquel-trevelin',
  'que-comer-patagonia',
  // Institucionales y captación
  'prestadores',
  'sumar-gastronomia',
  'preregistro',
  'preregistrotdf',
  'aike',
  'ecosistema',
  // Legales
  'terminos',
  'privacidad',
];

// Guías de viaje: viven en subcarpetas con index.html, así que readdirSync
// plano nunca las veía. Van explícitas, con barra final.
const GUIAS_DE_VIAJE = [
  'guias-de-viaje/esquel-trevelin/',
  'guias-de-viaje/peninsula-valdes/',
  'guias-de-viaje/valle-del-chubut/',
  'guias-de-viaje/valle-del-chubut/trelew/',
  'guias-de-viaje/valle-del-chubut/gaiman/',
  'guias-de-viaje/valle-del-chubut/dolavon/',
  'guias-de-viaje/valle-del-chubut/rawson/',
  'guias-de-viaje/valle-del-chubut/28-de-julio/',
];

// Sólo publicamos lo que existe en disco: si alguien borra o renombra un
// archivo, no queda una URL muerta en el sitemap.
const existeHtml = (n) => existsSync(`./public/${n}.html`);
const existeIndex = (r) => existsSync(`./public/${r}index.html`);

const paginasPublicas = [
  ...PAGINAS_PUBLICAS.filter(existeHtml).map((n) => `${SITIO}/${n}`),
  ...GUIAS_DE_VIAJE.filter(existeIndex).map((r) => `${SITIO}/${r}`),
];

// Aviso en consola durante el build: si algo de la lista no existe, se ve.
const faltantes = [
  ...PAGINAS_PUBLICAS.filter((n) => !existeHtml(n)),
  ...GUIAS_DE_VIAJE.filter((r) => !existeIndex(r)),
];
if (faltantes.length) {
  console.warn(`[sitemap] no encontrados en public/, se omiten: ${faltantes.join(', ')}`);
}
console.log(`[sitemap] ${paginasPublicas.length} páginas de public/ agregadas`);

export default defineConfig({
  site: SITIO,
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date(), customPages: paginasPublicas })],
  vite: { plugins: [tailwindcss()] },
  build: { format: 'directory' },
});
