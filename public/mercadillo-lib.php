<?php
/**
 * Funciones comunes del mercadillo de segunda mano (mercadillo.php y
 * gestion/mercadillo.php). Solo define funciones: abrirlo directamente no
 * muestra nada. Hosting compartido OVH, PHP 7.4+.
 *
 * Datos privados (en la carpeta privada, nunca en git):
 *   mercadillo.jsonl        un anuncio por línea
 *   mercadillo-fotos/<id>.* fotos (se sirven solo si el anuncio está aprobado)
 */

declare(strict_types=1);

require_once __DIR__ . "/reservas-lib.php";

const MER_TTL_DAYS = 90;       // vigencia de un anuncio aprobado
const MER_RENEW_DAYS = 30;     // días que suma una renovación
const MER_RENEW_WINDOW = 30;   // se puede renovar cuando quedan 30 días o menos
const MER_KEEP_DAYS = 90;      // se borran los datos 90 días después de caducar
const MER_MAX_PHOTOS = 3;
const MER_MAX_PHOTO_BYTES = 1572864; // 1,5 MB
const MER_MAX_PER_IP_DAY = 3;

const MER_ESTADOS = [
    "pendiente" => "Pendiente",
    "aprobado" => "Publicado",
    "rechazado" => "Rechazado",
    "vendido" => "Vendido / encontrado",
];

/** Ajustes de textos y listas (copia de src/content/data/mercadillo.json). */
function mer_config(): array
{
    foreach ([__DIR__ . "/mercadillo-config.json", __DIR__ . "/../src/content/data/mercadillo.json"] as $f) {
        if (is_file($f)) {
            $cfg = json_decode((string) file_get_contents($f), true);
            if (is_array($cfg) && isset($cfg["tipos"], $cfg["estados"], $cfg["manos"])) {
                return $cfg;
            }
        }
    }
    return [];
}

/** @return array<string,string> id => etiqueta */
function mer_options(array $cfg, string $key): array
{
    $out = [];
    foreach (($cfg[$key] ?? []) as $o) {
        if (is_array($o) && isset($o["id"], $o["label"])) {
            $out[(string) $o["id"]] = (string) $o["label"];
        }
    }
    return $out;
}

function mer_file(string $dataDir): string
{
    return $dataDir . "/mercadillo.jsonl";
}

function mer_photo_dir(string $dataDir): string
{
    return $dataDir . "/mercadillo-fotos";
}

/** Carpeta privada existente (sin crearla): para lecturas. */
function mer_find_dir(): ?string
{
    foreach ([dirname(__DIR__) . "/club-data", __DIR__ . "/_data"] as $d) {
        if (is_file($d . "/mercadillo.jsonl")) {
            return $d;
        }
    }
    return null;
}

/** @return array<int,array<string,mixed>> */
function mer_read(string $dataDir): array
{
    $path = mer_file($dataDir);
    if (!is_file($path)) {
        return [];
    }
    $fh = @fopen($path, "rb");
    if (!$fh) {
        return [];
    }
    flock($fh, LOCK_SH);
    $rows = [];
    while (($line = fgets($fh)) !== false) {
        $row = json_decode(trim($line), true);
        if (is_array($row) && isset($row["id"], $row["status"])) {
            $rows[] = $row;
        }
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $rows;
}

/**
 * Modifica los anuncios bajo bloqueo exclusivo (mismo esquema que
 * reservas_update). $mutate recibe y devuelve el array de anuncios.
 */
function mer_update(string $dataDir, callable $mutate): bool
{
    $path = mer_file($dataDir);
    $fh = @fopen($path, "c+b");
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
        if ($t === "") {
            continue;
        }
        $row = json_decode($t, true);
        if (is_array($row) && isset($row["id"])) {
            $rows[] = $row;
        } else {
            $raw[] = $t;
        }
    }
    @copy($path, $path . ".bak");
    $new = $mutate($rows);
    $buf = "";
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

/** Ruta de una foto por su id (hexadecimal), o null si no existe. */
function mer_photo_path(string $dataDir, string $photoId): ?string
{
    if (!preg_match('/^[a-f0-9]{16}$/', $photoId)) {
        return null;
    }
    foreach (["jpg", "png", "webp"] as $ext) {
        $p = mer_photo_dir($dataDir) . "/" . $photoId . "." . $ext;
        if (is_file($p)) {
            return $p;
        }
    }
    return null;
}

function mer_photo_mime(string $path): string
{
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    return $ext === "png" ? "image/png" : ($ext === "webp" ? "image/webp" : "image/jpeg");
}

function mer_delete_photos(string $dataDir, array $ids): void
{
    foreach ($ids as $pid) {
        $p = mer_photo_path($dataDir, (string) $pid);
        if ($p !== null) {
            @unlink($p);
        }
    }
}

/** Caduca = aprobado con fecha de caducidad pasada. */
function mer_is_expired(array $ad, ?int $now = null): bool
{
    $now = $now ?? time();
    return ($ad["status"] ?? "") === "aprobado" && isset($ad["expires_at"]) && strtotime((string) $ad["expires_at"]) <= $now;
}

/** Visible al público: aprobado y vigente. */
function mer_is_public(array $ad, ?int $now = null): bool
{
    return ($ad["status"] ?? "") === "aprobado" && !mer_is_expired($ad, $now);
}

/** Estado para mostrar: incluye "caducado". */
function mer_status_label(array $ad): string
{
    return mer_is_expired($ad) ? "Caducado" : (MER_ESTADOS[$ad["status"] ?? ""] ?? (string) ($ad["status"] ?? ""));
}

/** Teléfono → solo dígitos con prefijo de país (España si son 9 cifras), o null. */
function mer_phone(string $raw): ?string
{
    $raw = trim($raw);
    $plus = strpos($raw, "+") === 0;
    $digits = preg_replace('/\D+/', "", $raw) ?? "";
    if (strpos($digits, "00") === 0 && !$plus) {
        $digits = substr($digits, 2);
        $plus = true;
    }
    if (!$plus && preg_match('/^[6-9]\d{8}$/', $digits)) {
        return "34" . $digits;
    }
    if ($plus && strpos($digits, "34") === 0 && preg_match('/^34[6-9]\d{8}$/', $digits)) {
        return $digits;
    }
    if ($plus && preg_match('/^[1-9]\d{7,14}$/', $digits) && strpos($digits, "34") !== 0) {
        return $digits;
    }
    return null;
}

function mer_token_hash(string $token): string
{
    return hash("sha256", $token);
}

/** Busca un anuncio por su enlace privado. */
function mer_find_by_token(array $rows, string $token): ?array
{
    if (!preg_match('/^[a-f0-9]{48}$/', $token)) {
        return null;
    }
    $h = mer_token_hash($token);
    foreach ($rows as $r) {
        if (isset($r["token_hash"]) && hash_equals((string) $r["token_hash"], $h)) {
            return $r;
        }
    }
    return null;
}

/** Borra los datos y fotos pasado el plazo de conservación. */
function mer_purge(string $dataDir): void
{
    if (!is_file(mer_file($dataDir))) {
        return;
    }
    $limit = time() - MER_KEEP_DAYS * 86400;
    $drop = [];
    foreach (mer_read($dataDir) as $r) {
        $ref = ($r["status"] ?? "") === "aprobado"
            ? strtotime((string) ($r["expires_at"] ?? ""))
            : strtotime((string) ($r["updated_at"] ?? $r["created_at"] ?? ""));
        if ($ref !== false && $ref > 0 && $ref < $limit && ($r["status"] ?? "") !== "pendiente") {
            $drop[(string) $r["id"]] = is_array($r["photos"] ?? null) ? $r["photos"] : [];
        }
    }
    if (!$drop) {
        return;
    }
    mer_update($dataDir, function (array $rows) use ($drop) {
        return array_values(array_filter($rows, function ($r) use ($drop) {
            return !isset($drop[(string) $r["id"]]);
        }));
    });
    foreach ($drop as $photos) {
        mer_delete_photos($dataDir, $photos);
    }
}

function mer_pending_count(): int
{
    $dir = mer_find_dir();
    if ($dir === null) {
        return 0;
    }
    return count(array_filter(mer_read($dir), function ($r) {
        return ($r["status"] ?? "") === "pendiente";
    }));
}

/**
 * Valida y guarda una foto subida. Devuelve el id (16 hex) o un texto de error.
 * Solo JPEG, PNG o WebP; se vuelve a codificar con GD si está disponible
 * (quita EXIF); si no hay GD se guarda tal cual tras validar.
 * @return array{0:?string,1:string} [id, error]
 */
function mer_save_photo(string $dataDir, string $tmp, int $size): array
{
    if ($size <= 0 || $size > MER_MAX_PHOTO_BYTES) {
        return [null, "Cada foto debe pesar menos de 1,5 MB."];
    }
    $info = @getimagesize($tmp);
    if (!is_array($info) || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
        return [null, "Las fotos deben ser JPEG, PNG o WebP."];
    }
    if ($info[0] < 1 || $info[1] < 1 || $info[0] > 8000 || $info[1] > 8000) {
        return [null, "Una de las fotos tiene un tamaño no válido."];
    }
    $dir = mer_photo_dir($dataDir);
    if (!is_dir($dir) && !@mkdir($dir, 0750, true)) {
        return [null, "No se pudo guardar la foto."];
    }
    $id = bin2hex(random_bytes(8));
    $type = $info[2];
    $ext = $type === IMAGETYPE_PNG ? "png" : ($type === IMAGETYPE_WEBP ? "webp" : "jpg");
    $dest = $dir . "/" . $id . "." . $ext;

    $loaders = [
        IMAGETYPE_JPEG => "imagecreatefromjpeg",
        IMAGETYPE_PNG => "imagecreatefrompng",
        IMAGETYPE_WEBP => "imagecreatefromwebp",
    ];
    $loader = $loaders[$type];
    if (function_exists($loader) && function_exists("imagejpeg")) {
        $img = @$loader($tmp);
        if (!$img) {
            return [null, "No se pudo leer una de las fotos. Prueba con otra."];
        }
        // Reducir si es muy grande (1200 px el lado largo).
        $w = imagesx($img);
        $h = imagesy($img);
        $max = 1200;
        if ($w > $max || $h > $max) {
            $r = min($max / $w, $max / $h);
            $nw = max(1, (int) round($w * $r));
            $nh = max(1, (int) round($h * $r));
            $res = imagecreatetruecolor($nw, $nh);
            if ($type !== IMAGETYPE_JPEG) {
                imagealphablending($res, false);
                imagesavealpha($res, true);
            }
            imagecopyresampled($res, $img, 0, 0, 0, 0, $nw, $nh, $w, $h);
            imagedestroy($img);
            $img = $res;
        }
        if ($type === IMAGETYPE_PNG) {
            $ok = imagepng($img, $dest, 6);
        } elseif ($type === IMAGETYPE_WEBP && function_exists("imagewebp")) {
            $ok = imagewebp($img, $dest, 82);
        } else {
            // WebP sin soporte de escritura: se guarda como JPEG.
            if ($type === IMAGETYPE_WEBP) {
                $ext = "jpg";
                $dest = $dir . "/" . $id . ".jpg";
            }
            $ok = imagejpeg($img, $dest, 85);
        }
        imagedestroy($img);
        if (!$ok) {
            @unlink($dest);
            return [null, "No se pudo guardar la foto."];
        }
        @chmod($dest, 0640);
        return [$id, ""];
    }
    if (!@move_uploaded_file($tmp, $dest) && !@copy($tmp, $dest)) {
        return [null, "No se pudo guardar la foto."];
    }
    @chmod($dest, 0640);
    return [$id, ""];
}

/** Anuncio en la forma pública (sin correo, token ni datos internos). */
function mer_public_item(array $ad): array
{
    $photos = [];
    foreach ((is_array($ad["photos"] ?? null) ? $ad["photos"] : []) as $pid) {
        $photos[] = "mercadillo.php?foto=" . $pid;
    }
    return [
        "id" => (string) $ad["id"],
        "kind" => (string) ($ad["kind"] ?? "vendo"),
        "category" => (string) ($ad["category"] ?? "otro"),
        "title" => (string) ($ad["title"] ?? ""),
        "description" => (string) ($ad["description"] ?? ""),
        "size" => (string) ($ad["size"] ?? ""),
        "hand" => (string) ($ad["hand"] ?? ""),
        "condition" => (string) ($ad["condition"] ?? ""),
        "price" => isset($ad["price"]) && $ad["price"] !== null ? (int) $ad["price"] : null,
        "zone" => (string) ($ad["zone"] ?? ""),
        "name" => (string) ($ad["name"] ?? ""),
        "phone" => (string) ($ad["phone"] ?? ""),
        "photos" => $photos,
        "date" => substr((string) ($ad["approved_at"] ?? $ad["created_at"] ?? ""), 0, 10),
    ];
}

/** Base de las URLs absolutas (esquema + host) para los correos. */
function mer_base_url(): string
{
    $host = preg_replace('/[^A-Za-z0-9.\-:]/', "", (string) ($_SERVER["HTTP_HOST"] ?? "")) ?: "www.esgrimatorremolinos.com";
    $local = strpos($host, "localhost") === 0 || strpos($host, "127.") === 0;
    return ($local ? "http" : "https") . "://" . $host;
}

function mer_manage_url(string $token): string
{
    return mer_base_url() . "/mercadillo/mi-anuncio/#" . $token;
}

function mer_mail_approved(array $ad, string $token = ""): void
{
    $to = (string) ($ad["email"] ?? "");
    if ($to === "") {
        return;
    }
    $exp = isset($ad["expires_at"]) ? res_date_es(substr((string) $ad["expires_at"], 0, 10)) : "";
    $body = "Hola {$ad['name']},\n\nTu anuncio «{$ad['title']}» ya está publicado en el mercadillo del club: "
        . mer_base_url() . "/mercadillo/\n\n"
        . ($exp !== "" ? "Estará visible hasta el {$exp}. Cuando quede un mes podrás renovarlo desde tu enlace privado.\n\n" : "")
        . "Cuando se venda (o encuentres lo que buscabas), márcalo desde tu enlace privado, el que te enviamos al publicarlo.\n\n"
        . RES_SITE_NAME . "\n";
    res_mail($to, "Tu anuncio ya está publicado - " . RES_SITE_NAME, $body, res_club_email());
}

function mer_mail_rejected(array $ad, string $reason): void
{
    $to = (string) ($ad["email"] ?? "");
    if ($to === "") {
        return;
    }
    $body = "Hola {$ad['name']},\n\nNo hemos podido publicar tu anuncio «{$ad['title']}» en el mercadillo del club."
        . ($reason !== "" ? "\n\nMotivo: {$reason}" : "")
        . "\n\nEl mercadillo es solo para material de esgrima. Si quieres, puedes publicar otro anuncio corregido.\n\n"
        . RES_SITE_NAME . "\n";
    res_mail($to, "Tu anuncio no se ha publicado - " . RES_SITE_NAME, $body, res_club_email());
}
