// ─────────────────────────────────────────────────────────────
// /api/aike-evento — aperturas del chat de Quimey y clics en sus
// recomendaciones y links (para medir conversión). Lo manda el widget
// con navigator.sendBeacon. Ver lib-funciones/estadisticas.js
// ─────────────────────────────────────────────────────────────
import { registrarEvento } from '../../lib-funciones/estadisticas.js';

const ORIGENES_OK = [
  /^https:\/\/(www\.)?patagoniaexperiencias\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?patagoniapuntos\.com$/,
  /^https:\/\/(www\.)?patagoniamagazine\.com\.ar$/,
  /^https:\/\/([a-z0-9-]+\.)?patagonia-experiencias-astro\.pages\.dev$/,
  /^http:\/\/localhost(:\d+)?$/,
];
function cors(origen) {
  return {
    'Access-Control-Allow-Origin': ORIGENES_OK.some((r) => r.test(origen || '')) ? origen : 'https://patagoniaexperiencias.com',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
}
const visitas = new Map();
function superaLimite(ip) {
  const ahora = Date.now();
  const l = (visitas.get(ip) || []).filter((t) => ahora - t < 60000);
  l.push(ahora); visitas.set(ip, l);
  if (visitas.size > 5000) visitas.clear();
  return l.length > 30;
}

export async function onRequestOptions({ request }) {
  return new Response(null, { status: 204, headers: cors(request.headers.get('Origin')) });
}

export async function onRequestPost({ request, env, waitUntil }) {
  const origen = request.headers.get('Origin') || '';
  const h = cors(origen);
  let mismoSitio = false;
  try { mismoSitio = !!origen && new URL(origen).host === new URL(request.url).host; } catch (e) {}
  if (origen && !mismoSitio && !ORIGENES_OK.some((r) => r.test(origen))) return new Response(null, { status: 403, headers: h });
  if (superaLimite(request.headers.get('CF-Connecting-IP') || 'local')) return new Response(null, { status: 429, headers: h });
  let e;
  try { e = JSON.parse((await request.text()).slice(0, 4000)); } catch { return new Response(null, { status: 400, headers: h }); }
  const tarea = registrarEvento(env, request, {
    sesion: e?.sesion, tipo: String(e?.tipo || ''), url: String(e?.url || '').slice(0, 500),
    pagina: String(e?.pagina || '').slice(0, 500), idioma: e?.idioma,
  });
  if (typeof waitUntil === 'function') waitUntil(tarea); else await tarea;
  return new Response(null, { status: 204, headers: h });
}
