/* ─────────────────────────────────────────────────────────────
   AIKE con IA — widget de chat (Patagonia Experiencias)
   Uso en cualquier página (también Patagonia Puntos y Magazine):
     <script src="https://patagoniaexperiencias.com/js/aike-chat.js"
             data-idioma="es" defer></script>
   Opcionales: data-api (URL de /api/aike), data-avatar (imagen),
               data-abierto="1" (abre solo al cargar).
   ───────────────────────────────────────────────────────────── */
(function () {
  if (window.__aikeChat) return;
  window.__aikeChat = true;

  var script = document.currentScript || document.querySelector('script[src*="aike-chat.js"]');
  var base = 'https://patagoniaexperiencias.com';
  try { base = new URL(script.src).origin; } catch (e) {}
  var cfg = {
    api: (script && script.dataset.api) || base + '/api/aike',
    avatar: (script && script.dataset.avatar) || base + '/img/aike-ia.svg',
    idioma: (script && script.dataset.idioma) || ((document.documentElement.lang || '').toLowerCase().indexOf('pt') === 0 ? 'pt' : 'es'),
    abierto: script && script.dataset.abierto === '1'
  };
  var PT = cfg.idioma === 'pt';
  var T = PT ? {
    hola: 'Olá! Sou o **AIKE**, seu assistente de viagem com inteligência artificial. Me conta: quando você vem para a Patagônia e o que quer viver?',
    ph: 'Escreva sua pergunta…', enviar: 'Enviar', accion: 'Ver e consultar', desde: 'a partir de',
    sugs: ['Ver baleias: quando ir?', 'O que fazer em Puerto Madryn', 'Pinguins em Punta Tombo'],
    erro: 'Não consegui responder agora. Tenta de novo em alguns segundos.', ia: 'Assistente com IA · pode cometer erros', abrir: 'Falar com AIKE'
  } : {
    hola: '¡Hola! Soy **AIKE**, tu asistente de viaje con inteligencia artificial. Contame: ¿cuándo venís a la Patagonia y qué te gustaría vivir?',
    ph: 'Escribí tu consulta…', enviar: 'Enviar', accion: 'Ver y reservar', desde: 'desde',
    sugs: ['Ballenas: ¿cuándo ir?', '¿Qué hago en Puerto Madryn?', 'Beneficios de Patagonia Puntos'],
    erro: 'No pude responder ahora. Probá de nuevo en unos segundos.', ia: 'Asistente con IA · puede equivocarse', abrir: 'Hablar con AIKE'
  };

  var CLAVE = 'aike_chat_' + cfg.idioma;
  var historial = [];
  try { historial = JSON.parse(sessionStorage.getItem(CLAVE) || '[]') || []; } catch (e) { historial = []; }
  function guardar() { try { sessionStorage.setItem(CLAVE, JSON.stringify(historial.slice(-30))); } catch (e) {} }

  var css = '' +
    '.aike-b{position:fixed;right:20px;bottom:20px;z-index:2147483000;width:64px;height:64px;border:0;padding:0;border-radius:20px;cursor:pointer;background:none;box-shadow:0 10px 30px rgba(233,30,99,.35);transition:transform .2s}' +
    '.aike-b:hover{transform:translateY(-2px) scale(1.04)}.aike-b img{width:100%;height:100%;border-radius:20px;display:block}' +
    '.aike-b .aike-dot{position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #fff}' +
    '.aike-p{position:fixed;right:20px;bottom:96px;z-index:2147483001;width:min(390px,calc(100vw - 24px));height:min(620px,calc(100vh - 120px));background:#fff;border-radius:22px;box-shadow:0 24px 60px rgba(15,16,32,.28);display:none;flex-direction:column;overflow:hidden;font-family:Inter,system-ui,sans-serif;color:#2c3e50}' +
    '.aike-p.on{display:flex}' +
    '.aike-h{display:flex;align-items:center;gap:12px;padding:14px 16px;background:linear-gradient(135deg,#1A1B3A,#0F1020);color:#fff}' +
    '.aike-h img{width:40px;height:40px;border-radius:12px}.aike-h b{font:800 16px Montserrat,system-ui,sans-serif;display:block}' +
    '.aike-h small{font-size:11px;opacity:.7}.aike-x{margin-left:auto;background:rgba(255,255,255,.12);border:0;color:#fff;width:32px;height:32px;border-radius:10px;font-size:18px;cursor:pointer}' +
    '.aike-m{flex:1;overflow-y:auto;padding:16px;background:#f7f5f8;display:flex;flex-direction:column;gap:10px}.aike-m>*{flex-shrink:0}' +
    '.aike-t{max-width:86%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}' +
    '.aike-t a{color:#E91E63;font-weight:600}.aike-u{align-self:flex-end;background:#E91E63;color:#fff;border-bottom-right-radius:4px}.aike-u a{color:#fff}' +
    '.aike-a{align-self:flex-start;background:#fff;border-bottom-left-radius:4px;box-shadow:0 1px 3px rgba(0,0,0,.06)}' +
    '.aike-cards{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 6px;align-self:stretch}' +
    '.aike-c{flex:0 0 200px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);display:flex;flex-direction:column}' +
    '.aike-c img{width:100%;height:110px;object-fit:cover;background:#eee}.aike-c .aike-cc{padding:10px;display:flex;flex-direction:column;gap:4px;flex:1}' +
    '.aike-c strong{font-size:13px;line-height:1.3}.aike-c span{font-size:11px;color:#64748b}.aike-c em{font-style:normal;font:800 15px Montserrat,system-ui,sans-serif;color:#E91E63}' +
    '.aike-c s{font-size:11px;color:#94a3b8}.aike-cb{display:flex;gap:6px;margin-top:auto;padding-top:6px}' +
    '.aike-cb a{flex:1;text-align:center;font-size:12px;font-weight:700;padding:7px 4px;border-radius:9px;text-decoration:none}' +
    '.aike-cb a{background:#E91E63;color:#fff}.aike-cb a.wa{background:#25D366}.aike-c>a{display:block}' +
    '.aike-n{align-self:flex-start;font-size:12px;background:#fff;border-left:3px solid #4FD1E8;padding:8px 10px;border-radius:8px;max-width:86%}.aike-n a{color:#2c3e50;font-weight:600;text-decoration:none}' +
    '.aike-s{display:flex;flex-wrap:wrap;gap:6px}.aike-s button{border:1px solid #f3c1d3;background:#fff;color:#C2185B;font-size:12px;font-weight:600;padding:6px 10px;border-radius:999px;cursor:pointer}' +
    '.aike-dots{display:inline-flex;gap:4px}.aike-dots i{width:7px;height:7px;border-radius:50%;background:#E91E63;opacity:.3;animation:aikeP 1s infinite}' +
    '.aike-dots i:nth-child(2){animation-delay:.15s}.aike-dots i:nth-child(3){animation-delay:.3s}@keyframes aikeP{50%{opacity:1}}' +
    '.aike-f{display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff}' +
    '.aike-f textarea{flex:1;resize:none;border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px;font:14px Inter,system-ui,sans-serif;max-height:90px;outline:none}' +
    '.aike-f textarea:focus{border-color:#E91E63}.aike-f button{border:0;background:#E91E63;color:#fff;font-weight:700;border-radius:12px;padding:0 14px;cursor:pointer}' +
    '.aike-f button:disabled{opacity:.5}.aike-l{font-size:10px;color:#94a3b8;text-align:center;padding:0 0 8px;background:#fff}' +
    '@media(max-width:520px){.aike-p{right:12px;bottom:88px}.aike-b{right:14px;bottom:14px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function urlSegura(u) { return /^https:\/\//i.test(u) ? u : '#'; }
  // Texto → HTML seguro: escapa todo y solo permite **negrita** y [links](https://…)
  function formato(t) {
    return esc(t)
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, function (_, txt, u) { return '<a href="' + u + '" target="_blank" rel="noopener">' + txt + '</a>'; });
  }
  function pesos(n) { return '$' + Math.round(Number(n)).toLocaleString('es-AR'); }

  var boton = document.createElement('button');
  boton.className = 'aike-b'; boton.type = 'button'; boton.setAttribute('aria-label', T.abrir);
  boton.innerHTML = '<img alt="AIKE" src="' + esc(cfg.avatar) + '"><span class="aike-dot"></span>';
  var panel = document.createElement('div');
  panel.className = 'aike-p'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'AIKE');
  panel.innerHTML =
    '<div class="aike-h"><img alt="" src="' + esc(cfg.avatar) + '"><div><b>AIKE</b><small>' + (PT ? 'Assistente de viagem · Patagônia' : 'Asistente de viaje · Patagonia') + '</small></div><button class="aike-x" type="button" aria-label="Cerrar">×</button></div>' +
    '<div class="aike-m" aria-live="polite"></div>' +
    '<form class="aike-f"><textarea rows="1" maxlength="1000" placeholder="' + esc(T.ph) + '"></textarea><button type="submit">' + esc(T.enviar) + '</button></form>' +
    '<div class="aike-l">' + esc(T.ia) + '</div>';
  document.body.appendChild(boton); document.body.appendChild(panel);
  var caja = panel.querySelector('.aike-m'), form = panel.querySelector('form'), area = form.querySelector('textarea'), env = form.querySelector('button');

  function burbuja(rol, texto) {
    var d = document.createElement('div');
    d.className = 'aike-t ' + (rol === 'user' ? 'aike-u' : 'aike-a');
    d.innerHTML = formato(texto);
    caja.appendChild(d);
  }
  function tarjetas(lista) {
    if (!lista || !lista.length) return;
    var w = document.createElement('div'); w.className = 'aike-cards';
    w.innerHTML = lista.map(function (c) {
      return '<article class="aike-c">' + (c.imagen ? '<a href="' + esc(urlSegura(c.url)) + '"><img loading="lazy" alt="" src="' + esc(urlSegura(c.imagen)) + '"></a>' : '') +
        '<div class="aike-cc"><strong>' + esc(c.titulo) + '</strong><span>' + esc(c.destino || '') + '</span>' +
        (c.precio ? '<em>' + esc(T.desde) + ' ' + pesos(c.precio) + '</em>' + (c.precioLista ? '<s>' + pesos(c.precioLista) + '</s>' : '') : '') +
        '<div class="aike-cb"><a ' + (PT ? 'class="wa" ' : '') + 'href="' + esc(urlSegura(c.url)) + '">' + (PT ? '💬 ' : '') + esc(T.accion) + '</a></div></div></article>';
    }).join('');
    caja.appendChild(w);
  }
  function notas(lista) {
    (lista || []).forEach(function (n) {
      var d = document.createElement('div'); d.className = 'aike-n';
      d.innerHTML = '📖 <a target="_blank" rel="noopener" href="' + esc(urlSegura(n.url)) + '">' + esc(n.titulo) + '</a>';
      caja.appendChild(d);
    });
  }
  function sugerencias() {
    var s = document.createElement('div'); s.className = 'aike-s';
    T.sugs.forEach(function (q) {
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
    historial.forEach(function (m) { burbuja(m.rol === 'aike' ? 'aike' : 'user', m.texto); tarjetas(m.tarjetas); notas(m.notas); });
    if (!historial.length) sugerencias();
    abajo();
  }

  var enviando = false;
  function enviar(texto) {
    texto = String(texto || '').trim();
    if (!texto || enviando) return;
    enviando = true; env.disabled = true;
    var chips = caja.querySelector('.aike-s'); if (chips) chips.remove();
    historial.push({ rol: 'user', texto: texto }); guardar();
    burbuja('user', texto);
    var esp = document.createElement('div'); esp.className = 'aike-t aike-a'; esp.innerHTML = '<span class="aike-dots"><i></i><i></i><i></i></span>';
    caja.appendChild(esp); abajo();
    fetch(cfg.api, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idioma: cfg.idioma, mensajes: historial.map(function (m) { return { rol: m.rol, texto: m.texto }; }) })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (x) {
        esp.remove();
        if (!x.ok) { burbuja('aike', (x.d && x.d.error) || T.erro); return; }
        var m = { rol: 'aike', texto: x.d.texto || '', tarjetas: x.d.tarjetas || [], notas: x.d.notas || [] };
        historial.push(m); guardar();
        burbuja('aike', m.texto); tarjetas(m.tarjetas); notas(m.notas);
        try { if (window.fbq) fbq('trackCustom', 'AikeRespuesta'); } catch (e) {}
      })
      .catch(function () { esp.remove(); burbuja('aike', T.erro); })
      .then(function () { enviando = false; env.disabled = false; abajo(); area.focus(); });
  }

  function abrir() { panel.classList.add('on'); pintar(); setTimeout(function () { area.focus(); }, 50); }
  function cerrar() { panel.classList.remove('on'); }
  boton.onclick = function () { panel.classList.contains('on') ? cerrar() : abrir(); };
  panel.querySelector('.aike-x').onclick = cerrar;
  form.onsubmit = function (e) { e.preventDefault(); var t = area.value; area.value = ''; enviar(t); };
  area.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.onsubmit(e); } });
  window.AIKE = { abrir: abrir, cerrar: cerrar, preguntar: function (t) { abrir(); enviar(t); } };
  if (cfg.abierto) abrir();
})();
