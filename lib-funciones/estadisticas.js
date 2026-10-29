// ─────────────────────────────────────────────────────────────
// Estadísticas de Quimey (consultora IA de Patagonia Magazine)
//
// Cada conversación queda en un documento de Firestore:
//   artifacts/patagonia-experiencias-app/public/data/consultas_ia/{sesion}
// con lo que preguntó el lector, desde dónde (ciudad/país que informa
// Cloudflare), en qué página, qué le recomendó Quimey, en qué hizo clic
// y los datos de viaje que la IA extrae de la charla (destinos, ciudad de
// origen, pasajeros, fechas, mes, días, intención…).
//
// No se guarda la IP ni nada que identifique a la persona: la sesión es un
// id al azar del navegador, y mails/teléfonos escritos en el chat se tapan.
// Solo los administradores pueden leer esta colección (reglas de Firestore).
// Se escribe en segundo plano: si falla, el chat sigue funcionando igual.
// ─────────────────────────────────────────────────────────────

const APP = 'patagonia-experiencias-app';

function base(env) {
  const proyecto = env.FB_PROJECT_ID || 'patagonia-experiencias';
  return `${env.FIRESTORE_HOST || 'https://firestore.googleapis.com'}/v1/projects/${proyecto}/databases/(default)/documents`;
}
function clave(env) { return env.FB_API_KEY || 'AIzaSyDZkeRgN45FkOF8pO2rGxDJA28VZnZ8Ntg'; }
function ruta(env, sesion) { return `projects/${env.FB_PROJECT_ID || 'patagonia-experiencias'}/databases/(default)/documents/artifacts/${APP}/public/data/consultas_ia/${sesion}`; }

export const sesionValida = (s) => typeof s === 'string' && /^[A-Za-z0-9]{20,40}$/.test(s);
export const desactivadas = (env) => String(env.QUIMEY_ESTADISTICAS || '').toLowerCase() === 'off';

// Tapa mails y teléfonos que el lector pueda haber escrito
export function tapar(t) {
  return String(t || '')
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, '[mail]')
    .replace(/\+?\d[\d\s().-]{7,}\d/g, '[teléfono]');
}

// JS → valor tipado de Firestore
function valor(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(valor) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, valor(x)])) } };
  return { stringValue: String(v) };
}

// Escribe/mezcla campos en el documento de la sesión (crea si no existe),
// con sumas (+1) y agregados a listas opcionales.
async function escribir(env, sesion, campos, sumas = {}, agregar = {}) {
  const transforms = [
    ...Object.entries(sumas).map(([k, n]) => ({ fieldPath: k, increment: valor(n) })),
    ...Object.entries(agregar).map(([k, l]) => ({ fieldPath: k, appendMissingElements: { values: l.map(valor) } })),
  ];
  const write = {
    update: { name: ruta(env, sesion), fields: Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, valor(v)])) },
    updateMask: { fieldPaths: Object.keys(campos) },
  };
  if (transforms.length) write.updateTransforms = transforms;
  const r = await fetch(`${base(env)}:commit?key=${clave(env)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ writes: [write] }),
  });
  if (!r.ok) console.warn('[Quimey estadísticas]', r.status, (await r.text().catch(() => '')).slice(0, 300));
  return r.ok;
}

// Lugar y equipo del visitante, según Cloudflare (sin IP)
export function origenVisita(request) {
  const cf = request.cf || {};
  const ua = request.headers.get('User-Agent') || '';
  return {
    pais: cf.country || '',
    region: cf.region || '',
    ciudad: cf.city || '',
    dispositivo: /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'celular' : 'computadora',
  };
}
const hostDe = (u) => { try { return new URL(u).host.replace(/^www\./, ''); } catch { return ''; } };
const limpiarUrl = (u) => { try { const x = new URL(u); return `${x.origin}${x.pathname}`.slice(0, 300); } catch { return ''; } };

// ── La IA lee la charla y completa la ficha del viaje ──
const TEMAS = ['excursiones', 'fauna', 'gastronomia', 'eventos', 'alojamiento', 'itinerario', 'clima_temporada',
  'como_llegar', 'precios_reservas', 'negocio_sumarse', 'patagonia_puntos', 'otro'];
const FICHA = {
  name: 'registrar_consulta',
  description: 'Registra los datos de la consulta del lector. Usá solo lo que el LECTOR dijo; si no lo dijo, dejá "" o 0.',
  input_schema: {
    type: 'object',
    properties: {
      tema: { type: 'string', enum: TEMAS, description: 'Tema principal de la consulta' },
      otros_temas: { type: 'array', items: { type: 'string', enum: TEMAS } },
      destinos: { type: 'array', items: { type: 'string' }, description: 'Lugares de la Patagonia que le interesan, nombre normal (ej: "Puerto Madryn", "Península Valdés", "Gaiman")' },
      ciudad_origen: { type: 'string', description: 'Ciudad desde donde viaja el lector, si la dice' },
      pais_origen: { type: 'string', description: 'País desde donde viaja, si lo dice o se deduce de su ciudad' },
      pasajeros: { type: 'integer', description: 'Cantidad total de personas que viajan (0 si no lo dice)' },
      adultos: { type: 'integer' },
      menores: { type: 'integer' },
      viaja_con: { type: 'string', enum: ['', 'solo', 'pareja', 'familia', 'amigos', 'grupo', 'trabajo'] },
      fecha_viaje: { type: 'string', description: 'Fecha o período del viaje como lo dijo, normalizado (ej: "del 15 al 20 de enero de 2027", "Semana Santa")' },
      mes_viaje: { type: 'integer', description: 'Mes del viaje 1-12 (0 si no se sabe)' },
      anio_viaje: { type: 'integer', description: 'Año del viaje (0 si no se sabe)' },
      dias: { type: 'integer', description: 'Cantidad de días del viaje (0 si no lo dice)' },
      presupuesto: { type: 'string', description: 'Presupuesto si lo menciona' },
      intereses: { type: 'array', items: { type: 'string' }, description: 'Intereses cortos (ej: "ballenas", "cordero", "trekking", "té galés")' },
      intencion: { type: 'string', enum: ['inspirarse', 'planificar', 'cotizar_reservar', 'negocio', 'otro'] },
      es_negocio: { type: 'boolean', description: 'Quien escribe tiene un negocio o quiere sumarse/anunciar' },
      rubro_negocio: { type: 'string' },
      resumen: { type: 'string', description: 'Una línea de hasta 20 palabras con lo que buscaba el lector' },
    },
    required: ['tema', 'intencion', 'resumen'],
  },
};

async function extraerFicha(env, preguntas) {
  const hoy = new Date().toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', day: 'numeric', month: 'long', year: 'numeric' });
  const r = await fetch((env.AIKE_API_BASE || 'https://api.anthropic.com') + '/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: env.AIKE_MODELO || 'claude-haiku-4-5',
      max_tokens: 500,
      system: `Hoy es ${hoy}. Analizás consultas que lectores le hicieron a la consultora de viajes de Patagonia Magazine y registrás los datos con la herramienta. Si dicen "en enero" sin año, usá el próximo enero. Si dicen "con mi mujer y mis 2 hijos", son 4 pasajeros (2 adultos, 2 menores).`,
      tools: [FICHA],
      tool_choice: { type: 'tool', name: 'registrar_consulta' },
      messages: [{ role: 'user', content: 'Mensajes del lector, en orden:\n' + preguntas.map((p, i) => `${i + 1}. ${p}`).join('\n') }],
    }),
  });
  if (!r.ok) return { ficha: null, uso: null };
  const d = await r.json();
  const b = (d.content || []).find((x) => x.type === 'tool_use');
  return { ficha: b ? b.input : null, uso: d.usage || null };
}

function fichaLimpia(f) {
  if (!f) return null;
  const txt = (v, n = 80) => String(v || '').trim().slice(0, n);
  const num = (v, max) => { const n = Math.round(Number(v) || 0); return n > 0 && n <= max ? n : 0; };
  const lista = (v, n = 8) => (Array.isArray(v) ? v : []).map((x) => txt(x, 60)).filter(Boolean).slice(0, n);
  return {
    tema: TEMAS.includes(f.tema) ? f.tema : 'otro',
    otros_temas: lista(f.otros_temas).filter((t) => TEMAS.includes(t)),
    destinos: lista(f.destinos),
    ciudad_origen: txt(f.ciudad_origen), pais_origen: txt(f.pais_origen),
    pasajeros: num(f.pasajeros, 200), adultos: num(f.adultos, 200), menores: num(f.menores, 100),
    viaja_con: txt(f.viaja_con, 20), fecha_viaje: txt(f.fecha_viaje, 120),
    mes_viaje: num(f.mes_viaje, 12), anio_viaje: num(f.anio_viaje, 2100), dias: num(f.dias, 90),
    presupuesto: txt(f.presupuesto), intereses: lista(f.intereses, 10),
    intencion: txt(f.intencion, 30) || 'otro', es_negocio: !!f.es_negocio, rubro_negocio: txt(f.rubro_negocio),
    resumen: txt(tapar(f.resumen), 200),
  };
}

// Después de cada respuesta de Quimey (en segundo plano)
export async function registrarConsulta(env, request, d) {
  if (desactivadas(env) || !sesionValida(d.sesion)) return;
  try {
    const preguntas = d.mensajes.filter((m) => m.role === 'user').map((m) => tapar(m.content).slice(0, 600));
    const { ficha, uso } = await extraerFicha(env, preguntas).catch(() => ({ ficha: null, uso: null }));
    const ahora = new Date();
    const campos = {
      sesion: d.sesion,
      actualizado: ahora,
      idioma: d.idioma,
      sitio: hostDe(d.pagina) || hostDe(request.headers.get('Origin') || ''),
      pagina: limpiarUrl(d.pagina),
      ...origenVisita(request),
      voz: !!d.voz,
      turnos: preguntas.length,
      conversacion: [...d.mensajes, { role: 'assistant', content: d.respuesta }].slice(-30)
        .map((m) => ({ rol: m.role === 'user' ? 'lector' : 'quimey', texto: tapar(m.content).slice(0, 700) })),
    };
    if (preguntas.length === 1) campos.creado = ahora;
    if (hostDe(d.ref)) campos.ref = hostDe(d.ref);   // de dónde llegó a la página (google.com, instagram.com…)
    if (ficha) campos.datos = fichaLimpia(ficha);
    const sumas = {
      tokens_entrada: (d.uso?.entrada || 0) + (uso?.input_tokens || 0),
      tokens_salida: (d.uso?.salida || 0) + (uso?.output_tokens || 0),
    };
    const agregar = {};
    if (d.herramientas.length) agregar.herramientas = [...new Set(d.herramientas)];
    if (d.tarjetas.length) agregar.tarjetas = d.tarjetas;
    if (d.notas.length) agregar.notas = d.notas.map((n) => n.url || n.link || '').filter(Boolean).slice(0, 5);
    await escribir(env, d.sesion, campos, sumas, agregar);
  } catch (e) {
    console.warn('[Quimey estadísticas]', e && e.message);
  }
}

// Aperturas del chat y clics (/api/aike-evento)
export async function registrarEvento(env, request, e) {
  if (desactivadas(env) || !sesionValida(e.sesion)) return false;
  const campos = { sesion: e.sesion, actualizado: new Date(), ...origenVisita(request) };
  if (e.pagina) { campos.pagina = limpiarUrl(e.pagina); campos.sitio = hostDe(e.pagina); }
  if (/^[a-z]{2}$/.test(String(e.idioma || ''))) campos.idioma = e.idioma;
  const sumas = {}, agregar = {};
  if (e.tipo === 'abrir') sumas.aperturas = 1;
  else if (e.tipo === 'tarjeta') { sumas.clics_tarjeta = 1; agregar.links = [limpiarUrl(e.url) + (String(e.url).includes('#') ? '#' + String(e.url).split('#')[1].slice(0, 120) : '')]; }
  else if (e.tipo === 'link') { sumas.clics_link = 1; agregar.links = [limpiarUrl(e.url)]; }
  else return false;
  return escribir(env, e.sesion, campos, sumas, agregar);
}
