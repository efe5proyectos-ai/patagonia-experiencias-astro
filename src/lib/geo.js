// ─────────────────────────────────────────────────────────────
// GEO — tabla de localidades propia de la capa Astro, para unir
// las guías de viaje con las experiencias que se venden en el
// mismo lugar (enlazado interno guías ↔ fichas).
//
// NO toca ni lee GEO_PROVINCIAS de la app de reservas: es una
// tabla aparte, de solo lectura, pensada para SEO. El campo
// `destino` de Firestore es texto libre y muy sucio ("Trevelin,
// CHUBUT", "italia 308 Trelew, CHUBUT", "Esquel"), así que se
// detecta la localidad por alias en lugar de comparar strings.
// ─────────────────────────────────────────────────────────────

export const LOCALIDADES = [
  // ── Cordillera de Chubut ──
  { id: 'los-alerces', nombre: 'Parque Nacional Los Alerces', zona: 'cordillera-chubut',
    alias: ['parque nacional los alerces', 'pn los alerces', 'los alerces', 'alerce abuelo', 'lago menendez', 'lago futalaufquen', 'lago bagillt', 'lago baguilt'] },
  { id: 'esquel', nombre: 'Esquel', zona: 'cordillera-chubut',
    alias: ['esquel', 'la hoya', 'laguna la zeta', 'la trochita', 'nahuel pan'] },
  { id: 'trevelin', nombre: 'Trevelin', zona: 'cordillera-chubut',
    alias: ['trevelin', 'nant y fall', 'aldea escolar', 'pueblo alto lodge', 'tulipanes', 'peonias', 'futaleufu', 'pueblo carao'] },
  { id: 'lago-rosario', nombre: 'Lago Rosario', zona: 'cordillera-chubut',
    alias: ['lago rosario', 'sierra colorada'] },
  { id: 'cholila', nombre: 'Cholila', zona: 'cordillera-chubut',
    alias: ['cholila', 'valle de cholila', 'lago lezana'] },
  { id: 'corcovado', nombre: 'Corcovado', zona: 'cordillera-chubut',
    alias: ['corcovado', 'carrenleufu'] },
  { id: 'lago-puelo', nombre: 'Lago Puelo', zona: 'cordillera-chubut',
    alias: ['lago puelo', 'comarca andina', 'el hoyo', 'epuyen'] },
  { id: 'gualjaina', nombre: 'Gualjaina', zona: 'cordillera-chubut',
    alias: ['gualjaina', 'piedra parada', 'canadon de la buitrera'] },

  // ── Puerto Madryn y Península Valdés ──
  { id: 'puerto-madryn', nombre: 'Puerto Madryn', zona: 'madryn-valdes',
    alias: ['puerto madryn', 'pto madryn', 'madryn', 'el doradillo', 'doradillo', 'punta loma', 'punta cuevas'] },
  { id: 'peninsula-valdes', nombre: 'Península Valdés', zona: 'madryn-valdes',
    alias: ['puerto piramides', 'pto piramides', 'piramides', 'peninsula valdes', 'peninsula de valdes', 'valdes', 'istmo carlos ameghino', 'caleta valdes', 'punta norte'] },

  // ── Valle inferior del Chubut ──
  { id: 'trelew', nombre: 'Trelew', zona: 'valle-chubut',
    alias: ['trelew', 'laguna chiquichano', 'mef', 'museo egidio feruglio'] },
  { id: 'gaiman', nombre: 'Gaiman', zona: 'valle-chubut',
    alias: ['gaiman', 'bryn gwyn'] },
  { id: 'dolavon', nombre: 'Dolavon', zona: 'valle-chubut',
    alias: ['dolavon', '28 de julio'] },
  { id: 'rawson', nombre: 'Rawson y Playa Unión', zona: 'valle-chubut',
    alias: ['rawson', 'playa union', 'puerto rawson', 'toninas overas', 'toninas'] },
  { id: 'punta-tombo', nombre: 'Punta Tombo', zona: 'valle-chubut',
    alias: ['punta tombo', 'tombo'] },

  // ── Sur de Chubut ──
  { id: 'comodoro-rivadavia', nombre: 'Comodoro Rivadavia', zona: 'comodoro',
    alias: ['comodoro rivadavia', 'comodoro', 'rocas coloradas', 'punta marques'] },
  { id: 'rada-tilly', nombre: 'Rada Tilly', zona: 'comodoro',
    alias: ['rada tilly'] },
  { id: 'camarones', nombre: 'Camarones', zona: 'comodoro',
    alias: ['camarones', 'cabo dos bahias', 'bahia bustamante'] },
  { id: 'sarmiento', nombre: 'Sarmiento', zona: 'comodoro',
    alias: ['sarmiento', 'bosque petrificado de sarmiento'] },

  // ── Fuera de Chubut ──
  { id: 'ushuaia', nombre: 'Ushuaia', zona: 'ushuaia',
    alias: ['ushuaia', 'canal beagle', 'cerro castor', 'glaciar martial', 'laguna esmeralda', 'tierra mayor', 'isla martillo', 'les eclaireurs', 'tierra del fuego', 'fin del mundo'] },
  { id: 'bariloche', nombre: 'Bariloche', zona: 'bariloche',
    alias: ['bariloche', 'cerro catedral', 'cerro otto', 'circuito chico', 'colonia suiza', 'isla victoria', 'arrayanes', 'siete lagos'] },
  { id: 'el-calafate', nombre: 'El Calafate', zona: 'santa-cruz',
    alias: ['el calafate', 'calafate', 'perito moreno', 'glaciarium', 'todo glaciares'] },
  { id: 'el-chalten', nombre: 'El Chaltén', zona: 'santa-cruz',
    alias: ['el chalten', 'chalten', 'fitz roy'] },
];

const normalizar = (texto) => String(texto || '')
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  // "140Trelew" → "140 trelew": en las direcciones el nombre viene pegado al número.
  .replace(/(\d)([a-z])/g, '$1 $2').replace(/([a-z])(\d)/g, '$1 $2')
  .replace(/\s+/g, ' ').trim();

// Alias ordenados de más largo a más corto: "puerto piramides" gana a "piramides",
// "parque nacional los alerces" gana a "los alerces".
const INDICE = LOCALIDADES
  .flatMap((loc) => loc.alias.map((a) => ({ loc, alias: ` ${normalizar(a)} ` })))
  .sort((a, b) => b.alias.length - a.alias.length);

/** Todas las localidades reconocidas en los textos, de la más específica a la menos. */
export function localidadesDe(...textos) {
  const heno = ` ${normalizar(textos.filter(Boolean).join(' '))} `;
  const vistas = new Set();
  const encontradas = [];
  for (const { loc, alias } of INDICE) {
    if (heno.includes(alias) && !vistas.has(loc.id)) { vistas.add(loc.id); encontradas.push(loc); }
  }
  return encontradas;
}

/** Primera localidad reconocida en los textos recibidos. null si no hay ninguna. */
export function localidadDe(...textos) {
  return localidadesDe(...textos)[0] || null;
}

// El lugar de una ficha sale de `destino` (que es el lugar real). Solo si ahí no
// se reconoce nada se recurre al título.
const lugarDeExperiencia = (e) => localidadDe(e.destino) || localidadDe(e.titulo);

// Categorías que no son excursión (gastronomía, alojamiento). Se enlazan solo
// cuando están en la misma localidad que la guía: tienen sentido como "dónde
// comer / dónde dormir", pero no para rellenar con algo de otro pueblo.
const NO_EXCURSION = /gastro|aloj|hosped|hotel|cabana|restau|habitacion/;
const esExcursion = (e) => !NO_EXCURSION.test(normalizar(`${e.categoria || ''} ${e.titulo || ''}`));

/**
 * Experiencias para enlazar desde una guía de viaje. Orden: excursiones del
 * mismo lugar, otras fichas del mismo lugar y, solo si el lugar ya aportó
 * algo, excursiones de la misma zona. Nunca rellena con gastronomía ni
 * alojamiento de otro pueblo. Devuelve lista vacía si no se reconoce el lugar
 * de la guía o si no hay nada que ofrecer ahí: mejor no enlazar que enlazar mal.
 */
export function experienciasDeGuia(guia, experiencias, n = 4) {
  // Una guía puede cubrir más de un lugar ("Esquel y Trevelin"): se usan todos.
  const lugares = localidadesDe(guia.slug, guia.titulo, guia.bajada);
  if (!lugares.length) return { lugar: null, items: [] };
  const lugar = lugares[0];
  const ids = new Set(lugares.map((l) => l.id));
  const zonas = new Set(lugares.map((l) => l.zona));

  const ubicadas = (experiencias || [])
    .filter((e) => e.imagen)
    .map((e) => ({ e, loc: lugarDeExperiencia(e) }))
    .filter((x) => x.loc);

  const aqui = ubicadas.filter((x) => ids.has(x.loc.id));
  const zona = ubicadas.filter((x) => !ids.has(x.loc.id) && zonas.has(x.loc.zona));

  // Si la localidad de la guía no tiene nada, no se rellena con la zona: una
  // guía de Camarones no debería terminar enlazando restaurantes de Comodoro.
  const orden = (aqui.length === 0 ? [] : [
    ...aqui.filter((x) => esExcursion(x.e)),
    ...aqui.filter((x) => !esExcursion(x.e)),
    ...zona.filter((x) => esExcursion(x.e)),
  ]).map((x) => x.e);

  const vistos = new Set();
  const items = orden.filter((e) => !vistos.has(e.slug) && vistos.add(e.slug)).slice(0, n);
  // El título del bloque nombra el lugar de lo que efectivamente se enlaza.
  const lugarMostrado = items.length ? lugarDeExperiencia(items[0]) || lugar : lugar;
  return { lugar: lugarMostrado, items };
}

/**
 * Guías de viaje para enlazar desde una ficha de experiencia: las del mismo
 * lugar. Cierra el circuito guía ↔ ficha sin inventar relaciones.
 */
export function guiasDeExperiencia(exp, guias, n = 2) {
  const lugar = lugarDeExperiencia(exp);
  if (!lugar) return { lugar: null, items: [] };
  const items = (guias || [])
    .filter((g) => localidadesDe(g.slug, g.titulo, g.bajada).some((l) => l.id === lugar.id))
    .slice(0, n);
  return { lugar, items };
}

/**
 * Lugar para el `<title>` de una ficha. El campo `destino` de Firestore trae
 * a veces la dirección de la calle ("Pellegrini 2484 Trelew, CHUBUT", "italia
 * 308 Trelew, CHUBUT"), que terminaba publicada tal cual en el título que ve
 * Google. Solo se limpia cuando hay números: el resto queda como está.
 */
export function destinoParaTitulo(destino) {
  const texto = String(destino || '').trim();
  if (!/\d/.test(texto)) return texto;
  return localidadDe(texto)?.nombre || texto;
}

/**
 * Título de una ficha tal como lo ve Google. El template pegaba siempre
 * ` en {destino}` atrás del título, y las fichas cuyo título ya nombra el
 * lugar terminaban publicando "TREVELIN FULL DAY en Trevelin, Chubut" o
 * "CABALGATAS EN ESQUEL en Esquel, Chubut".
 *
 * La comparación es **literal**, no por alias, a propósito: una ficha que se
 * llama "Trekking Laguna Esmeralda" sí tiene que conservar " en Ushuaia"
 * (aunque la laguna sea un alias de Ushuaia), porque el título no nombra la
 * ciudad y ésa es la palabra que la gente busca. Sólo se saca el sufijo
 * cuando repetiría un texto que ya está en el título.
 */
export function tituloParaBuscadores(titulo, destino) {
  const t = String(titulo || '').trim();
  const lugar = destinoParaTitulo(destino);
  if (!lugar) return t;
  const enTitulo = ` ${normalizar(t)} `;
  // El texto que se agregaría, su primer tramo ("Trevelin" de "Trevelin,
  // Chubut") y el nombre canónico de la localidad reconocida.
  const candidatos = [lugar, lugar.split(/[,–-]/)[0], localidadDe(lugar)?.nombre]
    .filter(Boolean)
    .map((c) => normalizar(c))
    .filter((c) => c.length >= 4);
  if (candidatos.some((c) => enTitulo.includes(` ${c} `) || enTitulo.includes(`${c} `) || enTitulo.includes(` ${c}`))) return t;
  return `${t} en ${lugar}`;
}
