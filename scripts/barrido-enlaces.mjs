#!/usr/bin/env node
// Barrido de enlaces internos sobre el `dist` compilado.
//
// Recorre todos los HTML de `dist`, resuelve cada href/src interno contra el
// árbol compilado y lista los que no existen. Nació el 13/11/2026, cuando
// encontró 17 enlaces muertos en las tres landings en español, y hasta el
// 14/11 vivía fuera del repo: cada corrida lo volvía a escribir. Queda acá.
//
// OJO con dos cosas, las dos aprendidas a los golpes:
//  1. El chequeo NO conoce `public/_redirects`, así que todo lo que marque
//     hay que contrastarlo con un `curl` contra producción antes de tocarlo.
//  2. Los artefactos de Cloudflare (`/cdn-cgi/…`) existen en producción y no
//     en el `dist`: se ignoran acá abajo.
//
// Uso: DATOS_LOCALES=1 npx astro build && node scripts/barrido-enlaces.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = resolve(process.argv[2] || 'dist');
const IGNORAR = [/^\/cdn-cgi\//, /^\/\//];

function htmls(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? htmls(p) : n.endsWith('.html') ? [p] : [];
  });
}

// Una ruta existe si está el archivo, o el index.html de la carpeta, o el
// mismo nombre con .html (así se sirven las páginas de `public/`).
const existe = (ruta) => {
  const base = join(DIST, decodeURIComponent(ruta));
  return existsSync(base) && statSync(base).isFile()
    || existsSync(join(base, 'index.html'))
    || existsSync(`${base}.html`);
};

const archivos = htmls(DIST);
let roto = 0;
for (const f of archivos) {
  const html = readFileSync(f, 'utf8');
  const refs = new Set(
    [...html.matchAll(/(?:href|src)\s*=\s*"(\/[^"#?]*)/g)].map((m) => m[1]),
  );
  for (const r of refs) {
    if (r === '/' || IGNORAR.some((re) => re.test(r))) continue;
    if (!existe(r.replace(/\/$/, ''))) {
      console.log(`${f.slice(DIST.length) || '/'}  →  ${r}`);
      roto++;
    }
  }
}
console.log(`\n${archivos.length} HTML revisados · ${roto} enlace(s) a verificar con curl`);
