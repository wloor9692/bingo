/**
 * Aplicación Principal - Sistema de Gestión de Rifas
 */

// Estado global
let rifasActivas = [];
let rifaSeleccionada = null;

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
  inicializarNavegacion();
  inicializarFormularios();
  cargarRifas();
  configurarFechaVentas();
});

// NAVEGACIÓN
function inicializarNavegacion() {
  const navButtons = document.querySelectorAll('.nav-btn');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.dataset.section;

      // Actualizar botones
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Mostrar sección
      document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
      document.getElementById(sectionId).classList.add('active');

      // Cargar datos según la sección
      switch(sectionId) {
        case 'rifas':
          cargarRifas();
          break;
        case 'ganadores':
          cargarGanadores();
          cargarSelectsRifas('select-rifa-ganador');
          break;
        case 'consulta':
          cargarSelectsRifas('select-rifa-consulta');
          document.getElementById('input-codigo-barras').focus();
          break;
        case 'ventas':
          cargarVentasDiarias();
          break;
        case 'entregas':
          cargarEntregas();
          cargarSelectsRifas('select-rifa-entrega');
          break;
      }
    });
  });
}

// FORMULARIOS
function inicializarFormularios() {
  // Form: Nueva Rifa
  document.getElementById('form-nueva-rifa').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const rifaData = Object.fromEntries(formData);

    try {
      const response = await API.crearRifa(rifaData);
      mostrarToast('Rifa creada exitosamente', 'success');
      e.target.reset();
      ocultarFormularioRifa();
      cargarRifas();
    } catch (error) {
      mostrarToast(error.message, 'error');
    }
  });

  // Form: Ganador
  document.getElementById('form-ganador').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const ganadorData = Object.fromEntries(formData);

    try {
      await API.registrarGanador(ganadorData);
      mostrarToast('Número ganador registrado', 'success');
      e.target.reset();
      ocultarFormularioGanador();
      cargarGanadores();
    } catch (error) {
      mostrarToast(error.message, 'error');
    }
  });

  // Form: Entrega
  document.getElementById('form-entrega').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const entregaData = Object.fromEntries(formData);

    try {
      await API.registrarEntrega(entregaData);
      mostrarToast('Entrega registrada exitosamente', 'success');
      e.target.reset();
      ocultarFormularioEntrega();
      cargarEntregas();
    } catch (error) {
      mostrarToast(error.message, 'error');
    }
  });

  // Enter en código de barras
  document.getElementById('input-codigo-barras').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      consultarPorCodigo();
    }
  });
}

// RIFAS
async function cargarRifas() {
  try {
    const response = await API.obtenerRifas();
    rifasActivas = response.data;
    mostrarRifas(response.data);
    cargarSelectsRifas('select-rifa-boletos');
  } catch (error) {
    mostrarToast('Error al cargar rifas', 'error');
  }
}

function mostrarRifas(rifas) {
  const container = document.getElementById('lista-rifas');

  if (rifas.length === 0) {
    container.innerHTML = '<div class="empty-state"><h3>No hay rifas registradas</h3><p>Crea tu primera rifa para comenzar</p></div>';
    return;
  }

  container.innerHTML = rifas.map(rifa => `
    <div class="rifa-card">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <h3>${rifa.nombre}</h3>
        <span class="badge badge-${getBadgeEstado(rifa.estado)}">${rifa.estado}</span>
      </div>
      <div class="rifa-info">
        <p><strong>Premio:</strong> ${rifa.premio}</p>
        <p><strong>Fecha Sorteo:</strong> ${formatFecha(rifa.fecha_sorteo)}</p>
        <p><strong>Precio:</strong> $${rifa.precio_boleto}</p>
        <p><strong>Rango:</strong> ${rifa.numero_inicial} - ${rifa.numero_final}</p>
      </div>
      <div class="rifa-actions">
        <button class="btn btn-primary btn-sm" onclick="verEstadisticasRifa(${rifa.id})">Estadísticas</button>
        <button class="btn btn-secondary btn-sm" onclick="cambiarEstadoRifa(${rifa.id}, '${rifa.estado}')">
          ${rifa.estado === 'activa' ? 'Finalizar' : 'Activar'}
        </button>
      </div>
    </div>
  `).join('');
}

async function verEstadisticasRifa(rifaId) {
  try {
    const response = await API.obtenerEstadisticasRifa(rifaId);
    const stats = response.data;

    alert(`Estadísticas de la Rifa\n\nBoletos:\n- Total: ${stats.boletos.total}\n- Vendidos: ${stats.boletos.vendidos}\n- Disponibles: ${stats.boletos.disponibles}\n- % Vendido: ${stats.boletos.porcentaje_vendido}%\n\nIngresos:\n- Total: $${stats.ingresos.total}\n- Potencial: $${stats.ingresos.ingreso_potencial}`);
  } catch (error) {
    mostrarToast('Error al obtener estadísticas', 'error');
  }
}

async function cambiarEstadoRifa(rifaId, estadoActual) {
  const nuevoEstado = estadoActual === 'activa' ? 'finalizada' : 'activa';

  try {
    await API.cambiarEstadoRifa(rifaId, nuevoEstado);
    mostrarToast(`Rifa ${nuevoEstado}`, 'success');
    cargarRifas();
  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

// BOLETOS
async function generarBoletos() {
  const rifaId = document.getElementById('select-rifa-boletos').value;

  if (!rifaId) {
    mostrarToast('Seleccione una rifa', 'error');
    return;
  }

  if (!confirm('¿Generar boletos para esta rifa? Esta acción puede tardar unos segundos.')) {
    return;
  }

  try {
    const response = await API.generarBoletos(rifaId);
    mostrarToast(response.message, 'success');
    cargarBoletosPorRifa(rifaId);
  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

async function cargarBoletosPorRifa(rifaId) {
  if (!rifaId) {
    rifaId = document.getElementById('select-rifa-boletos').value;
  }

  if (!rifaId) return;

  try {
    const response = await API.obtenerBoletosPorRifa(rifaId);
    mostrarBoletos(response.data);
    mostrarEstadisticasBoletos(response.data);
  } catch (error) {
    mostrarToast('Error al cargar boletos', 'error');
  }
}

function mostrarBoletos(boletos) {
  const tbody = document.querySelector('#tabla-boletos tbody');

  if (boletos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay boletos generados</td></tr>';
    return;
  }

  tbody.innerHTML = boletos.map(boleto => `
    <tr>
      <td><strong>${boleto.numero}</strong></td>
      <td><code>${boleto.codigo_barras}</code></td>
      <td><span class="badge badge-${getBadgeEstado(boleto.estado)}">${boleto.estado}</span></td>
      <td>${boleto.cliente_nombre || '-'}</td>
      <td>${boleto.cliente_telefono || '-'}</td>
      <td>
        ${boleto.estado === 'disponible' ?
          `<button class="btn btn-success btn-sm" onclick="venderBoletoModal(${boleto.id})">Vender</button>` :
          `<button class="btn btn-danger btn-sm" onclick="cancelarVentaBoleto(${boleto.id})">Cancelar</button>`
        }
      </td>
    </tr>
  `).join('');
}

function mostrarEstadisticasBoletos(boletos) {
  const total = boletos.length;
  const vendidos = boletos.filter(b => b.estado === 'vendido').length;
  const disponibles = total - vendidos;

  const statsContainer = document.getElementById('stats-boletos');
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Boletos</div>
      <div class="stat-value">${total}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Vendidos</div>
      <div class="stat-value">${vendidos}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Disponibles</div>
      <div class="stat-value">${disponibles}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">% Vendido</div>
      <div class="stat-value">${((vendidos/total)*100).toFixed(1)}%</div>
    </div>
  `;
}

async function venderBoletoModal(boletoId) {
  const nombre = prompt('Nombre del cliente:');
  if (!nombre) return;

  const telefono = prompt('Teléfono del cliente (opcional):');

  try {
    await API.venderBoleto(boletoId, {
      cliente_nombre: nombre,
      cliente_telefono: telefono,
      vendedor: 'Mostrador',
    });
    mostrarToast('Boleto vendido exitosamente', 'success');
    cargarBoletosPorRifa();
  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

async function cancelarVentaBoleto(boletoId) {
  if (!confirm('¿Cancelar la venta de este boleto?')) return;

  try {
    await API.cancelarVentaBoleto(boletoId);
    mostrarToast('Venta cancelada', 'success');
    cargarBoletosPorRifa();
  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

// GANADORES
async function cargarGanadores() {
  try {
    const response = await API.obtenerGanadores();
    mostrarGanadores(response.data);
  } catch (error) {
    mostrarToast('Error al cargar ganadores', 'error');
  }
}

function mostrarGanadores(ganadores) {
  const tbody = document.querySelector('#tabla-ganadores tbody');

  if (ganadores.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay ganadores registrados</td></tr>';
    return;
  }

  tbody.innerHTML = ganadores.map(g => `
    <tr>
      <td>${g.rifa_nombre}</td>
      <td><strong>${g.numero_ganador}</strong></td>
      <td>${g.posicion}</td>
      <td>${g.premio_descripcion || g.rifa_premio}</td>
      <td>${g.cliente_nombre || 'No vendido'}</td>
      <td>${formatFecha(g.fecha_sorteo)}</td>
    </tr>
  `).join('');
}

// CONSULTA DE PREMIOS
async function consultarPorCodigo() {
  const codigo = document.getElementById('input-codigo-barras').value.trim();

  if (!codigo) {
    mostrarToast('Ingrese un código de barras', 'error');
    return;
  }

  try {
    const response = await API.consultarPorCodigoBarras(codigo);
    mostrarResultadoConsulta(response.data);
    document.getElementById('input-codigo-barras').value = '';
  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

async function consultarPorNumero() {
  const rifaId = document.getElementById('select-rifa-consulta').value;
  const numero = document.getElementById('input-numero-consulta').value;

  if (!rifaId || !numero) {
    mostrarToast('Seleccione una rifa e ingrese un número', 'error');
    return;
  }

  try {
    const response = await API.consultarPorNumero(rifaId, numero);
    mostrarResultadoConsulta(response.data);
  } catch (error) {
    mostrarToast(error.message, 'error');
  }
}

function mostrarResultadoConsulta(resultado) {
  const container = document.getElementById('resultado-consulta');

  if (resultado.es_ganador) {
    container.innerHTML = `
      <div class="resultado-ganador">
        <h2>🎉 ¡FELICIDADES! 🎉</h2>
        <h1 style="font-size: 3rem; margin: 1rem 0;">${resultado.boleto.numero}</h1>
        <h3>${resultado.mensaje}</h3>
        <div style="margin-top: 2rem; background: rgba(255,255,255,0.2); padding: 1.5rem; border-radius: 8px;">
          <p><strong>Rifa:</strong> ${resultado.rifa.nombre}</p>
          <p><strong>Premio:</strong> ${resultado.rifa.premio}</p>
          <p><strong>Posición:</strong> ${resultado.ganador.posicion}</p>
          ${resultado.boleto.cliente ? `<p><strong>Cliente:</strong> ${resultado.boleto.cliente}</p>` : ''}
          ${resultado.premio_entregado ? '<p style="color: #fbbf24; font-weight: bold;">⚠️ PREMIO YA ENTREGADO</p>' : ''}
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="resultado-no-ganador">
        <h2>${resultado.alerta || 'NO ES GANADOR'}</h2>
        <p style="margin-top: 1rem; font-size: 1.125rem;">${resultado.mensaje}</p>
        ${resultado.boleto ? `<p style="margin-top: 0.5rem;">Número: <strong>${resultado.boleto.numero}</strong></p>` : ''}
      </div>
    `;
  }
}

// VENTAS
function configurarFechaVentas() {
  const input = document.getElementById('fecha-ventas');
  input.value = new Date().toISOString().split('T')[0];
}

async function cargarVentasDiarias() {
  const fecha = document.getElementById('fecha-ventas').value;

  try {
    const [ventas, resumen] = await Promise.all([
      API.obtenerVentasPorFecha(fecha),
      API.obtenerResumenDiario(fecha)
    ]);

    mostrarVentas(ventas.data);
    mostrarResumenVentas(resumen.data);
  } catch (error) {
    mostrarToast('Error al cargar ventas', 'error');
  }
}

function mostrarVentas(ventas) {
  const tbody = document.querySelector('#tabla-ventas tbody');

  if (ventas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay ventas para esta fecha</td></tr>';
    return;
  }

  tbody.innerHTML = ventas.map(v => `
    <tr>
      <td>${formatFecha(v.fecha_venta)}</td>
      <td>${v.rifa_nombre}</td>
      <td>${v.boleto_numero}</td>
      <td>${v.cliente_nombre || '-'}</td>
      <td>$${v.precio_venta}</td>
      <td>${v.vendedor || '-'}</td>
      <td><span class="badge badge-info">${v.forma_pago}</span></td>
    </tr>
  `).join('');
}

function mostrarResumenVentas(resumen) {
  const statsContainer = document.getElementById('stats-ventas');
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Total Ventas</div>
      <div class="stat-value">${resumen.total_ventas || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ingresos Totales</div>
      <div class="stat-value">$${resumen.ingresos_totales || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Precio Promedio</div>
      <div class="stat-value">$${parseFloat(resumen.precio_promedio || 0).toFixed(2)}</div>
    </div>
  `;
}

// ENTREGAS
async function cargarEntregas() {
  try {
    const response = await API.obtenerEntregas();
    mostrarEntregas(response.data);
  } catch (error) {
    mostrarToast('Error al cargar entregas', 'error');
  }
}

function mostrarEntregas(entregas) {
  const tbody = document.querySelector('#tabla-entregas tbody');

  if (entregas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay entregas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = entregas.map(e => `
    <tr>
      <td>${formatFecha(e.fecha_entrega)}</td>
      <td>${e.rifa_nombre}</td>
      <td>${e.boleto_numero}</td>
      <td>${e.ganador_nombre}</td>
      <td>${e.premio_entregado}</td>
      <td>${e.responsable_entrega || '-'}</td>
    </tr>
  `).join('');
}

async function cargarGanadoresPendientes(rifaId) {
  if (!rifaId) return;

  try {
    const response = await API.obtenerGanadoresPorRifa(rifaId);
    const select = document.getElementById('select-boleto-ganador');

    select.innerHTML = '<option value="">Seleccione un boleto</option>';

    response.data.forEach(g => {
      const option = document.createElement('option');
      option.value = g.codigo_barras;
      option.textContent = `Boleto #${g.numero_ganador} - ${g.posicion}`;
      option.dataset.numeroGanadorId = g.id;
      option.dataset.boletoId = g.codigo_barras;
      select.appendChild(option);
    });

    // Actualizar boleto_id y numero_ganador_id cuando se selecciona
    select.addEventListener('change', async (e) => {
      if (e.target.value) {
        const selectedOption = e.target.options[e.target.selectedIndex];
        document.getElementById('numero-ganador-id').value = selectedOption.dataset.numeroGanadorId;

        // Buscar el boleto por código
        try {
          const boleto = await API.buscarBoletoPorCodigo(e.target.value);
          // Actualizar el campo hidden con el ID del boleto
          const form = document.getElementById('form-entrega');
          let boletoIdInput = form.querySelector('input[name="boleto_id"]');
          if (!boletoIdInput) {
            boletoIdInput = document.createElement('input');
            boletoIdInput.type = 'hidden';
            boletoIdInput.name = 'boleto_id';
            form.appendChild(boletoIdInput);
          }
          boletoIdInput.value = boleto.data.id;
        } catch (error) {
          console.error('Error al buscar boleto:', error);
        }
      }
    });
  } catch (error) {
    mostrarToast('Error al cargar ganadores', 'error');
  }
}

// UTILIDADES
async function cargarSelectsRifas(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = '<option value="">Seleccione una rifa</option>';

  try {
    const response = await API.obtenerRifas();
    response.data.forEach(rifa => {
      const option = document.createElement('option');
      option.value = rifa.id;
      option.textContent = `${rifa.nombre} - ${formatFecha(rifa.fecha_sorteo)}`;
      select.appendChild(option);
    });

    // Auto-cargar boletos cuando se cambia la selección
    if (selectId === 'select-rifa-boletos') {
      select.addEventListener('change', (e) => {
        if (e.target.value) {
          cargarBoletosPorRifa(e.target.value);
        }
      });
    }
  } catch (error) {
    console.error('Error al cargar rifas en select:', error);
  }
}

function formatFecha(fecha) {
  if (!fecha) return '-';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getBadgeEstado(estado) {
  const badges = {
    'activa': 'success',
    'disponible': 'success',
    'vendido': 'info',
    'finalizada': 'warning',
    'cancelada': 'danger',
  };
  return badges[estado] || 'info';
}

function mostrarToast(mensaje, tipo = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.className = `toast ${tipo} show`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Funciones de mostrar/ocultar formularios
function mostrarFormularioRifa() {
  document.getElementById('formulario-rifa').style.display = 'block';
}

function ocultarFormularioRifa() {
  document.getElementById('formulario-rifa').style.display = 'none';
}

function mostrarFormularioGanador() {
  document.getElementById('formulario-ganador').style.display = 'block';
}

function ocultarFormularioGanador() {
  document.getElementById('formulario-ganador').style.display = 'none';
}

function mostrarFormularioEntrega() {
  document.getElementById('formulario-entrega').style.display = 'block';
}

function ocultarFormularioEntrega() {
  document.getElementById('formulario-entrega').style.display = 'none';
}
