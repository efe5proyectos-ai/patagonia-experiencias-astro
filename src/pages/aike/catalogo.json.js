// ─────────────────────────────────────────────────────────────
// /aike/catalogo.json — lo que AIKE (IA) puede recomendar.
// Se genera en cada compilación con LOS MISMOS datos y precios que
// las páginas /experiencias/: AIKE nunca inventa un tour ni un precio,
// solo elige de esta lista.
// ─────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from 'node:fs';
import { obtenerExperiencias } from '../../lib/contenido.js';
import { traduccionDe } from '../../lib/traducciones.js';

const SITIO = 'https://patagoniaexperiencias.com';
const limpio = (t = '') => String(t).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();

// Guías propias del sitio (las mismas que entran al sitemap)
const GUIAS = [
  'calendario-fauna/', 'que-hacer-patagonia/', 'que-comer-patagonia/',
  'guias-de-viaje/peninsula-valdes/', 'guias-de-viaje/valle-del-chubut/',
  'guias-de-viaje/valle-del-chubut/trelew/', 'guias-de-viaje/valle-del-chubut/gaiman/',
  'guias-de-viaje/valle-del-chubut/dolavon/', 'guias-de-viaje/valle-del-chubut/rawson/',
  'guias-de-viaje/valle-del-chubut/28-de-julio/', 'guias-de-viaje/esquel-trevelin/',
];
function leerGuia(ruta) {
  const archivo = `./public/${ruta}index.html`;
  if (!existsSync(archivo)) return null;
  const html = readFileSync(archivo, 'utf8');
  const titulo = limpio((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || ruta)
    .replace(/\s*[|·–-]\s*Patagonia Experiencias.*$/i, '');
  const desc = limpio((html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || [])[1] || '');
  return { titulo, resumen: desc, url: `${SITIO}/${ruta}` };
}

export async function GET() {
  let exps = [];
  try { exps = await obtenerExperiencias(); } catch (e) { exps = []; }

  const experiencias = exps
    .filter((e) => e.visibleEnApp !== false && e.titulo)
    .map((e) => {
      const pt = traduccionDe(e.slug);
      return {
        id: e.slug,
        titulo: e.titulo,
        destino: e.destino || '',
        regiones: e.regiones || [],
        categoria: e.categoria || '',
        duracion: e.duracion || '',
        temporada: e.temporada || '',
        temporadas: e.temporadas || [],   // verano / otono / invierno / primavera (vacío = todo el año)
        precio: e.precio || null,            // precio final (ARS), igual al de la ficha
        precioLista: e.precioLista || null,  // solo si hay descuento
        sena: e.precios?.sena || null,       // lo que se paga online al reservar
        proveedor: e.proveedor || '',
        imagen: e.imagen || '',
        resumen: limpio(e.descripcion).slice(0, 420),
        urlFicha: `${SITIO}/experiencias/${e.slug}/`,
        urlReserva: `${SITIO}/patagonia-experiencias.html#tour/${e.slugReserva || e.slug}`,
        pt: pt?.slugPt ? { titulo: pt.titulo, urlFicha: `${SITIO}/pt-br/experiencias/${pt.slugPt}/` } : null,
      };
    });

  const guias = GUIAS.map(leerGuia).filter(Boolean);

  return new Response(JSON.stringify({ generado: new Date().toISOString(), experiencias, guias }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
