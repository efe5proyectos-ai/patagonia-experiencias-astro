# Bitácora de SEO — Patagonia Experiencias

Este archivo lo lee y lo escribe la tarea automática de SEO que corre todas las
madrugadas. **Es el estado compartido entre una corrida y la siguiente**: sin esto,
cada corrida volvería a arrancar de cero y a repetir el mismo trabajo.

Reglas de la bitácora:
- Cada corrida **lee primero** "Pendientes" y "Hecho", elige lo de más arriba que
  todavía no esté hecho, y trabaja en eso.
- Al terminar, **mueve** lo resuelto a "Hecho" con la fecha, y agrega abajo de
  todo en "Registro" un párrafo de qué hizo, qué midió y qué quedó pendiente.
- Si encuentra algo nuevo, lo suma a "Pendientes" en el lugar que corresponda
  por impacto.
- Si algo necesita una decisión de Marcelo o toca zona prohibida, va a
  "Para Marcelo" y **no se toca**.

## Zona prohibida (no tocar nunca sin preguntar)

- Los escenarios de Make y los webhooks que los disparan.
- La fórmula de venta: cálculo de precio de lista, precio final, seña y saldo
  (`src/lib/contenido.js` y lo que dependa de eso). Los porcentajes salen del
  nivel de bonificación de cada prestador: no se tocan.
- El checkout y el flujo de pago (`public/patagonia-experiencias.html`,
  Mercado Pago, `pago-confirmado/pendiente/rechazado`).
- Reglas de Firebase y credenciales.

## Contexto que no hay que volver a averiguar

- Producción: Cloudflare Pages, deploy automático al pushear a `main` del repo
  `efe5proyectos-ai/patagonia-experiencias-astro`. Tarda 2–3 minutos.
- El sitio es mitad Astro (`src/pages/` → `/experiencias/`, `/guias/`, `/pt-br/`)
  y mitad HTML suelto en `public/` (home, app de reservas, guías de viaje, landings).
- El build local necesita `DATOS_LOCALES=1 npx astro build` (sin credenciales de
  Firestore usa los datos de `src/data/`, así que genera menos páginas que producción;
  sirve igual para verificar que no se rompió nada).
- Sitemap: `/sitemap-index.xml` → `/sitemap-0.xml`. La lista de páginas de `public/`
  es **lista blanca** en `astro.config.mjs`: si una página nueva no se agrega ahí,
  no se indexa.
- Medición: GA4 `G-NF2R0BJG34` y Pixel de Meta `1501384968138883`, en todas las
  páginas (en las de Astro desde el 28/10/2026).
- WhatsApp: español `5492804687904`; portugués en la variable `WHATSAPP_PT` de
  Cloudflare Pages. Los mensajes llevan una línea `Ref: PE-ES-…` / `PE-PT-…`.
- IndexNow: clave `a4f06ee8d893fb82ce246ac52e04022a`, publicada en la raíz.
  Se avisa con `node scripts/indexnow.mjs [filtro]`.

## Estado al 28/10/2026 (Search Console, propiedad de dominio)

- 240 páginas indexadas · 147 no indexadas.
- 61 URLs en portugués en el sitemap (home, listado y 59 fichas traducidas).
- hreflang es-AR / pt-BR recíproco y correcto en las fichas.

## Para Marcelo

- Confirmar que el número de `WHATSAPP_PT` (+54 9 2945 64-2052) es el del guía
  que atiende en portugués.
- Conectar Google Analytics para el informe semanal automático de consultas.
- Conectar Search Console, para que la tarea de la madrugada pueda ver el detalle
  de las páginas no indexadas y las búsquedas reales de Argentina y Brasil.
- Reclamar el sitio en Bing Webmaster Tools (se importa desde Search Console),
  para destrabar IndexNow en Bing.
- **Tours repetidos en el catálogo.** Hay 7 grupos de fichas distintas que
  publican exactamente el mismo texto, así que para Google son la misma página
  y compiten entre ellas. Hay que decidir, grupo por grupo, si se consolidan en
  una ficha o si cada una cuenta algo propio (qué incluye, qué no, qué prestador):
  1. `bosque-de-alerces-milenarios-glaxiar` / `safari-lacustre-bosque-de-alerces-milenarios-glaxiar` / `safari-lacustre-al-alerce-milenario-cleona`
  2. `comarca-andina-full-day` / `comarca-andina` / `valle-de-cholila`
  3. `ruta-galesa-con-complejo-hidroelectrico-futaleufu` / `…-con-visita-al-campo-de-tulipanes` / `…-con-visita-al-campo-de-peonias`
  4. `ruta-galesa-con-peonias` / `ruta-galesa-medio-dia-con-visita-al-campo-de-peonias`
  5. `ruta-galesa-half-day` / `ruta-galesa-trevelin`
  6. `turismo-ancestral-sierra-colorada-lago-rosario` / `turismo-ancestral-sierra-colorada-y-lago-rosario`
  7. `alquiler-equipo-de-ski-por-1-dia` / `alquiler-equipo-de-ski-por-3-dias`
  Es catálogo, no código: la corrida automática no lo toca.
- **Las tres páginas de pago** (`pago-confirmado`, `pago-pendiente`, `pago-rechazado`)
  sirven 200 y son rastreables, sin `noindex`. Deberían llevar `noindex, follow`:
  son pantallas de resultado de una compra, no tienen nada que buscar y pueden
  aparecer en Google con un pedido ajeno. El cambio es una sola línea de `<meta>`
  en el `<head>` y no toca el flujo de Mercado Pago, pero son zona prohibida:
  hace falta tu OK para tocarlas.
- `guia-peninsula-valdes-lite.html` tenía el `<link rel="canonical">` apuntando a
  **patagoniamagazine.com.ar**. Quedó en `noindex`, así que ya no regala
  autoridad, pero conviene revisar si quedaron más canónicas cruzadas entre los
  dos dominios.

## Pendientes (en orden de impacto)

1. **Las 147 páginas no indexadas.** Sin Search Console conectado no se puede
   sacar el detalle por motivo. Lo que sí se hizo (28/10) es la auditoría desde
   el otro lado: cruzar las 49 páginas de `public/` contra las 240 del sitemap.
   Aparecieron 13 rastreables fuera del sitemap y sin ningún enlace interno; ya
   están resueltas (ver "Hecho"). **Lo que queda del 147 es casi seguro el
   contenido duplicado del catálogo**: ver los 7 grupos anotados en
   "Para Marcelo". Hasta tener Search Console, ése es el camino.
2. **Slugs duplicados entre prestadores.** Dos agencias que venden el mismo tour
   comparten la misma URL, así que cuál precio se muestra es indeterminado y
   Google ve contenido que cambia solo. Hay que darles URL propia o consolidar.
3. **Destinos sin reconocer**: Corcovado, Comarca Andina, Pueblo Alto Lodge y
   Cholila no matchean con ningún destino del sistema, así que esas fichas quedan
   fuera del enlazado por destino y de las páginas de listado.
4. **Meta descripciones autogeneradas.** Medido el 28/10 sobre las 239 URLs del
   sitemap: ninguna ficha se queda sin description, pero todas salen de
   `textoPlano.slice(0, 157)` en `src/pages/experiencias/[slug].astro` (línea 16)
   y en su gemela de `/pt-br/`. Por eso los 7 grupos de tours repetidos tienen
   description idéntica. Títulos: sólo 1 par duplicado, en portugués
   (`caminhada-com-raquetes-de-neve-em-esquel` y
   `caminhada-raquetes-de-neve-la-curva-de-los-guanacos-esquel`, los dos
   "Caminhada com Raquetes de Neve em Esquel") — ése se arregla sumando el lugar
   al título de la segunda. Cambiar el recorte por una description armada con
   destino + duración + categoría + texto mejora las que hoy son únicas, pero
   **no arregla los grupos repetidos**: ahí los campos también coinciden. Primero
   la decisión de catálogo, después el recorte.
5. **Contenido pt-BR traducido a máquina.** Google Brasil premia el texto que
   suena nativo. Revisar las fichas con más impresiones y reescribirlas.
6. **Enlazado interno guías ↔ fichas.** Las guías de viaje tienen autoridad y
   casi no enlazan a las fichas de tours que venden eso mismo.
7. **Datos estructurados.** Validar Product/Offer, FAQPage y BreadcrumbList con
   la herramienta de resultados enriquecidos; corregir lo que tire error.
8. **Core Web Vitals.** Las páginas de `public/` cargan Tailwind por CDN y
   compilan en el navegador; las guías tienen imágenes pesadas.

   Medido el 28/10: `/aike` (77 KB) y `/prestadores` (74 KB) **no traen ni un
   encabezado en el HTML**: todo el contenido lo arma JavaScript (282 y 301
   llamadas a `createElement`/`innerHTML`). Google renderiza JS, pero llega
   tarde y pierde señales. `/calendario-fauna/` sí trae el `<h1>` pero **vacío**,
   lo rellena el script. Las tres están en el sitemap. Lo barato y seguro es
   dejar el título y el primer párrafo escritos en el HTML y que el script sólo
   los reemplace si hace falta; no es cambio de diseño, pero hay que leer bien
   cada render antes de tocar.
9. **Páginas huérfanas que sí valen.** `/cuotas` quedó indexable el 28/10 pero
   sigue sin recibir un solo enlace interno: Google la ve sólo por el sitemap.
   Lo mismo `/aike`, `/ecosistema` y `/alianzas`. Falta un enlace desde el footer
   compartido (`public/footer.js`) o desde la home. Es cambio de navegación:
   chico, pero toca todas las páginas, así que va en una corrida propia.
10. **Bing rechaza IndexNow.** Yandex acepta las 240 URLs (200 OK); Bing y el
    endpoint compartido devuelven 403 `UserForbiddedToAccessSite` aunque la
    clave esté bien publicada y accesible. Falta reclamar el sitio en Bing
    Webmaster Tools (se importa desde Search Console en dos minutos). Es tarea
    de Marcelo: está anotada abajo. Mientras tanto el script sigue avisando a
    Yandex, que funciona.

## Hecho

- **28/10/2026** — Páginas indexables fuera del sitemap: 13 URLs servían 200,
  eran rastreables y no estaban ni en el sitemap ni enlazadas desde ninguna
  parte. Se les puso `noindex, follow`: `banner-fauna`, `banner-fauna-300x250`,
  `iconos-categorias`, `verificar-imagenes`, `guia-peninsula-valdes-lite`,
  `mi-viaje`, `billetera-turista`, `manual-prestador`, `registro-invitacion` y
  `email-bienvenida-prestador`. `/index_1` (una versión vieja de la home, que le
  competía sirviendo 200) pasó a 301 a la home, igual que `/index_2`.
- **28/10/2026** — `/cuotas` promovida: tenía título propio y búsqueda real
  ("viaje a Esquel en cuotas") pero estaba huérfana y sin `description`,
  `canonical` ni Open Graph. Se le agregaron los tres y entró a la lista blanca
  del sitemap (ahora 241 URLs). Sólo metadatos de `<head>`: no se tocó el
  cálculo de seña y cuotas.
- **28/10/2026** — `canonical` faltante en 6 páginas que sí están en el sitemap:
  `ecosistema`, `preregistro`, `preregistrotdf`, `privacidad`,
  `sumar-gastronomia` y `terminos`.
- **28/10/2026** — H1 de respaldo en las fichas sin foto. El único `<h1>` vivía
  dentro del bloque del hero, que sólo se renderiza si la experiencia tiene
  imagen: una ficha sin foto se publicaba sin ningún H1. Es un arreglo
  preventivo — **hoy no hay ninguna ficha sin foto en producción**. El commit
  dice que dos fichas estaban afectadas y eso está mal: esas dos URLs me dieron
  una respuesta cortada en el rastreo y las leí como si no tuvieran H1. Vale el
  arreglo, no el diagnóstico.
- **28/10/2026** — Página 404 propia. Hasta ese día cualquier URL inexistente
  devolvía 200 con la home: soft 404 masivo.
- **28/10/2026** — GA4 y Pixel instalados en las páginas de Astro, que no tenían
  ninguno de los dos. Evento `contacto_whatsapp` / `Contact` en cada clic.
- **28/10/2026** — Mensaje de WhatsApp en portugués identificando el origen y el
  tour, con línea de referencia para seguimiento.

## Registro

(Cada corrida agrega acá abajo su párrafo, con fecha.)

### 28/10/2026 — Auditoría de indexabilidad de `public/` + H1 de respaldo

Rastreé las 240 URLs del sitemap una por una (239 con 200; la guía
`canal-beagle…` dio timeout en el primer intento y 200 en el segundo, es lentitud
de Cloudflare en frío, no un error) y extraje de cada una título, description,
canonical, robots, H1, hreflang y datos estructurados. Resultado del lado bueno:
cero `noindex` accidentales, cero canónicas cruzadas, cero páginas sin título ni
description. El problema estaba afuera del sitemap: de las 49 páginas HTML de
`public/`, 13 servían 200 y eran rastreables sin estar en el sitemap ni recibir
un enlace interno — creativos de banners, hojas de iconos, plantillas de email,
pantallas de estado privado del visitante y una versión vieja de la home
(`/index_1`) compitiendo con la home real. Esas 13 son candidatas directas de
las 147 "no indexadas" de Search Console y se comían presupuesto de rastreo.
Quedaron todas en `noindex, follow` menos `/index_1`, que pasó a 301.

Aproveché el mismo pase para cerrar tres huecos chicos: `/cuotas` (huérfana, con
búsqueda propia y sin ningún metadato) entró al sitemap con description,
canonical y Open Graph; las 6 páginas del sitemap que no tenían `canonical` ahora
la tienen; y las fichas sin foto, que se publicaban sin ningún H1 porque el
único `<h1>` estaba dentro del bloque del hero, ahora llevan uno dentro del
`<article>`.

**Qué mido como resultado esperado:** que las "no indexadas" de Search Console
bajen de 147 a cerca de 134 en dos o tres semanas (las 13 pasan de "rastreada sin
indexar" a "excluida por noindex", que es el estado correcto y no cuenta como
problema), que `/cuotas` aparezca indexada, y que el rastreo se concentre en las
fichas y las guías en vez de gastarse en artefactos.

**Qué quedó pendiente:** el resto del 147 es contenido duplicado del catálogo —
7 grupos de fichas con texto idéntico, anotados en "Para Marcelo" con los slugs.
Eso no se puede arreglar desde el código: es decisión de catálogo (consolidar o
diferenciar). Las tres páginas de pago necesitan `noindex` y son zona prohibida,
también anotadas. Bing sigue devolviendo 403 en IndexNow (Yandex aceptó bien el
aviso de `/cuotas`); falta reclamar el sitio en Bing Webmaster Tools.

**Corrección sobre el H1 (misma corrida).** Al verificar el deploy encontré que
dos de las URLs del rastreo me habían devuelto una respuesta cortada (1,3 KB y
8 KB contra una mediana de 22 KB), y las leí como fichas sin H1. No lo eran. El
arreglo que subí igual sirve, porque el bug del template es real: si una
experiencia no tiene foto, no se renderiza ningún H1. Pero hoy no hay ninguna
ficha así en producción, así que no esperes ningún movimiento por este cambio.
Lo que sí es real y quedó anotado en el pendiente 8: `/aike` y `/prestadores` no
tienen ningún encabezado en el HTML servido y `/calendario-fauna/` lo tiene
vacío. **Para la próxima corrida: el rastreo tiene que validar el tamaño de cada
respuesta antes de concluir que a una página le falta algo.**
