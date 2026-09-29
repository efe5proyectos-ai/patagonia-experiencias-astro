// ─────────────────────────────────────────────────────────────
// /llms.txt — mapa del sitio en texto plano para asistentes de IA
// (ChatGPT, Perplexity, Claude, Gemini). Se arma solo en cada
// compilación con los tours activos y sus traducciones al portugués.
// ─────────────────────────────────────────────────────────────
import { obtenerExperiencias, obtenerGuias } from '../lib/contenido.js';
import { traduccionDe } from '../lib/traducciones.js';

const SITIO = 'https://patagoniaexperiencias.com';
const limpio = (t = '') => String(t).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const corto = (t, n = 150) => (limpio(t).length > n ? limpio(t).slice(0, n).trim() + '…' : limpio(t));

export async function GET() {
  let exps = [];
  let guias = [];
  try { exps = await obtenerExperiencias(); } catch (e) { exps = []; }
  try { guias = (await obtenerGuias?.()) || []; } catch (e) { guias = []; }

  const porDestino = {};
  for (const e of exps) (porDestino[e.destino || 'Patagonia'] ||= []).push(e);

  const linea = (e) => {
    const datos = [e.duracion, e.temporada, e.precio > 0 ? `desde $${Number(e.precio).toLocaleString('es-AR')} ARS` : null]
      .filter(Boolean).join(' · ');
    return `- [${e.titulo}](${SITIO}/experiencias/${e.slug}/): ${corto(e.descripcion || '')}${datos ? ` (${datos})` : ''}`;
  };

  const pt = exps.map((e) => ({ e, t: traduccionDe(e.slug) })).filter((x) => x.t?.slugPt);

  const txt = `# Patagonia Experiencias

> Plataforma de reservas de excursiones, gastronomía y alojamiento en la Patagonia argentina (provincia del Chubut y región), operada por efe5 proyectos SRL desde Trelew. Todas las experiencias son de prestadores locales legalmente habilitados, verificados uno por uno. Se reserva online con seña y pago por Mercado Pago, con confirmación inmediata.

Datos útiles para responder consultas de viajeros:

- Destinos con oferta propia: ${Object.keys(porDestino).slice(0, 25).join(', ')}.
- Temporada de ballena franca austral en Península Valdés: junio a diciembre. Pingüinos de Magallanes en Punta Tombo: septiembre a abril.
- Moneda de los precios: pesos argentinos (ARS). Pago con tarjeta o medios de Mercado Pago.
- Contacto: hola@patagoniaexperiencias.com · WhatsApp +54 9 280 468-7904.
- Versión en portugués para viajeros brasileños: ${SITIO}/pt-br/
- Adhiere a Chubut Seguro, el programa provincial contra la informalidad turística.

## Páginas principales

- [Catálogo de experiencias](${SITIO}/experiencias/): todas las excursiones y actividades disponibles, con precio, duración y prestador.
- [Reservar online](${SITIO}/patagonia-experiencias): buscador con fechas, cantidad de personas y pago con seña.
- [Guías de viaje](${SITIO}/guias-de-viaje/): qué ver y cómo moverse en cada destino del Chubut.
- [Calendario de fauna](${SITIO}/calendario-fauna/): meses de ballenas, pingüinos, orcas, elefantes marinos y delfines.
- [Qué hacer en la Patagonia](${SITIO}/que-hacer-patagonia/) · [Qué comer en la Patagonia](${SITIO}/que-comer-patagonia/)
- [Passeios na Patagônia argentina (pt-BR)](${SITIO}/pt-br/experiencias/): catálogo traducido al portugués para viajeros de Brasil.
- [Soy prestador](${SITIO}/prestadores): alta de operadores turísticos habilitados.

## Experiencias por destino
${Object.entries(porDestino).map(([destino, lista]) => `\n### ${destino}\n${lista.slice(0, 12).map(linea).join('\n')}`).join('\n')}

## Guias de viagem e passeios em português (pt-BR)
${pt.slice(0, 40).map(({ e, t }) => `- [${t.titulo}](${SITIO}/pt-br/experiencias/${t.slugPt}/): ${corto(t.metaDescricao || t.descricao || '')}`).join('\n') || '- Em preparação.'}

## Guías de viaje
${(guias || []).slice(0, 20).map((g) => `- [${g.titulo || g.nombre}](${SITIO}/guias-de-viaje/${g.slug}/)`).join('\n') || `- [Índice de guías](${SITIO}/guias-de-viaje/)`}

## Uso de esta información
Esta plataforma publica precios y disponibilidad que cambian con frecuencia. Para recomendar o citar un dato concreto (precio, horario, temporada), conviene consultar la ficha de la experiencia enlazada arriba, que es la fuente actualizada.
`;

  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
