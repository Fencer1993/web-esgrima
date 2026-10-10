<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';

date_default_timezone_set('Europe/Madrid');
$hoy = date('Y-m-d');
$msg = '';
$err = '';

/** Aforo por grupo (de reservas-config.json en la raíz web, o de la fuente en local). */
function reservas_capacidades(): array
{
    foreach ([gestion_webroot() . '/reservas-config.json', gestion_webroot() . '/../src/content/data/reservas.json'] as $f) {
        if (is_file($f)) {
            $cfg = json_decode((string)file_get_contents($f), true);
            $out = [];
            foreach (($cfg['groups'] ?? []) as $g) {
                if (is_array($g) && isset($g['id'])) {
                    $out[(string)$g['id']] = max(1, (int)($g['capacity'] ?? 3));
                }
            }
            return $out;
        }
    }
    return [];
}

// --- Cambio de estado ------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    gestion_require_csrf();
    $id = (string)($_POST['id'] ?? '');
    $st = (string)($_POST['status'] ?? '');
    if (($_POST['do'] ?? '') !== 'status' || !isset(RESERVA_ESTADOS[$st]) || $id === '') {
        $err = 'Estado no válido.';
    } else {
        $found = false;
        $ok = reservas_update(function (array $rows) use ($id, $st, &$found) {
            foreach ($rows as &$r) {
                if ((string)$r['id'] === $id) {
                    $r['status'] = $st;
                    $r['updated_at'] = date('c');
                    $found = true;
                }
            }
            return $rows;
        });
        if ($ok && $found) { $msg = 'Estado actualizado.'; } else { $err = 'No se pudo actualizar la reserva.'; }
    }
    // Patrón PRG para no repetir el POST al recargar.
    $_SESSION['flash'] = [$msg, $err];
    $v = ($_POST['view'] ?? '') === 'pasadas' ? 'pasadas' : 'proximas';
    header('Location: reservas.php?view=' . $v);
    exit;
}
if (!empty($_SESSION['flash'])) {
    [$msg, $err] = $_SESSION['flash'];
    unset($_SESSION['flash']);
}

$all = reservas_read();
$view = (($_GET['view'] ?? '') === 'pasadas') ? 'pasadas' : 'proximas';

// --- CSV (todas las reservas, por fecha) ------------------------------------
if (isset($_GET['csv'])) {
    $sorted = $all;
    usort($sorted, fn($a, $b) => [$a['date'], $a['start'] ?? ''] <=> [$b['date'], $b['start'] ?? '']);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="clases-gratis-' . date('Y-m-d') . '.csv"');
    echo "\xEF\xBB\xBF";
    echo csv_line(['ID', 'Fecha clase', 'Hora', 'Grupo', 'Estado', 'Participante', 'Edad', 'Padre/madre/tutor', 'Email', 'Teléfono', 'Comentarios', 'Reservada el', 'Recordada']);
    foreach ($sorted as $r) {
        echo csv_line([
            $r['id'] ?? '', $r['date'] ?? '', ($r['start'] ?? '') . '-' . ($r['end'] ?? ''), $r['group_name'] ?? '',
            RESERVA_ESTADOS[$r['status'] ?? ''] ?? ($r['status'] ?? ''), $r['name'] ?? '', $r['age'] ?? '',
            $r['guardian'] ?? '', $r['email'] ?? '', $r['phone'] ?? '', $r['notes'] ?? '',
            $r['created_at'] ?? '', $r['reminded_at'] ?? '',
        ]);
    }
    exit;
}

$rows = array_values(array_filter($all, fn($r) => $view === 'pasadas' ? (string)$r['date'] < $hoy : (string)$r['date'] >= $hoy));
usort($rows, function ($a, $b) use ($view) {
    $c = [$a['date'], $a['start'] ?? '', $a['group'] ?? '', $a['created_at'] ?? ''] <=> [$b['date'], $b['start'] ?? '', $b['group'] ?? '', $b['created_at'] ?? ''];
    return $view === 'pasadas' ? -$c : $c;
});
// Agrupar por fecha + grupo.
$sesiones = [];
foreach ($rows as $r) {
    $sesiones[$r['date'] . '|' . ($r['group'] ?? '')][] = $r;
}
$caps = reservas_capacidades();

$dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
$meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
$fechaLarga = function (string $d) use ($dias, $meses): string {
    $t = strtotime($d . ' 12:00:00');
    return $t ? $dias[(int)date('w', $t)] . ' ' . (int)date('j', $t) . ' de ' . $meses[(int)date('n', $t) - 1] . ' de ' . date('Y', $t) : $d;
};

gestion_header('Clases gratis', 'reservas.php');
?>
<h1>Reservas de clase gratis</h1>
<?php if ($msg): ?><p class="ok"><?= h($msg) ?></p><?php endif; ?>
<?php if ($err): ?><p class="alert"><?= h($err) ?></p><?php endif; ?>

<div class="tabs">
  <a class="btn <?= $view === 'proximas' ? '' : 'ghost' ?>" href="reservas.php?view=proximas">Próximas</a>
  <a class="btn <?= $view === 'pasadas' ? '' : 'ghost' ?>" href="reservas.php?view=pasadas">Pasadas</a>
  <a class="btn sky" href="reservas.php?csv=1">CSV (todas)</a>
</div>
<p class="muted">Una reserva cancelada libera la plaza. Marca "Asistió" o "No vino" después de la clase.</p>

<?php if (!$sesiones): ?><p>No hay reservas <?= $view === 'pasadas' ? 'pasadas' : 'próximas' ?>.</p><?php endif; ?>
<?php foreach ($sesiones as $list):
    $first = $list[0];
    $activas = count(array_filter($list, fn($r) => ($r['status'] ?? '') !== 'cancelada'));
    $cap = $caps[$first['group'] ?? ''] ?? null; ?>
  <h2><?= h($fechaLarga((string)$first['date'])) ?> · <?= h($first['start'] ?? '') ?>–<?= h($first['end'] ?? '') ?></h2>
  <h3><?= h($first['group_name'] ?? '') ?> · <?= $activas ?><?= $cap ? ' de ' . $cap : '' ?> plazas</h3>
  <div class="scroll"><table>
    <?php foreach ($list as $r): $st = (string)($r['status'] ?? 'confirmada'); ?>
      <tr>
        <td>
          <strong><?= h($r['name'] ?? '') ?></strong><?= isset($r['age']) ? ' (' . (int)$r['age'] . ' años)' : '' ?>
          <span class="pill <?= h(str_replace(' ', '', $st)) ?>"><?= h(RESERVA_ESTADOS[$st] ?? $st) ?></span><br>
          <?php if (!empty($r['guardian'])): ?><span class="muted">Tutor: <?= h($r['guardian']) ?></span><br><?php endif; ?>
          <span class="muted"><?= h($r['email'] ?? '') ?> · <?= h($r['phone'] ?? '') ?> · ref. <?= h($r['id']) ?></span>
          <?php if (!empty($r['notes'])): ?><br><em><?= h($r['notes']) ?></em><?php endif; ?>
        </td>
        <td>
          <form method="post" action="reservas.php" class="row">
            <?= gestion_csrf_field() ?><input type="hidden" name="do" value="status"><input type="hidden" name="view" value="<?= h($view) ?>">
            <input type="hidden" name="id" value="<?= h($r['id']) ?>">
            <select name="status" aria-label="Estado">
              <?php foreach (RESERVA_ESTADOS as $k => $label): ?>
                <option value="<?= h($k) ?>" <?= $k === $st ? 'selected' : '' ?>><?= h($label) ?></option>
              <?php endforeach; ?>
            </select>
            <button type="submit">Guardar</button>
          </form>
        </td>
      </tr>
    <?php endforeach; ?>
  </table></div>
<?php endforeach; ?>
<?php gestion_footer();
