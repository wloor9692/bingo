<div class="dashboard">
    <h1><i class="fas fa-home"></i> Dashboard - Sistema de BINGO</h1>

    <div class="stats-grid">
        <div class="stat-card">
            <i class="fas fa-users fa-3x"></i>
            <h3 id="total-vendedores">-</h3>
            <p>Vendedores Activos</p>
        </div>

        <div class="stat-card">
            <i class="fas fa-calendar fa-3x"></i>
            <h3 id="eventos-hoy">-</h3>
            <p>Eventos Hoy</p>
        </div>

        <div class="stat-card">
            <i class="fas fa-ticket-alt fa-3x"></i>
            <h3 id="boletos-vendidos">-</h3>
            <p>Boletos Vendidos</p>
        </div>

        <div class="stat-card">
            <i class="fas fa-dollar-sign fa-3x"></i>
            <h3 id="ingresos-hoy">$0</h3>
            <p>Ingresos del Día</p>
        </div>
    </div>

    <div class="quick-actions">
        <h2>Acciones Rápidas</h2>
        <div class="actions-grid">
            <a href="<?= SITE_URL ?>/vendedores" class="action-btn">
                <i class="fas fa-user-plus"></i>
                Nuevo Vendedor
            </a>
            <a href="<?= SITE_URL ?>/eventos" class="action-btn">
                <i class="fas fa-calendar-plus"></i>
                Nuevo Evento
            </a>
            <a href="<?= SITE_URL ?>/asignaciones" class="action-btn">
                <i class="fas fa-ticket-alt"></i>
                Asignar Boletos
            </a>
            <a href="<?= SITE_URL ?>/juego" class="action-btn">
                <i class="fas fa-play"></i>
                Iniciar Juego
            </a>
        </div>
    </div>

    <div class="recent-activity">
        <h2>Actividad Reciente</h2>
        <div id="actividad-lista">
            <p class="text-muted">Cargando actividad...</p>
        </div>
    </div>
</div>

<script>
// Cargar estadísticas del dashboard
async function cargarEstadisticas() {
    try {
        // Aquí irán las llamadas a la API para obtener estadísticas
        // Por ahora datos de ejemplo
        document.getElementById('total-vendedores').textContent = '-';
        document.getElementById('eventos-hoy').textContent = '-';
        document.getElementById('boletos-vendidos').textContent = '-';
        document.getElementById('ingresos-hoy').textContent = '$-';
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Cargar al inicio
document.addEventListener('DOMContentLoaded', cargarEstadisticas);
</script>
