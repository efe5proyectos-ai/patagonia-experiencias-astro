import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://patagoniaexperiencias.com',
  output: 'static',
  trailingSlash: 'always',
  integrations: [sitemap({ changefreq: 'weekly', lastmod: new Date() })],
  vite: { plugins: [tailwindcss()] },
  build: { format: 'directory' },
});
