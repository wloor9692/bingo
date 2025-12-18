/**
 * Gestión de Eventos - Frontend
 */

let eventos = [];
let eventoEditando = null;

/**
 * Cargar eventos desde la API
 */
async function cargarEventos() {
    try {
        const filtroEstado = document.getElementById('filtro-estado').value;
        const params = filtroEstado ? { estado: filtroEstado } : {};

        const response = await API.getEventos(params);
        eventos = response.data.eventos;

        mostrarEventos(eventos);
    } catch (error) {
        mostrarToast('Error al cargar eventos: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * Mostrar eventos en la tabla
 */
function mostrarEventos(lista) {
    const tbody = document.getElementById('tabla-eventos');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No hay eventos registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(e => {
        const estadoBadge = {
            'pendiente': 'badge-secondary',
            'activo': 'badge-success',
            'en_curso': 'badge-warning',
            'finalizado': 'badge-info',
            'cancelado': 'badge-danger'
        }[e.estado] || 'badge-secondary';

        const porcentajeVenta = e.total_boletos > 0
            ? ((e.boletos_vendidos / e.total_boletos) * 100).toFixed(1)
            : 0;

        return `
            <tr>
                <td><strong>${escapeHTML(e.nombre)}</strong></td>
                <td>${formatearFecha(e.fecha_evento)}</td>
                <td>${formatearMoneda(e.precio_boleto)}</td>
                <td>${formatearMoneda(e.premio_total)}</td>
                <td>
                    <span class="badge badge-info">${e.boletos_vendidos || 0} / ${e.total_boletos || 0}</span>
                    <small>(${porcentajeVenta}%)</small>
                </td>
                <td>
                    <span class="badge ${estadoBadge}">
                        ${e.estado.replace('_', ' ').toUpperCase()}
                    </span>
                </td>
                <td class="actions">
                    <button class="btn btn-sm btn-info" onclick="verEstadisticas(${e.id})" title="Estadísticas">
                        <i class="fas fa-chart-bar"></i>
                    </button>
                    ${e.estado === 'pendiente' || e.estado === 'activo' ? `
                        <button class="btn btn-sm btn-warning" onclick="editarEvento(${e.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                    ${e.estado === 'pendiente' ? `
                        <button class="btn btn-sm btn-success" onclick="cambiarEstadoEvento(${e.id}, 'activo')" title="Activar">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    ${e.estado === 'pendiente' ? `
                        <button class="btn btn-sm btn-danger" onclick="eliminarEvento(${e.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Filtrar eventos por búsqueda
 */
function filtrarEventos() {
    const busqueda = document.getElementById('buscar-evento').value.toLowerCase();

    const filtrados = eventos.filter(e =>
        e.nombre.toLowerCase().includes(busqueda) ||
        e.descripcion?.toLowerCase().includes(busqueda)
    );

    mostrarEventos(filtrados);
}

/**
 * Mostrar formulario para crear evento
 */
function mostrarFormularioEvento() {
    eventoEditando = null;
    document.getElementById('form-title').textContent = 'Nuevo Evento';
    document.getElementById('form-evento').reset();
    document.getElementById('evento-id').value = '';
    document.getElementById('formulario-evento').style.display = 'block';
}

/**
 * Ocultar formulario
 */
function ocultarFormularioEvento() {
    document.getElementById('formulario-evento').style.display = 'none';
    document.getElementById('form-evento').reset();
    eventoEditando = null;
}

/**
 * Editar evento
 */
async function editarEvento(id) {
    try {
        const response = await API.getEvento(id);
        const evento = response.data;

        eventoEditando = evento;

        document.getElementById('form-title').textContent = 'Editar Evento';
        document.getElementById('evento-id').value = evento.id;
        document.getElementById('nombre').value = evento.nombre;
        document.getElementById('descripcion').value = evento.descripcion || '';
        document.getElementById('fecha_evento').value = evento.fecha_evento;
        document.getElementById('precio_boleto').value = evento.precio_boleto;
        document.getElementById('premio_total').value = evento.premio_total;
        document.getElementById('estado').value = evento.estado;

        document.getElementById('formulario-evento').style.display = 'block';
    } catch (error) {
        mostrarToast('Error al cargar evento: ' + error.message, 'error');
    }
}

/**
 * Guardar evento (crear o actualizar)
 */
async function guardarEvento(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    delete data.id;

    try {
        const id = document.getElementById('evento-id').value;

        if (id) {
            await API.actualizarEvento(id, data);
            mostrarToast('Evento actualizado exitosamente', 'success');
        } else {
            await API.crearEvento(data);
            mostrarToast('Evento creado exitosamente', 'success');
        }

        ocultarFormularioEvento();
        cargarEventos();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }

    return false;
}

/**
 * Cambiar estado del evento
 */
async function cambiarEstadoEvento(id, estado) {
    if (!confirm(`¿Cambiar estado del evento a ${estado}?`)) return;

    try {
        await API.cambiarEstadoEvento(id, estado);
        mostrarToast('Estado actualizado', 'success');
        cargarEventos();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Eliminar evento
 */
async function eliminarEvento(id) {
    if (!confirm('¿Está seguro de eliminar este evento? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        await API.eliminarEvento(id);
        mostrarToast('Evento eliminado exitosamente', 'success');
        cargarEventos();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Ver estadísticas del evento
 */
async function verEstadisticas(id) {
    try {
        const response = await API.getEstadisticasEvento(id);
        const stats = response.data;

        alert(`Estadísticas del Evento\n\n` +
              `Boletos Asignados: ${stats.total_boletos}\n` +
              `Boletos Vendidos: ${stats.boletos_vendidos}\n` +
              `Boletos Devueltos: ${stats.boletos_devueltos}\n` +
              `Ingresos Totales: ${formatearMoneda(stats.ingresos_totales)}\n` +
              `Premio Total: ${formatearMoneda(stats.premio_total)}\n` +
              `Ganancia Neta: ${formatearMoneda(stats.ganancia_neta)}\n` +
              `Vendedores Activos: ${stats.vendedores_activos}`);
    } catch (error) {
        mostrarToast('Error al obtener estadísticas: ' + error.message, 'error');
    }
}

// Cargar eventos al iniciar
document.addEventListener('DOMContentLoaded', cargarEventos);
