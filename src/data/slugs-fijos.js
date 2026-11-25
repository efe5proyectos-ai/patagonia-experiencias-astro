// ─────────────────────────────────────────────────────────────
// URLs YA INDEXADAS QUE NO SE MUEVEN DE FICHA
//
// `conSlugsUnicos` resuelve el choque de dos prestadores con el mismo título
// quedándose con **el último del grupo en el orden en que llegan los tours**,
// porque es el mismo criterio con el que Astro resolvía el choque antes del
// 02/11/2026 y así ninguna URL ya indexada cambiaba de ficha.
//
// Ese criterio tiene un agujero, encontrado el 25/11/2026: el orden de llegada
// es el orden de los IDs de documento de Firestore, no el de publicación. Si
// el admin carga una ficha nueva con el mismo título y su ID ordena **después**
// del de la ficha que hoy tiene la URL limpia, la ficha nueva se queda con esa
// URL y la vieja se va a `{slug}-{prestador}`. O sea: una dirección indexada
// —con su meta description, su traducción al portugués y su historia en
// Google— pasa a mostrar el tour de otro prestador.
//
// Caso real: el 24/11/2026 el admin publicó "Parque Nacional Tierra del Fuego"
// de All patagonia (`wcBT3PyU5H1ly403nSNe`), que ordena después del de Noelia
// Ferrario (`OlG4wkZ16iYXYS5oiHSv`), dueño de
// `/experiencias/parque-nacional-tierra-del-fuego/` y de
// `/pt-br/experiencias/passeio-parque-nacional-tierra-del-fuego-ushuaia/`.
//
// Esta tabla ancla el slug al `tourId` que lo tiene hoy publicado. Clave: el
// slug limpio; valor: el ID del tour en Firestore. Si el tour anclado no está
// en el grupo (se despublicó o se borró), la tabla no hace nada y vuelve a
// mandar el orden de llegada.
//
// Cuándo se suma una entrada: cuando el barrido avisa que una ficha nueva le
// saca la URL limpia a una ya indexada. Nunca para "mejorar" un slug: mover
// una URL indexada pide un 301 y es otra decisión.
// ─────────────────────────────────────────────────────────────
export default {
  // Noelia Ferrario — medio día, 08:00 a 13:30, Bahía Lapataia.
  'parque-nacional-tierra-del-fuego': 'OlG4wkZ16iYXYS5oiHSv',
};
