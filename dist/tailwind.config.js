/* Configuración de Tailwind para compilar las guías.
   "content" apunta a los archivos FUENTE: de ahí saca las clases a incluir.
   Los colores son los mismos que usa el resto del ecosistema. */
module.exports = {
  content: [
    './calendario-fauna-FUENTE.html',
    './que-hacer-patagonia-FUENTE.html'
  ],
  theme: { extend: {
    fontFamily: { sans:['Inter','sans-serif'], title:['Montserrat','sans-serif'] },
    colors: { brand: {
      fuchsia:'#E91E63', fuchsiaDark:'#C2185B', night:'#0b1220',
      dark:'#0f172a', oxford:'#1e293b', bg:'#f6f7f9', line:'#e8ebf0'
    }}
  }}
}
