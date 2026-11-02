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
- El repo **no ignora `node_modules/`**: está versionado entero. Compilar en
  local modifica `node_modules/.vite/deps/_metadata.json` (cache de Vite): hay
  que dejarlo como estaba (`git checkout -- node_modules/.vite`) antes de
  cerrar la corrida, no commitearlo. `dist/` sí está ignorado desde el 1/11.
- IndexNow: clave `a4f06ee8d893fb82ce246ac52e04022a`, publicada en la raíz.
  Se avisa con `node scripts/indexnow.mjs [filtro]`.

## Estado al 28/10/2026 (Search Console, propiedad de dominio)

- 240 páginas indexadas · 147 no indexadas.
- 61 URLs en portugués en el sitemap (home, listado y 59 fichas traducidas).
- hreflang es-AR / pt-BR recíproco y correcto en las fichas.

Tamaño del sitio al 02/11/2026: **251 URLs** en el sitemap — 98 fichas en
español, 64 fichas en portugués, 60 guías de viaje y el resto de `public/`.
En Firestore hay 113 tours activos: los 15 que faltan son los slugs repetidos
(ver "Para Marcelo").

## Para Marcelo

- Confirmar que el número de `WHATSAPP_PT` (+54 9 2945 64-2052) es el del guía
  que atiende en portugués.
- Conectar Google Analytics para el informe semanal automático de consultas.
- Conectar Search Console, para que la tarea de la madrugada pueda ver el detalle
  de las páginas no indexadas y las búsquedas reales de Argentina y Brasil.
- Reclamar el sitio en Bing Webmaster Tools (se importa desde Search Console),
  para destrabar IndexNow en Bing.
- **15 fichas no tienen página en el sitio: dos prestadores cargaron el mismo
  tour con el mismo título.** Medido el 02/11 contra Firestore: hay 113 tours
  activos y el sitio publica 98 fichas. La URL se arma desde el título, así que
  cuando dos tours se llaman igual los dos apuntan a la misma dirección y **el
  segundo simplemente no existe para nadie**: no está en el sitemap, no se
  puede buscar en Google y no se puede reservar desde el sitio. Hoy gana el
  tour cuyo ID de Firestore es más alto, que es estable mientras no se borre ni
  se vuelva a crear el documento; si se da de baja el que gana, la página
  cambia sola de prestador y de precio.
  Los 15 casos: `alquiler-de-bicicletas`, `lago-bagillt`,
  `navegacion-rio-grande-full-day`, `panoramicas-de-esquel`,
  `parque-nacional-los-alerces-full-day`, `parque-nacional-los-alerces-half-day`,
  `parque-nacional-los-alerces-portada-centro-y-complejo-hidroelectrico-futaleufu`,
  `peninsula-valdes`, `piedra-parada`, `rafting-en-corcovado`,
  `ruta-galesa-con-complejo-hidroelectrico-futaleufu`,
  `ruta-galesa-con-complejo-hidroelectrico-futaleufu-con-visita-al-campo-de-peonias`,
  `trevelin-full-day`, `trevelin-full-day-con-visita-al-campo-de-peonias`,
  `valle-de-cholila`.
  Tres cosas que necesitan tu decisión, no código:
  1. **`navegacion-rio-grande-full-day` está cargado dos veces por el mismo
     prestador**, con el mismo texto y el mismo precio (ids `fZ0VBHDYqMvwDDBeDUuI`
     y `tgm3Dss1qfqQdiiyQ4hc`). Es un duplicado para borrar en el admin.
  2. **Dos casos publican precios distintos** según cuál gane: `piedra-parada`
     ($250.000 contra $210.000) y `peninsula-valdes` ($150.000 contra $160.000,
     y además uno dice Puerto Pirámides y el otro Puerto Madryn). Hoy se publica
     el más barato de Piedra Parada y el más caro de Península Valdés.
  3. En los otros 12 el precio es idéntico y lo que cambia es el texto y el
     prestador. Decidí si cada par se consolida en una ficha (y qué prestador
     recibe la reserva) o si cada prestador tiene su propia URL. Si querés URL
     propia, el arreglo es en `src/lib/contenido.js`, que es zona prohibida: lo
     hago sólo con tu OK.
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
2. **15 fichas sin página por slug repetido.** Medido el 02/11: 113 tours
   activos en Firestore, 98 fichas publicadas. Dos prestadores cargaron el
   mismo tour con el mismo título y la URL se arma desde el título, así que uno
   de los dos no existe en el sitio. Es lo que más ventas cuesta de todo lo que
   queda, pero el arreglo toca `src/lib/contenido.js` (zona prohibida) y hace
   falta decidir prestador por prestador: quedó en "Para Marcelo" con los 15
   casos, los dos que publican precios distintos y el duplicado exacto que
   conviene borrar en el admin.
3. **Las 7 fichas repetidas del catálogo siguen compitiendo entre ellas.**
   Resuelto el síntoma visible (31/10: cada ficha tiene su propia meta
   description escrita a mano, cero duplicadas), pero el cuerpo de la página
   sigue siendo idéntico en los 7 grupos y Google juzga el duplicado por el
   contenido, no por la description. **Esto no se arregla desde el código:**
   la decisión de catálogo está en "Para Marcelo" con los slugs grupo por
   grupo. Mientras siga abierta, cada grupo le resta posiciones al otro.
4. **34 fichas no tienen versión en portugués.** Al 02/11 hay 98 fichas en
   español y 64 en portugués. Una ficha sin traducir **no puede posicionar en
   Brasil**: no existe en `/pt-br/` y no recibe hreflang. Las que más duelen,
   por lo que busca un brasileño, son las de fauna y las de Ushuaia:
   `pinguinera-punta-tombo` y `punta-tombo` ("pinguins Punta Tombo" es una de
   las búsquedas más fuertes del mercado), `punta-loma-con-city-tour`,
   `trekking-laguna-esmeralda`, `sabores-del-beagle`,
   `trekking-glaciar-torrecillas-glaxiar` y `expedicion-menendez-glaxiar`.
   El resto son 7 habitaciones y paquetes de alojamiento, 6 restaurantes y
   varias variantes de Ruta Galesa y tulipanes. **Se traducen a mano, de a 5
   por corrida** (como se hizo el 02/11): escribir la entrada en
   `src/data/traducciones-pt.json` con título, meta description, cuerpo,
   destino, categoría, duración, alt y 2–3 FAQ. El script
   `scripts/traducir-pt.mjs` hace lo mismo con la API de Anthropic, pero pide
   `ANTHROPIC_API_KEY`, que la corrida de la madrugada no tiene.
5. **Contenido pt-BR traducido a máquina.** Google Brasil premia el texto que
   suena nativo. Revisar las fichas con más impresiones y reescribirlas. Las 5
   del 02/11 ya están escritas a mano; las 59 anteriores salieron del script.
6. **Guías sin oferta propia que enlazar.** Resuelto el enlazado automático
   (ver "Hecho" del 29/10), quedan **26 de las 60 guías sin ningún enlace a
   ficha** porque no hay nada publicado en ese lugar: 5 de Bariloche, 4 de El
   Calafate / El Chaltén, 4 de Santa Cruz (Cueva de las Manos, Lago Posadas,
   Puerto San Julián, Jaramillo, Perito Moreno), y Camarones, Sarmiento, Dique
   Ameghino, Los Altares, Piedra Parada, Río Senguer, Siete Lagos. Son páginas
   que traen visitas y no tienen nada para vender. Es decisión de catálogo
   (sumar prestadores ahí) o de contenido (despublicar las que no aportan), no
   de código. **Novedad del 02/11:** El Calafate ya tiene una ficha publicada
   (`tour-alternativo-al-glaciar-moreno`) y las guías de El Calafate ya la
   enlazan solas; quedan 25.
7. **Datos estructurados.** Validar Product/Offer, FAQPage y BreadcrumbList con
   la herramienta de resultados enriquecidos; corregir lo que tire error.
   Revisado el 30/10 en fichas de las dos lenguas: el JSON-LD parsea bien y los
   tipos salen completos (Organization, Product con `offers`, BreadcrumbList y,
   en portugués, FAQPage). Lo que falta es `priceValidUntil` en el `Offer`, que
   Google pide como recomendado y hoy no está en ninguna ficha; sin él los
   resultados con precio se muestran igual, pero la validación tira aviso. El
   campo tiene que salir de una fecha de vigencia del precio, y el precio es
   zona prohibida: hay que definir de dónde sale esa fecha antes de tocarlo.
8. **Las fichas en español no tienen FAQPage.** Las 64 en portugués traen
   `faq` en `traducciones-pt.json` y publican FAQPage; las 98 en español no
   tienen de dónde sacarlo, así que pierden el bloque de preguntas en el
   resultado de Google. Es carga de datos: un `faq-es.json` espejo del
   portugués, 2–3 preguntas por ficha, escritas sólo con lo que dice la ficha.
   Se puede hacer de a 10 fichas por corrida.
9. **Core Web Vitals.** Las páginas de `public/` cargan Tailwind por CDN y
   compilan en el navegador; las guías tienen imágenes pesadas. Eso sigue
   abierto y es lo que queda de este pendiente.

   La mitad grave ya está resuelta (1/11): `/aike`, `/prestadores` y
   `/calendario-fauna/` servían su contenido sólo por JavaScript y ahora traen
   el H1, la bajada y los H2 escritos en el HTML (ver "Hecho"). Lo que falta es
   rendimiento puro: reemplazar el CDN de Tailwind por una hoja compilada en
   las páginas de `public/` y comprimir las imágenes de las guías. **Ojo:** el
   CDN de Tailwind está en `public/patagonia-experiencias.html`, que es zona
   prohibida; en las demás páginas se puede cambiar, pero conviene una página
   por corrida y verificando que no se rompa ningún estilo.

10. **Bing rechaza IndexNow.** Yandex acepta las URLs (200 OK); Bing y el
    endpoint compartido devuelven 403 `UserForbiddedToAccessSite` aunque la
    clave esté bien publicada y accesible. Falta reclamar el sitio en Bing
    Webmaster Tools (se importa desde Search Console en dos minutos). Es tarea
    de Marcelo: está anotada arriba. Mientras tanto el script sigue avisando a
    Yandex, que funciona (02/11: aceptó las 251 URLs).

11. **Seis guías con la description corta.** El recorte nuevo cierra en fin de
    oración, y en 6 de las 60 guías la primera oración del cuerpo es muy corta
    y la segunda no entra en los 157 caracteres: quedan entre 81 y 109. No es
    un error (una oración entera lee mejor que un corte ragged), pero esas 6
    desaprovechan medio snippet. El arreglo es cargarles una `bajada` propia
    en el admin, o escribirles la description a mano como se hizo con las
    fichas. Es carga de datos.
12. **MANTENIMIENTO DE CADA CORRIDA — fichas nuevas sin description ni
    traducción.** Cruzar el sitemap contra las claves de `src/data/meta-es.json`
    y de `src/data/traducciones-pt.json` y escribir lo que falte. Una ficha que
    el admin publique hoy cae al respaldo automático de
    `src/lib/descripciones.js` (limpio pero genérico, y si el prestador empieza
    el texto con un encabezado la description arranca con esa palabra suelta) y
    no tiene página en portugués. Es el trabajo de mantenimiento más barato y
    de mayor retorno que queda. Hecho el 02/11 con las 5 fichas nuevas.

## Hecho

- **02/11/2026** — Las 5 fichas que el admin publicó entre el 31/10 y el 02/11
  (4 de Ushuaia y 1 de El Calafate) quedaron con meta description en español
  escrita a mano y con versión completa en portugués de Brasil. Son
  `avistaje-de-pinguinos-en-barco-pequeno`,
  `parque-nacional-tierra-del-fuego-by-hike`,
  `parque-nacional-tierra-del-fuego-y-tren-del-fin-del-mundo-opcional`,
  `puerto-almanza-ruta-de-la-centolla-y-avistaje-de-pinguinos-en-barco-pequeno`
  y `tour-alternativo-al-glaciar-moreno`. En español caían al respaldo
  automático: tres cortaban con puntos suspensivos y la del Glaciar Moreno
  publicaba "Descripción Salimos temprano…", porque el prestador empieza el
  texto con un encabezado `<h3>Descripción</h3>`. Ahora son 5 descriptions de
  126 a 140 caracteres, y `meta-es.json` cubre las 98 fichas, cero duplicadas.
  En portugués no existían: las escribí a mano en `traducciones-pt.json`
  (título, meta description, cuerpo, destino, categoría, duración, alt y 3 FAQ
  cada una), con el vocabulario con el que busca un brasileño ("passeio",
  "pinguins", "observação de pinguins", "trilha", "Terra do Fogo"). El sitemap
  pasó de 246 a 251 URLs y `/pt-br/experiencias/` de 59 a 64 fichas, todas con
  hreflang recíproco verificado en producción. **Ushuaia y El Calafate son los
  dos destinos más buscados de la Patagonia desde Brasil y hasta hoy el sitio
  no tenía una sola página en portugués de ninguno de los dos.**

- **01/11/2026** — Encabezados y texto en el HTML de las tres páginas que
  servían todo por JavaScript. `/aike` (77 KB) y `/prestadores` (74 KB) eran
  aplicaciones React montadas sobre un `<div id="root">` **vacío**: el HTML
  servido no traía un solo `<h1>` ni `<h2>`, y `/calendario-fauna/` traía el
  `<h1>` y la bajada vacíos, rellenados por script. Las tres están en el
  sitemap. Ahora las tres traen el contenido escrito en el HTML, con el mismo
  patrón que ya usaba la home: el bloque vive dentro de `#root` y React lo
  reemplaza al montar (`createRoot` limpia el contenedor). En `/aike`: H1
  "AIKE", la bajada, y tres H2 con los tipos de escapada, las 8 zonas que
  cubre y enlaces a `/experiencias/`, `/guias/` y `/cuotas`. En `/prestadores`:
  el H1 real, la bajada y los H2 de las secciones de la página. En
  `/calendario-fauna/`: el título y la bajada escritos con **el mismo texto**
  que el script ya ponía (`CONFIG.titulo` / `CONFIG.bajada`), así que no hay
  ningún cambio visual. Verificado en producción con navegador real: React
  monta en las dos, reemplaza el bloque, cero errores de JavaScript, y el
  contenido rendereado es el de siempre.
- **01/11/2026** — Enlaces internos a `/cuotas` y `/ecosistema`, que estaban en
  el sitemap sin recibir ni un enlace. Entraron a la columna "Ecosistema" del
  footer de `BaseLayout.astro` (todas las páginas de Astro: fichas, guías y
  listados) y al bloque de enlaces del HTML de la home, junto con `/aike`. Los
  tres van sólo en español (`idioma !== 'pt'`): no tienen versión en portugués.
  Verificado en producción: aparecen en `/experiencias/` y en la home, y en
  ninguna página de `/pt-br/`. `/alianzas`, que figuraba como huérfana, está en
  `noindex, nofollow` **a propósito** (alta por convenio): no corresponde
  enlazarla. `/aike` ya recibía enlaces de varias guías de viaje.

- **31/10/2026** — Meta descriptions escritas a mano en las 93 fichas en
  español. Hasta hoy salían todas de `textoPlano.slice(0, 157)`, un recorte
  ciego del cuerpo que carga el prestador. Lo que se publicaba en Google:
  listas de inventario ("BICICLETA DE MOUNTAIN BIKE 1 de rodado 20 con cambios
  3 de rodado 26 con 27 velocidades…"), entidades HTML sin decodificar
  ("Tabla de esquí&nbsp; Bastones" — el admin guarda `&amp;nbsp;`, doble
  codificado), cortes en mitad de una palabra en el 100% de los casos, y los
  7 grupos de fichas que comparten texto publicando la **misma** description:
  17 fichas con snippet clonado. Ahora `src/data/meta-es.json` tiene las 93,
  una por slug, escritas desde el contenido real de cada ficha: 124–150
  caracteres, **cero duplicadas**. Es el espejo en español de `metaDescricao`
  de `traducciones-pt.json`. Verificado en producción: 93 de 93 sirven la
  description escrita, cero duplicadas, cero cortes.
- **31/10/2026** — Respaldo automático limpio para las fichas que todavía no
  tengan description escrita (`src/lib/descripciones.js`): decodifica
  entidades en dos pasadas, corta en fin de oración o de palabra entera, no
  deja preposiciones, números ni paréntesis colgados, y agrega la localidad al
  final si el texto no la nombra. Hoy no aplica a ninguna ficha: es la red
  para las que cargue el admin mañana.
- **31/10/2026** — Las 60 guías de viaje dejaron de cortar la description en
  mitad de una palabra. Las 59 del sitemap publicaban todas 157 caracteres
  cortados en seco: "increíbles mirad…", "actividades más destaca…",
  "paisaje impon…", "la cultura fuegu…". Ahora usan el mismo recorte limpio:
  **56 de 59 cambiaron**, 26 cierran en una oración completa, las 33 que
  siguen con puntos suspensivos cortan en palabra entera, y el largo medio
  pasó de 158 a 141 caracteres.
- **31/10/2026** — Corrección de la bitácora: era **falso** que las fichas en
  portugués usaran el mismo recorte ciego. Las 59 traducidas traen
  `metaDescricao` escrita a mano en `traducciones-pt.json` (60 de 60 entradas),
  con CTA y sin una sola repetida; el `slice` de `/pt-br/` es sólo el respaldo
  y hoy no se usa en ninguna página. El problema era únicamente del español.
  Las descriptions en portugués **no se tocaron**: se verificó que las 59
  siguen idénticas después del deploy.

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

### 31/10/2026 — Meta descriptions escritas a mano en las 93 fichas en español

Los dos pendientes de arriba siguen necesitando Search Console o una decisión
de catálogo, así que arranqué por el 3, las meta descripciones. La corrida del
30/10 lo había dejado en espera con el argumento de que arreglar el recorte
"no arregla los grupos repetidos". Es cierto, pero no era razón para no
mejorar las otras 76: el recorte estaba publicando basura en el 100% de las
fichas, no sólo en las repetidas.

Antes de tocar nada rastreé las 93 fichas en español, las 59 en portugués y
las 59 guías de producción (validando el tamaño de cada respuesta). Tres
hallazgos. Uno: las 93 descriptions en español salían de `slice(0, 157)` y el
resultado era malo de maneras concretas y medibles — 7 grupos con la misma
description (17 fichas), entidades `&amp;nbsp;` sin decodificar que en el
resultado de Google se leen literalmente, y el 100% cortadas en mitad de una
palabra. Dos: **en portugués esto ya estaba resuelto** y la bitácora lo tenía
mal anotado; las 60 entradas de `traducciones-pt.json` traen `metaDescricao`
escrita a mano, sin una sola repetida. Tres: las 59 guías tenían el mismo
problema de corte en seco.

Así que el trabajo fue hacer en español lo que ya existía en portugués:
escribir las 93 a mano, desde el contenido real de cada ficha, y guardarlas en
`src/data/meta-es.json` — dato, no código, así que se corrigen sin tocar el
template ni volver a compilar la lógica. El respaldo automático quedó en
`src/lib/descripciones.js` para las fichas futuras, y lo reusan las guías y el
respaldo del portugués. No se tocó precio, seña, saldo, checkout ni Make: todo
el cambio vive en el `<head>`. De regalo, el `textoPlano` que alimenta el
JSON-LD de `Product` ahora está decodificado, así que el `description` de los
datos estructurados deja de llevar `&nbsp;`.

Compilé, subí, esperé el deploy y volví a rastrear: **93 de 93 fichas sirven
exactamente la description escrita, cero duplicadas, cero cortes, largo medio
137 caracteres**; 56 de las 59 guías cambiaron y ya no hay ninguna cortada en
mitad de palabra; y las 59 descriptions en portugués quedaron idénticas, como
correspondía. Avisé por IndexNow: Yandex aceptó, Bing sigue en 403 (falta
reclamar el sitio, es tarea de Marcelo).

**Qué mido como resultado esperado:** suba del porcentaje de clics en las
fichas, que es lo que mueve una description. Hoy el snippet de media docena de
fichas era directamente ilegible (listas de rodados de bicicleta, `&nbsp;`
crudo) y Google, al no poder usar la description, se inventaba el snippet con
un trozo cualquiera de la página. Ahora cada ficha dice en 140 caracteres qué
es, dónde queda, cuánto dura y qué incluye. En las 17 fichas que tenían
snippet clonado, además, el usuario ya puede distinguir una de otra en la
lista de resultados — eso no arregla el duplicado de contenido, pero sí la
elección en el resultado de búsqueda.

**Qué quedó pendiente:** el duplicado real del catálogo sigue abierto y es lo
que más cuesta (pendiente 3 reescrito: es decisión de Marcelo, grupo por
grupo). Anoté dos pendientes nuevos y chicos: 6 guías quedaron con la
description corta (81–109 caracteres) porque su primera oración es breve y la
segunda no entra, y hay que cargarles una `bajada` propia; y **cada corrida
tiene que cruzar el sitemap contra las claves de `meta-es.json`** y escribir
la description de las fichas nuevas que haya publicado el admin, porque si no
caen al respaldo genérico.

### 01/11/2026 — Encabezados en el HTML de /aike, /prestadores y /calendario-fauna + enlaces a las huérfanas

Arranqué por el mantenimiento obligatorio: crucé las 93 fichas del sitemap
contra las claves de `src/data/meta-es.json` y están las 93, ninguna de menos
y ninguna de más, así que el admin no publicó fichas nuevas desde el 31/10 y
no hubo descriptions que escribir. El sitemap sigue en 241 URLs (93 fichas en
español, 59 en portugués, 60 guías y el resto de `public/`).

De los pendientes, los seis primeros siguen trabados por lo mismo de siempre:
Search Console sin conectar, la decisión de catálogo sobre los 7 grupos
repetidos, y `priceValidUntil`, que toca la vigencia del precio. Así que el
trabajo de la corrida fue el 7 y el 8, que sí eran accionables.

El 7 era el más grave de los dos. `/aike` y `/prestadores` son aplicaciones
React que se montan sobre un `<div id="root">` vacío: el HTML que sirve
Cloudflare no traía **ningún** encabezado ni una línea de texto, y
`/calendario-fauna/` traía el `<h1>` vacío. Google renderiza JavaScript, pero
llega tarde y pondera peor; Bing, DuckDuckGo, Yandex y los rastreadores de los
modelos de IA no renderizan nada y hoy veían tres páginas en blanco que están
en el sitemap. Usé el mismo patrón que la home ya tenía escrito desde antes
(bloque real dentro de `#root`, React lo reemplaza al montar), que además
mejora lo que ve el visitante: antes era una pantalla negra hasta que bajaban
Tailwind, React y Firebase desde tres CDNs distintos; ahora lee el título y el
primer párrafo. En `/calendario-fauna/` escribí exactamente el texto que el
script ya ponía, así que ahí no cambia ni un píxel.

El 8 era chico: `/cuotas` y `/ecosistema` estaban en el sitemap sin un solo
enlace interno. Sumé los dos (más `/aike`) a la columna "Ecosistema" del
footer de `BaseLayout.astro`, que sale en las ~215 páginas de Astro, y al
bloque de enlaces del HTML de la home. Sólo en español: ninguna de las tres
tiene versión en portugués, así que `/pt-br/` quedó igual. Corregí también el
pendiente: `/alianzas` no es una huérfana para arreglar, está en `noindex` a
propósito porque es el alta por convenio.

De paso barrí las 50 páginas HTML de `public/` buscando más casos de H1
faltante o vacío y más fugas de indexabilidad: no quedó ninguna. Las únicas
sin H1 son `billetera-turista` (ya en `noindex`) y una plantilla de email, y
`guias.html` y `patagonia-experiencias_v11` responden 301. El trabajo del
28/10 cerró bien ese frente.

Compilé con `DATOS_LOCALES=1 npx astro build` antes de cada push, subí los dos
commits, esperé el deploy y verifiqué en producción: las tres páginas sirven
H1 y H2 en el HTML, los enlaces nuevos están en `/experiencias/` y en la home
y no están en `/pt-br/`, y con un navegador real (Playwright) confirmé que
React sigue montando en `/aike` y `/prestadores`, reemplaza el bloque y no
tira ningún error. Avisé por IndexNow: Yandex aceptó las 241 URLs, Bing sigue
en 403 por el sitio sin reclamar.

**Qué mido como resultado esperado:** que `/aike`, `/prestadores` y
`/calendario-fauna/` empiecen a aparecer en Bing y DuckDuckGo, donde hoy no
pueden posicionar porque esos buscadores no ejecutan JavaScript — y en Google,
que `/prestadores` gane posiciones para "sumar mi agencia de turismo" y
parecidas, que es la búsqueda que capta prestadores nuevos. De los enlaces
internos, que `/cuotas` y `/ecosistema` pasen de "descubierta por el sitemap"
a indexadas: ahora tienen ~215 enlaces internos cada una en vez de cero.

**Qué quedó pendiente:** del 7 queda la parte de rendimiento puro (Tailwind
por CDN compilando en el navegador en las páginas de `public/`, imágenes
pesadas en las guías), que conviene hacer de a una página por corrida; y hay
que tener presente que el CDN de Tailwind también está en
`public/patagonia-experiencias.html`, que es zona prohibida. Los enlaces que
puse dentro del bloque de `/aike` y `/prestadores` desaparecen del DOM cuando
React monta, así que valen para el HTML crudo y para los buscadores que no
renderizan, no como enlazado interno para Google. Y lo de siempre: Bing sigue
sin reclamar y las 147 no indexadas siguen necesitando Search Console.

### 02/11/2026 — Las 5 fichas nuevas: description en español y versión pt-BR a mano

Arranqué por el mantenimiento obligatorio y esta vez sí había trabajo: el
sitemap pasó de 241 a 246 URLs y el cruce contra `meta-es.json` dio 5 fichas
nuevas sin description escrita — cuatro de Ushuaia (pingüinos de Isla Martillo
en barco pequeño, Puerto Almanza con la Ruta de la Centolla, y dos del Parque
Nacional Tierra del Fuego) y una de El Calafate (tour alternativo al Glaciar
Moreno). El respaldo automático las cubría, pero mal: tres cortaban con puntos
suspensivos y la del Glaciar Moreno publicaba "Descripción Salimos temprano…",
porque ese prestador arranca el texto con un `<h3>Descripción</h3>` y el
recorte se come el encabezado como si fuera la primera palabra de la oración.
Las escribí a mano, 126–140 caracteres cada una.

El trabajo grande de la corrida fue el otro lado: **ninguna de las 5 tenía
página en portugués**, y Ushuaia y El Calafate son los dos destinos de la
Patagonia que más busca un brasileño. Las traduje a mano directamente en
`src/data/traducciones-pt.json` — título, meta description de 137–141
caracteres, cuerpo completo, destino, categoría, duración, texto alternativo y
3 FAQ por ficha — usando las palabras con las que se busca en Brasil
("passeio", "pinguins", "observação de pinguins da Isla Martillo", "trilha",
"Parque Nacional Terra do Fogo", "Trem do Fim do Mundo"), no una traducción
literal del español. Sólo datos: no se tocó el template, ni precio, ni seña, ni
checkout, ni Make. Compilé contra Firestore real (227 páginas, build limpio),
subí, esperé el deploy y verifiqué en producción: las 5 URLs nuevas en
`/pt-br/experiencias/` dan 200, el sitemap pasó a 251 URLs, las 5 fichas en
español sirven la description escrita y el hreflang es recíproco en los dos
sentidos. El JSON-LD de las nuevas en portugués sale completo (Organization,
Product con `offers`, BreadcrumbList y FAQPage con 3 preguntas). Avisé por
IndexNow: Yandex aceptó, Bing sigue en 403.

**Qué mido como resultado esperado:** que las 5 fichas nuevas aparezcan en
Google Brasil para búsquedas como "passeio pinguins Ushuaia", "Parque Nacional
Terra do Fogo passeio" y "Perito Moreno passeio alternativo", que hoy el sitio
no puede capturar porque no tenía una sola página de esos destinos en
portugués; y en español, que la ficha del Glaciar Moreno deje de mostrar un
snippet que empieza con la palabra "Descripción".

**Qué encontré y no toqué:** medí por fin el pendiente de los slugs repetidos y
es peor de lo que decía la bitácora. Firestore tiene 113 tours activos y el
sitio publica 98 fichas: **15 tours no tienen página en ninguna parte** porque
dos prestadores cargaron el mismo tour con el mismo título y la URL se arma
desde el título. No es sólo contenido duplicado: son 15 productos que no se
pueden encontrar ni reservar. Hay un caso (`navegacion-rio-grande-full-day`)
que es el mismo prestador cargado dos veces, para borrar en el admin, y dos
casos que publican precios distintos según cuál gane (`piedra-parada`
$250.000 contra $210.000, `peninsula-valdes` $150.000 contra $160.000 y además
con distinta localidad). Quedó todo en "Para Marcelo" con los 15 slugs, los ids
y los precios: el arreglo del lado del código toca `src/lib/contenido.js`, que
es zona prohibida, y además hace falta decidir qué prestador recibe la reserva.

**Qué quedó pendiente:** 34 de las 98 fichas siguen sin versión en portugués, y
ahí está Punta Tombo, que para el mercado brasileño es tan fuerte como
Península Valdés ("pinguins Punta Tombo"). Lo anoté como pendiente 4 con la
lista completa y el método: 5 fichas por corrida, escritas a mano. Y anoté un
pendiente nuevo (el 8): las 98 fichas en español no publican FAQPage, porque
las preguntas sólo existen en el archivo de traducciones; hace falta un
`faq-es.json` espejo.
