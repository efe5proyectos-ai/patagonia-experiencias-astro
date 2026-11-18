#!/usr/bin/env node
/* ===========================================================================
   BARRIDO RENDERIZADO · lo que ve Google, no lo que dice el HTML
   ---------------------------------------------------------------------------
   Por qué existe (pendiente 9b de docs/seo-bitacora.md): en este sitio las
   páginas de public/ montan React sobre #root y, al montar, REEMPLAZAN lo que
   haya adentro. El 17/11 así se descubrió que la home publicaba 16 enlaces
   internos en el HTML y renderizaba 8. Toda auditoría hecha con `curl` es
   ciega a eso: hay que renderizar.

   Uso:
     node scripts/barrido-render.mjs                 # todo el sitemap servido
     node scripts/barrido-render.mjs <url> [<url>…]  # sólo esas
     node scripts/barrido-render.mjs --fallos <url>  # recursos 404 de esa URL

   OJO con el método, aprendido a los golpes:
   - NO usar waitUntil:'networkidle': Firestore y el píxel de Meta dejan
     conexiones abiertas y nunca resuelve. Va 'load' + 3,5 s para que monte React.
   - Las imágenes con lazy-load no se piden hasta que se scrollea, así que
     --fallos subcuenta los 404 de abajo del pliegue.
   - Un enlace .html no está roto: Cloudflare Pages responde 308 y la página
     carga. Lo que cuesta es el salto en cada rastreo.
   =========================================================================== */
// Playwright no está en el node_modules del repo: viene instalado en el
// entorno de la corrida automática. Se prueba primero el paquete normal (por
// si alguien lo instala en el repo) y después la ruta del entorno.
const RUTAS = ['playwright', '/opt/npm-tools/node_modules/playwright/index.js'];
let chromium;
for (const r of RUTAS) {
  try { chromium = (await import(r)).default?.chromium ?? (await import(r)).chromium; } catch {}
  if (chromium) break;
}
if (!chromium) {
  console.error('No encontré Playwright. Probé: ' + RUTAS.join(', '));
  process.exit(1);
}

const UA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const SITIO = 'https://patagoniaexperiencias.com';

const args = process.argv.slice(2);
const soloFallos = args[0] === '--fallos';
let urls = (soloFallos ? args.slice(1) : args).filter((a) => a.startsWith('http'));

if (!urls.length) {
  const xml = await (await fetch(`${SITIO}/sitemap-0.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  console.log(`sitemap: ${urls.length} URLs`);
}

const navegador = await chromium.launch();
const ctx = await navegador.newContext({ userAgent: UA });
const filas = [];

for (const url of urls) {
  const pag = await ctx.newPage();
  const fallos = new Map();
  pag.on('response', (r) => { if (r.status() >= 400) fallos.set(r.url(), r.status()); });
  pag.on('requestfailed', (r) => fallos.set(r.url(), 'failed'));
  let f = { url, fallos: 0 };
  try {
    await pag.goto(url, { waitUntil: 'load', timeout: 45000 });
    await pag.waitForTimeout(3500);
    f = { ...f, ...await pag.evaluate(() => {
      const as = [...document.querySelectorAll('a[href]')];
      const h = (a) => a.getAttribute('href') || '';
      const interno = (a) => (/^(https?:)?\/\//.test(h(a)) ? /patagoniaexperiencias\.com/.test(h(a)) : !!h(a));
      const ints = as.filter(interno);
      return {
        a: as.length,
        ai: ints.length,
        html: ints.filter((a) => /\.html(\?|#|$)/.test(h(a))).length,
        h1: document.querySelectorAll('h1').length,
        ld: document.querySelectorAll('script[type="application/ld+json"]').length,
        hl: document.querySelectorAll('link[rel=alternate][hreflang]').length,
        desc: (document.querySelector('meta[name=description]')?.content || '').length,
        og: document.querySelectorAll('meta[property^="og:"]').length,
        txt: (document.body.innerText || '').replace(/\s+/g, ' ').trim().length,
      };
    }) };
  } catch (e) { f.err = String(e).slice(0, 90); }
  f.fallos = fallos.size;
  if (soloFallos) {
    console.log(`### ${url} → ${fallos.size} recurso(s) que no cargan`);
    for (const [u, s] of fallos) console.log(`    ${s}  ${u}`);
  }
  filas.push(f);
  await pag.close();
}
await navegador.close();

if (soloFallos) process.exit(0);

const corto = (u) => u.replace(SITIO, '') || '/';
console.log('\n' + 'URL'.padEnd(50) + '  a  int html h1 ld hl  og desc   txt  404');
for (const f of filas) {
  if (f.err) { console.log(corto(f.url).padEnd(50), 'ERROR', f.err); continue; }
  console.log(
    corto(f.url).padEnd(50),
    String(f.a).padStart(3), String(f.ai).padStart(3), String(f.html).padStart(4),
    String(f.h1).padStart(2), String(f.ld).padStart(2), String(f.hl).padStart(2),
    String(f.og).padStart(3), String(f.desc).padStart(4), String(f.txt).padStart(6),
    String(f.fallos).padStart(4),
  );
}

// Lo que hay que mirar sí o sí.
const avisos = [];
for (const f of filas) {
  if (f.err) { avisos.push(`${corto(f.url)} · no se pudo renderizar: ${f.err}`); continue; }
  if (f.ai === 0) avisos.push(`${corto(f.url)} · CERO enlaces internos renderizados: callejón sin salida para el rastreador`);
  if (f.html) avisos.push(`${corto(f.url)} · ${f.html} enlace(s) a .html: un 308 por enlace en cada rastreo`);
  if (f.h1 !== 1) avisos.push(`${corto(f.url)} · ${f.h1} h1 (tiene que haber exactamente uno)`);
  if (!f.desc) avisos.push(`${corto(f.url)} · sin meta description`);
  if (!f.og) avisos.push(`${corto(f.url)} · sin Open Graph: al compartirla no muestra tarjeta`);
  if (f.fallos) avisos.push(`${corto(f.url)} · ${f.fallos} recurso(s) que no cargan (correr con --fallos para ver cuáles)`);
}
console.log(`\n### A revisar (${avisos.length})`);
for (const a of avisos) console.log('  - ' + a);
