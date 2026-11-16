// ─────────────────────────────────────────────────────────────
// BARRIDO DE MANTENIMIENTO — pendiente 13 de docs/seo-bitacora.md
//
// Es el trabajo que se repite todas las noches y que hasta el 16/11/2026 se
// reescribía de cero en cada corrida. Se corre sin credenciales:
//
//   node scripts/barrido-mantenimiento.mjs
//
// Qué controla, y por qué cada cosa está como está:
//
//  1. Fichas sin meta description en `src/data/meta-es.json`.
//     **La fuente del cruce es Firestore, no el sitemap.** Lección del
//     15/11: el admin publica cuando quiere y el sitemap se regenera en el
//     deploy, así que una ficha cargada después del último build existe en
//     Firestore y no en el sitemap. El sitemap sirve para verificar después
//     de publicar, no para encontrar lo nuevo.
//
//  2. Fichas sin traducción en `src/data/traducciones-pt.json`.
//     **El cruce es sólo por slug único.** Si se acepta la clave base
//     (`pt[slug] || pt[slugBase]`) una ficha hermana queda tapada por su
//     principal: así `trekking-laguna-esmeralda-vertice-expediciones` no
//     aparecía como faltante el 14/11 aunque no tenía página en portugués.
//
//  3. `slugPt` con sufijo `-\d+`. El script de traducción resuelve las
//     colisiones agregando un número, y ahí la URL pierde justo la palabra
//     que distingue una ficha de la otra (caso del 10/11:
//     `rota-galesa-represa-futaleufu-trevelin-2`, que perdió "campo de
//     peônias"). Cambiarlo pide un 301 en `public/_redirects`.
//
//  4. `slugPt` duplicados o faltantes, que serían dos fichas peleándose la
//     misma URL en portugués.
//
//  5. `slugPt` con palabras que quedaron en español o con erratas en los
//     topónimos (caso del 08/11: "puerto-madrid" por "puerto-madryn"). Esto
//     tira falsos positivos a propósito: los nombres propios de lugares van
//     en español igual ("Parque Nacional Los Alerces", "Nant y Fall"). Hay
//     que leerlos, no corregirlos a ciegas.
//
// NO toca nada: sólo lee e imprime. No escribe archivos ni llama a Firebase
// con credenciales (usa la misma API REST pública que `src/lib/contenido.js`).
// ─────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { conSlugsUnicos } from '../src/lib/slugs.js';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API_KEY = process.env.FB_API_KEY || 'AIzaSyDZkeRgN45FkOF8pO2rGxDJA28VZnZ8Ntg';
const BASE = 'https://firestore.googleapis.com/v1/projects/patagonia-experiencias/databases/(default)/documents/artifacts/patagonia-experiencias-app/public/data';

function aplanar(campos = {}) {
  const out = {};
  for (const [k, v] of Object.entries(campos)) {
    const tipo = Object.keys(v)[0];
    if (tipo === 'arrayValue') out[k] = (v.arrayValue.values || []).map((x) => aplanar({ _: x })._);
    else if (tipo === 'mapValue') out[k] = aplanar(v.mapValue.fields);
    else if (tipo === 'integerValue' || tipo === 'doubleValue') out[k] = Number(v[tipo]);
    else out[k] = v[tipo];
  }
  return out;
}

async function leerColeccion(nombre) {
  const docs = [];
  let pageToken = '';
  do {
    const url = `${BASE}/${nombre}?key=${API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore ${nombre}: HTTP ${res.status}`);
    const json = await res.json();
    for (const d of json.documents || []) docs.push({ id: d.name.split('/').pop(), ...aplanar(d.fields) });
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs;
}

const slugificar = (t) => String(t || '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const leerJson = (rel) => JSON.parse(fs.readFileSync(path.join(RAIZ, rel), 'utf8'));

const tours = await leerColeccion('tours');
const activos = tours.filter((d) => d.activo !== false);
const exps = conSlugsUnicos(activos.map((d) => ({
  slug: d.slug || slugificar(d.titulo || d.id),
  titulo: d.titulo,
  proveedor: d.proveedorNombre || '',
  destino: d.destino || '',
  tourId: d.id,
})));

const metaEs = leerJson('src/data/meta-es.json');
const pt = leerJson('src/data/traducciones-pt.json');

const bloque = (titulo, filas) => {
  console.log(`\n### ${titulo} (${filas.length})`);
  if (!filas.length) console.log('  — nada —');
  else filas.forEach((f) => console.log('  -', f));
};

console.log(`tours en Firestore: ${tours.length} · activos: ${activos.length} · publicables: ${exps.length}`);
console.log(`claves meta-es.json: ${Object.keys(metaEs).length} · claves traducciones-pt.json: ${Object.keys(pt).length}`);

bloque('Fichas SIN meta description en español — hay que escribirlas',
  exps.filter((e) => !metaEs[e.slug]).map((e) => `${e.slug} | ${e.titulo} | ${e.proveedor} | ${e.destino}`));

bloque('Fichas SIN traducción al portugués (cruce por slug único)',
  exps.filter((e) => !pt[e.slug]).map((e) => `${e.slug} | ${e.destino} | ${e.proveedor}`));

const slugsPt = Object.entries(pt).map(([k, v]) => [k, v.slugPt || '']);

bloque('slugPt con sufijo numérico — la URL perdió la palabra que distingue la ficha',
  slugsPt.filter(([, s]) => /-\d+$/.test(s)).map(([k, s]) => `${k} → ${s}`));

bloque('Entradas de traducciones-pt.json SIN slugPt',
  slugsPt.filter(([, s]) => !s).map(([k]) => k));

const porSlugPt = new Map();
for (const [k, s] of slugsPt) {
  if (!s) continue;
  porSlugPt.set(s, [...(porSlugPt.get(s) || []), k]);
}
bloque('slugPt DUPLICADOS — dos fichas peleándose la misma URL en portugués',
  [...porSlugPt].filter(([, v]) => v.length > 1).map(([s, v]) => `${s} ← ${v.join(', ')}`));

// A propósito tira falsos positivos: los nombres propios de lugares van en
// español igual. Hay que leerlos, no corregirlos a ciegas.
const sospechoso = /(paseo|excursion|navegacion|pinguinera|caminata|visita|medio-dia|dia-completo|avistaje|cabalgata|salida|desde|madrid)/;
bloque('slugPt con palabras posiblemente en español o con errata — LEER, no corregir a ciegas',
  slugsPt.filter(([, s]) => sospechoso.test(s)).map(([k, s]) => `${s}   (${k})`));
