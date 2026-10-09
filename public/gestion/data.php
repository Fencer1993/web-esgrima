<?php
/**
 * Acceso a los datos del club (pedidos, calendario). Solo se incluye desde
 * otras páginas de /gestion/.
 */
declare(strict_types=1);

if (!defined('GESTION_APP')) {
    http_response_code(403);
    exit;
}

const PEDIDO_ESTADOS = [
    'nuevo' => 'Nuevo',
    'agrupado' => 'Agrupado',
    'pedido al proveedor' => 'Pedido al proveedor',
    'recibido' => 'Recibido',
    'entregado' => 'Entregado',
    'cancelado' => 'Cancelado',
];
const PEDIDO_ABIERTOS = ['nuevo', 'agrupado'];

function gestion_webroot(): string
{
    return dirname(__DIR__);
}

/** Carpeta de datos privada: fuera del web root si se puede; si no, _data/. */
function gestion_data_dir(): string
{
    $outside = dirname(gestion_webroot()) . '/club-data';
    if (is_dir($outside) || @mkdir($outside, 0750, true)) {
        if (is_writable($outside)) {
            return $outside;
        }
    }
    $inside = gestion_webroot() . '/_data';
    if (!is_dir($inside)) {
        @mkdir($inside, 0750, true);
    }
    $ht = $inside . '/.htaccess';
    if (is_dir($inside) && !is_file($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\nDeny from all\n</IfModule>\n");
    }
    return $inside;
}

/**
 * Busca un fichero existente en la carpeta privada (primero fuera del web root,
 * después en _data). Devuelve null si no existe.
 */
function gestion_find_file(string $name): ?string
{
    foreach ([dirname(gestion_webroot()) . '/club-data/' . $name, gestion_webroot() . '/_data/' . $name] as $p) {
        if (is_file($p)) {
            return $p;
        }
    }
    return null;
}

function pedidos_path(): string
{
    return gestion_find_file('pedidos.jsonl') ?? (gestion_data_dir() . '/pedidos.jsonl');
}

/** @return array<int,array<string,mixed>> */
/**
 * pedido.php guarda los datos del socio dentro de "customer"; aquí se
 * exponen también arriba (name/email/phone) para las vistas y el CSV.
 */
function pedido_normalize(array $row): array
{
    $c = is_array($row['customer'] ?? null) ? $row['customer'] : [];
    foreach (['name', 'email', 'phone'] as $k) {
        if (!isset($row[$k]) && isset($c[$k])) {
            $row[$k] = $c[$k];
        }
    }
    return $row;
}

function pedidos_read(): array
{
    $path = pedidos_path();
    if (!is_file($path)) {
        return [];
    }
    $out = [];
    $fh = @fopen($path, 'rb');
    if (!$fh) {
        return [];
    }
    flock($fh, LOCK_SH);
    while (($line = fgets($fh)) !== false) {
        $line = trim($line);
        if ($line === '') {
            continue;
        }
        $row = json_decode($line, true);
        if (is_array($row) && isset($row['id'])) {
            $out[] = pedido_normalize($row);
        }
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $out;
}

/**
 * Modifica los pedidos bajo bloqueo exclusivo. $mutate recibe el array de
 * pedidos y devuelve el array nuevo. Reescribe el fichero de forma atómica
 * sobre el propio descriptor (mismo inode, para convivir con pedido.php).
 * Los renglones ilegibles se conservan tal cual.
 */
function pedidos_update(callable $mutate): bool
{
    $path = pedidos_path();
    if (!is_file($path)) {
        return false;
    }
    $fh = @fopen($path, 'c+b');
    if (!$fh) {
        return false;
    }
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        return false;
    }
    $rows = [];
    $raw = [];
    while (($line = fgets($fh)) !== false) {
        $t = trim($line);
        if ($t === '') {
            continue;
        }
        $row = json_decode($t, true);
        if (is_array($row) && isset($row['id'])) {
            $rows[] = $row;
        } else {
            $raw[] = $t;
        }
    }
    // Copia de seguridad previa a cada reescritura.
    @copy($path, $path . '.bak');
    $new = $mutate($rows);
    $buf = '';
    foreach ($new as $r) {
        $buf .= json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
    }
    foreach ($raw as $r) {
        $buf .= $r . "\n";
    }
    rewind($fh);
    ftruncate($fh, 0);
    $ok = fwrite($fh, $buf) === strlen($buf);
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $ok;
}

/**
 * Agrega pedidos abiertos: proveedor → producto → talla.
 * @return array<string,array<string,array<string,array{qty:int,names:array<int,string>}>>>
 */
function pedidos_summary(array $orders): array
{
    $sum = [];
    foreach ($orders as $o) {
        if (!in_array($o['status'] ?? '', PEDIDO_ABIERTOS, true)) {
            continue;
        }
        $name = trim((string)($o['name'] ?? ''));
        foreach (($o['lines'] ?? []) as $l) {
            if (!is_array($l)) {
                continue;
            }
            $sup = trim((string)($l['supplier'] ?? '')) ?: 'Sin proveedor';
            $prod = trim((string)($l['product'] ?? '')) ?: 'Sin nombre';
            $size = trim((string)($l['size'] ?? '')) ?: '—';
            $qty = max(0, (int)($l['qty'] ?? 0));
            if ($qty === 0) {
                continue;
            }
            $cell = &$sum[$sup][$prod][$size];
            $cell = $cell ?? ['qty' => 0, 'names' => []];
            $cell['qty'] += $qty;
            $cell['names'][] = $qty > 1 ? "$name (×$qty)" : $name;
            unset($cell);
        }
    }
    ksort($sum);
    foreach ($sum as &$prods) {
        ksort($prods);
        foreach ($prods as &$sizes) {
            uksort($sizes, 'strnatcasecmp');
        }
        unset($sizes);
    }
    unset($prods);
    return $sum;
}

/** Línea CSV para Excel en español (separador ;). */
function csv_line(array $fields): string
{
    $o = [];
    foreach ($fields as $f) {
        $f = (string)$f;
        // Evita inyección de fórmulas en Excel.
        if ($f !== '' && strpos("=+-@\t\r", $f[0]) !== false) {
            $f = "'" . $f;
        }
        $o[] = '"' . str_replace('"', '""', $f) . '"';
    }
    return implode(';', $o) . "\r\n";
}
