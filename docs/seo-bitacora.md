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
- **Localidades que la app de reservas no reconoce.** La tabla de localidades y
  alias (`GEO_PROVINCIAS`) vive dentro de `public/patagonia-experiencias.html`,
  que es zona prohibida, así que no la toqué. Le faltan: **Corcovado**,
  **Cholila**, **Comarca Andina**, **Pueblo Alto Lodge**, **Lago Rosario**,
  **Gualjaina** y **Aldea Escolar** — hay fichas publicadas en cada uno de esos
  lugares y el filtro por destino de la app no las encuentra. El arreglo es
  sumar una entrada por localidad en el array de `localidades` de Chubut, con
  sus alias; no toca precios ni checkout, pero está en el archivo del checkout.
  Decime si lo hago y lo hago en una corrida. (Del lado de Astro ya está
  cubierto: el cruce guía ↔ ficha usa su propia tabla, `src/lib/geo.js`.)
- **Las guías de viaje no tienen destino propio.** En Firestore las 60 guías no
  traen el campo `destino`, así que el código cae en `categoria` y la etiqueta
  que se ve arriba del título dice "Recomendado", "Aventura" o "Inspiración" en
  lugar del lugar. Si en el admin se les carga el destino, las guías se pueden
  agrupar y enlazar por lugar igual que las fichas. Es carga de datos, no código.
- **Las tres páginas de pago** (`pago-confirmado`, `pago-pendiente`, `pago-rechazado`)
  sirven 200 y son rastreables, sin `noindex`. Deberían llevar `noindex, follow`:
  son pantallas de resultado de una compra, no tienen nada que buscar y pueden
  aparecer en Google con un pedido ajeno. El cambio es una sola línea de `<meta>`
  en el `<head>` y no toca el flujo de Mercado Pago, pero son zona prohibida:
  hace falta tu OK para tocarlas.
- **Estrellas en el resultado de Google (`aggregateRating`).** Las fichas
  guardan un `rating` (4.8, 4.9…) que hoy se muestra en la página pero no se
  declara como dato estructurado. Declararlo haría aparecer estrellas en Google,
  que es lo que más sube el porcentaje de clics de todo lo que queda por hacer.
  **No lo hice y no lo voy a hacer solo:** Google exige que la calificación
  venga de reseñas reales de clientes, verificables, y las penas por inventarla
  son manuales y caras (se cae todo el sitio del resultado enriquecido). Si el
  rating de hoy lo carga el prestador o el admin a mano, no se puede publicar.
  El camino bueno es pedirle la reseña al cliente después del tour (hay email y
  WhatsApp del comprador) y recién con eso declarar `aggregateRating` con la
  cantidad real de reseñas. Decime si querés que arme el circuito de reseñas.
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
3. **Meta descripciones autogeneradas.** Medido el 28/10 sobre las 239 URLs del
   sitemap: ninguna ficha se queda sin description, pero todas salen de
   `textoPlano.slice(0, 157)` en `src/pages/experiencias/[slug].astro` (línea 16)
   y en su gemela de `/pt-br/`. Por eso los 7 grupos de tours repetidos tienen
   description idéntica. Títulos: ya no hay ninguno
   duplicado, ni en español ni en portugués (el único par en portugués se
   arregló el 30/10, ver "Hecho"). Cambiar el recorte por una description armada con
   destino + duración + categoría + texto mejora las que hoy son únicas, pero
   **no arregla los grupos repetidos**: ahí los campos también coinciden. Primero
   la decisión de catálogo, después el recorte.
4. **Contenido pt-BR traducido a máquina.** Google Brasil premia el texto que
   suena nativo. Revisar las fichas con más impresiones y reescribirlas.
5. **Guías sin oferta propia que enlazar.** Resuelto el enlazado automático
   (ver "Hecho" del 29/10), quedan **26 de las 60 guías sin ningún enlace a
   ficha** porque no hay nada publicado en ese lugar: 5 de Bariloche, 4 de El
   Calafate / El Chaltén, 4 de Santa Cruz (Cueva de las Manos, Lago Posadas,
   Puerto San Julián, Jaramillo, Perito Moreno), y Camarones, Sarmiento, Dique
   Ameghino, Los Altares, Piedra Parada, Río Senguer, Siete Lagos. Son páginas
   que traen visitas y no tienen nada para vender. Es decisión de catálogo
   (sumar prestadores ahí) o de contenido (despublicar las que no aportan), no
   de código.
6. **Datos estructurados.** Validar Product/Offer, FAQPage y BreadcrumbList con
   la herramienta de resultados enriquecidos; corregir lo que tire error.
   Revisado el 30/10 en fichas de las dos lenguas: el JSON-LD parsea bien y los
   tipos salen completos (Organization, Product con `offers`, BreadcrumbList y,
   en portugués, FAQPage). Lo que falta es `priceValidUntil` en el `Offer`, que
   Google pide como recomendado y hoy no está en ninguna ficha; sin él los
   resultados con precio se muestran igual, pero la validación tira aviso. El
   campo tiene que salir de una fecha de vigencia del precio, y el precio es
   zona prohibida: hay que definir de dónde sale esa fecha antes de tocarlo.
7. **Core Web Vitals.** Las páginas de `public/` cargan Tailwind por CDN y
   compilan en el navegador; las guías tienen imágenes pesadas.

   Medido el 28/10: `/aike` (77 KB) y `/prestadores` (74 KB) **no traen ni un
   encabezado en el HTML**: todo el contenido lo arma JavaScript (282 y 301
   llamadas a `createElement`/`innerHTML`). Google renderiza JS, pero llega
   tarde y pierde señales. `/calendario-fauna/` sí trae el `<h1>` pero **vacío**,
   lo rellena el script. Las tres están en el sitemap. Lo barato y seguro es
   dejar el título y el primer párrafo escritos en el HTML y que el script sólo
   los reemplace si hace falta; no es cambio de diseño, pero hay que leer bien
   cada render antes de tocar.
8. **Páginas huérfanas que sí valen.** `/cuotas` quedó indexable el 28/10 pero
   sigue sin recibir un solo enlace interno: Google la ve sólo por el sitemap.
   Lo mismo `/aike`, `/ecosistema` y `/alianzas`. Falta un enlace desde el footer
   compartido (`public/footer.js`) o desde la home. Es cambio de navegación:
   chico, pero toca todas las páginas, así que va en una corrida propia.
9. **Bing rechaza IndexNow.** Yandex acepta las 240 URLs (200 OK); Bing y el
   endpoint compartido devuelven 403 `UserForbiddedToAccessSite` aunque la
   clave esté bien publicada y accesible. Falta reclamar el sitio en Bing
   Webmaster Tools (se importa desde Search Console en dos minutos). Es tarea
   de Marcelo: está anotada arriba. Mientras tanto el script sigue avisando a
   Yandex, que funciona (29/10: aceptó las 241 URLs).

## Hecho

- **30/10/2026** — Títulos que repetían el lugar. El template de la ficha pegaba
  siempre ` en {destino}` atrás del título, así que las fichas cuyo título ya
  nombra el lugar se publicaban como "TREVELIN FULL DAY en Trevelin, Chubut",
  "CABALGATAS EN ESQUEL en Esquel, Chubut", "Valle de Cholila en Cholila".
  `tituloParaBuscadores()` en `src/lib/geo.js` saca el sufijo sólo cuando
  repetiría un texto que ya está en el título. La comparación es **literal, no
  por alias, a propósito**: "Trekking Laguna Esmeralda" conserva " en Ushuaia"
  aunque la laguna sea alias de Ushuaia, porque el título no nombra la ciudad y
  ésa es la palabra que la gente busca; lo mismo "Punta Loma con City Tour en
  Puerto Madryn" y "PIEDRA PARADA en Gualjaina". Verificado en producción sobre
  las 93 fichas: **19 títulos cambiaron, 74 quedaron intactos, cero títulos
  duplicados nuevos** y el largo medio bajó de 74 a 71 caracteres. (La corrida
  del 29/10 había contado 19 por alias; midiendo bien son 19 por repetición
  literal y 32 por alias — las otras 13 son las que conviene dejar como están.)
- **30/10/2026** — Único par de títulos duplicados en portugués. Las dos fichas
  de raquetas de nieve de Esquel publicaban las dos
  "Caminhada com Raquetes de Neve em Esquel, Patagônia". La segunda, que es la
  de La Curva de los Guanacos (su título en español ya lo dice), pasó a
  "Raquetes de Neve na Curva de los Guanacos, Esquel". Es un dato de
  `src/data/traducciones-pt.json`, no código.

- **29/10/2026** — Enlazado interno guías ↔ fichas. Las 60 guías de viaje no
  enlazaban a ninguna ficha de tour: su único enlace de salida era el CTA
  genérico a `/experiencias/`. Ahora cada guía cierra con hasta 4 fichas del
  mismo lugar ("Reservá en …") y cada ficha enlaza hasta 2 guías de su destino
  ("Antes de viajar a …"). Verificado en producción: **34 de las 60 guías** con
  bloque (136 enlaces nuevos a fichas) y **86 de las 93 fichas** con enlace a
  guía (164 enlaces nuevos). Unas 300 conexiones internas nuevas, todas
  contextuales. El cruce lo hace `src/lib/geo.js`, tabla de localidades y alias
  propia de la capa Astro: el campo `destino` de Firestore es texto libre y muy
  sucio, así que se detecta la localidad por alias en lugar de comparar
  strings. **No lee ni toca `GEO_PROVINCIAS` de la app de reservas.** Reglas
  para no enlazar mal: sin lugar reconocido no se muestra el bloque; si la
  localidad de la guía no tiene oferta no se rellena con la zona (una guía de
  Camarones no termina enlazando restaurantes de Comodoro); gastronomía y
  alojamiento se enlazan sólo si están en la misma localidad.
- **29/10/2026** — Direcciones de calle dentro del `<title>`. 12 fichas
  publicaban el título como `{titulo} en {destino}` con la dirección cargada en
  el campo destino: "Roselli Pizza Bar en italia 308 Trelew, CHUBUT", "Super
  Magic en Soberanía Nacional 140Trelew, CHUBUT". Ahora, sólo cuando el destino
  trae números, se reemplaza por la localidad reconocida ("… en Trelew"). Los
  otros 81 títulos quedaron intactos y la etiqueta de la ficha sigue mostrando
  la dirección completa, que ahí sí sirve. Verificado: cero títulos con
  dirección en las 93 fichas.

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
Lo que sí es real y quedó anotado en el pendiente 7: `/aike` y `/prestadores` no
tienen ningún encabezado en el HTML servido y `/calendario-fauna/` lo tiene
vacío. **Para la próxima corrida: el rastreo tiene que validar el tamaño de cada
respuesta antes de concluir que a una página le falta algo.**

### 29/10/2026 — Enlazado interno guías ↔ fichas + títulos con dirección

Arranqué por el pendiente de más arriba que fuera accionable. Los tres primeros
siguen trabados: las 147 no indexadas y los slugs duplicados necesitan Search
Console o una decisión de catálogo, y los "destinos sin reconocer" resultaron
estar en `GEO_PROVINCIAS`, adentro de `public/patagonia-experiencias.html`, que
es zona prohibida — lo pasé a "Para Marcelo" con la lista exacta de localidades
que faltan y el arreglo, sin tocar nada.

El trabajo de la corrida fue el enlazado interno guías ↔ fichas. Las 60 guías de
viaje son el contenido con más autoridad del sitio y su único enlace de salida
era un CTA genérico a `/experiencias/`: toda esa autoridad moría ahí. Escribí
`src/lib/geo.js`, una tabla de 25 localidades con alias (propia de la capa
Astro, sin tocar la de la app de reservas), porque el campo `destino` de
Firestore es texto libre y sucio: "Trevelin, CHUBUT", "italia 308 Trelew,
CHUBUT", "Esquel", "  Fontana 432 Trelew". Con eso cada guía muestra hasta 4
fichas del mismo lugar y cada ficha hasta 2 guías de su destino. Probé el cruce
contra los datos reales de producción antes de subir nada, y después verifiqué
el deploy fetcheando las 153 URLs: 34 guías con bloque (136 enlaces) y 86
fichas con enlace a guía (164 enlaces). Ninguna respuesta vino cortada — validé
el tamaño de cada una, como quedó anotado la corrida pasada.

En el mismo pase encontré y arreglé algo que se veía en Google: 12 fichas
publicaban la dirección de la calle dentro del `<title>`, porque varios
prestadores cargaron la dirección en el campo destino y el template la pegaba
atrás del nombre. "Roselli Pizza Bar en italia 308 Trelew, CHUBUT" ahora es
"Roselli Pizza Bar en Trelew".

**Qué mido como resultado esperado:** que las fichas gane posiciones en las
búsquedas de intención de compra que hoy capturan las guías ("qué hacer en
Puerto Madryn" → ficha de Punta Loma), porque Google ahora ve 300 enlaces
contextuales desde las páginas con autoridad hacia las páginas que venden; que
baje el porcentaje de salida de las guías; y que los 12 títulos limpios dejen de
mostrar una dirección en el resultado de búsqueda. Avisé por IndexNow: Yandex
aceptó las 241 URLs, Bing sigue en 403.

**Qué quedó pendiente:** 26 de las 60 guías siguen sin enlazar a ninguna ficha,
y no es un problema de código: no hay oferta publicada en esos lugares
(Bariloche, El Calafate, El Chaltén, Santa Cruz, Camarones, Sarmiento). Son
páginas que traen visitas y no tienen nada para vender — quedó como pendiente 5,
y es decisión de Marcelo si se suman prestadores ahí o se despublican. También
anoté el pendiente 6 nuevo: 19 fichas repiten el lugar en el título ("TREVELIN
Full Day en Trevelin, Chubut"), medido hoy, con el arreglo identificado.

### 30/10/2026 — Títulos de las fichas: se dejó de repetir el lugar

Los cinco pendientes de arriba siguen necesitando Search Console o una decisión
de catálogo, así que arranqué por el 6, el primero accionable. Antes de tocar
nada rastreé las 93 fichas en español de producción y leí el título real de cada
una (validando el tamaño de la respuesta, como quedó anotado el 28/10: ninguna
vino cortada). La corrida del 29/10 había contado 19 fichas afectadas; midiendo
por alias salen 32, pero revisando una por una quedó claro que **el criterio
correcto no es el alias sino la repetición literal**: "Trekking Laguna
Esmeralda en Ushuaia" tiene que conservar el sufijo, porque "Ushuaia" no está en
el título y es la palabra que se busca; sacárselo habría sido perder la
palabra clave en 13 fichas. Con el criterio literal son 19, y ésas son las que
cambié.

El arreglo es una función nueva en `src/lib/geo.js` y una línea en el template:
nada de datos, nada de precios, nada de checkout. Compilé, subí, esperé el
deploy y volví a rastrear las 93 fichas: los 93 títulos coinciden exactamente
con lo esperado, 19 cambiaron, no se generó ningún título duplicado y el largo
medio bajó de 74 a 71 caracteres. En el mismo pase rastreé las 59 fichas en
portugués: los títulos de allá están bien escritos y 55 de 59 ya nombran el
lugar, así que **no corresponde pegarles ningún sufijo** — lo único que había
era el par duplicado de raquetas de nieve de Esquel, que arreglé en el dato.

**Qué mido como resultado esperado:** que los 19 resultados de búsqueda dejen de
mostrar el lugar dos veces (que lee como spam y gasta caracteres), y que al
ganar 10–25 caracteres útiles Google muestre el título completo en vez de
cortarlo — sobre todo en las cuatro variantes de "TREVELIN FULL DAY …" y las
dos de "PANORÁMICAS DE ESQUEL …", donde lo que se cortaba era justamente lo que
diferencia una ficha de la otra (tulipanes, peonías, degustación). Avisé por
IndexNow: Yandex aceptó, Bing sigue en 403 (falta reclamar el sitio).

**Qué quedó pendiente:** 16 títulos siguen pasando los 60 caracteres, pero ahí
el largo lo pone el nombre que cargó el prestador, no el template. Revisé
también los datos estructurados (pendiente 6): parsean bien y los tipos están
completos; falta `priceValidUntil` en el `Offer`, que quedó anotado con la
aclaración de que la fecha de vigencia del precio toca zona prohibida. Y anoté
para Marcelo la oportunidad más grande que encontré y **no** toqué: declarar
`aggregateRating` para que salgan estrellas en Google. El `rating` ya está
cargado en las fichas, pero Google exige reseñas reales de clientes y la pena
por inventarlas es un castigo manual; el camino correcto es pedir la reseña
después del tour y recién entonces declararla.
