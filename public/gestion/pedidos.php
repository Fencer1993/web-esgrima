<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';

$msg = '';
$err = '';

// --- Acciones POST ---------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    gestion_require_csrf();
    $do = (string)($_POST['do'] ?? '');
    if ($do === 'status') {
        $id = (string)($_POST['id'] ?? '');
        $st = (string)($_POST['status'] ?? '');
        if (!isset(PEDIDO_ESTADOS[$st]) || $id === '') {
            $err = 'Estado no válido.';
        } else {
            $found = false;
            $ok = pedidos_update(function (array $rows) use ($id, $st, &$found) {
                foreach ($rows as &$r) {
                    if ((string)$r['id'] === $id) {
                        $r['status'] = $st;
                        $r['updated_at'] = date('c');
                        $found = true;
                    }
                }
                return $rows;
            });
            if ($ok && $found) { $msg = 'Estado actualizado.'; } else { $err = 'No se pudo actualizar el pedido.'; }
        }
    } elseif ($do === 'group_all') {
        $n = 0;
        $ok = pedidos_update(function (array $rows) use (&$n) {
            foreach ($rows as &$r) {
                if (($r['status'] ?? '') === 'nuevo') {
                    $r['status'] = 'agrupado';
                    $r['updated_at'] = date('c');
                    $n++;
                }
            }
            return $rows;
        });
        if ($ok) { $msg = "$n pedido(s) marcados como agrupados."; } else { $err = 'No se pudo actualizar.'; }
    }
    // Patrón PRG para no repetir el POST al recargar.
    $_SESSION['flash'] = [$msg, $err];
    $v = preg_replace('/[^a-z]/', '', (string)($_POST['view'] ?? 'lista'));
    header('Location: pedidos.php?view=' . $v);
    exit;
}
if (!empty($_SESSION['flash'])) {
    [$msg, $err] = $_SESSION['flash'];
    unset($_SESSION['flash']);
}

$orders = pedidos_read();
$view = (string)($_GET['view'] ?? 'lista');
$summary = pedidos_summary($orders);

// --- Exportaciones CSV -----------------------------------------------------
if (isset($_GET['csv'])) {
    $which = (string)$_GET['csv'];
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . ($which === 'resumen' ? 'resumen-proveedor-' : 'pedidos-') . date('Y-m-d') . '.csv"');
    echo "\xEF\xBB\xBF";
    if ($which === 'resumen') {
        echo csv_line(['Proveedor', 'Producto', 'Talla · Mano', 'Cantidad total', 'Socios']);
        foreach ($summary as $sup => $prods) {
            foreach ($prods as $prod => $sizes) {
                foreach ($sizes as $size => $c) {
                    echo csv_line([$sup, $prod, $size, $c['qty'], implode(', ', $c['names'])]);
                }
            }
        }
    } else {
        echo csv_line(['ID', 'Fecha', 'Estado', 'Nombre', 'Email', 'Teléfono', 'Notas', 'Proveedor', 'Producto', 'Talla', 'Mano', 'Cantidad']);
        foreach ($orders as $o) {
            $base = [$o['id'] ?? '', $o['created_at'] ?? '', $o['status'] ?? '', $o['name'] ?? '', $o['email'] ?? '', $o['phone'] ?? '', $o['notes'] ?? ''];
            $lines = $o['lines'] ?? [];
            if (!$lines) { echo csv_line(array_merge($base, ['', '', '', '', ''])); }
            foreach ($lines as $l) {
                echo csv_line(array_merge($base, [$l['supplier'] ?? '', $l['product'] ?? '', $l['size'] ?? '', $l['hand'] ?? '', $l['qty'] ?? '']));
            }
        }
    }
    exit;
}

gestion_header('Pedidos', 'pedidos.php');
$nNuevos = count(array_filter($orders, fn($o) => ($o['status'] ?? '') === 'nuevo'));
?>
<h1>Pedidos de la tienda</h1>
<?php if ($msg): ?><p class="ok"><?= h($msg) ?></p><?php endif; ?>
<?php if ($err): ?><p class="alert"><?= h($err) ?></p><?php endif; ?>

<div class="tabs">
  <a class="btn <?= $view === 'resumen' ? 'ghost' : '' ?>" href="pedidos.php?view=lista">Lista de pedidos</a>
  <a class="btn <?= $view !== 'resumen' ? 'ghost' : '' ?>" href="pedidos.php?view=resumen">Resumen para el proveedor</a>
  <a class="btn sky" href="pedidos.php?csv=pedidos">CSV pedidos</a>
  <a class="btn sky" href="pedidos.php?csv=resumen">CSV resumen</a>
  <form method="post" action="pedidos.php" onsubmit="return confirm('¿Marcar todos los pedidos nuevos como agrupados?')">
    <?= gestion_csrf_field() ?><input type="hidden" name="do" value="group_all"><input type="hidden" name="view" value="<?= h($view) ?>">
    <button type="submit" <?= $nNuevos ? '' : 'disabled' ?>>Marcar todos como agrupados (<?= $nNuevos ?>)</button>
  </form>
</div>

<?php if ($view === 'resumen'): ?>
  <h2>Resumen para el proveedor</h2>
  <p class="muted">Pedidos abiertos (nuevo + agrupado), sumados por proveedor, producto, talla y mano.</p>
  <?php if (!$summary): ?><p>No hay pedidos abiertos.</p><?php endif; ?>
  <?php foreach ($summary as $sup => $prods): $tot = 0; foreach ($prods as $s) foreach ($s as $c) $tot += $c['qty']; ?>
    <h3><?= h($sup) ?> · <?= $tot ?> uds.</h3>
    <div class="scroll"><table>
      <tr><th>Producto</th><th>Talla · Mano</th><th>Total</th><th>Socios</th></tr>
      <?php foreach ($prods as $prod => $sizes): foreach ($sizes as $size => $c): ?>
        <tr><td><?= h($prod) ?></td><td><?= h($size) ?></td><td><strong><?= (int)$c['qty'] ?></strong></td><td><?= h(implode(', ', $c['names'])) ?></td></tr>
      <?php endforeach; endforeach; ?>
    </table></div>
  <?php endforeach; ?>
<?php else: ?>
  <h2>Lista (<?= count($orders) ?>)</h2>
  <?php if (!$orders): ?><p>Todavía no hay pedidos.</p><?php endif; ?>
  <div class="scroll"><table>
    <?php foreach (array_reverse($orders) as $o): $st = (string)($o['status'] ?? 'nuevo'); ?>
      <tr>
        <td>
          <strong><?= h($o['name'] ?? '') ?></strong> <span class="pill <?= h($st) ?>"><?= h(PEDIDO_ESTADOS[$st] ?? $st) ?></span><br>
          <span class="muted"><?= h($o['created_at'] ?? '') ?> · <?= h($o['email'] ?? '') ?> · <?= h($o['phone'] ?? '') ?></span>
          <?php if (!empty($o['notes'])): ?><br><em><?= h($o['notes']) ?></em><?php endif; ?>
        </td>
        <td>
          <?php foreach (($o['lines'] ?? []) as $l): ?>
            <?= (int)($l['qty'] ?? 0) ?> × <?= h($l['product'] ?? '') ?> <span class="muted">(<?= h(($l['size'] ?? '') !== '' ? $l['size'] : '—') ?><?= !empty($l['hand']) ? ' · ' . h($l['hand']) : '' ?> · <?= h($l['supplier'] ?? '') ?>)</span><br>
          <?php endforeach; ?>
        </td>
        <td>
          <form method="post" action="pedidos.php" class="row">
            <?= gestion_csrf_field() ?><input type="hidden" name="do" value="status"><input type="hidden" name="view" value="lista">
            <input type="hidden" name="id" value="<?= h($o['id'] ?? '') ?>">
            <select name="status" aria-label="Estado">
              <?php foreach (PEDIDO_ESTADOS as $k => $label): ?>
                <option value="<?= h($k) ?>" <?= $k === $st ? 'selected' : '' ?>><?= h($label) ?></option>
              <?php endforeach; ?>
            </select>
            <button type="submit">Guardar</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </table></div>
<?php endif; ?>
<?php gestion_footer();
