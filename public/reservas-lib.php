<?php
/**
 * Funciones comunes de la reserva de clase gratis (reserva.php y
 * recordatorios.php). Solo define funciones: abrirlo directamente no muestra nada.
 * Hosting compartido OVH, PHP 7.4+.
 */

declare(strict_types=1);

const RES_SITE_NAME = "Club de Esgrima Torremolinos";
const RES_FALLBACK_EMAIL = "esgrimatorremolinos@gmail.com";
const RES_WHATSAPP = "+34 616 94 00 91";
const RES_VENUE = "Palacio de Deportes San Miguel, C. Pedro Navarro Bruna, 1, 29620 Torremolinos";

function res_respond(array $data, int $status = 200): void
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    header("Cache-Control: no-store");
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function res_fail(string $error, int $status = 400): void
{
    res_respond(["ok" => false, "error" => $error], $status);
}

function res_clean(string $value, int $max): string
{
    // Sin saltos de línea (cabeceras de correo) ni caracteres de control.
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', " ", $value) ?? "";
    return mb_substr(trim($value), 0, $max);
}

function res_clean_text(string $value, int $max): string
{
    $value = str_replace("\r", "", $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', "", $value) ?? "";
    return mb_substr(trim($value), 0, $max);
}

function res_tz(): DateTimeZone
{
    return new DateTimeZone("Europe/Madrid");
}

/** Ajustes de reserva (copia de src/content/data/reservas.json). */
function res_config(): ?array
{
    foreach ([__DIR__ . "/reservas-config.json", __DIR__ . "/../src/content/data/reservas.json"] as $f) {
        if (is_file($f)) {
            $cfg = json_decode((string) file_get_contents($f), true);
            if (is_array($cfg) && isset($cfg["groups"]) && is_array($cfg["groups"])) {
                return $cfg;
            }
        }
    }
    return null;
}

/** @return array<string,array<string,mixed>> grupos por id */
function res_groups(array $cfg): array
{
    $out = [];
    foreach ($cfg["groups"] as $g) {
        if (is_array($g) && isset($g["id"], $g["name"], $g["weekdays"], $g["start"], $g["end"]) && is_array($g["weekdays"])
            && preg_match('/^\d{2}:\d{2}$/', (string) $g["start"]) && preg_match('/^\d{2}:\d{2}$/', (string) $g["end"])) {
            $out[(string) $g["id"]] = $g;
        }
    }
    return $out;
}

function res_valid_date(string $d): bool
{
    return (bool) preg_match('/^(\d{4})-(\d{2})-(\d{2})$/', $d, $m) && checkdate((int) $m[2], (int) $m[3], (int) $m[1]);
}

function res_start(string $date, array $group): DateTimeImmutable
{
    return new DateTimeImmutable($date . " " . $group["start"] . ":00", res_tz());
}

/** Correo del club: el mismo que usa la tienda (orderEmail). */
function res_club_email(): string
{
    foreach ([__DIR__ . "/tienda-productos.json", __DIR__ . "/../src/content/data/tienda.json"] as $f) {
        if (is_file($f)) {
            $cat = json_decode((string) file_get_contents($f), true);
            if (is_array($cat) && isset($cat["orderEmail"]) && filter_var($cat["orderEmail"], FILTER_VALIDATE_EMAIL)) {
                return (string) $cat["orderEmail"];
            }
        }
    }
    return RES_FALLBACK_EMAIL;
}

/** Directorio privado de datos (misma lógica que pedido.php). */
function res_data_dir(): ?string
{
    $outside = dirname(__DIR__) . "/club-data";
    if (is_dir($outside) || (is_writable(dirname(__DIR__)) && @mkdir($outside, 0750))) {
        return $outside;
    }
    $dataDir = __DIR__ . "/_data";
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0750, true);
    }
    $ht = $dataDir . "/.htaccess";
    if (!is_file($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\n  Order deny,allow\n  Deny from all\n</IfModule>\n");
    }
    return (is_dir($dataDir) && is_writable($dataDir)) ? $dataDir : null;
}

/** Fecha larga en español: "martes 13 de octubre de 2026". */
function res_date_es(string $date): string
{
    $dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    $meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    $dt = new DateTimeImmutable($date . " 12:00:00", res_tz());
    return $dias[(int) $dt->format("w")] . " " . (int) $dt->format("j") . " de " . $meses[(int) $dt->format("n") - 1] . " de " . $dt->format("Y");
}

function res_mail(string $to, string $subject, string $body, string $replyTo): bool
{
    $host = preg_replace('/[^A-Za-z0-9.\-]/', "", (string) ($_SERVER["HTTP_HOST"] ?? "")) ?: "esgrimatorremolinos.com";
    $from = "From: " . RES_SITE_NAME . " <no-reply@{$host}>\r\n";
    return @mail(
        $to,
        "=?UTF-8?B?" . base64_encode($subject) . "?=",
        $body,
        $from . "Reply-To: {$replyTo}\r\nContent-Type: text/plain; charset=utf-8"
    );
}

/** Texto común de "cómo cancelar" para los correos a la persona. */
function res_cancel_text(string $clubEmail): string
{
    return "Si no puedes venir, avísanos para liberar la plaza: responde a este correo o escríbenos por WhatsApp al "
        . RES_WHATSAPP . ".";
}
