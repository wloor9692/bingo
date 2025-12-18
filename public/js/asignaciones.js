/**
 * Gestión de Asignaciones - Frontend
 */

let asignaciones = [];
let vendedores = [];
let eventos = [];

/**
 * Inicializar página
 */
async function inicializar() {
    await cargarVendedoresSelect();
    await cargarEventosSelect();
    await cargarAsignaciones();
    await cargarEstadisticas();

    // Actualizar cálculo de boletos al cambiar cantidad de hojas
    document.getElementById('cantidad_hojas')?.addEventListener('input', (e) => {
        const cantidad = parseInt(e.target.value) || 1;
        document.getElementById('total-boletos').textContent = cantidad * 8;
    });
}

/**
 * Cargar vendedores para select
 */
async function cargarVendedoresSelect() {
    try {
        const response = await API.getVendedores(1); // Solo activos
        vendedores = response.data.vendedores;

        const selects = ['filtro-vendedor', 'vendedor_id'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;

            const opciones = vendedores.map(v =>
                `<option value="${v.id}">${v.codigo} - ${v.nombre_completo}</option>`
            ).join('');

            if (selectId === 'filtro-vendedor') {
                select.innerHTML = '<option value="">Todos</option>' + opciones;
            } else {
                select.innerHTML = '<option value="">Seleccionar vendedor...</option>' + opciones;
            }
        });
    } catch (error) {
        console.error('Error al cargar vendedores:', error);
    }
}

/**
 * Cargar eventos para select
 */
async function cargarEventosSelect() {
    try {
        const response = await API.getEventos({ estado: 'activo' });
        eventos = response.data.eventos;

        const selects = ['filtro-evento', 'evento_id'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;

            const opciones = eventos.map(e =>
                `<option value="${e.id}">${e.nombre} - ${formatearFecha(e.fecha_evento)}</option>`
            ).join('');

            if (selectId === 'filtro-evento') {
                select.innerHTML = '<option value="">Todos</option>' + opciones;
            } else {
                select.innerHTML = '<option value="">Seleccionar evento...</option>' + opciones;
            }
        });
    } catch (error) {
        console.error('Error al cargar eventos:', error);
    }
}

/**
 * Cargar asignaciones
 */
async function cargarAsignaciones() {
    try {
        const filtros = {
            vendedor_id: document.getElementById('filtro-vendedor').value || null,
            evento_id: document.getElementById('filtro-evento').value || null,
            estado: document.getElementById('filtro-estado').value || null
        };

        const response = await API.getAsignaciones(filtros);
        asignaciones = response.data.asignaciones;

        mostrarAsignaciones(asignaciones);
    } catch (error) {
        mostrarToast('Error al cargar asignaciones: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * Mostrar asignaciones en la tabla
 */
function mostrarAsignaciones(lista) {
    const tbody = document.getElementById('tabla-asignaciones');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No hay asignaciones registradas
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(a => {
        const estadoBadge = {
            'asignado': 'badge-warning',
            'vendido': 'badge-success',
            'devuelto': 'badge-danger'
        }[a.estado] || 'badge-secondary';

        return `
            <tr>
                <td><strong>${a.codigo_hoja}</strong></td>
                <td>${a.vendedor_codigo} - ${escapeHTML(a.vendedor_nombre)}</td>
                <td>${escapeHTML(a.evento_nombre)}</td>
                <td>${formatearFecha(a.fecha_evento)}</td>
                <td>${a.total_boletos_hoja || 8} boletos</td>
                <td>
                    <span class="badge ${estadoBadge}">
                        ${a.estado.toUpperCase()}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn btn-sm btn-info" onclick="verDetalleHoja(${a.id})" title="Ver Detalle">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="imprimirHoja(${a.id})" title="Imprimir">
                        <i class="fas fa-print"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Cargar estadísticas
 */
async function cargarEstadisticas() {
    try {
        const filtros = {
            vendedor_id: document.getElementById('filtro-vendedor').value || null,
            evento_id: document.getElementById('filtro-evento').value || null
        };

        const response = await API.getEstadisticasAsignaciones(filtros);
        const stats = response.data;

        document.getElementById('stat-hojas').textContent = stats.total_hojas || 0;
        document.getElementById('stat-boletos').textContent = stats.total_boletos || 0;
        document.getElementById('stat-vendidos').textContent = stats.boletos_vendidos || 0;
        document.getElementById('stat-disponibles').textContent = stats.boletos_disponibles || 0;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Mostrar formulario de asignación
 */
function mostrarFormularioAsignacion() {
    document.getElementById('form-asignacion').reset();
    document.getElementById('formulario-asignacion').style.display = 'block';
}

/**
 * Ocultar formulario
 */
function ocultarFormularioAsignacion() {
    document.getElementById('formulario-asignacion').style.display = 'none';
    document.getElementById('form-asignacion').reset();
}

/**
 * Guardar asignación
 */
async function guardarAsignacion(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Convertir a números
    data.vendedor_id = parseInt(data.vendedor_id);
    data.evento_id = parseInt(data.evento_id);
    data.cantidad_hojas = parseInt(data.cantidad_hojas);

    if (!confirm(`¿Generar ${data.cantidad_hojas} hoja(s) (${data.cantidad_hojas * 8} boletos) para este vendedor?`)) {
        return false;
    }

    try {
        await API.crearAsignacion(data);
        mostrarToast('Asignación creada exitosamente', 'success');
        ocultarFormularioAsignacion();
        cargarAsignaciones();
        cargarEstadisticas();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }

    return false;
}

/**
 * Ver detalle de una hoja
 */
async function verDetalleHoja(id) {
    try {
        const response = await API.getAsignacion(id);
        const hoja = response.data;

        let detalle = `Hoja: ${hoja.codigo_hoja}\n`;
        detalle += `Vendedor: ${hoja.vendedor_nombre}\n`;
        detalle += `Evento: ${hoja.evento_nombre}\n\n`;
        detalle += `Boletos:\n`;

        hoja.boletos.forEach(b => {
            detalle += `${b.numero_boleto_hoja}. ${b.codigo_qr} - ${b.vendido == 1 ? 'VENDIDO' : 'Disponible'}\n`;
        });

        alert(detalle);
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Imprimir hoja
 */
async function imprimirHoja(id) {
    try {
        // TODO: Integrar con módulo de impresión PDF/QR
        mostrarToast('Función de impresión en desarrollo', 'info');
        console.log('Imprimir hoja ID:', id);
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', inicializar);
