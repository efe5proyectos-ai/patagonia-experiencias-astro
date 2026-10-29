/* ─────────────────────────────────────────────────────────────
   Consultor de viaje con IA — widget de chat (Patagonia Experiencias)
   (distinto de AIKE, que es el cotizador de escapadas con botones)

   Uso en cualquier página (también Patagonia Puntos y Magazine):
     <script src="https://patagoniaexperiencias.com/js/aike-chat.js"
             data-idioma="es" defer></script>
   Opcionales: data-api (URL de /api/aike), data-avatar (imagen),
               data-nombre (nombre del consultor), data-abierto="1".

   Conversación en texto plano; como mucho UNA recomendación por respuesta.
   Audio: micrófono para hablarle y botón para escuchar las respuestas
   (usa la voz del navegador, sin costo). Si el viajero habla, responde en voz.
   ───────────────────────────────────────────────────────────── */
(function () {
  if (window.__consultorPE) return;
  window.__consultorPE = true;

  var script = document.currentScript || document.querySelector('script[src*="aike-chat.js"]');
  var base = 'https://patagoniaexperiencias.com';
  try { base = new URL(script.src).origin; } catch (e) {}
  var ds = (script && script.dataset) || {};
  var cfg = {
    api: ds.api || base + '/api/aike',
    avatar: ds.avatar || base + '/img/aike-ia.svg',
    nombre: ds.nombre || 'Quimey',
    idioma: ds.idioma || ((document.documentElement.lang || '').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'es'),
    abierto: ds.abierto === '1'
  };
  var PT = cfg.idioma === 'pt';
  var N = cfg.nombre;
  var T = PT ? {
    hola: 'Olá! Sou a **' + N + '**, a consultora da Patagonia Magazine com inteligência artificial. Pergunte sobre viagens, gastronomia, eventos e passeios na Patagônia. Pode escrever ou falar 🎙️',
    ph: 'Escreva ou fale sua pergunta…', enviar: 'Enviar', accion: 'Ver e consultar', desde: 'a partir de', reco: 'Recomendação',
    sugs: [
      ['Ver baleias: quando ir?', [6, 7, 8, 9, 10, 11, 12]], ['Pinguins em Punta Tombo: vale a pena?', [9, 10, 11, 12, 1, 2, 3, 4]],
      ['Orcas em Península Valdés: quando?', [2, 3, 4, 10, 11]], ['Neve em Esquel: o que fazer?', [6, 7, 8, 9]],
      ['Praias da Patagônia no verão', [12, 1, 2]], ['Patagônia no outono: onde ir?', [3, 4, 5]],
      ['Onde comer em Puerto Madryn'], ['Próximos eventos na Patagônia'], ['Roteiro de 4 dias em Península Valdés'],
      ['Chá galês em Gaiman: onde?'], ['Como chegar a Puerto Madryn?'], ['Passeios com crianças na Patagônia'],
      ['O que comer na Patagônia?'], ['Esquel e Trevelin: o que fazer?'], ['Mergulho com lobos-marinhos'], ['Melhor época para visitar Chubut']
    ],
    erro: 'Não consegui responder agora. Tenta de novo em alguns segundos.', ia: 'Consultora com IA · pode cometer erros',
    abrir: 'Falar com a ' + N, sub: 'Consultora · Patagonia Magazine', mic: 'Falar', ouvir: 'Ouvir', parar: 'Parar', escutando: 'Escutando…'
  } : {
    hola: '¡Hola! Soy **' + N + '**, la consultora de Patagonia Magazine con inteligencia artificial. Preguntame sobre viajes, gastronomía, eventos y excursiones en la Patagonia. Podés escribir o hablarme 🎙️',
    ph: 'Escribí o hablá tu consulta…', enviar: 'Enviar', accion: 'Ver y reservar', desde: 'desde', reco: 'Recomendación',
    sugs: [
      ['Ballenas: ¿cuándo ir?', [6, 7, 8, 9, 10, 11, 12]], ['Pingüinos en Punta Tombo: ¿vale la pena?', [9, 10, 11, 12, 1, 2, 3, 4]],
      ['Orcas en Península Valdés: ¿cuándo?', [2, 3, 4, 10, 11]], ['¿Qué hago con nieve en Esquel?', [6, 7, 8, 9]],
      ['Playas de la Patagonia para el verano', [12, 1, 2]], ['Escapada de otoño: ¿adónde voy?', [3, 4, 5]],
      ['¿Qué hacer en las vacaciones de invierno?', [7]], ['Escapada para Semana Santa', [3, 4]], ['Fin de semana largo: ¿qué me recomendás?'],
      ['¿Qué eventos se vienen?'], ['¿Dónde como cordero en Trelew?'], ['Té galés en Gaiman: ¿dónde?'], ['Armame 3 días en Península Valdés'],
      ['¿Qué hago en Puerto Madryn con chicos?'], ['¿Dónde comer mariscos en Madryn?'], ['Esquel y Trevelin: ¿qué no me pierdo?'],
      ['Snorkel con lobos marinos: ¿dónde?'], ['¿Qué platos típicos tengo que probar?'], ['Tengo un restaurante: ¿cómo aparezco en la revista?']
    ],
    erro: 'No pude responder ahora. Probá de nuevo en unos segundos.', ia: 'Consultora con IA · puede equivocarse',
    abrir: 'Hablar con ' + N, sub: 'Consultora · Patagonia Magazine', mic: 'Hablar', ouvir: 'Escuchar', parar: 'Detener', escutando: 'Te escucho…'
  };
  var LANG = PT ? 'pt-BR' : 'es-AR';

  var CLAVE = 'consultor_pe_' + cfg.idioma;
  var historial = [];
  try { historial = JSON.parse(sessionStorage.getItem(CLAVE) || '[]') || []; } catch (e) { historial = []; }
  function guardar() { try { sessionStorage.setItem(CLAVE, JSON.stringify(historial.slice(-30))); } catch (e) {} }

  // ── Estadísticas: un id anónimo por conversación (no identifica a la persona) ──
  var SES = '';
  try { SES = sessionStorage.getItem('consultor_pe_sesion') || ''; } catch (e) {}
  if (!/^[A-Za-z0-9]{20,40}$/.test(SES)) {
    var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789', rnd = new Uint8Array(24);
    try { crypto.getRandomValues(rnd); } catch (e) { for (var q = 0; q < 24; q++) rnd[q] = Math.floor(Math.random() * 256); }
    SES = ''; for (var q2 = 0; q2 < 24; q2++) SES += abc[rnd[q2] % abc.length];
    try { sessionStorage.setItem('consultor_pe_sesion', SES); } catch (e) {}
  }
  var API_EVENTO = cfg.api.replace(/\/api\/aike\/?$/, '/api/aike-evento');
  function evento(tipo, url) {
    try {
      var cuerpo = JSON.stringify({ sesion: SES, tipo: tipo, url: url || '', pagina: location.href.split(/[?#]/)[0], idioma: cfg.idioma });
      if (navigator.sendBeacon && navigator.sendBeacon(API_EVENTO, cuerpo)) return;
      fetch(API_EVENTO, { method: 'POST', body: cuerpo, keepalive: true, mode: 'cors' }).catch(function () {});
    } catch (e) {}
  }

  var css = '' +
    '.cpe-b{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:64px;height:64px;border:0;padding:0;border-radius:20px;cursor:pointer;background:none;box-shadow:0 10px 30px rgba(233,30,99,.35);transition:transform .2s}' +
    '.cpe-b:hover{transform:translateY(-2px) scale(1.04)}.cpe-b img{width:100%;height:100%;border-radius:20px;display:block}' +
    '.cpe-b .cpe-dot{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #fff}' +
    '.cpe-p{position:fixed;right:20px;bottom:96px;z-index:2147483001;width:min(390px,calc(100vw - 24px));height:min(620px,calc(100vh - 120px));background:#fff;border-radius:22px;box-shadow:0 24px 60px rgba(15,16,32,.28);display:none;flex-direction:column;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#2c3e50}' +
    '.cpe-p.on{display:flex}' +
    '.cpe-h{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#1A1B3A,#0F1020);color:#fff}' +
    '.cpe-h img{width:40px;height:40px;border-radius:12px}.cpe-h b{font:800 16px Montserrat,system-ui,sans-serif;display:block}' +
    '.cpe-h small{font-size:11px;opacity:.7}.cpe-x{margin-left:auto;background:rgba(255,255,255,.12);border:0;color:#fff;width:32px;height:32px;border-radius:10px;font-size:18px;cursor:pointer}' +
    '.cpe-m{flex:1;overflow-y:auto;padding:16px;background:#f7f5f8;display:flex;flex-direction:column;gap:10px}.cpe-m>*{flex-shrink:0}' +
    '.cpe-t{max-width:88%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.55;white-space:pre-wrap;word-wrap:break-word}' +
    '.cpe-t a{color:#E91E63;font-weight:600}.cpe-u{align-self:flex-end;background:#E91E63;color:#fff;border-bottom-right-radius:4px}.cpe-u a{color:#fff}' +
    '.cpe-a{align-self:flex-start;background:#fff;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.06)}' +
    '.cpe-o{display:inline-flex;align-items:center;gap:4px;margin-top:6px;border:0;background:#f1f5f9;color:#475569;font-size:11px;font-weight:600;padding:4px 9px;border-radius:999px;cursor:pointer}' +
    '.cpe-o.on{background:#E91E63;color:#fff}' +
    '.cpe-r{align-self:flex-start;max-width:88%;display:flex;gap:10px;align-items:center;background:#fff;border:1px solid #f3c1d3;border-radius:14px;padding:8px;text-decoration:none;color:#2c3e50}' +
    '.cpe-r img{width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0;background:#eee}' +
    '.cpe-r div{display:flex;flex-direction:column;gap:2px;min-width:0}.cpe-r small{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#E91E63}' +
    '.cpe-r strong{font-size:13px;line-height:1.3}.cpe-r span{font-size:12px;color:#64748b}.cpe-r span b{color:#2c3e50}' +
    '.cpe-r em{font-style:normal;font-size:12px;font-weight:700;color:#fff;background:#E91E63;border-radius:8px;padding:5px 9px;margin-left:auto;white-space:nowrap}.cpe-r em.wa{background:#25D366}' +
    '.cpe-s{display:flex;flex-wrap:wrap;gap:6px}.cpe-s button{border:1px solid #f3c1d3;background:#fff;color:#C2185B;font-size:12px;font-weight:600;padding:6px 10px;border-radius:999px;cursor:pointer}' +
    '.cpe-dots{display:inline-flex;gap:4px}.cpe-dots i{width:7px;height:7px;border-radius:50%;background:#E91E63;opacity:.3;animation:cpeP 1s infinite}' +
    '.cpe-dots i:nth-child(2){animation-delay:.15s}.cpe-dots i:nth-child(3){animation-delay:.3s}@keyframes cpeP{50%{opacity:1}}' +
    '.cpe-f{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff;align-items:flex-end}' +
    '.cpe-f textarea{flex:1;resize:none;border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px;font:14px Inter,system-ui,sans-serif;max-height:90px;outline:none}' +
    '.cpe-f textarea:focus{border-color:#E91E63}.cpe-f button{border:0;background:#E91E63;color:#fff;font-weight:700;border-radius:12px;padding:0 14px;height:42px;cursor:pointer}' +
    '.cpe-f .cpe-mic{background:#f1f5f9;color:#2c3e50;width:42px;padding:0;font-size:18px}.cpe-f .cpe-mic.on{background:#E91E63;color:#fff;animation:cpeP 1s infinite}' +
    '.cpe-f button:disabled{opacity:.5}.cpe-l{font-size:10px;color:#94a3b8;text-align:center;padding:0 0 8px;background:#fff}' +
    '@media(max-width:520px){.cpe-p{right:12px;bottom:88px}.cpe-b{right:14px;bottom:14px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function urlSegura(u) { return /^https:\/\//i.test(u) ? u : '#'; }
  // Texto → HTML seguro: escapa todo y solo permite **negrita** y [links](https://…)
  function formato(t) {
    return esc(t)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, function (_, txt, u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + txt + '</a>'; });
  }
  function textoPlano(t) { return String(t || '').replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/\S+/g, '').replace(/[🎙️📖💬✨🐋🐧]/g, ''); }
  function pesos(n) { return '$' + Math.round(Number(n)).toLocaleString('es-AR'); }

  // ── Voz: hablar (reconocimiento) y escuchar (lectura en voz alta) ──
  var Reconoce = window.SpeechRecognition || window.webkitSpeechRecognition;
  var sintesis = window.speechSynthesis;
  var modoVoz = false;          // si el viajero habló, las respuestas se leen solas
  var botonSonando = null;
  function vozIdioma() {
    var vs = (sintesis && sintesis.getVoices()) || [];
    var pref = PT ? ['pt-BR', 'pt'] : ['es-AR', 'es-US', 'es-MX', 'es-419', 'es'];
    for (var i = 0; i < pref.length; i++) {
      for (var j = 0; j < vs.length; j++) if ((vs[j].lang || '').toLowerCase().indexOf(pref[i].toLowerCase()) === 0) return vs[j];
    }
    return null;
  }
  function callar() {
    if (sintesis) sintesis.cancel();
    if (botonSonando) { botonSonando.classList.remove('on'); botonSonando.textContent = '🔊 ' + T.ouvir; botonSonando = null; }
  }
  function leer(texto, boton) {
    if (!sintesis) return;
    if (botonSonando === boton && boton) { callar(); return; }
    callar();
    var u = new SpeechSynthesisUtterance(textoPlano(texto));
    u.lang = LANG; var v = vozIdioma(); if (v) u.voice = v; u.rate = 1.02;
    if (boton) { boton.classList.add('on'); boton.textContent = '⏹ ' + T.parar; botonSonando = boton; }
    u.onend = u.onerror = function () { if (botonSonando === boton) callar(); };
    sintesis.speak(u);
  }

  var boton = document.createElement('button');
  boton.className = 'cpe-b'; boton.type = 'button'; boton.setAttribute('aria-label', T.abrir);
  boton.innerHTML = '<img alt="' + esc(N) + '" src="' + esc(cfg.avatar) + '"><span class="cpe-dot"></span>';
  var panel = document.createElement('div');
  panel.className = 'cpe-p'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', N);
  panel.innerHTML =
    '<div class="cpe-h"><img alt="" src="' + esc(cfg.avatar) + '"><div><b>' + esc(N) + '</b><small>' + esc(T.sub) + '</small></div><button class="cpe-x" type="button" aria-label="Cerrar">×</button></div>' +
    '<div class="cpe-m" aria-live="polite"></div>' +
    '<form class="cpe-f">' + (Reconoce ? '<button type="button" class="cpe-mic" aria-label="' + esc(T.mic) + '" title="' + esc(T.mic) + '">🎙️</button>' : '') +
    '<textarea rows="1" maxlength="1000" placeholder="' + esc(T.ph) + '"></textarea><button type="submit" class="cpe-env">' + esc(T.enviar) + '</button></form>' +
    '<div class="cpe-l">' + esc(T.ia) + '</div>';
  document.body.appendChild(boton); document.body.appendChild(panel);
  var caja = panel.querySelector('.cpe-m'), form = panel.querySelector('form'), area = form.querySelector('textarea'),
    env = form.querySelector('.cpe-env'), mic = form.querySelector('.cpe-mic');

  function burbuja(rol, texto, autoLeer) {
    var d = document.createElement('div');
    d.className = 'cpe-t ' + (rol === 'user' ? 'cpe-u' : 'cpe-a');
    d.innerHTML = formato(texto);
    if (rol !== 'user' && sintesis) {
      var o = document.createElement('button'); o.type = 'button'; o.className = 'cpe-o'; o.textContent = '🔊 ' + T.ouvir;
      o.onclick = function () { leer(texto, o); };
      d.appendChild(document.createElement('br')); d.appendChild(o);
      if (autoLeer) setTimeout(function () { leer(texto, o); }, 50);
    }
    caja.appendChild(d);
  }
  // Una sola recomendación, compacta, al final de la respuesta
  function recomendacion(lista) {
    var c = lista && lista[0];
    if (!c) return;
    var a = document.createElement('a'); a.className = 'cpe-r'; a.href = urlSegura(c.url);
    a.innerHTML = (c.imagen ? '<img loading="lazy" alt="" src="' + esc(urlSegura(c.imagen)) + '">' : '') +
      '<div><small>' + esc(T.reco) + '</small><strong>' + esc(c.titulo) + '</strong>' +
      (c.precio ? '<span>' + esc(T.desde) + ' <b>' + pesos(c.precio) + '</b></span>' : '') + '</div>' +
      '<em' + (PT ? ' class="wa"' : '') + '>' + esc(T.accion) + '</em>';
    caja.appendChild(a);
  }
  function sugerencias() {
    var s = document.createElement('div'); s.className = 'cpe-s';
    // 3 preguntas distintas en cada apertura: primero las de la temporada actual, el resto al azar
    var mes = new Date().getMonth() + 1;
    var mezclar = function (l) { return l.map(function (x) { return [Math.random(), x]; }).sort(function (a, b) { return a[0] - b[0]; }).map(function (x) { return x[1]; }); };
    var deTemporada = mezclar(T.sugs.filter(function (x) { return x[1] && x[1].indexOf(mes) >= 0; }));
    var generales = mezclar(T.sugs.filter(function (x) { return !x[1]; }));
    var elegidas = deTemporada.slice(0, 1 + Math.floor(Math.random() * 2)).concat(generales).slice(0, 3);
    mezclar(elegidas).map(function (x) { return x[0]; }).forEach(function (q) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = q;
      b.onclick = function () { s.remove(); enviar(q); };
      s.appendChild(b);
    });
    caja.appendChild(s);
  }
  function abajo() { caja.scrollTop = caja.scrollHeight; }
  function pintar() {
    caja.innerHTML = '';
    burbuja('aike', T.hola);
    historial.forEach(function (m) { burbuja(m.rol === 'aike' ? 'aike' : 'user', m.texto); if (m.rol === 'aike') recomendacion(m.tarjetas); });
    if (!historial.length) sugerencias();
    abajo();
  }

  var enviando = false;
  function enviar(texto) {
    texto = String(texto || '').trim();
    if (!texto || enviando) return;
    enviando = true; env.disabled = true; callar();
    var chips = caja.querySelector('.cpe-s'); if (chips) chips.remove();
    historial.push({ rol: 'user', texto: texto }); guardar();
    burbuja('user', texto);
    var esp = document.createElement('div'); esp.className = 'cpe-t cpe-a'; esp.innerHTML = '<span class="cpe-dots"><i></i><i></i><i></i></span>';
    caja.appendChild(esp); abajo();
    fetch(cfg.api, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idioma: cfg.idioma, sesion: SES, pagina: location.href.split(/[?#]/)[0], ref: document.referrer || '', voz: modoVoz,
        mensajes: historial.map(function (m) { return { rol: m.rol, texto: m.texto }; }) })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        esp.remove();
        if (!x.ok) { burbuja('aike', (x.d && x.d.error) || T.erro); return; }
        var m = { rol: 'aike', texto: x.d.texto || '', tarjetas: (x.d.tarjetas || []).slice(0, 1) };
        historial.push(m); guardar();
        burbuja('aike', m.texto, modoVoz); recomendacion(m.tarjetas);
        try { if (window.fbq) fbq('trackCustom', 'ConsultorIARespuesta'); } catch (e) {}
      })
      .catch(function () { esp.remove(); burbuja('aike', T.erro); })
      .then(function () { enviando = false; env.disabled = false; abajo(); if (!modoVoz) area.focus(); });
  }

  // Micrófono: dicta, y al terminar envía solo
  var rec = null;
  if (mic) {
    mic.onclick = function () {
      if (rec) { rec.stop(); return; }
      callar();
      rec = new Reconoce(); rec.lang = LANG; rec.interimResults = true; rec.maxAlternatives = 1;
      var final = '';
      mic.classList.add('on'); area.placeholder = T.escutando;
      rec.onresult = function (ev) {
        var parcial = '';
        for (var i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) final += ev.results[i][0].transcript; else parcial += ev.results[i][0].transcript;
        }
        area.value = (final + parcial).trim();
      };
      rec.onerror = function () {};
      rec.onend = function () {
        mic.classList.remove('on'); area.placeholder = T.ph; rec = null;
        var t = area.value.trim();
        if (t) { modoVoz = true; area.value = ''; enviar(t); }
      };
      try { rec.start(); } catch (e) { rec = null; mic.classList.remove('on'); }
    };
  }

  var abrioYa = false;
  function abrir() { panel.classList.add('on'); pintar(); setTimeout(function () { area.focus(); }, 50); if (!abrioYa) { abrioYa = true; evento('abrir'); } }
  // Clics en la recomendación y en los links de las respuestas (para medir conversión)
  caja.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a') : null;
    if (a && a.href) evento(a.classList.contains('cpe-r') ? 'tarjeta' : 'link', a.href);
  });
  function cerrar() { panel.classList.remove('on'); callar(); if (rec) rec.stop(); }
  boton.onclick = function () { panel.classList.contains('on') ? cerrar() : abrir(); };
  panel.querySelector('.cpe-x').onclick = cerrar;
  form.onsubmit = function (e) { e.preventDefault(); modoVoz = false; var t = area.value; area.value = ''; enviar(t); };
  area.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.onsubmit(e); } });
  if (sintesis && sintesis.onvoiceschanged !== undefined) sintesis.onvoiceschanged = function () {};
  window.ConsultorPE = { abrir: abrir, cerrar: cerrar, preguntar: function (t) { abrir(); enviar(t); } };
  if (cfg.abierto) abrir();
})();
