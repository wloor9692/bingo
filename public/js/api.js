/**
 * API Client - Maneja todas las peticiones HTTP al backend
 */

const API_BASE_URL = '/api';

class API {
  // Helper para hacer peticiones
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // RIFAS
  static async obtenerRifas(estado = null) {
    const query = estado ? `?estado=${estado}` : '';
    return this.request(`/rifas${query}`);
  }

  static async crearRifa(rifaData) {
    return this.request('/rifas', {
      method: 'POST',
      body: JSON.stringify(rifaData),
    });
  }

  static async obtenerRifa(id) {
    return this.request(`/rifas/${id}`);
  }

  static async actualizarRifa(id, rifaData) {
    return this.request(`/rifas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(rifaData),
    });
  }

  static async eliminarRifa(id) {
    return this.request(`/rifas/${id}`, {
      method: 'DELETE',
    });
  }

  static async cambiarEstadoRifa(id, estado) {
    return this.request(`/rifas/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  static async obtenerEstadisticasRifa(id) {
    return this.request(`/rifas/${id}/estadisticas`);
  }

  // BOLETOS
  static async generarBoletos(rifaId) {
    return this.request(`/boletos/generar/${rifaId}`, {
      method: 'POST',
    });
  }

  static async obtenerBoletosPorRifa(rifaId, estado = null) {
    const query = estado ? `?estado=${estado}` : '';
    return this.request(`/boletos/rifa/${rifaId}${query}`);
  }

  static async buscarBoletoPorCodigo(codigoBarras) {
    return this.request(`/boletos/codigo/${codigoBarras}`);
  }

  static async venderBoleto(boletoId, datosVenta) {
    return this.request(`/boletos/${boletoId}/vender`, {
      method: 'PUT',
      body: JSON.stringify(datosVenta),
    });
  }

  static async cancelarVentaBoleto(boletoId) {
    return this.request(`/boletos/${boletoId}/cancelar`, {
      method: 'PUT',
    });
  }

  static async eliminarBoletosPorRifa(rifaId) {
    return this.request(`/boletos/rifa/${rifaId}`, {
      method: 'DELETE',
    });
  }

  // GANADORES
  static async registrarGanador(ganadorData) {
    return this.request('/ganadores', {
      method: 'POST',
      body: JSON.stringify(ganadorData),
    });
  }

  static async obtenerGanadores() {
    return this.request('/ganadores');
  }

  static async obtenerGanadoresPorRifa(rifaId) {
    return this.request(`/ganadores/rifa/${rifaId}`);
  }

  static async verificarNumeroGanador(rifaId, numero) {
    return this.request(`/ganadores/verificar/${rifaId}/${numero}`);
  }

  // PREMIOS
  static async consultarPorCodigoBarras(codigoBarras) {
    return this.request(`/premios/codigo/${codigoBarras}`);
  }

  static async consultarPorNumero(rifaId, numero) {
    return this.request(`/premios/numero/${rifaId}/${numero}`);
  }

  static async obtenerGanadoresPendientes() {
    return this.request('/premios/pendientes');
  }

  // VENTAS
  static async registrarVenta(ventaData) {
    return this.request('/ventas', {
      method: 'POST',
      body: JSON.stringify(ventaData),
    });
  }

  static async obtenerVentasPorFecha(fecha) {
    return this.request(`/ventas/fecha/${fecha}`);
  }

  static async obtenerResumenDiario(fecha) {
    return this.request(`/ventas/resumen/${fecha}`);
  }

  // ENTREGAS
  static async registrarEntrega(entregaData) {
    return this.request('/entregas', {
      method: 'POST',
      body: JSON.stringify(entregaData),
    });
  }

  static async obtenerEntregas(rifaId = null) {
    const query = rifaId ? `?rifaId=${rifaId}` : '';
    return this.request(`/entregas${query}`);
  }

  static async obtenerEntregasPorRifa(rifaId) {
    return this.request(`/entregas/rifa/${rifaId}`);
  }
}
