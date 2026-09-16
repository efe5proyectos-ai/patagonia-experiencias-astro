// ─────────────────────────────────────────────────────────────
// TRADUCTOR PT-BR CON IA — Patagonia Experiencias
// Lee los tours de Firestore, traduce SOLO los nuevos o modificados
// con Claude y guarda el resultado en src/data/traducciones-pt.json.
// Astro lee ese archivo en el build y genera /pt-br/experiencias/...
//
// Uso:  ANTHROPIC_API_KEY=... node scripts/traducir-pt.mjs
// Opcional: MODELO=claude-sonnet-5  MAX=50  FORZAR=1
// ─────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const PROJECT_ID = process.env.FB_PROJECT_ID || 'patagonia-experiencias';
const API_KEY = process.env.FB_API_KEY || 'AIzaSyDZkeRgN45FkOF8pO2rGxDJA28VZnZ8Ntg';
const APP_ID = 'patagonia-experiencias-app';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/artifacts/${APP_ID}/public/data`;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const MODELO = process.env.MODELO || 'claude-sonnet-5';
const MAX = Number(process.env.MAX) || 200;
const FORZAR = process.env.FORZAR === '1';
const ARCHIVO = new URL('../src/data/traducciones-pt.json', import.meta.url);

if (!ANTHROPIC_KEY) { console.error('Falta ANTHROPIC_API_KEY'); process.exit(1); }

function aplanar(campos = {}) {
  const out = {};
  for (const [k, v] of Object.entries(campos)) {
    const t = Object.keys(v)[0];
    if (t === 'arrayValue') out[k] = (v.arrayValue.values || []).map((x) => aplanar({ _: x })._);
    else if (t === 'mapValue') out[k] = aplanar(v.mapValue.fields);
    else if (t === 'integerValue' || t === 'doubleValue') out[k] = Number(v[t]);
    else out[k] = v[t];
  }
  return out;
}

// Idéntica a contenido.js: la clave tiene que coincidir con el slug en español
function slugificar(texto) {
  return String(texto).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function leerTours() {
  const docs = []; let token = '';
  do {
    const res = await fetch(`${BASE}/tours?key=${API_KEY}&pageSize=300${token ? `&pageToken=${token}` : ''}`);
    if (!res.ok) throw new Error(`Firestore tours: HTTP ${res.status}`);
    const j = await res.json();
    for (const d of j.documents || []) docs.push({ id: d.name.split('/').pop(), ...aplanar(d.fields) });
    token = j.nextPageToken || '';
  } while (token);
  return docs.filter((d) => d.activo !== false && d.titulo);
}

const huella = (t) => createHash('sha1').update(JSON.stringify([
  t.titulo, t.descripcionLarga || t.descripcionCorta || '', t.destino, t.categoria, t.duracion, t.temporada,
])).digest('hex').slice(0, 16);

const SISTEMA = `Sos un redactor SEO nativo de Brasil especializado en turismo.
Traducís fichas de excursiones de la Patagonia argentina del español al portugués de Brasil (pt-BR),
para que viajeros brasileños las encuentren en Google y decidan reservar.

REGLAS ESTRICTAS:
- Usá SOLO la información del texto original. No inventes precios, horarios, fechas, servicios incluidos, distancias ni datos que no estén.
- Nombres propios de lugares quedan en español (Puerto Madryn, Península Valdés, Trelew, Gaiman). Podés agregar "Patagônia" o "Argentina" para contexto.
- Usá el vocabulario que busca un brasileño: "passeio", "excursão", "observação de baleias", "pinguins", "o que fazer em", "Patagônia argentina".
- Tono cálido y claro, sin exageraciones ni superlativos vacíos.
- Si el original tiene etiquetas HTML o saltos de línea, conservalos igual.
- Respondé ÚNICAMENTE un objeto JSON válido, sin texto antes ni después, sin backticks.`;

function pedido(t) {
  return `Traducí esta ficha. Devolvé este JSON exacto:
{
 "titulo": "título en pt-BR, máx 70 caracteres, con el lugar",
 "slug": "slug-en-portugues-sin-acentos-con-el-lugar",
 "metaDescricao": "meta description pt-BR de 140 a 155 caracteres, con la búsqueda principal y una invitación a reservar",
 "descricao": "descripción completa traducida",
 "destino": "destino (nombres propios en español)",
 "categoria": "categoría traducida",
 "duracao": "duración traducida o vacío",
 "temporada": "temporada traducida o vacío",
 "altImagem": "texto alternativo descriptivo para la foto principal, máx 120 caracteres",
 "faq": [{"pergunta": "...", "resposta": "..."}]
}
El faq: 2 o 3 preguntas que haría un brasileño, respondidas SOLO con datos del texto. Si no hay datos suficientes, devolvé [].

FICHA ORIGINAL:
Título: ${t.titulo}
Destino: ${t.destino || ''}
Categoría: ${t.categoria || ''}
Duración: ${t.duracion || ''}
Temporada: ${t.temporada || ''}
Descripción:
${t.descripcionLarga || t.descripcionCorta || ''}`;
}

async function traducir(t, intento = 1) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODELO, max_tokens: 4000, system: SISTEMA, messages: [{ role: 'user', content: pedido(t) }] }),
  });
  if (!res.ok) {
    if (intento < 3 && (res.status === 429 || res.status >= 500)) {
      await new Promise((r) => setTimeout(r, 4000 * intento));
      return traducir(t, intento + 1);
    }
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  const j = await res.json();
  const texto = j.content.filter((b) => b.type === 'text').map((b) => b.text).join('').replace(/```json|```/g, '').trim();
  const r = JSON.parse(texto);
  if (!r.titulo || !r.descricao) throw new Error('Respuesta incompleta');
  return r;
}

const cache = existsSync(ARCHIVO) ? JSON.parse(readFileSync(ARCHIVO, 'utf8')) : {};
const tours = await leerTours();
const vigentes = new Set();
const slugsPt = new Set(Object.values(cache).map((c) => c.slugPt));
let hechos = 0, errores = 0;

for (const t of tours) {
  const clave = t.slug || slugificar(t.titulo || t.id);
  vigentes.add(clave);
  const h = huella(t);

  // Carga manual desde el admin (tituloPt / descripcionPt) gana siempre
  if (t.tituloPt && t.descripcionPt) {
    cache[clave] = { ...(cache[clave] || {}), hash: h, manual: true, titulo: t.tituloPt, descricao: t.descripcionPt,
      metaDescricao: t.metaDescripcionPt || cache[clave]?.metaDescricao || '',
      slugPt: cache[clave]?.slugPt || slugificar(t.tituloPt) };
    continue;
  }
  if (!FORZAR && cache[clave]?.hash === h) continue;
  if (hechos >= MAX) break;

  try {
    const r = await traducir(t);
    if (cache[clave]?.slugPt) slugsPt.delete(cache[clave].slugPt);
    let slugPt = slugificar(r.slug || r.titulo);
    // Si el slug ya existía, se mantiene (no romper URLs indexadas)
    if (cache[clave]?.slugPt) slugPt = cache[clave].slugPt;
    else { let n = 2; const base = slugPt; while (slugsPt.has(slugPt)) slugPt = `${base}-${n++}`; }
    slugsPt.add(slugPt);
    cache[clave] = { hash: h, slugPt, titulo: r.titulo, metaDescricao: r.metaDescricao, descricao: r.descricao,
      destino: r.destino, categoria: r.categoria, duracao: r.duracao, temporada: r.temporada,
      altImagem: r.altImagem, faq: Array.isArray(r.faq) ? r.faq.slice(0, 3) : [], traducido: new Date().toISOString() };
    hechos++;
    console.log(`✓ ${clave} → ${slugPt}`);
  } catch (e) {
    errores++;
    console.warn(`✗ ${clave}: ${e.message}`);
  }
}

// Tours dados de baja: se sacan para no publicar páginas huérfanas
for (const clave of Object.keys(cache)) if (!vigentes.has(clave)) delete cache[clave];

const ordenado = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(ARCHIVO, JSON.stringify(ordenado, null, 2) + '\n');
console.log(`\nTraducidos: ${hechos} · Errores: ${errores} · Total en portugués: ${Object.keys(ordenado).length}/${tours.length}`);
