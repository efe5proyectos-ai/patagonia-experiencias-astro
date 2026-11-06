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

Tamaño del sitio al 06/11/2026: **285 URLs** en el sitemap — 112 fichas en
español, 84 fichas en portugués, 60 guías de viaje y el resto de `public/`.
En Firestore hay 113 tours activos y ahora se publican los 113 menos uno: el
único que queda afuera es un duplicado de carga del mismo prestador
(`navegacion-rio-grande-full-day`), que hay que borrar en el admin.

## Para Marcelo

- Confirmar que el número de `WHATSAPP_PT` (+54 9 2945 64-2052) es el del guía
  que atiende en portugués.
- Conectar Google Analytics para el informe semanal automático de consultas.
- Conectar Search Console, para que la tarea de la madrugada pueda ver el detalle
  de las páginas no indexadas y las búsquedas reales de Argentina y Brasil.
- Reclamar el sitio en Bing Webmaster Tools (se importa desde Search Console),
  para destrabar IndexNow en Bing.
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
3. **28 fichas no tienen versión en portugués.** Al 06/11 hay 112 fichas en
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
   **De las 18 que quedan, por orden de impacto para Brasil:** 6 restaurantes de
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
5. **Contenido pt-BR traducido a máquina.** Google Brasil premia el texto que
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
8. **Las fichas en español no tienen FAQPage.** Las 74 en portugués traen
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
    de mayor retorno que queda. Hecho el 02/11 con las 5 fichas nuevas y con
    las 14 de "una URL por prestador"; verificado otra vez el 03/11 y el 04/11,
    con **112 de 112 meta descriptions escritas** las dos veces; verificado
    otra vez el 06/11, también 112 de 112: el admin no publicó fichas nuevas
    desde el 02/11. **Ojo con el conteo:** desde el 02/11 el
    sitemap tiene más fichas que claves "base" en Firestore, porque las fichas
    de un prestador llevan el sufijo del prestador en el slug.

## Hecho

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
