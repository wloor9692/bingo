<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $title ?? 'Sistema de BINGO' ?> - <?= SITE_NAME ?></title>
    <link rel="stylesheet" href="<?= CSS_URL ?>/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <nav class="navbar">
        <div class="container">
            <div class="navbar-brand">
                <a href="<?= SITE_URL ?>">
                    <i class="fas fa-dice"></i> <?= SITE_NAME ?>
                </a>
            </div>
            <ul class="navbar-menu">
                <li><a href="<?= SITE_URL ?>/vendedores"><i class="fas fa-users"></i> Vendedores</a></li>
                <li><a href="<?= SITE_URL ?>/eventos"><i class="fas fa-calendar"></i> Eventos</a></li>
                <li><a href="<?= SITE_URL ?>/asignaciones"><i class="fas fa-ticket-alt"></i> Asignaciones</a></li>
                <li><a href="<?= SITE_URL ?>/devoluciones"><i class="fas fa-undo"></i> Devoluciones</a></li>
                <li><a href="<?= SITE_URL ?>/juego"><i class="fas fa-gamepad"></i> Juego</a></li>
                <li><a href="<?= SITE_URL ?>/reportes"><i class="fas fa-chart-bar"></i> Reportes</a></li>
                <li><a href="<?= SITE_URL ?>/logout"><i class="fas fa-sign-out-alt"></i> Salir</a></li>
            </ul>
        </div>
    </nav>
    <main class="container main-content">
