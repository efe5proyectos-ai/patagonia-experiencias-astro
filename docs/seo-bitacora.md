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

## Pendientes (en orden de impacto)

1. **Las 147 páginas no indexadas.** Sacar el detalle por motivo (duplicadas sin
   canónica, rastreada sin indexar, descubierta sin rastrear, soft 404, excluida
   por noindex) y atacar el motivo más numeroso. Es lo que más tráfico libera.
2. **Slugs duplicados entre prestadores.** Dos agencias que venden el mismo tour
   comparten la misma URL, así que cuál precio se muestra es indeterminado y
   Google ve contenido que cambia solo. Hay que darles URL propia o consolidar.
3. **Destinos sin reconocer**: Corcovado, Comarca Andina, Pueblo Alto Lodge y
   Cholila no matchean con ningún destino del sistema, así que esas fichas quedan
   fuera del enlazado por destino y de las páginas de listado.
4. **Títulos y meta descripciones duplicados o autogenerados**, sobre todo en
   `/pt-br/`. Revisar que cada ficha tenga título único con destino y actividad,
   y descripción escrita para el buscador, no un recorte de la descripción.
5. **Contenido pt-BR traducido a máquina.** Google Brasil premia el texto que
   suena nativo. Revisar las fichas con más impresiones y reescribirlas.
6. **Enlazado interno guías ↔ fichas.** Las guías de viaje tienen autoridad y
   casi no enlazan a las fichas de tours que venden eso mismo.
7. **Datos estructurados.** Validar Product/Offer, FAQPage y BreadcrumbList con
   la herramienta de resultados enriquecidos; corregir lo que tire error.
8. **Core Web Vitals.** Las páginas de `public/` cargan Tailwind por CDN y
   compilan en el navegador; las guías tienen imágenes pesadas.
9. **Páginas huérfanas**: las que están en el sitemap y no reciben ningún enlace
   interno desde el sitio.
10. **Bing rechaza IndexNow.** Yandex acepta las 240 URLs (200 OK); Bing y el
    endpoint compartido devuelven 403 `UserForbiddedToAccessSite` aunque la
    clave esté bien publicada y accesible. Falta reclamar el sitio en Bing
    Webmaster Tools (se importa desde Search Console en dos minutos). Es tarea
    de Marcelo: está anotada abajo. Mientras tanto el script sigue avisando a
    Yandex, que funciona.

## Hecho

- **28/10/2026** — Página 404 propia. Hasta ese día cualquier URL inexistente
  devolvía 200 con la home: soft 404 masivo.
- **28/10/2026** — GA4 y Pixel instalados en las páginas de Astro, que no tenían
  ninguno de los dos. Evento `contacto_whatsapp` / `Contact` en cada clic.
- **28/10/2026** — Mensaje de WhatsApp en portugués identificando el origen y el
  tour, con línea de referencia para seguimiento.

## Registro

(Cada corrida agrega acá abajo su párrafo, con fecha.)
