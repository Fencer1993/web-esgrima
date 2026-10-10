<?php
/**
 * Reserva de la clase gratis (hosting compartido OVH, PHP 7.4+).
 *
 *  GET  ?disponibilidad=1  -> plazas ocupadas por sesión ("AAAA-MM-DD|grupo"),
 *                             sin ningún dato personal.
 *  POST (JSON)             -> valida, comprueba aforo bajo bloqueo, guarda la
 *                             reserva en reservas.jsonl (carpeta privada) y
 *                             avisa por correo al club y a la persona.
 *
 * Ajustes: reservas-config.json junto a este script (el despliegue copia
 * src/content/data/reservas.json); en local se lee la fuente directamente.
 */

declare(strict_types=1);

require __DIR__ . "/reservas-lib.php";

date_default_timezone_set("Europe/Madrid");

$cfg = res_config();
if ($cfg === null) {
    res_fail("La reserva no está disponible ahora mismo. Escríbenos por WhatsApp.", 503);
}
$groups = res_groups($cfg);
$weeks = max(1, min(12, (int) ($cfg["weeksAhead"] ?? 4)));
$minNotice = max(0, (int) ($cfg["minNoticeHours"] ?? 12));
$blocked = [];
foreach (($cfg["blockedDates"] ?? []) as $b) {
    if (is_array($b) && isset($b["date"])) {
        $blocked[(string) $b["date"]] = (string) ($b["reason"] ?? "");
    }
}
$tz = res_tz();
$nowDt = new DateTimeImmutable("now", $tz);
$today = $nowDt->format("Y-m-d");
$limitDate = $nowDt->modify("+" . ($weeks * 7) . " days")->format("Y-m-d");

$dataDir = res_data_dir();
$file = $dataDir !== null ? $dataDir . "/reservas.jsonl" : null;

/** Lee todas las reservas válidas del fichero abierto (puntero al inicio). */
function res_rows($fh): array
{
    $rows = [];
    while (($line = fgets($fh)) !== false) {
        $row = json_decode(trim($line), true);
        if (is_array($row) && isset($row["id"], $row["date"], $row["group"])) {
            $rows[] = $row;
        }
    }
    return $rows;
}

function res_counts(array $rows, string $from): array
{
    $counts = [];
    foreach ($rows as $r) {
        if (($r["status"] ?? "") === "cancelada" || (string) $r["date"] < $from) {
            continue;
        }
        $k = $r["date"] . "|" . $r["group"];
        $counts[$k] = ($counts[$k] ?? 0) + 1;
    }
    return $counts;
}

$method = $_SERVER["REQUEST_METHOD"] ?? "";

if ($method === "GET") {
    if (!isset($_GET["disponibilidad"])) {
        res_fail("Solicitud no válida.", 400);
    }
    $counts = [];
    if ($file !== null && is_file($file) && ($fh = @fopen($file, "rb"))) {
        flock($fh, LOCK_SH);
        $counts = res_counts(res_rows($fh), $today);
        flock($fh, LOCK_UN);
        fclose($fh);
    }
    // Solo cifras por sesión; nada que identifique a nadie.
    res_respond(["ok" => true, "booked" => (object) $counts, "generated" => date("c")]);
}

if ($method !== "POST") {
    header("Allow: GET, POST");
    res_fail("Método no permitido.", 405);
}

$raw = file_get_contents("php://input", false, null, 0, 65536);
$in = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($in)) {
    res_fail("Solicitud no válida.");
}

// Honeypot: respuesta de éxito falsa para no dar pistas a los bots.
if (!empty($in["website"])) {
    res_respond(["ok" => true, "id" => "00000000"]);
}

$str = function (string $k, int $max) use ($in): string {
    return res_clean(is_string($in[$k] ?? null) ? $in[$k] : "", $max);
};

$groupId = $str("group", 40);
$date = $str("date", 10);
$name = $str("name", 100);
$guardian = $str("guardian", 100);
$email = $str("email", 150);
$phone = $str("phone", 30);
$notes = res_clean_text(is_string($in["notes"] ?? null) ? $in["notes"] : "", 1000);

if (!isset($groups[$groupId])) {
    res_fail("Elige un grupo válido.");
}
$group = $groups[$groupId];
if (!res_valid_date($date)) {
    res_fail("Elige una fecha válida.");
}
if (empty($in["privacy"])) {
    res_fail("Debes aceptar la política de privacidad para reservar.");
}
if ($name === "") {
    res_fail("Escribe el nombre de quien va a hacer la clase.");
}
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    res_fail("Revisa tu correo electrónico e inténtalo de nuevo.");
}
if ($phone === "" || !preg_match('/\d{6,}/', preg_replace('/\D+/', "", $phone) ?? "")) {
    res_fail("Revisa tu teléfono e inténtalo de nuevo.");
}

// Edad: obligatoria en los grupos que lo piden; si es menor, hace falta tutor.
$ageRaw = $in["age"] ?? "";
$age = null;
if (is_int($ageRaw) || (is_string($ageRaw) && ctype_digit(trim($ageRaw)))) {
    $age = (int) $ageRaw;
    if ($age < 0 || $age > 110) {
        res_fail("Revisa la edad.");
    }
} elseif ($ageRaw !== "" && $ageRaw !== null) {
    res_fail("Revisa la edad.");
}
if ($age === null && !empty($group["ageRequired"])) {
    res_fail("Indica la edad de quien va a hacer la clase.");
}
if ($age !== null) {
    if ($age < (int) ($group["minAgeYears"] ?? 0)) {
        res_fail("Este grupo es " . mb_strtolower((string) ($group["minAge"] ?? "para mayores")) . ". Escríbenos y buscamos la mejor opción.");
    }
    if (isset($group["maxAgeYears"]) && $age > (int) $group["maxAgeYears"]) {
        res_fail("Este grupo es " . mb_strtolower((string) ($group["minAge"] ?? "para otra edad")) . ". Prueba con el grupo de adolescentes y adultos.");
    }
}
$minor = $age !== null && $age < 18;
if ($minor && $guardian === "") {
    res_fail("Al ser menor de edad, indica el nombre del padre, madre o tutor.");
}
if (!$minor) {
    $guardian = "";
}

// La sesión debe existir y ser reservable.
$start = res_start($date, $group);
if (!in_array((int) $start->format("N"), array_map("intval", $group["weekdays"]), true)) {
    res_fail("Ese día no hay clase en este grupo.");
}
if ($date > $limitDate) {
    res_fail("Todavía no se puede reservar tan adelante. Elige una fecha más próxima.");
}
if (isset($blocked[$date])) {
    res_fail("Ese día no hay clase" . ($blocked[$date] !== "" ? " (" . $blocked[$date] . ")" : "") . ". Elige otra fecha.");
}
if ($start->getTimestamp() < $nowDt->getTimestamp() + $minNotice * 3600) {
    res_fail("Esa clase ya no admite reservas por Internet (hace falta reservar con al menos {$minNotice} horas de antelación). Escríbenos por WhatsApp.");
}

if ($file === null) {
    res_fail("No se pudo guardar la reserva. Escríbenos por WhatsApp.", 500);
}

// Límite de frecuencia: 5 reservas por hora y por IP.
$ipKey = hash("sha256", (string) ($_SERVER["REMOTE_ADDR"] ?? "unknown"));
$rh = @fopen($dataDir . "/reservas-rate.json", "c+");
if ($rh === false) {
    res_fail("No se pudo guardar la reserva. Escríbenos por WhatsApp.", 500);
}
flock($rh, LOCK_EX);
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
if (count($rate[$ipKey] ?? []) >= 5) {
    flock($rh, LOCK_UN);
    fclose($rh);
    res_fail("Has hecho demasiadas reservas seguidas. Inténtalo de nuevo dentro de una hora.", 429);
}
$rate[$ipKey][] = $now;
ftruncate($rh, 0);
rewind($rh);
fwrite($rh, (string) json_encode($rate));
fflush($rh);
flock($rh, LOCK_UN);
fclose($rh);

// Aforo y duplicados bajo bloqueo exclusivo; la reserva se añade en el mismo bloqueo.
$capacity = max(1, (int) ($group["capacity"] ?? 3));
$id = strtoupper(bin2hex(random_bytes(4)));
$booking = [
    "id" => $id,
    "created_at" => date("c"),
    "status" => "confirmada",
    "date" => $date,
    "group" => $groupId,
    "group_name" => (string) $group["name"],
    "start" => (string) $group["start"],
    "end" => (string) $group["end"],
    "name" => $name,
    "age" => $age,
    "guardian" => $guardian,
    "email" => $email,
    "phone" => $phone,
    "notes" => $notes,
];

$fh = @fopen($file, "c+b");
if ($fh === false || !flock($fh, LOCK_EX)) {
    res_fail("No se pudo guardar la reserva. Escríbenos por WhatsApp.", 500);
}
$rows = res_rows($fh);
$taken = res_counts($rows, "0000-00-00")[$date . "|" . $groupId] ?? 0;
$dup = false;
foreach ($rows as $r) {
    if ($r["date"] === $date && $r["group"] === $groupId && ($r["status"] ?? "") !== "cancelada"
        && strtolower((string) ($r["email"] ?? "")) === strtolower($email)
        && mb_strtolower((string) ($r["name"] ?? "")) === mb_strtolower($name)) {
        $dup = true;
    }
}
if ($dup) {
    flock($fh, LOCK_UN);
    fclose($fh);
    res_fail("Ya hay una reserva a ese nombre para esa clase. Si necesitas cambiarla, escríbenos.", 409);
}
if ($taken >= $capacity) {
    flock($fh, LOCK_UN);
    fclose($fh);
    res_fail("Esa clase se acaba de llenar. Elige otra fecha o escríbenos por WhatsApp.", 409);
}
fseek($fh, 0, SEEK_END);
$written = fwrite($fh, json_encode($booking, JSON_UNESCAPED_UNICODE) . "\n");
fflush($fh);
flock($fh, LOCK_UN);
fclose($fh);
if ($written === false) {
    res_fail("No se pudo guardar la reserva. Escríbenos por WhatsApp.", 500);
}

// Correos (un fallo de mail() no invalida la reserva ya guardada).
$clubEmail = res_club_email();
$when = res_date_es($date) . ", de {$group['start']} a {$group['end']}";
$ageLine = $age !== null ? "Edad: {$age}\n" : "";
$guardLine = $guardian !== "" ? "Padre/madre/tutor: {$guardian}\n" : "";

res_mail(
    $clubEmail,
    "[Clase gratis] {$id} - {$name} - " . res_date_es($date),
    "Nueva reserva de clase gratis {$id}\n\nGrupo: {$group['name']}\nCuándo: {$when}\n\n"
    . "Participante: {$name}\n{$ageLine}{$guardLine}Email: {$email}\nTeléfono: {$phone}\n"
    . "Comentarios: " . ($notes !== "" ? $notes : "-") . "\n\n"
    . "Plazas ocupadas en esta sesión: " . ($taken + 1) . " de {$capacity}.\n",
    $email
);

$bring = "";
foreach (($cfg["notes"] ?? []) as $n) {
    if (is_string($n) && $n !== "") {
        $bring .= "- {$n}\n";
    }
}
res_mail(
    $email,
    "Tu clase gratis del " . res_date_es($date) . " - " . RES_SITE_NAME,
    "Hola {$name},\n\nTu clase gratis está reservada (referencia {$id}).\n\n"
    . "Grupo: {$group['name']}\nCuándo: {$when}\nDónde: " . RES_VENUE . "\n\n"
    . ($bring !== "" ? "Qué traer:\n{$bring}\n" : "")
    . res_cancel_text($clubEmail) . "\n\n"
    . "Te enviaremos un recordatorio el día antes. ¡Te esperamos!\n\n" . RES_SITE_NAME . "\n",
    $clubEmail
);

res_respond([
    "ok" => true,
    "id" => $id,
    "date" => $date,
    "start" => (string) $group["start"],
    "end" => (string) $group["end"],
    "group" => (string) $group["name"],
]);
