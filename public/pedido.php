<?php
/**
 * Solicitudes de pedido de la Tienda del club (hosting compartido OVH, PHP 7.4+).
 * Recibe un POST JSON desde /tienda, valida, guarda el pedido como una línea
 * JSON en un directorio privado y avisa por correo al club y al socio.
 *
 * Lista de productos válidos: tienda-productos.json junto a este script
 * (el despliegue copia src/content/data/tienda.json a out/tienda-productos.json);
 * en local también se lee ../src/content/data/tienda.json si existe.
 */

declare(strict_types=1);

header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

$siteName = "Club de Esgrima Torremolinos";
$fallbackEmail = "esgrimatorremolinos@gmail.com";

// El carrito de /en/shop/ envía lang=en para ver las respuestas (errores y
// copia por correo al cliente) en inglés. Sin lang, todo sigue en español.
$lang = "es";

function t(string $es, string $en): string
{
    global $lang;
    return $lang === "en" ? $en : $es;
}

function respond(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail(string $error, int $status = 400): void
{
    respond(["ok" => false, "error" => $error], $status);
}

function clean(string $value, int $max): string
{
    // Sin saltos de línea (cabeceras de correo) ni caracteres de control.
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', " ", $value) ?? "";
    return mb_substr(trim($value), 0, $max);
}

function clean_text(string $value, int $max): string
{
    $value = str_replace("\r", "", $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', "", $value) ?? "";
    return mb_substr(trim($value), 0, $max);
}

// Nombre del producto para mostrar en los mensajes (name_en si hay inglés).
function display_name(array $product): string
{
    global $lang;
    if ($lang === "en" && !empty($product["name_en"]) && is_string($product["name_en"])) {
        return $product["name_en"];
    }
    return (string) ($product["name"] ?? "");
}

// Nombres de las opciones en inglés (solo para los textos mostrados al cliente).
function option_name_en(string $name): string
{
    $map = [
        "Color" => "Colour", "Cazoleta" => "Guard", "Puño" => "Grip", "Material" => "Material",
        "Sexo" => "Cut", "Dureza" => "Stiffness", "Hoja" => "Blade", "Tamaño" => "Size",
    ];
    return $map[$name] ?? $name;
}

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
    header("Allow: POST");
    fail("Método no permitido.", 405);
}

$raw = file_get_contents("php://input", false, null, 0, 65536);
$in = is_string($raw) ? json_decode($raw, true) : null;
if (!is_array($in)) {
    fail("Solicitud no válida.");
}
if (($in["lang"] ?? "") === "en") {
    $lang = "en";
}

// Honeypot: respuesta de éxito falsa para no dar pistas a los bots.
if (!empty($in["website"])) {
    respond(["ok" => true, "id" => "00000000"]);
}

// Catálogo de productos.
$catalogFile = null;
foreach ([__DIR__ . "/tienda-productos.json", __DIR__ . "/../src/content/data/tienda.json"] as $candidate) {
    if (is_file($candidate)) {
        $catalogFile = $candidate;
        break;
    }
}
$catalog = $catalogFile ? json_decode((string) file_get_contents($catalogFile), true) : null;
if (!is_array($catalog) || !isset($catalog["products"]) || !is_array($catalog["products"])) {
    fail(t("La tienda no está disponible ahora mismo. Escríbenos por WhatsApp.", "The shop is not available right now. Please message us on WhatsApp."), 503);
}
$products = [];
foreach ($catalog["products"] as $p) {
    if (is_array($p) && isset($p["id"]) && ($p["active"] ?? true)) {
        $products[(string) $p["id"]] = $p;
    }
}
$orderEmail = (isset($catalog["orderEmail"]) && filter_var($catalog["orderEmail"], FILTER_VALIDATE_EMAIL))
    ? (string) $catalog["orderEmail"]
    : $fallbackEmail;

// Validación de campos.
$name = clean(is_string($in["name"] ?? null) ? $in["name"] : "", 100);
$email = clean(is_string($in["email"] ?? null) ? $in["email"] : "", 150);
$phone = clean(is_string($in["phone"] ?? null) ? $in["phone"] : "", 30);
$notes = clean_text(is_string($in["notes"] ?? null) ? $in["notes"] : "", 1000);

if ($name === "" || $phone === "") {
    fail(t("Revisa tu nombre y teléfono e inténtalo de nuevo.", "Please check your name and phone number and try again."));
}
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(t("Revisa tu correo electrónico e inténtalo de nuevo.", "Please check your email address and try again."));
}

$rawLines = $in["lines"] ?? null;
if (!is_array($rawLines) || count($rawLines) < 1) {
    fail(t("Añade al menos un producto al pedido.", "Please add at least one product to the order."));
}
if (count($rawLines) > 20) {
    fail(t("Un pedido admite como máximo 20 líneas.", "An order can have at most 20 lines."));
}

$lines = [];
foreach ($rawLines as $l) {
    if (!is_array($l)) {
        fail(t("Línea de pedido no válida.", "Invalid order line."));
    }
    $pid = is_string($l["product"] ?? null) ? $l["product"] : "";
    if (!isset($products[$pid])) {
        fail(t("Hay un producto que ya no está disponible. Recarga la página.", "One of the products is no longer available. Please reload the page."));
    }
    $qty = $l["qty"] ?? null;
    if (!is_int($qty) && !(is_string($qty) && ctype_digit($qty))) {
        fail(t("Cantidad no válida.", "Invalid quantity."));
    }
    $qty = (int) $qty;
    if ($qty < 1 || $qty > 5) {
        fail(t("La cantidad debe estar entre 1 y 5 por producto.", "The quantity must be between 1 and 5 for each product."));
    }
    $sizes = isset($products[$pid]["sizes"]) && is_array($products[$pid]["sizes"]) ? $products[$pid]["sizes"] : [];
    $size = clean(is_string($l["size"] ?? null) ? $l["size"] : "", 20);
    if (count($sizes) > 0) {
        if (!in_array($size, array_map("strval", $sizes), true)) {
            fail(t("Elige una talla válida para ", "Please choose a valid size for ") . display_name($products[$pid]) . ".");
        }
    } else {
        $size = "";
    }
    $hands = isset($products[$pid]["hands"]) && is_array($products[$pid]["hands"]) ? $products[$pid]["hands"] : [];
    $hand = clean(is_string($l["hand"] ?? null) ? $l["hand"] : "", 20);
    if (count($hands) > 0) {
        if (!in_array($hand, array_map("strval", $hands), true)) {
            fail(t("Elige la mano (diestro/zurdo) para ", "Please choose a hand (right-handed/left-handed) for ") . display_name($products[$pid]) . ".");
        }
    } else {
        $hand = "";
    }
    // Otras opciones del producto (color, cazoleta, puño…): todas obligatorias.
    $prodOpts = isset($products[$pid]["options"]) && is_array($products[$pid]["options"]) ? $products[$pid]["options"] : [];
    $sentOpts = is_array($l["options"] ?? null) ? $l["options"] : [];
    $optParts = [];
    foreach ($prodOpts as $o) {
        if (!is_array($o) || !is_string($o["name"] ?? null) || !is_array($o["values"] ?? null) || count($o["values"]) === 0) {
            continue;
        }
        $oname = $o["name"];
        $oval = is_string($sentOpts[$oname] ?? null) ? clean($sentOpts[$oname], 80) : "";
        if (!in_array($oval, array_map("strval", $o["values"]), true)) {
            fail(t("Elige " . $oname . " para ", "Please choose an option (" . option_name_en($oname) . ") for ") . display_name($products[$pid]) . ".");
        }
        $optParts[] = $oname . ": " . $oval;
    }
    $lines[] = [
        "product_id" => $pid,
        "product" => (string) ($products[$pid]["name"] ?? $pid)
            . (!empty($products[$pid]["ref"]) ? " · Ref. " . $products[$pid]["ref"] : ""),
        "name" => (string) ($products[$pid]["name"] ?? $pid),
        "ref" => (string) ($products[$pid]["ref"] ?? ""),
        "price" => (string) ($products[$pid]["price"] ?? ""),
        "url" => (string) ($products[$pid]["url"] ?? ""),
        "supplier" => (string) ($products[$pid]["supplier"] ?? ""),
        "size" => $size,
        "hand" => $hand,
        "options" => implode(" · ", $optParts),
        "qty" => $qty,
    ];
}

// Directorio privado de datos.
$dataDir = null;
$outside = dirname(__DIR__) . "/club-data";
if (is_dir($outside) || (is_writable(dirname(__DIR__)) && @mkdir($outside, 0750))) {
    $dataDir = $outside;
} else {
    $dataDir = __DIR__ . "/_data";
    if (!is_dir($dataDir)) {
        @mkdir($dataDir, 0750, true);
    }
    $ht = $dataDir . "/.htaccess";
    if (!is_file($ht)) {
        @file_put_contents($ht, "Require all denied\n<IfModule !mod_authz_core.c>\n  Order deny,allow\n  Deny from all\n</IfModule>\n");
    }
}
if (!is_dir($dataDir) || !is_writable($dataDir)) {
    fail(t("No se pudo guardar el pedido. Escríbenos por WhatsApp.", "We could not save your order. Please message us on WhatsApp."), 500);
}

// Límite de frecuencia: 5 pedidos por hora y por IP.
$ip = (string) ($_SERVER["REMOTE_ADDR"] ?? "unknown");
$ipKey = hash("sha256", $ip);
$rateFile = $dataDir . "/pedidos-rate.json";
$rh = @fopen($rateFile, "c+");
if ($rh === false) {
    fail(t("No se pudo guardar el pedido. Escríbenos por WhatsApp.", "We could not save your order. Please message us on WhatsApp."), 500);
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
    fail(t("Has enviado demasiados pedidos. Inténtalo de nuevo dentro de una hora.", "You have sent too many orders. Please try again in an hour."), 429);
}
$rate[$ipKey][] = $now;
ftruncate($rh, 0);
rewind($rh);
fwrite($rh, (string) json_encode($rate));
fflush($rh);
flock($rh, LOCK_UN);
fclose($rh);

// Guardar el pedido (una línea JSON).
$id = strtoupper(bin2hex(random_bytes(4)));
$order = [
    "id" => $id,
    "created_at" => date("c"),
    "status" => "nuevo",
    "customer" => ["name" => $name, "email" => $email, "phone" => $phone],
    "lines" => $lines,
    "notes" => $notes,
];
if ($lang === "en") {
    $order["lang"] = "en";
}
$written = @file_put_contents(
    $dataDir . "/pedidos.jsonl",
    json_encode($order, JSON_UNESCAPED_UNICODE) . "\n",
    FILE_APPEND | LOCK_EX
);
if ($written === false) {
    fail(t("No se pudo guardar el pedido. Escríbenos por WhatsApp.", "We could not save your order. Please message us on WhatsApp."), 500);
}

// Correos (un fallo de mail() no invalida el pedido ya guardado).
$summary = "";
foreach ($lines as $l) {
    $summary .= "- {$l['qty']} x {$l['product']} ({$l['supplier']})"
        . ($l["size"] !== "" ? ", talla {$l['size']}" : "")
        . ($l["hand"] !== "" ? ", {$l['hand']}" : "")
        . ($l["options"] !== "" ? ", {$l['options']}" : "") . "\n";
}
$host = preg_replace('/[^A-Za-z0-9.\-]/', "", (string) ($_SERVER["HTTP_HOST"] ?? "")) ?: "esgrimatorremolinos.com";
$from = "From: {$siteName} <no-reply@{$host}>\r\n";

$body = "Nuevo pedido {$id}\n\nSocio: {$name}\nEmail: {$email}\nTeléfono: {$phone}\n\n"
    . "Productos:\n{$summary}\nNotas: " . ($notes !== "" ? $notes : "-") . "\n"
    . ($lang === "en" ? "\n(Pedido hecho desde la tienda en inglés: el socio ha recibido la copia en inglés.)\n" : "");
@mail(
    $orderEmail,
    "=?UTF-8?B?" . base64_encode("[Tienda] Nuevo pedido {$id} - {$name}") . "?=",
    $body,
    $from . "Reply-To: {$email}\r\nContent-Type: text/plain; charset=utf-8"
);

if ($lang === "en") {
    $handEn = ["Diestro" => "right-handed", "Zurdo" => "left-handed"];
    $summaryEn = "";
    foreach ($lines as $l) {
        $optsEn = [];
        foreach (array_filter(explode(" · ", $l["options"])) as $part) {
            $kv = explode(": ", $part, 2);
            $optsEn[] = count($kv) === 2 ? option_name_en($kv[0]) . ": " . $kv[1] : $part;
        }
        $pEn = $products[$l["product_id"]];
        $nameEn = display_name($pEn) . (!empty($pEn["ref"]) ? " · Ref. " . $pEn["ref"] : "");
        $summaryEn .= "- {$l['qty']} x {$nameEn} ({$l['supplier']})"
            . ($l["size"] !== "" ? ", size {$l['size']}" : "")
            . ($l["hand"] !== "" ? ", " . ($handEn[$l["hand"]] ?? $l["hand"]) : "")
            . ($optsEn ? ", " . implode(" · ", $optsEn) : "") . "\n";
    }
    $copy = "Hello {$name},\n\nWe have received your order request {$id}:\n\n{$summaryEn}\n"
        . "This is a request: the club groups members' orders and will tell you the total before ordering from the supplier.\n\n"
        . "{$siteName}\n";
    $copySubject = "Order request {$id} - {$siteName}";
} else {
    $copy = "Hola {$name},\n\nHemos recibido tu solicitud de pedido {$id}:\n\n{$summary}\n"
        . "Esto es una solicitud: el club agrupa los pedidos y te avisará del importe antes de pedirlo al proveedor.\n\n"
        . "{$siteName}\n";
    $copySubject = "Solicitud de pedido {$id} - {$siteName}";
}
@mail(
    $email,
    "=?UTF-8?B?" . base64_encode($copySubject) . "?=",
    $copy,
    $from . "Reply-To: {$orderEmail}\r\nContent-Type: text/plain; charset=utf-8"
);

respond(["ok" => true, "id" => $id]);
