<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';
require_once dirname(__DIR__) . '/push-lib.php';

date_default_timezone_set('Europe/Madrid');

$errors = [];
$notice = '';
$form = ['title' => '', 'body' => '', 'url' => ''];
$step = 'form';

/** Normaliza un texto de una línea (título) o de varias (cuerpo, sin saltos). */
function aviso_clean(string $v, int $max): string
{
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    gestion_require_csrf();
    $do = (string)($_POST['do'] ?? '');
    $rawTitle = trim((string)($_POST['title'] ?? ''));
    $rawBody = trim((string)($_POST['body'] ?? ''));
    $rawUrl = trim((string)($_POST['url'] ?? ''));
    $form = ['title' => $rawTitle, 'body' => $rawBody, 'url' => $rawUrl];

    if ($do === 'preview' || $do === 'send') {
        if ($rawTitle === '') {
            $errors[] = 'Escribe un título.';
        } elseif (mb_strlen($rawTitle) > 60) {
            $errors[] = 'El título no puede pasar de 60 caracteres.';
        }
        if ($rawBody === '') {
            $errors[] = 'Escribe el texto del aviso.';
        } elseif (mb_strlen($rawBody) > 160) {
            $errors[] = 'El texto no puede pasar de 160 caracteres.';
        }
        if ($rawUrl !== '' && !preg_match('#^/(?!/)[A-Za-z0-9\-._~/%?=&\#]{0,198}$#', $rawUrl)) {
            $errors[] = 'El enlace debe ser una ruta interna, por ejemplo /calendario/ o /noticias/.';
        }
        if (!$errors) {
            $step = 'confirm';
            if ($do === 'send') {
                $last = push_avisos()[0] ?? null;
                $lastTs = $last ? (int)strtotime((string)($last['created_at'] ?? '')) : 0;
                if ($lastTs && time() - $lastTs < 30) {
                    $errors[] = 'Se acaba de enviar otro aviso. Espera unos segundos.';
                    $step = 'form';
                } else {
                    @set_time_limit(120);
                    $subs = push_subs();
                    $id = bin2hex(random_bytes(6));
                    $ok = push_aviso_add([
                        'id' => $id,
                        'title' => aviso_clean($rawTitle, 60),
                        'body' => aviso_clean($rawBody, 160),
                        'url' => $rawUrl === '' ? '/' : $rawUrl,
                        'created_at' => gmdate('c'),
                        'total' => count($subs),
                        'sent' => 0,
                        'failed' => 0,
                        'removed' => 0,
                    ]);
                    if (!$ok) {
                        $errors[] = 'No se pudo guardar el aviso (carpeta de datos sin permisos).';
                        $step = 'form';
                    } else {
                        $r = push_send_all($subs);
                        push_aviso_update($id, $r);
                        $notice = "Aviso enviado: {$r['sent']} entregados, {$r['failed']} con error, {$r['removed']} dispositivos dados de baja.";
                        $step = 'form';
                        $form = ['title' => '', 'body' => '', 'url' => ''];
                    }
                }
            }
        } else {
            $step = 'form';
        }
    }
}

$subCount = count(push_subs());
$history = array_slice(push_avisos(), 0, 30);

gestion_header('Avisos', 'avisos.php');
?>
<h1>Avisos al móvil</h1>
<p class="muted">Notificaciones push para quien ha activado los avisos en la web del club.
  Suscriptores activos: <strong><?= $subCount ?></strong>.</p>

<?php if ($notice !== ''): ?><p class="ok"><?= h($notice) ?></p><?php endif; ?>
<?php foreach ($errors as $e): ?><p class="alert"><?= h($e) ?></p><?php endforeach; ?>

<?php if ($step === 'confirm'): ?>
  <h2>Confirmar envío</h2>
  <div class="card" style="max-width:32rem">
    <strong><?= h($form['title']) ?></strong>
    <p><?= h($form['body']) ?></p>
    <p class="muted">Enlace: <?= h($form['url'] === '' ? '/ (inicio)' : $form['url']) ?></p>
  </div>
  <p>Se enviará a <strong><?= $subCount ?></strong> dispositivo<?= $subCount === 1 ? '' : 's' ?>. No se puede deshacer.</p>
  <form method="post" action="avisos.php" class="row">
    <?= gestion_csrf_field() ?>
    <input type="hidden" name="title" value="<?= h($form['title']) ?>">
    <input type="hidden" name="body" value="<?= h($form['body']) ?>">
    <input type="hidden" name="url" value="<?= h($form['url']) ?>">
    <button type="submit" name="do" value="send">Sí, enviar ahora</button>
    <button type="submit" name="do" value="edit" class="ghost">Volver y editar</button>
  </form>
<?php else: ?>
  <h2>Nuevo aviso</h2>
  <form method="post" action="avisos.php" style="max-width:32rem">
    <?= gestion_csrf_field() ?>
    <p><label for="t"><strong>Título</strong> <span class="muted">(máx. 60)</span></label><br>
      <input id="t" name="title" type="text" maxlength="60" required style="width:100%" value="<?= h($form['title']) ?>"></p>
    <p><label for="b"><strong>Texto</strong> <span class="muted">(máx. 160)</span></label><br>
      <textarea id="b" name="body" rows="3" maxlength="160" required><?= h($form['body']) ?></textarea></p>
    <p><label for="u"><strong>Enlace</strong> <span class="muted">(opcional, ruta interna: /calendario/, /noticias/…)</span></label><br>
      <input id="u" name="url" type="text" maxlength="200" placeholder="/calendario/" style="width:100%" value="<?= h($form['url']) ?>"></p>
    <button type="submit" name="do" value="preview" <?= $subCount === 0 ? 'disabled title="Aún no hay suscriptores"' : '' ?>>Enviar aviso</button>
    <span class="muted">Te pediremos confirmación antes de enviarlo.</span>
  </form>
<?php endif; ?>

<h2>Historial</h2>
<?php if (!$history): ?>
  <p class="muted">Todavía no se ha enviado ningún aviso.</p>
<?php else: ?>
  <div class="scroll"><table>
    <tr><th>Fecha</th><th>Aviso</th><th>Enlace</th><th>Entregados</th><th>Errores</th><th>Bajas</th></tr>
    <?php foreach ($history as $a): $ts = strtotime((string)($a['created_at'] ?? '')); ?>
      <tr>
        <td><?= $ts ? h(date('d/m/Y H:i', $ts)) : '' ?></td>
        <td><strong><?= h($a['title'] ?? '') ?></strong><br><span class="muted"><?= h($a['body'] ?? '') ?></span></td>
        <td><?= h($a['url'] ?? '/') ?></td>
        <td><?= (int)($a['sent'] ?? 0) ?> / <?= (int)($a['total'] ?? 0) ?></td>
        <td><?= (int)($a['failed'] ?? 0) ?></td>
        <td><?= (int)($a['removed'] ?? 0) ?></td>
      </tr>
    <?php endforeach; ?>
  </table></div>
<?php endif; ?>
<?php gestion_footer();
