// ─────────────────────────────────────────────────────────────
// IndexNow: avisa a Bing, Yandex, DuckDuckGo, Naver y Seznam que
// una URL es nueva o cambió. No sirve para Google (Google solo
// toma sitemaps y Search Console).
//
// Uso:
//   node scripts/indexnow.mjs            → manda todo el sitemap
//   node scripts/indexnow.mjs /pt-br/    → solo las URLs que empiecen así
//
// La clave vive en public/<clave>.txt y tiene que estar publicada
// antes de avisar, porque el buscador la va a ir a leer.
// ─────────────────────────────────────────────────────────────
const CLAVE = 'a4f06ee8d893fb82ce246ac52e04022a';
const SITIO = 'https://patagoniaexperiencias.com';
const filtro = process.argv[2] || '';

const texto = async (u) => (await fetch(u)).text();

// El sitemap es un índice: primero los hijos, después las URLs de cada uno.
const urls = async () => {
  const indice = await texto(`${SITIO}/sitemap-index.xml`);
  const hijos = [...indice.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const todas = [];
  for (const h of hijos) {
    const xml = await texto(h);
    todas.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  }
  return [...new Set(todas)];
};

const lista = (await urls()).filter((u) => !filtro || u.includes(filtro));
if (!lista.length) { console.error('No hay URLs para enviar. ¿Está bien el filtro?'); process.exit(1); }

console.log(`Enviando ${lista.length} URLs a IndexNow${filtro ? ` (filtro: ${filtro})` : ''}`);
lista.forEach((u) => console.log(`  ${u}`));

// IndexNow acepta hasta 10.000 URLs por request.
for (let i = 0; i < lista.length; i += 10000) {
  const r = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'patagoniaexperiencias.com',
      key: CLAVE,
      keyLocation: `${SITIO}/${CLAVE}.txt`,
      urlList: lista.slice(i, i + 10000),
    }),
  });
  // 200 = recibido · 202 = recibido, clave en validación · 403 = clave mal publicada
  console.log(`\nRespuesta IndexNow: ${r.status} ${r.statusText}`);
  if (r.status >= 400) console.log(await r.text());
}
