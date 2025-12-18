/**
 * Gestión de Devoluciones - Frontend
 */

let devoluciones = [];
let hojaVerificada = null;

/**
 * Inicializar
 */
async function inicializar() {
    await cargarVendedoresSelect();
    await cargarEventosSelect();
    await cargarDevoluciones();
    await cargarEstadisticas();
}

/**
 * Cargar vendedores para select
 */
async function cargarVendedoresSelect() {
    try {
        const response = await API.getVendedores();
        const vendedores = response.data.vendedores;

        const select = document.getElementById('filtro-vendedor');
        const opciones = vendedores.map(v =>
            `<option value="${v.id}">${v.codigo} - ${v.nombre_completo}</option>`
        ).join('');

        select.innerHTML = '<option value="">Todos</option>' + opciones;
    } catch (error) {
        console.error('Error al cargar vendedores:', error);
    }
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

        select.innerHTML = '<option value="">Todos</option>' + opciones;
    } catch (error) {
        console.error('Error al cargar eventos:', error);
    }
}

/**
 * Cargar devoluciones
 */
async function cargarDevoluciones() {
    try {
        const filtros = {
            vendedor_id: document.getElementById('filtro-vendedor').value || null,
            evento_id: document.getElementById('filtro-evento').value || null,
            fecha_desde: document.getElementById('filtro-desde').value || null,
            fecha_hasta: document.getElementById('filtro-hasta').value || null
        };

        const response = await API.getDevoluciones(filtros);
        devoluciones = response.data.devoluciones;

        mostrarDevoluciones(devoluciones);
    } catch (error) {
        mostrarToast('Error al cargar devoluciones: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * Mostrar devoluciones en la tabla
 */
function mostrarDevoluciones(lista) {
    const tbody = document.getElementById('tabla-devoluciones');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">
                    No hay devoluciones registradas
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(d => `
        <tr>
            <td><strong>${d.codigo_hoja}</strong></td>
            <td>${d.vendedor_codigo} - ${escapeHTML(d.vendedor_nombre)}</td>
            <td>${escapeHTML(d.evento_nombre)}</td>
            <td>
                <span class="badge badge-success">${d.boletos_vendidos}</span>
            </td>
            <td>
                <span class="badge badge-warning">${d.boletos_devueltos}</span>
            </td>
            <td>${formatearFecha(d.fecha_devolucion)}</td>
            <td class="actions">
                <button class="btn btn-sm btn-info" onclick="verDetalle(${d.id})" title="Ver Detalle">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Cargar estadísticas
 */
async function cargarEstadisticas() {
    try {
        const filtros = {
            evento_id: document.getElementById('filtro-evento').value || null,
            fecha_desde: document.getElementById('filtro-desde').value || null,
            fecha_hasta: document.getElementById('filtro-hasta').value || null
        };

        const response = await API.getEstadisticasDevoluciones(filtros);
        const stats = response.data;

        document.getElementById('stat-devoluciones').textContent = stats.total_devoluciones || 0;
        document.getElementById('stat-boletos-devueltos').textContent = stats.total_boletos_devueltos || 0;
        document.getElementById('stat-boletos-vendidos').textContent = stats.total_boletos_vendidos || 0;
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

/**
 * Mostrar formulario
 */
function mostrarFormularioDevolucion() {
    hojaVerificada = null;
    document.getElementById('form-devolucion').reset();
    document.getElementById('info-hoja').style.display = 'none';
    document.getElementById('btn-devolver').disabled = true;
    document.getElementById('formulario-devolucion').style.display = 'block';
}

/**
 * Ocultar formulario
 */
function ocultarFormularioDevolucion() {
    document.getElementById('formulario-devolucion').style.display = 'none';
    document.getElementById('form-devolucion').reset();
    hojaVerificada = null;
}

/**
 * Verificar si la hoja puede ser devuelta
 */
async function verificarHoja() {
    const codigo = document.getElementById('codigo_hoja').value.trim();

    if (!codigo) {
        mostrarToast('Ingrese el código de hoja', 'warning');
        return;
    }

    try {
        const response = await API.verificarDevolucion(codigo);
        const resultado = response.data;

        const infoDiv = document.getElementById('info-hoja');
        const detalleDiv = document.getElementById('detalle-hoja');

        if (resultado.puede) {
            hojaVerificada = resultado.hoja;
            detalleDiv.innerHTML = `
                <p><strong>Vendedor:</strong> ${resultado.hoja.vendedor_codigo}</p>
                <p><strong>Evento:</strong> ${resultado.hoja.evento_nombre}</p>
                <p><strong>Boletos Vendidos:</strong> ${resultado.boletos_vendidos}</p>
                <p><strong>Boletos a Devolver:</strong> ${resultado.boletos_devueltos}</p>
                <p class="badge badge-success">✓ Esta hoja puede ser devuelta</p>
            `;
            infoDiv.style.display = 'block';
            document.getElementById('btn-devolver').disabled = false;
            mostrarToast('Hoja verificada correctamente', 'success');
        } else {
            hojaVerificada = null;
            detalleDiv.innerHTML = `
                <p class="badge badge-danger">✗ ${resultado.razon}</p>
            `;
            infoDiv.style.display = 'block';
            document.getElementById('btn-devolver').disabled = true;
            mostrarToast(resultado.razon, 'error');
        }
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Guardar devolución
 */
async function guardarDevolucion(event) {
    event.preventDefault();

    if (!hojaVerificada) {
        mostrarToast('Primero verifique la hoja', 'warning');
        return false;
    }

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    if (!confirm('¿Confirmar devolución de esta hoja?')) {
        return false;
    }

    try {
        await API.registrarDevolucion(data);
        mostrarToast('Devolución registrada exitosamente', 'success');
        ocultarFormularioDevolucion();
        cargarDevoluciones();
        cargarEstadisticas();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }

    return false;
}

/**
 * Ver detalle de devolución
 */
async function verDetalle(id) {
    try {
        const response = await API.getDevolucion(id);
        const dev = response.data;

        alert(`Detalle de Devolución\n\n` +
              `Código Hoja: ${dev.codigo_hoja}\n` +
              `Vendedor: ${dev.vendedor_nombre}\n` +
              `Evento: ${dev.evento_nombre}\n` +
              `Boletos Vendidos: ${dev.boletos_vendidos}\n` +
              `Boletos Devueltos: ${dev.boletos_devueltos}\n` +
              `Fecha: ${formatearFecha(dev.fecha_devolucion)}`);
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', inicializar);
