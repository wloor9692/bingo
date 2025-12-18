<?php include 'partials/header.php'; ?>

<div class="card-header">
    <h1 class="card-title"><i class="fas fa-undo"></i> Devoluciones de Boletos</h1>
    <button class="btn btn-primary" onclick="mostrarFormularioDevolucion()">
        <i class="fas fa-plus"></i> Registrar Devolución
    </button>
</div>

<!-- Estadísticas -->
<div class="stats-grid">
    <div class="stat-card">
        <div class="stat-card-title">Total Devoluciones</div>
        <div class="stat-card-value" id="stat-devoluciones">0</div>
    </div>
    <div class="stat-card warning">
        <div class="stat-card-title">Boletos Devueltos</div>
        <div class="stat-card-value" id="stat-boletos-devueltos">0</div>
    </div>
    <div class="stat-card success">
        <div class="stat-card-title">Boletos que se Vendieron</div>
        <div class="stat-card-value" id="stat-boletos-vendidos">0</div>
    </div>
</div>

<!-- Filtros -->
<div class="filters">
    <div class="filters-row">
        <div class="form-group">
            <label>Vendedor</label>
            <select id="filtro-vendedor" class="form-control" onchange="cargarDevoluciones()">
                <option value="">Todos</option>
            </select>
        </div>
        <div class="form-group">
            <label>Evento</label>
            <select id="filtro-evento" class="form-control" onchange="cargarDevoluciones()">
                <option value="">Todos</option>
            </select>
        </div>
        <div class="form-group">
            <label>Desde</label>
            <input type="date" id="filtro-desde" class="form-control" onchange="cargarDevoluciones()">
        </div>
        <div class="form-group">
            <label>Hasta</label>
            <input type="date" id="filtro-hasta" class="form-control" onchange="cargarDevoluciones()">
        </div>
    </div>
</div>

<!-- Tabla de devoluciones -->
<div class="card">
    <div class="table-container">
        <table class="table">
            <thead>
                <tr>
                    <th>Código Hoja</th>
                    <th>Vendedor</th>
                    <th>Evento</th>
                    <th>Vendidos</th>
                    <th>Devueltos</th>
                    <th>Fecha Devolución</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-devoluciones">
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Cargando devoluciones...</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Formulario de devolución -->
<div id="formulario-devolucion" style="display: none;">
    <div class="card">
        <div class="card-header">
            <h2>Registrar Devolución</h2>
            <button class="btn btn-secondary" onclick="ocultarFormularioDevolucion()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <form id="form-devolucion" onsubmit="return guardarDevolucion(event)">
            <div class="form-group">
                <label for="codigo_hoja">Código de Hoja *</label>
                <input type="text" id="codigo_hoja" name="codigo_hoja" class="form-control" required placeholder="Escanear código QR de la hoja">
                <button type="button" class="btn btn-info mt-2" onclick="verificarHoja()">
                    <i class="fas fa-search"></i> Verificar
                </button>
            </div>

            <div id="info-hoja" style="display: none;" class="card mt-3">
                <h3>Información de la Hoja</h3>
                <div id="detalle-hoja"></div>
            </div>

            <div class="modal-footer">
                <button type="submit" class="btn btn-primary" id="btn-devolver" disabled>
                    <i class="fas fa-undo"></i> Registrar Devolución
                </button>
            </div>
        </form>
    </div>
</div>

<script src="<?= JS_URL ?>/devoluciones.js"></script>

<?php include 'partials/footer.php'; ?>
