// ─────────────────────────────────────────────────────────────
// SITEMAP DE IMÁGENES — todas las fotos de tours (Firebase Storage)
// asociadas a su página en español y en portugués.
// Google Imágenes descubre así fotos que están en otro dominio.
// ─────────────────────────────────────────────────────────────
import { obtenerExperiencias } from '../lib/contenido.js';
import { traduccionDe, urlEs, urlPt } from '../lib/traducciones.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export async function GET() {
  const exps = await obtenerExperiencias();
  const bloques = [];
  for (const e of exps) {
    const fotos = [...new Set([e.imagen, ...(e.imagenes || [])].filter((u) => u && /^https?:\/\//.test(u)))].slice(0, 1000);
    if (!fotos.length) continue;
    const imgs = fotos.map((u) => `    <image:image><image:loc>${esc(u)}</image:loc></image:image>`).join('\n');
    bloques.push(`  <url>\n    <loc>${esc(urlEs(e.slug))}</loc>\n${imgs}\n  </url>`);
    const pt = traduccionDe(e.slug);
    if (pt?.slugPt) bloques.push(`  <url>\n    <loc>${esc(urlPt(pt.slugPt))}</loc>\n${imgs}\n  </url>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${bloques.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
