// ─────────────────────────────────────────────────────────────
// TÍTULOS LEGIBLES
//
// El admin deja cargar el título del tour como el prestador lo escriba, y 53
// de las 123 fichas activas al 20/11/2026 lo tenían TODO EN MAYÚSCULAS
// ("TREVELIN FULL DAY –– CON VISITA AL CAMPO DE PEONIAS"). Ese texto es el
// `<h1>`, el `<title>`, el `name` del `Product` y el nombre en el breadcrumb:
// o sea, el elemento de SEO on-page que más pesa, gritado.
//
// Por qué importa, y no es cosmética:
//   - Google reescribe el `<title>` cuando le parece de baja calidad, y las
//     mayúsculas sostenidas son uno de los casos que documenta. Con el título
//     reescrito el sitio pierde el control del fragmento que se muestra.
//   - Un título gritado se lee peor en el resultado y baja el CTR.
//   - Las mayúsculas del admin además venían sin tildes ("PEONIAS",
//     "HIDROELECTRICO", "NAVEGACION"), que es como NO se escribe el término
//     que la gente busca.
//
// Dos capas, igual que `meta-es.json` + `descripciones.js`:
//   1. `src/data/titulos-es.json`: el título corregido a mano, con la clave
//      igual al título original EXACTO de Firestore. Se escribe a mano porque
//      ningún algoritmo sabe que "(GLAXIAR)" y "(CLEONA)" son los nombres de
//      las dos embarcaciones del lago Menéndez y no erratas de "glaciar".
//   2. Respaldo algorítmico para lo que el admin publique mañana: si el título
//      viene gritado y no tiene entrada escrita, se pasa a mayúscula de
//      oración, respetando los topónimos y las marcas de la tabla PROPIOS y
//      devolviendo las tildes de la tabla ACENTOS.
//
// Qué NO toca, a propósito:
//   - El slug. La URL se arma con `slugificar()`, que baja a minúsculas y saca
//     tildes, así que arreglar el título no mueve ninguna dirección indexada.
//     Además se aplica DESPUÉS de `conSlugsUnicos`, cuando la URL ya está
//     resuelta.
//   - El texto del cuerpo de la ficha, el precio ni nada del flujo de reserva.
//   - Las palabras del título: el arreglo es ortográfico. Sólo se agregan
//     palabras cuando el título original no decía nada ("ALOJAMIENTO" sola) y
//     siempre en el JSON escrito a mano, nunca en el respaldo automático.
// ─────────────────────────────────────────────────────────────
import escritos from '../data/titulos-es.json';

const SOLO_LETRAS = /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g;
const MINUS = 'a-záéíóúüñ';
const MAYUS = 'A-ZÁÉÍÓÚÜÑ';

// ¿Está gritado? Se mide sobre las letras: "COMBO 2 DIAS" grita, "Trevelin
// full day" no, y un tramo de tres letras o menos no se juzga.
export function esGrito(texto) {
  const letras = String(texto || '').replace(SOLO_LETRAS, '');
  return letras.length > 3 && letras === letras.toUpperCase();
}

const sinTildes = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Nombres propios, marcas y términos en inglés que el respaldo automático
// tiene que escribir bien. Se busca sin tildes; se escribe con tildes.
const PROPIOS = [
  'Patagonia', 'Chubut', 'Neuquén', 'Santa Cruz', 'Tierra del Fuego',
  'Esquel', 'Trevelin', 'Trelew', 'Gaiman', 'Dolavon', 'Rawson', 'Puerto Madryn',
  'Puerto Pirámides', 'Península Valdés', 'Punta Tombo', 'Comodoro Rivadavia',
  'Rada Tilly', 'Ushuaia', 'El Calafate', 'El Chaltén', 'Caviahue', 'Copahue',
  'Cholila', 'Corcovado', 'Gualjaina', 'Camarones', 'Sarmiento', 'Lago Puelo',
  'Comarca Andina', 'Piedra Parada', 'La Hoya', 'Los Alerces',
  'Parque Nacional Los Alerces', 'Futaleufú', 'Menéndez', 'Torrecillas',
  'Arrayanes', 'Bagillt', 'Lago Rosario', 'Sierra Colorada', 'Aldea Escolar',
  'Pueblo Alto Lodge', 'Nant y Fall', 'Río Grande', 'Ruta Galesa',
  'Huella Galesa', 'Portada Centro', 'Glaxiar', 'Cleona', 'Abelino',
  'Perito Moreno', 'Lago Menéndez', 'Laguna Esmeralda',
  'Full Day', 'Half Day', 'Bird Watching', 'Ski Week',
  // Marcas de los prestadores: si un título las nombra, no se bajan a
  // minúscula aunque vengan gritadas.
  'LIMITS ADVENTURE', 'MerakiSur', 'VERTICE EXPEDICIONES', 'AGUADA HOTEL',
  'Hotel Gema', 'Geoturismo Caviahue', 'SUSSANICH TURISMO', 'OCTOPUS TRAVEL',
  'Explore Tierra del Fuego', 'Forastero Tour', 'Noelia Ferrario',
  'Patagonia Experiencias', 'Hotel del Glaciar', 'All Patagonia',
];
const TABLA = new Map(PROPIOS.map((p) => [sinTildes(p), p]));
// De más largo a más corto: "parque nacional los alerces" gana a "los alerces".
const CLAVES = [...TABLA.keys()].sort((a, b) => b.length - a.length);

// Palabras que en mayúscula de oración van en minúscula aunque abran tramo.
const MENORES = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u',
  'con', 'sin', 'en', 'a', 'al', 'por', 'para', 'desde', 'hasta', 'un', 'una']);

// Las mayúsculas del admin vienen sin tildes y el respaldo no puede
// adivinarlas. Esta tabla cubre las palabras del catálogo de hoy y las que
// vuelven a aparecer siempre en un título de excursión. Clave sin tilde.
const ACENTOS = new Map(Object.entries({
  dia: 'día', dias: 'días', navegacion: 'navegación', observacion: 'observación',
  degustacion: 'degustación', expedicion: 'expedición', excursion: 'excursión',
  esqui: 'esquí', panoramicas: 'panorámicas', panoramica: 'panorámica',
  peonias: 'peonías', hidroelectrico: 'hidroeléctrico', crater: 'cráter',
  volcan: 'volcán', aereo: 'aéreo', aereos: 'aéreos', aerea: 'aérea',
  rio: 'río', nautico: 'náutico', nautica: 'náutica', geologico: 'geológico',
  historico: 'histórico', historica: 'histórica', tematico: 'temático',
  fotografico: 'fotográfico', gastronomico: 'gastronómico',
  gastronomica: 'gastronómica', travesia: 'travesía', jardin: 'jardín',
  mas: 'más', tunel: 'túnel', arbol: 'árbol', arboles: 'árboles',
  canon: 'cañón', peninsula: 'península', bahia: 'bahía', piramides: 'pirámides',
  avion: 'avión', balcon: 'balcón', mirador: 'mirador', rapidos: 'rápidos',
}));
const conTildes = (tramo) => tramo.replace(new RegExp(`[${MINUS}]+`, 'g'), (p) => ACENTOS.get(p) || p);

// Los nombres propios de la tabla, escritos como se escriben, sin tocar nada
// más del texto ni su capitalización. Es lo que necesita el campo `destino`,
// que no viene gritado pero sí sin tildes ("Peninsula Valdes, Chubut") o con
// la provincia en minúscula ("Cholila, chubut"): ahí no hay que recapitalizar
// la frase, sólo arreglar el topónimo.
function conNombresPropios(texto) {
  let t = texto;
  for (const clave of CLAVES) {
    const escapada = clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^${MINUS}${MAYUS}])(${escapada})(?![${MINUS}${MAYUS}])`, 'gi');
    t = t.replace(re, (todo, antes, hallado) =>
      (sinTildes(hallado) === clave ? `${antes}${TABLA.get(clave)}` : todo));
  }
  return t;
}

function mayusculaDeOracion(texto) {
  let t = texto.toLowerCase();
  // Los nombres propios primero, marcados con \u0000 para que los pasos
  // siguientes no los vuelvan a tocar (si no, "Parque Nacional Los Alerces"
  // perdía la mayúscula de "Los" por la regla de las palabras menores).
  for (const clave of CLAVES) {
    const escapada = clave.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^${MINUS}])(${escapada})(?![${MINUS}])`, 'gi');
    t = t.replace(re, (_, antes, hallado) =>
      (sinTildes(hallado) === clave ? `${antes}\u0000${TABLA.get(clave)}\u0000` : `${antes}${hallado}`));
  }
  return t.split('\u0000').map((tramo, i) => {
    if (i % 2 === 1) return tramo; // nombre propio ya resuelto
    const conTilde = conTildes(tramo);
    const capitalizado = conTilde.replace(new RegExp(`(^|[.:;¡!¿?]\\s*)([${MINUS}])`, 'g'),
      (_, antes, letra) => antes + letra.toUpperCase());
    return capitalizado.replace(new RegExp(`(\\s)([${MAYUS}][${MINUS}]*)`, 'g'),
      (m, esp, pal) => (MENORES.has(pal.toLowerCase()) ? `${esp}${pal.toLowerCase()}` : m));
  }).join('');
}

// Un título puede venir gritado a medias: "TREVELIN Full Day",
// "RUTA GALESA - Half Day", "MINI SKI WEEK: 3 NOCHES DE ALOJAMIENTO". Ahí se
// arregla **sólo el tramo gritado** y las palabras que ya estaban bien
// escritas quedan intactas. Un tramo es una tirada de palabras en mayúsculas
// (con sus palabras cortas y su puntuación en el medio).
const TRAMO_GRITADO = new RegExp(`[${MAYUS}0-9]{2,}(?:[\\s:;,.·|()\\-–]+[${MAYUS}0-9]+)*`, 'g');

function arreglarTramosGritados(texto) {
  return texto.replace(TRAMO_GRITADO, (tramo) => (esGrito(tramo) ? mayusculaDeOracion(tramo) : tramo));
}

/**
 * El título de una ficha tal como se muestra y se publica.
 *
 * La clave de `titulos-es.json` puede ser el **slug único** de una ficha o el
 * **título original exacto**, y el slug gana. El título como clave es lo que
 * conviene cuando dos prestadores cargaron el mismo tour con el mismo nombre
 * gritado: una sola entrada arregla las dos fichas. El slug es para los
 * títulos genéricos ("Alojamiento"), donde una entrada por título le pondría
 * el nombre de este hotel a la ficha de cualquier otro.
 */
export function tituloLegible(titulo, slug) {
  const t = String(titulo || '').replace(/\s+/g, ' ').trim();
  if (slug && escritos[slug]) return escritos[slug];
  if (!t) return t;
  if (escritos[t]) return escritos[t];
  if (esGrito(t)) return mayusculaDeOracion(t);
  return arreglarTramosGritados(t);
}

/**
 * Misma lista de fichas, con el título ya legible. Se aplica DESPUÉS de
 * `conSlugsUnicos`, que es donde ya está resuelta la URL: así el arreglo del
 * título no puede mover una dirección indexada.
 */
export function conTitulosLegibles(experiencias) {
  return experiencias.map((e) => {
    const t = tituloLegible(e.titulo, e.slug);
    return t === e.titulo ? e : { ...e, titulo: t, tituloOriginal: e.titulo };
  });
}

/**
 * El lugar como se escribe en el `<title>`. El campo `destino` de Firestore
 * también viene gritado ("ESQUEL", "Esquel, CHUBUT") o con la barra pegada
 * ("Caviahue/ Neuquén  "), y eso terminaba publicado tal cual.
 */
export function lugarLegible(destino) {
  let t = String(destino || '').replace(/\s*\/\s*/g, ', ').replace(/\s+/g, ' ').trim();
  if (!t) return t;
  // El mismo lugar entra escrito de cuatro maneras distintas: el 25/11/2026
  // el catálogo tenía "Ushuaia, Tierra del Fuego", "Ushuaia-Tierra del
  // Fuego", "Ushuaia - Tierra del Fuego" y "Ushuaia. Tierra del Fuego", y las
  // cuatro se publicaban tal cual en el `<title>`. Se unifican en la coma.
  // Sólo cuando no hay números, para no tocar las direcciones de calle
  // ("Belgrano 320 -Trelew, CHUBUT"), que `destinoParaTitulo` ya resuelve por
  // localidad.
  if (!/\d/.test(t)) t = t.replace(/\s*[-\u2013]\s*/g, ', ').replace(/\.\s+/g, ', ');
  return t.split(/(,\s*)/)
    .map((tramo) => (esGrito(tramo) ? mayusculaDeOracion(tramo) : conNombresPropios(tramo)))
    .join('');
}

/**
 * El nombre del prestador como se publica: en el `<title>`, en el chip de la
 * ficha y —lo que más importa— en el `seller.name` del `Offer` de los datos
 * estructurados.
 *
 * Por qué existe (28/11/2026). El nombre sale del admin tal cual lo escribió
 * el prestador, y dos de los catorce lo tienen con un **espacio al final**:
 * "All patagonia " (11 fichas) y "VERTICE EXPEDICIONES " (5). Ese espacio
 * viajaba al `seller.name` del JSON-LD y al chip visible de 16 fichas.
 * `prestadorEnTitulo` ya lo recortaba, pero sólo para el `<title>`.
 * De paso, la tabla PROPIOS arregla la grafía de las marcas que el admin
 * cargó en minúscula ("All patagonia" → "All Patagonia", "Forastero tour" →
 * "Forastero Tour"), igual que `lugarLegible` hace con los topónimos.
 *
 * NO toca el slug: la URL de una ficha hermana se arma con
 * `slugificar(proveedor)` dentro de `conSlugsUnicos`, que baja a minúsculas y
 * saca los espacios, así que las tres grafías dan el mismo slug y ninguna
 * dirección indexada se mueve. Tampoco toca `/aike/catalogo.json`, que sigue
 * publicando el nombre crudo.
 */
export function prestadorLegible(proveedor) {
  const t = String(proveedor || '').replace(/\s+/g, ' ').trim();
  if (!t) return t;
  return conNombresPropios(t);
}
