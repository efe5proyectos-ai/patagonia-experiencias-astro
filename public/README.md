# Guías de Patagonia Experiencias

Dos páginas estáticas de una sola pieza, para captar tráfico de búsqueda y
derivarlo al catálogo de la plataforma.

| Página | Qué es | URL en producción |
|---|---|---|
| Calendario de fauna | 33 especies, mes a mes, con la excursión para ir a verlas | `/calendario-fauna/` |
| Qué hacer en la Patagonia | 85 actividades en 93 destinos, por lugar o por categoría | `/que-hacer-patagonia/` |

## Estructura

```
├── calendario-fauna-FUENTE.html        ← se edita acá
├── calendario-fauna-COMPILADO.html     ← esto va al servidor
├── que-hacer-patagonia-FUENTE.html     ← se edita acá
├── que-hacer-patagonia-COMPILADO.html  ← esto va al servidor
│
├── datos-fauna.json                    33 especies
├── datos-actividades.json              85 actividades
├── oferta-ejemplo.json                 formato del feed de prestadores
│
├── banner-fauna.html                   banner ancho, para pegar
├── banner-fauna-300x250.html           banner rectángulo, para pegar
├── iconos-categorias.html              hoja de contactos de los 20 íconos
│
├── tailwind.config.js                  config del compilador
├── in.css                              entrada del compilador
├── sitemap-guias.xml                   las dos URLs
├── LEEME-compilar.txt                  cómo pasar de FUENTE a COMPILADO
└── LEEME-imagenes.txt                  medidas y checklist de imágenes
```

## Qué va a dónde

GitHub es el respaldo y el historial: **va todo**. El servidor solo recibe
las páginas que el turista abre, que son **dos**.

| Archivo | Qué es | GitHub | Servidor |
|---|---|:--:|:--:|
| `calendario-fauna-COMPILADO.html` | La página. Subir como `calendario-fauna.html` | sí | **SÍ** |
| `que-hacer-patagonia-COMPILADO.html` | La página. Subir como `que-hacer-patagonia.html` | sí | **SÍ** |
| `sitemap-guias.xml` | Las dos URLs para que Google las encuentre | sí | **SÍ** |
| `calendario-fauna-FUENTE.html` | Donde se edita el calendario | sí | no |
| `que-hacer-patagonia-FUENTE.html` | Donde se edita la guía | sí | no |
| `banner-fauna.html` | **Muestrario.** Adentro hay un bloque entre comentarios que se copia y se pega en el index, la app o el Magazine | sí | no |
| `banner-fauna-300x250.html` | Lo mismo, en formato rectángulo para columna lateral | sí | no |
| `iconos-categorias.html` | Hoja de contactos: los 20 íconos juntos, para revisarlos | sí | no |
| `datos-fauna.json` | Las 33 especies, sueltas. Respaldo y reimportable | sí | no |
| `datos-actividades.json` | Las 85 actividades, sueltas | sí | no |
| `oferta-ejemplo.json` | **Plantilla.** El formato que tiene que generar la plataforma cuando exporte prestadores | sí | después |
| `tailwind.config.js` · `in.css` | Herramientas para recompilar | sí | no |
| `README.md` · `LEEME-*.txt` | Documentación | sí | no |

Los tres HTML que no son páginas —los dos banners y la hoja de íconos— son
material de trabajo. Se abren en el navegador para mirar y copiar, no se
publican. Si los subieras al servidor no romperían nada, pero serían
páginas sueltas sin sentido que Google podría indexar por error.

## Al desplegar

Los dos COMPILADO van dentro de `public/`, cada uno en su carpeta y
renombrados a `index.html`:

    public/calendario-fauna/index.html      ← calendario-fauna-COMPILADO.html
    public/que-hacer-patagonia/index.html   ← que-hacer-patagonia-COMPILADO.html

Astro los sirve desde la raíz, así que quedan en `/calendario-fauna/` y
`/que-hacer-patagonia/`, que es lo que declara el `<link rel="canonical">`
y `CONFIG.urlCanonica`.

Después: sumar las dos URLs al sitemap, enlazarlas desde el index y desde
el Magazine, y pedir indexación en Search Console. Sin enlaces entrantes
Google puede tardar semanas en encontrarlas.

## Reglas del proyecto

- **Ruteo**: el index es solo para quien llega por primera vez. El logo y
  los tours entran siempre a la app interna:
  `patagonia-experiencias.html#tour/{slug}`, con `slug = slugify(titulo)`.
- **Prestadores**: se publica el NOMBRE DE FANTASÍA del perfil, nunca el
  nombre de la persona de contacto. Hay una red de seguridad que detecta
  nombres de persona y los reemplaza por un rótulo neutro.
- **Bloque indexable**: las fichas del final del `<body>` son HTML real y
  son las que posicionan. Si cambian los datos hay que regenerarlas.
- **Un solo archivo**: nada de dividir en varios.
