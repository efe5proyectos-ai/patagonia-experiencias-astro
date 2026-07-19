# Patagonia Experiencias — Cara pública 100% SEO (Astro)

Publicar en el admin = estar en Google. Sin archivos manuales.

## Cómo funciona

1. Cargás contenido en admin-master como siempre → se guarda en Firestore.
2. En cada build, Astro lee Firestore y genera **una página HTML por cada guía/experiencia**, con title, meta description, canonical, Open Graph, JSON-LD (Article, FAQPage, BreadcrumbList, Organization), sitemap y robots.txt. Todo automático, todo en el HTML desde el primer byte.
3. Cloudflare Pages reconstruye y publica solo cuando Firestore cambia (Fase 4).

## Probar localmente

```bash
npm install
npx astro dev        # http://localhost:4321
npx astro build      # genera dist/ (lo que se publica)
```

Sin variables de entorno usa los datos de ejemplo de `src/data/guias.json`.

## Conectar Firestore real

Crear archivo `.env` (o variables en Cloudflare Pages):

```
FB_PROJECT_ID=tu-proyecto-firebase
FB_API_KEY=tu-api-key-web
```

Son los mismos valores públicos que ya usa la app React (no es un secreto:
la API key web de Firebase es pública por diseño; protegen las reglas).

**⚠ Pendiente tuyo (5 minutos):** en `src/lib/contenido.js` están marcados
con TODO los nombres de colección (`guias`, `tours`) y el mapeo de campos
(`normalizarGuia`). Pasame un documento real de cada colección (o un export)
y lo dejo exacto.

## Deploy en Cloudflare Pages (Fase 4)

1. Subir este proyecto a un repo de GitHub.
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → conectar el repo.
   - Build command: `npx astro build`
   - Output directory: `dist`
   - Variables: `FB_PROJECT_ID`, `FB_API_KEY`
3. En Pages → Settings → Builds → crear un **Deploy Hook** (te da una URL).
4. Cloud Function que dispara el rebuild al publicar:

```js
const functions = require('firebase-functions');
exports.rebuildSitio = functions.firestore
  .document('{coleccion}/{docId}')
  .onWrite(async (change, ctx) => {
    if (!['guias', 'tours'].includes(ctx.params.coleccion)) return;
    await fetch('URL_DEL_DEPLOY_HOOK', { method: 'POST' });
  });
```

5. DNS: apuntar `patagoniaexperiencias.com` al proyecto de Pages
   (mismo panel de Cloudflare donde ya está el dominio). Ferozo queda
   como respaldo hasta validar.

## Qué queda para las próximas fases

- **Fase 2:** rutas `/destinos/[slug]/` y `/experiencias/[slug]/` con
  schema Product + Offer (precio ARS), y redirecciones 301 de URLs viejas
  (archivo `public/_redirects` de Cloudflare Pages).
- **Fase 3:** islas React para AIKE, buscador y checkout MercadoPago
  (`@astrojs/react` + los componentes actuales).
- **Fase 5:** enviar sitemap nuevo en Search Console y monitorear cobertura.
