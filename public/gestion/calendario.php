<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';

$file = gestion_find_file('sportmember-calendar.json');
if ($file === null && is_file(gestion_webroot() . '/calendario.json')) {
    $file = gestion_webroot() . '/calendario.json';
}
$items = null;
if ($file !== null) {
    $data = json_decode((string)file_get_contents($file), true);
    if (is_array($data)) {
        $items = array_values(array_filter($data, 'is_array'));
    }
}
$upcoming = [];
if ($items) {
    $now = time();
    foreach ($items as $it) {
        $s = strtotime((string)($it['start'] ?? ''));
        $e = strtotime((string)($it['end'] ?? '')) ?: $s;
        if ($s !== false && ($e ?: $s) >= $now) {
            $it['_ts'] = $s;
            $upcoming[] = $it;
        }
    }
    usort($upcoming, fn($a, $b) => $a['_ts'] <=> $b['_ts']);
}

gestion_header('Calendario', 'calendario.php');
?>
<h1>Calendario</h1>
<?php if ($items === null): ?>
  <p>El calendario aparecerá aquí en cuanto se conecte SportMember.</p>
<?php elseif (!$upcoming): ?>
  <p>No hay próximos eventos en el calendario.</p>
<?php else: ?>
  <div class="scroll"><table>
    <tr><th>Cuándo</th><th>Evento</th><th>Lugar</th><th>Grupo</th></tr>
    <?php foreach ($upcoming as $it): ?>
      <tr>
        <td><?= h(date('d/m/Y H:i', $it['_ts'])) ?><?php if (!empty($it['end']) && ($e = strtotime((string)$it['end']))): ?> – <?= h(date('H:i', $e)) ?><?php endif; ?></td>
        <td><strong><?= h($it['title'] ?? '') ?></strong></td>
        <td><?= h($it['location'] ?? '') ?></td>
        <td><?= h($it['team'] ?? '') ?></td>
      </tr>
    <?php endforeach; ?>
  </table></div>
<?php endif; ?>
<?php gestion_footer();
