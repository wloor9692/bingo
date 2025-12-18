<div class="page-vendedores">
    <div class="page-header">
        <h1><i class="fas fa-users"></i> Gestión de Vendedores</h1>
        <button class="btn btn-primary" onclick="mostrarFormularioVendedor()">
            <i class="fas fa-plus"></i> Nuevo Vendedor
        </button>
    </div>

    <!-- Formulario de Vendedor (oculto inicialmente) -->
    <div id="formulario-vendedor" class="card" style="display: none;">
        <div class="card-header">
            <h3 id="form-title">Nuevo Vendedor</h3>
            <button class="btn-close" onclick="ocultarFormularioVendedor()">&times;</button>
        </div>
        <div class="card-body">
            <form id="form-vendedor" onsubmit="return guardarVendedor(event)">
                <input type="hidden" id="vendedor-id" name="id">

                <div class="form-row">
                    <div class="form-group">
                        <label for="codigo">Código *</label>
                        <input type="text" id="codigo" name="codigo" required maxlength="50">
                    </div>
                    <div class="form-group">
                        <label for="nombre_completo">Nombre Completo *</label>
                        <input type="text" id="nombre_completo" name="nombre_completo" required maxlength="255">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="telefono">Teléfono</label>
                        <input type="tel" id="telefono" name="telefono" maxlength="20">
                    </div>
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" maxlength="255">
                    </div>
                </div>

                <div class="form-group">
                    <label for="direccion">Dirección</label>
                    <textarea id="direccion" name="direccion" rows="2"></textarea>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Guardar
                    </button>
                    <button type="button" class="btn btn-secondary" onclick="ocultarFormularioVendedor()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Filtros -->
    <div class="filters">
        <select id="filtro-estado" onchange="cargarVendedores()">
            <option value="">Todos los estados</option>
            <option value="1" selected>Solo activos</option>
            <option value="0">Solo inactivos</option>
        </select>

        <input type="text" id="buscar-vendedor" placeholder="Buscar por nombre o código..." onkeyup="filtrarVendedores()">
    </div>

    <!-- Tabla de Vendedores -->
    <div class="table-container">
        <table class="table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Teléfono</th>
                    <th>Email</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-vendedores">
                <tr>
                    <td colspan="6" class="text-center">
                        <i class="fas fa-spinner fa-spin"></i> Cargando vendedores...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>

<script src="<?= JS_URL ?>/vendedores.js"></script>
