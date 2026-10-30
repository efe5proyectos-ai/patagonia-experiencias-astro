/*
  Sprint 28 — Generador de Voucher PDF
  -----------------------------------------------------------------
  Archivo reutilizable. Se incluye como <script src="voucher-generator.js">
  en patagonia-experiencias.html, billetera-turista.html, pago-confirmado.html.
  
  Uso: window.generarVoucherPDF(reserva, perfilOperador, opciones)
  
  Requiere que la página tenga cargados:
    - https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js
    - https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
*/
(function() {
    'use strict';
    
    // ========================================================================
    // CONSTANTES
    // ========================================================================
    
    // Templates de política de cancelación (mismo array que dashboard prestador).
    // Cada operador eligió uno y lo guardó en su perfil. Al crear la reserva,
    // se copia el ID elegido. Acá lo desambiguamos al texto completo.
    const POLITICAS_CANCELACION = {
        'estandar': {
            nombre: 'Política Estándar',
            texto: [
                'Hasta 48 hs antes: reembolso del 100% del monto pagado online.',
                'Entre 24 y 48 hs antes: reembolso del 50%.',
                'Menos de 24 hs antes: sin reembolso.',
                'Cancelaciones por motivos climáticos o de fuerza mayor del operador: reembolso del 100% o reprogramación.'
            ]
        },
        'flexible': {
            nombre: 'Política Flexible',
            texto: [
                'Hasta 24 hs antes: reembolso del 100% del monto pagado online.',
                'Menos de 24 hs antes: reembolso del 50%.',
                'Cancelaciones por motivos climáticos o de fuerza mayor del operador: reembolso del 100% o reprogramación.'
            ]
        },
        'estricta': {
            nombre: 'Política Estricta',
            texto: [
                'Hasta 7 días antes: reembolso del 100% del monto pagado online.',
                'Entre 3 y 7 días antes: reembolso del 50%.',
                'Menos de 3 días antes: sin reembolso.',
                'Cancelaciones por motivos climáticos o de fuerza mayor del operador: reembolso del 100% o reprogramación.'
            ]
        },
        'no_reembolsable': {
            nombre: 'No Reembolsable',
            texto: [
                'El monto pagado online no es reembolsable bajo ninguna circunstancia.',
                'En caso de cancelación por motivos climáticos o de fuerza mayor del operador, se ofrecerá reprogramación a la próxima fecha disponible (sin reembolso en efectivo).'
            ]
        }
    };
    
    // URL del QR fijo de Patagonia Puntos (5000 pts).
    // Es la imagen QR que apunta a link.patagoniapuntos.com/patagoniaexperiencias
    // Tiene que estar disponible en la URL relativa al HTML que usa esta función.
    const QR_PUNTOS_URL = 'assets/qr-puntos.png';
    
    // ========================================================================
    // HELPERS
    // ========================================================================
    
    const fmt = (n) => Number(n || 0).toLocaleString('es-AR');
    
    const fmtFecha = (iso) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
            const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
            return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
        } catch (e) { return iso; }
    };
    
    const fmtFechaHora = (iso) => {
        if (!iso) return '—';
        try {
            const d = new Date(iso);
            const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
            const hh = String(d.getHours()).padStart(2,'0');
            const mm = String(d.getMinutes()).padStart(2,'0');
            return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()} · ${hh}:${mm} hs`;
        } catch (e) { return iso; }
    };
    
    // ========================================================================
    // GENERAR HTML DEL VOUCHER (2 páginas)
    // ========================================================================
    
    function generarHTMLVoucher(reserva, perfilOperador) {
        const r = reserva || {};
        const op = perfilOperador || {};
        
        // Política de cancelación: usar la del operador, o fallback estándar
        const politicaId = op.politicaCancelacion || 'estandar';
        const politica = POLITICAS_CANCELACION[politicaId] || POLITICAS_CANCELACION['estandar'];
        
        // Datos derivados
        const totalPagado = Number(r.precio) || Number(r.total) || 0;
        const saldoDestino = Number(r.saldoDestino) || 0;
        const precioLista = Number(r.precioLista) || (totalPagado + saldoDestino);
        const ahorro = Math.max(0, precioLista - totalPagado - saldoDestino);
        const pasajerosTexto = `${Number(r.paxAdultos) || 1} adulto(s)${(Number(r.paxNinos) || 0) > 0 ? ` + ${r.paxNinos} niño(s)` : ''}`;
        const tourImagen = r.tourImagen || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
        const operadorNombre = (r.proveedorNombre || op.nombreFantasia || op.razonSocial || 'Operador').toUpperCase();
        
        return `
<style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@1,700&display=swap');
    .vch-page {
        width: 794px; min-height: 1123px;
        background: white;
        font-family: 'Inter', -apple-system, sans-serif;
        color: #1f2937;
        position: relative;
        overflow: hidden;
        page-break-after: always;
    }
    .vch-page * { box-sizing: border-box; }
    .vch-header {
        background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%);
        color: white;
        padding: 28px 50px;
    }
    .vch-header-row { display: flex; justify-content: space-between; align-items: center; }
    .vch-brand { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .vch-brand .light { font-weight: 400; }
    .vch-tagline { font-size: 9px; letter-spacing: 3px; opacity: 0.85; text-transform: uppercase; margin-top: 3px; font-family: 'Montserrat', sans-serif; font-weight: 600; }
    .vch-label { background: rgba(255,255,255,.2); padding: 8px 18px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; font-family: 'Montserrat', sans-serif; }
    .vch-body { padding: 36px 50px; }
    .vch-conf-hero { text-align: center; margin-bottom: 30px; }
    .vch-conf-icon { width: 56px; height: 56px; background: #10b981; border-radius: 50%; margin: 0 auto 14px; line-height: 56px; color: white; font-size: 28px; font-weight: 700; }
    .vch-conf-title { font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 800; color: #1f2937; margin-bottom: 6px; letter-spacing: -0.5px; }
    .vch-conf-subtitle { font-size: 12px; color: #64748b; }
    .vch-id-qr-row { display: flex; gap: 24px; margin-bottom: 30px; }
    .vch-id-card { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; border-top: 3px solid #E91E63; padding: 18px 22px; }
    .vch-id-label { font-size: 9px; letter-spacing: 2px; color: #E91E63; font-weight: 700; text-transform: uppercase; margin-bottom: 6px; font-family: 'Montserrat', sans-serif; }
    .vch-id-value { font-family: 'Courier New', monospace; font-size: 16px; color: #1f2937; font-weight: 700; word-break: break-all; }
    .vch-tour-card { background: linear-gradient(135deg, #fff5f8 0%, #fce4ec 100%); border: 1px solid #fce4ec; border-top: 3px solid #E91E63; border-radius: 8px; overflow: hidden; margin-bottom: 24px; }
    .vch-tour-image { width: 100%; height: 180px; background-size: cover; background-position: center; }
    .vch-tour-info { padding: 22px 26px; }
    .vch-tour-operator { font-size: 10px; color: #E91E63; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; font-family: 'Montserrat', sans-serif; }
    .vch-tour-title { font-family: 'Montserrat', sans-serif; font-size: 22px; font-weight: 800; color: #1f2937; line-height: 1.3; letter-spacing: -0.3px; }
    .vch-detail-section { margin-bottom: 24px; }
    .vch-detail-section-title { font-size: 10px; letter-spacing: 4px; color: #E91E63; font-weight: 700; text-transform: uppercase; margin-bottom: 12px; font-family: 'Montserrat', sans-serif; }
    .vch-detail-grid { background: #f8fafc; border-radius: 8px; padding: 4px 22px; border-top: 3px solid #E91E63; }
    .vch-detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    .vch-detail-row:last-child { border-bottom: none; }
    .vch-detail-row .label { color: #64748b; font-weight: 500; }
    .vch-detail-row .value { color: #1f2937; font-weight: 600; text-align: right; }
    .vch-detail-row .value.big { font-size: 14px; font-weight: 800; color: #E91E63; font-family: 'Montserrat', sans-serif; }
    .vch-detail-row .value.green { color: #10b981; font-weight: 800; font-size: 14px; font-family: 'Montserrat', sans-serif; }
    .vch-saldo-banner { background: #fff8e6; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 20px; margin-bottom: 24px; font-size: 11px; color: #92400e; line-height: 1.65; }
    .vch-saldo-banner strong { color: #78350f; }
    .vch-bonus-card { background: linear-gradient(135deg, #1a1612 0%, #2c1f1a 100%); color: white; border-radius: 14px; padding: 26px; margin-bottom: 24px; display: flex; align-items: center; gap: 22px; border: 2px solid #E91E63; }
    .vch-bonus-info { flex: 1; }
    .vch-bonus-label { font-size: 9px; letter-spacing: 4px; color: #F8BBD0; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; font-family: 'Montserrat', sans-serif; }
    .vch-bonus-title { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.3px; }
    .vch-bonus-text { font-size: 11px; line-height: 1.6; opacity: 0.85; }
    .vch-bonus-pts { font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 900; color: #F8BBD0; margin-top: 12px; letter-spacing: -0.5px; }
    .vch-bonus-qr { width: 130px; height: 130px; background: white; padding: 10px; border-radius: 10px; flex-shrink: 0; }
    .vch-bonus-qr img { width: 100%; height: 100%; display: block; }
    .vch-footer { position: absolute; bottom: 0; left: 0; right: 0; background: #1a1612; color: white; padding: 18px 50px; font-size: 9px; letter-spacing: 1px; text-align: center; border-top: 3px solid #E91E63; }
    .vch-footer strong { color: white; font-weight: 800; font-family: 'Montserrat', sans-serif; }
    .vch-footer .small { opacity: 0.6; font-size: 8px; margin-top: 4px; }
    .vch-terms-content { padding: 30px 50px 80px; }
    .vch-terms-title { font-family: 'Montserrat', sans-serif; font-size: 20px; font-weight: 800; color: #1f2937; margin-bottom: 4px; letter-spacing: -0.3px; }
    .vch-terms-subtitle { font-size: 11px; color: #64748b; margin-bottom: 24px; }
    .vch-terms-section { margin-bottom: 18px; }
    .vch-terms-section h3 { font-family: 'Montserrat', sans-serif; font-size: 11px; color: #E91E63; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
    .vch-terms-section p, .vch-terms-section li { font-size: 10.5px; line-height: 1.65; color: #475569; }
    .vch-terms-section ul { padding-left: 18px; }
    .vch-terms-section li { margin-bottom: 4px; }
    .vch-terms-custom { font-size: 10.5px; line-height: 1.65; color: #475569; }
    .vch-terms-custom b, .vch-terms-custom strong { font-weight: 700; color: #1e293b; }
    .vch-terms-custom u { text-decoration: underline; }
    .vch-terms-custom br { display: block; content: ""; margin-bottom: 3px; }
    .vch-terms-divider { height: 1px; background: #fce4ec; margin: 18px 0; }
    .vch-next-steps { background: #f8fafc; border-radius: 8px; border-top: 3px solid #E91E63; padding: 22px 26px; margin-bottom: 24px; }
    .vch-step-row { display: flex; gap: 14px; margin-bottom: 14px; align-items: flex-start; }
    .vch-step-row:last-child { margin-bottom: 0; }
    .vch-step-number { width: 28px; height: 28px; background: #E91E63; color: white; border-radius: 50%; line-height: 28px; text-align: center; font-size: 12px; font-weight: 800; flex-shrink: 0; font-family: 'Montserrat', sans-serif; }
    .vch-step-text { font-size: 11px; color: #334155; line-height: 1.65; }
    .vch-step-text strong { color: #1f2937; font-weight: 700; }
    .vch-contact-box { background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%); color: white; border-radius: 14px; padding: 22px; text-align: center; }
    .vch-contact-box h3 { font-family: 'Montserrat', sans-serif; font-size: 15px; margin-bottom: 8px; font-weight: 800; letter-spacing: -0.3px; }
    .vch-contact-box p { font-size: 11px; opacity: 0.95; line-height: 1.6; }
    .vch-contact-email { background: rgba(255,255,255,.2); padding: 8px 14px; border-radius: 6px; margin-top: 10px; display: inline-block; font-weight: 700; font-size: 11px; font-family: 'Inter', sans-serif; }
</style>

<!-- ====== PÁGINA 1 ====== -->
<div class="vch-page">
    <div class="vch-header">
        <div class="vch-header-row">
            <div>
                <div class="vch-brand">Patagonia<span class="light">Experiencias</span></div>
                <div class="vch-tagline">Plataforma de reservas turísticas</div>
            </div>
            <div class="vch-label">Voucher Confirmado</div>
        </div>
    </div>
    
    <div class="vch-body">
        <div class="vch-conf-hero">
            <div class="vch-conf-icon">✓</div>
            <div class="vch-conf-title">¡Tu reserva está confirmada!</div>
            <div class="vch-conf-subtitle">Guardá este voucher — el operador puede pedirte que se lo muestres</div>
        </div>
        
        <div class="vch-id-qr-row">
            <div class="vch-id-card">
                <div class="vch-id-label">ID de Reserva</div>
                <div class="vch-id-value">${r.id || '—'}</div>
                <div class="vch-id-label" style="margin-top:14px">Emisión</div>
                <div class="vch-id-value" style="font-size:12px">${fmtFechaHora(r.fechaCreacion)}</div>
            </div>
        </div>
        
        <div class="vch-tour-card">
            <div class="vch-tour-image" style="background-image:url('${tourImagen}')"></div>
            <div class="vch-tour-info">
                <div class="vch-tour-operator">Operador: ${operadorNombre}</div>
                <div class="vch-tour-title">${r.tourTitulo || 'Experiencia Patagónica'}</div>
            </div>
        </div>
        
        <div class="vch-detail-section">
            <div class="vch-detail-section-title">Datos del Pasajero</div>
            <div class="vch-detail-grid">
                <div class="vch-detail-row"><span class="label">Nombre completo</span><span class="value">${r.clienteNombre || '—'}</span></div>
                <div class="vch-detail-row"><span class="label">Email</span><span class="value">${r.clienteEmail || '—'}</span></div>
                <div class="vch-detail-row"><span class="label">Teléfono</span><span class="value">${r.clienteTelefono || '—'}</span></div>
                <div class="vch-detail-row"><span class="label">Pasajeros</span><span class="value">${pasajerosTexto}</span></div>
            </div>
        </div>
        
        <div class="vch-detail-section">
            <div class="vch-detail-section-title">Detalles de la Actividad</div>
            <div class="vch-detail-grid">
                <div class="vch-detail-row"><span class="label">Fecha</span><span class="value">${fmtFecha(r.fechaExcursion)}</span></div>
                <div class="vch-detail-row"><span class="label">Punto de encuentro</span><span class="value">A coordinar con el operador</span></div>
            </div>
        </div>
        
        <div class="vch-detail-section">
            <div class="vch-detail-section-title">Resumen de Pago</div>
            <div class="vch-detail-grid">
                ${ahorro > 0 ? `<div class="vch-detail-row"><span class="label">Precio total</span><span class="value">$${fmt(precioLista)}</span></div>` : ''}
                ${ahorro > 0 ? `<div class="vch-detail-row"><span class="label" style="color:#10b981">Tu ahorro</span><span class="value" style="color:#10b981">-$${fmt(ahorro)}</span></div>` : ''}
                <div class="vch-detail-row"><span class="label">Pagado online (reserva)</span><span class="value big">$${fmt(totalPagado)}</span></div>
                ${saldoDestino > 0 ? `<div class="vch-detail-row"><span class="label">Saldo a coordinar</span><span class="value green">$${fmt(saldoDestino)}</span></div>` : ''}
                <div class="vch-detail-row"><span class="label">Estado</span><span class="value" style="color:#10b981">${r.estado || 'Confirmada'}</span></div>
            </div>
        </div>
        
        ${saldoDestino > 0 ? `
        <div class="vch-saldo-banner">
            <strong>Importante:</strong> el saldo de <strong>$${fmt(saldoDestino)}</strong> se coordina directamente con <strong>${operadorNombre}</strong>. Te indicará cuándo y cómo abonarlo (efectivo, transferencia u otros medios) al contactarte.
        </div>` : ''}
        
        <!-- Bonus Patagonia Puntos con QR (el TURISTA suma puntos) -->
        <div class="vch-bonus-card">
            <div class="vch-bonus-info">
                <div class="vch-bonus-label">RECOMPENSA DE VIAJERO</div>
                <div class="vch-bonus-title">Sumá Patagonia Puntos</div>
                <div class="vch-bonus-text">Escaneá este QR e iniciá sesión con tu email para sumar puntos a tu billetera y canjearlos en próximas reservas.</div>
                <div class="vch-bonus-pts">+5.000 pts</div>
            </div>
            <div class="vch-bonus-qr">
                <img src="${QR_PUNTOS_URL}" alt="QR Patagonia Puntos" crossorigin="anonymous">
            </div>
        </div>
    </div>
    
    <div class="vch-footer">
        <strong>Patagonia Experiencias</strong> · Plataforma de reservas turísticas patagónicas
        <div class="small">La Pampa · Río Negro · Neuquén · Chubut · Santa Cruz · Tierra del Fuego</div>
    </div>
</div>

<!-- ====== PÁGINA 2 ====== -->
<div class="vch-page">
    <div class="vch-header" style="padding: 18px 50px;">
        <div class="vch-header-row">
            <div>
                <div class="vch-brand" style="font-size:16px;">Patagonia<span class="light">Experiencias</span></div>
            </div>
            <div style="font-size:10px;letter-spacing:2px;opacity:.85;">CONTINUACIÓN — ${r.id || ''}</div>
        </div>
    </div>
    
    <div class="vch-terms-content">
        <h2 class="vch-terms-title">Próximos pasos</h2>
        <p class="vch-terms-subtitle">Lo que tenés que hacer ahora y el día de tu experiencia</p>
        
        <div class="vch-next-steps">
            <div class="vch-step-row">
                <div class="vch-step-number">1</div>
                <div class="vch-step-text"><strong>Esperá el contacto del operador.</strong> En las próximas 24-48 hs, ${operadorNombre} se va a comunicar para confirmar el punto de encuentro y detalles logísticos.</div>
            </div>
            <div class="vch-step-row">
                <div class="vch-step-number">2</div>
                <div class="vch-step-text"><strong>Guardá este voucher.</strong> Llevalo el día de la actividad — impreso o en tu celular. El operador puede pedirte que se lo muestres.</div>
            </div>
            <div class="vch-step-row">
                <div class="vch-step-number">3</div>
                <div class="vch-step-text"><strong>Llegá puntual al lugar acordado.</strong> Recomendamos llegar 15 min antes para no perderte nada.</div>
            </div>
            ${saldoDestino > 0 ? `
            <div class="vch-step-row">
                <div class="vch-step-number">4</div>
                <div class="vch-step-text"><strong>Coordiná el saldo de $${fmt(saldoDestino)} con el operador.</strong> ${operadorNombre} te indicará cuándo y cómo abonarlo (efectivo, transferencia u otros medios) cuando se contacte con vos.</div>
            </div>
            <div class="vch-step-row">
                <div class="vch-step-number">5</div>
                <div class="vch-step-text"><strong>Disfrutá la experiencia y dejanos tu reseña.</strong> Cuando vuelvas, ingresá a Patagonia Experiencias y compartí tu opinión.</div>
            </div>` : `
            <div class="vch-step-row">
                <div class="vch-step-number">4</div>
                <div class="vch-step-text"><strong>Disfrutá la experiencia y dejanos tu reseña.</strong> Cuando vuelvas, ingresá a Patagonia Experiencias y compartí tu opinión.</div>
            </div>`}
        </div>
        
        <h2 class="vch-terms-title">Términos y condiciones</h2>
        <p class="vch-terms-subtitle">${politica.nombre} · Aplicable a esta reserva</p>
        
        <div class="vch-terms-section">
            <h3>Cancelaciones</h3>
            <ul>
                ${politica.texto.map(linea => `<li>${linea}</li>`).join('')}
            </ul>
        </div>
        
        ${(r.terminosExcursion && r.terminosExcursion.replace(/<[^>]*>/g, '').trim()) ? `
        <div class="vch-terms-divider"></div>
        <div class="vch-terms-section">
            <h3>Condiciones de esta experiencia</h3>
            <div class="vch-terms-custom">${r.terminosExcursion}</div>
        </div>` : ''}
        
        <div class="vch-terms-divider"></div>
        
        ${saldoDestino > 0 ? `
        <div class="vch-terms-section">
            <h3>Saldo restante</h3>
            <p>El saldo restante se coordina y abona directamente al operador, no a Patagonia Experiencias. Cada operador define las formas de pago aceptadas (efectivo, transferencia u otros medios) y el momento del cobro. Patagonia Experiencias actúa como plataforma intermediaria de reservas y solo cobra la comisión correspondiente al monto reservado online.</p>
        </div>
        <div class="vch-terms-divider"></div>` : ''}
        
        <div class="vch-terms-section">
            <h3>Responsabilidad</h3>
            <p>La actividad es prestada por el operador independiente identificado en el voucher. Patagonia Experiencias no opera ni controla las actividades, pero verifica los prestadores que se incorporan a la plataforma. Cualquier reclamo sobre la actividad debe canalizarse primero con el operador, y luego con Patagonia Experiencias si no hubo respuesta.</p>
        </div>
        
        <div class="vch-terms-divider"></div>
        
        <div class="vch-terms-section">
            <h3>Modificaciones</h3>
            <p>Para modificar fecha, horario o cantidad de pasajeros, contactá directamente al operador con al menos 48 hs de anticipación. Las modificaciones quedan sujetas a disponibilidad.</p>
        </div>
        
        <div class="vch-terms-divider"></div>
        
        <div class="vch-terms-section">
            <h3>Datos personales</h3>
            <p>Los datos provistos en esta reserva se utilizan únicamente para la coordinación de la actividad y la comunicación entre operador y pasajero. No se ceden a terceros.</p>
        </div>
        
        <div style="margin-top:30px">
            <div class="vch-contact-box">
                <h3>¿Necesitás ayuda?</h3>
                <p>Si tenés alguna duda, problema con tu reserva o no pudiste contactar al operador, escribinos:</p>
                <div class="vch-contact-email">hola@patagoniaexperiencias.com</div>
            </div>
        </div>
    </div>
    
    <div class="vch-footer">
        <strong>Patagonia Experiencias</strong> · efe5 proyectos srl
        <div class="small">© ${new Date().getFullYear()} · patagoniaexperiencias.com · Documento generado automáticamente</div>
    </div>
</div>
        `;
    }
    
    // ========================================================================
    // GENERAR PDF
    // ========================================================================
    
    /**
     * Genera y descarga el PDF del voucher.
     * @param {Object} reserva - Documento de Firestore con todos los datos
     * @param {Object} perfilOperador - Perfil del prestador (para política de cancelación)
     * @param {Object} opciones - { nombreArchivo, autoDescargar }
     */
    async function generarVoucherPDF(reserva, perfilOperador, opciones = {}) {
        // Verificar que las librerías estén cargadas
        if (typeof html2canvas === 'undefined' || typeof window.jspdf === 'undefined') {
            console.error('Faltan librerías html2canvas o jspdf. Cargalas en la página.');
            alert('Error técnico: librerías de PDF no cargadas. Intentá refrescar la página.');
            return false;
        }
        
        const nombreArchivo = opciones.nombreArchivo || `Voucher-${reserva.id || 'reserva'}.pdf`;
        
        // 1. Crear contenedor invisible con el HTML del voucher
        const wrapper = document.createElement('div');
        wrapper.style.position = 'fixed';
        wrapper.style.top = '-9999px';
        wrapper.style.left = '0';
        wrapper.style.width = '794px';
        wrapper.style.background = 'white';
        wrapper.innerHTML = generarHTMLVoucher(reserva, perfilOperador);
        document.body.appendChild(wrapper);
        
        try {
            // Esperar a que la imagen QR se cargue (importante para html2canvas)
            const imgs = wrapper.querySelectorAll('img');
            await Promise.all(Array.from(imgs).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise((res) => {
                    img.onload = res;
                    img.onerror = res; // Si falla, seguir igual (no rompe el voucher)
                    setTimeout(res, 3000); // Timeout 3s por si la imagen no carga
                });
            }));
            
            // 2. Render página por página
            const paginas = wrapper.querySelectorAll('.vch-page');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            for (let i = 0; i < paginas.length; i++) {
                const page = paginas[i];
                const canvas = await html2canvas(page, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false
                });
                const imgData = canvas.toDataURL('image/jpeg', 0.92);
                
                if (i > 0) pdf.addPage();
                
                // A4: 210 × 297 mm. Imagen ocupa el ancho completo.
                const pdfW = 210;
                const pdfH = (canvas.height * pdfW) / canvas.width;
                pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
            }
            
            // 3. Descargar (o devolver blob según opciones)
            if (opciones.autoDescargar !== false) {
                pdf.save(nombreArchivo);
            }
            
            return pdf.output('blob');
            
        } catch (err) {
            console.error('Error generando PDF:', err);
            alert('No pudimos generar tu voucher. Por favor intentá de nuevo.\n\nError: ' + (err.message || 'desconocido'));
            return false;
        } finally {
            document.body.removeChild(wrapper);
        }
    }
    
    // Exponer al global
    window.generarVoucherPDF = generarVoucherPDF;
    
})();
