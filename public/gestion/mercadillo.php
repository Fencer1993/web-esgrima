<?php
declare(strict_types=1);
require __DIR__ . '/auth.php';
require __DIR__ . '/layout.php';
require_once dirname(__DIR__) . '/mercadillo-lib.php';

date_default_timezone_set('Europe/Madrid');
$dataDir = gestion_data_dir();
$cfg = mer_config();
$tipos = mer_options($cfg, 'tipos');
$estados = mer_options($cfg, 'estados');
$manos = mer_options($cfg, 'manos');

// --- Foto (siempre, con sesión iniciada) -----------------------------------
if (isset($_GET['foto'])) {
    $p = mer_photo_path($dataDir, (string)$_GET['foto']);
    if ($p === null) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'No encontrada';
        exit;
    }
    header('Content-Type: ' . mer_photo_mime($p));
    header('Content-Length: ' . filesize($p));
    readfile($p);
    exit;
}

mer_purge($dataDir);

// --- Acciones ---------------------------------------------------------------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    gestion_require_csrf();
    $id = (string)($_POST['id'] ?? '');
    $do = (string)($_POST['do'] ?? '');
    $msg = '';
    $err = '';
    $target = null;
    foreach (mer_read($dataDir) as $r) {
        if ((string)$r['id'] === $id) {
            $target = $r;
        }
    }
    if ($target === null || !in_array($do, ['aprobar', 'rechazar', 'vendido', 'borrar'], true)) {
        $err = 'No se encontró el anuncio.';
    } else {
        $reason = res_clean((string)($_POST['motivo'] ?? ''), 300);
        $now = date('c');
        if ($do === 'borrar') {
            $photos = is_array($target['photos'] ?? null) ? $target['photos'] : [];
            $ok = mer_update($dataDir, function (array $rows) use ($id) {
                return array_values(array_filter($rows, fn($r) => (string)$r['id'] !== $id));
            });
            if ($ok) {
                mer_delete_photos($dataDir, $photos);
                $msg = 'Anuncio borrado.';
            } else {
                $err = 'No se pudo borrar el anuncio.';
            }
        } else {
            $newStatus = ['aprobar' => 'aprobado', 'rechazar' => 'rechazado', 'vendido' => 'vendido'][$do];
            $ok = mer_update($dataDir, function (array $rows) use ($id, $newStatus, $reason, $now) {
                foreach ($rows as &$r) {
                    if ((string)$r['id'] === $id) {
                        $r['status'] = $newStatus;
                        $r['updated_at'] = $now;
                        if ($newStatus === 'aprobado') {
                            $r['approved_at'] = $now;
                            $r['expires_at'] = date('c', time() + MER_TTL_DAYS * 86400);
                            unset($r['reject_reason']);
                        } elseif ($newStatus === 'rechazado') {
                            $r['reject_reason'] = $reason;
                        } else {
                            $r['sold_at'] = $now;
                        }
                    }
                }
                return $rows;
            });
            if (!$ok) {
                $err = 'No se pudo actualizar el anuncio.';
            } elseif ($do === 'aprobar') {
                $target['expires_at'] = date('c', time() + MER_TTL_DAYS * 86400);
                mer_mail_approved($target);
                $msg = 'Anuncio publicado. Se ha avisado al anunciante por correo.';
            } elseif ($do === 'rechazar') {
                mer_mail_rejected($target, $reason);
                $msg = 'Anuncio rechazado. Se ha avisado al anunciante por correo.';
            } else {
                $msg = 'Anuncio marcado como vendido.';
            }
        }
    }
    $_SESSION['flash'] = [$msg, $err];
    header('Location: mercadillo.php');
    exit;
}
$msg = '';
$err = '';
if (!empty($_SESSION['flash'])) {
    [$msg, $err] = $_SESSION['flash'];
    unset($_SESSION['flash']);
}

$all = mer_read($dataDir);
// Orden: pendientes, publicados, caducados, vendidos, rechazados; dentro, lo más reciente primero.
$grupos = ['pendiente' => 'Pendientes de revisar', 'aprobado' => 'Publicados', 'caducado' => 'Caducados', 'vendido' => 'Vendidos o encontrados', 'rechazado' => 'Rechazados'];
$por = array_fill_keys(array_keys($grupos), []);
foreach ($all as $r) {
    $k = mer_is_expired($r) ? 'caducado' : (string)($r['status'] ?? 'pendiente');
    if (isset($por[$k])) {
        $por[$k][] = $r;
    }
}
foreach ($por as &$list) {
    usort($list, fn($a, $b) => strcmp((string)($b['created_at'] ?? ''), (string)($a['created_at'] ?? '')));
}
unset($list);

gestion_header('Mercadillo', 'mercadillo.php');
?>
<style>
.ad{border:1px solid var(--line);border-radius:4px;padding:1rem;margin:0 0 1rem;display:grid;gap:.75rem;grid-template-columns:1fr}
.ad .fotos{display:flex;flex-wrap:wrap;gap:.5rem}.ad .fotos a{display:block}.ad .fotos img{width:7rem;height:7rem;object-fit:cover;border-radius:3px;border:1px solid var(--line)}
.ad dl{margin:0;display:grid;grid-template-columns:max-content 1fr;gap:.15rem .75rem;font-size:.9rem}.ad dt{color:var(--muted)}.ad dd{margin:0;overflow-wrap:anywhere}
.ad form{margin:0}.ad input[type=text]{min-width:12rem}
.pill.pendiente{background:#fff4dc;color:#8a5a00}.pill.aprobado{background:#e8f5ec;color:#1f6b3b}.pill.rechazado,.pill.caducado{background:#fdecea;color:#a53324}.pill.vendido{background:#e0f2fb;color:#0f6d98}
</style>
<h1>Mercadillo de segunda mano</h1>
<?php if ($msg): ?><p class="ok"><?= h($msg) ?></p><?php endif; ?>
<?php if ($err): ?><p class="alert"><?= h($err) ?></p><?php endif; ?>
<p class="muted">Revisa que cada anuncio sea de material de esgrima y que las fotos no muestren a personas. Al aprobar, el anuncio se publica 90 días y el anunciante recibe un correo. Los anuncios no aprobados no se ven en la web ni sus fotos.</p>
<?php if (!$all): ?><p>Todavía no hay anuncios.</p><?php endif; ?>

<?php foreach ($grupos as $k => $titulo): if (!$por[$k]) { continue; } ?>
  <h2><?= h($titulo) ?> (<?= count($por[$k]) ?>)</h2>
  <?php foreach ($por[$k] as $r):
      $photos = is_array($r['photos'] ?? null) ? $r['photos'] : [];
      $price = $r['price'] ?? null; ?>
    <article class="ad">
      <div>
        <strong><?= h(($r['kind'] ?? '') === 'busco' ? 'Se busca' : 'Se vende') ?>: <?= h($r['title'] ?? '') ?></strong>
        <span class="pill <?= h($k) ?>"><?= h(mer_status_label($r)) ?></span>
      </div>
      <?php if ($photos): ?><div class="fotos">
        <?php foreach ($photos as $pid): ?><a href="mercadillo.php?foto=<?= h($pid) ?>" target="_blank" rel="noopener"><img src="mercadillo.php?foto=<?= h($pid) ?>" alt="Foto del anuncio" loading="lazy"></a><?php endforeach; ?>
      </div><?php endif; ?>
      <dl>
        <dt>Material</dt><dd><?= h($tipos[$r['category'] ?? ''] ?? ($r['category'] ?? '')) ?></dd>
        <?php if (($r['size'] ?? '') !== ''): ?><dt>Talla</dt><dd><?= h($r['size']) ?></dd><?php endif; ?>
        <?php if (($r['hand'] ?? '') !== ''): ?><dt>Mano</dt><dd><?= h($manos[$r['hand']] ?? $r['hand']) ?></dd><?php endif; ?>
        <?php if (($r['condition'] ?? '') !== ''): ?><dt>Estado</dt><dd><?= h($estados[$r['condition']] ?? $r['condition']) ?></dd><?php endif; ?>
        <dt>Precio</dt><dd><?= $price === null ? '—' : ((int)$price === 0 ? 'Se regala' : h((string)(int)$price) . ' €') ?></dd>
        <?php if (($r['zone'] ?? '') !== ''): ?><dt>Zona</dt><dd><?= h($r['zone']) ?></dd><?php endif; ?>
        <?php if (($r['description'] ?? '') !== ''): ?><dt>Descripción</dt><dd><?= nl2br(h($r['description'])) ?></dd><?php endif; ?>
        <dt>Anunciante</dt><dd><?= h($r['name'] ?? '') ?> · WhatsApp +<?= h($r['phone'] ?? '') ?> · <?= h($r['email'] ?? '') ?></dd>
        <dt>Publicado</dt><dd><?= h(substr((string)($r['created_at'] ?? ''), 0, 10)) ?><?= isset($r['expires_at']) ? ' · caduca el ' . h(substr((string)$r['expires_at'], 0, 10)) : '' ?> · ref. <?= h($r['id']) ?></dd>
        <?php if (($r['reject_reason'] ?? '') !== ''): ?><dt>Motivo</dt><dd><?= h($r['reject_reason']) ?></dd><?php endif; ?>
      </dl>
      <div class="row">
        <?php if (in_array($k, ['pendiente', 'rechazado', 'caducado'], true)): ?>
          <form method="post" action="mercadillo.php"><?= gestion_csrf_field() ?><input type="hidden" name="do" value="aprobar"><input type="hidden" name="id" value="<?= h($r['id']) ?>"><button type="submit">Aprobar<?= $k === 'caducado' ? ' de nuevo' : '' ?></button></form>
        <?php endif; ?>
        <?php if ($k === 'pendiente' || $k === 'aprobado'): ?>
          <form method="post" action="mercadillo.php" class="row"><?= gestion_csrf_field() ?><input type="hidden" name="do" value="rechazar"><input type="hidden" name="id" value="<?= h($r['id']) ?>">
            <input type="text" name="motivo" maxlength="300" placeholder="Motivo (opcional, se envía por correo)" aria-label="Motivo del rechazo"><button class="ghost" type="submit">Rechazar</button></form>
        <?php endif; ?>
        <?php if ($k === 'aprobado'): ?>
          <form method="post" action="mercadillo.php"><?= gestion_csrf_field() ?><input type="hidden" name="do" value="vendido"><input type="hidden" name="id" value="<?= h($r['id']) ?>"><button class="sky btn" type="submit">Marcar vendido</button></form>
        <?php endif; ?>
        <form method="post" action="mercadillo.php" onsubmit="return confirm('¿Borrar este anuncio y sus fotos? No se puede deshacer.')"><?= gestion_csrf_field() ?><input type="hidden" name="do" value="borrar"><input type="hidden" name="id" value="<?= h($r['id']) ?>"><button class="ghost" type="submit">Borrar</button></form>
      </div>
    </article>
  <?php endforeach; ?>
<?php endforeach; ?>
<?php gestion_footer();
