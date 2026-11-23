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

Tamaño del sitio al 16/11/2026: **305 URLs** (303 el 15/11 + las dos
guías de El Calafate). Detalle histórico al 13/11/2026: **292 URLs** en el sitemap — 112 fichas en
español, 84 fichas en portugués, 60 guías de viaje, **seis páginas
informativas en portugués** (calendario de fauna, Puerto Madryn, la puerta de
entrada general, Esquel–Trevelin, la gastronómica y Ushuaia), **la guía de
Ushuaia en español** (13/11, en Astro) y el resto de `public/`.
En Firestore hay 113 tours activos y ahora se publican los 113 menos uno: el
único que queda afuera es un duplicado de carga del mismo prestador
(`navegacion-rio-grande-full-day`), que hay que borrar en el admin.

## Para Marcelo

- **La ficha nueva del Hotel Gema se llama "Alojamiento" y por eso su URL es
  `/experiencias/alojamiento/`. Conviene renombrarla en el admin HOY, antes de
  que Google la indexe.** Apareció el 20/11: un prestador nuevo de Comodoro
  Rivadavia, Gema Hotel Cr. La URL de una ficha se arma con su título, así que
  un título de una palabra genérica deja la dirección más pobre del catálogo:
  `/experiencias/alojamiento/` no dice ni el hotel ni la ciudad, y es la que
  queda indexada para siempre. **Lo que hay que hacer es un renombre en el
  admin**, por ejemplo "Alojamiento para grupos y empresas — Hotel Gema": con
  eso la URL pasa a `/experiencias/alojamiento-para-grupos-y-empresas-hotel-gema/`
  sola. Mientras tanto el título y el `h1` que se publican ya están corregidos
  desde el código ("Hotel Gema, alojamiento para grupos y empresas en Comodoro
  Rivadavia") y la meta description está escrita a mano, así que **la página no
  está rota**: lo único que no se puede arreglar desde acá es la URL. **Ojo
  también: la ficha está cargada dos veces** (ids `RiV0GqfYMCOPpbfwYJPL` y
  `h40W75qxG8LaAiiMEj1Q`, texto idéntico); se publica una sola, pero conviene
  borrar la sobrante en el admin. Es el segundo duplicado de carga del
  catálogo, junto con `navegacion-rio-grande-full-day` de MerakiSur, que
  seguís teniendo anotado.

- **¿Neuquén entra al sistema? El catálogo estrenó Caviahue y el volcán
  Copahue, y necesito que me digas si se queda.** Visto el 19/11: el sitemap
  pasó de 305 a 308 URLs y las tres nuevas son de un prestador de geoturismo de
  **Caviahue, Neuquén** —el ascenso al cráter del volcán más activo del país, el
  ascenso a la cumbre (2.960 msnm, con glaciar) y el Salto del Agrio—. Es la
  primera vez que el catálogo sale de Chubut, Tierra del Fuego y Santa Cruz. Las
  tres fichas están bien y ya les escribí la meta description a mano, pero están
  **sueltas**: ninguna guía ni página de destino del sitio nombra Caviahue, así
  que cuelgan sólo del listado, y el bloque de "seguí explorando la zona" les
  pone al lado Trevelin, Valdés y Ushuaia, que están a mil kilómetros. Si el
  prestador se queda, el trabajo es claro y lo hago en una corrida: una página
  informativa de Caviahue–Copahue en español (el volcán, el salto, las termas y
  la nieve), el destino sumado al menú y al footer, y después la versión en
  portugués. **Si fue una prueba, decime y las dejo como están** sin gastar
  corridas en tejerlas. No lo decido yo porque el sitio se presenta como
  experiencias "de todo el Chubut y la región" y abrir provincia es tu decisión.

- **Faltan 35 fotos del micrositio del valle del Chubut, y cuatro guías
  publicadas se ven con todas las imágenes rotas.** Medido el 18/11
  renderizando las seis páginas. En
  `public/guias-de-viaje/valle-del-chubut/img/` están subidas las de Trelew
  (9 de 9) y las dos del valle, y **no está ninguna de las otras cuatro
  localidades**: Gaiman pide 10, Dolavon 9, Rawson 9 y 28 de Julio 7. Además,
  en la portada del micrositio las tarjetas de esas cuatro localidades piden
  `28julio-hero.jpg`, `dolavon-hero.jpg`, `gaiman-hero.jpg` y
  `rawson-hero.jpg`, que tampoco están: la portada se ve con un hueco por
  tarjeta. Son **cuatro páginas que están en el sitemap y que Google ya
  rastrea**, sirviendo con todas las fotos en 404. El nombre de cada archivo
  que falta sale de correr
  `node scripts/barrido-render.mjs --fallos <url>` sobre cada una. **Esto no se
  arregla con código: hacen falta las fotos.** Van en esa carpeta, con
  exactamente ese nombre. Mientras tanto, la `og:image` de las cuatro apunta a
  `valle-hero.jpg` para que al menos se compartan con una foto del valle.
- **26 de los 40 logos de prestadores de `/ecosistema` no existen.** Medido el
  18/11: la página pide `assets/logos/Logo 01.png` a `Logo 40.png` y en el repo
  sólo están 01–09 y 12–16, así que **26 imágenes dan 404** y se ven como
  huecos. O se suben los 26 logos que faltan, o se sacan de la página las
  tarjetas que no tienen logo; lo que no conviene es dejarla así, porque es la
  página que muestra el ecosistema a un prestador que está decidiendo si entra.
- **`/sumar-gastronomia` es el tercer callejón sin salida, además de `/aike` y
  `/cuotas`.** Medido el 18/11: renderiza **cero enlaces** y tampoco tiene Open
  Graph, así que al compartirla no muestra tarjeta. Es una página de captación
  de restaurantes y está en el sitemap. Mismo arreglo que las otras dos: el
  footer compartido. Lo anoto junto a ellas y no lo toco por lo mismo —es una
  landing de captación y no quiero cambiarle el diseño sin tu OK—, pero las tres
  juntas son un arreglo de una corrida.
- **Corrección sobre los seis `.html` del buscador de reservas: viven en un
  archivo aparte, no adentro del checkout.** El 17/11 te los anoté como "seis
  `href` dentro de `public/patagonia-experiencias.html`". Revisado el 18/11:
  están en **`public/footer.js`**, el footer compartido que inyectan cinco
  páginas (`patagonia-experiencias`, `prestadores`, `ecosistema`,
  `manual-prestador` y la copia vieja `_v11`). O sea que **el arreglo es más
  barato de lo que te dije**: se cambian seis `href` en un solo archivo, que no
  tiene una línea de precios, de seña y saldo, de Mercado Pago ni de los
  webhooks de Make —sólo arma el HTML del pie—, y quedan arregladas las cinco
  páginas de una vez. No lo hice igual, porque ese archivo se inyecta en el
  checkout y vos todavía no me contestaste. Decime que sí y va en la próxima
  corrida, con el diff a la vista. (De paso: el footer compartido enlaza hoy
  sólo siete páginas internas, y no enlaza `/experiencias/`, ni las páginas de
  destino, ni `/pt-br/`. Si querés, en la misma corrida le sumo esos enlaces y
  el footer pasa a repartir autoridad en todo el ecosistema, que es lo que
  pediste.)

- **El footer del buscador de reservas sigue enlazando con `.html`, y es zona
  prohibida.** El 17/11 se sacaron los `.html` de los enlaces internos de nueve
  páginas de `public/` (ver "Hecho"), pero `public/patagonia-experiencias.html`
  no se tocó porque es el checkout. Esa página enlaza `prestadores.html`,
  `manual-prestador.html`, `ecosistema.html`, `terminos.html`,
  `privacidad.html` y `patagonia-experiencias.html` —seis enlaces que pasan por
  una redirección 308 cada vez que un buscador la rastrea—, y es la página con
  más tráfico del sitio. **Es cambiar seis `href`: no toca precios, ni el
  cálculo de seña y saldo, ni Mercado Pago, ni los webhooks de Make.** Decime
  si lo hago y lo hago en una corrida, con el diff a la vista antes de pushear.
- **`/aike` y `/cuotas` son callejones sin salida para Google.** Medido el
  17/11 renderizando las dos con Chromium: la página ya montada **no tiene un
  solo enlace** (`<a href>` = 0), ni al buscador de reservas, ni a la home, ni
  al footer del resto del sitio. El rastreador entra, lee y no tiene por dónde
  seguir, y ninguna de las dos le pasa autoridad a nada. No es un bug —las dos
  funcionan— pero las dos están fuera del tejido del sitio. El arreglo es el
  mismo footer que ya tienen las demás páginas, que es justo lo que pediste
  para todo el ecosistema; lo dejo anotado porque `/cuotas` es una landing de
  venta y prefiero no tocarle el diseño sin tu OK.

- **Hueco de catálogo en Santa Cruz: tenemos una sola ficha en todo El
  Calafate.** Anotado el 16/11 al publicar la guía de destino en los dos
  idiomas. Lo único publicado es `tour-alternativo-al-glaciar-moreno`, y es una
  ficha buena —la ruta de las estancias y la playa de icebergs, que casi nadie
  vende—, pero **"Perito Moreno" es probablemente la búsqueda más grande del
  brasileño en toda la Patagonia** y de todo lo que la página cuenta no
  vendemos nada más. Las tres que más valdrían, por orden: el **minitrekking**
  sobre el glaciar (es lo que todo el mundo busca después de ver las
  pasarelas), la **navegación Todo Glaciares** a Upsala y Spegazzini, y
  cualquier prestador de **El Chaltén** (las caminatas son gratis, pero el
  traslado El Calafate–El Chaltén, las cabalgatas y las salidas guiadas sí se
  venden). Con la guía ya publicada en las dos lenguas, una ficha nueva en
  Santa Cruz empieza con enlace interno desde una página de destino el mismo
  día en que se carga: es el lugar del catálogo donde un prestador nuevo rinde
  más rápido.
- **Dos fichas más publican el mismo texto que otra ficha nuestra, y éstas no
  son hermanas de slug.** Revisado el 16/11 (ver "Hecho"):
  `comarca-andina-full-day` de MerakiSur es palabra por palabra `comarca-andina`
  de LIMITS ADVENTURE, y `astroturismo-y-aventura-en-lago-rosario` de MerakiSur
  es la versión recortada de `astroturismo-en-lago-rosario-lodge` de LIMITS.
  Las dos agencias cargaron el texto del mismo operador. **Son dos páginas
  nuestras compitiendo entre ellas en Google hoy**, y a diferencia de los otros
  seis casos acá no hay nada en el código que lo detecte, porque los títulos
  son distintos. Decidir: una se queda con el texto y la otra se reescribe en
  el admin, o se despublica la repetida.
- Confirmar que el número de `WHATSAPP_PT` (+54 9 2945 64-2052) es el del guía
  que atiende en portugués.
- **Hueco de catálogo en Ushuaia: no vendemos la navegación del canal Beagle.**
  Encontrado el 12/11 escribiendo la guía de Ushuaia en portugués. De los 15
  tours de Tierra del Fuego que hay en Firestore, **sólo 8 están activos**, y
  entre los 7 inactivos están las dos navegaciones del canal Beagle
  (`Navegación Canal Beagle Pinguinera` y `Navegación Canal Beagle Lobos`), los
  dos Lagos Escondido y Fagnano viejos, la cabalgata en Lago Escondido, un
  Parque Nacional duplicado y el HELIEXPERIENCE de Laguna Esmeralda. **La
  navegación del Beagle es la búsqueda número uno del destino** —"navegação
  canal Beagle", "lobos marinos Ushuaia", "farol do fim do mundo"— y es lo
  primero que compra el que llega. Tampoco tenemos nada de nieve (Cerro Castor,
  trineo con perros, raquetas) ni de Antártida, que son las otras dos cosas por
  las que a Ushuaia se la busca. La página nueva las cuenta igual, porque una
  guía de destino que las omite no sirve, pero **sin enlace: estamos contando
  un paseo que después no podemos vender**. Si alguna de las dos navegaciones
  del Beagle se puede reactivar con el prestador, es la ficha de más valor por
  hora de trabajo que queda en todo el catálogo.
- **`www.patagoniaexperiencias.com` sirve el sitio entero con 200, no redirige.**
  Encontrado el 08/11 probando lo de Bing. En `public/_redirects` hay una regla
  `https://www.patagoniaexperiencias.com/* → https://patagoniaexperiencias.com/:splat 301`
  que **no se está aplicando**: el `www` devuelve 200 en la home, en
  `/puerto-madryn` y en `/pt-br/`, y tiene su propio `robots.txt`. No es grave
  —todas las páginas declaran el `<link rel="canonical">` al dominio sin `www`,
  así que Google consolida ahí— pero es el sitio entero duplicado en un segundo
  hostname. **El arreglo no es de código:** el `www` está enganchado al proyecto
  de Cloudflare Pages y Pages lo sirve antes de mirar `_redirects`. Se resuelve
  en el panel de Cloudflare, con una Redirect Rule de `www` al dominio sin `www`,
  o sacando el `www` de los dominios personalizados del proyecto. Eso necesita
  tu acceso a Cloudflare.
- Conectar Google Analytics para el informe semanal automático de consultas.
- Conectar Search Console, para que la tarea de la madrugada pueda ver el detalle
  de las páginas no indexadas y las búsquedas reales de Argentina y Brasil.
- Reclamar el sitio en Bing Webmaster Tools (se importa desde Search Console),
  para destrabar IndexNow en Bing.
- **Pasame el token de verificación por archivo XML de Bing.** Dijiste que ya
  reclamaste el sitio, pero IndexNow sigue devolviendo 403 el 08/11 y otra vez
  el 09/11, 24 horas después, con la clave publicada y accesible. En Bing
  Webmaster Tools, en Settings → Verify ownership → **Option 1 (XML file)**,
  hay un archivo `BingSiteAuth.xml` para descargar: pasame su contenido (o el
  código que trae adentro) y la corrida lo sube a la raíz del sitio. Eso cierra
  la verificación sin depender de la importación desde Search Console, que es
  lo que sospecho que quedó a medias.
- **Borrar en el admin el tour cargado dos veces.** `NAVEGACION RIO GRANDE |
  FULL-DAY` de MerakiSur está cargado dos veces, idéntico y con precio 0: ids
  `fZ0VBHDYqMvwDDBeDUuI` y `tgm3Dss1qfqQdiiyQ4hc`. El sitio publica uno solo
  (el build avisa en el log), así que no molesta para el SEO, pero conviene
  borrar el sobrante en el admin para que no reaparezca. De paso: el precio 0
  hace que la ficha se publique sin precio.
- **Dos fichas hermanas publican precios distintos.** Desde el 02/11 cada
  prestador tiene su propia URL, así que ahora se ven las dos en Google y la
  diferencia queda a la vista: `piedra-parada` de LIMITS ADVENTURE ($210.000)
  contra `piedra-parada-merakisur` ($250.000, y la de MerakiSur dice "día
  completo" contra las "10 horas" de la otra); y `peninsula-valdes` de
  Forastero tour ($160.000) contra `peninsula-valdes-sussanich-turismo`
  ($150.000, que sale de Puerto Pirámides en vez de Puerto Madryn y dura 11
  horas). No hay nada roto —son dos productos de dos agencias— pero si querés
  que no compitan por precio, eso se arregla en el admin, no en el código.
- **Seis pares de fichas hermanas publican el mismo texto.** Distinto de la
  nota de abajo: acá son las 14 fichas que el 02/11 pasaron a tener URL propia
  por prestador, y en 6 de esos 14 casos las dos agencias cargaron **palabra por
  palabra el mismo texto** (el del operador que presta el servicio). En español
  ya están las dos publicadas y compitiendo entre ellas:
  `trevelin-full-day-con-visita-al-campo-de-peonias-merakisur`,
  `ruta-galesa-con-complejo-hidroelectrico-futaleufu-merakisur`,
  `parque-nacional-los-alerces-portada-centro-y-complejo-hidroelectrico-futaleufu-merakisur`,
  `ruta-galesa-con-complejo-hidroelectrico-futaleufu-con-visita-al-campo-de-peonias-limits-adventure`,
  `alquiler-de-bicicletas-merakisur` y
  `parque-nacional-los-alerces-half-day-limits-adventure`. En portugués decidí
  **no** traducirlas, para no duplicar el problema en el otro idioma. Lo que hace
  falta es que cada prestador cuente lo suyo (qué incluye, qué no, desde dónde
  sale, cuánto dura), y eso se carga en el admin. Las otras 8 hermanas sí tienen
  texto propio y 5 ya tienen su página en portugués.

- **Dos fichas distintas venden El Doradillo.** `doradillo` y
  `el-doradillo-avistaje-costero-ballena-franca-austral` son el mismo lugar y
  el mismo producto (avistaje costero de ballena franca en el área protegida de
  El Doradillo), de dos prestadores distintos. **No es el caso de los
  duplicados de abajo: los textos son propios de cada uno**, con datos que ni
  siquiera coinciden (una dice 18 km de Puerto Madryn, la otra 19 km y 30 km de
  costa desde Punta Arco hasta el Cerro Prismático). Están las dos publicadas
  en español y en portugués, así que compiten entre ellas por la misma
  búsqueda. No hay nada roto y no hace falta tocar nada; si querés que no se
  pisen, lo que diferencia de verdad es que cada ficha diga desde dónde sale,
  cuánto dura y qué incluye, y eso se carga en el admin.

- **Las dos astroturismo de Lago Rosario son el mismo paseo, cargado dos
  veces.** `astroturismo-y-aventura-en-lago-rosario` (MerakiSur) y
  `astroturismo-en-lago-rosario-lodge` cuentan el mismo día, con el mismo
  itinerario, el mismo lodge a 48 km de Esquel y las mismas tres actividades a
  elección: la segunda es la versión larga de la primera. No son fichas
  hermanas (tienen títulos distintos, así que no las agrupa `slugs.js`) y por
  eso no aparecían en la lista de duplicados de abajo, pero para Google son dos
  páginas del mismo producto compitiendo entre ellas. En portugués tradujimos
  **sólo la versión larga** (06/11) para no repetir el problema. Habría que
  dejar una sola en el admin, o diferenciarlas de verdad.
- **`PASEOS AEREOS Y DE BAUTISMO` está cargada con la categoría `trekking`.**
  Es un vuelo en avión sobre el valle de Trevelin: la categoría que se ve en la
  ficha y la que usa el filtro de la app dicen "trekking". En la versión en
  portugués se publicó como "passeios aéreos", así que hoy las dos lenguas
  dicen cosas distintas. Se arregla en el admin, en un campo.

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
2. **Las 7 fichas repetidas del catálogo siguen compitiendo entre ellas.**
   Resuelto el síntoma visible (31/10: cada ficha tiene su propia meta
   description escrita a mano, cero duplicadas), pero el cuerpo de la página
   sigue siendo idéntico en los 7 grupos y Google juzga el duplicado por el
   contenido, no por la description. **Esto no se arregla desde el código:**
   la decisión de catálogo está en "Para Marcelo" con los slugs grupo por
   grupo. Mientras siga abierta, cada grupo le resta posiciones al otro.
3. **19 fichas no tienen versión en portugués, y de las 19 ninguna es de
   impacto alto.** (Eran 28 al 06/11 y 20 al 14/11.) **Revisión del 16/11: las
   dos variantes que encabezaban este pendiente —`comarca-andina-full-day` y
   `astroturismo-y-aventura-en-lago-rosario`— resultaron calcos de su ficha
   principal y no se traducen** (ver "Hecho" del 16/11): pasan a la decisión de
   catálogo. Con eso **la cola de este pendiente queda sin nada de valor alto**:
   quedan los 6 restaurantes de Comodoro y Rada Tilly (texto propio pero
   Comodoro no es destino brasileño), las 6 habitaciones del AGUADA HOTEL de
   Trelew (casi calcos entre ellas: conviene traducir una o dos y no las seis,
   y ahora el valle tiene guía pt que las enlazaría), las 4 variantes de Ruta
   Galesa, tulipanes y peonías colgadas de la decisión de catálogo, y
   `safari-lacustre-al-alerce-milenario-cleona`, del grupo duplicado 1.
   **Recomendación para la corrida que agarre esto:** traducir una o dos
   habitaciones del AGUADA (la doble y la matrimonial superior) y cerrar;
   los restaurantes de Comodoro rinden menos que casi cualquier otra cosa de
   esta cola.

   **HECHO el 21/11/2026, y el pendiente queda prácticamente cerrado.** Se
   tradujeron **dos habitaciones del AGUADA HOTEL** —la matrimonial superior
   (casal) y la triple twin superior (família ou grupo)—, que son las dos más
   diferenciadas de las seis: una cubre la búsqueda de pareja y la otra la de
   familia, y entre ellas no se pisan. **Las otras cuatro no se traducen a
   propósito** (son casi calcos entre sí: cambia el tipo de cama y la ducha
   por la bañera, y seis páginas pt casi iguales serían contenido duplicado
   en portugués). Con eso, **lo que queda de este pendiente no tiene nada que
   valga una corrida entera**: los 6 restaurantes de Comodoro y Rada Tilly
   (texto propio pero Comodoro no es destino brasileño), las 4 variantes de
   Ruta Galesa/tulipanes/peonías y `safari-lacustre-al-alerce-milenario-cleona`
   —todas colgadas de la decisión de catálogo— y las tres de Caviahue, que
   están en el pendiente 3b esperando a Marcelo. **Se puede dar por cerrado
   salvo que el admin publique fichas nuevas con texto propio**, que es el
   chequeo del pendiente 13.

   *(Detalle del pendiente, que sigue valiendo como molde de trabajo.)*

   **Detalle anterior — 19 fichas no tienen versión en portugués.** (Eran 28 al 06/11 y 20 al
   14/11.) **Las cinco de Ushuaia de VÉRTICE se tradujeron el 15/11** y están
   en "Hecho": con eso Ushuaia pasó de 8 a 13 fichas pt y es el destino pt
   mejor cubierto después del valle. **De las 19 que quedan, por orden de
   impacto para Brasil:** las dos variantes que aparecieron en el barrido del
   15/11 y que **hay que revisar antes de traducir**
   (`comarca-andina-full-day` y `astroturismo-y-aventura-en-lago-rosario`:
   tienen description propia en español y su ficha principal —`comarca-andina`
   y `astroturismo-en-lago-rosario-lodge`— ya está en portugués, así que
   primero hay que leer si el texto es propio o un calco, como pasó con las
   tres de MerakiSur); después los 6 restaurantes de Comodoro Rivadavia y Rada
   Tilly (`tunet-restaurante`, `molle-verde`, `puerto-cangrejo`, `cordano`,
   `hilario`, `in-rada-tilly` — texto propio y bien escrito, pero Comodoro no
   es destino brasileño: valor bajo); las 6 habitaciones del AGUADA HOTEL de
   Trelew (**ojo: entre ellas son casi calcos**, conviene traducir una o dos y
   no las seis, y ahora el valle tiene guía pt que las enlazaría); las 4
   variantes de Ruta Galesa, tulipanes y peonías, colgadas de la decisión de
   catálogo; y `safari-lacustre-al-alerce-milenario-cleona`, del grupo
   duplicado 1.

   **Ojo con el método del barrido, corregido el 15/11:** el cruce contra
   `traducciones-pt.json` que da "fichas sin pt" **tiene falsos negativos con
   las hermanas**. Si se acepta como traducida una ficha cuya clave *base*
   existe en el JSON (`pt[slugUnico] || pt[slugificar(titulo)]`), la hermana
   queda tapada por la principal: así
   `trekking-laguna-esmeralda-vertice-expediciones` no aparecía como faltante
   aunque no tenía página pt. **El cruce tiene que ser sólo por slug único.**

   *(Lo de abajo es el detalle histórico del pendiente, que sigue valiendo
   como molde de trabajo.)*

   **Detalle anterior — 28 fichas no tienen versión en portugués.** Al 06/11 hay 112 fichas en
   español y 84 en portugués. Una ficha sin traducir **no puede posicionar en
   Brasil**: no existe en `/pt-br/` y no recibe hreflang. De las 28 que faltan,
   **18 se pueden traducir ya** y **10 no conviene traducirlas**: 6 son fichas
   hermanas que publican exactamente el mismo texto en español que su principal
   (ver el pendiente 4), 3 son las hermanas de MerakiSur que **revisadas el
   06/11 resultaron casi calcos** de su principal (`lago-bagillt-merakisur` es
   el mismo texto salvo el último párrafo; `rafting-en-corcovado-merakisur` es
   la primera mitad del texto de LIMITS, sin el bloque de qué incluye;
   `panoramicas-de-esquel-merakisur` repite el párrafo de LIMITS y le suma
   recomendaciones propias — ésa es la única de las tres que vale la pena, y
   recién después de la decisión de catálogo) y 1 es
   `safari-lacustre-al-alerce-milenario-cleona`, del grupo duplicado 1.
   Lo de más impacto ya está hecho: glaciares y aves (04/11) y vuelo panorámico
   de Trevelin, astroturismo de Lago Rosario, los dos paquetes de 3 noches
   (ski week en La Hoya y peonías en Trevelin) y Cantina Marcelino (06/11).
   **Novedad del 14/11: son 20, y las dos nuevas van primero.** El admin
   publicó dos fichas de VÉRTICE EXPEDICIONES en Ushuaia —
   `packrafting-rio-olivia` (actividad nueva: no había packrafting en el
   catálogo) y `trekking-laguna-esmeralda-vertice-expediciones` (hermana con
   texto propio de verdad, 5 horas con bastones y crampones incluidos contra
   las 6 horas de la de Noelia Ferrario)—. Las dos ya tienen su meta
   description en español. **Son las dos de más valor para traducir que hay
   hoy**, por tres razones: Ushuaia es de los destinos más buscados por el
   brasileño, la guía pt de Ushuaia ya está publicada y las enlazaría, y el
   packrafting no compite con nada del catálogo. **Ojo con la clave de la
   hermana:** va con el slug único
   (`trekking-laguna-esmeralda-vertice-expediciones`), no con el base, porque
   la base la tiene la ficha de Noelia Ferrario, que ya está en portugués.
   **De las otras 18, por orden de impacto para Brasil:** 6 restaurantes de
   Comodoro Rivadavia y Rada Tilly (`tunet-restaurante`, `molle-verde`,
   `puerto-cangrejo`, `cordano`, `hilario`, `in-rada-tilly` — texto propio y
   bien escrito, pero Comodoro no es destino brasileño: valor bajo), las 6
   habitaciones del AGUADA HOTEL de Trelew (**ojo: entre ellas son casi
   calcos**, conviene traducir una o dos y no las seis) y las variantes de Ruta
   Galesa, tulipanes y peonías que quedan colgadas de la decisión de catálogo. El resto son 7 habitaciones y paquetes de
   alojamiento, 6 restaurantes y varias variantes de Ruta Galesa, tulipanes y
   peonías. **Se traducen a mano, de a 5 por corrida** (como el 02, 03 y 04/11):
   escribir la entrada en `src/data/traducciones-pt.json` **con el slug único de
   la ficha como clave**, con título, meta description, cuerpo, destino,
   categoría, duración, alt y 2–3 FAQ. El `hash` sale de la huella de la ficha
   en Firestore (`huella()` de `scripts/traducir-pt.mjs`): con el hash correcto
   el script no vuelve a traducir por arriba de lo escrito a mano. Los tours se
   leen sin credenciales con la API REST pública de Firestore que usa
   `src/lib/contenido.js`, así que el cuerpo en español se saca de ahí y no hay
   que rasparlo del HTML. El script `scripts/traducir-pt.mjs` hace lo mismo con
   la API de Anthropic, pero pide `ANTHROPIC_API_KEY`, que la corrida de la
   madrugada no tiene.
3b. **NUEVO — el catálogo estrenó un destino, Caviahue y el volcán Copahue
   (Neuquén), y está suelto del resto del sitio.** Encontrado el 19/11 midiendo
   el sitemap: pasó de 305 a **308 URLs**, y las tres nuevas son
   `ascenso-crater-volcan-copahue`, `ascenso-cumbre-volcan-copahue` y
   `salto-del-agrio`, de un prestador de geoturismo de Caviahue. Es la primera
   vez que el catálogo sale de Chubut, Tierra del Fuego y Santa Cruz. Lo que les
   falta, por orden: **ninguna página informativa del sitio nombra Caviahue ni
   Copahue**, así que las tres cuelgan sólo del listado `/experiencias/` y del
   bloque "seguí explorando la zona", que les ofrece Trevelin, Valdés y Ushuaia
   —a mil kilómetros— porque no hay nada cerca; **ninguna tiene versión en
   portugués** (con eso el hueco pt del pendiente 3 pasa de 19 a 22 fichas, y
   éstas tres sí tienen texto propio); y **el footer y el menú no ofrecen
   Neuquén** como destino. Las descriptions escritas a mano ya se resolvieron
   hoy (ver "Hecho"). Lo que sigue, cuando Marcelo confirme que Neuquén es
   destino y no una prueba: una página informativa corta de Caviahue–Copahue en
   español que las enlace (el volcán activo, el salto multicolor, las termas y
   la nieve de Caviahue), y recién después la traducción pt. **Antes de
   escribirla hay que preguntarle a Marcelo** si el prestador se queda, porque
   el sitio se vende como "experiencias de todo el Chubut y la región" y abrir
   un destino nuevo es decisión suya, no de SEO.

3c. **NUEVO Y DE LOS MÁS GRANDES QUE QUEDAN — las páginas informativas de
   `public/` no enlazan ni una sola ficha: mandan los 130 enlaces a un ancla
   de la app de reservas.** Encontrado el 21/11 al sumarle el bloque de
   alojamiento a la guía de Trelew. Las guías y landings de `public/` enlazan
   cada tour como
   `href="/patagonia-experiencias#tour/<slug>" target="_blank"`, o sea **a un
   fragmento (`#tour/...`) de la app de reservas**. Para Google un `#` no es
   una URL distinta: los 130 enlaces cuentan como 130 enlaces a
   `/patagonia-experiencias` y **cero** a las 121 fichas de `/experiencias/`.
   O sea que las mejores páginas informativas del sitio —las que tienen el
   texto largo, los datos estructurados y las visitas— no le pasan
   absolutamente nada de autoridad interna a las páginas que venden, y toda
   la fuerza interna se concentra en una sola URL, que además es la de la app.
   El reparto medido hoy:

   | Página | enlaces a la app | enlaces a ficha |
   |---|---|---|
   | `/calendario-fauna/` | 44 | **17** (22/11) |
   | `/que-hacer-patagonia/` | 39 | **19** (23/11) |
   | `/guias-de-viaje/peninsula-valdes/` | 13 | 0 |
   | `/guia-peninsula-valle-2026` | 13 | 0 |
   | `.../peninsula-valdes/peninsula-valle` | 13 | 0 |
   | `/guias-de-viaje/valle-del-chubut/` (las 4 de localidad) | 2 c/u | 0 |
   | `/que-comer-patagonia/` | 1 | 0 |
   | `/guias-de-viaje/valle-del-chubut/trelew/` | 5 | **6** (21/11) |

   **OJO — CORRECCIÓN DEL 22/11: el reemplazo mecánico `#tour/<slug>` →
   `/experiencias/<slug>/` ES INCORRECTO y manda a la ficha del prestador
   equivocado.** El slug del ancla de la app es el `slugReserva`
   (`slugApp(titulo)` + sufijo `-2`, `-3` cuando dos prestadores cargaron el
   mismo título), y **no es el slug de la URL de Astro**, que desde el 02/11
   lleva sufijo de prestador. Medido hoy sobre los 17 slugs de
   `/calendario-fauna/`: **5 de 17 apuntaban a otra ficha**. El peor caso es
   `#tour/peninsula-valdes`, el más enlazado de la página (12 veces), que es
   el tour de SUSSANICH y cuya ficha es
   `/experiencias/peninsula-valdes-sussanich-turismo/` — mientras que
   `/experiencias/peninsula-valdes/` es **de otro prestador**. También estaban
   mal `piedra-parada`, `parque-nacional-los-alerces-full-day`,
   `panoramicas-de-esquel` y `trekking-laguna-esmeralda`.
   **El mapeo correcto sale de `/aike/catalogo.json`**, que publica
   `urlReserva` (el ancla de la app) y `urlFicha` (la URL de Astro) del mismo
   tour: se cruza `urlReserva` que termine en `#tour/<slug>` y se lee
   `urlFicha`. Cualquier corrida que siga con este pendiente tiene que usar
   ese cruce, nunca el slug pelado.

   **Avance al 23/11: van dos páginas de ocho, y son las dos más grandes.**
   `/calendario-fauna/` (22/11, 17 fichas) y `/que-hacer-patagonia/` (23/11,
   19 fichas). Entre las dos eran 83 de los 130 enlaces del problema, o sea
   **el grueso ya está**. Lo que queda son páginas chicas: las dos de
   Península Valdés (13 enlaces cada una, pero las dos son copias de la misma
   guía y una de ellas, `/guia-peninsula-valle-2026`, ya responde 301), la
   portada del micrositio del valle y las cuatro de localidad (2 enlaces cada
   una) y `/que-comer-patagonia/` (1). El método quedó probado dos veces y no
   tiene vueltas: cruzar `/aike/catalogo.json`, verificar 200 con `curl`,
   sumar la sección al final sin tocar un solo enlace existente, renderizar
   con Playwright a 1280 y a 390 px, y recién ahí pushear.

   **Y sobre reemplazar o sumar: el 22/11 se eligió SUMAR, y conviene seguir
   así.** En `/calendario-fauna/` los 44 enlaces `#tour/` **son el único
   camino a la oferta que tiene la página** (no hay ningún otro CTA de
   reserva), así que cambiarles el destino es tocar la venta. Lo que se hizo
   es lo que ya había funcionado en la guía de Trelew el 21/11: **un bloque
   nuevo al final que enlaza las fichas**, sin tocar un solo enlace existente.
   Cero riesgo de venta, reversible, y la página pasa de 0 a 17 enlaces a
   ficha. **Cómo hacerlo, que es lo que pide cuidado:**
   una página por corrida, verificando con `curl` que cada slug sirva 200
   antes de tocarlo (los slugs de ficha llevan sufijo de prestador desde el
   02/11 y el ancla de la app puede quedar viejo), renderizando después con
   `scripts/barrido-render.mjs` para confirmar que los enlaces sobreviven al
   JavaScript, y **sin tocar `public/patagonia-experiencias.html`**, que es
   zona prohibida: acá no se toca la app, sólo los enlaces que apuntan a
   ella desde las guías. El orden por impacto es el de la tabla:
   `/calendario-fauna/` y `/que-hacer-patagonia/` primero, que son 85 de los
   130. **Ojo con no romper la venta:** la ficha tiene su propio botón de
   reserva que lleva a la app, así que el camino a la compra sigue existiendo
   y gana un paso con contenido indexable en el medio; si Marcelo prefiere
   que el clic siga yendo derecho a la app, la alternativa es dejar el CTA
   como está y **sumar** un enlace de texto a la ficha, pero eso es decisión
   suya y conviene preguntarlo antes de hacer las dos páginas grandes.

4. **Seis fichas hermanas publican el mismo texto que su principal.** Resuelto
   el lado del código el 03/11 (ver "Hecho"): las traducciones se indexan por
   slug único y una hermana publica en `/pt-br/` en cuanto se le escribe su
   entrada. Lo que queda es de catálogo: de las 14 hermanas, 8 tienen texto
   propio y **6 publican en español, palabra por palabra, el mismo texto que su
   ficha principal** —dos agencias cargaron el texto del mismo operador—. Son
   `trevelin-full-day-con-visita-al-campo-de-peonias-merakisur`,
   `ruta-galesa-con-complejo-hidroelectrico-futaleufu-merakisur`,
   `parque-nacional-los-alerces-portada-centro-y-complejo-hidroelectrico-futaleufu-merakisur`,
   `ruta-galesa-con-complejo-hidroelectrico-futaleufu-con-visita-al-campo-de-peonias-limits-adventure`,
   `alquiler-de-bicicletas-merakisur` y
   `parque-nacional-los-alerces-half-day-limits-adventure`. Para Google son dos
   páginas iguales compitiendo entre ellas, en español ya hoy; en portugués no
   se traducen a propósito, para no repetir el problema. **Va en "Para Marcelo":
   es decisión de catálogo**, no de código.

   **Sumado el 16/11: son ocho, no seis, y dos de ellas no comparten slug.**
   `comarca-andina-full-day` (MerakiSur) publica palabra por palabra el texto
   de `comarca-andina` (LIMITS ADVENTURE), y
   `astroturismo-y-aventura-en-lago-rosario` (MerakiSur) es la versión
   condensada de `astroturismo-en-lago-rosario-lodge` (LIMITS), con un solo
   párrafo propio al final. **Estos dos casos son peores que los seis
   anteriores**, porque no son fichas hermanas de un mismo slug —tienen títulos
   distintos, así que `conSlugsUnicos` no los agrupa— y las dos se publican con
   URL limpia y compiten de verdad en español, hoy, sin que nada en el código
   lo marque. Revisarlos fue lo que pedía la bitácora del 15/11.
5. **`/pt-br/` casi no tiene contenido informativo. — CERRADO el 16/11/2026.**
   Las ocho páginas informativas en portugués están publicadas y las ocho
   tienen su par en español con `hreflang` recíproco: calendario de fauna
   (07/11), Puerto Madryn (08/11), la puerta de entrada general (09/11),
   Esquel–Trevelin (10/11), la gastronómica (11/11), Ushuaia (12/11, par en
   español el 13/11), el valle del Chubut (14/11) y **El Calafate y los
   glaciares (16/11, las dos lenguas en la misma corrida)**. Con eso
   `/pt-br/` cubre los cuatro destinos grandes de la Patagonia argentina,
   el país, el calendario de fauna y la gastronomía. **Lo que sigue de este
   pendiente, si se reabre, no es cobertura sino profundidad:** páginas de
   sub-destino (Puerto Pirámides, Gaiman, El Chaltén propio) o informacional
   de tema (quanto custa viajar pela Patagônia, roteiros de 7/10/15 dias en
   página propia). Antes de escribir una nueva conviene ver en Search
   Console, cuando esté conectado, qué consultas ya traen las ocho que hay.
   El molde quedó probado ocho veces y está descrito abajo.

   *(Lo de abajo es el detalle histórico del pendiente.)*

   **Detalle anterior.** Encontrado el 07/11:
   el español tiene 60 guías de viaje más 7 páginas informativas
   (`/calendario-fauna/`, `/que-hacer-patagonia/`, `/que-comer-patagonia/`,
   `/puerto-madryn`, `/valle-del-chubut`, `/esquel-trevelin`,
   `/guias-de-viaje/…`); el portugués tenía **84 fichas de venta y cero
   contenido informativo**. El brasileño que todavía no sabe cuándo viajar
   busca en informacional ("o que fazer em Puerto Madryn", "melhor época para
   ver baleias", "quanto tempo ficar em Puerto Madryn") y ahí no existíamos.
   Ya están hechas **dos**: el calendario de fauna (07/11) y la guía de
   destino de Puerto Madryn y Península Valdés (08/11), las dos en "Hecho".
   Ya están hechas **cinco**: el calendario de fauna (07/11), la guía de
   destino de Puerto Madryn y Península Valdés (08/11), la puerta de entrada
   general "o que fazer na Patagônia argentina" (09/11), la guía de **Esquel,
   Trevelin y Los Alerces** (10/11, con 32 fichas pt enlazadas) y la
   **gastronómica** "o que comer na Patagônia" (11/11, con 20 fichas pt
   enlazadas), las cinco en "Hecho". Con eso `/pt-br/` ya cubre los dos
   destinos grandes —costa y cordillera—, el país, el calendario de fauna y
   la gastronomía.
   Ya están hechas **seis**: con la guía de **Ushuaia y Tierra del Fuego**
   (12/11, las 8 fichas pt del destino enlazadas) `/pt-br/` cubre los tres
   destinos grandes de la Patagonia argentina.
   Ya están hechas **siete**: el 14/11 se publicó el **valle del Chubut**
   (`/pt-br/o-que-fazer-em-trelew-e-gaiman/`), con las 17 fichas pt del valle
   enlazadas y `hreflang` recíproco contra `/valle-del-chubut`.
   **Lo que queda es una sola: El Calafate y los glaciares.** Hoy tiene una
   ficha publicada (`tour-alternativo-al-glaciar-moreno`) y nada más, así que
   una guía de destino de allá no tiene a dónde derivar el clic: por eso el
   14/11 se eligió el valle, que tenía 17. Pero **"Perito Moreno" es
   probablemente la búsqueda más grande del brasileño en toda la Patagonia**,
   y la página se sostiene sola con contenido informativo (cuántos días, cómo
   llegar desde Brasil, la pasarela del glaciar, el minitrekking, El Chaltén y
   las dos caminatas que se hacen sin guía ni entrada, cuándo se rompe el
   frente de hielo). Dos caminos, los dos válidos: hacerla igual con la ficha
   que hay y aceptar que casi todo el clic se va a ir a `/pt-br/experiencias/`,
   o esperar a que Marcelo sume prestadores en Santa Cruz. **Si se hace, el
   molde ya está probado siete veces y el trabajo es de una corrida.**
   El molde: página Astro en
   `src/pages/pt-br/`, datos del mismo archivo que usa la página en español
   (una sola verdad), `hreflang` recíproco agregado a mano en el `<head>` de
   la página española de `public/`, FAQPage con las preguntas con las que
   busca un brasileño y enlaces a las fichas pt que correspondan. **Ojo:** las
   páginas informativas en español viven en `public/`, así que la versión en
   portugués conviene hacerla en Astro (como el calendario) y no duplicando
   HTML de 200 KB.
   **La excepción del 12/11 —la guía de Ushuaia sin hreflang— quedó cerrada
   el 13/11**: se publicó `/que-hacer-en-ushuaia/` en español, en Astro, y las
   dos páginas se declaran mutuamente. Las seis páginas informativas en
   portugués tienen hoy su par en español.
6. **Contenido pt-BR traducido a máquina.** Google Brasil premia el texto que
   suena nativo. Revisar las fichas con más impresiones y reescribirlas. Las 22
   del 02, 03 y 04/11 ya están escritas a mano; las 57 anteriores salieron del
   script. El primer caso concreto —la pt de `rafting-en-corcovado`, que se
   cortaba antes de "LA ACTIVIDAD INCLUYE"— quedó resuelto el 04/11 (ver
   "Hecho"). **Cómo buscar más casos del mismo tipo, que es lo que conviene
   hacer en la próxima corrida de este pendiente:** comparar, entrada por
   entrada, el largo del `descricao` en portugués contra el largo del cuerpo en
   español de la ficha en Firestore. Una traducción sana queda entre el 90% y
   el 115% del original; muy por debajo de eso es texto cortado. Vale también
   revisar que los bloques en mayúsculas del original ("LA ACTIVIDAD INCLUYE",
   "NO INCLUYE", "SUGERENCIAS") tengan su equivalente en la traducción.

   **El barrido se corrió el 06/11 sobre las 84 traducciones y dio seis casos
   por debajo del 90%** (ninguno por encima del 115%):
   `tour-alternativo-al-glaciar-moreno` 64%,
   `parque-nacional-los-alerces-full-day-merakisur` 70%,
   `pinguinera-punta-tombo` 73%, `peninsula-valdes` 76%,
   `trevelin-full-day-limits-adventure` 86% y `piedra-parada-merakisur` 86%.
   **Corrección importante al método:** se verificaron los tres peores y
   **ninguno está cortado** — los tres terminan en el mismo punto que el
   español. Lo que hacen es *resumir*: la máquina condensó párrafos enteros, así
   que la página en portugués dice lo mismo con menos detalle y, sobre todo, con
   menos palabras de las que el brasileño escribe en Google. O sea: el ratio
   bajo no marca truncado, marca **traducción condensada**, que igual conviene
   reescribir pero no es una urgencia. El caso de `rafting-en-corcovado` del
   04/11 (que sí estaba cortado) se detectaba por el bloque en mayúsculas
   faltante, no por el ratio. **Las tres de más valor para reescribir son
   `peninsula-valdes`, `pinguinera-punta-tombo` y
   `tour-alternativo-al-glaciar-moreno`**: son las tres búsquedas más grandes
   del mercado brasileño y son justo las tres más condensadas. El script del
   barrido no quedó en el repo (son 30 líneas: lee `tours` por la API REST
   pública, replica `conSlugsUnicos`, limpia el HTML de las dos versiones y
   divide los largos).

   **Segunda corrección, del 07/11: las tres no hay que reescribirlas.** Se
   leyeron las tres traducciones enteras contra el cuerpo en español de su
   ficha en Firestore, párrafo por párrafo. **Las tres están completas**: dicen
   todo lo que dice el original —itinerario, qué incluye, qué no incluye,
   fauna por época, horarios— y además están bien escritas en portugués de
   Brasil, con el vocabulario con el que busca un brasileño
   (`pinguins-de-magalhães`, `lobos-marinhos`, `toninha-overa`,
   `praia de icebergs`). El ratio bajo sale de que **el español es verboso**,
   no de que el portugués falte: el cuerpo de
   `tour-alternativo-al-glaciar-moreno` viene envuelto en `<div>` y con
   repeticiones del prestador, y los de Valdés y Punta Tombo tienen frases
   larguísimas que en portugués quedan más cortas diciendo lo mismo. Dos de
   las tres (`peninsula-valdes` y `pinguinera-punta-tombo`) además son de las
   escritas a mano el 03/11. **Conclusión: el ratio de largos no sirve para
   nada en este sitio** y este pendiente baja de prioridad: no hay traducción
   que reescribir identificada hoy. Si aparece una sospecha nueva, el único
   método que funcionó es el del 04/11 —buscar los bloques en mayúsculas del
   original ("LA ACTIVIDAD INCLUYE", "NO INCLUYE", "SUGERENCIAS") que no
   tengan equivalente en la traducción—. Lo que sí rinde para Brasil es el
   pendiente 5: contenido informativo nuevo en portugués.
7. **Guías sin oferta propia que enlazar.** Resuelto el enlazado automático
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
8. **Datos estructurados.** Validar Product/Offer, FAQPage y BreadcrumbList con
   la herramienta de resultados enriquecidos; corregir lo que tire error.
   Revisado el 30/10 en fichas de las dos lenguas: el JSON-LD parsea bien y los
   tipos salen completos (Organization, Product con `offers`, BreadcrumbList y,
   en portugués, FAQPage). Lo que falta es `priceValidUntil` en el `Offer`, que
   Google pide como recomendado y hoy no está en ninguna ficha; sin él los
   resultados con precio se muestran igual, pero la validación tira aviso. El
   campo tiene que salir de una fecha de vigencia del precio, y el precio es
   zona prohibida: hay que definir de dónde sale esa fecha antes de tocarlo.
9. **Las fichas en español no tienen FAQ.** Las 84 en portugués traen `faq` en
   `traducciones-pt.json`; las 112 en español no tienen de dónde sacarlo.
   **Corrección del 07/11 al motivo:** este pendiente estaba justificado en
   "pierden el bloque de preguntas en el resultado de Google", y eso ya no
   existe — **Google dio de baja el resultado enriquecido de FAQ para todos
   los sitios**, completando el recorte que había empezado en 2023 (antes
   quedaba sólo para sitios de gobierno y salud). O sea: declarar `FAQPage` no
   trae más el acordeón de preguntas en el buscador, ni acá ni en las páginas
   en portugués que ya lo declaran. **No hay que sacar el FAQPage que ya está**
   (no penaliza y lo leen otros consumidores de datos estructurados), pero el
   valor de sumarlo en español ya no es el resultado enriquecido: es el texto
   en sí —preguntas y respuestas reales suman las palabras exactas con las que
   la gente busca, y son lo que citan las respuestas generadas por IA—. Con
   ese motivo más flaco, este pendiente baja por debajo del contenido nuevo.
   Sigue siendo carga de datos: un `faq-es.json` espejo del portugués, 2–3
   preguntas por ficha, escritas sólo con lo que dice la ficha, de a 10 por
   corrida.
9b. **MANTENIMIENTO NUEVO — lo que Google ve de una página de `public/` es
   lo que queda DESPUÉS de que corre el JavaScript, y no siempre es lo que
   dice el HTML.** Encontrado el 17/11 en la home: el bloque de respaldo
   `pe-seo` tenía 16 enlaces internos escritos en el HTML y React los
   **borraba** al montar, así que lo que se indexaba eran 8 (ver "Hecho").
   La auditoría que se hacía hasta ahora —leer el HTML servido con `curl`— no
   podía verlo. **El chequeo nuevo, que conviene hacer cada vez que se toca o
   se mira una página de `public/`:** renderizarla con Chromium, esperar a que
   monte, y contar `document.querySelectorAll('a[href]')` y los `h1`. Son 15
   líneas de Playwright, que ya está instalado en la corrida. Lo que apareció
   en el primer barrido, por orden: **`/aike` y `/cuotas` renderizan CERO
   enlaces** (callejones sin salida, anotado en "Para Marcelo"),
   `/billetera-turista` tiene uno solo, y `/prestadores`, `/ecosistema` y
   `/patagonia-experiencias` enlazaban con `.html` (resuelto el 17/11 en las
   dos primeras; la tercera es zona prohibida). **Ojo con el método:** no sirve
   `waitUntil: 'networkidle'` —Firestore y el píxel de Meta dejan conexiones
   abiertas y nunca resuelve—; hay que usar `'load'` y después esperar unos
   3,5 segundos a que React monte.

   **El barrido quedó versionado el 18/11** en `scripts/barrido-render.mjs`:
   ya no hay que reescribirlo cada corrida. Se corre
   `node scripts/barrido-render.mjs` (todo el sitemap servido) o con URLs
   sueltas, y `--fallos <url>` lista los recursos en 404. Por cada URL informa
   enlaces totales e internos, enlaces `.html`, `h1`, datos estructurados,
   `hreflang`, Open Graph, largo del texto renderizado y recursos que no
   cargan, y cierra con la lista de lo que hay que revisar. **Sumale al método
   una trampa más, descubierta el 18/11:** las imágenes con `loading="lazy"` no
   se piden hasta que se scrollea, así que el conteo de 404 **subcuenta** lo que
   hay abajo del pliegue —Gaiman informaba 3 recursos caídos y en realidad le
   faltan 10 fotos—; para el inventario real hay que cruzar las referencias del
   HTML contra los archivos del repo, no fiarse del render.

   **Lo que encontró el barrido completo del 18/11, sobre las 37 URLs del
   sitemap que no son fichas ni guías de Firestore:** los 124 enlaces `.html`
   inyectados por JavaScript (resueltos, ver "Hecho"); la home sin datos
   estructurados ni Open Graph (resuelto); **`/sumar-gastronomia` con cero
   enlaces renderizados**, el tercer callejón sin salida después de `/aike` y
   `/cuotas` (va a "Para Marcelo" con las otras dos); **26 logos en 404 en
   `/ecosistema`** y **35 fotos faltantes en el micrositio del valle del
   Chubut** (las dos cosas en "Para Marcelo": hacen falta archivos, no código);
   y el hueco de datos estructurados del pendiente 9c. Lo que dio bien: las
   37 páginas tienen **exactamente un `h1`**, las 37 tienen meta description, y
   las 8 informativas de `/pt-br/` tienen sus 2 bloques de JSON-LD y su
   `hreflang` recíproco. Las tres copias viejas que parecían contenido
   duplicado —`/patagonia-experiencias_v11`,
   `/guias-de-viaje/peninsula-valdes/peninsula-valle` y
   `/guia-peninsula-valle-2026`— **ya responden 301 a la página buena** por
   `public/_redirects`: no hay nada que hacer ahí y no hace falta volver a
   revisarlo.

9c. **Las guías de `public/guias-de-viaje/` no declaraban ningún dato
   estructurado. — CERRADO el 19/11/2026** (ver "Hecho"; son **ocho**, no
   siete: la portada del valle, las cinco de localidad, Península Valdés y
   Esquel–Trevelin). Encontrado el 18/11 con el barrido renderizado: la portada
   del micrositio del valle y las cinco de localidad, más Península Valdés y
   Esquel–Trevelin, renderizan **cero** bloques de JSON-LD, mientras las páginas
   equivalentes en Astro (`/que-hacer-en-ushuaia/`, las ocho de `/pt-br/`)
   declaran dos cada una. Son páginas largas y buenas —entre 9.000 y 33.000
   caracteres de texto renderizado— que hoy no le dicen a Google qué son. Lo que
   corresponde es un `Article` (o `TravelGuide`) con `headline`, `image`,
   `datePublished`, `author`/`publisher` colgando del `@id` de la
   `Organization` que la home declara desde el 18/11, más un `BreadcrumbList`
   con la jerarquía que ya tienen (`/guias-de-viaje/` → valle → localidad).
   **Es una página por corrida y en el `<head>`**, nunca dentro del bloque que
   React reemplaza. Ojo con `image`: en cuatro de las siete la foto de cabecera
   no existe (ver "Para Marcelo"), así que ahí hay que esperar las fotos o
   declarar una que sí esté.

   **Y de paso, las descriptions de estas siete son las más cortas del sitio**
   (92, 102, 109, 122, 123, 125 y 131 caracteres contra los 140–200 del resto):
   es el mismo problema del pendiente 12 pero en las guías de `public/`, y acá
   sí se arregla en el código, porque la description está escrita a mano en
   cada archivo.

10. **Core Web Vitals.** Las páginas de `public/` cargan Tailwind por CDN y
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

11. **Bing rechaza IndexNow.** Yandex acepta las URLs (200 OK); Bing y el
    endpoint compartido devuelven 403 `UserForbiddedToAccessSite` aunque la
    clave esté bien publicada y accesible. Falta reclamar el sitio en Bing
    Webmaster Tools (se importa desde Search Console en dos minutos). Es tarea
    de Marcelo: está anotada arriba. Mientras tanto el script sigue avisando a
    Yandex, que funciona (02/11: aceptó las 251 URLs).

    **Probado otra vez el 08/11, después de que Marcelo dijera que ya reclamó el
    sitio: sigue 403.** Se probó con `host` sin `www` y con `www`, y las dos
    devuelven el mismo `UserForbiddedToAccessSite`, así que **no es un
    desajuste de forma del dominio**. La clave está publicada y accesible
    (`/a4f06ee8d893fb82ce246ac52e04022a.txt` sirve 200 y su contenido es
    exactamente la clave), así que tampoco es la clave. Quedan dos
    explicaciones: que el alta en Bing Webmaster Tools no haya terminado de
    verificarse, o que el servicio de IndexNow de Bing todavía no la haya
    tomado (puede tardar horas desde el alta). **La corrida siguiente tiene que
    volver a probar antes de hacer cualquier otra cosa con esto**, y si sigue en
    403, el camino determinista es la verificación por archivo XML: Marcelo pasa
    el token y la corrida lo sube a `public/`.

    **Probado otra vez el 09/11, 24 horas después: sigue 403** en los dos
    endpoints (Bing y el compartido), con la clave sirviendo 200 en la raíz.
    Ya no es "puede tardar horas desde el alta": pasó un día entero. **Se deja
    de reintentar a ciegas y queda a la espera de Marcelo**, por el camino
    determinista: el token de verificación por archivo XML de Bing Webmaster
    Tools (Settings → Verify ownership → Option 1, BingSiteAuth.xml). Con ese
    token la corrida sube el archivo a `public/` y la verificación deja de
    depender de que la importación desde Search Console haya quedado bien.
    Yandex sigue aceptando todo (09/11: 200 OK con las 87 URLs de `/pt-br/`).

    **10/11: sigue 403**, 48 horas después del primer reintento. Se avisó en la
    corrida sin dedicarle trabajo (es un envío que el script hace igual) y
    **no se vuelve a probar hasta que Marcelo pase el token XML**: tres
    reintentos en tres días con el mismo error ya son evidencia suficiente.
    Yandex aceptó las tres tandas del día (200 OK).

12. **Seis guías con la description corta.** El recorte nuevo cierra en fin de
    oración, y en 6 de las 60 guías la primera oración del cuerpo es muy corta
    y la segunda no entra en los 157 caracteres: quedan entre 81 y 109. No es
    un error (una oración entera lee mejor que un corte ragged), pero esas 6
    desaprovechan medio snippet. El arreglo es cargarles una `bajada` propia
    en el admin, o escribirles la description a mano como se hizo con las
    fichas. Es carga de datos.
13. **MANTENIMIENTO DE CADA CORRIDA — fichas nuevas sin description ni
    traducción.** Cruzar el sitemap contra las claves de `src/data/meta-es.json`
    y de `src/data/traducciones-pt.json` y escribir lo que falte. Una ficha que
    el admin publique hoy cae al respaldo automático de
    `src/lib/descripciones.js` (limpio pero genérico, y si el prestador empieza
    el texto con un encabezado la description arranca con esa palabra suelta) y
    no tiene página en portugués. Es el trabajo de mantenimiento más barato y
    de mayor retorno que queda. Hecho el 02/11 con las 5 fichas nuevas y con
    las 14 de "una URL por prestador"; verificado otra vez el 03/11 y el 04/11,
    con **112 de 112 meta descriptions escritas** las dos veces; verificado
    otra vez el 06/11, también 112 de 112: el admin no publicó fichas nuevas
    desde el 02/11. **Ojo con el conteo:** desde el 02/11 el
    sitemap tiene más fichas que claves "base" en Firestore, porque las fichas
    de un prestador llevan el sufijo del prestador en el slug. **Y sumale el barrido
    de slugs:** el 08/11 apareció un `slugPt` que decía "puerto-madrid" en vez
    de "puerto-madryn" (ver "Hecho"). Cada vez que el script de traducción
    genere slugs nuevos conviene leerlos buscando palabras en español y
    erratas en los nombres de los destinos, antes de que la URL se indexe y
    haya que redirigirla.

    **Hallazgo del 10/11, del mismo barrido: un `slugPt` con sufijo numérico.**
    La ficha `ruta-galesa-con-complejo-hidroelectrico-futaleufu-con-visita-al-campo-de-peonias`
    publica en `/pt-br/experiencias/rota-galesa-represa-futaleufu-trevelin-2/`.
    El `-2` sale de que el script evitó la colisión con
    `rota-galesa-represa-futaleufu-trevelin`, que es la ficha sin peonías: o
    sea, **la URL perdió justo la palabra que distingue a esta ficha de la
    otra** (`campo de peônias`) y quedó con un número que no significa nada
    para Google ni para el que lo lee. No está roto y no es urgente —la página
    sirve 200 y ya está indexada—, pero conviene cambiarla a
    `rota-galesa-represa-futaleufu-trevelin-campo-de-peonias` **con su 301 en
    `public/_redirects`**, igual que se hizo con el "puerto-madrid" del 08/11.
    Es el único caso del barrido: los otros 13 slugs que la búsqueda marcó como
    sospechosos son nombres propios de lugares (`Parque Nacional Los Alerces`,
    `Tierra del Fuego`, `La Curva de los Guanacos`, `Nant y Fall`,
    `Delicias de la Fuente`) y se quedan como están. **Y hay que sumarle al
    barrido la búsqueda de sufijos `-\d+`**, que es la que lo encontró.
    Ojo también con el método: el cruce del sitemap contra `meta-es.json` tiene
    que filtrar las URLs **por el prefijo completo** `https://.../experiencias/`,
    porque un `/experiencias/<slug>/` al final del patrón matchea también las
    84 de `/pt-br/experiencias/` y da 83 falsos positivos de "ficha sin meta
    description".

    **Hallazgo del 12/11: dos grafías del mismo parque en los slugs pt.** Las
    tres fichas del Parque Nacional Tierra del Fuego publican con dos nombres
    distintos: `passeio-parque-nacional-tierra-del-fuego-ushuaia` usa el
    nombre propio en español y las otras dos
    (`parque-nacional-terra-do-fogo-a-pe-ushuaia` y
    `parque-terra-do-fogo-e-trem-do-fim-do-mundo-ushuaia`) lo traducen. No está
    roto —las tres sirven 200 y están indexadas, y el nombre oficial del parque
    *es* en español— pero el brasileño busca las dos formas y conviene que las
    URLs de un mismo lugar no se contradigan. Prioridad baja: cambiarlo cuesta
    un 301 sobre una URL ya indexada, igual que el `-2`. Lo que sí conviene es
    **sumar al barrido de cada corrida la búsqueda de grafías inconsistentes
    para un mismo topónimo**, no sólo las erratas y los sufijos numéricos.

    **Sumado al barrido el 14/11, y es el más barato de todos: contar las
    fichas del sitemap contra las claves de `meta-es.json`.** Ese cruce fue el
    que encontró las dos fichas nuevas del 14/11 (el sitemap había pasado de
    292 a 295 URLs y una sola era la página nueva). El script del barrido
    completo —fichas sin description, URLs pt huérfanas, entradas sin
    `slugPt`, sufijos `-\d+` y palabras en español en los slugs pt— son 25
    líneas y lee el sitemap servido más los dos JSON del repo.

    **Hallazgo del 15/11 — el admin publica de a tandas y el conteo del
    sitemap no las ve el mismo día.** Las tres fichas nuevas
    (`trekking-balcones-del-susana`, `trekking-lagunas-gemelas`,
    `trekking-glaciar-ojo-del-albino`) estaban en Firestore desde el 14/11 a
    las 20:11–20:46 UTC, o sea **después** del build de esa corrida: el sitemap
    servido no las tenía y el cruce contra el sitemap no las habría encontrado.
    Lo que sí las encontró fue **cruzar los tours activos de Firestore contra
    las claves de `meta-es.json`** (118 activos contra 114 claves). Conclusión
    para el barrido: **la fuente del cruce es Firestore, no el sitemap**; el
    sitemap sólo sirve para verificar después del deploy. Y el mismo cruce
    contra `traducciones-pt.json` tiene que hacerse **sólo por slug único**,
    por el falso negativo de las hermanas que está anotado en el pendiente 3.

    **El barrido de mantenimiento quedó versionado el 16/11** en
    `scripts/barrido-mantenimiento.mjs`: hace los cinco cruces de este
    pendiente (fichas sin description, fichas sin pt por slug único, sufijos
    `-\d+`, `slugPt` duplicados o faltantes y palabras en español en los
    slugs) con las advertencias del método escritas adentro. Se corre con
    `node scripts/barrido-mantenimiento.mjs` y no necesita credenciales.
    **Hallazgo de su primera corrida:** el `slugPt` de `cabalgatas-familiares`
    es `cabalgatas-familiares-esquel`, con "cabalgatas" en español — en
    portugués de Brasil es `cavalgadas`. Tercer caso del mismo tipo después del
    "puerto-madrid" (08/11) y las dos grafías del Parque Nacional Tierra del
    Fuego (12/11). Prioridad baja: cambiarlo cuesta un 301 sobre una URL ya
    indexada.

    **Y el barrido de enlaces internos ya no hay que reescribirlo**: quedó en
    `scripts/barrido-enlaces.mjs` el 14/11, con las dos advertencias del
    método anotadas adentro (no conoce `_redirects`, ignora `/cdn-cgi/` y las
    URLs protocol-relative). Se corre con
    `DATOS_LOCALES=1 npx astro build && node scripts/barrido-enlaces.mjs`.

    **Sumado al barrido el 13/11: los enlaces internos rotos.** Se recorren
    los 316 HTML del `dist` y se resuelve cada `href`/`src` interno contra el
    árbol compilado. La primera corrida encontró **17 enlaces muertos** en las
    tres landings en español (ver "Hecho" del 13/11) y nada más: los otros
    diez avisos son artefactos de Cloudflare (`/cdn-cgi/…`, que existen en
    producción y no en el `dist`), una ruta que tiene su 301 en `_redirects`
    y un `src="/assets/logos/NOMBRE.png"` que está dentro de un comentario de
    `ecosistema.html`, no en un `<img>` real. **Ojo con el método:** el
    chequeo contra el `dist` no conoce `public/_redirects`, así que todo lo
    que marque hay que contrastarlo con un `curl` antes de tocarlo. El script
    son 20 líneas y no quedó en el repo.

14. **MANTENIMIENTO — `gastronomia-es.json` es una copia, no la fuente.** La
    guía gastronómica en portugués (11/11) lee los 34 platos, productos y
    experiencias de `src/data/gastronomia-es.json`, que es la copia exacta del
    array `GASTRO` que vive **adentro** de `public/que-comer-patagonia/index.html`.
    La página en español sigue usando su copia propia, así que **las dos pueden
    derivar**: si se agrega, se saca o se cambia un plato en la página
    española, hay que regenerar el JSON. Se regenera leyendo el HTML y
    parseando el array que va entre `let GASTRO = ` y el cierre `];` siguiente.
    Es el mismo arreglo que ya tenía `public/datos-fauna.json` con
    `/calendario-fauna/`, y la salida limpia de los dos casos sería que la
    página en español leyera el JSON en vez de llevar el array adentro — pero
    eso es tocarle el JavaScript a dos páginas de producción y conviene hacerlo
    una por corrida, con tiempo.

15. **MANTENIMIENTO DE CADA CORRIDA — títulos gritados y datos sucios que
    entran por el admin.** Resuelto el fondo el 20/11 (ver "Hecho"): las 53
    fichas con el título TODO EN MAYÚSCULAS ya se publican en mayúscula de
    oración, y `src/lib/titulos.js` arregla solo lo que el admin cargue
    mañana. **Lo que queda es el chequeo**, que es barato y hay que hacerlo
    con el barrido de mantenimiento: después de cada tanda del admin,
    controlar si apareció un título gritado nuevo y, si el respaldo
    algorítmico no lo deja bien (nombres propios raros, marcas, erratas),
    escribirlo a mano en `src/data/titulos-es.json`. **Dos trampas del
    método:** el respaldo sólo mira las letras, así que un título gritado a
    medias ("TREVELIN Full Day") no es un `esGrito` completo y se arregla por
    tramos; y **no todo lo que parece errata lo es** — "(GLAXIAR)" y
    "(CLEONA)" son los nombres de las dos embarcaciones del lago Menéndez, no
    "glaciar" mal escrito, y por eso van escritos a mano. Lo mismo vale para
    el campo `destino`, que también viene gritado ("ESQUEL", "Esquel, CHUBUT")
    y con la barra pegada ("Caviahue/ Neuquén  "): eso ya lo limpia
    `lugarLegible()` antes de pegarlo al `<title>`.

## Hecho

- **23/11/2026** — **"Qué hacer en la Patagonia" estrenó bloque de excursiones
  y pasó de 0 a 19 enlaces internos a fichas.** Segunda página del pendiente
  3c y la más grande que quedaba: `/que-hacer-patagonia/` es el índice de 85
  actividades en 93 destinos —de las páginas con más texto del sitio— y sus
  39 enlaces a excursión iban todos a `/patagonia-experiencias#tour/<slug>`,
  o sea a un ancla de la app de reservas, que para Google no es una URL
  distinta: **cero autoridad interna hacia `/experiencias/`**. Se le sumó una
  sección nueva, "Las 19 excursiones con prestador habilitado", después del
  índice por provincia y antes del bloque de prestadores: las 19 excursiones
  agrupadas por zona de salida (Madryn–Valdés 6, Trelew y el valle 4, Esquel
  y la cordillera 5, Ushuaia 4), cada una con enlace a su ficha, prestador,
  destino, duración y **las actividades de este índice que cubre** —que es el
  equivalente a las especies del calendario y lo que hace que el enlace tenga
  contexto—. También un botón "LAS 19 EXCURSIONES" junto al de "VER EL ÍNDICE
  COMPLETO", y un enlace al listado `/experiencias/` al pie del bloque.
  **No se tocó ninguno de los 39 enlaces a la app** (mismo criterio que el
  22/11: en esta página son el único camino a la oferta) ni
  `public/patagonia-experiencias.html`, que es zona prohibida.
  El mapeo salió del cruce `urlReserva`/`urlFicha` de `/aike/catalogo.json`,
  como quedó anotado ayer, y volvió a hacer falta: **5 de los 19 slugs no
  coinciden con la URL de la ficha** —`peninsula-valdes` es de SUSSANICH
  (`/experiencias/peninsula-valdes-sussanich-turismo/`), `piedra-parada`,
  `panoramicas-de-esquel` y `parque-nacional-los-alerces-full-day` llevan
  sufijo `-merakisur`, y `trekking-laguna-esmeralda` es el de VERTICE, no el
  de Noelia Ferrario—. Verificado antes de pushear: los 19 destinos sirven
  200, el build compila, los 19 enlaces sobreviven al JavaScript a 1280 y a
  390 px, los 39 enlaces a la app siguen renderizando, cero errores de
  consola y cero desborde horizontal. Verificado después del deploy: la
  página en producción sirve los 19 enlaces y la sección `#excursiones`.

- **22/11/2026** — **El calendario de fauna estrenó bloque de excursiones y
  pasó de 0 a 17 enlaces internos a fichas.** Es la primera página del
  pendiente 3c, y la más grande: `/calendario-fauna/` tenía 44 enlaces
  `#tour/<slug>` —anclas de la app de reservas, que para Google no son URLs
  distintas— y **ni un solo enlace a las fichas de `/experiencias/`**. Se le
  sumó una sección nueva, "Las 17 excursiones de fauna del calendario",
  después de las 33 fichas de especie y antes del bloque de prestadores:
  las 17 excursiones agrupadas por zona (Madryn–Valdés, Trelew y el valle,
  Esquel y la cordillera, Ushuaia), cada una con enlace a su ficha, prestador,
  destino, duración y la lista de especies de este calendario que cubre. Se
  le sumó también un botón "LAS 17 EXCURSIONES" junto al de "VER LAS FICHAS
  COMPLETAS". **No se tocó ninguno de los 44 enlaces a la app**: son el único
  camino a la oferta que tiene la página, así que el bloque suma y no
  reemplaza (la alternativa que estaba anotada para preguntarle a Marcelo).
  Verificado: los 17 destinos sirven 200, los 17 enlaces sobreviven al
  JavaScript al renderizar, cero errores de consola, cero desborde horizontal
  a 390 px y las clases del bloque existen en el Tailwind compilado de la
  página (el primer intento usó `sm:grid-cols-2`, que **no está** en ese CSS
  y colapsaba el grid: esa página no tiene Tailwind por CDN, tiene un build
  recortado, así que hay que usar sólo clases ya presentes en el archivo).

- **22/11/2026** — **Encontrado y documentado: el mapeo `#tour/<slug>` →
  ficha no es el slug pelado, y el reemplazo mecánico del pendiente 3c
  mandaba 5 de 17 enlaces a la ficha del prestador equivocado.** El ancla de
  la app usa `slugReserva` (título slugificado, con sufijo `-2` cuando dos
  prestadores cargaron el mismo título) y la URL de Astro lleva sufijo de
  prestador desde el 02/11. `#tour/peninsula-valdes` —el slug más enlazado
  del sitio, 12 veces sólo en el calendario— es el tour de SUSSANICH, cuya
  ficha es `/experiencias/peninsula-valdes-sussanich-turismo/`, mientras que
  `/experiencias/peninsula-valdes/` **es de otro prestador**. El mapeo bueno
  sale de cruzar `urlReserva` contra `urlFicha` en `/aike/catalogo.json`.
  Queda escrito en el pendiente 3c para las corridas que sigan con
  `/que-hacer-patagonia/` y las guías de Valdés.

- **21/11/2026** — **El alojamiento del valle entró al sistema: títulos
  propios en español, dos habitaciones en portugués y una sección "dónde
  dormir" que las enlaza.** Las seis fichas del AGUADA HOTEL de Trelew
  publicaban el título tal cual lo cargó el prestador —"Habitacion
  Matrimonial Superior", sin tilde, sin el nombre del hotel y sin la ciudad—
  y no las agarraba el respaldo de `titulos.js` porque no están gritadas: son
  seis `<h1>`, seis `<title>`, seis `name` de `Product` diciendo nada más que
  el tipo de cama. Se escribieron **las seis a mano en
  `src/data/titulos-es.json`** ("Habitación matrimonial superior en AGUADA
  HOTEL, Trelew"), sin mover ninguna URL. Del lado de Brasil, **dos de las
  seis se tradujeron a mano** en `traducciones-pt.json` con título, meta
  description, cuerpo, alt y tres FAQ cada una —la matrimonial superior
  (`quarto-casal-superior-trelew`) y la triple twin superior
  (`quarto-triplo-twin-superior-trelew`)—, escritas con los datos de la propia
  ficha: camas, frigobar, Smart TV, bañera, los servicios del hotel (café da
  manhã, Wi-Fi, piscina climatizada, aquecimento central, recepção 24h, pet
  friendly, mobilidade reduzida) y el check-in/check-out. Las otras cuatro
  quedan sin traducir a propósito, por casi calcos. Y para que las páginas
  nuevas no quedaran colgando del listado, **las dos guías del valle
  estrenaron bloque de alojamiento**: `/pt-br/o-que-fazer-em-trelew-e-gaiman/`
  con la sección "Onde dormir em Trelew" (armada leyendo
  `traducciones-pt.json`, así que si mañana se traduce otra habitación
  aparece sola), su chip en la portada y una FAQ nueva que entra al `FAQPage`;
  y `/guias-de-viaje/valle-del-chubut/trelew/` con "Dónde dormir en Trelew" y
  **las seis habitaciones enlazadas a `/experiencias/<slug>/`**, que eran seis
  fichas sin un solo enlace interno en todo el sitio. Verificado renderizando
  con Chromium (1 `h1`, 8 `h2`, los 6 enlaces vivos después de que monta el
  JavaScript, diseño idéntico al bloque de excursiones) y contra producción:
  311 URLs en el sitemap servido, 92 fichas pt (eran 90).

- **20/11/2026** — **Los títulos de las fichas dejaron de estar TODO EN
  MAYÚSCULAS: 53 de 123, el 43% del catálogo.** El admin deja cargar el
  título como lo escriba el prestador, y 53 fichas activas lo tenían gritado
  ("TREVELIN FULL DAY –– CON VISITA AL CAMPO DE PEONIAS"). Ese texto es el
  `<h1>`, el `<title>`, el `name` del `Product` y el nombre del breadcrumb.
  Se resolvió con el mismo molde de dos capas que `meta-es.json` +
  `descripciones.js`: **`src/data/titulos-es.json`** con 49 títulos escritos a
  mano (la clave puede ser el título original exacto —así una entrada arregla
  las dos fichas cuando dos agencias cargaron el mismo tour— o el slug único,
  para los títulos genéricos como "Alojamiento") y **`src/lib/titulos.js`**
  como respaldo algorítmico para lo que se publique mañana: mayúscula de
  oración, tabla de topónimos y marcas, tabla de tildes y arreglo por tramos
  para los títulos gritados a medias. Se aplica **después** de
  `conSlugsUnicos`, cuando la URL ya está resuelta: 285 páginas compiladas
  antes y después, cero URLs movidas. En la misma pasada, el lugar del
  `<title>` se normaliza igual (`lugarLegible()`), se le escribió a mano la
  meta description a la única ficha que no la tenía (Gema Hotel, Comodoro
  Rivadavia) y los dos `h1` gritados de las guías de `public/`
  ("ESQUEL& TREVELIN" y "PENÍNSULA VALDÉS & EL VALLE") pasaron a texto en
  minúsculas con `text-transform: uppercase` en el CSS: Google lee el HTML, el
  diseño quedó idéntico (verificado con captura a 390 y 1280 px).

- **19/11/2026** — **Las ocho guías de `public/guias-de-viaje/` declaran por fin
  qué son, y sus descriptions dejaron de ser las más cortas del sitio.**
  Pendiente 9c. Eran las únicas páginas largas del sitio —entre 8.000 y 33.000
  caracteres de texto renderizado— con **cero** bloques de JSON-LD, contra los
  dos que declaran las equivalentes en Astro. Se agregó en el `<head>` de las
  ocho (portada del valle, Rawson, Trelew, Gaiman, Dolavon, 28 de Julio,
  Península Valdés y Esquel–Trevelin) un `@graph` con **`Organization` +
  `Article` + `BreadcrumbList`**: `headline`, `description` y `articleSection`
  escritos con el contenido de cada página, `image` apuntando **sólo a fotos que
  existen** (las cuatro localidades sin foto propia usan `valle-hero.jpg`),
  `datePublished` del primer commit que las trae (23/07) y `dateModified` de hoy,
  `author`/`publisher` colgando del `@id` de la `Organization` que la home
  declara desde el 18/11 —y repetida inline, mínima, para que la referencia
  resuelva sola y el validador no avise— y el breadcrumb con la jerarquía real
  (`/` → `/guias-de-viaje/` → valle → localidad; verificado que
  `/guias-de-viaje/` responde 200). Va en el `<head>` a propósito.
  **De paso, las siete descriptions más cortas del sitio** (92 a 131 caracteres)
  pasaron a **189–201**, escritas con los términos con los que se busca cada
  lugar: Punta Tombo, tonina overa, Eisteddfod, parque Bryn Gwyn, las norias de
  Dolavon, La Hoya, La Trochita, los tulipanes. La de la portada del valle ya
  medía 230 y quedó como estaba.
  **Y dos `og:image` arregladas:** las dos guías grandes la declaraban
  **relativa** —que la mayoría de los lectores de tarjetas no resuelve— y la de
  Península Valdés apuntaba además a `imagenes/01_portada_ballena_amanecer.jpg`,
  una carpeta que no existe en esa guía (la foto vive en `img/00-portada.jpg`,
  verificado 200 en producción). Verificado en producción con
  `scripts/barrido-render.mjs` y parseando el JSON-LD de las ocho: **`ld=1` en
  todas**, un solo `h1`, `html=0`, el mismo conteo de enlaces que antes y el
  `Article` + `BreadcrumbList` completos. IndexNow: las 9 URLs de
  `/guias-de-viaje/` aceptadas por Yandex (200 OK).

- **19/11/2026** — **Las tres fichas nuevas de Caviahue servían como meta
  description el texto crudo del prestador.** `ascenso-crater-volcan-copahue`,
  `ascenso-cumbre-volcan-copahue` y `salto-del-agrio` eran las únicas tres de
  las 121 fichas en español **sin entrada en `src/data/meta-es.json`**, así que
  caían al respaldo que recorta el cuerpo: una terminaba en puntos suspensivos y
  otra publicaba en el `<head>` de Google un "um volcán activo" con la errata del
  prestador. Se les escribió la description a mano con lo que dice cada ficha
  —el cráter del volcán más activo del país y las 4 horas; la cumbre a 2.960
  msnm, el glaciar y las 8 horas con equipo y seguro; el salto de aguas
  multicolores y las 3 horas— de 153 a 173 caracteres, en el mismo molde que las
  otras 117. Con eso **las 120 fichas publicadas tienen description escrita a
  mano y ninguna repetida**. El destino en sí quedó como pendiente 3b: es nuevo,
  está fuera de Chubut y no lo nombra ninguna página informativa del sitio.

- **18/11/2026** — **Los 124 enlaces internos con `.html` que el JavaScript
  inyectaba, y que `curl` no podía ver.** La corrida del 17/11 sacó los `.html`
  de los enlaces escritos en el HTML de nueve páginas de `public/`. El barrido
  renderizado de hoy —Chromium, lo que ve Google— mostró que quedaban 124 más,
  invisibles para `curl` porque los arma el JavaScript al montar la página:
  **`src/layouts/BaseLayout.astro`** enlazaba `prestadores.html` en absoluto
  desde el footer de **todas** las páginas de Astro en español (fichas, guías e
  informativas: un 308 por página, en más de doscientas); las tres constantes de
  `CONFIG` con las que `/calendario-fauna/`, `/que-hacer-patagonia/` y
  `/que-comer-patagonia/` arman los enlaces en tiempo de ejecución (`urlApp`,
  `urlPrestadores`, `baseExcursion`) más sus `href` escritos a mano —
  `/calendario-fauna/` renderizaba 58 enlaces internos y **48 pasaban por un
  308**—; las guías de `public/guias-de-viaje/` (Península Valdés, Esquel y
  Trevelin, y las cinco del valle del Chubut); y el `og:url` de `/terminos`,
  `/privacidad` y `/ecosistema`, que declaraba el `.html` mientras el canonical
  declara la URL limpia. El destino no cambia: se conservan los fragmentos
  (`#tour/<slug>`, `#prestador/<slug>`) y el `target="_blank"` donde estaba.
  Verificado en producción con el barrido renderizado: las siete páginas tocadas
  dan **`html=0`** con el mismo conteo de enlaces que antes, un solo `h1` y cero
  errores de consola. No se tocó `public/footer.js` (ver "Para Marcelo"),
  ni `public/firebase-messaging-sw.js`, ni `public/patagonia-experiencias.html`.

- **18/11/2026** — **La home declara por fin la identidad del sitio y muestra
  tarjeta al compartirse.** `public/index.html` —la URL que más enlaces externos
  recibe— no declaraba **nada**: cero datos estructurados y cero etiquetas Open
  Graph. Las páginas de Astro declaran un `Organization` mínimo desde
  `BaseLayout.astro`, pero la raíz del sitio no declaraba ninguno, y compartir
  patagoniaexperiencias.com por WhatsApp, Facebook o X mostraba el link pelado,
  sin título ni imagen, mientras las demás páginas de `public/` ya tenían su
  `og:image`. Se agregó en el `<head>`: un `@graph` con **`Organization` +
  `WebSite`** —logo (`/img/marca/logo-horizontal.png`, 1712×831), razón social,
  domicilio, teléfono de atención, idiomas y las dos redes de la marca, **cada
  dato tomado del propio sitio** (la razón social y el domicilio de efe5
  proyectos srl están en `/terminos`; las redes, en el pie de la home)— y Open
  Graph y Twitter Card completos con la `/og-image.jpg` que ya existe y mide
  1200×630, más `og:locale:alternate` en `pt_BR`. Va en el `<head>` a propósito:
  React reemplaza `#root` al montar y se lo llevaría puesto. Verificado en
  producción renderizando: **`ld=1`** después de que monta React, 24 enlaces /
  19 internos sin cambios, un `h1`, cero errores.

- **18/11/2026** — **La `og:image` del micrositio del valle del Chubut era
  relativa en las seis páginas, y en cuatro apuntaba a una foto que no existe.**
  Open Graph pide URL absoluta y la mayoría de los lectores de tarjetas no
  resuelve una relativa: las seis se compartían sin imagen. Ahora las seis
  declaran la URL completa, y las cuatro que apuntaban a archivos inexistentes
  (`28julio-hero.jpg`, `dolavon-hero.jpg`, `gaiman-hero.jpg`,
  `rawson-hero.jpg`) pasan provisoriamente a `valle-hero.jpg`, que sí está
  subida. Las 35 fotos que faltan quedaron listadas en "Para Marcelo".

- **18/11/2026** — **El barrido renderizado quedó versionado** en
  `scripts/barrido-render.mjs`, con las tres trampas del método escritas
  adentro. Era el chequeo del pendiente 9b, que hasta hoy se reescribía a mano
  en cada corrida. Se corre `node scripts/barrido-render.mjs` (todo el sitemap)
  o con URLs sueltas, y `--fallos <url>` lista los recursos 404. Por cada URL
  informa enlaces totales e internos, enlaces `.html`, `h1`, datos
  estructurados, `hreflang`, Open Graph, largo del texto renderizado y recursos
  que no cargan, y cierra con la lista de lo que hay que revisar.

- **17/11/2026** — **La home le devolvió los enlaces internos a la versión que
  ve Google.** `public/index.html` monta React sobre `#root` y, al montar,
  **reemplaza** el bloque de respaldo `<main class="pe-seo">` con sus 16
  enlaces internos. Google renderiza JavaScript, así que lo que indexaba de la
  página más autoritaria del sitio eran **8 enlaces: 6 externos y 2 internos**
  (`patagonia-experiencias.html` y `prestadores.html`), y los dos al `.html`,
  que responde 308. Es decir: **la home no le pasaba autoridad a
  `/experiencias/`, ni a `/guias-de-viaje/`, ni a ninguna página de destino, ni
  a `/pt-br/`**. Se agregó un `<nav>` de 16 enlaces en el pie del panel
  izquierdo —que ya scrolleaba— con la tipografía y los colores que la página
  ya usaba: no cambia el diseño ni el hero. Los dos enlaces de las tarjetas y
  el `window.location` de la billetera pasan a la URL limpia. El bloque de
  respaldo suma las cuatro páginas de destino en español, para que las dos
  versiones declaren lo mismo. **Verificado en producción con Chromium: 24
  enlaces renderizados, 18 internos, todos 200, cero errores de consola, y el
  panel idéntico en 1366×860 y en 390×844.**
- **17/11/2026** — **73 enlaces internos dejaron de pasar por una redirección.**
  Cloudflare Pages responde **308** a toda URL `.html` y la manda a la limpia,
  que es la que lleva el canonical. Nueve páginas de `public/` seguían
  enlazando con `.html` —entre ellas `/puerto-madryn`, `/valle-del-chubut` y
  `/esquel-trevelin`, tres de las informativas con más tráfico—, así que cada
  rastreo gastaba un salto por enlace. Reescritos en `ecosistema`,
  `esquel-trevelin`, `guia-peninsula-valle-2026`, `guias`, `manual-prestador`,
  `privacidad`, `puerto-madryn`, `terminos` y `valle-del-chubut`. **Se
  conservan tal cual los parámetros (`?destino=…&actividad=…`) y los fragmentos
  (`#tour/…`)**: el 308 sólo saca el `.html`, verificado con `curl -D-`.
  `index.html` pasa a `/`. No se tocó `patagonia-experiencias.html`, `pago-*`
  ni `_v11`: zona prohibida (queda anotado en "Para Marcelo"). El diff, token
  por token, son **sólo `href`**: nada de texto, estilos ni lógica. Verificado
  en producción: cero `.html` en las cinco páginas revisadas.

- **16/11/2026** — **El Calafate y los glaciares: guía de destino en portugués
  y en español. Cerrado el pendiente 5.** Era la última página informativa que
  le faltaba a `/pt-br/`: con ésta el portugués cubre los cuatro destinos
  grandes de la Patagonia argentina (costa de Chubut, cordillera de Chubut,
  Tierra del Fuego y los glaciares de Santa Cruz). `/pt-br/o-que-fazer-em-el-calafate/`
  y `/que-hacer-en-el-calafate/`, las dos en Astro, nueve bloques, cuatro
  temporadas, itinerario de 4 días, 12 preguntas en portugués y 10 en español,
  `hreflang` recíproco es-AR/pt-BR/x-default y JSON-LD completo
  (TouristDestination + FAQPage + BreadcrumbList, los tres parsean).
  **Las dos salieron en la misma corrida a propósito**, para no repetir lo de
  Ushuaia, que quedó una corrida entera sin par en español. No son traducción
  una de la otra: la española responde la tarifa de residente del Parque
  Nacional, si conviene alquilar auto, qué se hace gratis en El Chaltén y la
  confusión entre el glaciar Perito Moreno y el **Parque Nacional** Perito
  Moreno, que son dos lugares distintos a cientos de kilómetros.
- **16/11/2026** — **La guía española de El Calafate le da enlace interno a
  ocho guías huérfanas de Santa Cruz** (pendiente 7): Perito Moreno, El
  Chaltén, Glaciarium, Todo Glaciares, Cueva de las Manos, Lago Posadas y
  Pueyrredón, PN Perito Moreno y península Belgrano. Las ocho verificadas con
  `curl`: 200. Eran páginas que traían visitas y no tenían nada que enlazar ni
  nada que las enlazara desde un contexto de destino.
- **16/11/2026** — **Las dos variantes que faltaba revisar del pendiente 3
  resultaron calcos: no se traducen.** Leídas contra el cuerpo en español de
  su ficha principal en Firestore. `comarca-andina-full-day` (MerakiSur, 1.680
  caracteres) es **palabra por palabra** el mismo texto que `comarca-andina`
  (LIMITS ADVENTURE, 1.600): sólo cambian las viñetas y la duración declarada
  (8 horas contra 10). `astroturismo-y-aventura-en-lago-rosario` (MerakiSur,
  1.996) es la **versión condensada** de
  `astroturismo-en-lago-rosario-lodge` (LIMITS, 3.097): misma apertura, mismas
  tres actividades, mismos 48 km, misma cena; lo único propio es el párrafo
  final de "¿Qué llevar?". Es el mismo caso de `panoramicas-de-esquel-merakisur`
  del 06/11. **Las dos pasan a la decisión de catálogo** (pendiente 4 y "Para
  Marcelo"): en portugués no se traducen, para no duplicar el problema, y en
  español ya hoy son dos páginas compitiendo entre ellas.
- **16/11/2026** — **Mantenimiento del pendiente 13, limpio.** Cruce desde
  Firestore (118 tours activos, 117 publicables tras descontar el duplicado de
  carga de MerakiSur): **117 de 117 con meta description escrita a mano**, cero
  fichas nuevas desde el 15/11, cero entradas de `traducciones-pt.json` sin
  `slugPt`, cero `slugPt` duplicados y el único sufijo `-\d+` sigue siendo el
  `rota-galesa-represa-futaleufu-trevelin-2` ya anotado el 10/11.
- **15/11/2026** — **Las cinco fichas de Ushuaia de VÉRTICE EXPEDICIONES en
  portugués, y las tres nuevas con meta description en español.** El admin
  publicó cinco fichas en Ushuaia: `packrafting-rio-olivia` y
  `trekking-laguna-esmeralda-vertice-expediciones` (detectadas el 14/11) y
  otras tres cargadas después de esa corrida —`trekking-balcones-del-susana`,
  `trekking-lagunas-gemelas` y `trekking-glaciar-ojo-del-albino`—. Las tres
  nuevas no tenían meta description escrita a mano: escritas, **117 de 117**.
  Las cinco traducidas a mano a pt-BR en `traducciones-pt.json`, con el `hash`
  de la huella de Firestore (para que el script no las pise), `slugPt` propio
  verificado contra colisiones, `altImagem` y 3 FAQ cada una escritas sólo con
  lo que dice la ficha. La hermana de Laguna Esmeralda va con su slug único
  como clave (`trekking-laguna-esmeralda-vertice-expediciones`) y publica en
  `/pt-br/experiencias/trilha-laguna-esmeralda-ushuaia-meio-dia/`, que es lo
  que la distingue de la de Noelia Ferrario (6 horas contra 5, con bastones y
  crampones incluidos). **Ocho URLs nuevas en producción**, las ocho con 200,
  canonical propio, `hreflang` recíproco es-AR/pt-BR/x-default y JSON-LD
  completo (Product con Offer, BreadcrumbList, FAQPage, Organization).
- **15/11/2026** — **Las dos guías de Ushuaia enlazan las fichas nuevas.** El
  bloque de sendas suma las tres trekkings en los dos idiomas (ahora enlaza 6
  fichas en vez de 2) y se abrió un **bloque nuevo de packrafting en el río
  Olivia**, también en los dos idiomas: es la única actividad de agua del
  catálogo fueguino y no competía con nada. Las dos guías quedaron con 10
  bloques y el `hreflang` recíproco que ya tenían del 13/11.
- **15/11/2026** — **Los enlaces internos a `/guiadeviajeros.html` dejaron de
  pasar por el 301.** El barrido de `scripts/barrido-enlaces.mjs` los marcó
  como sospechosos y el `curl` mostró que la URL vieja responde 301 a
  `/guias-de-viaje/`: no estaban rotos, pero cada enlace interno gastaba un
  salto de rastreo. Cambiados en `ecosistema.html` (2), `esquel-trevelin.html`,
  `valle-del-chubut.html`, `guias.html` y en el **footer compartido**
  (`public/footer.js`, que lo servía como enlace relativo). El redirect en
  `_redirects` se deja, que es para los enlaces de afuera. Barrido limpio
  después del cambio: 327 HTML revisados, cero roto real.
- **14/11/2026** — **La guía del valle del Chubut en portugués, el footer de
  `/pt-br/` enlazando en portugués y una poda que iba a borrar 5 páginas.**
  Séptima informativa de `/pt-br/`: `/pt-br/o-que-fazer-em-trelew-e-gaiman/`,
  con `hreflang` recíproco contra `/valle-del-chubut`. **Se eligió el valle y
  no El Calafate** —los dos que quedaban del pendiente 5— porque el valle
  tiene **17 fichas pt vivas** detrás (las dos excursiones del Valle Inferior,
  Punta Tombo desde Trelew, el dique Ameghino y 13 de gastronomía en Trelew,
  Dolavon y Playa Unión; las 17 verificadas con 200 antes de escribir) y El
  Calafate tiene una sola: mismo trabajo, mucho más catálogo donde derivar el
  clic. Ocho bloques, cuatro temporadas, itinerario de 3 días, una sección de
  mesas agrupada por localidad y 12 preguntas frecuentes escritas sobre las
  consultas del brasileño. **No se inventó un solo dato:** todo sale de
  material ya verificado del propio sitio —la landing `/valle-del-chubut` y
  las cinco guías de `/guias-de-viaje/valle-del-chubut/` (Rawson, Trelew,
  Gaiman, Dolavon, 28 de Julio)—, con el Mimosa y los 153 colonos de 1865,
  Dyffryn Camwy, el trigo premiado en París y Chicago, Gaiman reconocido por
  ONU Turismo y hermanado con Llanuwchllyn en 2024, el único túnel
  ferroviario de la Patagonia, las norias de Dolavon, Bryn Gwyn y las
  distancias reales desde la Plaza Independencia.
  `TouristDestination` + `FAQPage` + `BreadcrumbList` validados parseando el
  JSON-LD servido, y las 17 fichas verificadas enlazadas en producción.
  Sitemap: 292 → **295 URLs** (la guía nueva más dos fichas que publicó el
  admin, ver abajo).
- **14/11/2026** — **El footer de `/pt-br/` dejó de mandar al brasileño a las
  páginas en español.** Apareció enganchando la guía nueva. El bloque
  "Destinos" del footer compartido de Astro enlazaba a `/puerto-madryn`,
  `/guias-de-viaje/valle-del-chubut/`, `/guias-de-viaje/esquel-trevelin/`,
  `/guias-de-viaje/peninsula-valdes/` y `/calendario-fauna/` **en los dos
  idiomas**: sólo Ushuaia era condicional. O sea que las más de 100 páginas de
  `/pt-br/` gastaban casi todo su enlazado interno de footer en páginas en
  español, con las seis guías en portugués ya publicadas y sin recibir nada.
  Ahora el footer en portugués apunta a las siete páginas pt (Puerto Madryn,
  Trelew y el valle, Esquel y Trevelin, Ushuaia, calendario de fauna, qué
  comer y la puerta de entrada general). El footer en español quedó igual y
  ganó `/valle-del-chubut` junto a la Huella Galesa. Verificado en los dos
  idiomas sobre el `dist` compilado.
- **14/11/2026** — **`scripts/traducir-pt.mjs` iba a borrar 5 páginas pt ya
  indexadas la próxima vez que se corriera.** Encontrado mirando el script
  para calcular el `hash` de dos fichas nuevas. El script escribe en
  `traducciones-pt.json` con la clave **base** (`slugificar(titulo)`), pero
  las fichas hermanas se escriben a mano con su **slug único**
  (`{base}-{prestador}`), que es como las lee `obtenerExperienciasPt`. La poda
  del final —"tours dados de baja: se sacan para no publicar páginas
  huérfanas"— sólo conocía las claves base, así que daba de baja todas las
  hermanas escritas a mano. Comprobado contra Firestore: **habría borrado 5**
  (`parque-nacional-los-alerces-full-day-merakisur`,
  `peninsula-valdes-sussanich-turismo`, `piedra-parada-merakisur`,
  `trevelin-full-day-limits-adventure`,
  `valle-de-cholila-limits-adventure`), las cinco sirviendo 200 hoy. Ahora
  `vigentes` se arma con `conSlugsUnicos`, la misma función que usa el sitio,
  así que lleva los slugs únicos además de los base: la poda pasó de borrar 5
  a borrar 0. El script no corre en la madrugada (pide `ANTHROPIC_API_KEY`),
  así que era una mina para la próxima corrida manual.
- **14/11/2026** — **Mantenimiento del pendiente 13: el admin publicó dos
  fichas nuevas** y las dos salieron sin description escrita a mano. Son las
  dos de VÉRTICE EXPEDICIONES en Ushuaia: `packrafting-rio-olivia` (actividad
  nueva en el catálogo, no había packrafting) y
  `trekking-laguna-esmeralda-vertice-expediciones` (hermana de la de Noelia
  Ferrario: **textos distintos de verdad**, 5 horas con bastones y crampones
  incluidos contra 6 horas, así que no es una hermana calco). Las dos con su
  description escrita a mano: **114 de 114**. Les falta la versión en
  portugués, que quedó en el pendiente 3.
- **14/11/2026** — **El barrido de enlaces internos quedó en el repo**, en
  `scripts/barrido-enlaces.mjs`. Hasta ahora se reescribía en cada corrida.
  Corrido hoy: **cero enlaces rotos reales**; los 7 avisos son dos páginas de
  `/guias/` que existen en producción (200 las dos, el `dist` local no las
  genera sin credenciales de Firestore), el 301 de `/guiadeviajeros.html` que
  ya está en `_redirects` y un `src` que vive dentro de un comentario de
  `ecosistema.html`.
- **13/11/2026** — **La guía de Ushuaia en español y el hreflang recíproco
  cerrado.** Era el pendiente 15, abierto el 12/11 al publicar la versión en
  portugués. Nueva página Astro en `/que-hacer-en-ushuaia/`, con los mismos
  nueve bloques, cuatro temporadas, itinerario de 4 días y 12 preguntas
  frecuentes, y las **8 fichas activas de Tierra del Fuego** enlazadas por
  slug (si una se despublica en el admin desaparece el enlace y no queda un
  404 adentro de la página). **No es una traducción de la portuguesa:** el
  argentino busca otra cosa y la página responde eso —vuelos directos desde
  Buenos Aires y, según la temporada, Córdoba, Rosario, El Calafate y Trelew;
  el cruce por tierra atravesando Chile dos veces, con la barcaza del
  estrecho de Magallanes y la prohibición de pasar frutas y carnes; julio como
  la semana más cara y más llena del año por las vacaciones de invierno; la
  tarifa diferenciada de residente en el Parque Nacional; el Tren del Fin del
  Mundo como lo que más recuerdan los chicos—. `TouristDestination` +
  `FAQPage` + `BreadcrumbList` validados parseando el JSON-LD de producción,
  y el `hreflang` recíproco agregado a las dos páginas de Ushuaia. Enlaces
  entrantes: el **footer compartido de Astro** —que ahora lleva una entrada
  "Ushuaia" en los dos idiomas, apuntando cada una a la página de su idioma,
  así que la guía recibe enlace desde las 268 páginas de Astro— y el bloque
  "Otros destinos" de las tres landings en español. Sitemap: 291 → **292
  URLs**.

- **13/11/2026** — **17 enlaces internos rotos en las tres landings en
  español.** Encontrado buscando dónde enganchar la guía de Ushuaia. El
  bloque "Otros destinos de la Patagonia" de `/puerto-madryn`,
  `/esquel-trevelin` y `/valle-del-chubut` enlazaba a `/peninsula-valdes`,
  `/esquel`, `/trevelin`, `/puerto-piramides`, `/gaiman`, `/punta-tombo` y
  `/trelew`: **siete rutas que devuelven 404 y que nunca existieron** —son
  nombres de destino que alguien supuso que eran páginas—, en 17 enlaces
  repartidos en tres páginas indexadas. Los `href` pasaron a la página real
  de cada destino, todas verificadas con 200
  (`/guias-de-viaje/peninsula-valdes/`, `/esquel-trevelin`,
  `/guias-de-viaje/valle-del-chubut/gaiman/` y `/…/trelew/`, más las guías de
  Puerto Pirámides y Punta Tombo), y además se sumaron las **301 de las siete
  rutas cortas** en `public/_redirects`, por si alguien las tiene guardadas o
  enlazadas desde afuera, más `/ushuaia` → la guía nueva. Las nueve
  verificadas en producción. **De paso se corrió el barrido completo de
  enlaces internos sobre los 316 HTML del `dist` y el resto del sitio está
  limpio** (el método quedó anotado en el pendiente 13).

- **12/11/2026** — **Sexta página informativa en portugués: la guía de
  destino de Ushuaia y Tierra del Fuego.** Era lo que seguía en el pendiente 5
  y el último de los tres destinos grandes que faltaba cubrir en `/pt-br/`.
  "O que fazer em Ushuaia" es de las búsquedas más grandes del brasileño en
  toda la Patagonia argentina —la ciudad más austral del mundo es marca
  conocida en Brasil, con o sin catálogo— y en portugués no existíamos: había
  **8 fichas pt del destino publicadas y ninguna página informativa que las
  agrupara**. Eran hojas sueltas, como lo eran las de restaurantes antes de la
  gastronómica.
  Nueva página Astro en `/pt-br/o-que-fazer-em-ushuaia/`: por qué Ushuaia en
  tres ideas (el fin de la Ruta 3 a 3.079 km de Buenos Aires es lo que trae al
  visitante, pero lo que la hace destino de varios días es la densidad —bosque
  subantártico, pingüinos todo el año, centolla, lagos, nieve y el puerto de
  la Antártida en 60 km a la redonda—, y la contra es el precio y el clima),
  cuatro temporadas, **nueve bloques** de qué hacer, itinerario de 4 días,
  cómo llegar y moverse y **12 preguntas frecuentes**. `TouristDestination` +
  `FAQPage` + `BreadcrumbList`, los tres validados parseando el JSON-LD de
  producción, y **las 8 fichas pt del destino enlazadas**, las 8 verificadas
  con 200.
  **Dato de contenido que no está en ninguna otra página nuestra y es el
  diferencial para Brasil:** los pingüinos-gentoo de la Isla Martillo están
  todo el año, así que en julio se ven pingüinos en Ushuaia — algo que no pasa
  en Punta Tombo ni en Península Valdés, donde el magallánico sólo está de
  septiembre a marzo. Eso convierte a Ushuaia en el único destino de fauna de
  invierno del catálogo, y la página lo dice en el bloque de pingüinos, en el
  de temporadas y en una pregunta frecuente.
  **Sin hreflang, por primera vez en las seis:** no existe la página de
  Ushuaia en español (ver el pendiente 15 nuevo). La página tiene el
  `alternos = null` comentado con el motivo, para que la corrida que haga la
  versión española sepa dónde engancharla.
  **Honesta con el catálogo:** la navegación del canal Beagle y el esquí en el
  Cerro Castor son las dos cosas más buscadas del destino y **no las vendemos**
  (las dos fichas de Beagle están inactivas en Firestore). Se cuentan igual
  —una guía de destino que las omite no le sirve a nadie y el lector las va a
  buscar en otra parte— pero diciendo que se contratan en el puerto o en la
  Avenida Maipú, sin enlace falso, y derivando a lo que sí tenemos: Puerto
  Almanza en barco chico. El hueco quedó anotado en "Para Marcelo".
  Enlace interno nuevo desde `/pt-br/` (quinta tarjeta, a dos columnas),
  `/pt-br/experiencias/`, la página general (como guía de la región Tierra del
  Fuego, en el mismo lugar donde Madryn y Esquel tienen la suya) y el pie de
  las guías de Madryn, Esquel y la gastronómica: **seis enlaces entrantes,
  los seis verificados en producción**. Sitemap: 290 → **291 URLs**.

- **11/11/2026** — **Quinta página informativa en portugués: la guía
  gastronómica "o que comer na Patagônia".** Era lo que seguía en el
  pendiente 5, por dos motivos. Uno: la búsqueda gastronómica del brasileño es
  informacional pura ("o que comer na Patagônia", "comida típica da Patagônia
  argentina", "quanto custa comer na Argentina", "onde comer em Puerto
  Madryn", "chá galês Gaiman") y no existía nada nuestro en portugués. Dos:
  las **15 fichas de restaurantes, cafés, cantinas y cervecerías ya traducidas**
  (12 de Trelew y el valle galés, 3 de Madryn y Playa Unión) no colgaban de
  ninguna página informativa: eran hojas sueltas del árbol de `/pt-br/`, y
  ahora tienen padre. Con los 5 paseos gastronómicos (té galés de Gaiman
  dentro del tour del valle inferior, rota da centolla de Puerto Almanza,
  Sabores do Beagle y los viñedos de la ruta galesa) quedaron **20 fichas pt
  enlazadas, las 20 verificadas con 200 en producción**.
  Nueva página Astro en `/pt-br/o-que-comer-na-patagonia/`: la mesa patagónica
  en tres ideas (la escala —acá la comida viene para compartir y pedir un plato
  por persona es el error caro del visitante—, la temporada y la distancia: no
  hay una cocina patagónica, hay cuatro), los **34 platos, productos y
  experiencias** agrupados en tres bloques con su mejor época y sus lugares,
  una **tabla de temporada mes a mes** con los 34 ítems, el bloque de "onde
  comer" por ciudad, cómo funciona la mesa en Argentina (horarios de cena
  después de las 21, cubierto, propina, el mate que no se pide en el
  restaurante) y 9 preguntas frecuentes.
  **Datos, mismo arreglo que el calendario de fauna:** `src/data/gastronomia-es.json`
  es la copia exacta del array `GASTRO` de la página en español (meses,
  lugares, provincia, tipo, destacado) y `src/data/gastronomia-pt.json` traduce
  nombre, mejor época y el dato de cada ítem. **Ojo con el mantenimiento:** la
  página en español sigue teniendo su propia copia del array adentro del HTML,
  así que si ahí se agrega o se cambia un plato, hay que regenerar
  `gastronomia-es.json` (anotado en el pendiente 14).
  **No se duplicó la app de filtros** de la versión española (128 KB que
  compilan en el navegador): los 34 ítems se sirven escritos en el HTML, que es
  lo que Google puede leer. La tabla mes a mes son 34 filas por 12 celdas y con
  clases de utilidad por celda el HTML se iba a 122 KB; con cinco reglas de CSS
  propias bajó a 87 KB.
  `Article` + `FAQPage` + `BreadcrumbList`, los tres validados parseando el
  JSON-LD de producción. hreflang recíproco con `/que-comer-patagonia/`: los
  tres `<link rel="alternate">` agregados a mano al `<head>` de
  `public/que-comer-patagonia/index.html`, verificados en los dos sentidos en
  producción. Enlace interno nuevo desde `/pt-br/` (cuarta tarjeta del grid,
  que además lo completa en dos columnas) y desde `/pt-br/experiencias/`.
  Sitemap: 289 → **290 URLs**.

- **10/11/2026** — **Cuarta página informativa en portugués: la guía de destino
  de Esquel, Trevelin y el Parque Nacional Los Alerces.** Era lo que seguía en
  el pendiente 5: la cordillera de Chubut es el segundo destino del brasileño
  después de la costa y es el que **más fichas en portugués tiene publicadas**
  —32 quedaron enlazadas desde esta página, contra 13 de la guía de Madryn—,
  pero no tenía ninguna página informativa en portugués. Toda la capa
  informacional de esa búsqueda ("o que fazer em Esquel", "Parque Nacional Los
  Alerces como visitar", "La Hoya esqui", "trem La Trochita", "Trevelin
  tulipas", "quantos dias em Esquel") caía en la home, que es comercial.
  Nueva página Astro en `/pt-br/o-que-fazer-em-esquel-e-trevelin/`: por qué la
  cordillera de Chubut y no Bariloche (escala, precio, el alerzal en grupo
  chico), **ocho bloques de qué hacer** —Los Alerces y el alerzal milenar con
  la navegación del Lago Menéndez desde Puerto Chucao, Trevelin y el té galés
  con el molino de 1918, nieve en La Hoya, tulipanes de setiembre–octubre y
  peonías de diciembre, Esquel con La Trochita y los alrededores, rafting en
  Corcovado y Piedra Parada, turismo ancestral y astroturismo en Lago Rosario,
  y Cholila–Leleque–Comarca Andina—, **las cuatro temporadas** con el criterio
  que importa y que la española no dice (**el invierno cierra trechos del
  parque y la navegación del alerzal normalmente no opera**: nieve e invierno
  no son la misma visita), **roteiro de 4 días**, cómo llegar desde Brasil por
  EQS o por Bariloche con los 290 km, y **9 FAQ** con las preguntas reales del
  mercado. Lleva `TouristDestination`, `FAQPage` y `BreadcrumbList`.
  Dos decisiones de método, además del molde ya probado tres veces: los
  enlaces a paseos salen de `obtenerExperienciasPt()` (una ficha sin traducir
  no se enlaza y no deja un 404), y **se enlaza un solo paseo por cada grupo de
  fichas duplicadas de "Para Marcelo"**, para no reforzar desde una página
  nueva la competencia interna del catálogo. Las 32 verificadas con 200 en
  producción. `hreflang` recíproco con `/esquel-trevelin`, a la que le faltaban
  los tres `<link rel="alternate">` y el `og:locale:alternate`, y se los
  agregué. Enlazada desde `/pt-br/` (tarjeta nueva), desde la puerta de entrada
  general (el bloque de la cordillera ahora tiene su enlace de guía, como ya
  tenía el de Madryn) y desde la guía de Puerto Madryn, que ahora cierra
  ofreciendo seguir a la cordillera. Sitemap: 288 → **289 URLs**.

- **09/11/2026** — **Tercera página informativa en portugués: la puerta de
  entrada general, "o que fazer na Patagônia argentina".** Era el primero de
  los pendientes del punto 5 y la consulta más amplia de todo el mercado
  brasileño ("o que fazer na Patagônia argentina", "roteiro Patagônia
  argentina", "quantos dias na Patagônia", "melhor época para visitar a
  Patagônia", "Patagônia argentina é caro"). Hasta hoy esa búsqueda entraba
  por la home, que es comercial y no responde nada de eso. Nueva página Astro
  en `/pt-br/o-que-fazer-na-patagonia-argentina/`: arranca por el dato que
  define todo el viaje (casi un millón de km², más de 2.000 km de Madryn a
  Ushuaia, ninguna semana alcanza para más de una región), **las ocho regiones
  una por una** con los días que pide cada una —costa de Chubut, valle galés,
  Esquel–Trevelin–Los Alerces, nieve de La Hoya, Ushuaia y el Beagle, El
  Calafate y El Chaltén, la capa de aventura que ningún roteiro brasileño
  incluye (Corcovado, Piedra Parada, Cholila, astroturismo de Lago Rosario) y
  qué comer—, **las cuatro ventanas de temporada**, **cuatro roteiros** (7,
  10, 15 y 20+ días), cómo llegar desde Brasil con los cuatro aeropuertos
  (PMY/REL, EQS, FTE, USH) y el aviso de Aeroparque contra Ezeiza, y **8
  preguntas frecuentes** escritas con las búsquedas reales del mercado. Lleva
  `TouristDestination` con `includesAttraction`, `FAQPage` y `BreadcrumbList`,
  y **hreflang recíproco** con `/que-hacer-patagonia/`: los tres
  `<link rel="alternate">` se agregaron a mano al `<head>` de
  `public/que-hacer-patagonia/index.html`, que no declaraba alternativa en
  portugués. **Los enlaces a los paseos salen de `obtenerExperienciasPt()`**,
  no de una lista a mano: **36 fichas pt enlazadas, las 36 sirven 200**, y la
  que se traduzca mañana aparece sola. Verificado en producción: 200, canonical
  propio, hreflang recíproco en los dos sentidos, 54 KB, y el sitemap pasó de
  287 a **288 URLs**. Enlazada desde `/pt-br/` (tarjeta destacada "Comece por
  aqui", arriba de las otras dos), desde el calendario de fauna, desde la guía
  de Puerto Madryn y desde el listado de `/pt-br/experiencias/`: no queda
  aislada y reparte hacia las dos informativas que ya existían. No se tocó la
  fórmula de venta, el checkout, Make ni Firebase.

- **09/11/2026** — **Mantenimiento del pendiente 13, verificado contra
  producción.** Cruzado el sitemap real (`/sitemap-0.xml`, 287 URLs antes del
  push) contra `src/data/meta-es.json` y `src/data/traducciones-pt.json`:
  **112 de 112 fichas en español tienen meta description escrita a mano** y
  las 84 traducciones pt siguen en pie. El admin no publicó fichas nuevas
  desde el 02/11. Barrido de `slugPt` buscando palabras en español y erratas
  de destino: **ningún caso nuevo** después del `puerto-madrid` corregido el
  08/11. **Nota de método para la próxima corrida:** este cruce hay que
  hacerlo contra el sitemap de producción, no reimplementando el armado de
  slugs en un script aparte — probé eso y `conSlugsUnicos` sobre datos crudos
  de la API REST da slugs repetidos, porque el pipeline real de
  `contenido.js` normaliza antes. El sitemap ya es la verdad publicada.

- **08/11/2026** — **Segunda página informativa en portugués: la guía de
  destino de Puerto Madryn y Península Valdés.** El calendario de fauna del
  07/11 cubrió el "cuándo"; faltaba el "qué hago cuando llegue", que es la otra
  mitad de la búsqueda informativa del brasileño ("o que fazer em Puerto
  Madryn", "quantos dias ficar em Puerto Madryn", "como ir de Puerto Madryn a
  Península Valdés", "precisa alugar carro"). Del lado español eso lo cubre
  `/puerto-madryn`, que vive en `public/` y nunca se tradujo. Nueva página en
  `/pt-br/o-que-fazer-em-puerto-madryn/` con por qué el destino, las cuatro
  temporadas del año, **seis bloques de qué hacer** (ballenas con la
  navegación de Pirámides y El Doradillo desde la playa, circuito de la
  península, pingüinos de Punta Tombo, lobos de Punta Loma con el city tour,
  el valle galés de Gaiman–Trelew–Dolavon y dónde comer), **roteiro de 4
  días**, cómo llegar desde Brasil (sin vuelo directo, conexión por Buenos
  Aires, PMY a 10 km y REL a 65 km) y **8 preguntas frecuentes** escritas con
  las búsquedas reales del mercado. Lleva `TouristDestination`, `FAQPage` y
  `BreadcrumbList`, y **hreflang recíproco**: se le agregaron a mano los tres
  `<link rel="alternate">` al `<head>` de `public/puerto-madryn.html`, que
  hasta hoy no declaraba alternativa en portugués. **Los enlaces a los paseos
  salen de las traducciones reales** (`obtenerExperienciasPt`), no de una
  lista escrita a mano: una ficha sin página en portugués no se enlaza, y la
  que se traduzca mañana aparece sola. Verificado en producción: 200, canonical
  propio, hreflang recíproco en las dos lenguas, **las 13 fichas pt enlazadas
  sirven 200** y el sitemap pasó de 286 a 287 URLs. La página pesa 41 KB.
  Enlazada desde `/pt-br/`, desde el listado pt y desde el calendario de fauna
  en portugués. No se tocó la fórmula de venta, el checkout, Make ni Firebase.

- **08/11/2026** — **Corregido un slug pt con el nombre del destino mal
  escrito.** La ficha costera de El Doradillo se publicaba en
  `/pt-br/experiencias/doradillo-avistagem-baleias-puerto-madrid/`: el script
  de traducción había escrito **"madrid" en vez de "madryn"**, justo en la
  palabra que la página necesita para posicionar. Se corrigió el `slugPt` en
  `traducciones-pt.json` y se agregaron **dos reglas 301** en
  `public/_redirects` para trasladar el posicionamiento de la URL vieja, que ya
  estaba en el sitemap. Verificado en producción: la nueva sirve 200 y la vieja
  responde 301. **Se barrieron los otros 83 `slugPt` buscando palabras en
  español, acentos sueltos y erratas**: los dos sospechosos que quedaron son
  nombres propios reales ("Delicias de la Fuente", "Nant y Fall") y no se
  tocan. Conviene repetir ese barrido cada vez que el script de traducción
  genere slugs nuevos.

- **07/11/2026** — **Primera página informativa en portugués: el calendario de
  fauna.** Hasta hoy `/pt-br/` eran 84 fichas de venta y nada más: un brasileño
  que todavía no sabe cuándo viajar busca en informacional ("melhor época para
  ver baleias em Puerto Madryn", "quando ver pinguins em Punta Tombo", "melhor
  época Península Valdés") y ahí no existíamos, aunque del lado español eso lo
  cubre `/calendario-fauna/`, que vive en `public/` y nunca se tradujo. Nueva
  página en `/pt-br/melhor-epoca-fauna-patagonia/` con las **33 especies** del
  calendario: tira de 12 meses por especie (temporada alta / se ve / no se ve),
  mejor época, dónde encontrarla, el dato de cada una, un bloque de "o que está
  no auge em cada mês" y el enlace a las fichas en portugués que la ven —**18
  fichas pt enlazadas, las 44 referencias del archivo resuelven**—. Lleva
  FAQPage con las seis preguntas con las que busca un brasileño,
  BreadcrumbList y **hreflang recíproco**: se le agregaron a mano los tres
  `<link rel="alternate">` al `<head>` de `/calendario-fauna/`, que hasta hoy
  no declaraba alternativa en portugués. Enlazada desde la home y desde el
  listado pt. **Los datos salen del MISMO `public/datos-fauna.json` que usa la
  página en español**, así que no hay dos verdades: lo único nuevo es
  `src/data/fauna-pt.json` (nombre, zonas, mejor época y dato de cada especie
  en pt-BR). Verificado en producción: 200, canonical propio, hreflang
  recíproco en las dos lenguas, los 18 enlaces internos sirven 200 y el sitemap
  pasó de 285 a 286 URLs. La página pesa 96 KB (las tiras de meses son 396
  chips: con las clases de Tailwind repetidas pesaba 124 KB, con tres clases
  propias quedó en 79 KB de build). No se tocó la fórmula de venta, el
  checkout, Make ni Firebase.

- **06/11/2026** — Cinco fichas nuevas en portugués y el barrido de
  traducciones condensadas. Las cinco: el vuelo panorámico de Trevelin
  (`paseos-aereos-y-de-bautismo`, "voo panorâmico" es búsqueda con volumen y el
  sitio no tenía ninguna página aérea en portugués), el astroturismo de Lago
  Rosario Lodge, los dos paquetes de 3 noches (Mini Ski Week en La Hoya y el de
  peonías en Trevelin, que son las dos únicas páginas en portugués con precio de
  paquete cerrado) y Cantina Marcelino, en el puerto de Rawson, que cae justo en
  el circuito Madryn–Valdés–Punta Tombo que hace el brasileño. Escritas a mano,
  con 2–3 FAQ cada una y con el hash de la huella de Firestore para que el
  script no las pise. Se sacó además la clave muerta `burgermagic` de
  `traducciones-pt.json` (había quedado de cuando esa ficha se renombró a
  `super-magic`, que ya tiene su propia entrada). Cobertura pt: 79 → 84.
  Sitemap: 280 → 285 URLs.

- **04/11/2026** — Cinco fichas nuevas en portugués y la pt de rafting
  completa. Las cinco: trekking al Glaciar Torrecillas y Expedición Menéndez
  (las dos de glaciares del Parque Nacional Los Alerces, que es lo que busca un
  brasileño después de los pingüinos y las ballenas), las dos de observación de
  aves (Los Alerces + Piedra Parada el full day, Laguna La Zeta el half day) y
  Lagos Off Road 4x4 de Ushuaia (Paso Garibaldi, lagos Escondido y Fagnano).
  Escritas a mano, con las 3 FAQ cada una, y con el hash de la huella de
  Firestore para que el script no las pise. Además se completó la pt de
  `rafting-en-corcovado`, que se cortaba justo antes de "LA ACTIVIDAD INCLUYE"
  y por eso la página en portugués no decía qué incluye el rafting: ahora
  traduce la ficha entera (equipamiento, transfer, refrigerio, qué llevar,
  servicio de fotógrafo y opción con almuerzo) y se le corrigió el hash, que
  estaba viejo y la exponía a que el script la pisara. Sitemap: 275 → 280 URLs;
  páginas pt: 74 → 79.

- **03/11/2026 (segunda parte)** — Las traducciones se indexan por **slug único**
  de la ficha y no por el slug compartido del grupo, así que las fichas hermanas
  con sufijo de prestador ya pueden publicar en portugués. Hasta hoy
  `obtenerExperienciasPt()` filtraba por `esFichaPrincipal` y buscaba la
  traducción por el slug del grupo: las 14 fichas que el 02/11 pasaron a tener
  URL propia **no podían existir en `/pt-br/` aunque se las tradujera**. Ahora
  para la ficha que se quedó con la URL limpia los dos slugs coinciden (las 69
  páginas pt ya indexadas no se mueven) y una hermana publica en cuanto se le
  escribe su entrada. **Sin entrada propia no hay página, a propósito:** 6 de las
  14 hermanas publican palabra por palabra el mismo texto en español que su
  principal y traducirlas sería duplicado en portugués (anotado en
  "Para Marcelo"). El cambio son 2 archivos, `src/lib/traducciones.js` y
  `src/pages/sitemap-imagens.xml.js`; verificado con el cambio solo, sin tocar
  datos: **las 246 páginas del build salen byte a byte idénticas**, lo único que
  cambia son los timestamps del sitemap y del catálogo de `/aike`.

- **03/11/2026** — **Arreglado un error de emparejamiento en la página pt de
  Península Valdés**, el destino más buscado del mercado brasileño. La
  traducción que vivía bajo la clave `peninsula-valdes` es la de SUSSANICH
  TURISMO (sale de Puerto Pirámides, 11 h), pero desde el 02/11 esa clave es la
  ficha de Forastero tour (sale de Puerto Madryn, 10 h). Resultado:
  `/pt-br/experiencias/excursao-peninsula-valdes-puerto-piramides/` describía el
  itinerario de Sussanich mientras publicaba el precio de Forastero ($144.000) y
  su link de reserva —**un brasileño leía un tour y reservaba otro**—. La entrada
  se mudó a la clave `peninsula-valdes-sussanich-turismo` conservando su
  `slugPt`: la URL indexada no cambia y ahora describe, cobra ($135.000) y
  reserva el tour correcto; su hreflang es-AR pasó a apuntar a
  `/experiencias/peninsula-valdes-sussanich-turismo/`. Forastero tiene su página
  pt nueva. Se buscó el mismo error en los otros 13 grupos comparando cada
  traducción contra las dos fichas hermanas (coincidencia de números y nombres
  propios, que no cambian al traducir): **era el único caso**.

- **03/11/2026** — Cinco páginas en portugués nuevas, de fichas hermanas con
  texto propio: Península Valdés de Forastero
  (`peninsula-valdes-saindo-de-puerto-madryn`), Los Alerces día completo de
  MerakiSur (`parque-nacional-los-alerces-dia-inteiro-esquel`), Piedra Parada y
  el cañadón La Buitrera de MerakiSur
  (`piedra-parada-canyon-la-buitrera-esquel`), Valle de Cholila de LIMITS
  ADVENTURE (`valle-de-cholila-butch-cassidy-museu-leleque`) y Trevelin por la
  Ruta 259 de LIMITS ADVENTURE (`trevelin-rota-259-nant-y-fall-moinho-andes`).
  Escritas a mano desde el texto real de cada ficha, con título, meta
  description de 133 a 139 caracteres, cuerpo, destino, categoría, duración, alt
  y 3 FAQ. Verificado contra producción: de las 112 fichas en español, 106 sin
  un solo cambio y 6 que sólo ganan o corrigen el hreflang pt-BR; las 69 pt
  anteriores sin cambios en título, description, canonical, precio ni link de
  reserva (salvo la de Valdés, que es el arreglo); **cada página pt sirve el
  mismo precio y el mismo slug de reserva que su ficha en español**; cero
  títulos, cero descriptions y cero canonicals duplicados entre las 186 fichas.
  Sitemap 270 → 275.

- **03/11/2026** — Las 5 fichas de más impacto para Brasil, traducidas a mano al
  portugués: `pinguinera-punta-tombo` → `pinguins-punta-tombo-trelew`,
  `punta-tombo` → `punta-tombo-pinguins-puerto-madryn`,
  `punta-loma-con-city-tour` → `punta-loma-lobos-marinhos-city-tour-puerto-madryn`,
  `trekking-laguna-esmeralda` → `trilha-laguna-esmeralda-ushuaia` y
  `sabores-del-beagle` → `sabores-do-beagle-puerto-almanza-ushuaia`. Hasta hoy
  **el sitio no tenía una sola página en portugués de Punta Tombo**, que es la
  búsqueda de fauna más fuerte del mercado brasileño ("pinguins Punta Tombo"),
  ni de Punta Loma, ni de la Laguna Esmeralda. Las 5 llevan título, meta
  description de 124 a 140 caracteres, cuerpo completo, destino, categoría,
  duración, alt y 3 FAQ cada una, escritas desde el texto real de la ficha en
  Firestore y con el vocabulario con el que busca un brasileño
  ("pinguins-de-magalhães", "lobos-marinhos", "trilha", "frutos do mar",
  "toninha-overa"), no traducción literal. Verificado en producción: las 5
  sirven 200, hreflang es-AR / pt-BR / x-default recíproco en las dos lenguas,
  canonical propio, FAQPage, cero títulos y cero descriptions duplicadas entre
  las 69 páginas pt, y el precio y el link de reserva idénticos a la ficha en
  español (no se tocó la fórmula de venta ni el checkout). Sitemap 265 → 270.

- **02/11/2026** — Una URL por prestador: 14 tours que no tenían página ahora
  se publican. Firestore tenía 113 tours activos y el sitio publicaba 98
  fichas. La URL se arma desde el título, así que cuando dos agencias cargaban
  el mismo tour con el mismo nombre las dos apuntaban a la misma dirección y
  Astro resolvía el choque quedándose con una sola: **el otro tour no existía
  para nadie** —no estaba en el sitemap, no se encontraba en Google y no se
  podía reservar desde el sitio—. Decidido con Marcelo: cada prestador tiene su
  URL propia, la que ya está indexada no se toca y la otra pasa a
  `{slug}-{nombre-del-prestador}` (`piedra-parada-merakisur`,
  `trevelin-full-day-limits-adventure`, `peninsula-valdes-sussanich-turismo`…).
  La lógica vive en `src/lib/slugs.js`, una capa nueva de la parte Astro:
  **no se tocó `src/lib/contenido.js`**, ni el cálculo de precio, seña y saldo,
  ni el `slugReserva` que viaja en el botón "Reservar" —cada ficha nueva
  reserva su propio tour con el slug que la app ya usaba—. La ficha que no se
  queda con la URL limpia lleva el prestador en el `<title>` en lugar del
  sufijo del lugar, para que no haya dos títulos iguales compitiendo, y las 14
  tienen meta description escrita a mano (`meta-es.json`, 112 fichas, cero
  duplicadas). En portugués no cambió nada: las traducciones están indexadas
  por el slug compartido, así que `/pt-br/` sigue publicando sólo la ficha de
  la URL limpia. Verificado contra producción antes y después del deploy: las
  98 fichas ya indexadas sirven el mismo título, description, canonical, precio
  y link de reserva que antes (**cero diferencias**), las 64 páginas en
  portugués idénticas, las 14 nuevas con canonical propio, y cero títulos y
  cero descriptions duplicadas entre las 112. Sitemap: 251 → 265 URLs.

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

### 02/11/2026 (segunda parte) — Una URL por prestador

Marcelo contestó la pregunta que había quedado abierta a la mañana: cada
prestador tiene su URL propia. Antes de tocar nada confirmé dos cosas que
cambiaban el diseño del arreglo. La primera: el slug que usa el botón
"Reservar" no es el de la página, es `slugReserva`, que `contenido.js` ya
calcula desambiguando los títulos repetidos (`valle-de-cholila-2`), así que el
checkout no se entera de este cambio y no hubo que tocarlo. La segunda: el que
se queda con la URL ya indexada **no** se puede elegir por ID ni por orden
alfabético. Lo probé: con un `sort` por ID dos fichas ya indexadas cambiaban de
prestador, de precio y de título (`valle-de-cholila` y la portada centro de Los
Alerces), porque Firestore devuelve los documentos en orden de bytes
—mayúsculas antes que minúsculas— y Astro resuelve el choque de rutas
quedándose con el último de la lista tal como viene. La regla quedó escrita en
el archivo: **no ordenar**; gana el último del grupo en el orden de llegada,
que es exactamente el que se publica hoy.

El arreglo es una capa nueva, `src/lib/slugs.js`, aplicada en los seis lugares
que listan o enlazan fichas (ficha, listado, guías, sitemap de imágenes,
llms.txt y el catálogo de AIKE) más la capa pt. `contenido.js` no se tocó: la
fórmula de venta y el `slugReserva` quedaron intactos. Las fichas que no tienen
la URL limpia llevan el prestador en el `<title>` en lugar del sufijo del
lugar: si el título se alargaba, Google lo cortaba justo donde estaba la
diferencia. Y les escribí las 14 meta descriptions a mano, porque si no caían
al respaldo automático y una publicaba la lista de rodados de bicicletas del
prestador.

La verificación fue la parte más larga y era la que importaba: bajé las 98
fichas en español y las 64 en portugués de producción **antes** de subir,
comparé una por una contra el build nuevo (título, description, canonical,
precio y link de reserva) y el diff dio cero en las dos lenguas; después del
deploy volví a bajar las 14 nuevas y una muestra de 40 ya indexadas y volvió a
dar cero. Entre las 112 fichas no quedó ningún título ni ninguna description
duplicada. El sitemap pasó de 251 a 265 URLs y las 14 nuevas entraron con
canonical propio y enlazadas desde el listado de `/experiencias/`; las guías
con bloque de fichas pasaron de 34 a 38, porque ahora hay oferta publicada en
lugares que antes quedaban tapados por el duplicado. Avisé por IndexNow:
Yandex aceptó las 178 URLs, Bing sigue en 403.

**Qué mido como resultado esperado:** 14 productos que no se podían encontrar
ni reservar ahora tienen página, sitemap y enlaces internos. Son tours de
Esquel, Trevelin, Los Alerces, Cholila, Gualjaina, Corcovado y Península
Valdés, todos con intención de compra. No espero que le resten posiciones a sus
hermanas: cada una tiene título y description propios, y lo que antes había era
una sola página, no dos compitiendo.

**Qué quedó pendiente:** las 14 fichas nuevas no tienen versión en portugués
—las traducciones se buscan por el slug, así que necesitan entrada propia con
su slug nuevo—, con lo cual el pendiente de cobertura pt pasó de 34 a 48
fichas. Y quedaron dos cosas para el admin, anotadas en "Para Marcelo": el tour
de MerakiSur cargado dos veces (que el sitio ya publica una sola vez, pero
conviene borrar) y las dos fichas hermanas que ahora muestran precios distintos
en Google para lo que parece el mismo tour.

### 03/11/2026 — Cinco fichas de fauna y Ushuaia en portugués de Brasil

Arranqué por el mantenimiento de cada corrida (pendiente 12): crucé las 112
fichas en español del sitemap de producción contra las claves de
`src/data/meta-es.json` y de `src/data/traducciones-pt.json`. **Meta
descriptions: 112 de 112, cero faltantes** — el admin no publicó fichas nuevas
desde el 02/11, así que no había nada que escribir. Cobertura pt: faltaban 48.

Con eso libre, trabajé el pendiente 3 (cobertura en portugués) y traduje las 5
de más impacto para Brasil: Punta Tombo por los dos prestadores, Punta Loma con
city tour, la trilha de la Laguna Esmeralda y Sabores do Beagle. Las dos
primeras importan más de lo que parece: `pinguins Punta Tombo` es una de las
búsquedas de fauna más fuertes del mercado brasileño y el sitio no tenía
**ninguna** página en portugués de Punta Tombo. De paso quedaron cubiertos los
dos destinos de Ushuaia que faltaban del lado del trekking y la gastronomía.

Un hallazgo del método que conviene no volver a averiguar: el cuerpo en español
de cada ficha **no hay que raspárselo al HTML de producción** —el JSON-LD lo
recorta a 300 caracteres y el texto visible viene mezclado con los bloques de
"Seguí explorando"—. Se lee entero con la API REST pública de Firestore que ya
usa `src/lib/contenido.js` (mismo endpoint y misma clave que
`scripts/traducir-pt.mjs`), y de ahí sale también el `hash` de la huella, que
hay que escribir en la entrada para que el script no pise después lo que se
escribió a mano. Y para verificar de verdad conviene correr `npx astro build`
**sin** `DATOS_LOCALES=1`: con los datos locales se generan 9 páginas y las
nuevas de `/pt-br/` no aparecen; con Firestore se generan las 246 y se puede
comprobar página por página.

El hallazgo que sí abre pendiente nuevo es el 4: **las 14 fichas con sufijo de
prestador no pueden tener página en portugués por cómo está escrito el código**,
no por falta de traducción. `obtenerExperienciasPt()` filtra por
`esFichaPrincipal` y las traducciones están indexadas por el slug base, así que
`peninsula-valdes-sussanich-turismo`, `piedra-parada-merakisur`, las 6 de
MerakiSur en Los Alerces y Ruta Galesa y las demás hermanas quedan fuera de
`/pt-br/` aunque se las traduzca. Son varias de los destinos que más se buscan
desde Brasil. El arreglo es chico y del lado de Astro (indexar por slug único),
pero toca la capa que decide qué se publica en portugués, así que va en su
propia corrida y con la misma verificación antes/después que se usó el 02/11.

Resultado esperado: 5 URLs nuevas en portugués para búsquedas de alto volumen
en Brasil que hasta hoy no tenían ninguna página del sitio compitiendo. Se mide
en Search Console (cuando esté conectado) por impresiones de `/pt-br/` en
consultas con "pinguins", "Punta Tombo", "lobos marinhos", "Laguna Esmeralda" y
"Puerto Almanza", y por el total de páginas pt indexadas: 64 → 69. IndexNow:
Yandex aceptó las 69 URLs pt; Bing sigue devolviendo 403 hasta que Marcelo
reclame el sitio en Bing Webmaster Tools. Quedó pendiente: 29 fichas traducibles
a mano (de a 5 por corrida) y las 14 trabadas por el pendiente 4.

### 03/11/2026 (segunda parte) — Las fichas hermanas ya pueden vivir en portugués

Marcelo aprobó el pendiente 4 que había quedado abierto en la corrida de la
mañana, así que esta corrida lo resolvió. El cambio de código es chico y la
parte que importa es que se pudo probar que **no mueve nada**: con el cambio
aplicado y sin tocar los datos, el build genera las 246 páginas byte a byte
idénticas al build anterior (sólo cambian los timestamps del sitemap y del
catálogo de `/aike`). Eso es lo que dejaba tranquilo para tocar la capa que
decide qué se publica en `/pt-br/`.

Lo más valioso de la corrida no era lo que estaba previsto. Al cruzar cada
traducción contra las dos fichas de su grupo apareció que **la página en
portugués de Península Valdés estaba emparejada con la ficha equivocada**: el
texto es el de Sussanich (sale de Puerto Pirámides, 11 h) y la ficha a la que
estaba atada es la de Forastero (Puerto Madryn, 10 h), así que la página
publicaba el itinerario de uno con el precio y el botón de reserva del otro.
Viene así desde el 02/11, cuando cada prestador pasó a tener su URL: la
traducción estaba indexada por el slug del grupo y ese slug cambió de dueño.
Es la página de portugués del destino más buscado de la Patagonia desde Brasil,
y el error no se ve mirando la página: hay que comparar el texto contra las dos
fichas en español. Se arregló mudando la entrada a la clave de Sussanich **sin
cambiar el `slugPt`**, así que la URL indexada no se pierde y ahora describe,
cobra y reserva el tour correcto; Forastero quedó con página pt propia. Busqué
el mismo error en los otros 13 grupos comparando números y nombres propios
—que no cambian al traducir— y era el único caso.

El método para esa verificación conviene no volver a inventarlo: comparar la
traducción contra cada ficha hermana por coincidencia de tokens invariantes
(números y palabras con mayúscula inicial) y quedarse con la que puntúa más
alto. Da un falso positivo cuando el texto de una hermana es un prefijo del de
la otra, que es lo que pasó con `rafting-en-corcovado`: ahí la traducción está
bien emparejada pero **está incompleta**, se corta antes de "LA ACTIVIDAD
INCLUYE", y quedó anotada como primer caso concreto del pendiente 5.

Después escribí las 5 traducciones de hermanas con texto propio, priorizando
por lo que busca un brasileño: Península Valdés de Forastero (ballenas, el
destino nº 1), Los Alerces día completo de MerakiSur (parque UNESCO, el alerce
de 500 años y el Glaciar Torrecillas desde la orilla), Piedra Parada y el
cañadón La Buitrera, el Valle de Cholila con el Museo Leleque y la cabaña de
Butch Cassidy, y Trevelin por la Ruta 259 con el molino, Nant y Fall y las
viñas. De las 14 hermanas, 8 tienen texto propio: quedan 3 sin traducir
(`lago-bagillt-merakisur`, `panoramicas-de-esquel-merakisur`,
`rafting-en-corcovado-merakisur`) y 6 que **no** se traducen porque repiten
palabra por palabra el texto de su principal.

Resultado esperado: 5 URLs nuevas en portugués, 4 de ellas de prestadores que
hasta hoy no tenían ninguna página en Brasil, y una página en el destino más
buscado del mercado que dejó de contradecirse a sí misma. Se mide en Search
Console por impresiones de `/pt-br/` en consultas con "Península Valdés",
"baleias", "Los Alerces", "Piedra Parada" y "Trevelin", y por páginas pt
indexadas: 69 → 74. IndexNow: Yandex aceptó las 74 pt y las URLs de Valdés en
los dos idiomas; Bing sigue en 403 hasta que Marcelo reclame el sitio.
Quedó pendiente: 32 fichas traducibles a mano (de a 5 por corrida) y la
decisión de catálogo de los 6 pares con texto repetido.

### 04/11/2026 — Glaciares y aves en portugués, y la pt de rafting que no decía qué incluye

Arranqué por el mantenimiento (pendiente 12): crucé las 112 fichas en español
del sitemap de producción contra `meta-es.json` y `traducciones-pt.json`. **Meta
descriptions: 112 de 112**, nada que escribir —el admin no publica fichas nuevas
desde el 02/11—. Cobertura pt: faltaban 38.

Con eso libre trabajé el pendiente 3 y traduje las 5 de más impacto para Brasil:
las dos de glaciares del Parque Nacional Los Alerces (trekking al Glaciar
Torrecillas y Expedición Menéndez, que combina el alerzal milenario con el
glaciar) y las dos de observación de aves (el full day de Los Alerces más Piedra
Parada, y el half day de la Laguna La Zeta en Esquel, con sus 150 especies
censadas). El glaciar es la búsqueda que sigue a los pingüinos y las ballenas en
el mercado brasileño, y el sitio no tenía **ninguna** página en portugués de
glaciares de Chubut. Birdwatching es nicho pero de intención altísima y casi sin
competencia en portugués. La quinta fue Lagos Off Road de Ushuaia: 4x4 por el
Paso Garibaldi hasta los lagos Escondido y Fagnano, que es uno de los paseos que
el brasileño compra sí o sí cuando va a Ushuaia, y hasta hoy sólo existía en
español.

Lo que más valor tuvo no fue lo previsto. Aproveché para cerrar el caso concreto
que el 03/11 había quedado anotado en el pendiente 5: la página en portugués de
`rafting-en-corcovado` **se cortaba justo antes de "LA ACTIVIDAD INCLUYE"**, así
que un brasileño leía la descripción del río y no se enteraba de que el precio
incluye casco, remo, chaleco, neoprene, transfer de vuelta y refrigerio. Ahora
traduce la ficha entera, incluida la opción con almuerzo y el servicio de
fotógrafo. De paso: tenía el `hash` viejo (`778a8cc1…` contra el
`b1714611…` de la huella actual), así que si alguna vez corre
`scripts/traducir-pt.mjs` con la clave de API, le pasaba por arriba la máquina a
lo escrito a mano. Quedó con el hash correcto.

Para la próxima corrida del pendiente 5 dejé anotado el método, que es lo que
faltaba: comparar el largo del `descricao` en portugués contra el largo del
cuerpo en español de Firestore —una traducción sana queda entre el 90% y el 115%
del original— y chequear que los bloques en mayúsculas del original ("NO
INCLUYE", "SUGERENCIAS") tengan equivalente. Con eso se barren de una las 57
traducciones viejas que salieron del script, sin leerlas una por una.

Resultado esperado: 5 URLs nuevas en portugués en búsquedas que el sitio no
disputaba y una sexta que pasó a vender lo que incluye. Se mide en Search
Console (cuando esté conectado) por impresiones de `/pt-br/` en consultas con
"glaciar Torrecillas", "Parque Nacional Los Alerces", "observação de pássaros
Patagônia", "Lago Fagnano", "Paso Garibaldi Ushuaia" y "rafting Patagônia", y
por el total de páginas pt indexadas: 74 → 79. Sitemap: 275 → 280 URLs.
IndexNow: Yandex aceptó las URLs nuevas; Bing sigue en 403 hasta que Marcelo
reclame el sitio en Bing Webmaster Tools. Quedó pendiente: 27 fichas traducibles
a mano (de a 5 por corrida) y la decisión de catálogo de los 6 pares con texto
repetido.


### 06/11/2026 — Vuelo panorámico, astroturismo y paquetes en portugués; y el barrido del pendiente 5

Arranqué por el mantenimiento (pendiente 12): 112 fichas en español en el
sitemap de producción, **112 de 112 con meta description escrita a mano**, nada
que corregir — el admin no publica fichas nuevas desde el 02/11. Cobertura pt:
faltaban 33.

Con eso libre trabajé el pendiente 3, pero antes de traducir las cinco que la
bitácora tenía anotadas **las leí contra su ficha principal en Firestore, y tres
de las cinco no había que traducirlas**: `lago-bagillt-merakisur` es el texto de
LIMITS palabra por palabra salvo el último párrafo, `rafting-en-corcovado-merakisur`
es la primera mitad del texto de LIMITS (sin el bloque de qué incluye, que es
justo lo que el 04/11 arreglamos en la otra) y `panoramicas-de-esquel-merakisur`
repite el párrafo de LIMITS y le suma recomendaciones propias. Traducirlas era
meter en portugués el mismo duplicado que en español estamos tratando de evitar.
Quedaron anotadas así en el pendiente 3, con la única que vale la pena
(`panoramicas-de-esquel-merakisur`) colgada de la decisión de catálogo.

Lo mismo pasó con las dos de astroturismo: `astroturismo-y-aventura-en-lago-rosario`
y `astroturismo-en-lago-rosario-lodge` son **el mismo paseo cargado dos veces**
—mismo lodge a 48 km de Esquel, mismas tres actividades a elección, mismo cierre
con cena— y no las agrupa `slugs.js` porque tienen títulos distintos, así que no
estaban en la lista de duplicados. Tradujimos **sólo la versión larga** y el par
quedó anotado en "Para Marcelo".

Las cinco que sí se publicaron: **vuelo panorámico de Trevelin** (lo de más
impacto que quedaba: "voo panorâmico" tiene volumen en Brasil y el sitio no
tenía ninguna página aérea en portugués), **astroturismo en Lago Rosario Lodge**
(cielo austral, nicho sin competencia en portugués), los **dos paquetes de 3
noches** —Mini Ski Week en La Hoya y el de peonías en Trevelin— que son las dos
primeras páginas en portugués con un paquete cerrado de varios días, y **Cantina
Marcelino**, en el puerto de Rawson: no es gran búsqueda por sí misma, pero cae
en el circuito Madryn–Valdés–Punta Tombo que el brasileño hace sí o sí, y las
otras seis gastronómicas que faltan son todas de Comodoro, que no es destino
brasileño. De paso: la ficha del vuelo está cargada en el admin con la categoría
`trekking`; en portugués se publicó como "passeios aéreos" y el arreglo del lado
español quedó anotado para Marcelo.

Después corrí el barrido que el 04/11 había quedado planteado para el pendiente
5: comparar el largo del `descricao` en portugués contra el del cuerpo en
español, ficha por ficha. **Dieron seis casos por debajo del 90%**, el peor
`tour-alternativo-al-glaciar-moreno` con 64%. Verifiqué los tres peores y
**ninguno está cortado**: los tres terminan donde termina el español. Lo que
hacen es resumir — la máquina condensó párrafos enteros, así que la página en
portugués dice lo mismo con menos detalle y con menos de las palabras que el
brasileño escribe en Google. El método entonces no detecta truncado, detecta
condensación; el caso cortado del 04/11 se veía por el bloque en mayúsculas
faltante, no por el ratio. Eso quedó corregido en el pendiente 5, con las tres
de más valor para reescribir identificadas: `peninsula-valdes`,
`pinguinera-punta-tombo` y `tour-alternativo-al-glaciar-moreno`, que son las tres
búsquedas más grandes del mercado brasileño y justo las tres más condensadas.

Resultado esperado: 5 URLs nuevas en portugués, tres de ellas en búsquedas que el
sitio no disputaba (vuelo panorámico, astroturismo, paquetes de varios días). Se
mide en Search Console (cuando esté conectado) por impresiones de `/pt-br/` en
consultas con "voo panorâmico Patagônia", "voo panorâmico Trevelin",
"astroturismo Patagônia", "observação de estrelas Patagônia", "esqui La Hoya",
"pacote esqui Argentina", "campo de peônias Trevelin" y "frutos do mar Playa
Unión", y por el total de páginas pt indexadas: 79 → 84. Sitemap: 280 → 285
URLs. Quedó pendiente: 18 fichas traducibles (las de arriba de la lista valen
poco para Brasil, así que el pendiente 5 —reescribir las tres grandes
condensadas— rinde más que seguir traduciendo), la decisión de catálogo de los 6
pares con texto repetido y la del par de astroturismo.

### 07/11/2026

Arranqué por el pendiente 6 (reescribir las tres traducciones "condensadas"
que la corrida del 06/11 había identificado: `peninsula-valdes`,
`pinguinera-punta-tombo` y `tour-alternativo-al-glaciar-moreno`) y **antes de
escribir las leí enteras contra el cuerpo en español de Firestore. Las tres
están completas y bien escritas**: dicen todo lo que dice el original
—itinerario, qué incluye, qué no, fauna por época, horarios— con el
vocabulario que usa un brasileño. El ratio bajo que las había marcado no viene
de que falte portugués, viene de que el español es verboso: el de El Calafate
llega envuelto en `<div>` y con repeticiones, y los de Valdés y Punta Tombo
tienen frases larguísimas que en portugués quedan más cortas diciendo lo mismo.
Encima dos de las tres son de las que escribimos a mano el 03/11. Conclusión
anotada en el pendiente 6: **el ratio de largos no sirve como señal en este
sitio** y hoy no hay ninguna traducción identificada para reescribir. Reescribir
esas tres habría sido gastar una corrida en mover texto bueno.

Con eso descartado busqué de dónde sale el crecimiento en Brasil y apareció un
agujero más grande que cualquiera de los pendientes abiertos: **`/pt-br/` eran
84 fichas de venta y cero contenido informativo**. En español tenemos 60 guías
de viaje más 7 páginas informativas; en portugués, nada. Y el brasileño que
todavía no compró no busca "excursão Península Valdés": busca "melhor época
para ver baleias em Puerto Madryn", "quando ver pinguins em Punta Tombo", "o
que fazer em Puerto Madryn". En toda esa capa de la búsqueda no existíamos.

Hice la primera: **`/pt-br/melhor-epoca-fauna-patagonia/`**, el calendario de
fauna en portugués, con las 33 especies, la tira de 12 meses de cada una, mejor
época, dónde encontrarla, el dato, el bloque de qué está en su auge mes por mes
y el enlace a las fichas pt que la ven (18 fichas enlazadas; las 44 referencias
del archivo de fauna resuelven todas). FAQPage con las seis preguntas reales
del mercado, BreadcrumbList, y hreflang recíproco con `/calendario-fauna/`, a
la que le faltaban los `<link rel="alternate">` y se los agregué. **La decisión
de diseño importante: los datos salen del mismo `public/datos-fauna.json` que
usa la página en español**, así que las dos lenguas no se pueden desincronizar;
lo único nuevo es `src/data/fauna-pt.json` con los textos traducidos. Si mañana
el calendario en español suma una especie, la página en portugués la publica
sola en cuanto se le escriba su entrada en pt.

De paso, corregí el motivo del pendiente 9: estaba justificado en "las fichas
en español pierden el bloque de preguntas en el resultado de Google", y eso ya
no existe —**Google dio de baja el resultado enriquecido de FAQ para todos los
sitios**—. No hay que sacar el `FAQPage` que ya publican las páginas en
portugués, pero sumarlo en español ya no compra el acordeón en el buscador: lo
que compra es el texto en sí. Con ese motivo más flaco el pendiente baja.

Resultado esperado: entrar a la capa informativa del mercado brasileño, que es
la de más volumen y la que no disputábamos. Se mide en Search Console (cuando
esté conectado) por impresiones de `/pt-br/melhor-epoca-fauna-patagonia/` en
"melhor época para ver baleias", "melhor época Península Valdés", "quando ver
pinguins Punta Tombo", "melhor época para visitar a Patagônia" y "orcas Punta
Norte", y por los clics que esa página derive a las 18 fichas pt que enlaza.
Sitemap: 285 → 286 URLs. IndexNow avisó a Yandex las dos URLs (Bing sigue en
403, pendiente 11).

Quedó pendiente, en orden: las próximas páginas informativas en portugués
(guía de Puerto Madryn y Península Valdés, "o que fazer na Patagônia
argentina", una gastronómica — pendiente 5, con el molde ya probado), las 18
fichas traducibles de bajo valor del pendiente 3, y las decisiones de catálogo
de "Para Marcelo", que son las que siguen frenando los pendientes 1, 2 y 4.

### 08/11/2026

Pendiente 5, segunda página informativa en portugués: **la guía de destino de
Puerto Madryn y Península Valdés**, en `/pt-br/o-que-fazer-em-puerto-madryn/`.
El calendario de fauna del 07/11 resolvió el "cuándo viajar"; esta resuelve la
otra mitad de la búsqueda informativa, que es la más grande del destino: "o que
fazer em Puerto Madryn", "quantos dias ficar", "como ir de Puerto Madryn a
Península Valdés", "precisa alugar carro em Puerto Madryn", "Puerto Madryn ou
Puerto Pirámides". Esas consultas no las disputaba nadie de nuestro lado:
`/puerto-madryn` existe en español, vive en `public/` y nunca se tradujo.

La página tiene por qué el destino, las cuatro temporadas del año (con el
criterio de que setiembre–noviembre es la ventana más completa), seis bloques
de qué hacer, un roteiro de 4 días con el orden de los días explicado, cómo
llegar desde Brasil y 8 preguntas frecuentes. **La decisión de diseño
importante, igual que en el calendario: los enlaces a los paseos no son una
lista escrita a mano, salen de `obtenerExperienciasPt()`.** Se enlaza por el
slug español de la ficha y la página resuelve el slug portugués sola: una
ficha sin traducir no se enlaza y no deja un 404, y la que se traduzca mañana
aparece sin tocar la guía. Hoy quedan 13 fichas pt enlazadas, todas verificadas
en producción con 200, de todo el circuito Madryn–Valdés–Punta Tombo–Rawson–
valle galés. Lleva `TouristDestination`, `FAQPage` y `BreadcrumbList`, y
hreflang recíproco con `/puerto-madryn`, a la que le faltaban los
`<link rel="alternate">` y se los agregué. Enlazada desde `/pt-br/`, desde el
listado pt y desde el calendario de fauna en portugués, que ahora cierra
mandando a esta.

De paso, revisando los slugs para armar los enlaces, apareció una errata que
estaba publicada e indexada: la ficha costera de El Doradillo se servía en
`/pt-br/experiencias/doradillo-avistagem-baleias-puerto-madrid/`. El script de
traducción había escrito **"madrid" en vez de "madryn"**, justo en la palabra
que esa página necesita para posicionar en Brasil. Corregí el `slugPt` y agregué
dos reglas 301 en `public/_redirects`; verificado: la nueva sirve 200 y la vieja
responde 301. Después barrí los otros 83 `slugPt` buscando palabras en español
y erratas de destino: los dos sospechosos que quedaron son nombres propios
("Delicias de la Fuente", "Nant y Fall") y se quedan como están. Sumé el
barrido al pendiente 13, que es el de mantenimiento de cada corrida.

Resultado esperado: entrar a la capa informativa de la búsqueda del destino más
buscado del sitio en el mercado brasileño, que es también la que alimenta las
fichas. Se mide en Search Console (cuando esté conectado) por impresiones de
`/pt-br/o-que-fazer-em-puerto-madryn/` en "o que fazer em Puerto Madryn",
"quantos dias ficar em Puerto Madryn", "Puerto Madryn Península Valdés",
"como ir de Puerto Madryn a Península Valdés" y "Puerto Madryn vale a pena", y
por los clics que derive a las 13 fichas pt que enlaza. Sitemap: 286 → 287 URLs.
IndexNow avisó a Yandex las 85 URLs de `/pt-br/` y las dos de Puerto Madryn en
español (Bing sigue en 403, pendiente 11: le falta reclamar el sitio en Bing
Webmaster Tools).

Quedó pendiente, en orden: las próximas informativas en portugués ("o que fazer
na Patagônia argentina" como puerta de entrada general, una gastronómica y,
más abajo, una de Esquel y Trevelin, que tiene 25 fichas pt publicadas —más que
Madryn— y ninguna página informativa), las 18 fichas traducibles de bajo valor
del pendiente 3, y las decisiones de catálogo de "Para Marcelo", que son las que
siguen frenando los pendientes 1, 2 y 4.

### 09/11/2026

Arranqué por lo que pedía el pendiente 11: reprobar IndexNow en Bing antes de
tocar nada más. Sigue en **403** en los dos endpoints, 24 horas después del
reintento del 08/11 y con la clave sirviendo 200 en la raíz. Eso descarta la
explicación de "tarda unas horas desde el alta", así que dejo de reintentar a
ciegas y lo pasé a "Para Marcelo" con el pedido concreto: el token del archivo
`BingSiteAuth.xml` de Bing Webmaster Tools, que es la verificación determinista
y no depende de que la importación desde Search Console haya quedado bien.

El trabajo grande de la corrida fue el primero del pendiente 5: **la puerta de
entrada general en portugués**, `/pt-br/o-que-fazer-na-patagonia-argentina/`.
Es la consulta más amplia del mercado brasileño y la única capa de la búsqueda
que todavía caía en la home, que es comercial. La página explica primero el
dato que define el viaje —el tamaño, y que ninguna semana alcanza para más de
una región—, después las ocho regiones una por una con los días que pide cada
una, las cuatro ventanas de temporada, cuatro roteiros (7, 10, 15 y 20+ días),
cómo llegar desde Brasil con los cuatro aeropuertos, y 8 FAQ con las preguntas
reales del mercado. Usé el mismo molde que ya funcionó dos veces: Astro, los
enlaces a paseos salidos de `obtenerExperienciasPt()` —así que **36 fichas pt
quedaron enlazadas y las 36 sirven 200**—, `TouristDestination` + `FAQPage` +
`BreadcrumbList`, y hreflang recíproco con `/que-hacer-patagonia/` agregado a
mano en el `<head>` de la página española. La enlacé desde `/pt-br/` con una
tarjeta destacada arriba de las otras dos, y desde el calendario de fauna, la
guía de Madryn y el listado pt: no queda aislada y ahora `/pt-br/` tiene una
jerarquía informativa de tres niveles (país → destino → calendario) en lugar
de dos páginas sueltas.

De paso corrí el mantenimiento del pendiente 13 contra el sitemap de
producción: **112 de 112 meta descriptions escritas**, 84 traducciones pt en
pie, ningún `slugPt` con erratas nuevas. Dejé anotado en "Hecho" el método
correcto, porque probé hacerlo con un script propio que reimplementaba el
armado de slugs y da falsos positivos: el sitemap publicado es la verdad.

Resultado esperado: entrar a la capa de "todavía no sé a dónde voy" del mercado
brasileño, que es la de más volumen y la que después alimenta las guías de
destino y las fichas. Se mide en Search Console (cuando esté conectado) por
impresiones de `/pt-br/o-que-fazer-na-patagonia-argentina/` en "o que fazer na
Patagônia argentina", "roteiro Patagônia argentina", "quantos dias na
Patagônia", "melhor época para visitar a Patagônia" y "Patagônia argentina é
caro", y por los clics que derive a las tres regiones con más fichas pt
publicadas. Sitemap: 287 → **288 URLs**. IndexNow avisó a Yandex las 87 URLs
de `/pt-br/`.

Quedó pendiente, en orden: la informativa de **Esquel y Trevelin** en portugués
(25 fichas pt publicadas, más que Madryn, y ninguna página informativa), la
gastronómica, las 18 fichas traducibles de bajo valor del pendiente 3, y las
decisiones de catálogo de "Para Marcelo", que son las que siguen frenando los
pendientes 1, 2 y 4.

### 10/11/2026

Trabajé lo que seguía en el pendiente 5: **la guía de destino de Esquel,
Trevelin y el Parque Nacional Los Alerces en portugués**,
`/pt-br/o-que-fazer-em-esquel-e-trevelin/`. El dato que la ordenaba por
encima de la gastronómica es que **la cordillera de Chubut es el bloque con
más fichas en portugués de todo el sitio** —la página terminó enlazando 32,
contra 13 de la guía de Madryn— y hasta hoy no tenía ni una página
informativa en portugués: toda la búsqueda de "o que fazer em Esquel",
"Parque Nacional Los Alerces como visitar", "La Hoya esqui", "trem La
Trochita" y "Trevelin tulipas" caía en la home, que es comercial.

Mismo molde que las tres anteriores —Astro, nada de duplicar los 29 KB de
HTML de `/esquel-trevelin`, enlaces salidos de `obtenerExperienciasPt()`,
`TouristDestination` + `FAQPage` + `BreadcrumbList`, hreflang recíproco
agregado a mano en el `<head>` de la española— con dos cosas propias. La
primera es de contenido: la página dice algo que la versión en español no
dice y que define el viaje, que **el invierno cierra trechos del parque y la
navegación del alerzal normalmente no opera**, así que nieve y parque no son
la misma visita y hay que elegir. La segunda es de método: **se enlaza un solo
paseo por cada grupo de fichas duplicadas de "Para Marcelo"**. Tenía a mano
las dos de cada grupo y enlazar las dos habría sido reforzar desde una página
nueva la competencia interna que los pendientes 2 y 4 están tratando de
cerrar. Las 32 fichas enlazadas verificadas con 200 en producción.

De paso corrí el mantenimiento del pendiente 13 contra el sitemap de
producción: **112 de 112 meta descriptions escritas**, 84 traducciones pt en
pie, ninguna página pt huérfana en el sitemap y las mismas 28 fichas sin
traducir que el 06/11 (el admin no publicó fichas nuevas). El barrido de
slugs encontró un caso nuevo, anotado en el pendiente 13:
`rota-galesa-represa-futaleufu-trevelin-2`, donde el `-2` se comió el "campo
de peônias" que es justo lo que distingue a esa ficha de su hermana. No lo
toqué en esta corrida —cambiar un slug publicado pide su 301 y la regla es
una cosa por corrida, bien hecha— pero queda con el arreglo escrito. También
quedó anotado el falso positivo del método de cruce, que me costó una pasada:
el patrón `/experiencias/<slug>/` matchea también las 84 de `/pt-br/`.

Resultado esperado: cubrir la capa informativa del segundo destino del
mercado brasileño, que es el que más oferta traducida tiene y el que menos
contenido propio tenía. Se mide en Search Console (cuando esté conectado) por
impresiones de `/pt-br/o-que-fazer-em-esquel-e-trevelin/` en "o que fazer em
Esquel", "Parque Nacional Los Alerces", "La Hoya esqui", "Trevelin tulipas",
"quantos dias em Esquel" y "Esquel ou Bariloche", y por los clics que derive a
las 32 fichas pt que enlaza. Sitemap: 288 → **289 URLs**. IndexNow avisó a
Yandex las tres tandas (Esquel, Trevelin y las informativas); **Bing sigue en
403 por tercer día**, así que se deja de reintentar hasta que llegue el token
XML (pendiente 11).

Quedó pendiente, en orden: la informativa **gastronómica** en portugués ("o
que comer na Patagônia"), que además le daría por fin una página de la que
colgar a las 14 fichas de restaurantes y bares que hoy están sueltas; después
Ushuaia; el arreglo del slug `-2` con su 301; las 18 fichas traducibles de
bajo valor del pendiente 3; y las decisiones de catálogo de "Para Marcelo",
que son las que siguen frenando los pendientes 1, 2 y 4.

### 11/11/2026

Trabajé lo que seguía en el pendiente 5: **la guía gastronómica en portugués**,
`/pt-br/o-que-comer-na-patagonia/`. Lo que la ordenaba por encima de Ushuaia
son dos cosas. La primera es el tipo de búsqueda: la gastronómica es
informacional pura y el brasileño la hace antes de elegir fecha ("o que comer
na Patagônia", "comida típica da Patagônia argentina", "quanto custa comer na
Argentina", "onde comer em Puerto Madryn", "chá galês Gaiman"), y ahí no
existíamos en portugués. La segunda es de estructura interna: había **15 fichas
de restaurantes, cafés, cantinas y cervecerías ya traducidas** —12 de Trelew y
el valle galés, 3 de Madryn y Playa Unión— que no colgaban de ninguna página
informativa. Eran hojas sueltas: recibían el enlace del listado y nada más.
Ahora tienen padre, y con los 5 paseos gastronómicos del catálogo (té galés de
Gaiman dentro del tour del valle inferior, rota da centolla de Puerto Almanza,
Sabores do Beagle y los viñedos de la ruta galesa) la página enlaza **20 fichas
pt, las 20 verificadas con 200 en producción**.

Mismo molde que las cuatro anteriores, con una decisión propia de formato. La
versión en español, `/que-comer-patagonia/`, es una app de 128 KB con filtros
que compilan en el navegador: **no la dupliqué**. Los 34 platos, productos y
experiencias se sirven escritos en el HTML, agrupados en tres bloques con su
mejor época y sus lugares, más una tabla de temporada mes a mes con los 34
ítems. Eso es lo que Google puede leer; los filtros no le aportan nada. Los
datos salen de `src/data/gastronomia-es.json` (copia exacta del array `GASTRO`
de la página española) y `src/data/gastronomia-pt.json` (nombre, mejor época y
el dato de cada ítem en portugués de Brasil), el mismo arreglo que el
calendario de fauna con `datos-fauna.json`. Detalle de peso: la tabla son 34
filas por 12 celdas y con clases de utilidad por celda el HTML se iba a 122 KB;
con cinco reglas de CSS propias quedó en 87 KB.

De contenido, la página dice tres cosas que la versión en español no dice y que
son específicas del lector brasileño: que acá la comida viene para compartir y
que pedir un plato por persona es el error caro del visitante; que la cena
empieza después de las 21 y cómo funcionan el cubierto, la propina y el mate; y
que no hay una cocina patagónica sino cuatro, por los 1.900 km de norte a sur.
`Article` + `FAQPage` + `BreadcrumbList` validados parseando el JSON-LD de
producción, hreflang recíproco verificado en los dos sentidos, y enlace interno
nuevo desde `/pt-br/` —cuarta tarjeta, que además completa el grid de dos
columnas— y desde `/pt-br/experiencias/`.

De paso corrí el mantenimiento del pendiente 13 contra el sitemap de
producción: **112 de 112 meta descriptions escritas**, 84 traducciones pt en
pie, ninguna página pt huérfana en el sitemap y las mismas 28 fichas sin
traducir que el 06/11 (el admin no publicó fichas nuevas desde el 02/11). El
barrido de sufijos numéricos sigue dando un solo caso, el
`rota-galesa-represa-futaleufu-trevelin-2` del 10/11, todavía sin tocar.

Resultado esperado: cubrir la capa de búsqueda gastronómica en portugués, que
es de las que se hacen antes de elegir destino, y darle por fin estructura
interna a las 15 fichas de restaurantes traducidas, que hasta hoy no recibían
enlace de ninguna página informativa. Se mide en Search Console (cuando esté
conectado) por impresiones de `/pt-br/o-que-comer-na-patagonia/` en "o que
comer na Patagônia", "comida típica da Patagônia argentina", "cordeiro
patagônico", "centolla", "chá galês Gaiman" y "quanto custa comer na
Argentina", y por los clics que derive a las 20 fichas pt que enlaza. Sitemap:
289 → **290 URLs**. IndexNow avisó a Yandex las tres tandas (la página nueva,
la española y las 91 de `/pt-br/`); **Bing sigue en 403 por cuarto día** y no
se le dedicó trabajo: queda esperando el token XML de Marcelo (pendiente 11).

Quedó pendiente, en orden: la informativa de **Ushuaia** en portugués (8 fichas
pt, destino caro pero muy buscado por el brasileño); el arreglo del slug `-2`
con su 301; el mantenimiento nuevo del pendiente 14 (`gastronomia-es.json` es
una copia del array que vive dentro de la página en español y las dos pueden
derivar); las 18 fichas traducibles de bajo valor del pendiente 3; y las
decisiones de catálogo de "Para Marcelo", que son las que siguen frenando los
pendientes 1, 2 y 4.

### 12/11/2026

Sexta página informativa en portugués: **la guía de destino de Ushuaia y
Tierra del Fuego**, en `/pt-br/o-que-fazer-em-ushuaia/`. Era el pendiente 5 y
el último de los tres destinos grandes sin cubrir en portugués. Con esto
`/pt-br/` tiene la costa (Madryn y Valdés), la cordillera (Esquel, Trevelin y
Los Alerces) y el sur (Ushuaia), más el país entero, el calendario de fauna y
la gastronomía: la capa informacional ya está, y lo que falta es ancho de
catálogo, no de contenido.

Elegí Ushuaia por la relación entre búsqueda y abandono: es el destino de la
Patagonia argentina con más reconocimiento de marca en Brasil —"fim do mundo"
se vende solo— y teníamos **8 fichas pt publicadas que no colgaban de ninguna
página informativa**. El mismo problema que tenían los restaurantes antes de
la gastronómica del 11/11: hojas sueltas que recibían el enlace del listado y
nada más. Ahora tienen padre, con las 8 enlazadas y las 8 verificadas con 200
en producción.

Mismo molde que las cinco anteriores (Astro, datos del catálogo vía
`obtenerExperienciasPt()` para que una ficha sin traducir no deje un 404, sin
tocar precios ni el botón de reserva) con **dos diferencias que valen para la
próxima corrida**. La primera: **salió sin hreflang**, porque no existe la
página de Ushuaia en español. Es la primera de las seis en esa situación y
quedó como pendiente nuevo, el 15, con la página marcada por dentro
(`alternos = null` y el comentario de dónde engancharla). La segunda: la
página habla de dos cosas que **no vendemos** —la navegación del canal Beagle
y la nieve del Cerro Castor—, que son justo las dos más buscadas del destino.
Las conté igual, diciendo que se contratan en el puerto o en la Avenida Maipú,
porque una guía que las omite no le sirve al lector y la va a abandonar; pero
sin enlace falso, y derivando a lo que sí tenemos, que es Puerto Almanza en
barco chico. **Eso destapó un hueco de catálogo que anoté en "Para Marcelo":**
de los 15 tours de Tierra del Fuego que hay en Firestore sólo 8 están activos,
y entre los 7 inactivos están las dos navegaciones del Beagle. Reactivar una
de esas dos es, por hora de trabajo, la ficha de más valor que queda en todo
el catálogo.

De contenido, el dato que más va a rendir y que no está en ninguna otra página
nuestra: **los pingüinos-gentoo de la Isla Martillo están todo el año**, así
que en julio se ven pingüinos en Ushuaia, cosa que no pasa en Punta Tombo ni
en Valdés, donde el magallánico sólo está de septiembre a marzo. Eso convierte
a Ushuaia en el único destino de fauna de invierno del catálogo, y la página
lo dice tres veces: en el bloque de pingüinos, en el de temporadas y en una
pregunta frecuente. El resto de los nueve bloques son el Parque Nacional y
Lapataia, el Tren del Fin del Mundo, los pingüinos, el Beagle, Laguna
Esmeralda y las trilhas, los lagos Escondido y Fagnano en 4x4, la centolla de
Puerto Almanza, la nieve y Ushuaia como puerta de la Antártida.
`TouristDestination` + `FAQPage` + `BreadcrumbList` validados parseando el
JSON-LD de producción, GA4 y Pixel en pie, y **seis enlaces entrantes nuevos**
—`/pt-br/`, `/pt-br/experiencias/`, la página general (como guía de la región
Tierra del Fuego, en el mismo lugar donde Madryn y Esquel tienen la suya) y el
pie de las guías de Madryn, Esquel y la gastronómica—, los seis verificados en
producción.

De paso corrí el mantenimiento del pendiente 13 contra el sitemap de
producción: **112 de 112 meta descriptions escritas**, 84 traducciones pt en
pie, cero URLs pt huérfanas en el sitemap, cero `slugPt` que falten en el
sitemap y las mismas 28 fichas sin traducir que el 06/11 (el admin no publicó
fichas nuevas desde el 02/11). El barrido de slugs dio el mismo
`rota-galesa-represa-futaleufu-trevelin-2` del 10/11, todavía sin tocar, y
**un hallazgo nuevo**: las tres fichas del Parque Nacional Tierra del Fuego
publican con dos grafías distintas del mismo lugar, una en español
(`...tierra-del-fuego-ushuaia`) y dos traducidas (`...terra-do-fogo...`). No
está roto y arreglarlo cuesta un 301 sobre URLs ya indexadas, así que queda en
prioridad baja; lo que sí sumé al pendiente 13 es buscar grafías
inconsistentes de un mismo topónimo en cada barrido, no sólo erratas y sufijos
numéricos.

Resultado esperado: entrar en la capa informacional de Ushuaia en portugués
—"o que fazer em Ushuaia", "quantos dias em Ushuaia", "melhor época para ir a
Ushuaia", "Ushuaia no inverno", "Ushuaia é caro", "pinguins Ushuaia", "trem do
fim do mundo"—, que es donde el brasileño decide el destino, y darle
estructura interna a las 8 fichas de Tierra del Fuego, que hasta hoy no
recibían enlace de ninguna página informativa. Se mide en Search Console
(cuando esté conectado) por impresiones de `/pt-br/o-que-fazer-em-ushuaia/` en
esas consultas y por los clics que derive a las 8 fichas. Sitemap: 290 →
**291 URLs**. IndexNow avisó a Yandex las dos tandas (las 9 URLs de Ushuaia y
las 5 páginas informativas modificadas); **Bing sigue en 403 por quinto día** y
no se le dedicó trabajo: queda esperando el token XML de Marcelo
(pendiente 11).

Quedó pendiente, en orden: la **versión en español de la guía de Ushuaia**
(pendiente 15 nuevo, con el material ya investigado y el hreflang por cerrar);
evaluar la informativa de **El Calafate** en portugués aunque haya una sola
ficha, porque "Perito Moreno" es probablemente la búsqueda más grande del
brasileño en toda la Patagonia; la del **valle del Chubut galés**, que tiene
fichas pt pero sólo recibe enlace desde la gastronómica; el arreglo del slug
`-2` con su 301; el mantenimiento del pendiente 14; las 18 fichas traducibles
de bajo valor del pendiente 3; y las decisiones de catálogo de "Para Marcelo",
que ahora suman el hueco del canal Beagle a las que ya frenaban los
pendientes 1, 2 y 4.

### 13/11/2026

**La guía de Ushuaia en español**, en `/que-hacer-en-ushuaia/`. Era el
pendiente 15, el último que había dejado abierto la corrida del 12/11: la
versión en portugués se había publicado sin `hreflang` porque no existía la
página en español con la que emparejarla, y el mercado argentino no tenía por
dónde entrar a Ushuaia por búsqueda informacional. Las dos cosas quedaron
cerradas con una sola página.

La elegí por encima de las dos informativas en portugués que seguían en el
pendiente 5 (El Calafate y el valle del Chubut galés) por una razón de costo:
el trabajo de investigación ya estaba hecho y verificado el 12/11 contra el
catálogo, así que el español salía en una fracción del tiempo. Y porque
arregla un desperfecto, no sólo agrega: el `hreflang` suelto era una pérdida
de refuerzo entre los dos mercados que no se recupera con nada más.

**No la traduje.** El brasileño y el argentino no buscan lo mismo de Ushuaia,
así que los nueve bloques, las cuatro temporadas y el itinerario de 4 días son
los mismos, pero el resto cambió: afuera el pasaporte, el Mercosur y el vuelo
desde Brasil; adentro los vuelos directos desde Buenos Aires y —según la
temporada— Córdoba, Rosario, El Calafate y Trelew, el cruce por tierra
atravesando Chile dos veces con la barcaza del estrecho de Magallanes y la
aduana que no deja pasar frutas ni carnes, julio como la semana más cara y más
llena del año por las vacaciones de invierno, la tarifa diferenciada de
residente en el Parque Nacional y el Tren del Fin del Mundo contado como lo
que más recuerdan los chicos. Doce preguntas frecuentes escritas sobre las
consultas argentinas ("cuántos días", "se puede ir en auto", "es caro", "qué
hacer en invierno", "qué ropa llevar", "se puede combinar con El Calafate").
Mantuve la honestidad de catálogo de la portuguesa: la navegación por el canal
Beagle y el Cerro Castor se cuentan, porque una guía que los omite no le sirve
al lector, pero sin enlace falso y derivando a lo que sí vendemos.

Las **8 fichas activas de Tierra del Fuego** quedaron enlazadas por slug, con
el mismo criterio que la portuguesa: el enlace se arma buscando el slug
publicado, así que si el admin despublica una ficha desaparece el enlace y la
página no se queda con un 404 adentro. Las ocho verificadas con 200 en
producción. `TouristDestination` + `FAQPage` + `BreadcrumbList` validados
parseando el JSON-LD de la página servida.

**Lo que no estaba buscando y apareció: 17 enlaces internos rotos.** Fui a ver
dónde enganchar la guía nueva y el bloque "Otros destinos de la Patagonia" de
las tres landings en español (`/puerto-madryn`, `/esquel-trevelin`,
`/valle-del-chubut`) enlazaba a `/peninsula-valdes`, `/esquel`, `/trevelin`,
`/puerto-piramides`, `/gaiman`, `/punta-tombo` y `/trelew`. Las siete
devuelven 404 y **nunca existieron**: son nombres de destino que alguien
supuso que eran páginas. Tres páginas indexadas tirando 17 enlaces al vacío,
que es señal de abandono para Google y un callejón sin salida para el que las
clickea. Los `href` pasaron a la página real de cada destino —todas
verificadas con 200— y sumé las 301 de las siete rutas cortas en
`public/_redirects`, porque si estaban enlazadas acá bien pueden estar
enlazadas afuera. De paso corrí el barrido completo de enlaces internos sobre
los 316 HTML del `dist`: **el resto del sitio está limpio**. Los otros diez
avisos son artefactos de Cloudflare, una ruta que ya tiene su 301 y un
`src` que vive dentro de un comentario. El método quedó anotado en el
pendiente 13 como barrido de cada corrida.

Enlaces entrantes para la guía nueva: el **footer compartido de Astro**, que
ahora lleva una entrada "Ushuaia" en los dos idiomas apuntando cada una a la
página de su idioma —así la guía recibe enlace desde las 268 páginas de
Astro y la portuguesa gana el suyo— y el bloque "Otros destinos" de las tres
landings. Todo verificado en producción.

Mantenimiento del pendiente 13: **112 de 112 meta descriptions escritas**, 84
traducciones pt en pie, cero URLs pt huérfanas en el sitemap, cero `slugPt`
que falten, las mismas 28 fichas sin traducir (el admin no publica fichas
nuevas desde el 02/11). El barrido de slugs dio lo mismo que el 10 y el 12/11:
el `rota-galesa-represa-futaleufu-trevelin-2` sin tocar y los nombres propios
en español, que se quedan como están. **Corrección al método del barrido:** el
script lee `slugPt`, no `slug`, en `traducciones-pt.json`; con el nombre
equivocado el chequeo de URLs pt huérfanas da 84 falsos positivos y el de
sufijos numéricos no encuentra nada.

Resultado esperado: entrar en la capa informacional argentina de Ushuaia
—"qué hacer en Ushuaia", "cuántos días en Ushuaia", "mejor época para ir a
Ushuaia", "Ushuaia en invierno", "cómo llegar a Ushuaia", "Ushuaia con
chicos"—, que es la mitad del mercado que no estaba cubierta de un destino que
ya tiene 8 fichas publicadas; que las dos lenguas se refuercen con el
`hreflang` recíproco; y recuperar la autoridad que se perdía en 17 enlaces a
404 en tres páginas indexadas. Se mide en Search Console (cuando esté
conectado) por impresiones de `/que-hacer-en-ushuaia/` en esas consultas y por
los clics que derive a las 8 fichas. Sitemap: 291 → **292 URLs**. IndexNow
avisó a Yandex las cinco tandas (la guía nueva, la portuguesa y las tres
landings corregidas); **Bing sigue en 403 por sexto día** y no se le dedicó
trabajo: queda esperando el token XML de Marcelo (pendiente 11).

Quedó pendiente, en orden: las dos informativas en portugués que faltan del
pendiente 5 —**El Calafate** (una sola ficha publicada, pero "Perito Moreno"
es probablemente la búsqueda más grande del brasileño en toda la Patagonia) y
el **valle del Chubut galés**, que tiene muchas fichas pt y hoy sólo recibe
enlace desde la gastronómica—; el arreglo del slug `-2` con su 301; el
mantenimiento del pendiente 14 (`gastronomia-es.json` es copia y puede
derivar); las 18 fichas traducibles de bajo valor del pendiente 3; y las
decisiones de catálogo de "Para Marcelo", donde lo de más valor por hora sigue
siendo reactivar una de las dos navegaciones del canal Beagle.

### 14/11/2026

**La guía del valle del Chubut en portugués**, en
`/pt-br/o-que-fazer-em-trelew-e-gaiman/`. Era el pendiente 5 y quedaban dos
candidatas: El Calafate y el valle. **Elegí el valle por catálogo.** El
Calafate tiene una sola ficha publicada, así que una guía de destino de allá
escribe mucho y después no tiene a dónde mandar el clic; el valle tiene **17
fichas pt vivas** —las dos excursiones del Valle Inferior, Punta Tombo desde
Trelew, el dique Ameghino y 13 de gastronomía en Trelew, Dolavon y Playa
Unión— y hoy sólo recibía un enlace desde la guía gastronómica. Mismo trabajo,
mucho más retorno. Las 17 verificadas con 200 antes de escribir una línea, y
las 17 enlazadas y verificadas otra vez en producción después del deploy.

Ocho bloques, cuatro temporadas, itinerario de 3 días, una sección de mesas
agrupada por localidad y 12 preguntas frecuentes. La capa que ataca es la
informacional brasileña del valle: "o que fazer em Trelew", "Gaiman chá
galês", "colônia galesa Patagônia", "Punta Tombo pinguins", "museu do
dinossauro Trelew", "toninha overa", "Trelew ou Puerto Madryn", "quantos dias
em Trelew". **No inventé un solo dato:** todo el contenido sale de material ya
verificado del propio sitio —la landing `/valle-del-chubut` y las cinco guías
de `/guias-de-viaje/valle-del-chubut/`—, que tenían la historia del Mimosa y
los 153 colonos de 1865, Dyffryn Camwy, el trigo premiado en París y Chicago,
Gaiman fundado en 1874 y reconocido por ONU Turismo, el hermanamiento con
Llanuwchllyn de 2024, el único túnel ferroviario de la Patagonia, las norias
de Dolavon, Bryn Gwyn y las distancias reales desde la Plaza Independencia.
Mantuve la honestidad de catálogo: el MEF, el avistaje de toninas desde el
puerto de Rawson, Bryn Gwyn y el campo de tulipanes de 28 de Julio se cuentan
porque el brasileño los busca, pero sin enlace falso, porque no son fichas
nuestras (el MEF y las toninas entran como opcional dentro de las dos
excursiones del valle, y así está dicho).

**Lo que no estaba buscando y apareció, primero: el footer de `/pt-br/`
mandaba al brasileño a las páginas en español.** El bloque "Destinos" del
footer compartido enlazaba a `/puerto-madryn`,
`/guias-de-viaje/valle-del-chubut/`, `/guias-de-viaje/esquel-trevelin/`,
`/guias-de-viaje/peninsula-valdes/` y `/calendario-fauna/` en los dos idiomas
—sólo Ushuaia era condicional, porque se hizo así el 13/11—. O sea: más de 100
páginas de `/pt-br/` gastando casi todo su enlazado interno de footer en
páginas en español, con las seis guías en portugués ya publicadas y sin
recibir nada de ahí. Ahora el footer en portugués apunta a las siete páginas
pt y el español quedó igual, con `/valle-del-chubut` sumado junto a la Huella
Galesa.

**Y segundo, el más serio: `scripts/traducir-pt.mjs` iba a borrar 5 páginas pt
ya indexadas.** Lo encontré mirando el script para calcular el `hash` de las
fichas nuevas. El script escribe con la clave base (`slugificar(titulo)`),
pero las fichas hermanas se escriben a mano con su slug único, que es como las
lee `obtenerExperienciasPt`; y la poda del final sólo conocía las claves base.
Comprobado contra Firestore: la próxima corrida manual habría dado de baja
`parque-nacional-los-alerces-full-day-merakisur`,
`peninsula-valdes-sussanich-turismo`, `piedra-parada-merakisur`,
`trevelin-full-day-limits-adventure` y `valle-de-cholila-limits-adventure`,
las cinco sirviendo 200 hoy. Ahora `vigentes` se arma con `conSlugsUnicos`,
la misma función que usa el sitio: la poda pasó de borrar 5 a borrar 0.

Mantenimiento del pendiente 13: el cruce del sitemap contra `meta-es.json`
encontró que **el admin publicó dos fichas nuevas** después de dos semanas sin
publicar —`packrafting-rio-olivia` y
`trekking-laguna-esmeralda-vertice-expediciones`, las dos de VÉRTICE
EXPEDICIONES en Ushuaia—, las dos sin description escrita a mano. Escritas:
**114 de 114**. Les falta la versión en portugués, y quedaron primeras en el
pendiente 3 porque son de Ushuaia, porque la guía pt de Ushuaia ya existe para
enlazarlas y porque el packrafting no compite con nada del catálogo. Cero URLs
pt huérfanas, cero entradas sin `slugPt`, el `-2` de la Ruta Galesa sin tocar
y los nombres propios en español igual que el 10, 12 y 13/11. El barrido de
enlaces internos quedó en el repo como `scripts/barrido-enlaces.mjs`: cero
roto real, los 7 avisos ya contrastados con `curl`.

Resultado esperado: entrar en la capa informacional brasileña del valle galés
—que es el único destino de la provincia con contenido propio y sin
competencia en portugués— y convertirla en las 17 fichas que ya están
publicadas; que las dos lenguas del valle se refuercen con el `hreflang`
recíproco; y que las más de 100 páginas de `/pt-br/` empiecen a pasarse
autoridad entre ellas en vez de regalarla al español. Se mide en Search
Console (cuando esté conectado) por impresiones de
`/pt-br/o-que-fazer-em-trelew-e-gaiman/` en esas consultas y por los clics que
derive a las 17 fichas. Sitemap: 292 → **295 URLs**. IndexNow avisó a Yandex
las dos tandas (la guía nueva y las siete URLs del valle en español); **Bing
sigue en 403 por séptimo día** y no se le dedicó trabajo: espera el token XML
de Marcelo (pendiente 11).

Quedó pendiente, en orden: **las dos traducciones pt de las fichas nuevas de
Ushuaia** (pendiente 3, lo más barato y de más retorno que hay hoy); **El
Calafate en portugués**, la última del pendiente 5, con la decisión de si se
hace con una sola ficha o se espera catálogo; el arreglo del slug `-2` con su
301; el mantenimiento del pendiente 14 (`gastronomia-es.json` es copia y puede
derivar); y las decisiones de catálogo de "Para Marcelo", donde lo de más
valor por hora sigue siendo reactivar una de las dos navegaciones del canal
Beagle.

### 15/11/2026

**Las cinco fichas de Ushuaia en portugués, que era el pendiente 3 y lo más
barato que había.** Arranqué por el mantenimiento del pendiente 13 y el cruce
dio más de lo esperado: el admin no publicó dos fichas, publicó **cinco**. Las
dos que la corrida del 14/11 ya había detectado (`packrafting-rio-olivia` y
`trekking-laguna-esmeralda-vertice-expediciones`) y **tres más cargadas esa
misma noche, después del build**: Balcones del Susana, Lagunas Gemelas y
Glaciar Ojo del Albino, las tres de VÉRTICE EXPEDICIONES en Ushuaia, las tres
sin meta description en español y ninguna en el sitemap servido todavía.
Escribí las tres descriptions a mano (**117 de 117**) y traduje las cinco a
pt-BR.

**Por qué estas cinco y no otras:** Ushuaia es de los destinos más buscados
por el brasileño, la guía pt de Ushuaia ya estaba publicada para enlazarlas, y
las cinco tienen texto propio de verdad —no son calcos de nada del catálogo—.
El packrafting del río Olivia además es una actividad que no existía en el
sitio, así que no le compite a ninguna ficha nuestra. Las traducciones salieron
a mano con el `hash` de la huella de Firestore calculado ficha por ficha, para
que la próxima corrida de `scripts/traducir-pt.mjs` no las pise, con `slugPt`
propio verificado contra las 84 claves que ya existían, `altImagem` y 3 FAQ
cada una **escritas sólo con lo que dice la ficha**: nada de horarios, precios
ni servicios que el prestador no haya cargado. La hermana de Laguna Esmeralda
va con su slug único como clave —el que la bitácora del 14/11 marcaba como
trampa— y publica en `trilha-laguna-esmeralda-ushuaia-meio-dia`, que es lo que
la diferencia de la de Noelia Ferrario: 5 horas con bastones y crampones
incluidos contra las 6 de la otra.

Después las enlacé desde las dos guías de Ushuaia: el bloque de sendas pasó de
2 a 6 fichas en los dos idiomas y abrí un **bloque nuevo de packrafting**,
también en los dos, con dos párrafos escritos sobre lo que dice la ficha más
la explicación de qué es un packraft, que el brasileño no necesariamente sabe.
Las dos guías quedaron con 10 bloques.

**Lo que no estaba buscando y apareció:** el barrido de enlaces internos marcó
`/guiadeviajeros.html` en tres landings, y el `curl` mostró que no está roto
—devuelve 301 a `/guias-de-viaje/`— pero que **cada enlace interno del sitio a
esa URL gastaba un salto de rastreo**. Lo cambié en `ecosistema.html` (dos
veces), `esquel-trevelin.html`, `valle-del-chubut.html`, `guias.html` y, el que
más pesa, en el **footer compartido** `public/footer.js`, que lo servía como
enlace relativo. El redirect en `_redirects` queda, que es para los enlaces de
afuera. Barrido después del cambio: 327 HTML, cero roto real, único aviso el
`NOMBRE.png` que está dentro de un comentario de `ecosistema.html` y ya está
anotado desde el 13/11.

**Corrección al método del barrido, que vale para todas las corridas que
vienen.** Dos cosas: (1) el conteo del sitemap **no sirve para encontrar fichas
nuevas el mismo día**, porque el sitemap se regenera en el deploy y el admin
carga cuando quiere —las tres de anoche estaban en Firestore y no en el
sitemap—; la fuente del cruce tiene que ser Firestore y el sitemap sirve para
verificar después. (2) El cruce de "fichas sin traducción pt" **tapa a las
hermanas** si se acepta la clave base: `trekking-laguna-esmeralda-vertice-expediciones`
no aparecía como faltante porque existía `trekking-laguna-esmeralda`. Las dos
correcciones quedaron escritas en los pendientes 13 y 3.

Resultado esperado: entrar en la capa de búsqueda fueguina de trekking en
portugués —"trilha Laguna Esmeralda", "glaciar Ojo del Albino", "trekking
Ushuaia", "o que fazer em Ushuaia no verão"— que hasta hoy tenía una sola
ficha nuestra en pt y ahora tiene cinco, más el packrafting, que no tiene
competencia en el catálogo; y que las 13 fichas pt de Ushuaia se refuercen
entre ellas desde la guía de destino en vez de depender del listado. Se mide
en Search Console (cuando esté conectado) por impresiones de
`/pt-br/experiencias/trilha-*-ushuaia*` y por el clic que derive
`/pt-br/o-que-fazer-em-ushuaia/`. Sitemap: 295 → **303 URLs** (8 nuevas: 3 es
y 5 pt). IndexNow avisó a Yandex las tres tandas (200 OK); **Bing sigue en 403
por octavo día** y no se le dedicó trabajo: espera el token XML de Marcelo
(pendiente 11).

Quedó pendiente, en orden: **revisar si `comarca-andina-full-day` y
`astroturismo-y-aventura-en-lago-rosario` tienen texto propio o son calcos de
su ficha principal** antes de traducirlas (pendiente 3, es media hora de
lectura y define si se traducen o si van a la decisión de catálogo); **El
Calafate en portugués**, la última del pendiente 5, con la decisión de si se
hace con una sola ficha o se espera catálogo; el arreglo del slug `-2` de la
Ruta Galesa con su 301; el mantenimiento del pendiente 14
(`gastronomia-es.json` es copia y puede derivar); y las decisiones de catálogo
de "Para Marcelo", donde lo de más valor por hora sigue siendo reactivar una
de las dos navegaciones del canal Beagle.

### 16/11/2026

**El Calafate y los glaciares, en portugués y en español. Con eso queda cerrado
el pendiente 5.** Arranqué, como siempre, por el mantenimiento del pendiente 13,
y esta vez dio limpio: cruce desde Firestore —118 tours activos, 117 publicables
después de descontar el duplicado de carga de MerakiSur— contra `meta-es.json`,
**117 de 117 con description escrita a mano**, ninguna ficha nueva desde anoche,
ningún `slugPt` faltante ni duplicado, y el único sufijo numérico sigue siendo el
`rota-galesa-represa-futaleufu-trevelin-2` del 10/11. **Y el barrido de mantenimiento ya no hay que reescribirlo**: quedó en
`scripts/barrido-mantenimiento.mjs`, con las cinco advertencias del método
escritas adentro (la fuente es Firestore y no el sitemap, el cruce pt sólo por
slug único, los sufijos `-\d+`, los `slugPt` duplicados o faltantes y las
palabras en español en los slugs, que tira falsos positivos a propósito). Se
corre con `node scripts/barrido-mantenimiento.mjs`, sin credenciales. Era el
trabajo que se repetía todas las noches de cero.

**Después revisé las dos variantes que la bitácora del 15/11 pedía leer antes de
traducir, y las dos son calcos.** `comarca-andina-full-day` de MerakiSur es
palabra por palabra el mismo texto que `comarca-andina` de LIMITS ADVENTURE
—cambian las viñetas y la duración declarada, 8 horas contra 10— y
`astroturismo-y-aventura-en-lago-rosario` de MerakiSur es la versión condensada
de `astroturismo-en-lago-rosario-lodge` de LIMITS, con un único párrafo propio
("¿Qué llevar?") al final. **No se traducen**: van a la decisión de catálogo. Lo
importante del hallazgo es otra cosa: **estos dos casos no son hermanas de slug**
—los títulos son distintos, así que `conSlugsUnicos` no las agrupa—, así que son
dos páginas nuestras con URL limpia compitiendo de verdad en español hoy, y nada
en el código lo detecta. Quedó anotado en el pendiente 4 y en "Para Marcelo".
Con esas dos fuera, la cola del pendiente 3 se quedó sin nada de valor alto, y
eso liberó la corrida para la última página del pendiente 5.

**Lo que se publicó.** `/pt-br/o-que-fazer-em-el-calafate/` y
`/que-hacer-en-el-calafate/`, las dos en Astro, las dos en la misma corrida a
propósito: con Ushuaia la portuguesa salió sola el 12/11 y costó una corrida
entera cerrar el `hreflang` el 13/11. Nueve bloques cada una, cuatro temporadas,
itinerario de 4 días, 12 preguntas en portugués y 10 en español, `hreflang`
recíproco es-AR/pt-BR/x-default, JSON-LD con TouristDestination, FAQPage y
BreadcrumbList (los tres parsean), y enlazado desde la tarjeta nueva de
`/pt-br/`, el footer compartido en los dos idiomas, las dos páginas de Ushuaia y
—en español— Puerto Madryn, Esquel–Trevelin y el valle del Chubut.
**No son traducción una de la otra:** la española responde la tarifa de residente
del Parque Nacional, si conviene alquilar auto, qué se hace gratis en El Chaltén
y la confusión entre el glaciar Perito Moreno y el Parque Nacional Perito Moreno,
que son dos lugares distintos a cientos de kilómetros; la portuguesa responde
cómo se llega desde Brasil, si hace falta pasaporte (no para la Argentina, sí
para cruzar a Torres del Paine) y El Calafate contra Ushuaia si sólo da para uno.

**Se publicó con una sola ficha de catálogo, que era la decisión que la bitácora
dejaba abierta.** Se eligió hacerla igual, por tres razones: "Perito Moreno" es
probablemente la búsqueda más grande del brasileño en toda la Patagonia, la
página se sostiene sola con contenido informativo, y el clic que no tenemos a
dónde derivar cae en `/pt-br/experiencias/`, que es mejor que no recibir la
visita. Donde no vendemos la actividad está dicho con todas las letras
—minitrekking, Big Ice, navegaciones a Upsala y Spegazzini— y sin enlace falso,
igual que en Ushuaia. El hueco de catálogo de Santa Cruz quedó anotado en
"Para Marcelo" con las tres fichas que más valdrían, por orden.

**El diferencial de contenido, y lo que hay que mantener al día.** Casi todo lo
que hay escrito en internet sobre la ruptura del puente de hielo está viejo, y
las dos páginas lo corrigen con fuentes de 2026 verificadas en la corrida: el
frente se alejó **910 m de la península de Magallanes entre el 24/02 y el
04/06/2026** en el sector de referencia (medición con drones del Glaciarium
junto con la intendencia del PN Los Glaciares), el mayor retroceso registrado
desde los 750 m que midió Hauthal en 1899; **3,27 km² de superficie perdida
desde mayo de 2018**; entre 1999 y 2013 el frente había variado menos de 50 m;
y la **última ruptura ampliamente documentada fue en marzo de 2018**, de
madrugada y sin público, con una ruptura clásica improbable mientras el hielo no
vuelva a cerrar el paso entre el brazo Rico y el canal de los Témpanos. Las
pasarelas (más de 4,5 km) están abiertas y el destino se visita con normalidad.
Las dos páginas lo cuentan así —ni catástrofe ni folleto viejo— y las dos tienen
el aviso escrito en el comentario de cabecera: **si esto cambia hay que
actualizar el bloque `ruptura` y su pregunta en la FAQ, en los dos idiomas**.

**Lo que apareció de paso:** la guía española le dio enlace interno a **ocho
guías de viaje de Santa Cruz que estaban huérfanas** (pendiente 7): Perito
Moreno, El Chaltén, Glaciarium, Todo Glaciares, Cueva de las Manos, Lago Posadas
y Pueyrredón, PN Perito Moreno y península Belgrano. Las ocho dan 200 en
producción, verificadas con `curl`, porque el barrido de enlaces las marca como
sospechosas: con `DATOS_LOCALES=1` las páginas de `/guias/` no se generan, así
que el aviso del barrido es un falso positivo esperable y hay que contrastarlo
con `curl`, como ya dice el método.

Resultado esperado: entrar en la capa informacional brasileña del glaciar
—"geleira Perito Moreno", "o que fazer em El Calafate", "quantos dias em El
Calafate", "ruptura do Perito Moreno", "minitrekking Perito Moreno", "El Chaltén
Fitz Roy"—, que es la más grande de toda la Patagonia para ese mercado y donde
hasta hoy no existíamos con nada informativo; y, en español, capturar la búsqueda
de destino de El Calafate dándole además enlace interno a ocho guías que traían
visitas sin tener a dónde derivarlas. Se mide en Search Console (cuando esté
conectado) por impresiones de las dos URLs nuevas y por el clic que derive cada
una al listado y a la ficha de la ruta de las estancias. Sitemap servido:
303 → **305 URLs**, las dos nuevas con 200, canonical propio y `hreflang`
recíproco verificado en producción. IndexNow: **Yandex 202 Accepted** con las
tres URLs (las dos páginas más la ficha pt del glaciar); **Bing sigue en 403 por
noveno día** y no se le dedicó trabajo, espera el token XML de Marcelo
(pendiente 11).

Quedó pendiente, en orden: **las decisiones de catálogo de "Para Marcelo"**, que
hoy son lo que más vale por hora —reactivar una de las dos navegaciones del
canal Beagle y sumar minitrekking o navegación en El Calafate, los dos destinos
donde ya hay guía publicada esperando ficha—; el arreglo del slug `-2` de la
Ruta Galesa con su 301; el mantenimiento del pendiente 14
(`gastronomia-es.json` es copia y puede derivar); **el `slugPt` de
`cabalgatas-familiares`**, que publica en `cabalgatas-familiares-esquel` con la
palabra en español —en portugués de Brasil es `cavalgadas`— y que lo encontró
el barrido nuevo (es un 301 sobre una URL ya indexada, prioridad baja como los
otros dos casos del mismo tipo); y, del
pendiente 3, traducir una o dos habitaciones del AGUADA HOTEL, que es lo único
que queda con algo de valor en esa cola.

### 17/11/2026

**El hallazgo de la corrida: la home no le pasaba autoridad a nada.** Arranqué
por el mantenimiento del pendiente 13 con `scripts/barrido-mantenimiento.mjs`,
que dio limpio otra vez —118 tours activos, 117 publicables, **117 de 117 con
meta description escrita a mano**, ninguna ficha nueva desde anoche, ningún
`slugPt` faltante ni duplicado— y seguían los dos casos conocidos de prioridad
baja: el sufijo `-2` de la Ruta Galesa y el `cabalgatas-familiares-esquel` con
la palabra en español. Con la cola del pendiente 3 ya sin nada de valor alto y
el 5 cerrado, me metí con el pendiente 10 (Core Web Vitals) y, midiendo la home
con Chromium para tener números antes de tocar nada, apareció otra cosa mucho
más grande.

**`public/index.html` monta React sobre `#root` y, al montar, reemplaza el
bloque de respaldo `<main class="pe-seo">`**, que es justo el que tiene los 16
enlaces internos escritos a mano. Google renderiza JavaScript: lo que indexaba
de la página más autoritaria del sitio eran **8 enlaces —6 externos y 2
internos—**, y los dos internos apuntaban al `.html`, que responde 308. O sea
que la home **no enlazaba** `/experiencias/`, ni `/guias-de-viaje/`, ni ninguna
de las seis páginas de destino en español, ni `/pt-br/`. Todo el trabajo de
contenido de las últimas tres semanas colgaba de un árbol cuya raíz no lo
señalaba. Ninguna auditoría anterior podía verlo, porque todas leían el HTML
servido con `curl` y ahí los 16 enlaces están.

**Lo que se publicó.** Un `<nav>` de 16 enlaces internos en el pie del panel
izquierdo de la home —que ya scrolleaba—, con la tipografía, los tamaños y los
colores que la página ya usa: el hero y las dos tarjetas quedan intactos, y el
panel se ve igual en 1366×860 y en 390×844 (comparado con captura antes y
después). Los dos `href` de las tarjetas y el `window.location` de la billetera
pasan a la URL limpia. El bloque de respaldo suma las cuatro páginas de destino
en español, para que la versión con y sin JavaScript declaren lo mismo.
Verificado en producción: **24 enlaces renderizados, 18 internos, todos 200,
cero errores de consola**.

**Y de paso, el segundo commit: 73 enlaces internos que pasaban por una
redirección.** Cloudflare Pages responde 308 a toda URL `.html`. Nueve páginas
de `public/` seguían enlazando con `.html` —entre ellas `/puerto-madryn`,
`/valle-del-chubut` y `/esquel-trevelin`, tres de las informativas con más
tráfico—, así que cada enlace costaba un salto en cada rastreo. Se reescribieron
los 73 conservando parámetros y fragmentos (verifiqué con `curl -D-` que el 308
sólo saca el `.html` y preserva el `?destino=…&actividad=…`). El diff, token por
token, son sólo `href`. **No se tocó `public/patagonia-experiencias.html`**, que
tiene seis enlaces del mismo tipo y es la página con más tráfico del sitio: es
zona prohibida y quedó anotado en "Para Marcelo" como seis `href` que no tocan
precios ni checkout, esperando su OK.

Resultado esperado: que la autoridad de la home —la URL que más enlaces
externos recibe— empiece a repartirse hacia las páginas de destino y hacia
`/pt-br/`, que hasta hoy no recibían nada desde ahí; y que el rastreo deje de
gastar 73 saltos de 308 por recorrido del sitio. Se mide en Search Console,
cuando esté conectado, por páginas indexadas (hoy 240 de 387) y por la caída de
los avisos de "Página con redirección". El sitemap sigue en **305 URLs**.
IndexNow: **Yandex 200 OK** con las 305; **Bing sigue en 403 por décimo día**,
sin dedicarle trabajo, esperando el token XML (pendiente 11).

**Lo que apareció midiendo y queda pendiente**, en orden: **`/aike` y `/cuotas`
renderizan CERO enlaces** —son callejones sin salida para el rastreador, y
`/cuotas` además es una landing de venta, así que fue a "Para Marcelo" en vez de
tocarle el diseño—; los seis `.html` del footer del buscador de reservas, que
esperan el OK; el pendiente 10 propiamente dicho, que sigue entero (el CDN de
Tailwind compila en el navegador en las 14 páginas de `public/`); y el chequeo
nuevo que quedó anotado como pendiente 9b: **auditar las páginas de `public/`
renderizándolas, no leyendo el HTML**, porque en este sitio las dos cosas no
dicen lo mismo.

### 18/11/2026

**Arranqué por el mantenimiento y terminé auditando el sitio como lo ve
Google.** El barrido del pendiente 13 (`scripts/barrido-mantenimiento.mjs`) dio
limpio otra vez: 118 tours activos, 117 publicables, **117 de 117 con meta
description escrita a mano**, ninguna ficha nueva desde ayer, ningún `slugPt`
faltante ni duplicado, y los dos casos conocidos de prioridad baja sin cambios
(el sufijo `-2` de la Ruta Galesa y `cabalgatas-familiares-esquel` con la
palabra en español). Con la cola del pendiente 3 ya sin nada de valor alto —la
recomendación que quedaba era traducir una o dos habitaciones de hotel en
Trelew— elegí el pendiente **9b**, que ayer quedó anotado como el chequeo nuevo
y todavía no se había corrido completo: **renderizar las páginas con Chromium en
vez de leer el HTML con `curl`**. Lo corrí sobre las 37 URLs del sitemap que no
son fichas ni guías de Firestore, y de ahí salió todo lo del día.

**El hallazgo grande: quedaban 124 enlaces internos con `.html`, y ninguna
auditoría anterior podía verlos.** Ayer se sacaron 73, los que están escritos en
el HTML. Los 124 de hoy los arma el JavaScript al montar la página, así que
`curl` ve una cosa y Google ve otra. El peor caso no era una página: era
**`src/layouts/BaseLayout.astro`**, el footer de *todas* las páginas de Astro en
español —las 112 fichas, las 60 guías y las informativas—, donde el enlace a
`prestadores.html` era el único del footer que no era raíz-relativo. Un 308 por
página, en más de doscientas. Después, `/calendario-fauna/`, que renderizaba 58
enlaces internos y **48 pasaban por una redirección**, porque las tres
constantes de `CONFIG` con las que arma los enlaces en tiempo de ejecución
(`urlApp`, `urlPrestadores`, `baseExcursion`) llevaban el `.html` adentro; lo
mismo en `/que-hacer-patagonia/` y `/que-comer-patagonia/`. Y las guías de
`public/guias-de-viaje/`. El destino de cada enlace no cambia: se conservaron
los fragmentos `#tour/<slug>` y `#prestador/<slug>` y el `target="_blank"` donde
estaba, y el diff, token por token, son sólo `href`, las tres constantes y tres
`og:url`. **Verificado en producción con el mismo barrido**: las siete páginas
tocadas dan `html=0` con el mismo conteo de enlaces que antes, un solo `h1` y
cero errores de consola.

**El segundo hallazgo: la home no declaraba identidad ni mostraba tarjeta.**
`public/index.html` —la URL que más enlaces externos recibe de todo el sitio— no
tenía **un solo** bloque de datos estructurados ni **una sola** etiqueta Open
Graph. Las páginas de Astro declaran un `Organization` mínimo desde
`BaseLayout.astro`; la raíz, ninguno. Y compartir patagoniaexperiencias.com por
WhatsApp —que en Argentina y en Brasil es por donde se comparte todo— mostraba
el link pelado, sin título, sin bajada y sin imagen, mientras las demás páginas
de `public/` ya tenían su `og:image` y la `/og-image.jpg` de 1200×630 estaba
subida desde siempre. Se agregó en el `<head>` un `@graph` con `Organization` +
`WebSite` —logo, razón social, domicilio, teléfono, idiomas y las dos redes de la
marca, **cada dato tomado del propio sitio**: la razón social y el domicilio de
efe5 proyectos srl están en `/terminos` y las redes en el pie de la home— y Open
Graph y Twitter Card completos. Va en el `<head>` a propósito, porque React
reemplaza `#root` al montar: verificado en producción que después de montar sigue
ahí (`ld=1`), con los 24 enlaces y el `h1` intactos.

**Lo que apareció de paso y necesita archivos, no código.** El barrido con
`--fallos` encontró **26 logos en 404 en `/ecosistema`** (la página pide `Logo
01.png` a `Logo 40.png` y están subidos 01–09 y 12–16) y **35 fotos faltantes en
el micrositio del valle del Chubut**: Trelew está completa, y de Gaiman, Dolavon,
Rawson y 28 de Julio no está subida **ninguna**. Son cuatro páginas del sitemap
que Google ya rastrea sirviendo con todas las imágenes rotas, más la portada del
micrositio con un hueco por tarjeta. Las dos cosas quedaron en "Para Marcelo" con
el detalle. Lo único que sí se pudo arreglar desde el código es la `og:image`:
las seis páginas del valle la declaraban **relativa** —que la mayoría de los
lectores de tarjetas no resuelve— y cuatro apuntaban además a un archivo
inexistente; ahora las seis son absolutas y esas cuatro usan provisoriamente
`valle-hero.jpg`. También apareció que **`/sumar-gastronomia` renderiza cero
enlaces**, el tercer callejón sin salida después de `/aike` y `/cuotas`, y que
**las siete guías de `public/guias-de-viaje/` no declaran ningún dato
estructurado**, que quedó como pendiente 9c.

**Y una corrección a lo que te anoté ayer:** los seis enlaces `.html` del footer
del buscador de reservas **no están dentro de `public/patagonia-experiencias.html`**
sino en `public/footer.js`, el footer compartido que inyectan cinco páginas. El
arreglo es más barato de lo que decía la nota —seis `href` en un solo archivo que
no tiene una línea de precios, de seña y saldo, de Mercado Pago ni de webhooks— y
alcanza a las cinco páginas de una vez. No se tocó igual, porque se inyecta en el
checkout y la pregunta sigue sin respuesta.

Resultado esperado: que el rastreo deje de gastar ~124 saltos de 308 por
recorrido (los 200+ de las páginas de Astro son el grueso) y que la autoridad
llegue entera a `/prestadores` y a las fichas enlazadas desde el calendario de
fauna y las guías; que Google tenga por fin una entidad que leer en la raíz del
sitio, con logo y redes, que es la base de un panel de conocimiento y de que las
fichas puedan colgar su `seller` del mismo `@id`; y que todo link del sitio
compartido por WhatsApp muestre tarjeta. Se mide en Search Console, cuando esté
conectado, por la caída de los avisos de "Página con redirección" y por
impresiones de la home. Sitemap servido: **305 URLs**, sin cambios. IndexNow:
**Yandex 200 OK** con las 305 y 202 en la tanda del calendario; **Bing sigue en
403 por undécimo día**, sin dedicarle trabajo, esperando el token XML
(pendiente 11).

Quedó pendiente, en orden: **las fotos y los logos que faltan** (35 + 26: son
cuatro páginas indexadas que hoy se ven rotas, y es lo más visible que tiene el
sitio); el **OK para `footer.js`**, que arregla cinco páginas de una vez y que
además podría pasar a enlazar `/experiencias/`, las páginas de destino y
`/pt-br/`; el footer de las tres páginas sin salida (`/aike`, `/cuotas`,
`/sumar-gastronomia`); el pendiente **9c** (datos estructurados y descriptions de
las siete guías de `public/`, una página por corrida); y las decisiones de
catálogo de "Para Marcelo", que siguen siendo lo que más vale por hora —reactivar
una navegación del canal Beagle y sumar minitrekking o navegación en El Calafate,
los dos destinos con guía publicada esperando ficha—.

### 19/11/2026

**Qué se hizo.** El pendiente 9c, completo y no de a una página: las **ocho**
guías de `public/guias-de-viaje/` (la bitácora decía siete, pero son ocho si se
cuentan la portada del micrositio del valle, las cinco de localidad, Península
Valdés y Esquel–Trevelin) pasaron a declarar `Organization` + `Article` +
`BreadcrumbList` en el `<head>`, con el `headline` y la `description` escritos
con el contenido real de cada página y el `author`/`publisher` colgando del
`@id` de la `Organization` que la home declara desde ayer. Eran las páginas más
largas del sitio sin una línea de datos estructurados. En la misma pasada, las
siete descriptions más cortas del sitio (92–131 caracteres) se reescribieron a
189–201 con los términos de búsqueda de cada lugar, y se arreglaron las dos
`og:image` relativas de las guías grandes —una de ellas apuntando a una carpeta
que no existe—. Después, midiendo el sitemap, apareció que el catálogo creció de
305 a 308 URLs con **un destino nuevo, Caviahue y el volcán Copahue, en
Neuquén**, y que sus tres fichas eran las únicas sin description escrita a mano:
se les escribió.

**Qué se mide como resultado.** Que Google pueda clasificar las ocho guías como
artículos de una entidad conocida en vez de HTML suelto: eso es lo que habilita
el breadcrumb en el resultado y lo que hace que una guía pueda aparecer en
Discover y ser citada por las respuestas generadas. Y, más inmediato, que el
fragmento que se muestra en el resultado de esas ocho páginas lo escriba el
sitio y no Google recortando el primer párrafo: las descriptions de 92
caracteres se completaban solas. Se mide en Search Console, cuando esté
conectado, por impresiones y CTR de `/guias-de-viaje/*` y por la aparición del
tipo "Artículo" en el informe de resultados enriquecidos. Sitemap servido: **308
URLs** (121 fichas es, 90 pt, 60 guías). IndexNow: **Yandex 200 OK** con las 9
URLs de las guías; **Bing sigue en 403 por duodécimo día**, esperando el token
XML (pendiente 11).

**Qué quedó pendiente.** Lo nuevo y lo que necesita a Marcelo: **decidir si
Caviahue–Copahue se queda** como destino (pendiente 3b) —hoy son tres fichas
sueltas que ninguna página informativa nombra y que el bloque de "seguí
explorando" acompaña con Trevelin y Ushuaia, a mil kilómetros—; las **fotos y
los logos que faltan** (35 + 26, cuatro páginas indexadas que se ven rotas, y
ahora además son el motivo de que cuatro guías del valle declaren en su
`Article` una foto que no es la suya); el **OK para `footer.js`**, que arregla
cinco páginas de una vez; el footer de las tres páginas sin salida (`/aike`,
`/cuotas`, `/sumar-gastronomia`); y las decisiones de catálogo de siempre. De
código queda, por impacto: sumarles `TouristDestination` con coordenadas a las
cinco páginas de localidad (hoy sólo declaran `Article`), el `faq-es.json` del
pendiente 9, y reemplazar el CDN de Tailwind del pendiente 10, una página por
corrida.

### 20/11/2026

**Qué se hizo.** El hallazgo de la corrida salió del barrido de mantenimiento y
no estaba en la cola: **53 de las 123 fichas activas —el 43% del catálogo—
publicaban el título TODO EN MAYÚSCULAS**, tal cual lo cargó el prestador en el
admin. Ese texto es el `<h1>`, el `<title>`, el `name` del `Product` y el
nombre del breadcrumb: el elemento de SEO on-page que más pesa, gritado, y
además sin tildes ("PEONIAS", "HIDROELECTRICO", "NAVEGACION"), que es como NO
se escribe el término que la gente busca. Se arregló con el molde de dos capas
que ya usa este repo para las descriptions: 49 títulos escritos a mano en
`src/data/titulos-es.json` y un respaldo algorítmico en `src/lib/titulos.js`
para lo que el admin publique mañana. Se aplica después de `conSlugsUnicos`, o
sea cuando la URL ya está resuelta, así que ninguna dirección indexada se
movió: 285 páginas compiladas antes y después del cambio. En la misma pasada se
normalizó el lugar del `<title>` (el campo `destino` también viene gritado y con
la barra pegada), se le escribió la meta description a mano a la única ficha que
no la tenía —la del prestador nuevo, Gema Hotel de Comodoro Rivadavia— y se
arreglaron los dos `h1` gritados de las guías de `public/`, pasándolos a texto
en minúsculas con `text-transform: uppercase` en el CSS: el diseño quedó
idéntico y lo que cambia es sólo lo que lee Google.

**Qué se mide como resultado.** Lo concreto es que Google **deje de reescribir**
el `<title>` de esas 53 fichas: las mayúsculas sostenidas son uno de los casos
de baja calidad que Google documenta para quedarse con el título, y con el
título reescrito el sitio no controla el fragmento que se muestra. Se mide en
Search Console, cuando esté conectado, por CTR de `/experiencias/*` —un título
que se lee sube el clic sin que cambie la posición— y mirando en el resultado
real si el título que aparece es el del sitio. El segundo efecto, más lento, son
las tildes: "peonías", "navegación", "hidroeléctrico" y "degustación" ahora
están escritas como se buscan. Sitemap compilado: **309 URLs** (308 el 19/11 +
la ficha nueva de Gema). Catálogo: 123 tours activos, 121 publicables, **121 de
121 con meta description escrita a mano**. IndexNow: **Yandex 200 OK** con las
122 URLs de `/experiencias/` y las 9 de las guías; **Bing sigue en 403 por
decimotercer día**, esperando el token XML (pendiente 11).

**Qué quedó pendiente.** Lo nuevo para Marcelo es **renombrar la ficha del Hotel
Gema en el admin**: se llama "Alojamiento" a secas y por eso su URL quedó
`/experiencias/alojamiento/`, la más pobre del catálogo; el título y el `h1`
publicados ya están corregidos desde el código, pero la URL sólo se arregla
renombrando, y conviene hacerlo antes de que Google la indexe. Está cargada dos
veces, además. Lo demás sigue igual que ayer: la decisión sobre
**Caviahue–Copahue** (pendiente 3b), las **fotos y los logos que faltan**
(35 + 26), el OK para `footer.js` y el footer de las tres páginas sin salida.
De código queda, por impacto: `TouristDestination` con coordenadas en las cinco
páginas de localidad del valle, el `faq-es.json` del pendiente 9 y el CDN de
Tailwind del pendiente 10, una página por corrida.

### 21/11/2026

**Qué se hizo.** El pendiente 3 (fichas sin versión en portugués), que era el
primero de la cola que no dependía de una decisión de Marcelo. Se agarró su
rincón más barato —el alojamiento de Trelew— y se lo resolvió entero, de las
tres puntas: **en español**, las seis habitaciones del AGUADA HOTEL publicaban
un título que no decía ni el hotel ni la ciudad ("Habitacion Matrimonial
Superior", sin tilde), y no las tocaba el respaldo de `titulos.js` porque no
están gritadas: se escribieron las seis a mano en `titulos-es.json`. **En
portugués**, se tradujeron a mano las dos más diferenciadas —la matrimonial
superior para pareja y la triple twin superior para familia o grupo—, con FAQ
escrita con los servicios reales del hotel; las otras cuatro quedan afuera a
propósito, porque entre ellas son casi calcos y seis páginas pt iguales serían
contenido duplicado. **Y en enlazado**, que es lo que le da sentido a lo
anterior: las dos guías del valle (la pt y la de Trelew de
`/guias-de-viaje/`) estrenaron bloque de "dónde dormir", con las dos fichas pt
una y las seis fichas en español la otra. Seis páginas que hasta hoy colgaban
sólo del listado `/experiencias/` ya tienen un enlace interno desde una página
que Google rastrea.

**Qué se mide como resultado.** Tres cosas distintas: que las seis fichas de
alojamiento puedan aparecer por "hotel en Trelew", "dónde dormir en Trelew" y
"habitación matrimonial Trelew" —hoy su título no contenía ninguna de esas
palabras—; que el brasileño que lee la guía del valle encuentre dónde dormir
sin salir del sitio ("onde ficar em Trelew", "hotel em Trelew"), que es la
consulta que hoy se nos iba entera a Booking; y que las fichas dejen de ser
huérfanas, que es lo que el pendiente 1 viene marcando desde el 28/10 como
causa probable de buena parte de las páginas no indexadas. Se mide en Search
Console, cuando esté conectado, por impresiones de `/experiencias/habitacion-*`
y por el estado de indexación de esas seis URLs. Sitio servido después del
deploy: **311 URLs** en el sitemap (309 el 20/11 + las dos pt nuevas), 121
fichas es, 92 pt. IndexNow: **Yandex 200/202 OK** con las 2 URLs nuevas, las 6
fichas en español y las dos guías; **Bing sigue en 403 por decimocuarto día**,
esperando el token XML (pendiente 11).

**Qué quedó pendiente.** Lo nuevo, y es grande: **las páginas informativas de
`public/` no enlazan ni una sola ficha** (pendiente 3c). Enlazan cada tour como
`/patagonia-experiencias#tour/<slug>`, que para Google es un ancla de la app de
reservas y no una URL distinta: son **130 enlaces** —45 del calendario de
fauna, 40 de "qué hacer en Patagonia", 13 de cada guía de Valdés— que no le
pasan nada a las 121 fichas. Los 19 slugs que usan resuelven hoy a una ficha
publicada, así que el arreglo está medido y es mecánico, pero son 130 CTA de
venta: conviene hacerlo una página por corrida y preguntarle a Marcelo si
prefiere reemplazar el enlace o sumarle uno de texto a la ficha. Lo demás sigue
igual: la decisión sobre **Caviahue–Copahue**, el **renombre de la ficha del
Hotel Gema** en el admin (sigue siendo `/experiencias/alojamiento/`), las
**fotos y los logos que faltan** (35 + 26), el OK para `footer.js` y el footer
de las tres páginas sin salida. De código queda `TouristDestination` en las
cinco páginas de localidad del valle, el `faq-es.json` del pendiente 9 y el CDN
de Tailwind del pendiente 10.

### 22/11/2026

**Qué se hizo.** El pendiente 3c, que era el primero de la cola que podía
avanzar sin una decisión de Marcelo, y se empezó por donde más pesa:
`/calendario-fauna/`, 44 de los 130 enlaces del problema. La página mandaba
cada excursión a `/patagonia-experiencias#tour/<slug>`, un ancla de la app de
reservas, y **no enlazaba ni una ficha**: las 33 fichas de especie, el texto
largo, los datos estructurados y las visitas de esa página no le pasaban nada
a las 121 fichas de `/experiencias/`. Se le sumó una sección nueva —"Las 17
excursiones de fauna del calendario"— con las 17 excursiones agrupadas por
zona, cada una enlazando su ficha y contando prestador, destino, duración y
las especies del calendario que cubre, más un botón de navegación interna.
**No se tocó ningún enlace existente**: en esa página los 44 `#tour/` son el
único camino a la oferta, así que se eligió sumar en vez de reemplazar, que
era justamente la alternativa que el 21/11 quedó anotada para preguntarle a
Marcelo. Así no hace falta preguntar nada ni arriesgar una venta.

**Y un hallazgo que cambia el plan del pendiente.** El reemplazo mecánico que
estaba anotado —`#tour/<slug>` → `/experiencias/<slug>/`— **está mal y manda
al prestador equivocado**: el ancla de la app usa `slugReserva` y la URL de
Astro lleva sufijo de prestador desde el 02/11. Sobre los 17 slugs de esta
página, **5 apuntaban a otra ficha**, y el peor es el más enlazado de todos,
`#tour/peninsula-valdes` (12 veces acá), que es el tour de SUSSANICH:
`/experiencias/peninsula-valdes/` es de otro prestador. El mapeo bueno sale de
cruzar `urlReserva` contra `urlFicha` en `/aike/catalogo.json`; quedó escrito
en el pendiente 3c para las corridas que sigan.

**Qué se mide como resultado.** Que las 17 fichas de fauna dejen de depender
sólo del listado `/experiencias/` y reciban autoridad desde una de las páginas
informativas más fuertes del sitio —es la causa probable de buena parte del
147 no indexado del pendiente 1—; y que el calendario empiece a rankear
también por nombre de excursión ("excursión Punta Tombo", "avistaje de
ballenas El Doradillo", "trekking laguna Esmeralda"), que hoy no tenía ningún
enlace con ese texto apuntando a una página indexable. Verificado antes de
pushear: los 17 destinos sirven 200, el build compila, los 17 enlaces
sobreviven al JavaScript, 44 enlaces a la app intactos, cero errores de
consola y cero desborde a 390 px.

**Qué quedó pendiente.** El resto del 3c, ahora con el mapeo corregido:
`/que-hacer-patagonia/` (40 enlaces, la más grande que queda), las dos guías
de Península Valdés (13 cada una) y las cinco del valle. Una por corrida, con
el cruce de `/aike/catalogo.json` y el mismo criterio de sumar sin tocar los
CTA. Lo demás sigue igual que ayer: **Caviahue–Copahue** esperando que Marcelo
diga si Neuquén se queda, el **renombre de la ficha del Hotel Gema** en el
admin (sigue siendo `/experiencias/alojamiento/`), las **35 fotos y los 26
logos** que faltan, el OK para `footer.js`, y de código el `TouristDestination`
de las cinco páginas del valle, el `faq-es.json` del pendiente 9 y el CDN de
Tailwind del pendiente 10. **Ojo con ese pendiente 10:** el calendario de
fauna **no** usa Tailwind por CDN, tiene un build recortado embebido, así que
cualquier bloque nuevo ahí tiene que usar sólo clases que ya estén en el
archivo (`sm:grid-cols-2` no está, y el primer intento de hoy se vio en una
sola columna por eso).

### 23/11/2026

**Qué se hizo.** El pendiente 3c otra vez, en la página más grande que
quedaba: `/que-hacer-patagonia/`, 39 de los 130 enlaces del problema. Es el
índice de 85 actividades en 93 destinos y mandaba cada excursión a
`/patagonia-experiencias#tour/<slug>`, un ancla de la app: para Google, 39
enlaces a una sola URL y **ninguno** a las 121 fichas de `/experiencias/`. Se
le sumó la sección "Las 19 excursiones con prestador habilitado", con las 19
excursiones agrupadas por zona de salida y cada una enlazando su ficha, más el
prestador, el destino, la duración y las actividades del índice que cubre.
**Cero enlaces existentes tocados**, mismo criterio que el 22/11: en esta
página los `#tour/` son el único camino a la oferta, así que el bloque suma y
no reemplaza, y no hace falta preguntarle nada a Marcelo ni arriesgar una
venta. El mapeo volvió a salir de `/aike/catalogo.json` y volvió a hacer
falta: 5 de los 19 slugs del ancla no coinciden con la URL de su ficha.

**Qué se mide como resultado.** Que las 19 fichas con prestador habilitado
dejen de depender sólo del listado y reciban autoridad desde la página más
larga del sitio —otra vez, la causa probable de buena parte del 147 no
indexado del pendiente 1—; y que el índice empiece a rankear también por
nombre de excursión ("Punta Loma city tour", "Piedra Parada cañadón",
"Lagos Off Road Ushuaia"), que hoy no tenía ningún enlace con ese texto
apuntando a una página indexable. Con esta página y el calendario de fauna,
**83 de los 130 enlaces del pendiente 3c ya tienen su contrapartida indexable**.

**Mantenimiento de la corrida (pendiente 13).** El barrido no encontró nada
que hacer: 121 fichas publicables y 121 meta descriptions escritas, cero
`slugPt` duplicados o faltantes. El admin no publicó fichas nuevas desde el
20/11 —el sitemap está en 311 URLs, las mismas tres de Caviahue del 19/11 más
las dos páginas nuevas—. Siguen marcados los dos de siempre, los dos de
prioridad baja porque cuestan un 301 sobre una URL ya indexada: el `-2` de
`rota-galesa-represa-futaleufu-trevelin-2` y el `cabalgatas` en español del
slug pt de `cabalgatas-familiares`. IndexNow: Yandex 200 OK; **Bing sigue en
403**, el cuarto intento, a la espera del token XML de Marcelo (pendiente 11).

**Qué quedó pendiente.** Del 3c quedan sólo páginas chicas: las dos de
Península Valdés (13 enlaces cada una, y una de ellas ya es un 301), las cinco
del micrositio del valle (2 cada una) y `/que-comer-patagonia/` (1). Se pueden
hacer dos o tres en una sola corrida, con el mismo método. Lo demás sigue
igual: **Caviahue–Copahue** esperando que Marcelo diga si Neuquén se queda, el
**renombre de la ficha del Hotel Gema** en el admin (sigue siendo
`/experiencias/alojamiento/`), las **35 fotos y los 26 logos** que faltan, el
OK para `footer.js` y el token de Bing. De código queda el `TouristDestination`
de las cinco páginas del valle, el `faq-es.json` del pendiente 9 y el CDN de
Tailwind del pendiente 10. **Dato nuevo para ese pendiente 10:**
`/que-hacer-patagonia/` tampoco usa el CDN de Tailwind —tiene un build
recortado embebido, igual que el calendario de fauna—, así que cualquier
bloque nuevo ahí tiene que usar sólo clases que ya estén en el archivo.
**Y un hallazgo chico para anotar:** la página renderiza **un solo bloque de
JSON-LD** (FAQPage), mientras las equivalentes en Astro declaran dos. Le falta
el `Article`/`BreadcrumbList` colgado del `@id` de la `Organization`, que es
exactamente el arreglo del pendiente 9c que ya se hizo en las ocho guías de
`public/guias-de-viaje/`: el mismo molde, una página más.
