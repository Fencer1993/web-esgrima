<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';
require __DIR__ . '/xlsx.php';

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
    } elseif ($do === 'club') {
        // Material del club: va en su propio bloque del Excel y sin comisión.
        $id = (string)($_POST['id'] ?? '');
        $on = ($_POST['club'] ?? '') === '1';
        $ok = pedidos_update(function (array $rows) use ($id, $on) {
            foreach ($rows as &$r) {
                if ((string)$r['id'] === $id) {
                    $r['club'] = $on;
                    $r['updated_at'] = date('c');
                }
            }
            return $rows;
        });
        if ($ok) { $msg = $on ? 'Marcado como material del club.' : 'Ya no es material del club.'; } else { $err = 'No se pudo actualizar el pedido.'; }
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

// --- Excel con el formato de la plantilla del club --------------------------
$months = array_values(array_unique(array_filter(array_map('xlsx_order_month', $orders))));
rsort($months);
if (isset($_GET['xlsx'])) {
    $want = (string)$_GET['xlsx'];
    if (preg_match('/^curso-(\d{4})$/', $want, $m)) {
        // Curso deportivo: de septiembre a agosto, solo los meses con pedidos.
        $sel = array_values(array_filter($months, fn($ym) => $ym >= $m[1] . '-09' && $ym <= ((int)$m[1] + 1) . '-08'));
        sort($sel);
        $fname = 'pedidos-material-' . $m[1] . '-' . substr((string)((int)$m[1] + 1), 2);
    } elseif (in_array($want, $months, true)) {
        $sel = [$want];
        $fname = 'pedido-material-' . $want;
    } else {
        $sel = [];
    }
    if ($sel) {
        $bin = xlsx_build($orders, $sel);
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="' . $fname . '.xlsx"');
        header('Content-Length: ' . strlen($bin));
        echo $bin;
        exit;
    }
}
$courses = array_values(array_unique(array_map(fn($ym) => (int)substr($ym, 5, 2) >= 9 ? (int)substr($ym, 0, 4) : (int)substr($ym, 0, 4) - 1, $months)));

// --- Exportaciones CSV -----------------------------------------------------
if (isset($_GET['csv'])) {
    $which = (string)$_GET['csv'];
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="' . ($which === 'resumen' ? 'resumen-proveedor-' : 'pedidos-') . date('Y-m-d') . '.csv"');
    echo "\xEF\xBB\xBF";
    if ($which === 'resumen') {
        echo csv_line(['Proveedor', 'Producto', 'Talla · Mano · Opciones', 'Cantidad total', 'Socios']);
        foreach ($summary as $sup => $prods) {
            foreach ($prods as $prod => $sizes) {
                foreach ($sizes as $size => $c) {
                    echo csv_line([$sup, $prod, $size, $c['qty'], implode(', ', $c['names'])]);
                }
            }
        }
    } else {
        echo csv_line(['ID', 'Fecha', 'Estado', 'Nombre', 'Email', 'Teléfono', 'Notas', 'Proveedor', 'Producto', 'Talla', 'Mano', 'Opciones', 'Cantidad']);
        foreach ($orders as $o) {
            $base = [$o['id'] ?? '', $o['created_at'] ?? '', $o['status'] ?? '', $o['name'] ?? '', $o['email'] ?? '', $o['phone'] ?? '', $o['notes'] ?? ''];
            $lines = $o['lines'] ?? [];
            if (!$lines) { echo csv_line(array_merge($base, ['', '', '', '', '', ''])); }
            foreach ($lines as $l) {
                echo csv_line(array_merge($base, [$l['supplier'] ?? '', $l['product'] ?? '', $l['size'] ?? '', $l['hand'] ?? '', $l['options'] ?? '', $l['qty'] ?? '']));
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
  <form method="get" action="pedidos.php" class="row">
    <select name="xlsx" aria-label="Mes o curso del Excel" <?= $months ? '' : 'disabled' ?>>
      <?php foreach ($months as $ym): ?><option value="<?= h($ym) ?>"><?= h(ucfirst(xlsx_month_title($ym))) ?></option><?php endforeach; ?>
      <?php foreach ($courses as $c): ?><option value="curso-<?= $c ?>">Curso <?= $c ?>-<?= substr((string)($c + 1), 2) ?> (una hoja por mes)</option><?php endforeach; ?>
    </select>
    <button type="submit" class="btn sky" <?= $months ? '' : 'disabled' ?>>Excel del pedido</button>
  </form>
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
      <tr><th>Producto</th><th>Talla · Mano · Opciones</th><th>Total</th><th>Socios</th></tr>
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
          <strong><?= h($o['name'] ?? '') ?></strong> <span class="pill <?= h($st) ?>"><?= h(PEDIDO_ESTADOS[$st] ?? $st) ?></span><?php if (!empty($o['club'])): ?> <span class="pill agrupado">Material del club</span><?php endif; ?><br>
          <span class="muted"><?= h($o['created_at'] ?? '') ?> · <?= h($o['email'] ?? '') ?> · <?= h($o['phone'] ?? '') ?></span>
          <?php if (!empty($o['notes'])): ?><br><em><?= h($o['notes']) ?></em><?php endif; ?>
        </td>
        <td>
          <?php foreach (($o['lines'] ?? []) as $l): ?>
            <?= (int)($l['qty'] ?? 0) ?> × <?= h($l['product'] ?? '') ?> <span class="muted">(<?= h(($l['size'] ?? '') !== '' ? $l['size'] : '—') ?><?= !empty($l['hand']) ? ' · ' . h($l['hand']) : '' ?><?= !empty($l['options']) ? ' · ' . h($l['options']) : '' ?> · <?= h($l['supplier'] ?? '') ?>)</span><br>
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
          <form method="post" action="pedidos.php" class="row">
            <?= gestion_csrf_field() ?><input type="hidden" name="do" value="club"><input type="hidden" name="view" value="lista">
            <input type="hidden" name="id" value="<?= h($o['id'] ?? '') ?>"><input type="hidden" name="club" value="<?= empty($o['club']) ? '1' : '0' ?>">
            <button type="submit" class="ghost"><?= empty($o['club']) ? 'Es material del club' : 'Quitar «material del club»' ?></button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </table></div>
<?php endif; ?>
<?php gestion_footer();
