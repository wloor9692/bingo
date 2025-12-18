<?php include 'partials/header.php'; ?>

<div class="card-header">
    <h1 class="card-title"><i class="fas fa-calendar"></i> Gestión de Eventos</h1>
    <button class="btn btn-primary" onclick="mostrarFormularioEvento()">
        <i class="fas fa-plus"></i> Nuevo Evento
    </button>
</div>

<!-- Filtros -->
<div class="filters">
    <div class="filters-row">
        <div class="form-group">
            <label>Estado</label>
            <select id="filtro-estado" class="form-control" onchange="cargarEventos()">
                <option value="">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="activo">Activo</option>
                <option value="en_curso">En Curso</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
            </select>
        </div>
        <div class="form-group">
            <label>Buscar</label>
            <input type="text" id="buscar-evento" class="form-control" placeholder="Buscar por nombre..." onkeyup="filtrarEventos()">
        </div>
    </div>
</div>

<!-- Tabla de eventos -->
<div class="card">
    <div class="table-container">
        <table class="table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Precio Boleto</th>
                    <th>Premio Total</th>
                    <th>Boletos</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-eventos">
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>Cargando eventos...</p>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<!-- Formulario de evento (oculto inicialmente) -->
<div id="formulario-evento" style="display: none;">
    <div class="card">
        <div class="card-header">
            <h2 id="form-title">Nuevo Evento</h2>
            <button class="btn btn-secondary" onclick="ocultarFormularioEvento()">
                <i class="fas fa-times"></i> Cancelar
            </button>
        </div>
        <form id="form-evento" onsubmit="return guardarEvento(event)">
            <input type="hidden" id="evento-id" name="id">

            <div class="form-row">
                <div class="form-group">
                    <label for="nombre">Nombre del Evento *</label>
                    <input type="text" id="nombre" name="nombre" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="fecha_evento">Fecha del Evento *</label>
                    <input type="date" id="fecha_evento" name="fecha_evento" class="form-control" required>
                </div>
            </div>

            <div class="form-group">
                <label for="descripcion">Descripción</label>
                <textarea id="descripcion" name="descripcion" class="form-control"></textarea>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="precio_boleto">Precio por Boleto *</label>
                    <input type="number" id="precio_boleto" name="precio_boleto" class="form-control" step="0.01" min="0" required>
                </div>
                <div class="form-group">
                    <label for="premio_total">Premio Total *</label>
                    <input type="number" id="premio_total" name="premio_total" class="form-control" step="0.01" min="0" required>
                </div>
            </div>

            <div class="form-group">
                <label for="estado">Estado</label>
                <select id="estado" name="estado" class="form-control">
                    <option value="pendiente">Pendiente</option>
                    <option value="activo">Activo</option>
                </select>
            </div>

            <div class="modal-footer">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Guardar
                </button>
            </div>
        </form>
    </div>
</div>

<script src="<?= JS_URL ?>/eventos.js"></script>

<?php include 'partials/footer.php'; ?>
