<?php
/**
 * Recordatorios de la clase gratis (PHP 7.4+). Solo se ejecuta con la clave
 * correcta, enviada por POST (campo "key") desde .github/workflows/recordatorios.yml.
 * La clave (RECORDATORIOS_KEY) está en recordatorios-config.php, que genera el
 * despliegue; nunca está en git.
 *
 * Envía un correo a quien tiene clase mañana y aún no ha recibido recordatorio,
 * y lo marca como recordado. Responde solo con recuentos.
 */

declare(strict_types=1);

require __DIR__ . "/reservas-lib.php";

date_default_timezone_set("Europe/Madrid");

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    header("Allow: POST");
    res_fail("Método no permitido.", 405);
}

$cfgFile = __DIR__ . "/recordatorios-config.php";
if (is_file($cfgFile)) {
    require_once $cfgFile;
}
if (!defined("RECORDATORIOS_KEY") || strlen((string) RECORDATORIOS_KEY) < 32) {
    res_fail("Recordatorios sin configurar.", 503);
}
$key = is_string($_POST["key"] ?? null) ? $_POST["key"] : "";
if ($key === "" || !hash_equals((string) RECORDATORIOS_KEY, $key)) {
    // Pausa breve para encarecer los intentos a ciegas.
    usleep(300000);
    res_fail("No autorizado.", 403);
}

$cfg = res_config();
$dataDir = res_data_dir();
$file = $dataDir !== null ? $dataDir . "/reservas.jsonl" : null;
if ($cfg === null || $file === null) {
    res_fail("Sin configuración o sin carpeta de datos.", 500);
}
if (!is_file($file)) {
    res_respond(["ok" => true, "tomorrow" => 0, "sent" => 0, "failed" => 0]);
}

$tomorrow = (new DateTimeImmutable("now", res_tz()))->modify("+1 day")->format("Y-m-d");
$clubEmail = res_club_email();

$fh = @fopen($file, "c+b");
if ($fh === false || !flock($fh, LOCK_EX)) {
    res_fail("No se pudo abrir el fichero de reservas.", 500);
}
$rows = [];
$rawOther = [];
while (($line = fgets($fh)) !== false) {
    $t = trim($line);
    if ($t === "") {
        continue;
    }
    $r = json_decode($t, true);
    if (is_array($r) && isset($r["id"])) {
        $rows[] = $r;
    } else {
        $rawOther[] = $t;
    }
}

$bring = "";
foreach (($cfg["notes"] ?? []) as $n) {
    if (is_string($n) && $n !== "") {
        $bring .= "- {$n}\n";
    }
}

$total = 0;
$sent = 0;
$failed = 0;
foreach ($rows as &$r) {
    if (($r["date"] ?? "") !== $tomorrow || ($r["status"] ?? "") !== "confirmada" || !empty($r["reminded_at"])) {
        continue;
    }
    $total++;
    $name = (string) ($r["name"] ?? "");
    $when = res_date_es($tomorrow) . ", de " . ($r["start"] ?? "") . " a " . ($r["end"] ?? "");
    $ok = res_mail(
        (string) ($r["email"] ?? ""),
        "Mañana tienes tu clase gratis - " . RES_SITE_NAME,
        "Hola " . ($name !== "" ? $name : "") . ",\n\nTe recordamos tu clase gratis de mañana (referencia {$r['id']}).\n\n"
        . "Grupo: " . ($r["group_name"] ?? "") . "\nCuándo: {$when}\nDónde: " . RES_VENUE . "\n\n"
        . ($bring !== "" ? "Qué traer:\n{$bring}\n" : "")
        . res_cancel_text($clubEmail) . "\n\n" . RES_SITE_NAME . "\n",
        $clubEmail
    );
    $ok ? $sent++ : $failed++;
    // Se marca siempre: un solo aviso por reserva; el resultado queda registrado.
    $r["reminded_at"] = date("c");
    $r["reminder_sent"] = $ok;
}
unset($r);

if ($total > 0) {
    @copy($file, $file . ".bak");
    $buf = "";
    foreach ($rows as $r) {
        $buf .= json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
    }
    foreach ($rawOther as $o) {
        $buf .= $o . "\n";
    }
    rewind($fh);
    ftruncate($fh, 0);
    fwrite($fh, $buf);
    fflush($fh);
}
flock($fh, LOCK_UN);
fclose($fh);

res_respond(["ok" => true, "tomorrow" => $total, "sent" => $sent, "failed" => $failed]);
