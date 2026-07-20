/*
  Club Partners Helper · Sprint 35 Fase 2.1
  VERSIÓN: 2026-05-15-v4-escritura-dual
  -----------------------------------------------------------------
  Sistema centralizado para aplicar puntos de reputación al prestador
  según la configuración guardada en /config/club_partners.
  
  Lo usan (después de Fase 2.2+):
    - dashboard-prestadores.html (cuando confirma cobro, responde reseña, etc.)
    - patagonia-experiencias.html (cuando se crea reserva, etc.)
    - admin-master.html (cuando admin valida algo)
  
  ARQUITECTURA:
    - Lee config UNA VEZ al cargar (cache en memoria)
    - Aplica idempotencia (no permite duplicados)
    - Registra cada acción en /historial_puntos (auditoría completa)
    - Recalcula tier automáticamente cuando cambian puntos
  
  Requiere que la página tenga inicializado:
    - firebase (compat v9+)
    - window.db = firebase.firestore()
    - window.auth = firebase.auth()
    - window.appId con el appId del proyecto
  
  USO (después de Fase 2.2):
    await window.ClubPartners.aplicarAccion({
        accionId: 'crear_tour',
        proveedorUid: 'abc123',
        metadata: { tourId: 'xyz' }
    });
*/

(function() {
    'use strict';
    
    // Default config (igual al de admin-master.html, por si no carga Firestore)
    const CLUB_PARTNERS_DEFAULT = {
        acciones: {
            completar_perfil:       { puntos: 50,   activo: true,  descripcion: 'Completar perfil', categoria: 'setup' },
            subir_logo:             { puntos: 30,   activo: true,  descripcion: 'Subir logo', categoria: 'setup' },
            descripcion_larga:      { puntos: 20,   activo: true,  descripcion: 'Descripción del negocio >100 caracteres', categoria: 'setup' },
            crear_tour:             { puntos: 100,  activo: true,  descripcion: 'Por cada tour publicado', categoria: 'tours' },
            tour_con_foto:          { puntos: 20,   activo: true,  descripcion: 'Tour con foto', categoria: 'tours' },
            tour_con_video:         { puntos: 50,   activo: true,  descripcion: 'Tour con video', categoria: 'tours' },
            tour_descripcion_larga: { puntos: 30,   activo: true,  descripcion: 'Tour con descripción >200 caracteres', categoria: 'tours' },
            tour_coords_gps:        { puntos: 20,   activo: true,  descripcion: 'Tour con coordenadas GPS', categoria: 'tours' },
            recibir_reserva:        { puntos: 20,   activo: true,  descripcion: 'Por cada reserva recibida', categoria: 'reservas' },
            confirmar_cobro:        { puntos: 200,  activo: true,  descripcion: 'Confirmar cobro saldo', categoria: 'reservas' },
            tour_completado_ok:     { puntos: 100,  activo: false, descripcion: 'Tour completado OK', categoria: 'reservas' },
            recibir_resena_buena:   { puntos: 30,   activo: true,  descripcion: 'Recibir reseña 4+ estrellas', categoria: 'resenas' },
            responder_resena_24h:   { puntos: 50,   activo: true,  descripcion: 'Responder reseña <24hs', categoria: 'resenas' },
            responder_resena_7d:    { puntos: 20,   activo: true,  descripcion: 'Responder reseña <7d', categoria: 'resenas' },
            adherir_puntos:         { puntos: 100,  activo: true,  descripcion: 'Adherirse a Patagonia Puntos', categoria: 'comunidad' },
            eliminar_resena:        { puntos: -100, activo: true,  descripcion: 'Eliminar reseña (penalización)', categoria: 'penalizaciones' },
            cancelacion_culpable:   { puntos: -50,  activo: false, descripcion: 'Cancelación por culpa del prestador', categoria: 'penalizaciones' }
        },
        tiers: {
            bronze:   { nombre: 'Bronze',   pts_min: 0,    pts_max: 499,  boost_algoritmo: 1.00 },
            silver:   { nombre: 'Silver',   pts_min: 500,  pts_max: 1499, boost_algoritmo: 1.05 },
            gold:     { nombre: 'Gold',     pts_min: 1500, pts_max: 4999, boost_algoritmo: 1.10 },
            platinum: { nombre: 'Platinum', pts_min: 5000, pts_max: null, boost_algoritmo: 1.15 }
        }
    };
    
    // Acciones que son ONE-TIME (no se pueden repetir nunca)
    // Las otras requieren un ID en metadata para evitar duplicados
    const ACCIONES_ONE_TIME = [
        'completar_perfil',
        'subir_logo',
        'descripcion_larga',
        'adherir_puntos'
    ];
    
    // Cache en memoria
    let _config = null;
    let _configCargada = false;
    let _configPromise = null;  // para evitar carga doble si se llama en paralelo
    
    // ============================================================
    // Funciones auxiliares
    // ============================================================
    
    function _getDb() {
        if (typeof db !== 'undefined' && db) return db;
        if (typeof window.db !== 'undefined' && window.db) return window.db;
        throw new Error('[ClubPartners] db no está disponible (firebase no inicializado)');
    }
    
    function _getAppId() {
        if (typeof appId !== 'undefined' && appId) return appId;
        if (typeof window.appId !== 'undefined' && window.appId) return window.appId;
        return 'patagonia-experiencias-app';
    }
    
    function _getAuth() {
        if (typeof auth !== 'undefined' && auth) return auth;
        if (typeof window.auth !== 'undefined' && window.auth) return window.auth;
        return null;
    }
    
    function _logError(msg, err) {
        console.error('[ClubPartners] ' + msg, err || '');
    }
    
    function _logInfo(msg, data) {
        if (window.location.search.indexOf('debug=1') > -1) {
            console.log('[ClubPartners] ' + msg, data || '');
        }
    }
    
    // ============================================================
    // Cargar config desde Firestore (con cache)
    // ============================================================
    
    async function cargarConfig() {
        // Si ya está cargada, devolver del cache
        if (_configCargada && _config) return _config;
        
        // Si ya hay una carga en curso, esperar a esa misma promesa (evita doble fetch)
        if (_configPromise) return _configPromise;
        
        _configPromise = (async () => {
            try {
                const db = _getDb();
                const appId = _getAppId();
                const ref = db.collection('artifacts').doc(appId)
                    .collection('public').doc('data')
                    .collection('config').doc('club_partners');
                
                const snap = await ref.get();
                if (snap.exists) {
                    const data = snap.data();
                    // Merge defensivo con DEFAULT
                    _config = {
                        acciones: Object.assign({}, CLUB_PARTNERS_DEFAULT.acciones, data.acciones || {}),
                        tiers:    Object.assign({}, CLUB_PARTNERS_DEFAULT.tiers, data.tiers || {})
                    };
                } else {
                    // No existe el doc → usar DEFAULT silenciosamente
                    _logInfo('Config no existe en Firestore, usando DEFAULT');
                    _config = JSON.parse(JSON.stringify(CLUB_PARTNERS_DEFAULT));
                }
                _configCargada = true;
                _logInfo('Config cargada', _config);
                return _config;
            } catch (err) {
                _logError('Error cargando config, usando DEFAULT', err);
                _config = JSON.parse(JSON.stringify(CLUB_PARTNERS_DEFAULT));
                _configCargada = true;
                return _config;
            } finally {
                _configPromise = null;
            }
        })();
        
        return _configPromise;
    }
    
    // Invalidar cache (útil cuando admin cambia config)
    function invalidarCache() {
        _config = null;
        _configCargada = false;
        _configPromise = null;
    }
    
    // ============================================================
    // Calcular tier según puntos totales
    // ============================================================
    
    function calcularTier(puntosTotales, config) {
        const cfg = config || _config;
        if (!cfg || !cfg.tiers) return 'bronze';
        
        // Ordenar tiers por pts_min descendente y devolver el primero que cumple
        const tiersOrdenados = Object.entries(cfg.tiers)
            .map(([id, t]) => ({ id, ...t }))
            .sort((a, b) => b.pts_min - a.pts_min);
        
        for (const tier of tiersOrdenados) {
            if (puntosTotales >= tier.pts_min) {
                return tier.id;
            }
        }
        return 'bronze';
    }
    
    // ============================================================
    // Verificar idempotencia (¿la acción ya se aplicó?)
    // ============================================================
    
    async function _yaAplicada(proveedorUid, accionId, metadata) {
        const db = _getDb();
        const appId = _getAppId();
        
        // Tipo A: ONE_TIME → revisar campo accionesUnicas del doc del prestador
        if (ACCIONES_ONE_TIME.indexOf(accionId) > -1) {
            try {
                const provRef = db.collection('artifacts').doc(appId)
                    .collection('public').doc('data')
                    .collection('solicitudes_prestadores').doc(proveedorUid);
                const snap = await provRef.get();
                if (!snap.exists) return false;
                const data = snap.data();
                const acciones = data.accionesUnicas || {};
                return acciones[accionId] === true;
            } catch (err) {
                _logError('Error verificando idempotencia (one-time)', err);
                return false; // por las dudas, permitir aplicar (no bloquear por error)
            }
        }
        
        // Tipo B: REPETIBLE → buscar en historial_puntos por accionId + metadata id
        try {
            // Identificar qué campo de metadata usar como ID único
            const idMetadata = metadata && (metadata.tourId || metadata.reservaId || metadata.resenaId);
            if (!idMetadata) {
                // Sin ID en metadata = no podemos garantizar idempotencia
                _logError('Acción repetible sin ID en metadata, NO se valida idempotencia', { accionId, metadata });
                return false;
            }
            
            const histRef = db.collection('artifacts').doc(appId)
                .collection('public').doc('data')
                .collection('historial_puntos');
            
            const q = await histRef
                .where('proveedorUid', '==', proveedorUid)
                .where('accionId', '==', accionId)
                .where('metadataKey', '==', idMetadata)
                .limit(1)
                .get();
            
            return !q.empty;
        } catch (err) {
            _logError('Error verificando idempotencia (repetible)', err);
            return false;
        }
    }
    
    // ============================================================
    // Aplicar una acción (función PRINCIPAL del helper)
    // ============================================================
    
    async function aplicarAccion(params) {
        const { accionId, proveedorUid, metadata } = params || {};
        
        // Validaciones de entrada
        if (!accionId) {
            _logError('aplicarAccion: falta accionId');
            return { aplicado: false, motivo: 'falta_accionId' };
        }
        if (!proveedorUid) {
            _logError('aplicarAccion: falta proveedorUid');
            return { aplicado: false, motivo: 'falta_proveedorUid' };
        }
        
        try {
            // 1. Cargar config (cache)
            const cfg = await cargarConfig();
            const accion = cfg.acciones[accionId];
            
            // 2. Validar que la acción exista
            if (!accion) {
                _logError('aplicarAccion: accionId inexistente', accionId);
                return { aplicado: false, motivo: 'accion_inexistente' };
            }
            
            // 3. Validar que esté activa
            if (!accion.activo) {
                _logInfo('aplicarAccion: acción inactiva', accionId);
                return { aplicado: false, motivo: 'inactiva' };
            }
            
            // 4. Validar idempotencia
            const yaAplic = await _yaAplicada(proveedorUid, accionId, metadata);
            if (yaAplic) {
                _logInfo('aplicarAccion: ya aplicada', { accionId, metadata });
                return { aplicado: false, motivo: 'ya_aplicada' };
            }
            
            // 5. Leer puntos actuales del prestador
            const db = _getDb();
            const appId = _getAppId();
            const provRef = db.collection('artifacts').doc(appId)
                .collection('public').doc('data')
                .collection('solicitudes_prestadores').doc(proveedorUid);
            
            const provSnap = await provRef.get();
            if (!provSnap.exists) {
                _logError('aplicarAccion: prestador no encontrado', proveedorUid);
                return { aplicado: false, motivo: 'prestador_no_encontrado' };
            }
            
            const provData = provSnap.data();
            const puntosAntes = provData.puntosReputacion || 0;
            const puntosDespues = Math.max(0, puntosAntes + accion.puntos); // nunca puntos negativos totales
            const tierAntes = provData.tier || 'bronze';
            const tierDespues = calcularTier(puntosDespues, cfg);
            
            // 6. Actualizar prestador en AMBOS paths atómicamente
            //
            // Sprint 35 Fase 2.2 (15/05/2026): escritura dual.
            // ----------------------------------------------------------------
            // El dashboard del prestador lee `puntosReputacion` y `tier` del
            // path B (`/users/{uid}/perfil/datos`), pero el helper venía
            // escribiendo solo en path A (`solicitudes_prestadores/{uid}`),
            // así que la pantalla nunca reflejaba los puntos sumados.
            //
            // Solución: escribir en ambos paths con WriteBatch.
            // - Path A recibe: puntosReputacion, tier, accionesUnicas (campo
            //   interno del Club Partners)
            // - Path B recibe SOLO: puntosReputacion, tier (campos que el
            //   dashboard renderiza). accionesUnicas se queda solo en A.
            //
            // El batch es atómico: o se graban los dos, o ninguno.
            // En path B se usa set({merge: true}) para no romper si el doc
            // todavía no existe (algunos prestadores nuevos).
            
            const updatePrestadorA = {
                puntosReputacion: puntosDespues,
                tier: tierDespues
            };
            
            const updatePrestadorB = {
                puntosReputacion: puntosDespues,
                tier: tierDespues
            };
            
            // Si es one-time, marcar en accionesUnicas SOLO en path A (campo interno)
            if (ACCIONES_ONE_TIME.indexOf(accionId) > -1) {
                updatePrestadorA['accionesUnicas.' + accionId] = true;
            }
            
            // Referencia al path B (perfil que ve el dashboard)
            const perfilRef = db.collection('artifacts').doc(appId)
                .collection('users').doc(proveedorUid)
                .collection('perfil').doc('datos');
            
            const batch = db.batch();
            batch.update(provRef, updatePrestadorA);
            // merge:true porque el doc puede no existir para prestadores nuevos
            batch.set(perfilRef, updatePrestadorB, { merge: true });
            
            await batch.commit();
            _logInfo('aplicarAccion: escritura dual OK', { puntosDespues, tierDespues });
            
            // 7. Registrar en historial (no bloqueante)
            try {
                const idMetadata = metadata && (metadata.tourId || metadata.reservaId || metadata.resenaId);
                const histRef = db.collection('artifacts').doc(appId)
                    .collection('public').doc('data')
                    .collection('historial_puntos');
                
                await histRef.add({
                    proveedorUid: proveedorUid,
                    accionId: accionId,
                    accionDescripcion: accion.descripcion,
                    puntos: accion.puntos,
                    puntosAntes: puntosAntes,
                    puntosDespues: puntosDespues,
                    tierAntes: tierAntes,
                    tierDespues: tierDespues,
                    metadataKey: idMetadata || null,
                    metadata: metadata || {},
                    fecha: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (histErr) {
                // Si falla el historial, NO revertir la suma de puntos (ya está hecha)
                // Solo loguear el error
                _logError('Error guardando historial (puntos sí se aplicaron)', histErr);
            }
            
            const subioDeTier = tierAntes !== tierDespues;
            _logInfo('aplicarAccion: aplicada con éxito', { accionId, puntos: accion.puntos, puntosAntes, puntosDespues, tierAntes, tierDespues, subioDeTier });
            
            return {
                aplicado: true,
                puntos: accion.puntos,
                puntosAntes: puntosAntes,
                puntosTotal: puntosDespues,
                tier: tierDespues,
                tierAntes: tierAntes,
                subioDeTier: subioDeTier
            };
            
        } catch (err) {
            _logError('aplicarAccion: error inesperado', err);
            return { aplicado: false, motivo: 'error', error: err.message };
        }
    }
    
    // ============================================================
    // Helpers públicos adicionales
    // ============================================================
    
    // Obtener config actual (útil para mostrar al prestador qué puede sumar)
    async function obtenerConfig() {
        return await cargarConfig();
    }
    
    // Obtener puntos y tier del prestador
    async function obtenerEstadoPrestador(proveedorUid) {
        try {
            const db = _getDb();
            const appId = _getAppId();
            const ref = db.collection('artifacts').doc(appId)
                .collection('public').doc('data')
                .collection('solicitudes_prestadores').doc(proveedorUid);
            const snap = await ref.get();
            if (!snap.exists) return { puntos: 0, tier: 'bronze', accionesUnicas: {} };
            const data = snap.data();
            return {
                puntos: data.puntosReputacion || 0,
                tier: data.tier || calcularTier(data.puntosReputacion || 0),
                accionesUnicas: data.accionesUnicas || {}
            };
        } catch (err) {
            _logError('obtenerEstadoPrestador: error', err);
            return { puntos: 0, tier: 'bronze', accionesUnicas: {} };
        }
    }
    
    // Obtener historial de un prestador (últimos N registros)
    async function obtenerHistorial(proveedorUid, limit) {
        try {
            const db = _getDb();
            const appId = _getAppId();
            const ref = db.collection('artifacts').doc(appId)
                .collection('public').doc('data')
                .collection('historial_puntos');
            
            const q = await ref
                .where('proveedorUid', '==', proveedorUid)
                .orderBy('fecha', 'desc')
                .limit(limit || 50)
                .get();
            
            return q.docs.map(d => ({ id: d.id, ...d.data() }));
        } catch (err) {
            _logError('obtenerHistorial: error', err);
            return [];
        }
    }
    
    // ============================================================
    // Exponer API pública
    // ============================================================
    
    window.ClubPartners = {
        // Función principal
        aplicarAccion: aplicarAccion,
        
        // Helpers de lectura
        obtenerConfig: obtenerConfig,
        obtenerEstadoPrestador: obtenerEstadoPrestador,
        obtenerHistorial: obtenerHistorial,
        
        // Utilidades
        calcularTier: calcularTier,
        invalidarCache: invalidarCache,
        
        // Constantes (lectura)
        ACCIONES_ONE_TIME: ACCIONES_ONE_TIME.slice(),
        DEFAULT_CONFIG: JSON.parse(JSON.stringify(CLUB_PARTNERS_DEFAULT))
    };
    
    _logInfo('ClubPartners helper cargado');
    console.log('[ClubPartners] v2026-05-15-v4-escritura-dual cargado correctamente. API disponible:', Object.keys(window.ClubPartners));
})();
