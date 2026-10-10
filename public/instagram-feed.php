<?php
/**
 * Devuelve en JSON las últimas publicaciones de Instagram (fotos,
 * álbumes y reels). Cachea la respuesta en disco para no golpear la API en
 * cada visita ni agotar el límite de peticiones de Meta.
 *
 * Dos tipos de clave (INSTAGRAM_ACCESS_TOKEN):
 *  - "Instagram API con inicio de sesión de Instagram" (empieza por "IG"):
 *    usa graph.instagram.com, no necesita página de Facebook ni
 *    INSTAGRAM_USER_ID, y se renueva sola cada semana (las claves duran 60
 *    días); la clave renovada se guarda en la carpeta privada club-data/.
 *  - Clave de la Graph API de Facebook (cuenta vinculada a una página):
 *    usa graph.facebook.com con INSTAGRAM_USER_ID.
 */

declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");

$configFile = __DIR__ . "/instagram-config.php";
if (!file_exists($configFile)) {
    http_response_code(503);
    echo json_encode(["error" => "instagram-config.php no configurado"]);
    exit;
}
require $configFile;

$isIgToken = strncmp(INSTAGRAM_ACCESS_TOKEN, "IG", 2) === 0;
if (INSTAGRAM_ACCESS_TOKEN === "" || (!$isIgToken && INSTAGRAM_USER_ID === "")) {
    http_response_code(503);
    echo json_encode(["error" => "Credenciales de Instagram vacías"]);
    exit;
}

const LIMIT = 6;
const CACHE_TTL_SECONDS = 3600; // 1 hora
$cacheFile = __DIR__ . "/instagram-cache.json";

if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < CACHE_TTL_SECONDS) {
    echo file_get_contents($cacheFile);
    exit;
}

/** Carpeta privada (fuera del web root si se puede), como pedido.php. */
function ig_data_dir(): string
{
    $outside = dirname(__DIR__) . "/club-data";
    if ((is_dir($outside) || @mkdir($outside, 0750, true)) && is_writable($outside)) {
        return $outside;
    }
    $inside = __DIR__ . "/_data";
    if (!is_dir($inside)) {
        @mkdir($inside, 0750, true);
    }
    return $inside;
}

/**
 * Clave vigente. Con claves de Instagram Login: si la guardada procede de la
 * misma clave de configuración, se usa la guardada (renovada) y se renueva de
 * nuevo si tiene más de 7 días. Si cambias el secreto en GitHub, manda el nuevo.
 */
function ig_token(bool $isIgToken): string
{
    $config = INSTAGRAM_ACCESS_TOKEN;
    if (!$isIgToken) {
        return $config;
    }
    $file = ig_data_dir() . "/instagram-token.json";
    $origin = hash("sha256", $config);
    $saved = is_file($file) ? json_decode((string) @file_get_contents($file), true) : null;
    $token = $config;
    $refreshedAt = 0;
    if (is_array($saved) && ($saved["origin"] ?? "") === $origin && !empty($saved["token"])) {
        $token = (string) $saved["token"];
        $refreshedAt = (int) ($saved["refreshed_at"] ?? 0);
    }
    if (time() - $refreshedAt > 7 * 86400) {
        $r = @file_get_contents("https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=" . urlencode($token));
        $j = $r !== false ? json_decode($r, true) : null;
        if (is_array($j) && !empty($j["access_token"])) {
            $token = (string) $j["access_token"];
        }
        // También si falla: se reintenta en una semana y se sigue usando la vigente.
        @file_put_contents($file, json_encode(["origin" => $origin, "token" => $token, "refreshed_at" => time()]), LOCK_EX);
        @chmod($file, 0600);
    }
    return $token;
}

$fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
$base = $isIgToken
    ? "https://graph.instagram.com/v21.0/me/media"
    : "https://graph.facebook.com/v21.0/" . urlencode(INSTAGRAM_USER_ID) . "/media";
$url = $base
    . "?fields=" . urlencode($fields)
    . "&limit=" . LIMIT
    . "&access_token=" . urlencode(ig_token($isIgToken));

$response = @file_get_contents($url);

if ($response === false) {
    // Si falla la llamada pero tenemos una caché antigua, mejor servir
    // eso que un error — el feed simplemente no estará al minuto.
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
        exit;
    }
    http_response_code(502);
    echo json_encode(["error" => "No se pudo contactar con la API de Instagram"]);
    exit;
}

$data = json_decode($response, true);

if (!isset($data["data"])) {
    http_response_code(502);
    echo json_encode(["error" => "Respuesta inesperada de la API de Instagram"]);
    exit;
}

$posts = array_map(function ($item) {
    return [
        "id" => $item["id"] ?? "",
        "caption" => isset($item["caption"]) ? mb_substr($item["caption"], 0, 140) : "",
        "mediaType" => $item["media_type"] ?? "IMAGE",
        "mediaUrl" => $item["media_url"] ?? ($item["thumbnail_url"] ?? ""),
        "thumbnailUrl" => $item["thumbnail_url"] ?? ($item["media_url"] ?? ""),
        "permalink" => $item["permalink"] ?? "",
    ];
}, array_slice($data["data"], 0, LIMIT));

$output = json_encode(["posts" => $posts]);
@file_put_contents($cacheFile, $output);

echo $output;
