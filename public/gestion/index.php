<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';

$orders = pedidos_read();
$nuevos = count(array_filter($orders, fn($o) => ($o['status'] ?? '') === 'nuevo'));
$abiertos = count(array_filter($orders, fn($o) => in_array($o['status'] ?? '', PEDIDO_ABIERTOS, true)));

gestion_header('Panel', 'index.php');
?>
<h1>Panel de gestión</h1>
<div class="cards">
  <a class="card" href="pedidos.php">
    <div class="n"><?= $nuevos ?></div><strong>Pedidos nuevos</strong>
    <p><?= $abiertos ?> abiertos · <?= count($orders) ?> en total</p>
  </a>
  <a class="card" href="convocatoria.php">
    <div class="n">✎</div><strong>Convocatorias</strong>
    <p>Genera textos para WhatsApp, SportMember y la web.</p>
  </a>
  <a class="card" href="calendario.php">
    <div class="n">▦</div><strong>Calendario</strong>
    <p>Próximos eventos del club.</p>
  </a>
</div>
<?php gestion_footer();
