// ─────────────────────────────────────────────────────────────
// CAPA PT-BR — une las experiencias de Firestore con las
// traducciones generadas por scripts/traducir-pt.mjs.
// Solo se publica en portugués lo que está traducido: nunca
// páginas /pt-br/ con texto en español (contenido duplicado).
// ─────────────────────────────────────────────────────────────
import { obtenerExperiencias } from './contenido.js';
import traducciones from '../data/traducciones-pt.json';

const SITIO = 'https://patagoniaexperiencias.com';

// WhatsApp por idioma. El de Brasil lo atiende un operador brasileño.
// Variable en Cloudflare Pages: WHATSAPP_PT (solo números, con código de país. Ej: 5511999999999)
export const WHATSAPP = {
  es: '5492804687904',
  pt: String(import.meta.env.WHATSAPP_PT || '').replace(/\D/g, '') || '5492804687904',
};
if (!import.meta.env.WHATSAPP_PT) console.warn('[pt-br] Falta WHATSAPP_PT: se usa el WhatsApp general en las páginas en portugués');

// Hasta 4 experiencias relacionadas: mismo destino primero, después misma categoría
export function relacionadas(actual, todas, n = 4) {
  const otras = todas.filter((e) => e.slug !== actual.slug && e.imagen);
  const mismoDestino = otras.filter((e) => e.destino && e.destino === actual.destino);
  const mismaCat = otras.filter((e) => e.categoria === actual.categoria && !mismoDestino.includes(e));
  return [...mismoDestino, ...mismaCat, ...otras.filter((e) => !mismoDestino.includes(e) && !mismaCat.includes(e))].slice(0, n);
}

export const urlPt = (slugPt) => `${SITIO}/pt-br/experiencias/${slugPt}/`;
export const urlEs = (slug) => `${SITIO}/experiencias/${slug}/`;

export function traduccionDe(slug) {
  return traducciones[slug] || null;
}

// Cotización opcional para mostrar un valor de referencia en reales.
// Variable en Cloudflare Pages: COTIZACION_ARS_POR_BRL (ej: 240)
const COTIZ = Number(import.meta.env.COTIZACION_ARS_POR_BRL) || 0;
export const aReales = (ars) => (COTIZ > 0 && ars > 0 ? Math.round(ars / COTIZ) : 0);

export async function obtenerExperienciasPt() {
  const exps = await obtenerExperiencias();
  return exps
    .filter((e) => traducciones[e.slug]?.slugPt && traducciones[e.slug]?.descricao)
    .map((e) => {
      const t = traducciones[e.slug];
      return {
        ...e,
        slugEs: e.slug,
        slug: t.slugPt,
        titulo: t.titulo,
        descripcion: t.descricao,
        metaDescricao: t.metaDescricao || '',
        destino: t.destino || e.destino,
        categoria: t.categoria || e.categoria,
        duracion: t.duracao || e.duracion,
        temporada: t.temporada || e.temporada,
        alt: t.altImagem || `${t.titulo} — ${e.destino}, Patagônia argentina`,
        faq: Array.isArray(t.faq) ? t.faq.filter((f) => f.pergunta && f.resposta) : [],
      };
    });
}

export const TEXTOS = {
  es: {
    lang: 'es-AR', og: 'es_AR', revista: 'Revista', experiencias: 'Experiencias', guia: 'Guía de Viajeros',
    puntos: 'Suma Puntos', reservar: 'Reservar', eco: 'Ecosistema', revistaGuias: 'Revista y guías',
    prestador: 'Soy Prestador', contacto: 'Contacto', derechos: 'Todos los derechos reservados',
    lema: 'La Patagonia se decide antes de llegar. Experiencias verificadas con prestadores locales de todo el Chubut y la región.',
    idiomaOtro: 'Português', inicio: '/',
  },
  pt: {
    lang: 'pt-BR', og: 'pt_BR', revista: 'Guias', experiencias: 'Passeios', guia: 'Guia de Viagem',
    puntos: 'Patagonia Puntos', reservar: 'Reservar', eco: 'Explore', revistaGuias: 'Guias de viagem',
    prestador: 'Sou prestador', contacto: 'Contato', derechos: 'Todos os direitos reservados',
    lema: 'A Patagônia se decide antes de chegar. Passeios verificados com operadores locais de Chubut e de toda a região.',
    idiomaOtro: 'Español', inicio: '/pt-br/',
  },
};
