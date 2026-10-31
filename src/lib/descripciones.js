// ─────────────────────────────────────────────────────────────
// META DESCRIPTION de las fichas en español.
//
// Hasta el 31/10/2026 la description salía de `textoPlano.slice(0, 157)`:
// un recorte ciego del cuerpo de la ficha. Eso publicaba en Google
// listas de inventario ("BICICLETA DE MOUNTAIN BIKE 1 de rodado 20…"),
// entidades HTML sin decodificar ("Tabla de esquí&nbsp; Bastones") y
// cortes en mitad de una palabra. Además, los 7 grupos de fichas que
// comparten texto publicaban la misma description.
//
// Ahora hay dos caminos:
//   1. `src/data/meta-es.json` — una description escrita a mano por slug.
//      Es el espejo en español de `metaDescricao` de `traducciones-pt.json`,
//      que ya cubre las 59 fichas traducidas. Es dato, no código.
//   2. Si el slug no está en ese archivo (ficha nueva cargada en el admin),
//      se arma una automática, pero limpia: entidades decodificadas, corte
//      en fin de oración o de palabra, y la localidad al final si el texto
//      no la nombra.
//
// No toca precio, seña, saldo ni checkout: es sólo el <meta name="description">.
// ─────────────────────────────────────────────────────────────
import escritas from '../data/meta-es.json';

const ENTIDADES = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', hellip: '…',
  ndash: '–', mdash: '—', aacute: 'á', eacute: 'é', iacute: 'í',
  oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü', deg: '°',
};

const decodificar = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTIDADES ? ENTIDADES[n.toLowerCase()] : m));

/** Texto del cuerpo listo para leer: sin etiquetas, sin entidades, sin espacios de más. */
export function textoLimpio(html = '') {
  let t = String(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  // Dos pasadas: el admin guarda a veces "&amp;nbsp;" (doble codificado).
  t = decodificar(decodificar(t));
  return t.replace(/\s+/g, ' ').trim();
}

// Corta en el final de oración más cercano dentro del presupuesto; si no hay
// ninguno razonable, corta en la última palabra entera y agrega puntos suspensivos.
export function recortar(texto, limite) {
  if (texto.length <= limite) return texto;
  const trozo = texto.slice(0, limite);
  const oracion = Math.max(trozo.lastIndexOf('. '), trozo.lastIndexOf('! '), trozo.lastIndexOf('? '));
  if (oracion >= limite * 0.5) return trozo.slice(0, oracion + 1).trim();
  const palabra = trozo.lastIndexOf(' ');
  let base = (palabra > 0 ? trozo.slice(0, palabra) : trozo);
  // Sin colas colgadas: ni preposición ni número suelto al final
  // ("…el campo de tulipanes de 28…" queda "…el campo de tulipanes…").
  const COLGADO = /\s+(?:de|del|la|el|los|las|lo|en|y|e|o|u|a|al|con|un|una|unos|unas|para|por|que|su|sus|se|desde|hasta|sobre|entre|más|muy|si|no|\d+[.ºª]?)$/i;
  for (let i = 0; i < 3; i++) {
    base = base.replace(/[\s,;:.·-]+$/, '');
    if (!COLGADO.test(base)) break;
    base = base.replace(COLGADO, '');
  }
  // Un paréntesis o una comilla de apertura sueltos quedan feos en el snippet.
  return base.replace(/[\s,;:.·-]+$/, '').replace(/\s*[(\[«“"'—–-]+$/, '').replace(/[\s,;:.·-]+$/, '') + '…';
}

const sinAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Meta description de una ficha en español.
 * @param {{slug:string, descripcion?:string, destino?:string}} exp
 * @param {string|null} lugar  Localidad reconocida (de geo.js), si hay.
 */
export function descripcionParaBuscadores(exp, lugar = null) {
  const aMano = escritas[exp.slug];
  if (aMano) return aMano;

  const prosa = textoLimpio(exp.descripcion);
  if (!prosa) return lugar ? `Reservá esta experiencia en ${lugar}, Patagonia argentina, con Patagonia Experiencias.`
                           : 'Reservá experiencias y excursiones en la Patagonia argentina con Patagonia Experiencias.';

  // La localidad es la palabra que se busca: si la prosa no la nombra, va al final.
  const nombraLugar = lugar && sinAcentos(prosa.slice(0, 160)).includes(sinAcentos(lugar));
  const cola = lugar && !nombraLugar ? ` ${lugar}, Patagonia argentina.` : '';
  const cuerpo = (recortar(prosa, 155 - cola.length) + cola).trim();
  // Fichas cargadas con una sola línea de texto: se completa con un cierre
  // útil en vez de publicar una description de 40 caracteres.
  if (cuerpo.length < 90) {
    const cierre = ' Reservá online con Patagonia Experiencias.';
    return (cuerpo + cierre).slice(0, 158).trim();
  }
  return cuerpo;
}
