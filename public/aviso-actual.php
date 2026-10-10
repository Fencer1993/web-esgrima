<?php
/**
 * Último aviso enviado (lo pide el service worker al recibir un push vacío).
 * Solo título, texto, enlace, id y fecha: ningún dato personal.
 */
declare(strict_types=1);
require __DIR__ . "/push-lib.php";

$list = push_avisos();
if (!$list) {
    push_json(["ok" => false]);
}
$a = $list[0];
push_json([
    "ok" => true,
    "id" => (string) ($a["id"] ?? ""),
    "title" => (string) ($a["title"] ?? ""),
    "body" => (string) ($a["body"] ?? ""),
    "url" => (string) ($a["url"] ?? "/"),
    "created_at" => (string) ($a["created_at"] ?? ""),
]);
