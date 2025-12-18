/**
 * Utilidades JavaScript
 * Sistema de BINGO
 */

/**
 * Mostrar notificación toast
 */
function mostrarToast(mensaje, tipo = 'info') {
    const toast = document.getElementById('toast');

    if (!toast) {
        console.error('Elemento toast no encontrado');
        return;
    }

    toast.textContent = mensaje;
    toast.className = `toast toast-${tipo} show`;

    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
    if (!fecha) return '-';

    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Formatear moneda
 */
function formatearMoneda(cantidad) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(cantidad);
}

/**
 * Debounce para búsquedas
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validar email
 */
function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Confirmar acción
 */
function confirmar(mensaje, callback) {
    if (confirm(mensaje)) {
        callback();
    }
}

/**
 * Generar código QR (placeholder - requiere librería)
 */
async function generarCodigoQR(texto, elementoId) {
    // Aquí iría la implementación con una librería de QR como qrcodejs
    console.log('Generar QR:', texto, 'en elemento:', elementoId);
}

/**
 * Descargar como archivo
 */
function descargarArchivo(contenido, nombreArchivo, tipoMIME) {
    const blob = new Blob([contenido], { type: tipoMIME });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

/**
 * Copiar al portapapeles
 */
async function copiarAlPortapapeles(texto) {
    try {
        await navigator.clipboard.writeText(texto);
        mostrarToast('Copiado al portapapeles', 'success');
    } catch (err) {
        mostrarToast('Error al copiar', 'error');
    }
}

/**
 * Validar formulario
 */
function validarFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;

    // HTML5 validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    return true;
}

/**
 * Limpiar formulario
 */
function limpiarFormulario(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
    }
}

/**
 * Mostrar/ocultar elemento
 */
function toggleElemento(elementoId) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.style.display = elemento.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Escape HTML para prevenir XSS
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Generar ID único
 */
function generarID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
