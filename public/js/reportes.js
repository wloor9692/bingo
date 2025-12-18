/**
 * Módulo de Reportes - Frontend
 */

/**
 * Inicializar
 */
async function inicializar() {
    await cargarEventosSelect();
    await cargarReportes();
}

/**
 * Cargar eventos para select
 */
async function cargarEventosSelect() {
    try {
        const response = await API.getEventos();
        const eventos = response.data.eventos;

        const select = document.getElementById('filtro-evento');
        const opciones = eventos.map(e =>
            `<option value="${e.id}">${e.nombre} - ${formatearFecha(e.fecha_evento)}</option>`
        ).join('');

        select.innerHTML = '<option value="">Todos los eventos</option>' + opciones;
    } catch (error) {
        console.error('Error al cargar eventos:', error);
    }
}

/**
 * Cargar reportes
 */
async function cargarReportes() {
    await cargarResumenGeneral();
    await cargarReporteEventos();
    await cargarReporteVendedores();
}

/**
 * Cargar resumen general
 */
async function cargarResumenGeneral() {
    try {
        const filtros = obtenerFiltros();

        // Obtener eventos
        const eventosResp = await API.getEventos(filtros);
        const eventos = eventosResp.data.eventos;

        // Obtener vendedores
        const vendedoresResp = await API.getVendedores(1);
        const vendedores = vendedoresResp.data.vendedores;

        // Calcular totales
        let totalIngresos = 0;
        let totalBoletosVendidos = 0;

        eventos.forEach(e => {
            totalBoletosVendidos += parseInt(e.boletos_vendidos) || 0;
            totalIngresos += (parseInt(e.boletos_vendidos) || 0) * parseFloat(e.precio_boleto);
        });

        // Actualizar UI
        document.getElementById('total-eventos').textContent = eventos.length;
        document.getElementById('ingresos-totales').textContent = formatearMoneda(totalIngresos);
        document.getElementById('boletos-vendidos').textContent = totalBoletosVendidos;
        document.getElementById('vendedores-activos').textContent = vendedores.length;
    } catch (error) {
        console.error('Error al cargar resumen:', error);
    }
}

/**
 * Cargar reporte de eventos
 */
async function cargarReporteEventos() {
    try {
        const filtros = obtenerFiltros();
        const response = await API.getEventos(filtros);
        const eventos = response.data.eventos;

        const tbody = document.getElementById('tabla-eventos-reporte');

        if (eventos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No hay datos</td></tr>';
            return;
        }

        tbody.innerHTML = eventos.map(e => {
            const boletosAsignados = parseInt(e.total_boletos) || 0;
            const boletosVendidos = parseInt(e.boletos_vendidos) || 0;
            const porcentaje = boletosAsignados > 0 ? ((boletosVendidos / boletosAsignados) * 100).toFixed(1) : 0;
            const ingresos = boletosVendidos * parseFloat(e.precio_boleto);
            const premio = parseFloat(e.premio_total) || 0;
            const ganancia = ingresos - premio;

            return `
                <tr>
                    <td><strong>${escapeHTML(e.nombre)}</strong></td>
                    <td>${formatearFecha(e.fecha_evento)}</td>
                    <td>${boletosAsignados}</td>
                    <td>${boletosVendidos}</td>
                    <td>
                        <span class="badge ${porcentaje > 75 ? 'badge-success' : porcentaje > 50 ? 'badge-warning' : 'badge-danger'}">
                            ${porcentaje}%
                        </span>
                    </td>
                    <td>${formatearMoneda(ingresos)}</td>
                    <td>${formatearMoneda(premio)}</td>
                    <td class="${ganancia >= 0 ? 'text-success' : 'text-danger'}">
                        <strong>${formatearMoneda(ganancia)}</strong>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar reporte de eventos:', error);
    }
}

/**
 * Cargar reporte de vendedores
 */
async function cargarReporteVendedores() {
    try {
        const response = await API.getVendedores();
        const vendedores = response.data.vendedores;

        const tbody = document.getElementById('tabla-vendedores-reporte');

        if (vendedores.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay datos</td></tr>';
            return;
        }

        // Obtener estadísticas de cada vendedor
        const vendedoresConStats = await Promise.all(
            vendedores.map(async v => {
                try {
                    const statsResp = await API.getEstadisticasVendedor(v.id);
                    return { ...v, stats: statsResp.data };
                } catch (error) {
                    return { ...v, stats: null };
                }
            })
        );

        tbody.innerHTML = vendedoresConStats.map(v => {
            if (!v.stats) {
                return `
                    <tr>
                        <td>${escapeHTML(v.nombre_completo)}</td>
                        <td>${v.codigo}</td>
                        <td colspan="5" class="text-center text-muted">Sin datos</td>
                    </tr>
                `;
            }

            const asignados = parseInt(v.stats.boletos_asignados) || 0;
            const vendidos = parseInt(v.stats.boletos_vendidos) || 0;
            const devueltos = parseInt(v.stats.boletos_devueltos) || 0;
            const efectividad = asignados > 0 ? ((vendidos / asignados) * 100).toFixed(1) : 0;
            const ingresos = parseFloat(v.stats.ingresos_totales) || 0;

            return `
                <tr>
                    <td><strong>${escapeHTML(v.nombre_completo)}</strong></td>
                    <td>${v.codigo}</td>
                    <td>${asignados}</td>
                    <td>${vendidos}</td>
                    <td>${devueltos}</td>
                    <td>
                        <span class="badge ${efectividad > 75 ? 'badge-success' : efectividad > 50 ? 'badge-warning' : 'badge-danger'}">
                            ${efectividad}%
                        </span>
                    </td>
                    <td>${formatearMoneda(ingresos)}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        console.error('Error al cargar reporte de vendedores:', error);
    }
}

/**
 * Obtener filtros
 */
function obtenerFiltros() {
    const eventoId = document.getElementById('filtro-evento').value;
    const desde = document.getElementById('filtro-desde').value;
    const hasta = document.getElementById('filtro-hasta').value;

    const filtros = {};

    if (eventoId) filtros.evento_id = eventoId;
    if (desde) filtros.fecha_desde = desde;
    if (hasta) filtros.fecha_hasta = hasta;

    return filtros;
}

/**
 * Exportar a Excel
 */
function exportarExcel() {
    mostrarToast('Función de exportar a Excel en desarrollo', 'info');
    // TODO: Implementar exportación a Excel
}

/**
 * Exportar a PDF
 */
function exportarPDF() {
    mostrarToast('Función de exportar a PDF en desarrollo', 'info');
    // TODO: Implementar exportación a PDF
}

/**
 * Imprimir reporte
 */
function imprimirReporte() {
    window.print();
}

// Inicializar
document.addEventListener('DOMContentLoaded', inicializar);
