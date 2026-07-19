import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// ─────────────────────────────────────────────────────────────
// PATAGONIA EXPERIENCIAS — cara pública 100% indexable
// Salida: HTML estático puro. Google no necesita ejecutar JS.
// ─────────────────────────────────────────────────────────────
export default defineConfig({
  site: 'https://patagoniaexperiencias.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // El sitemap se regenera solo en cada build, con todas las rutas
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
  build: {
    format: 'directory', // /guias/esquel-trevelin/index.html → URL limpia
  },
});
