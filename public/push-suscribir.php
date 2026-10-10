<?php
/**
 * Alta y baja de suscripciones push. POST JSON:
 *   {"subscription": {endpoint, keys}, "lang": "es"}   -> alta
 *   {"action": "unsubscribe", "endpoint": "..."}        -> baja (también DELETE)
 * Solo se guarda el endpoint (https de un servicio push conocido), el idioma
 * y la fecha: ningún dato personal.
 */
declare(strict_types=1);
require __DIR__ . "/push-lib.php";

$method = $_SERVER["REQUEST_METHOD"] ?? "GET";
if (!in_array($method, ["POST", "DELETE"], true)) {
    header("Allow: POST, DELETE");
    push_json(["ok" => false, "error" => "Método no permitido."], 405);
}

$raw = (string) file_get_contents("php://input", false, null, 0, 8192);
$in = json_decode($raw, true);
if (!is_array($in)) {
    push_json(["ok" => false, "error" => "Petición no válida."], 400);
}

$unsub = $method === "DELETE" || ($in["action"] ?? "") === "unsubscribe";
if ($unsub) {
    $endpoint = push_valid_endpoint($in["endpoint"] ?? null);
} else {
    $sub = $in["subscription"] ?? null;
    $endpoint = push_valid_endpoint(is_array($sub) ? ($sub["endpoint"] ?? null) : null);
}
if ($endpoint === null) {
    push_json(["ok" => false, "error" => "Suscripción no válida."], 400);
}

if ($unsub) {
    push_sub_remove([push_sub_id($endpoint)]);
    push_json(["ok" => true]);
}

// Límite por IP: 10 altas por hora.
$dir = push_data_dir();
if ($dir === null) {
    push_json(["ok" => false, "error" => "No disponible."], 503);
}
$ipKey = hash("sha256", (string) ($_SERVER["REMOTE_ADDR"] ?? "unknown"));
$rh = @fopen($dir . "/push-rate.json", "c+");
if ($rh && flock($rh, LOCK_EX)) {
    $rate = json_decode((string) stream_get_contents($rh), true);
    $rate = is_array($rate) ? $rate : [];
    $now = time();
    foreach ($rate as $k => $times) {
        $rate[$k] = array_values(array_filter(is_array($times) ? $times : [], function ($t) use ($now) {
            return is_int($t) && $t > $now - 3600;
        }));
        if (!$rate[$k]) {
            unset($rate[$k]);
        }
    }
    if (count($rate[$ipKey] ?? []) >= 10) {
        flock($rh, LOCK_UN);
        fclose($rh);
        push_json(["ok" => false, "error" => "Demasiados intentos. Inténtalo más tarde."], 429);
    }
    $rate[$ipKey][] = $now;
    ftruncate($rh, 0);
    rewind($rh);
    fwrite($rh, (string) json_encode($rate));
    flock($rh, LOCK_UN);
    fclose($rh);
}

$lang = ($in["lang"] ?? "es") === "en" ? "en" : "es";
if (!push_sub_add($endpoint, $lang)) {
    push_json(["ok" => false, "error" => "No se pudo guardar."], 500);
}
push_json(["ok" => true]);
