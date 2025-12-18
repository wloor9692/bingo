<?php include 'partials/header.php'; ?>

<div class="card-header">
    <h1 class="card-title"><i class="fas fa-ticket-alt"></i> Asignación de Boletos</h1>
    <button class="btn btn-primary" onclick="mostrarFormularioAsignacion()">
        <i class="fas fa-plus"></i> Nueva Asignación
    </button>
</div>

<!-- Estadísticas -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-card-title">Total Hojas</div>
        <div class="stat-card-value" id="stat-hojas">0</div>
    </div>
    <div class="stat-card">
        <div class="stat-card-title">Total Boletos</div>
        <div class="stat-card-value" id="stat-boletos">0</div>
    </div>
    <div class="stat-card success">
        <div class="stat-card-title">Boletos Vendidos</div>
        <div class="stat-card-value" id="stat-vendidos">0</div>
    </div>
    <div class="stat-card warning">
        <div class="stat-card-title">Boletos Disponibles</div>
        <div class="stat-card-value" id="stat-disponibles">0</div>
    </div>
</div>

<!-- Filtros -->
<div class="filters">
    <div class="filters-row">
        <div class="form-group">
            <label>Vendedor</label>
            <select id="filtro-vendedor" class="form-control" onchange="cargarAsignaciones()">
                <option value="">Todos</option>
            </select>
        </div>
        <div class="form-group">
            <label>Evento</label>
            <select id="filtro-evento" class="form-control" onchange="cargarAsignaciones()">
                <option value="">Todos</option>
            </select>
        </div>
        <div class="form-group">
            <label>Estado</label>
            <select id="filtro-estado" class="form-control" onchange="cargarAsignaciones()">
                <option value="">Todos</option>
                <option value="asignado">Asignado</option>
                <option value="vendido">Vendido</option>
                <option value="devuelto">Devuelto</option>
            </select>
        </div>
    </div>
</div>

<!-- Tabla de asignaciones -->
<div class="card">
    <div class="table-container">
        <table class="table">
            <thead>
                <tr>
                    <th>Código Hoja</th>
                    <th>Vendedor</th>
                    <th>Evento</th>
                    <th>Fecha Evento</th>
                    <th>Boletos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-asignaciones">
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Cargando asignaciones...</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Formulario de asignación -->
<div id="formulario-asignacion" style="display: none;">
    <div class="card">
        <div class="card-header">
            <h2>Nueva Asignación de Boletos</h2>
            <button class="btn btn-secondary" onclick="ocultarFormularioAsignacion()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <form id="form-asignacion" onsubmit="return guardarAsignacion(event)">
            <div class="form-row">
                <div class="form-group">
                    <label for="vendedor_id">Vendedor *</label>
                    <select id="vendedor_id" name="vendedor_id" class="form-control" required>
                        <option value="">Seleccionar vendedor...</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="evento_id">Evento *</label>
                    <select id="evento_id" name="evento_id" class="form-control" required>
                        <option value="">Seleccionar evento...</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="cantidad_hojas">Cantidad de Hojas *</label>
                <input type="number" id="cantidad_hojas" name="cantidad_hojas" class="form-control" min="1" value="1" required>
                <small class="text-muted">Cada hoja contiene 8 boletos de BINGO</small>
            </div>

            <div class="alert alert-info">
                <i class="fas fa-info-circle"></i>
                <strong>Nota:</strong> Se generarán <span id="total-boletos">8</span> boletos únicos con sus códigos QR.
            </div>

            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-ticket-alt"></i> Generar Boletos
                </button>
            </div>
        </form>
    </div>
</div>

<script src="<?= JS_URL ?>/asignaciones.js"></script>

<?php include 'partials/footer.php'; ?>
