/* =========================================================================
   FOOTER COMPARTIDO · Patagonia Experiencias
   -------------------------------------------------------------------------
   Footer único para todas las páginas públicas. Se inyecta por JavaScript
   para mantener UN SOLO lugar de edición.

   CÓMO USARLO en cualquier página:
     1. Poné donde quieras el footer:   <div id="patagonia-footer"></div>
     2. Antes de cerrar </body>:        <script src="footer.js"></script>

   Requisitos de la página (ya los tienen todas): Tailwind CDN + Font Awesome.

   PARA EDITAR EL FOOTER: cambiá solo este archivo y se actualiza en todas.
   ========================================================================= */
(function () {
    var anio = new Date().getFullYear();

    var html = `
    <footer class="bg-brand-oxford text-gray-400" style="background-color:#0a0a0a;">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                <!-- Columna marca -->
                <div class="col-span-1 lg:col-span-2">
                    <a href="patagonia-experiencias.html" class="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white" style="background-color:#E91E63;">
                            <i class="fa-solid fa-location-dot text-sm"></i>
                        </div>
                        <span class="font-bold text-xl text-white tracking-tight">Patagonia<span style="color:#E91E63;">Experiencias</span></span>
                    </a>
                    <p class="text-sm text-gray-400 max-w-sm mb-6 leading-relaxed">
                        Plataforma digital de reservas turísticas de la Patagonia. Conectando visitantes con las mejores experiencias locales del sur argentino.
                    </p>
                    <div class="flex gap-4 mb-8">
                        <a href="https://instagram.com/patagoniapuntos" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E91E63] transition-colors"><i class="fa-brands fa-instagram"></i></a>
                        <a href="https://facebook.com/patagoniapuntos/" target="_blank" rel="noopener" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#E91E63] transition-colors"><i class="fa-brands fa-facebook-f"></i></a>
                    </div>

                    <!-- Sellos de confianza -->
                    <div class="flex flex-wrap items-center gap-3">
                        <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                            <i class="fa-solid fa-lock text-emerald-400 text-xs"></i>
                            <span class="text-[10px] text-gray-300 uppercase tracking-widest font-semibold">Sitio Seguro HTTPS</span>
                        </div>
                        <div class="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                            <i class="fa-solid fa-shield-halved text-emerald-400 text-xs"></i>
                            <span class="text-[10px] text-gray-300 uppercase tracking-widest font-semibold">Solo Prestadores Habilitados</span>
                        </div>
                    </div>
                    <p class="text-[11px] text-gray-500 mt-3 max-w-sm leading-relaxed">
                        Trabajamos únicamente con prestadores y establecimientos legalmente habilitados. Cada experiencia está respaldada por un operador autorizado.
                    </p>
                </div>

                <!-- Columna soporte -->
                <div>
                    <h4 class="text-white font-bold mb-6 uppercase tracking-widest text-xs">Soporte</h4>
                    <ul class="space-y-3 text-sm">
                        <li><a href="https://wa.me/5492804356028" target="_blank" rel="noopener" class="hover:text-white transition-colors flex items-center gap-2"><i class="fa-brands fa-whatsapp" style="color:#E91E63;"></i> +54 9 2804 35-6028</a></li>
                        <li><a href="mailto:hola@patagoniaexperiencias.com" class="hover:text-white transition-colors flex items-center gap-2 break-all"><i class="fa-regular fa-envelope flex-shrink-0" style="color:#E91E63;"></i> <span>hola@patagoniaexperiencias.com</span></a></li>
                        <li><a href="manual-prestador.html" class="hover:text-white transition-colors flex items-center gap-2"><i class="fa-solid fa-book" style="color:#E91E63;"></i> Manual del Prestador</a></li>
                        <li><a href="ecosistema.html" class="hover:text-white transition-colors flex items-center gap-2"><i class="fa-solid fa-circle-info" style="color:#E91E63;"></i> Quiénes somos</a></li>
                    </ul>
                </div>

                <!-- Columna ecosistema + colaboradores -->
                <div>
                    <h4 class="text-white font-bold mb-6 uppercase tracking-widest text-xs">Ecosistema</h4>
                    <ul class="space-y-3 text-sm">
                        <li>
                            <a href="patagonia-experiencias.html" class="flex items-center gap-2 text-gray-300 hover:text-[#E91E63] transition-colors">
                                <i class="fa-solid fa-location-dot text-xs" style="color:#E91E63;"></i>
                                <span>Patagonia Experiencias</span>
                            </a>
                        </li>
                        <li>
                            <a href="guiadeviajeros.html" class="flex items-center gap-2 text-gray-300 hover:text-[#E91E63] transition-colors">
                                <i class="fa-solid fa-book-open text-xs" style="color:#E91E63;"></i>
                                <span>Guía de Viajeros</span>
                            </a>
                        </li>
                        <li>
                            <a href="https://patagoniamagazine.com.ar" target="_blank" rel="noopener" class="flex items-center gap-2 text-gray-300 hover:text-[#E91E63] transition-colors">
                                <i class="fa-solid fa-book-open text-xs" style="color:#E91E63;"></i>
                                <span>Patagonia Magazine</span>
                                <i class="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-60"></i>
                            </a>
                        </li>
                        <li>
                            <a href="https://tienda.patagoniapuntos.com" target="_blank" rel="noopener" class="flex items-center gap-2 text-gray-300 hover:text-[#E91E63] transition-colors">
                                <i class="fa-solid fa-coins text-xs" style="color:#E91E63;"></i>
                                <span>Patagonia Puntos</span>
                                <i class="fa-solid fa-arrow-up-right-from-square text-[9px] opacity-60"></i>
                            </a>
                        </li>
                    </ul>

                    <h4 class="text-white font-bold mt-8 mb-4 uppercase tracking-widest text-xs text-center md:text-left">Colaboradores</h4>
                    <div class="flex flex-wrap items-center justify-center md:justify-start gap-6 sm:gap-8">
                        <img src="./logo-cat-chubut.png" alt="CAT Chubut - Cámara de Turismo del Chubut" loading="lazy" class="h-12 sm:h-14 w-auto object-contain" />
                        <img src="./logo-agencia-chubut-turismo.png" alt="Agencia Chubut Turismo" loading="lazy" class="h-12 sm:h-14 w-auto object-contain" />
                    </div>
                </div>
            </div>

            <!-- Chubut Seguro · sistema contra la informalidad -->
            <div class="mb-12">
                <div class="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 sm:gap-6 max-w-2xl mx-auto sm:mx-0">
                    <img src="./chubutseguro.png" alt="Chubut Seguro - Turismo Formal" loading="lazy" class="h-14 sm:h-20 w-auto object-contain flex-shrink-0" />
                    <div class="text-center sm:text-left">
                        <p class="text-white font-bold text-sm mb-1">Sistema de promoción del turismo formal</p>
                        <p class="text-xs text-gray-400 leading-relaxed">
                            Patagonia Experiencias adhiere a <span class="text-amber-400 font-semibold">Chubut Seguro</span>, la iniciativa contra la informalidad turística en la provincia. Reservás siempre con prestadores registrados y habilitados.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Barra inferior -->
            <div class="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
                <div class="flex flex-col md:flex-row gap-1 md:gap-3 items-center">
                    <p>&copy; ${anio} Patagonia Experiencias. Todos los derechos reservados.</p>
                    <p class="text-gray-600">Powered by <span class="text-gray-400 font-semibold">Octopus</span> &amp; <span class="text-gray-400 font-semibold">efe5 proyectos</span></p>
                </div>
                <div class="flex gap-4">
                    <a href="terminos.html" class="hover:text-gray-300">Términos de Uso</a>
                    <a href="privacidad.html" class="hover:text-gray-300">Políticas de Privacidad</a>
                </div>
            </div>
        </div>
    </footer>`;

    function montar() {
        var cont = document.getElementById('patagonia-footer');
        if (cont && !cont.dataset.montado) {
            cont.innerHTML = html;
            cont.dataset.montado = '1';
            return true;
        }
        return false;
    }

    // Intento inmediato. Si el contenedor aún no existe (p.ej. lo monta React
    // después), reintenta unas cuantas veces hasta encontrarlo.
    if (!montar()) {
        var intentos = 0;
        var timer = setInterval(function () {
            intentos++;
            if (montar() || intentos > 40) clearInterval(timer); // ~6s máx
        }, 150);
        // También intenta cuando el DOM esté listo, por las dudas.
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', montar);
        }
    }
})();
