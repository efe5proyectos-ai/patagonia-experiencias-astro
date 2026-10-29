// Prueba de /api/aike con Claude SIMULADO (no gasta API): verifica el circuito de herramientas,
// que las tarjetas salgan del catálogo real y los controles de seguridad.
import fs from 'node:fs';
const mod = await import('../functions/api/aike.js');
const catalogo = JSON.parse(fs.readFileSync('../dist/aike/catalogo.json','utf8'));
catalogo.experiencias.push({ id:'pinguinos-punta-tombo', titulo:'Pingüinera de Punta Tombo', destino:'Punta Tombo', regiones:[], categoria:'Excursiones', duracion:'Medio día', temporada:'Septiembre a abril', precio:95000, precioLista:null, sena:19000, proveedor:'X', imagen:'https://x/p.jpg', resumen:'Colonia de pingüinos de Magallanes', urlFicha:'https://patagoniaexperiencias.com/experiencias/pinguinos-punta-tombo/', urlReserva:'https://patagoniaexperiencias.com/patagonia-experiencias.html#tour/pinguinos-punta-tombo', pt:null });
let llamadas = []; let guion = [];
globalThis.fetch = async (url, opts={}) => {
  url = String(url);
  if (url.includes('/aike/catalogo.json')) return new Response(JSON.stringify(catalogo));
  if (url.includes('patagoniamagazine')) return new Response(JSON.stringify([{title:{rendered:'Temporada de ballenas 2026'},link:'https://patagoniamagazine.com.ar/ballenas/',excerpt:{rendered:'<p>Todo sobre...</p>'},date:'2026-10-01'}]));
  if (url.includes('/v1/messages')) { const body = JSON.parse(opts.body); llamadas.push(body); const r = guion.shift(); return new Response(JSON.stringify(r(body))); }
  throw new Error('fetch inesperado '+url);
};
const env = { ANTHROPIC_API_KEY: 'test' };
const pedir = async (mensajes, origen='https://patagoniaexperiencias.com', ip='1.1.1.1', e=env) => {
  const req = new Request('https://patagoniaexperiencias.com/api/aike', { method:'POST', headers:{ 'Content-Type':'application/json', Origin: origen, 'CF-Connecting-IP': ip }, body: JSON.stringify({ idioma:'es', mensajes }) });
  const r = await mod.onRequestPost({ request: req, env: e }); return { status: r.status, d: await r.json() };
};
let ok=0, mal=0; const t=(n,c)=>{ if(c){ok++;console.log('✔',n);} else {mal++;console.log('✘',n);} };

// 1) Conversación normal: busca → muestra (incluye un id inventado) → responde
guion = [
  () => ({ stop_reason:'tool_use', content:[{type:'text',text:''},{type:'tool_use',id:'t1',name:'buscar_experiencias',input:{consulta:'ballenas',destino:'Puerto Madryn'}},{type:'tool_use',id:'t2',name:'buscar_notas_magazine',input:{consulta:'ballenas'}}] }),
  (b) => ({ stop_reason:'tool_use', content:[{type:'tool_use',id:'t3',name:'mostrar_experiencias',input:{ids:['avistaje-ballenas-puerto-piramides','tour-inventado-xyz']}}] }),
  () => ({ stop_reason:'end_turn', content:[{type:'text',text:'¡Noviembre es ideal para ver **ballenas**! Te dejo la mejor opción.'}] }),
];
let r = await pedir([{rol:'user',texto:'quiero ver ballenas en noviembre'}]);
t('responde 200', r.status===200);
t('texto de la IA', r.d.texto.includes('ballenas'));
t('tarjeta con precio REAL del catálogo', r.d.tarjetas.length===1 && r.d.tarjetas[0].precio===catalogo.experiencias[0].precio);
t('descarta el tour inventado por la IA', !r.d.tarjetas.some(x=>x.id==='tour-inventado-xyz'));
t('trae nota de Magazine', r.d.notas.length===1 && r.d.notas[0].url.includes('patagoniamagazine'));
t('usa Haiku 4.5', llamadas[0].model==='claude-haiku-4-5');
t('le pasa el resultado de la búsqueda a la IA', JSON.stringify(llamadas[1].messages).includes('Avistaje de ballenas'));
t('instrucciones en voseo y con reglas', llamadas[0].system[0].text.includes('voseo') && llamadas[0].system[0].text.includes('Nunca escribas precios'));
t('prompt cacheado (más barato)', !!llamadas[0].system[0].cache_control);

// 2) No puede mostrar algo que no buscó antes
llamadas=[]; guion = [
  () => ({ stop_reason:'tool_use', content:[{type:'tool_use',id:'a',name:'mostrar_experiencias',input:{ids:['pinguinos-punta-tombo']}}] }),
  () => ({ stop_reason:'end_turn', content:[{type:'text',text:'ok'}] }),
];
r = await pedir([{rol:'user',texto:'pingüinos'}]);
t('sin búsqueda previa no muestra tarjetas', r.d.tarjetas.length===0);

// 3) Seguridad
r = await pedir([{rol:'user',texto:'hola'}], 'https://sitio-ajeno.com');
t('rechaza otros sitios', r.status===403);
r = await pedir([{rol:'user',texto:'hola'}], 'https://patagoniaexperiencias.com', '9.9.9.9', {});
t('sin clave configurada avisa y no rompe', r.status===503);
guion = Array.from({length:20},()=>()=>({stop_reason:'end_turn',content:[{type:'text',text:'ok'}]}));
let ultimo; for (let i=0;i<14;i++) ultimo = await pedir([{rol:'user',texto:'hola '+i}], 'https://patagoniaexperiencias.com', '7.7.7.7');
t('frena a quien manda muchos mensajes por minuto', ultimo.status===429);
llamadas=[]; guion=[()=>({stop_reason:'end_turn',content:[{type:'text',text:'ok'}]})];
r = await pedir(Array.from({length:40},(_,i)=>({rol:i%2?'aike':'user',texto:'x'.repeat(5000)})).concat([{rol:'user',texto:'último'}]), 'https://patagoniaexperiencias.com','2.2.2.2');
t('recorta historial largo y mensajes gigantes', llamadas[0].messages.length<=16 && llamadas[0].messages.every(m=>m.content.length<=1200));
console.log(`\n${ok} OK, ${mal} fallas`); process.exit(mal?1:0);
