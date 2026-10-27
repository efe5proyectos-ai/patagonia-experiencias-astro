import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import firebase from 'firebase/compat/app'; import 'firebase/compat/firestore';
import fs from 'node:fs';
const RULES = process.argv[2];
const env = await initializeTestEnvironment({ projectId:'patagonia-experiencias', firestore:{ rules: fs.readFileSync(RULES,'utf8'), host:'127.0.0.1', port:8080 }});
const D='artifacts/patagonia-experiencias-app/public/data';
const inc=n=>firebase.firestore.FieldValue.increment(n), arrU=x=>firebase.firestore.FieldValue.arrayUnion(x);
await env.withSecurityRulesDisabled(async c=>{ const db=c.firestore();
  await db.doc(`${D}/solicitudes_prestadores/prest1`).set({nombreFantasia:'Excursiones Sur', estado:'activo', plan:'Esencial', cuit:'30-1', comisionOverride:20, userId:'prest1', emailContacto:'prest1@gmail.com'});
  await db.doc(`${D}/solicitudes_prestadores/autoIdAdmin`).set({nombreFantasia:'Cargada por admin', estado:'activo', plan:'Esencial', origen:'admin_manual', emailContacto:'Agencia2@Gmail.com'});
  await db.doc(`${D}/tours/t1`).set({titulo:'Ballenas', precio:100000, proveedorId:'prest1', activo:true, visitas:10, likesReales:3, pausadoPorAdmin:true});
  await db.doc(`${D}/codigos_descuento/auto1`).set({codigo:'VERANO', usosActuales:5, emailsUsados:['a@b.com']});
  await db.doc(`${D}/codigos_descuento/auto2`).set({codigo:'OTRO', usosActuales:0, emailsUsados:[]});
  await db.doc(`${D}/reservas/r1`).set({clienteEmail:'Turista@gmail.com', tourId:'t1', proveedorId:'prest1', estado:'Pendiente de pago', precio:20000});
  await db.doc(`${D}/reservas/raike`).set({clienteEmail:'x@y.com', tourId:'paquete_aike', origen:'aike', tipo:'paquete_aike', estado:'Pendiente de pago'});
  await db.doc(`${D}/banners/b1`).set({activo:true, impresiones:0, clicks:0, contenido:'<p>hola</p>'});
  await db.doc(`${D}/articulos/a1`).set({titulo:'Nota', lecturas:0, likes:4});
  await db.doc(`${D}/notificaciones/n1`).set({destinatarioUid:'prest1', tipo:'x', leida:false});
  await db.doc(`${D}/resenas/res1`).set({tourId:'t1', proveedorId:'prest1', estado:'aprobada', texto:'muy bueno todo'});
});
const user=(uid,email)=>env.authenticatedContext(uid,{email,email_verified:true,firebase:{sign_in_provider:'google.com'}}).firestore();
const prest=user('prest1','prest1@gmail.com'), extra=user('cualquiera','random@gmail.com'), turista=user('tur1','Turista@gmail.com');
const nuevo=user('nuevo1','nuevo@gmail.com'), ag2=user('ag2uid','agencia2@gmail.com'), admin=user('adm','efe5proyectos@gmail.com');
const anon=env.authenticatedContext('anon',{firebase:{sign_in_provider:'anonymous'}}).firestore();
const nadie=env.unauthenticatedContext().firestore();
const A=[ // ataques: tienen que FALLAR
 ['Prestador se baja la comisión a 0%', ()=>prest.doc(`${D}/solicitudes_prestadores/prest1`).update({comisionOverride:0})],
 ['Prestador se cambia el plan', ()=>prest.doc(`${D}/solicitudes_prestadores/prest1`).update({plan:'Premium'})],
 ['Prestador se habilita WhatsApp solo', ()=>prest.doc(`${D}/solicitudes_prestadores/prest1`).update({whatsappHabilitadoAdmin:true})],
 ['Cuenta Google se da de alta ACTIVA', ()=>extra.doc(`${D}/solicitudes_prestadores/cualquiera`).set({nombreFantasia:'Trucho', estado:'activo', plan:'Premium'})],
 ['Cuenta Google se da de alta sin estado (cuenta como activa)', ()=>extra.doc(`${D}/solicitudes_prestadores/cualquiera`).set({nombreFantasia:'Trucho'})],
 ['Cuenta Google se da de alta con comisión especial', ()=>extra.doc(`${D}/solicitudes_prestadores/cualquiera`).set({nombreFantasia:'T', estado:'pendiente', comisionOverride:0})],
 ['Cuenta Google crea la ficha de OTRO', ()=>extra.doc(`${D}/solicitudes_prestadores/otroUid`).set({nombreFantasia:'X', estado:'pendiente'})],
 ['Cuenta Google edita ficha ajena', ()=>extra.doc(`${D}/solicitudes_prestadores/prest1`).update({nombreFantasia:'Hackeado'})],
 ['Cuenta Google publica un tour sin ser prestador', ()=>extra.doc(`${D}/tours/spam`).set({titulo:'Spam', precio:1, proveedorId:'cualquiera', activo:true})],
 ['Prestador crea tour con puntos/descuento del admin', ()=>prest.collection(`${D}/tours`).add({titulo:'X', precio:1, proveedorId:'prest1', puntosPorReserva:99999})],
 ['Prestador se reactiva un tour pausado por el admin', ()=>prest.doc(`${D}/tours/t1`).update({pausadoPorAdmin:false})],
 ['Prestador le pasa su tour a otro', ()=>prest.doc(`${D}/tours/t1`).update({proveedorId:'otroUid'})],
 ['Visitante infla visitas', ()=>anon.doc(`${D}/tours/t1`).update({visitas:999999})],
 ['Visitante cambia precio vía contador', ()=>anon.doc(`${D}/tours/t1`).update({visitas:inc(1), precio:1})],
 ['Visitante lista TODOS los códigos', ()=>nadie.collection(`${D}/codigos_descuento`).get()],
 ['Cuenta Google resetea usos de un código', ()=>extra.doc(`${D}/codigos_descuento/auto1`).update({usosActuales:0, emailsUsados:[]})],
 ['Turista crea reserva ya PAGADA', ()=>turista.collection(`${D}/reservas`).add({clienteEmail:'turista@gmail.com', tourId:'t1', estado:'Pagado', precio:1})],
 ['Turista cambia el precio de su reserva', ()=>turista.doc(`${D}/reservas/r1`).update({precio:1})],
 ['Prestador cambia el precio de una reserva', ()=>prest.doc(`${D}/reservas/r1`).update({precio:1})],
 ['Visitante pisa un banner con HTML', ()=>anon.doc(`${D}/banners/b1`).update({contenido:'<img src=x onerror=alert(1)>'})],
 ['Visitante pone 1 millón de clics', ()=>anon.doc(`${D}/banners/b1`).update({clicks:1000000})],
 ['Visitante lee ventas de guías', ()=>nadie.collection(`${D}/ventas_guias`).get()],
 ['Prestador borra notificación ajena', ()=>extra.doc(`${D}/notificaciones/n1`).delete()],
];
const F=[ // flujos reales: tienen que FUNCIONAR
 ['preregistro CAT Chubut (alta)', ()=>nuevo.doc(`${D}/solicitudes_prestadores/nuevo1`).set({empresa:'E', responsable:'R', email:'nuevo@gmail.com', origen:'catchubut', campania:'CAT_CHUBUT_2026', plan:'esencial', bonificado:true, mesesBonificados:6, minExcursiones:5, comisionPct:20, dentroDelPlazo:true, estado:'preregistro', userId:'nuevo1', uid:'nuevo1'},{merge:true})],
 ['registro-agencias (alta)', ()=>user('n2','n2@gmail.com').doc(`${D}/solicitudes_prestadores/n2`).set({empresa:'E', origen:'registro_agencias', campania:'REGISTRO_AGENCIAS_2026', organizacion:'directo', plan:'esencial', bonificado:false, comisionPct:20, estado:'pendiente_revision', beneficios:[{t:'x',estado:'pendiente'}], userId:'n2', uid:'n2'},{merge:true})],
 ['prestadores.html (alta con plan elegido)', ()=>user('n3','n3@gmail.com').doc(`${D}/solicitudes_prestadores/n3`).set({razonSocial:'RS', cuit:'30-2', plan:'crecimiento', cicloFacturacion:'mensual', estado:'pendiente', userId:'n3'})],
 ['registro-agencias sobre ficha cargada por el admin (por email)', ()=>ag2.doc(`${D}/solicitudes_prestadores/autoIdAdmin`).set({empresa:'E2', whatsapp:'123', userId:'ag2uid', uid:'ag2uid', aceptaComision:true},{merge:true})],
 ['Panel: prestador edita su perfil', ()=>prest.doc(`${D}/solicitudes_prestadores/prest1`).set({nombreFantasia:'Excursiones Sur SRL', descripcion:'x', logoUrl:'u', uid:'prest1'},{merge:true})],
 ['Panel: Club Partners suma puntos', ()=>prest.doc(`${D}/solicitudes_prestadores/prest1`).update({puntosReputacion:150, tier:'plata', 'accionesUnicas.crear_tour':true})],
 ['Panel: actividad', ()=>prest.doc(`${D}/solicitudes_prestadores/prest1`).update({ultimaConexion:'hoy', historialActividad:[{tipo:'login'}]})],
 ['Panel: prestador carga un tour', ()=>prest.collection(`${D}/tours`).add({titulo:'Pingüinos', precio:50000, comisionExtra:25, proveedorId:'prest1', activo:true, rating:5, reviews:0, editadoPorRol:'agencia'})],
 ['Panel: prestador edita precio de su tour', ()=>prest.doc(`${D}/tours/t1`).update({precio:120000, titulo:'Ballenas Premium', proveedorId:'prest1', editadoPorRol:'agencia'})],
 ['Panel: prestador pausa su tour', ()=>prest.doc(`${D}/tours/t1`).update({activo:false})],
 ['Admin reactiva tour', ()=>admin.doc(`${D}/tours/t1`).update({pausadoPorAdmin:false, activo:true})],
 ['Admin cambia comisión del prestador', ()=>admin.doc(`${D}/solicitudes_prestadores/prest1`).update({comisionOverride:15, estado:'activo'})],
 ['App: visita (+1)', ()=>anon.doc(`${D}/tours/t1`).update({visitas:inc(1), 'visitasPorMes.2026-10':inc(1)})],
 ['App: like (+1)', ()=>anon.doc(`${D}/tours/t1`).update({likesReales:inc(1)})],
 ['App: lee tours y prestadores', ()=>nadie.collection(`${D}/tours`).get().then(()=>nadie.collection(`${D}/solicitudes_prestadores`).get())],
 ['App: busca código VERANO', ()=>anon.collection(`${D}/codigos_descuento`).where('codigo','==','VERANO').limit(1).get()],
 ['App: usa código (+1 y email)', ()=>turista.doc(`${D}/codigos_descuento/auto1`).update({usosActuales:inc(1), emailsUsados:arrU('turista@gmail.com')})],
 ['App: turista crea reserva', ()=>turista.collection(`${D}/reservas`).add({clienteEmail:'Turista@gmail.com', tourId:'t1', proveedorId:'prest1', estado:'Pendiente de pago', total:20000})],
 ['App: turista crea reserva en destino', ()=>turista.collection(`${D}/reservas`).add({clienteEmail:'Turista@gmail.com', tourId:'t1', estado:'Pendiente (En destino)'})],
 ['App: "Mis reservas" del turista', ()=>turista.collection(`${D}/reservas`).where('clienteEmail','==','Turista@gmail.com').get()],
 ['pago-confirmado: marca Pagado', ()=>turista.doc(`${D}/reservas/r1`).update({estado:'Pagado', paymentId:'123', fechaPago:'hoy'})],
 ['pago-confirmado: puntos y avisos', ()=>turista.doc(`${D}/reservas/r1`).update({puntosSumados:500, notificacionesEnviadas:true, fechaNotificaciones:'hoy'})],
 ['Panel: prestador confirma pago en destino', ()=>prest.doc(`${D}/reservas/r1`).update({estado:'Pagado', fechaConfirmacionPago:'hoy', confirmadoPor:'prest1@gmail.com'})],
 ['Panel: reservas del prestador', ()=>prest.collection(`${D}/reservas`).where('proveedorId','==','prest1').get()],
 ['AIKE: crea reserva (anónimo)', ()=>anon.collection(`${D}/reservas`).add({clienteEmail:'x@y.com', tourId:'paquete_aike', tipo:'paquete_aike', origen:'aike', estado:'Pendiente de pago'})],
 ['AIKE: circuito de pago', ()=>nadie.doc(`${D}/reservas/raike`).update({estado:'Pagado', paymentId:'9'})],
 ['App: reseña pendiente', ()=>turista.collection(`${D}/resenas`).add({tourId:'t1', usuarioId:'tur1', usuarioEmail:'Turista@gmail.com', estado:'pendiente', rating:5, texto:'Excelente salida'})],
 ['Panel: responde reseña', ()=>prest.doc(`${D}/resenas/res1`).update({respuestaPrestador:'Gracias!', fechaRespuesta:'hoy'})],
 ['App: impresión de banner (+1)', ()=>anon.doc(`${D}/banners/b1`).update({impresiones:inc(1)})],
 ['App: clic de banner (+1)', ()=>anon.doc(`${D}/banners/b1`).update({clicks:inc(1)})],
 ['App: lectura de nota (+1)', ()=>anon.doc(`${D}/articulos/a1`).update({lecturas:inc(1)})],
 ['App: like de nota (+1 / -1)', ()=>anon.doc(`${D}/articulos/a1`).update({likes:inc(1)}).then(()=>anon.doc(`${D}/articulos/a1`).update({likes:inc(-1)}))],
 ['Panel: borra su notificación', ()=>prest.doc(`${D}/notificaciones/n1`).delete()],
 ['Push: suscripción', ()=>anon.doc(`${D}/push_turistas/tok1`).set({token:'tok1', activo:true},{merge:true})],
 ['Admin edita banner', ()=>admin.doc(`${D}/banners/b1`).update({contenido:'<p>nuevo</p>'})],
];
let malA=0, malF=0;
console.log('── ATAQUES (deben quedar cerrados)');
for (const [n,f] of A){ try{ await f(); malA++; console.log('  ABIERTO ✘', n);}catch(e){ console.log('  cerrado ✔', n);} }
console.log('── FLUJOS REALES (deben funcionar)');
for (const [n,f] of F){ try{ await f(); console.log('  funciona ✔', n);}catch(e){ malF++; console.log('  ROTO     ✘', n, '→', String(e.message).slice(0,90));} }
console.log(`\nAtaques abiertos: ${malA}/${A.length} · Flujos rotos: ${malF}/${F.length}`);
await env.cleanup();
