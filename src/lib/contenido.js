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

// ── EXPERIENCIAS (colección: tours) ──
function normalizarExperiencia(doc) {
  const precioFinal = doc.precioDescuento || doc.precio || doc.precioLista || null;
  return {
    slug: doc.slug || slugificar(doc.titulo || doc.id),
    titulo: doc.titulo,
    descripcion: doc.descripcionLarga || doc.descripcionCorta || '',
    destino: doc.destino || '',
    regiones: doc.regiones || [],
    categoria: doc.categoria || '',
    duracion: doc.duracion || '',
    precio: precioFinal,
    precioLista: doc.precioLista || doc.precio || null,
    imagen: doc.imagenUrl || doc.imagen || (doc.imagenes && doc.imagenes[0]) || '',
    imagenes: doc.imagenes || [],
    proveedor: doc.proveedorNombre || '',
    lat: doc.lat || null,
    lng: doc.lng || null,
  };
}

export async function obtenerExperiencias() {
  const remoto = await leerColeccion('tours').catch((e) => {
    console.warn(`[datos] ${e.message} — usando datos locales`);
    return null;
  });
  const crudos = (remoto && remoto.length)
    ? remoto
    : (await import('../data/experiencias.json')).default;
  return crudos.filter((d) => d.activo !== false).map(normalizarExperiencia);
}
