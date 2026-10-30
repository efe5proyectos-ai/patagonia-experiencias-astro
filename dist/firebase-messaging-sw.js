/* ============================================================================
   SERVICE WORKER DE NOTIFICACIONES · Patagonia Experiencias
   ----------------------------------------------------------------------------
   Este archivo es OBLIGATORIO para que funcionen las notificaciones push, y
   tiene que estar en la RAÍZ del sitio con este nombre exacto:

       patagoniaexperiencias.com/firebase-messaging-sw.js

   No puede ir en una subcarpeta. Si lo movés, deja de funcionar.

   Qué hace: se queda corriendo en segundo plano, aunque el visitante haya
   cerrado la pestaña. Cuando llega una notificación, la muestra.

   Usa la versión "compat" del SDK a propósito, para que coincida con la que
   carga el resto del sitio (firebase 10.8.1 compat).
   ========================================================================== */

importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.1/firebase-messaging-compat.js');

// El service worker no puede leer variables del sitio: la configuración va acá,
// escrita a mano. Son los mismos valores que usa el resto de la plataforma.
firebase.initializeApp({
  apiKey:            "AIzaSyDZkeRgN45FkOF8pO2rGxDJA28VZnZ8Ntg",
  authDomain:        "patagonia-experiencias.firebaseapp.com",
  projectId:         "patagonia-experiencias",
  storageBucket:     "patagonia-experiencias.firebasestorage.app",
  messagingSenderId: "169796366610",
  appId:             "1:169796366610:web:3e2c7e65262933647983cb"
});

const messaging = firebase.messaging();

/* --------------------------------------------------------------------------
   Notificación recibida con el sitio CERRADO o en otra pestaña.
   -------------------------------------------------------------------------- */
messaging.onBackgroundMessage(function (payload) {
  const d = payload.data || {};
  const n = payload.notification || {};

  const titulo = n.title || d.titulo || 'Patagonia Experiencias';
  const opciones = {
    body:  n.body || d.mensaje || '',
    icon:  d.icono  || '/icon-192.png',
    badge: '/badge-72.png',
    image: d.imagen || undefined,
    // El tag agrupa: si llegan dos avisos de lo mismo, se reemplaza en vez de
    // apilarse. Sin esto, al visitante se le llena la barra de notificaciones.
    tag:   d.tag || 'patagonia-general',
    renotify: true,
    requireInteraction: false,
    data: {
      // A dónde lo llevamos cuando toque la notificación
      url: d.url || 'https://patagoniaexperiencias.com/patagonia-experiencias.html',
      tipo: d.tipo || 'general'
    }
  };

  return self.registration.showNotification(titulo, opciones);
});

/* --------------------------------------------------------------------------
   El visitante tocó la notificación.
   Si ya tiene el sitio abierto en alguna pestaña, la enfocamos en vez de
   abrir otra. Si no, abrimos una nueva.
   -------------------------------------------------------------------------- */
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const destino = (event.notification.data && event.notification.data.url) ||
                  'https://patagoniaexperiencias.com/patagonia-experiencias.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (lista) {
      for (const c of lista) {
        if (c.url.indexOf('patagoniaexperiencias.com') >= 0 && 'focus' in c) {
          c.navigate(destino);
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(destino);
    })
  );
});

/* --------------------------------------------------------------------------
   Activación inmediata: sin esto, una versión nueva de este archivo esperaría
   a que el visitante cierre todas las pestañas para tomar el control.
   -------------------------------------------------------------------------- */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(clients.claim()); });
