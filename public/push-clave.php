<?php
/**
 * Clave pública VAPID (base64url, punto sin comprimir de 65 bytes) para
 * pushManager.subscribe(). La privada nunca sale del servidor.
 */
declare(strict_types=1);
require __DIR__ . "/push-lib.php";

$keys = push_keys();
if ($keys === null) {
    push_json(["ok" => false, "error" => "No disponible."], 503);
}
http_response_code(200);
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: public, max-age=3600");
echo json_encode(["ok" => true, "key" => $keys["public"]]);
