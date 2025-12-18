/**
 * Módulo de Juego de BINGO - Frontend
 */

let sesionActual = null;
let estadoJuego = null;
let intervaloActualizacion = null;

/**
 * Inicializar
 */
async function inicializar() {
    await cargarEventosActivos();
    await verificarJuegoActivo();
    generarTablero();
}

/**
 * Cargar eventos activos para iniciar juego
 */
async function cargarEventosActivos() {
    try {
        const response = await API.getEventos({ estado: 'activo' });
        const eventos = response.data.eventos;

        const select = document.getElementById('evento-juego');
        if (!select) return;

        const opciones = eventos.map(e =>
            `<option value="${e.id}">${e.nombre} - ${formatearFecha(e.fecha_evento)}</option>`
        ).join('');

        select.innerHTML = '<option value="">Seleccionar evento activo...</option>' + opciones;
    } catch (error) {
        console.error('Error al cargar eventos:', error);
    }
}

/**
 * Verificar si hay un juego activo
 */
async function verificarJuegoActivo() {
    try {
        // Buscar eventos en curso
        const response = await API.getEventos({ estado: 'en_curso' });
        const eventos = response.data.eventos;

        if (eventos.length > 0) {
            // Cargar sesión activa
            const eventoId = eventos[0].id;
            const sesionResp = await API.getSesionActiva(eventoId);

            if (sesionResp.data) {
                sesionActual = sesionResp.data;
                await cargarEstadoJuego(sesionActual.id);
                mostrarPanelJuego();
                iniciarActualizacionAutomatica();
            } else {
                mostrarSinJuego();
            }
        } else {
            mostrarSinJuego();
        }
    } catch (error) {
        console.error('Error al verificar juego activo:', error);
        mostrarSinJuego();
    }
}

/**
 * Generar tablero de BINGO (1-90)
 */
function generarTablero() {
    const tablero = document.getElementById('tablero-bingo');
    if (!tablero) return;

    let html = '';
    for (let i = 1; i <= 90; i++) {
        html += `<div class="bingo-ball" id="ball-${i}">${i}</div>`;
    }
    tablero.innerHTML = html;
}

/**
 * Mostrar formulario para iniciar juego
 */
function mostrarIniciarJuego() {
    document.getElementById('seleccion-evento').style.display = 'block';
}

/**
 * Ocultar formulario
 */
function ocultarIniciarJuego() {
    document.getElementById('seleccion-evento').style.display = 'none';
}

/**
 * Iniciar juego
 */
async function iniciarJuego() {
    const eventoId = document.getElementById('evento-juego').value;

    if (!eventoId) {
        mostrarToast('Seleccione un evento', 'warning');
        return;
    }

    if (!confirm('¿Iniciar juego de BINGO?')) return;

    try {
        const response = await API.iniciarJuego(parseInt(eventoId));
        sesionActual = response.data;

        mostrarToast('¡Juego iniciado!', 'success');
        ocultarIniciarJuego();
        await cargarEstadoJuego(sesionActual.id);
        mostrarPanelJuego();
        iniciarActualizacionAutomatica();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Cargar estado del juego
 */
async function cargarEstadoJuego(sesionId) {
    try {
        const response = await API.getEstadoJuego(sesionId);
        estadoJuego = response.data;

        // Actualizar UI
        actualizarTablero();
        actualizarFiguras();
        actualizarGanadores();
        actualizarEstadisticas();
        actualizarInfoSesion();
    } catch (error) {
        console.error('Error al cargar estado:', error);
    }
}

/**
 * Actualizar tablero con bolas cantadas
 */
function actualizarTablero() {
    // Limpiar tablero
    for (let i = 1; i <= 90; i++) {
        const ball = document.getElementById(`ball-${i}`);
        if (ball) {
            ball.classList.remove('called', 'last');
        }
    }

    // Marcar bolas cantadas
    if (estadoJuego.bolas_cantadas) {
        estadoJuego.bolas_cantadas.forEach((bola, index) => {
            const ball = document.getElementById(`ball-${bola.numero}`);
            if (ball) {
                ball.classList.add('called');
                // Última bola con animación
                if (index === estadoJuego.bolas_cantadas.length - 1) {
                    ball.classList.add('last');
                }
            }
        });

        // Mostrar última bola
        if (estadoJuego.ultima_bola) {
            document.getElementById('numero-actual').textContent = estadoJuego.ultima_bola;
        }
    }
}

/**
 * Actualizar lista de figuras
 */
function actualizarFiguras() {
    const listaDiv = document.getElementById('lista-figuras');
    const selectFigura = document.getElementById('figura-ganador');

    if (!estadoJuego.figuras || estadoJuego.figuras.length === 0) {
        listaDiv.innerHTML = '<p class="text-muted">No hay figuras configuradas</p>';
        return;
    }

    let html = '';
    let opcionesFigura = '<option value="">Seleccionar...</option>';

    estadoJuego.figuras.forEach(f => {
        const estado = f.ganado == 1 ? 'success' : 'warning';
        const icon = f.ganado == 1 ? 'check-circle' : 'circle';

        html += `
            <div style="padding: 0.5rem; margin: 0.5rem 0; background: var(--light-color); border-radius: var(--border-radius);">
                <i class="fas fa-${icon}"></i>
                <strong>${f.figura_nombre}</strong>
                <br><small>${formatearMoneda(f.premio)}</small>
                ${f.ganado == 1 ? '<span class="badge badge-success">GANADO</span>' : ''}
            </div>
        `;

        if (f.ganado == 0) {
            opcionesFigura += `<option value="${f.figura_id}">${f.figura_nombre}</option>`;
        }
    });

    listaDiv.innerHTML = html;
    selectFigura.innerHTML = opcionesFigura;
}

/**
 * Actualizar lista de ganadores
 */
function actualizarGanadores() {
    const listaDiv = document.getElementById('lista-ganadores');

    if (!estadoJuego.ganadores || estadoJuego.ganadores.length === 0) {
        listaDiv.innerHTML = '<p class="text-muted">Aún no hay ganadores</p>';
        return;
    }

    const html = estadoJuego.ganadores.map(g => `
        <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem; margin: 0.5rem 0;">
            <strong>${g.figura_nombre}</strong>
            <p>Premio: ${formatearMoneda(g.premio)}</p>
            <small>${g.comprador_nombre || 'N/A'}</small>
        </div>
    `).join('');

    listaDiv.innerHTML = html;
}

/**
 * Actualizar estadísticas
 */
function actualizarEstadisticas() {
    document.getElementById('total-bolas').textContent = estadoJuego.bolas_cantadas?.length || 0;
    document.getElementById('total-ganadores').textContent = estadoJuego.ganadores?.length || 0;
}

/**
 * Actualizar info de sesión
 */
function actualizarInfoSesion() {
    if (estadoJuego.sesion) {
        document.getElementById('nombre-evento-actual').textContent = `Evento: ${estadoJuego.sesion.evento_nombre}`;
        document.getElementById('sesion-id').textContent = estadoJuego.sesion.id;
    }
}

/**
 * Cantar número
 */
async function cantarNumero() {
    const input = document.getElementById('numero-cantar');
    const numero = parseInt(input.value);

    if (!numero || numero < 1 || numero > 90) {
        mostrarToast('Ingrese un número válido (1-90)', 'warning');
        return;
    }

    if (!sesionActual) {
        mostrarToast('No hay sesión activa', 'error');
        return;
    }

    try {
        await API.cantarBolilla(sesionActual.id, numero);
        mostrarToast(`¡Número ${numero} cantado!`, 'success');
        input.value = '';
        await cargarEstadoJuego(sesionActual.id);
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Validar ganador
 */
async function validarGanador(event) {
    event.preventDefault();

    const codigoQR = document.getElementById('codigo-ganador').value.trim();
    const figuraId = parseInt(document.getElementById('figura-ganador').value);

    if (!codigoQR || !figuraId) {
        mostrarToast('Complete todos los campos', 'warning');
        return false;
    }

    if (!sesionActual) {
        mostrarToast('No hay sesión activa', 'error');
        return false;
    }

    try {
        const response = await API.validarGanador(sesionActual.id, codigoQR, figuraId);
        const resultado = response.data;

        if (resultado.ganador) {
            mostrarToast('¡BINGO! ' + resultado.mensaje, 'success');
            document.getElementById('codigo-ganador').value = '';
            await cargarEstadoJuego(sesionActual.id);
        } else {
            mostrarToast(resultado.mensaje, 'error');
        }
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }

    return false;
}

/**
 * Finalizar juego
 */
async function finalizarJuego() {
    if (!confirm('¿Finalizar el juego? Esta acción no se puede deshacer.')) return;

    if (!sesionActual) {
        mostrarToast('No hay sesión activa', 'error');
        return;
    }

    try {
        await API.finalizarJuego(sesionActual.id);
        mostrarToast('Juego finalizado', 'success');
        detenerActualizacionAutomatica();
        sesionActual = null;
        estadoJuego = null;
        mostrarSinJuego();
    } catch (error) {
        mostrarToast('Error: ' + error.message, 'error');
    }
}

/**
 * Mostrar panel de juego
 */
function mostrarPanelJuego() {
    document.getElementById('sin-juego').style.display = 'none';
    document.getElementById('seleccion-evento').style.display = 'none';
    document.getElementById('panel-juego').style.display = 'block';
    document.getElementById('btn-iniciar').style.display = 'none';
}

/**
 * Mostrar sin juego
 */
function mostrarSinJuego() {
    document.getElementById('sin-juego').style.display = 'block';
    document.getElementById('seleccion-evento').style.display = 'none';
    document.getElementById('panel-juego').style.display = 'none';
    document.getElementById('btn-iniciar').style.display = 'block';
}

/**
 * Iniciar actualización automática (polling cada 5 segundos)
 */
function iniciarActualizacionAutomatica() {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
    }

    intervaloActualizacion = setInterval(() => {
        if (sesionActual) {
            cargarEstadoJuego(sesionActual.id);
        }
    }, 5000);
}

/**
 * Detener actualización automática
 */
function detenerActualizacionAutomatica() {
    if (intervaloActualizacion) {
        clearInterval(intervaloActualizacion);
        intervaloActualizacion = null;
    }
}

// Limpiar al salir
window.addEventListener('beforeunload', () => {
    detenerActualizacionAutomatica();
});

// Inicializar
document.addEventListener('DOMContentLoaded', inicializar);
