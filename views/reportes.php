<?php include 'partials/header.php'; ?>

<div class="card-header">
    <h1 class="card-title"><i class="fas fa-chart-bar"></i> Reportes y Estadísticas</h1>
</div>

<!-- Filtros generales -->
<div class="filters">
    <div class="filters-row">
        <div class="form-group">
            <label>Evento</label>
            <select id="filtro-evento" class="form-control" onchange="cargarReportes()">
                <option value="">Todos los eventos</option>
            </select>
        </div>
        <div class="form-group">
            <label>Desde</label>
            <input type="date" id="filtro-desde" class="form-control" onchange="cargarReportes()">
        </div>
        <div class="form-group">
            <label>Hasta</label>
            <input type="date" id="filtro-hasta" class="form-control" onchange="cargarReportes()">
        </div>
        <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn btn-primary" onclick="cargarReportes()" style="width: 100%;">
                <i class="fas fa-search"></i> Generar Reporte
            </button>
        </div>
    </div>
</div>

<!-- Estadísticas Generales -->
<div class="card">
    <h2><i class="fas fa-chart-line"></i> Resumen General</h2>
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-card-title">Total Eventos</div>
            <div class="stat-card-value" id="total-eventos">0</div>
        </div>
        <div class="stat-card success">
            <div class="stat-card-title">Ingresos Totales</div>
            <div class="stat-card-value" id="ingresos-totales">$0</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-card-title">Boletos Vendidos</div>
            <div class="stat-card-value" id="boletos-vendidos">0</div>
        </div>
        <div class="stat-card">
            <div class="stat-card-title">Vendedores Activos</div>
            <div class="stat-card-value" id="vendedores-activos">0</div>
        </div>
    </div>
</div>

<!-- Reporte por Evento -->
<div class="card">
    <h2><i class="fas fa-calendar-alt"></i> Eventos</h2>
    <div class="table-container">
        <table class="table">
            <thead>
                <tr>
                    <th>Evento</th>
                    <th>Fecha</th>
                    <th>Boletos Asignados</th>
                    <th>Boletos Vendidos</th>
                    <th>% Venta</th>
                    <th>Ingresos</th>
                    <th>Premio</th>
                    <th>Ganancia</th>
                </tr>
            </thead>
            <tbody id="tabla-eventos-reporte">
                <tr>
                    <td colspan="8" class="text-center text-muted">No hay datos</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Reporte por Vendedor -->
<div class="card">
    <h2><i class="fas fa-users"></i> Vendedores</h2>
    <div class="table-container">
        <table class="table">
            <thead>
                <tr>
                    <th>Vendedor</th>
                    <th>Código</th>
                    <th>Boletos Asignados</th>
                    <th>Boletos Vendidos</th>
                    <th>Boletos Devueltos</th>
                    <th>% Efectividad</th>
                    <th>Ingresos Generados</th>
                </tr>
            </thead>
            <tbody id="tabla-vendedores-reporte">
                <tr>
                    <td colspan="7" class="text-center text-muted">No hay datos</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Gráficos (placeholder) -->
<div class="card">
    <h2><i class="fas fa-chart-pie"></i> Gráficos</h2>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
        <div style="text-align: center; padding: 2rem; background: var(--light-color); border-radius: var(--border-radius);">
            <i class="fas fa-chart-bar" style="font-size: 3rem; color: var(--primary-color);"></i>
            <p class="mt-2">Ventas por Evento</p>
        </div>
        <div style="text-align: center; padding: 2rem; background: var(--light-color); border-radius: var(--border-radius);">
            <i class="fas fa-chart-pie" style="font-size: 3rem; color: var(--success-color);"></i>
            <p class="mt-2">Distribución de Vendedores</p>
        </div>
        <div style="text-align: center; padding: 2rem; background: var(--light-color); border-radius: var(--border-radius);">
            <i class="fas fa-chart-line" style="font-size: 3rem; color: var(--warning-color);"></i>
            <p class="mt-2">Tendencia de Ventas</p>
        </div>
    </div>
    <p class="text-muted mt-3"><em>Nota: Los gráficos se pueden implementar usando Chart.js o similar</em></p>
</div>

<!-- Exportar -->
<div class="card">
    <h2><i class="fas fa-download"></i> Exportar Datos</h2>
    <div style="display: flex; gap: 1rem;">
        <button class="btn btn-success" onclick="exportarExcel()">
            <i class="fas fa-file-excel"></i> Exportar a Excel
        </button>
        <button class="btn btn-danger" onclick="exportarPDF()">
            <i class="fas fa-file-pdf"></i> Exportar a PDF
        </button>
        <button class="btn btn-info" onclick="imprimirReporte()">
            <i class="fas fa-print"></i> Imprimir
        </button>
    </div>
</div>

<script src="<?= JS_URL ?>/reportes.js"></script>

<?php include 'partials/footer.php'; ?>
