<?php
/**
 * Mercadillo de segunda mano del club (hosting compartido OVH, PHP 7.4+).
 *
 *  GET  ?lista           -> anuncios aprobados y vigentes (JSON, sin correo).
 *  GET  ?foto=<id>       -> foto de un anuncio aprobado (404 si no lo está).
 *  POST multipart        -> publicar un anuncio (queda "pendiente" hasta que
 *                           el club lo revisa en /gestion/mercadillo.php).
 *  POST JSON {accion, token} -> enlace privado del anunciante: ver, vendido,
 *                           renovar o borrar su anuncio.
 *
 * Los datos y las fotos se guardan en la carpeta privada (mercadillo.jsonl,
 * mercadillo-fotos/). Textos y listas: mercadillo-config.json (copia de
 * src/content/data/mercadillo.json hecha por el despliegue).
 */

declare(strict_types=1);

require __DIR__ . "/mercadillo-lib.php";

date_default_timezone_set("Europe/Madrid");

$method = $_SERVER["REQUEST_METHOD"] ?? "";
$cfg = mer_config();
if (!$cfg) {
    res_fail("El mercadillo no está disponible ahora mismo. Escríbenos por WhatsApp.", 503);
}

// --- GET ?foto=<id> -------------------------------------------------------
if ($method === "GET" && isset($_GET["foto"])) {
    $pid = (string) $_GET["foto"];
    $dir = mer_find_dir();
    $path = $dir !== null ? mer_photo_path($dir, $pid) : null;
    $ok = false;
    if ($path !== null) {
        foreach (mer_read($dir) as $r) {
            if (in_array($pid, is_array($r["photos"] ?? null) ? $r["photos"] : [], true) && mer_is_public($r)) {
                $ok = true;
                break;
            }
        }
    }
    if (!$ok) {
        http_response_code(404);
        header("Content-Type: text/plain; charset=utf-8");
        echo "No encontrada";
        exit;
    }
    header("Content-Type: " . mer_photo_mime($path));
    header("X-Content-Type-Options: nosniff");
    header("Cache-Control: public, max-age=3600");
    header("Content-Length: " . filesize($path));
    readfile($path);
    exit;
}

// --- GET ?lista -----------------------------------------------------------
if ($method === "GET") {
    if (!isset($_GET["lista"])) {
        res_fail("Solicitud no válida.", 400);
    }
    $dir = mer_find_dir();
    $items = [];
    if ($dir !== null) {
        mer_purge($dir);
        $rows = array_values(array_filter(mer_read($dir), "mer_is_public"));
        usort($rows, function ($a, $b) {
            return strcmp((string) ($b["approved_at"] ?? ""), (string) ($a["approved_at"] ?? ""));
        });
        foreach ($rows as $r) {
            $items[] = mer_public_item($r);
        }
    }
    res_respond(["ok" => true, "items" => $items]);
}

if ($method !== "POST") {
    header("Allow: GET, POST");
    res_fail("Método no permitido.", 405);
}

$dataDir = res_data_dir();
if ($dataDir === null) {
    res_fail("No se pudo guardar el anuncio. Escríbenos por WhatsApp.", 500);
}

// --- POST JSON: enlace privado del anunciante -----------------------------
$ctype = strtolower((string) ($_SERVER["CONTENT_TYPE"] ?? ""));
if (strpos($ctype, "application/json") === 0) {
    $in = json_decode((string) file_get_contents("php://input", false, null, 0, 4096), true);
    if (!is_array($in)) {
        res_fail("Solicitud no válida.");
    }
    $token = is_string($in["token"] ?? null) ? $in["token"] : "";
    $accion = is_string($in["accion"] ?? null) ? $in["accion"] : "";
    $rows = mer_read($dataDir);
    $ad = mer_find_by_token($rows, $token);
    if ($ad === null) {
        usleep(300000);
        res_fail("No encontramos este anuncio. Revisa el enlace del correo que te enviamos.", 404);
    }
    $id = (string) $ad["id"];
    $now = time();
    $daysLeft = null;
    if (($ad["status"] ?? "") === "aprobado" && isset($ad["expires_at"])) {
        $daysLeft = (int) ceil((strtotime((string) $ad["expires_at"]) - $now) / 86400);
    }

    if ($accion === "vendido") {
        if (!in_array($ad["status"], ["aprobado", "pendiente"], true)) {
            res_fail("Este anuncio ya no está publicado.");
        }
        mer_update($dataDir, function (array $rows) use ($id) {
            foreach ($rows as &$r) {
                if ((string) $r["id"] === $id) {
                    $r["status"] = "vendido";
                    $r["sold_at"] = date("c");
                    $r["updated_at"] = date("c");
                }
            }
            return $rows;
        });
        res_respond(["ok" => true, "status" => "vendido"]);
    }
    if ($accion === "renovar") {
        if (($ad["status"] ?? "") !== "aprobado" || $daysLeft === null) {
            res_fail("Solo se pueden renovar los anuncios publicados.");
        }
        if ($daysLeft > MER_RENEW_WINDOW) {
            res_fail("Todavía no hace falta renovarlo: podrás hacerlo cuando falten " . MER_RENEW_WINDOW . " días o menos.");
        }
        $base = max($now, strtotime((string) $ad["expires_at"]));
        $newExp = date("c", $base + MER_RENEW_DAYS * 86400);
        mer_update($dataDir, function (array $rows) use ($id, $newExp) {
            foreach ($rows as &$r) {
                if ((string) $r["id"] === $id) {
                    $r["expires_at"] = $newExp;
                    $r["renewed"] = (int) ($r["renewed"] ?? 0) + 1;
                    $r["updated_at"] = date("c");
                }
            }
            return $rows;
        });
        res_respond(["ok" => true, "status" => "aprobado", "expires_at" => $newExp, "days_left" => (int) ceil(($base + MER_RENEW_DAYS * 86400 - $now) / 86400)]);
    }
    if ($accion === "borrar") {
        $photos = is_array($ad["photos"] ?? null) ? $ad["photos"] : [];
        mer_update($dataDir, function (array $rows) use ($id) {
            return array_values(array_filter($rows, function ($r) use ($id) {
                return (string) $r["id"] !== $id;
            }));
        });
        mer_delete_photos($dataDir, $photos);
        res_respond(["ok" => true, "status" => "borrado"]);
    }
    if ($accion !== "ver") {
        res_fail("Solicitud no válida.");
    }
    res_respond([
        "ok" => true,
        "ad" => [
            "title" => (string) ($ad["title"] ?? ""),
            "kind" => (string) ($ad["kind"] ?? "vendo"),
            "status" => (string) ($ad["status"] ?? ""),
            "expired" => mer_is_expired($ad),
            "days_left" => $daysLeft,
            "can_renew" => ($ad["status"] ?? "") === "aprobado" && $daysLeft !== null && $daysLeft <= MER_RENEW_WINDOW,
            "reject_reason" => (string) ($ad["reject_reason"] ?? ""),
        ],
    ]);
}

// --- POST multipart: publicar -------------------------------------------
// Honeypot: respuesta de éxito falsa para no dar pistas a los bots.
if (!empty($_POST["website"])) {
    res_respond(["ok" => true]);
}

$str = function (string $k, int $max) {
    return res_clean(is_string($_POST[$k] ?? null) ? $_POST[$k] : "", $max);
};
$tipos = mer_options($cfg, "tipos");
$estados = mer_options($cfg, "estados");
$manos = mer_options($cfg, "manos");

$kind = $str("kind", 10);
$category = $str("category", 30);
$title = $str("title", 80);
$description = res_clean_text(is_string($_POST["description"] ?? null) ? $_POST["description"] : "", 600);
$size = $str("size", 30);
$hand = $str("hand", 20);
$condition = $str("condition", 20);
$priceRaw = $str("price", 10);
$zone = $str("zone", 60);
$name = $str("name", 40);
$phoneRaw = $str("phone", 30);
$email = $str("email", 150);

if (!in_array($kind, ["vendo", "busco"], true)) {
    res_fail("Elige si vendes o buscas material.");
}
if (!isset($tipos[$category])) {
    res_fail("Elige el tipo de material.");
}
if (mb_strlen($title) < 3) {
    res_fail("Escribe un título para el anuncio.");
}
if ($hand !== "" && !isset($manos[$hand])) {
    res_fail("Revisa la mano.");
}
if ($kind === "vendo" && !isset($estados[$condition])) {
    res_fail("Indica el estado del material.");
}
if ($condition !== "" && !isset($estados[$condition])) {
    res_fail("Revisa el estado del material.");
}
$price = null;
if ($priceRaw !== "") {
    if (!ctype_digit($priceRaw) || (int) $priceRaw > 5000) {
        res_fail("El precio debe ser un número entero de euros (0 si lo regalas).");
    }
    $price = (int) $priceRaw;
} elseif ($kind === "vendo") {
    res_fail("Indica el precio (0 si lo regalas).");
}
if ($name === "") {
    res_fail("Escribe tu nombre de pila.");
}
$phone = mer_phone($phoneRaw);
if ($phone === null) {
    res_fail("Revisa tu WhatsApp: un móvil español de 9 cifras o un número internacional con +.");
}
if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    res_fail("Revisa tu correo electrónico e inténtalo de nuevo.");
}
if (empty($_POST["adult"]) || empty($_POST["share"]) || empty($_POST["privacy"])) {
    res_fail("Debes marcar las tres casillas para publicar el anuncio.");
}

// Fotos (opcionales, hasta 3). Se comprueban antes de gastar el límite diario.
$uploads = [];
if (isset($_FILES["photos"]) && is_array($_FILES["photos"]["name"] ?? null)) {
    foreach ($_FILES["photos"]["name"] as $i => $n) {
        $err = (int) ($_FILES["photos"]["error"][$i] ?? UPLOAD_ERR_NO_FILE);
        if ($err === UPLOAD_ERR_NO_FILE) {
            continue;
        }
        if ($err === UPLOAD_ERR_INI_SIZE || $err === UPLOAD_ERR_FORM_SIZE) {
            res_fail("Cada foto debe pesar menos de 1,5 MB.");
        }
        $tmp = (string) ($_FILES["photos"]["tmp_name"][$i] ?? "");
        if ($err !== UPLOAD_ERR_OK || $tmp === "" || !is_uploaded_file($tmp)) {
            res_fail("No se pudo subir una de las fotos. Inténtalo de nuevo.");
        }
        $uploads[] = [$tmp, (int) ($_FILES["photos"]["size"][$i] ?? 0)];
    }
}
if (count($uploads) > MER_MAX_PHOTOS) {
    res_fail("Puedes subir como máximo " . MER_MAX_PHOTOS . " fotos.");
}

mer_purge($dataDir);

// Límite de frecuencia: 3 anuncios por día y por IP (hash, como pedido.php).
$ipKey = hash("sha256", (string) ($_SERVER["REMOTE_ADDR"] ?? "unknown"));
$rh = @fopen($dataDir . "/mercadillo-rate.json", "c+");
if ($rh === false) {
    res_fail("No se pudo guardar el anuncio. Escríbenos por WhatsApp.", 500);
}
flock($rh, LOCK_EX);
$rate = json_decode((string) stream_get_contents($rh), true);
$rate = is_array($rate) ? $rate : [];
$now = time();
foreach ($rate as $k => $times) {
    $rate[$k] = array_values(array_filter(is_array($times) ? $times : [], function ($t) use ($now) {
        return is_int($t) && $t > $now - 86400;
    }));
    if (!$rate[$k]) {
        unset($rate[$k]);
    }
}
if (count($rate[$ipKey] ?? []) >= MER_MAX_PER_IP_DAY) {
    flock($rh, LOCK_UN);
    fclose($rh);
    res_fail("Has publicado demasiados anuncios hoy. Inténtalo de nuevo mañana.", 429);
}
$rate[$ipKey][] = $now;
ftruncate($rh, 0);
rewind($rh);
fwrite($rh, (string) json_encode($rate));
fflush($rh);
flock($rh, LOCK_UN);
fclose($rh);

$photoIds = [];
foreach ($uploads as $u) {
    [$pid, $perr] = mer_save_photo($dataDir, $u[0], $u[1]);
    if ($pid === null) {
        mer_delete_photos($dataDir, $photoIds);
        res_fail($perr);
    }
    $photoIds[] = $pid;
}

$id = strtoupper(bin2hex(random_bytes(4)));
$token = bin2hex(random_bytes(24));
$ad = [
    "id" => $id,
    "created_at" => date("c"),
    "updated_at" => date("c"),
    "status" => "pendiente",
    "token_hash" => mer_token_hash($token),
    "kind" => $kind,
    "category" => $category,
    "title" => $title,
    "description" => $description,
    "size" => $size,
    "hand" => $hand,
    "condition" => $condition,
    "price" => $price,
    "zone" => $zone,
    "photos" => $photoIds,
    "name" => $name,
    "phone" => $phone,
    "email" => $email,
];
$written = @file_put_contents(
    mer_file($dataDir),
    json_encode($ad, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n",
    FILE_APPEND | LOCK_EX
);
if ($written === false) {
    mer_delete_photos($dataDir, $photoIds);
    res_fail("No se pudo guardar el anuncio. Escríbenos por WhatsApp.", 500);
}
@chmod(mer_file($dataDir), 0640);

// Correos (un fallo de mail() no invalida el anuncio ya guardado).
$clubEmail = res_club_email();
$kindTxt = $kind === "vendo" ? "Se vende" : "Se busca";
res_mail(
    $clubEmail,
    "[Mercadillo] Anuncio pendiente {$id} - {$title}",
    "Hay un anuncio nuevo pendiente de revisión ({$id}).\n\n{$kindTxt}: {$title}\nDe: {$name} · +{$phone}\n\n"
    . "Revísalo y apruébalo o recházalo aquí:\n" . mer_base_url() . "/gestion/mercadillo.php\n",
    $email
);
res_mail(
    $email,
    "Hemos recibido tu anuncio - " . RES_SITE_NAME,
    "Hola {$name},\n\nHemos recibido tu anuncio «{$title}». El club lo revisará y, cuando esté publicado, te lo diremos por correo.\n\n"
    . "Este es tu enlace privado para marcarlo como vendido (o encontrado), renovarlo o borrarlo. No lo compartas:\n"
    . mer_manage_url($token) . "\n\n"
    . "Recuerda: el club solo revisa que el anuncio sea de esgrima; la compraventa es entre particulares.\n\n"
    . RES_SITE_NAME . "\n",
    $clubEmail
);

res_respond(["ok" => true, "id" => $id]);
