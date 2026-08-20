<?php
/**
 * Devuelve en JSON las últimas publicaciones de Instagram (fotos,
 * álbumes y reels) usando la Instagram Graph API. Cachea la respuesta
 * en disco para no golpear la API en cada visita ni agotar el límite
 * de peticiones de Meta.
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

if (INSTAGRAM_USER_ID === "" || INSTAGRAM_ACCESS_TOKEN === "") {
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

$fields = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";
$url = "https://graph.facebook.com/v21.0/" . urlencode(INSTAGRAM_USER_ID) . "/media"
    . "?fields=" . urlencode($fields)
    . "&limit=" . LIMIT
    . "&access_token=" . urlencode(INSTAGRAM_ACCESS_TOKEN);

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
