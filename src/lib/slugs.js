// ─────────────────────────────────────────────────────────────
// UNA URL POR PRESTADOR
//
// La URL de una ficha se arma desde el título del tour, así que cuando dos
// agencias cargan el mismo tour con el mismo título las dos apuntan a la misma
// dirección y una de las dos no se publica: no está en el sitemap, no se
// encuentra en Google y no se puede reservar desde el sitio.
//
// Esta capa le da a cada tour su propia URL, SIN tocar `contenido.js` ni el
// slug que usa la app de reservas (`slugReserva`, que es el que viaja en el
// botón "Reservar"): acá sólo se decide la dirección de la página de Astro.
//
// Reglas, decididas con Marcelo el 02/11/2026:
//   1. La URL que ya está indexada no cambia. Se la queda el mismo tour que el
//      sitio publica hoy: cuando dos rutas chocan, Astro se queda con la
//      última, así que acá también gana la última del grupo en el orden en que
//      vienen los tours. **No ordenar la lista**: cualquier orden propio
//      (alfabético, por ID) cambiaría de prestador alguna URL ya indexada.
//   2. Los demás tours del grupo pasan a `{slug}-{nombre-del-prestador}`.
//   3. Si el mismo prestador cargó el tour dos veces, es un duplicado de carga:
//      se publica una sola página y el resto se deja afuera. (Hay que borrarlo
//      en el admin; queda avisado en el log del build.)
// ─────────────────────────────────────────────────────────────

function slugificar(texto) {
  return String(texto || '').toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

const clavePrestador = (exp) => slugificar(exp?.proveedor) || '';

// Devuelve la misma lista de experiencias, en el mismo orden, con `slug` ya
// resuelto para que no haya dos iguales. A las fichas que no se quedan con la
// URL limpia les agrega:
//   - `slugBase`: el slug compartido (sirve para buscar la traducción al pt).
//   - `prestadorEnTitulo`: el nombre del prestador, para diferenciar el <title>
//     del de la ficha ya indexada.
export function conSlugsUnicos(experiencias) {
  const grupos = new Map();
  for (const exp of experiencias) {
    if (!grupos.has(exp.slug)) grupos.set(exp.slug, []);
    grupos.get(exp.slug).push(exp);
  }

  const asignado = new Map(); // tourId → { slug, slugBase, prestadorEnTitulo } | null (no se publica)

  for (const [slug, lista] of grupos) {
    if (lista.length === 1) continue;

    const orden = lista; // orden de llegada: el mismo con el que Astro resuelve el choque
    const principal = orden[orden.length - 1];
    asignado.set(principal.tourId, { slug, slugBase: slug, prestadorEnTitulo: '' });

    const usados = new Set([slug]);
    const prestadores = new Set([clavePrestador(principal)]);

    for (const exp of orden.slice(0, -1)) {
      const prestador = clavePrestador(exp);
      if (prestador && prestadores.has(prestador)) {
        console.warn(`[slugs] "${exp.titulo}" está cargado dos veces por ${exp.proveedor} (${exp.tourId}): se publica una sola ficha`);
        asignado.set(exp.tourId, null);
        continue;
      }
      prestadores.add(prestador);
      let propio = prestador ? `${slug}-${prestador}` : '';
      if (!propio || usados.has(propio)) {
        let n = 2;
        while (usados.has(`${slug}-${n}`)) n += 1;
        propio = `${slug}-${n}`;
      }
      usados.add(propio);
      asignado.set(exp.tourId, { slug: propio, slugBase: slug, prestadorEnTitulo: exp.proveedor || '' });
    }
  }

  const salida = [];
  for (const exp of experiencias) {
    if (!asignado.has(exp.tourId)) { salida.push(exp); continue; }
    const dato = asignado.get(exp.tourId);
    if (!dato) continue; // duplicado del mismo prestador
    salida.push({ ...exp, ...dato });
  }
  return salida;
}

// ¿Esta ficha es la que se quedó con la URL limpia del grupo?
export const esFichaPrincipal = (exp) => !exp.slugBase || exp.slugBase === exp.slug;
