# Guías visibles en Google — qué subir

Nueve archivos. Ninguno cambia el contenido de las guías: sólo corrigen la dirección que
cada página declara y hacen que entren al sitemap.

---

## 1 · Las ocho guías

Van a `public/guias-de-viaje/`, respetando la estructura de carpetas (viene armada en el
ZIP, así que se pisa tal cual):

```
guias-de-viaje/esquel-trevelin/index.html
guias-de-viaje/peninsula-valdes/index.html
guias-de-viaje/valle-del-chubut/index.html
guias-de-viaje/valle-del-chubut/trelew/index.html
guias-de-viaje/valle-del-chubut/gaiman/index.html
guias-de-viaje/valle-del-chubut/dolavon/index.html
guias-de-viaje/valle-del-chubut/rawson/index.html
guias-de-viaje/valle-del-chubut/28-de-julio/index.html
```

**Qué le cambié a cada una:**

| Antes | Ahora |
|---|---|
| `<link rel="canonical" href=".../guias/valle-del-chubut/gaiman/">` | `.../guias-de-viaje/valle-del-chubut/gaiman/` |

Siete tenían la canonical apuntando a `/guias/...`, que es la ruta de **artículos** de
Astro y da 404. Ahora apuntan a donde la página realmente vive.

La de **Esquel no tenía canonical**: se la agregué después del `<title>`.

Y a las ocho les puse **`og:url`**, que faltaba en todas. Es la dirección que usan WhatsApp
y las redes cuando alguien comparte el link. Sin eso, la vista previa puede salir sin link
o con el link mal.

Verificado: ninguna conserva la ruta `/guias/` vieja.

## 2 · `astro.config.mjs`

Va en la raíz del repo, al lado de `package.json`.

**El problema que resuelve.** El sitemap se armaba así:

```js
readdirSync('./public').filter((f) => f.endsWith('.html'))
```

`readdirSync` no entra en subcarpetas. Las guías están una o dos capas adentro: **ninguna
entraba al sitemap**. Y como la lista de exclusión era una lista negra, se colaban
`banner-fauna`, `preview-muro-logos`, `que-hacer-patagonia-FUENTE`,
`que-hacer-patagonia-COMPILADO` y hasta un archivo con espacio en el nombre.

**Lo cambié a lista blanca.** Ahora está escrito qué se publica, y nada más. Lo probé
contra los archivos reales del repo: **22 URLs, ninguna faltante, cero basura.**

Para agregar una página nueva al sitemap más adelante, se suma a una de las dos listas de
arriba del archivo. Está comentado.

Dos cosas de conveniencia que le puse:

- Sólo publica lo que **existe en disco**. Si alguien borra o renombra un archivo, no queda
  una URL muerta en el sitemap.
- Avisa en la consola durante el build: `[sitemap] 22 páginas de public/ agregadas`, y si
  algo de la lista no aparece, lo lista como faltante.

## 3 · Después de subir

**Borrá `public/sitemap-guias.xml`.** Es un sitemap suelto que nadie lee: `robots.txt`
declara `sitemap-index.xml`, no ese. Y las dos URLs que listaba ahora entran por el sitemap
de Astro.

**Verificá:**

1. Abrí `patagoniaexperiencias.com/sitemap-index.xml` y confirmá que aparecen las ocho
   guías.
2. Andá a **Google Search Console** → Sitemaps y volvé a enviar el sitemap. Sin eso, Google
   puede tardar semanas en volver a pasar.
3. En Search Console, usá **Inspección de URLs** con
   `https://patagoniaexperiencias.com/guias-de-viaje/valle-del-chubut/gaiman/` y pedí
   indexación. Es la forma más rápida de que entre.

Dale unos días. El indexado no es inmediato, pero a partir de ahora Google tiene todo lo que
necesita: la página existe, dice bien cuál es su dirección, y está declarada en el sitemap.

---

## Lo que queda pendiente de las guías

**`calendario-fauna` y `que-hacer-patagonia` tienen el mismo problema, al revés.** Están
planos en `public/` (`calendario-fauna.html`), pero declaran su canonical como
`/calendario-fauna/` con barra final. El `LEEME-compilar.txt` del propio repo dice que van
en carpeta:

```
public/calendario-fauna/index.html
public/que-hacer-patagonia/index.html
```

Es un `mkdir` y un `mv` por cada uno. No lo hice acá porque mover archivos hay que hacerlo
en el repo, no se puede entregar como reemplazo. Cuando se haga, el sitemap ya está
preparado: la entrada `calendario-fauna` de la lista blanca hay que pasarla a la lista de
guías con barra final.

**Los tres archivos sueltos de `peninsula-valdes/`** — `guia-peninsula-valdes-lite.html`,
`peninsula-valle.html` y `verificar-imagenes.html` — son versiones alternativas y una
utilidad interna. No entran al sitemap con esta configuración, así que ya no molestan, pero
conviene borrarlos.

**Los títulos de las tres guías tienen erratas**, y son lo primero que ve alguien que llega
de Google. Se corrigen desde el admin, en `titulo` y `region`:

- *"Guia de Recomendados de Esquel& Trevelin 2026"* → falta la tilde en "Guía" y el espacio
  antes del `&`
- *"Peninsula valdes y El Valle"* → *"Península Valdés y El Valle"*
- Las etiquetas de región mezclan criterios: dos son destinos (**Esquel & Trevelin**,
  **Península Valdés**) y la tercera es el nombre de la guía (**Huella Galesa**). Como esos
  chips son el filtro por región, convendría que la tercera fuera **Valle del Chubut**.
