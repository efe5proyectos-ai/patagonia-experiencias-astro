// ─────────────────────────────────────────────────────────────
// CAPA DE DATOS — Firestore en build time
// Esquema extraído del patagonia-experiencias.html de producción
// Ruta real: artifacts/patagonia-experiencias-app/public/data/{col}
// ─────────────────────────────────────────────────────────────

const PROJECT_ID = import.meta.env.FB_PROJECT_ID || 'patagonia-experiencias';
const API_KEY = import.meta.env.FB_API_KEY || 'AIzaSyDZkeRgN45FkOF8pO2rGxDJA28VZnZ8Ntg';
const APP_ID = 'patagonia-experiencias-app';
const USAR_LOCAL = import.meta.env.DATOS_LOCALES === '1';

const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/artifacts/${APP_ID}/public/data`;

function aplanar(campos = {}) {
  const out = {};
  for (const [k, v] of Object.entries(campos)) {
    const tipo = Object.keys(v)[0];
    if (tipo === 'arrayValue') {
      out[k] = (v.arrayValue.values || []).map((x) => aplanar({ _: x })._);
    } else if (tipo === 'mapValue') {
      out[k] = aplanar(v.mapValue.fields);
    } else if (tipo === 'integerValue' || tipo === 'doubleValue') {
      out[k] = Number(v[tipo]);
    } else if (tipo === 'timestampValue') {
      out[k] = v[tipo];
    } else {
      out[k] = v[tipo];
    }
  }
  return out;
}

async function leerColeccion(nombre) {
  if (USAR_LOCAL) return null;
  const docs = [];
  let pageToken = '';
  do {
    const url = `${BASE}/${nombre}?key=${API_KEY}&pageSize=300${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Firestore ${nombre}: HTTP ${res.status}`);
    const json = await res.json();
    for (const d of json.documents || []) {
      docs.push({ id: d.name.split('/').pop(), ...aplanar(d.fields) });
    }
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  return docs;
}

export function slugificar(texto) {
  return String(texto).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ── ARTÍCULOS / GUÍAS (colección: articulos) ──
function normalizarGuia(doc) {
  return {
    slug: doc.slug || slugificar(doc.titulo || doc.id),
    titulo: doc.titulo,
    bajada: doc.resumen || doc.bajada || '',
    cuerpo: doc.contenido || doc.cuerpo || '',
    destino: doc.destino || doc.categoria || '',
    imagen: doc.imagenUrl || doc.imagen || (doc.imagenes && doc.imagenes[0]) || '',
    faqs: doc.faqs || [],
    actualizado: doc.fechaModificacion || doc.fechaCreacion || null,
  };
}

export async function obtenerGuias() {
  const remoto = await leerColeccion('articulos').catch((e) => {
    console.warn(`[datos] ${e.message} — usando datos locales`);
    return null;
  });
  const crudos = (remoto && remoto.length)
    ? remoto
    : (await import('../data/guias.json')).default;
  return crudos.filter((d) => d.activo !== false && d.publicado !== false).map(normalizarGuia);
}

// ── AGENCIAS Y PLANES (para el cálculo de precios de producción) ──
async function leerDoc(coleccion, docId) {
  if (USAR_LOCAL) return null;
  const url = `${BASE}/${coleccion}/${docId}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  return json.fields ? aplanar(json.fields) : null;
}

// Réplica EXACTA de calcularPreciosTour de producción (patagonia-experiencias.html)
function calcularPrecios(tour, agencias, planes) {
  const precioBase = Number(tour?.precio) || 0;
  const agencia = (agencias || []).find(
    (a) => a.id === tour?.proveedorId || a.userId === tour?.proveedorId || a.uid === tour?.proveedorId
  );
  let comisionPct = 0;
  if (agencia) {
    if (typeof agencia.comisionOverride === 'number' && agencia.comisionOverride >= 0) {
      comisionPct = agencia.comisionOverride;
    } else if (planes && agencia.plan && planes[agencia.plan]) {
      comisionPct = Number(planes[agencia.plan].comision) || 0;
    }
  }
  if (tour && typeof tour.comisionExtra === 'number' && tour.comisionExtra >= comisionPct) {
    comisionPct = tour.comisionExtra;
  }
  const comisionBruta = Math.round((precioBase * comisionPct) / 100);
  let descuentoTurista = 0;
  const tieneTipoNuevo = typeof tour?.tipoDescuento === 'string' && tour.tipoDescuento !== '';
  const tipoDesc = tieneTipoNuevo ? tour.tipoDescuento : tour?.precioDescuento ? 'monto' : 'ninguno';
  const valorDesc = tieneTipoNuevo ? Number(tour?.valorDescuento) || 0 : Number(tour?.precioDescuento) || 0;
  if (tipoDesc === 'monto') descuentoTurista = valorDesc;
  else if (tipoDesc === 'porcentaje') descuentoTurista = Math.round((comisionBruta * valorDesc) / 100);
  const precioPreventa = Math.max(0, precioBase - descuentoTurista);
  const precioReserva = Math.max(0, comisionBruta - descuentoTurista);
  const ahorroTurista = Math.max(0, precioBase - precioPreventa);
  return { precioLista: precioBase, precioFinal: precioPreventa, sena: precioReserva, ahorro: ahorroTurista };
}

// ── EXPERIENCIAS (colección: tours) ──
function normalizarExperiencia(doc, agencias, planes) {
  const calc = calcularPrecios(doc, agencias, planes);
  return {
    precios: calc,
    temporada: doc.temporada || '',
    etiqueta: doc.etiqueta && doc.etiqueta !== 'Ninguna' ? doc.etiqueta : '',
    rating: doc.rating || 4.8,
    likes: Number(doc.likes) || 0,
    urgencia: doc.urgenciaConfig || null,
    esGastroReferencia: doc.categoria === 'gastronomia' && doc.tipoGastro === 'referencia',
    puntos: Number(doc.puntosPorReserva) || 5000,
    slug: doc.slug || slugificar(doc.titulo || doc.id),
    titulo: doc.titulo,
    descripcion: doc.descripcionLarga || doc.descripcionCorta || '',
    destino: doc.destino || '',
    regiones: doc.regiones || [],
    categoria: doc.categoria || '',
    duracion: doc.duracion || '',
    precio: calc.precioFinal || null,
    precioLista: calc.ahorro > 0 ? calc.precioLista : null,
    imagen: doc.imagenUrl || doc.imagen || (doc.imagenes && doc.imagenes[0]) || '',
    imagenes: doc.imagenes || [],
    proveedor: doc.proveedorNombre || '',
    lat: doc.lat || null,
    lng: doc.lng || null,
  };
}

export async function obtenerExperiencias() {
  const [remoto, agencias, planesDoc] = await Promise.all([
    leerColeccion('tours').catch((e) => { console.warn(`[datos] ${e.message} — datos locales`); return null; }),
    leerColeccion('solicitudes_prestadores').catch(() => []),
    leerDoc('configuracion', 'planes').catch(() => null),
  ]);
  const planes = planesDoc || null;
  const crudos = (remoto && remoto.length)
    ? remoto
    : (await import('../data/experiencias.json')).default;
  return crudos.filter((d) => d.activo !== false).map((d) => normalizarExperiencia(d, agencias || [], planes));
}


// ── MEDIOS DEL HUB (carrusel del derivador) ──
export async function obtenerMediosHub() {
  const data = await leerDoc('configuracion', 'medios').catch(() => null);
  const items = data?.hub?.items;
  if (!Array.isArray(items)) return { items: [], intervaloMs: 8000 };
  const normalizados = items
    .map((it) => ({ tipo: it.tipo || it.type || 'image', url: it.url, videoId: it.videoId || null }))
    .filter((it) => it.url || it.videoId);
  return { items: normalizados, intervaloMs: Number(data?.hub?.intervaloMs) >= 2000 ? Number(data.hub.intervaloMs) : 8000 };
}


// ── GUÍAS DIGITALES (colección: guias) — liberadas como contenido ──
function normalizarGuiaDigital(doc) {
  return {
    slug: doc.slug || slugificar(doc.titulo || doc.id),
    titulo: doc.titulo || '',
    subtitulo: doc.subtitulo || '',
    region: doc.region || '',
    imagen: (Array.isArray(doc.imagenes) && doc.imagenes[0]) || '',
    linkWeb: doc.linkWeb || '',
    linkDrive: doc.linkDrive || '',
    rating: Number(doc.rating) || null,
    reviews: Number(doc.reviewsCount) || 0,
    orden: Number(doc.orden) || 0,
    estado: doc.estado || '',
  };
}

export async function obtenerGuiasDigitales() {
  const remoto = await leerColeccion('guias').catch((e) => {
    console.warn(`[datos] guias: ${e.message} — datos locales`);
    return null;
  });
  const crudos = (remoto && remoto.length)
    ? remoto
    : (await import('../data/guias-digitales.json')).default;
  return crudos
    .map(normalizarGuiaDigital)
    .filter((g) => g.estado !== 'Borrador' && (g.linkWeb || g.linkDrive))
    .sort((a, b) => a.orden - b.orden);
}
