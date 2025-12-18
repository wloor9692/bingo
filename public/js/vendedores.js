/**
 * Gestión de Vendedores - Frontend
 */

let vendedores = [];
let vendedorEditando = null;

/**
 * Cargar vendedores desde la API
 */
async function cargarVendedores() {
    try {
        const filtroEstado = document.getElementById('filtro-estado').value;
        const activo = filtroEstado === '' ? null : filtroEstado === '1';

        const response = await API.getVendedores(activo);
        vendedores = response.data.vendedores;

        mostrarVendedores(vendedores);
    } catch (error) {
        mostrarToast('Error al cargar vendedores: ' + error.message, 'error');
        console.error(error);
    }
}

/**
 * Mostrar vendedores en la tabla
 */
function mostrarVendedores(lista) {
    const tbody = document.getElementById('tabla-vendedores');

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">
                    No hay vendedores registrados
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = lista.map(v => `
        <tr>
            <td><strong>${v.codigo}</strong></td>
            <td>${v.nombre_completo}</td>
            <td>${v.telefono || '-'}</td>
            <td>${v.email || '-'}</td>
            <td>
                <span class="badge ${v.activo == 1 ? 'badge-success' : 'badge-danger'}">
                    ${v.activo == 1 ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td class="actions">
                <button class="btn btn-sm btn-info" onclick="verEstadisticas(${v.id})" title="Estadísticas">
                    <i class="fas fa-chart-bar"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="editarVendedor(${v.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-${v.activo == 1 ? 'danger' : 'success'}"
                        onclick="cambiarEstado(${v.id}, ${v.activo == 1 ? 0 : 1})"
                        title="${v.activo == 1 ? 'Desactivar' : 'Activar'}">
                    <i class="fas fa-${v.activo == 1 ? 'ban' : 'check'}"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarVendedor(${v.id})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Filtrar vendedores por búsqueda
 */
function filtrarVendedores() {
    const busqueda = document.getElementById('buscar-vendedor').value.toLowerCase();

    const filtrados = vendedores.filter(v =>
        v.codigo.toLowerCase().includes(busqueda) ||
        v.nombre_completo.toLowerCase().includes(busqueda)
    );

    mostrarVendedores(filtrados);
}

/**
 * Mostrar formulario para crear vendedor
 */
function mostrarFormularioVendedor() {
    vendedorEditando = null;
    document.getElementById('form-title').textContent = 'Nuevo Vendedor';
    document.getElementById('form-vendedor').reset();
    document.getElementById('vendedor-id').value = '';
    document.getElementById('formulario-vendedor').style.display = 'block';
}

/**
 * Ocultar formulario
 */
function ocultarFormularioVendedor() {
    document.getElementById('formulario-vendedor').style.display = 'none';
    document.getElementById('form-vendedor').reset();
    vendedorEditando = null;
}

/**
 * Editar vendedor
 */
async function editarVendedor(id) {
    try {
        const response = await API.getVendedor(id);
        const vendedor = response.data;

        vendedorEditando = vendedor;

        document.getElementById('form-title').textContent = 'Editar Vendedor';
        document.getElementById('vendedor-id').value = vendedor.id;
        document.getElementById('codigo').value = vendedor.codigo;
        document.getElementById('nombre_completo').value = vendedor.nombre_completo;
        document.getElementById('telefono').value = vendedor.telefono || '';
        document.getElementById('email').value = vendedor.email || '';
        document.getElementById('direccion').value = vendedor.direccion || '';

        document.getElementById('formulario-vendedor').style.display = 'block';
    } catch (error) {
        mostrarToast('Error al cargar vendedor: ' + error.message, 'error');
    }
}

/**
 * Guardar vendedor (crear o actualizar)
 */
async function guardarVendedor(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    delete data.id; // No enviar el ID en el body

    try {
        const id = document.getElementById('vendedor-id').value;

        if (id) {
            // Actualizar
            await API.actualizarVendedor(id, data);
            mostrarToast('Vendedor actualizado exitosamente', 'success');
        } else {
            // Crear
            await API.crearVendedor(data);
            mostrarToast('Vendedor creado exitosamente', 'success');
        }

        ocultarFormularioVendedor();
        cargarVendedores();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }

    return false;
}

/**
 * Cambiar estado activo/inactivo
 */
async function cambiarEstado(id, activo) {
    const mensaje = activo ? '¿Activar este vendedor?' : '¿Desactivar este vendedor?';

    if (!confirm(mensaje)) return;

    try {
        await API.cambiarEstadoVendedor(id, activo);
        mostrarToast(activo ? 'Vendedor activado' : 'Vendedor desactivado', 'success');
        cargarVendedores();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Eliminar vendedor
 */
async function eliminarVendedor(id) {
    if (!confirm('¿Está seguro de eliminar este vendedor? Esta acción no se puede deshacer.')) {
        return;
    }

    try {
        await API.eliminarVendedor(id);
        mostrarToast('Vendedor eliminado exitosamente', 'success');
        cargarVendedores();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Ver estadísticas del vendedor
 */
async function verEstadisticas(id) {
    try {
        const response = await API.getEstadisticasVendedor(id);
        const stats = response.data;

        alert(`Estadísticas del Vendedor\n\n` +
              `Boletos Asignados: ${stats.boletos_asignados}\n` +
              `Boletos Vendidos: ${stats.boletos_vendidos}\n` +
              `Ingresos Totales: $${stats.ingresos_totales}\n` +
              `Porcentaje de Venta: ${((stats.boletos_vendidos / stats.boletos_asignados) * 100).toFixed(2)}%`);
    } catch (error) {
        mostrarToast('Error al obtener estadísticas: ' + error.message, 'error');
    }
}

// Cargar vendedores al iniciar
document.addEventListener('DOMContentLoaded', cargarVendedores);
