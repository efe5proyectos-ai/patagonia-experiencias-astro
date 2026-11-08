// ─────────────────────────────────────────────────────────────
// /api/mp-webhook — notificación de pago de MercadoPago (IPN)
//
// POR QUÉ EXISTE
// Hasta ahora todo lo que pasaba después de un pago —marcar la reserva
// como Pagado, asignar los puntos, avisarle al admin y al prestador y
// mandar los mails por Make— corría en el navegador del turista, dentro
// de pago-confirmado.html. Si el turista cerraba MercadoPago sin volver
// al sitio, o si Firebase Auth no resolvía la sesión en 6 segundos, no
// se disparaba nada: la plata entraba y nadie se enteraba.
// Caso real: reserva del 3/11/2026 para el 6/11 (Explore Tierra del
// Fuego). El escenario de Make no registró ninguna ejecución.
//
// Esta función hace lo mismo pero del lado del servidor, avisada por
// MercadoPago, sin depender de que el turista vuelva.
//
// CÓMO SE ACTIVA (una sola vez, en el panel de MercadoPago)
//   Tus integraciones → la aplicación → Webhooks → URL de producción:
//   https://patagoniaexperiencias.com/api/mp-webhook
//   Evento: "Pagos" (payment).
// Alternativa: agregar notification_url con esa misma URL al crear la
// preferencia en la función createpaymentlink. Con cualquiera de las dos
// alcanza; configurarlo en el panel no requiere tocar esa función.
//
// VARIABLES DE ENTORNO (Cloudflare Pages → Settings → Variables, como
// secretos). Ninguna va escrita en el código:
//   MP_ACCESS_TOKEN        token de producción de MercadoPago
//   MP_WEBHOOK_SECRET      clave de firma del webhook (opcional pero recomendada)
//   FB_SA_EMAIL            client_email de la cuenta de servicio de Firebase
//   FB_SA_KEY              private_key de esa cuenta (PEM completo)
//   MAKE_EMAIL_WEBHOOK_URL webhook del escenario "Patagonia Email Reservas"
//
// La cuenta de servicio hace falta porque las reglas de Firestore no
// dejan leer ni escribir reservas sin autenticación, que es lo correcto.
//
// IDEMPOTENTE: usa el flag notificacionesEnviadas que ya existe en el
// documento de la reserva. MercadoPago reintenta la notificación varias
// veces y pago-confirmado.html puede llegar a correr en paralelo; con el
// flag, los mails salen una sola vez.
// ─────────────────────────────────────────────────────────────

const APP = 'patagonia-experiencias-app';
const PUNTOS_POR_DEFECTO = 5000;
const EMAIL_RESPALDO = 'hola@patagoniaexperiencias.com';

const proyecto = (env) => env.FB_PROJECT_ID || 'patagonia-experiencias';
const base = (env) =>
  `${env.FIRESTORE_HOST || 'https://firestore.googleapis.com'}/v1/projects/${proyecto(env)}/databases/(default)/documents`;
const coleccion = (env, nombre) => `${base(env)}/artifacts/${APP}/public/data/${nombre}`;
const rutaDoc = (env, nombre, id) =>
  `projects/${proyecto(env)}/databases/(default)/documents/artifacts/${APP}/public/data/${nombre}/${id}`;

// ── Firestore: tipado de valores ──────────────────────────────
function valor(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(valor) } };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, valor(x)])) } };
  return { stringValue: String(v) };
}
function plano(fields = {}) {
  const o = {};
  for (const [k, v] of Object.entries(fields)) {
    const t = Object.keys(v)[0];
    if (t === 'arrayValue') o[k] = (v.arrayValue.values || []).map((x) => plano({ _: x })._);
    else if (t === 'mapValue') o[k] = plano(v.mapValue.fields || {});
    else if (t === 'integerValue' || t === 'doubleValue') o[k] = Number(v[t]);
    else if (t === 'nullValue') o[k] = null;
    else o[k] = v[t];
  }
  return o;
}

// ── Cuenta de servicio → token OAuth para Firestore ───────────
function b64url(buf) {
  const bin = String.fromCharCode(...new Uint8Array(buf));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function pemABytes(pem) {
  const limpio = String(pem).replace(/-----[^-]+-----/g, '').replace(/\\n/g, '').replace(/\s+/g, '');
  const bin = atob(limpio);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
let tokenCache = { valor: null, vence: 0 };
async function tokenFirestore(env) {
  if (!env.FB_SA_EMAIL || !env.FB_SA_KEY) throw new Error('Faltan FB_SA_EMAIL o FB_SA_KEY');
  const ahora = Math.floor(Date.now() / 1000);
  if (tokenCache.valor && tokenCache.vence > ahora + 60) return tokenCache.valor;

  const cabecera = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const cuerpo = b64url(new TextEncoder().encode(JSON.stringify({
    iss: env.FB_SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: ahora,
    exp: ahora + 3600,
  })));
  const clave = await crypto.subtle.importKey(
    'pkcs8', pemABytes(env.FB_SA_KEY),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'],
  );
  const firma = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', clave, new TextEncoder().encode(`${cabecera}.${cuerpo}`));
  const jwt = `${cabecera}.${cuerpo}.${b64url(firma)}`;

  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=${encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer')}&assertion=${jwt}`,
  });
  if (!r.ok) throw new Error(`OAuth ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = await r.json();
  tokenCache = { valor: j.access_token, vence: ahora + (j.expires_in || 3600) };
  return j.access_token;
}

async function leerDoc(env, token, nombre, id) {
  const r = await fetch(`${coleccion(env, nombre)}/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Firestore GET ${nombre}/${id}: ${r.status}`);
  return plano((await r.json()).fields || {});
}

async function actualizarDoc(env, token, nombre, id, campos) {
  const r = await fetch(`${base(env)}:commit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      writes: [{
        update: {
          name: rutaDoc(env, nombre, id),
          fields: Object.fromEntries(Object.entries(campos).map(([k, v]) => [k, valor(v)])),
        },
        updateMask: { fieldPaths: Object.keys(campos) },
        currentDocument: { exists: true },
      }],
    }),
  });
  if (!r.ok) throw new Error(`Firestore commit ${nombre}/${id}: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function crearNotificacion(env, token, destinatarioUid, titulo, mensaje, datos) {
  if (!destinatarioUid) return;
  await fetch(coleccion(env, 'notificaciones'), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: Object.fromEntries(Object.entries({
        destinatarioUid, tipo: 'reserva_nueva', titulo, mensaje, datos,
        leida: false, fechaCreacion: new Date().toISOString(),
      }).map(([k, v]) => [k, valor(v)])),
    }),
  }).catch(() => {});
}

// ── Encontrar la reserva que corresponde al pago ──────────────
// 1) external_reference (lo normal si la preferencia lo setea)
// 2) metadata.reserva_id / reservaId
// 3) último recurso: por email del pagador y monto, entre las reservas
//    sin notificar de los últimos 3 días
async function buscarReserva(env, token, pago) {
  const directo = pago.external_reference || pago.metadata?.reserva_id || pago.metadata?.reservaId;
  if (directo) {
    const r = await leerDoc(env, token, 'reservas', String(directo));
    if (r) return { id: String(directo), datos: r };
  }
  const email = pago.payer?.email;
  if (!email) return null;

  const r = await fetch(`${base(env)}/artifacts/${APP}/public/data:runQuery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'reservas' }],
        where: { fieldFilter: { field: { fieldPath: 'clienteEmail' }, op: 'EQUAL', value: { stringValue: email } } },
        limit: 25,
      },
    }),
  });
  if (!r.ok) return null;
  const filas = (await r.json()).filter((x) => x.document);
  const monto = Number(pago.transaction_amount || 0);
  const limite = Date.now() - 3 * 24 * 3600 * 1000;

  const candidatas = filas
    .map((x) => ({ id: x.document.name.split('/').pop(), datos: plano(x.document.fields || {}) }))
    .filter((c) => !c.datos.notificacionesEnviadas)
    .filter((c) => Math.abs(Number(c.datos.precioReserva || c.datos.total || 0) - monto) < 1)
    .filter((c) => {
      const t = Date.parse(c.datos.fechaCreacion || '');
      return !Number.isFinite(t) || t >= limite;
    });

  // Si hay más de una candidata no se adivina: se avisa y queda para revisión manual.
  return candidatas.length === 1 ? candidatas[0] : null;
}

// ── Validación de la firma de MercadoPago (si hay secreto) ────
async function firmaValida(env, request, idPago) {
  if (!env.MP_WEBHOOK_SECRET) return true; // sin secreto configurado, no se valida
  const cabecera = request.headers.get('x-signature') || '';
  const requestId = request.headers.get('x-request-id') || '';
  const partes = Object.fromEntries(cabecera.split(',').map((p) => p.split('=').map((s) => s.trim())));
  if (!partes.ts || !partes.v1) return false;
  const manifiesto = `id:${idPago};request-id:${requestId};ts:${partes.ts};`;
  const clave = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(env.MP_WEBHOOK_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const firma = await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode(manifiesto));
  const hex = [...new Uint8Array(firma)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return hex === partes.v1;
}

// ── Proceso principal ─────────────────────────────────────────
async function procesar(env, idPago) {
  if (!env.MP_ACCESS_TOKEN) throw new Error('Falta MP_ACCESS_TOKEN');

  const rp = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(idPago)}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` },
  });
  if (!rp.ok) throw new Error(`MP payments ${idPago}: ${rp.status}`);
  const pago = await rp.json();

  if (pago.status !== 'approved') {
    console.log('[mp-webhook] pago', idPago, 'en estado', pago.status, '— no se hace nada');
    return;
  }

  const token = await tokenFirestore(env);
  const hallazgo = await buscarReserva(env, token, pago);
  if (!hallazgo) {
    console.error('[mp-webhook] pago aprobado sin reserva identificable', idPago, pago.payer?.email);
    await crearNotificacion(env, token, 'admin', '⚠️ Pago sin reserva identificada',
      `MercadoPago aprobó el pago ${idPago} (${pago.payer?.email || 'sin email'}, $${pago.transaction_amount}) y no se pudo vincular a una reserva.`,
      { paymentId: String(idPago), email: pago.payer?.email || '' });
    return;
  }

  const { id: reservaId, datos: r } = hallazgo;

  // Candado: si ya se notificó (por esta función, por un reintento de MP o
  // por pago-confirmado.html), no se repite nada.
  if (r.notificacionesEnviadas) {
    console.log('[mp-webhook] reserva', reservaId, 'ya notificada — se ignora');
    return;
  }

  // Puntos del tour, con el mismo criterio que pago-confirmado.html
  let puntos = PUNTOS_POR_DEFECTO;
  if (r.tourId) {
    try {
      const tour = await leerDoc(env, token, 'tours', r.tourId);
      const p = Number(tour?.puntosPorReserva);
      if (Number.isFinite(p) && p >= 0) puntos = p;
    } catch (e) { console.warn('[mp-webhook] no se pudo leer el tour:', e.message); }
  }

  const ahora = new Date().toISOString();
  await actualizarDoc(env, token, 'reservas', reservaId, {
    estado: 'Pagado',
    paymentId: String(idPago),
    fechaPago: ahora,
    puntosSumados: r.puntosSumados ? r.puntosSumados : puntos,
    notificacionesEnviadas: true,
    fechaNotificaciones: ahora,
    avisadoPor: 'mp-webhook',
  });

  // Avisos internos: admin y prestador
  await crearNotificacion(env, token, 'admin', '🎫 Nueva reserva confirmada',
    `${r.clienteNombre || 'Un turista'} confirmó pago de "${r.tourTitulo || ''}"`,
    { reservaId, tourId: r.tourId || '', modalidad: 'compra' });

  if (r.proveedorId && r.proveedorId !== 'agencia_demo' && !String(r.proveedorId).startsWith('agencia_')) {
    await crearNotificacion(env, token, r.proveedorId, '🎫 Nueva reserva confirmada',
      `${r.clienteNombre || 'Un turista'} confirmó la reserva de "${r.tourTitulo || ''}" para ${r.paxAdultos || 0} adulto(s).`,
      { reservaId, tourId: r.tourId || '' });
  }

  // Datos de contacto del prestador, con la misma cascada que la página
  let proveedorEmail = '';
  let proveedorTelefono = '';
  if (r.proveedorId && r.proveedorId !== 'agencia_demo') {
    try {
      const prov = await leerDoc(env, token, 'solicitudes_prestadores', r.proveedorId);
      proveedorEmail = prov?.email || prov?.emailContacto || '';
      proveedorTelefono = prov?.telefono || prov?.whatsapp || '';
    } catch (e) { console.warn('[mp-webhook] no se pudo leer el prestador:', e.message); }
  }
  if (r.emailAvisoExterno && String(r.emailAvisoExterno).trim()) proveedorEmail = String(r.emailAvisoExterno).trim();
  if (!proveedorEmail.trim()) proveedorEmail = EMAIL_RESPALDO;

  // Mails por Make: mismo payload que manda pago-confirmado.html
  if (env.MAKE_EMAIL_WEBHOOK_URL) {
    const resp = await fetch(env.MAKE_EMAIL_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservaId,
        tourId: r.tourId || '',
        proveedorId: r.proveedorId || 'agencia_demo',
        clienteNombre: r.clienteNombre || '',
        clienteEmail: r.clienteEmail || '',
        clienteTelefono: r.clienteTelefono || '',
        tourTitulo: r.tourTitulo || '',
        proveedorNombre: r.proveedorNombre || '',
        proveedorEmail,
        proveedorTelefono,
        emailAvisoExterno: r.emailAvisoExterno || '',
        esExterno: !!(r.emailAvisoExterno && String(r.emailAvisoExterno).trim()),
        fechaActividad: r.fechaExcursion || '',
        paxAdultos: r.paxAdultos || 0,
        paxNinos: r.paxNinos || 0,
        modalidad: 'compra',
        estado: 'Pagado',
        precio: r.precioReserva || r.total || 0,
        precioLista: r.precioLista || 0,
        saldoDestino: r.saldoDestino || 0,
        ahorroTurista: r.ahorroTurista || 0,
        tourImagen: r.tourImagen || '',
        fechaCreacion: ahora,
        sitio: 'patagoniaexperiencias.com',
      }),
    });
    if (!resp.ok) console.error('[mp-webhook] Make respondió', resp.status);
  }

  console.log('[mp-webhook] reserva', reservaId, 'confirmada y notificada · pago', idPago);
}

// ── Entrada HTTP ──────────────────────────────────────────────
// MercadoPago manda el aviso en varios formatos según la versión:
//   POST { type: 'payment', data: { id } }      (webhooks)
//   POST ?type=payment&data.id=123
//   GET  ?topic=payment&id=123                   (IPN vieja)
function sacarIdPago(url, cuerpo) {
  const q = url.searchParams;
  const tipo = (cuerpo?.type || cuerpo?.topic || q.get('type') || q.get('topic') || '').toLowerCase();
  if (tipo && tipo !== 'payment') return null;
  return cuerpo?.data?.id || cuerpo?.id || q.get('data.id') || q.get('id') || null;
}

async function manejar({ request, env, waitUntil }) {
  const url = new URL(request.url);
  let cuerpo = null;
  if (request.method === 'POST') {
    try { cuerpo = JSON.parse(await request.text()); } catch { cuerpo = null; }
  }
  const idPago = sacarIdPago(url, cuerpo);

  // Sin id de pago (o es un aviso de otro tipo): 200 para que MP no reintente.
  if (!idPago) return new Response('ok', { status: 200 });

  if (!(await firmaValida(env, request, idPago))) {
    console.warn('[mp-webhook] firma inválida para el pago', idPago);
    return new Response('firma inválida', { status: 401 });
  }

  // Se responde enseguida y el trabajo sigue en segundo plano: MercadoPago
  // reintenta si la respuesta tarda, y el reintento lo frena el candado.
  const tarea = procesar(env, idPago).catch((e) => console.error('[mp-webhook]', e.message));
  if (typeof waitUntil === 'function') waitUntil(tarea); else await tarea;
  return new Response('ok', { status: 200 });
}

export const onRequestPost = manejar;
export const onRequestGet = manejar;
