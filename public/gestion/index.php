<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';
require_once dirname(__DIR__) . '/push-lib.php';

$orders = pedidos_read();
$nuevos = count(array_filter($orders, fn($o) => ($o['status'] ?? '') === 'nuevo'));
$abiertos = count(array_filter($orders, fn($o) => in_array($o['status'] ?? '', PEDIDO_ABIERTOS, true)));

date_default_timezone_set('Europe/Madrid');
$hoy = date('Y-m-d');
$prox = count(array_filter(reservas_read(), fn($r) => ($r['status'] ?? '') === 'confirmada' && (string)$r['date'] >= $hoy));

gestion_header('Panel', 'index.php');
?>
<h1>Panel de gestión</h1>
<div class="cards">
  <a class="card" href="pedidos.php">
    <div class="n"><?= $nuevos ?></div><strong>Pedidos nuevos</strong>
    <p><?= $abiertos ?> abiertos · <?= count($orders) ?> en total</p>
  </a>
  <a class="card" href="reservas.php">
    <div class="n"><?= $prox ?></div><strong>Clases gratis reservadas</strong>
    <p>Próximas reservas confirmadas.</p>
  </a>
  <a class="card" href="convocatoria.php">
    <div class="n">✎</div><strong>Convocatorias</strong>
    <p>Genera textos para WhatsApp, SportMember y la web.</p>
  </a>
  <a class="card" href="calendario.php">
    <div class="n">▦</div><strong>Calendario</strong>
    <p>Próximos eventos del club.</p>
  </a>
  <a class="card" href="avisos.php">
    <div class="n"><?= count(push_subs()) ?></div><strong>Avisos al móvil</strong>
    <p>Suscriptores. Envía una notificación a sus móviles.</p>
  </a>
</div>
<?php gestion_footer();
