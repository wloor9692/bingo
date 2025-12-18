<?php include 'partials/header.php'; ?>

<div class="card-header">
    <h1 class="card-title"><i class="fas fa-gamepad"></i> Juego de BINGO</h1>
    <div id="control-juego">
        <button class="btn btn-success" onclick="mostrarIniciarJuego()" id="btn-iniciar">
            <i class="fas fa-play"></i> Iniciar Juego
        </button>
    </div>
</div>

<!-- Seleccionar evento para iniciar -->
<div id="seleccion-evento" style="display: none;">
    <div class="card">
        <h2>Seleccionar Evento</h2>
        <div class="form-group">
            <label for="evento-juego">Evento *</label>
            <select id="evento-juego" class="form-control">
                <option value="">Seleccionar evento activo...</option>
            </select>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="ocultarIniciarJuego()">Cancelar</button>
            <button class="btn btn-success" onclick="iniciarJuego()">
                <i class="fas fa-play"></i> Iniciar
            </button>
        </div>
    </div>
</div>

<!-- Panel de juego activo -->
<div id="panel-juego" style="display: none;">
    <div class="card">
        <div class="card-header">
            <div>
                <h2 id="nombre-evento-actual">Evento: </h2>
                <p id="info-sesion">Sesión #<span id="sesion-id"></span></p>
            </div>
            <div>
                <button class="btn btn-danger" onclick="finalizarJuego()">
                    <i class="fas fa-stop"></i> Finalizar Juego
                </button>
            </div>
        </div>

        <div class="row" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
            <!-- Tablero de números -->
            <div>
                <h3>Tablero BINGO (1-90)</h3>
                <div id="ultima-bola" class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 2rem; margin-bottom: 1rem; border-radius: 1rem;">
                    <h2>Última Bola</h2>
                    <div style="font-size: 4rem; font-weight: bold;" id="numero-actual">-</div>
                </div>

                <div class="bingo-board" id="tablero-bingo">
                    <!-- Se generará con JavaScript -->
                </div>

                <!-- Control para cantar -->
                <div class="card mt-3">
                    <h3>Cantar Número</h3>
                    <div style="display: flex; gap: 1rem; align-items: end;">
                        <div class="form-group" style="flex: 1;">
                            <label for="numero-cantar">Número (1-90)</label>
                            <input type="number" id="numero-cantar" class="form-control" min="1" max="90" placeholder="Ingrese número">
                        </div>
                        <button class="btn btn-primary btn-lg" onclick="cantarNumero()">
                            <i class="fas fa-microphone"></i> Cantar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Panel lateral -->
            <div>
                <!-- Figuras del evento -->
                <div class="card">
                    <h3>Figuras</h3>
                    <div id="lista-figuras">
                        <!-- Se cargará con JavaScript -->
                    </div>
                </div>

                <!-- Validar ganador -->
                <div class="card mt-3">
                    <h3>Validar Ganador</h3>
                    <form onsubmit="return validarGanador(event)">
                        <div class="form-group">
                            <label for="codigo-ganador">Código QR</label>
                            <input type="text" id="codigo-ganador" class="form-control" placeholder="Escanear boleto" required>
                        </div>
                        <div class="form-group">
                            <label for="figura-ganador">Figura</label>
                            <select id="figura-ganador" class="form-control" required>
                                <option value="">Seleccionar...</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-success btn-lg" style="width: 100%;">
                            <i class="fas fa-check"></i> ¡VALIDAR BINGO!
                        </button>
                    </form>
                </div>

                <!-- Ganadores -->
                <div class="card mt-3">
                    <h3>Ganadores</h3>
                    <div id="lista-ganadores">
                        <p class="text-muted">Aún no hay ganadores</p>
                    </div>
                </div>

                <!-- Estadísticas -->
                <div class="card mt-3">
                    <h3>Estadísticas</h3>
                    <p><strong>Bolas Cantadas:</strong> <span id="total-bolas">0</span> / 90</p>
                    <p><strong>Ganadores:</strong> <span id="total-ganadores">0</span></p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Sin juego activo -->
<div id="sin-juego" class="card">
    <div style="text-align: center; padding: 3rem; color: #6b7280;">
        <i class="fas fa-gamepad" style="font-size: 4rem; margin-bottom: 1rem;"></i>
        <h2>No hay juego activo</h2>
        <p>Inicie un nuevo juego para comenzar</p>
    </div>
</div>

<script src="<?= JS_URL ?>/juego.js"></script>

<?php include 'partials/footer.php'; ?>
