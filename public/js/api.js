/**
 * API Client - Sistema de BINGO
 * Maneja todas las peticiones HTTP al backend PHP
 */

class API {
    static baseURL = '/bingo/api';

    /**
     * Helper para hacer peticiones
     */
    static async request(endpoint, method = 'GET', body = null) {
        const url = `${this.baseURL}/${endpoint}`;

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ==================== VENDEDORES ====================
    static async getVendedores(activo = null) {
        const query = activo !== null ? `?activo=${activo}` : '';
        return this.request(`vendedores.php${query}`);
    }

    static async getVendedor(id) {
        return this.request(`vendedores.php?id=${id}`);
    }

    static async crearVendedor(data) {
        return this.request('vendedores.php', 'POST', data);
    }

    static async actualizarVendedor(id, data) {
        return this.request(`vendedores.php?id=${id}`, 'PUT', data);
    }

    static async cambiarEstadoVendedor(id, activo) {
        return this.request(`vendedores.php?id=${id}`, 'PATCH', { activo });
    }

    static async eliminarVendedor(id) {
        return this.request(`vendedores.php?id=${id}`, 'DELETE');
    }

    static async getEstadisticasVendedor(id) {
        return this.request(`vendedores.php?estadisticas=1&id=${id}`);
    }

    // ==================== EVENTOS ====================
    static async getEventos(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        return this.request(`eventos.php${params ? '?' + params : ''}`);
    }

    static async getEvento(id) {
        return this.request(`eventos.php?id=${id}`);
    }

    static async crearEvento(data) {
        return this.request('eventos.php', 'POST', data);
    }

    static async actualizarEvento(id, data) {
        return this.request(`eventos.php?id=${id}`, 'PUT', data);
    }

    static async cambiarEstadoEvento(id, estado) {
        return this.request(`eventos.php?id=${id}`, 'PATCH', { estado });
    }

    static async eliminarEvento(id) {
        return this.request(`eventos.php?id=${id}`, 'DELETE');
    }

    static async getEstadisticasEvento(id) {
        return this.request(`eventos.php?estadisticas=1&evento_id=${id}`);
    }

    static async getFigurasEvento(id) {
        return this.request(`eventos.php?figuras=1&evento_id=${id}`);
    }

    // ==================== FIGURAS ====================
    static async getFiguras(activo = null) {
        const query = activo !== null ? `?activo=${activo}` : '';
        return this.request(`figuras.php${query}`);
    }

    static async getFigura(id) {
        return this.request(`figuras.php?id=${id}`);
    }

    static async crearFigura(data) {
        return this.request('figuras.php', 'POST', data);
    }

    static async actualizarFigura(id, data) {
        return this.request(`figuras.php?id=${id}`, 'PUT', data);
    }

    static async cambiarEstadoFigura(id, activo) {
        return this.request(`figuras.php?id=${id}`, 'PATCH', { activo });
    }

    static async eliminarFigura(id) {
        return this.request(`figuras.php?id=${id}`, 'DELETE');
    }

    // ==================== ASIGNACIONES ====================
    static async getAsignaciones(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        return this.request(`asignaciones.php${params ? '?' + params : ''}`);
    }

    static async getAsignacion(id) {
        return this.request(`asignaciones.php?id=${id}`);
    }

    static async crearAsignacion(data) {
        return this.request('asignaciones.php', 'POST', data);
    }

    static async buscarBoletoQR(codigoQR) {
        return this.request(`asignaciones.php?codigo_qr=${encodeURIComponent(codigoQR)}`);
    }

    static async marcarVendido(codigoQR, compradorData) {
        return this.request('asignaciones.php', 'POST', {
            marcar_vendido: true,
            codigo_qr: codigoQR,
            ...compradorData
        });
    }

    static async getBoletosHoja(asignacionId) {
        return this.request(`asignaciones.php?boletos_hoja=${asignacionId}`);
    }

    static async getEstadisticasAsignaciones(filtros = {}) {
        const params = new URLSearchParams({ ...filtros, estadisticas: '1' }).toString();
        return this.request(`asignaciones.php?${params}`);
    }

    // ==================== DEVOLUCIONES ====================
    static async getDevoluciones(filtros = {}) {
        const params = new URLSearchParams(filtros).toString();
        return this.request(`devoluciones.php${params ? '?' + params : ''}`);
    }

    static async getDevolucion(id) {
        return this.request(`devoluciones.php?id=${id}`);
    }

    static async registrarDevolucion(data) {
        return this.request('devoluciones.php', 'POST', data);
    }

    static async verificarDevolucion(codigoHoja) {
        return this.request(`devoluciones.php?verificar=${encodeURIComponent(codigoHoja)}`);
    }

    static async getEstadisticasDevoluciones(filtros = {}) {
        const params = new URLSearchParams({ ...filtros, estadisticas: '1' }).toString();
        return this.request(`devoluciones.php?${params}`);
    }

    // ==================== JUEGO ====================
    static async iniciarJuego(eventoId, iniciadoPor = 1) {
        return this.request('juego.php', 'POST', {
            accion: 'iniciar',
            evento_id: eventoId,
            iniciado_por: iniciadoPor
        });
    }

    static async cantarBolilla(sesionId, numero) {
        return this.request('juego.php', 'POST', {
            accion: 'cantar',
            sesion_id: sesionId,
            numero: numero
        });
    }

    static async validarGanador(sesionId, codigoQR, figuraId) {
        return this.request('juego.php', 'POST', {
            accion: 'validar',
            sesion_id: sesionId,
            codigo_qr: codigoQR,
            figura_id: figuraId
        });
    }

    static async finalizarJuego(sesionId) {
        return this.request('juego.php', 'POST', {
            accion: 'finalizar',
            sesion_id: sesionId
        });
    }

    static async getSesion(sesionId) {
        return this.request(`juego.php?sesion_id=${sesionId}`);
    }

    static async getEstadoJuego(sesionId) {
        return this.request(`juego.php?estado=1&sesion_id=${sesionId}`);
    }

    static async getBolasCantadas(sesionId) {
        return this.request(`juego.php?bolas=1&sesion_id=${sesionId}`);
    }

    static async getGanadores(sesionId) {
        return this.request(`juego.php?ganadores=1&sesion_id=${sesionId}`);
    }

    static async getSesionActiva(eventoId) {
        return this.request(`juego.php?sesion_activa=1&evento_id=${eventoId}`);
    }
}
