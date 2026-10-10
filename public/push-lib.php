<?php
/**
 * Funciones comunes de los avisos al móvil (Web Push): claves VAPID,
 * suscripciones, historial de avisos y envío. Solo define funciones: abrirlo
 * directamente no muestra nada (y .htaccess deniega *-lib.php).
 *
 * Los envíos son "sin carga" (cuerpo vacío): no hace falta cifrar nada. El
 * móvil despierta al service worker (sw.js), que pide /aviso-actual.php y
 * muestra el aviso. Solo se necesita autenticación VAPID (JWT ES256).
 * Hosting compartido OVH, PHP 7.4+, openssl y curl, sin Composer.
 */

declare(strict_types=1);

const PUSH_SUBJECT = "mailto:esgrimatorremolinos@gmail.com";
const PUSH_TTL = 86400;
const PUSH_BATCH = 40;
const PUSH_ALLOWED_HOSTS = [
    "fcm.googleapis.com",
    "*.push.services.mozilla.com",
    "*.notify.windows.com",
    "web.push.apple.com",
    "*.push.apple.com",
];

function push_json(array $data, int $status = 200): void
{
    http_response_code($status);
    header("Content-Type: application/json; charset=utf-8");
    header("Cache-Control: no-store");
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** Directorio privado de datos (misma lógica que reservas-lib.php). */
function push_data_dir(): ?string
{
    $outside = dirname(__DIR__) . "/club-data";
    if (is_dir($outside) || (is_writable(dirname(__DIR__)) && @mkdir($outside, 0750))) {
        if (is_writable($outside)) {
            return $outside;
        }
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

function push_file(string $name): ?string
{
    $dir = push_data_dir();
    return $dir === null ? null : $dir . "/" . $name;
}

function push_b64u(string $bin): string
{
    return rtrim(strtr(base64_encode($bin), "+/", "-_"), "=");
}

function push_b64u_decode(string $s): string
{
    return (string) base64_decode(strtr($s, "-_", "+/"));
}

// --- Claves VAPID ----------------------------------------------------------

/**
 * Claves VAPID: se generan la primera vez y se guardan en el directorio
 * privado (push-vapid.json). Nunca se versionan.
 *
 * @return array{pem:string,public:string}|null
 */
function push_keys(): ?array
{
    $path = push_file("push-vapid.json");
    if ($path === null) {
        return null;
    }
    $read = function () use ($path): ?array {
        if (!is_file($path)) {
            return null;
        }
        $k = json_decode((string) file_get_contents($path), true);
        if (is_array($k) && !empty($k["pem"]) && !empty($k["public"])) {
            return ["pem" => (string) $k["pem"], "public" => (string) $k["public"]];
        }
        return null;
    };
    $existing = $read();
    if ($existing !== null) {
        return $existing;
    }
    $lock = @fopen($path . ".lock", "c");
    if (!$lock || !flock($lock, LOCK_EX)) {
        return null;
    }
    try {
        // Otro proceso pudo crearlas mientras esperábamos.
        $existing = $read();
        if ($existing !== null) {
            return $existing;
        }
        $res = @openssl_pkey_new(["curve_name" => "prime256v1", "private_key_type" => OPENSSL_KEYTYPE_EC]);
        if (!$res) {
            return null;
        }
        $pem = "";
        if (!openssl_pkey_export($res, $pem)) {
            return null;
        }
        $det = openssl_pkey_get_details($res);
        if (!$det || empty($det["ec"]["x"]) || empty($det["ec"]["y"])) {
            return null;
        }
        $x = str_pad($det["ec"]["x"], 32, "\0", STR_PAD_LEFT);
        $y = str_pad($det["ec"]["y"], 32, "\0", STR_PAD_LEFT);
        $pub = push_b64u("\x04" . $x . $y);
        $json = json_encode(["pem" => $pem, "public" => $pub, "created_at" => gmdate("c")]);
        if (@file_put_contents($path, $json, LOCK_EX) === false) {
            return null;
        }
        @chmod($path, 0600);
        return ["pem" => $pem, "public" => $pub];
    } finally {
        flock($lock, LOCK_UN);
        fclose($lock);
    }
}

/** DER (SEQUENCE{INTEGER r, INTEGER s}) -> r||s de 64 bytes. */
function push_der_to_raw(string $der): ?string
{
    $o = 0;
    if (strlen($der) < 8 || ord($der[$o++]) !== 0x30) {
        return null;
    }
    $len = ord($der[$o++]);
    if ($len & 0x80) {
        $o += $len & 0x7f;
    }
    $parts = [];
    for ($i = 0; $i < 2; $i++) {
        if (!isset($der[$o]) || ord($der[$o++]) !== 0x02) {
            return null;
        }
        $l = ord($der[$o++]);
        $int = substr($der, $o, $l);
        $o += $l;
        $int = ltrim($int, "\0");
        if (strlen($int) > 32) {
            return null;
        }
        $parts[] = str_pad($int, 32, "\0", STR_PAD_LEFT);
    }
    return $parts[0] . $parts[1];
}

/** r||s (64 bytes) -> DER; solo se usa en las pruebas para openssl_verify. */
function push_raw_to_der(string $raw): string
{
    $enc = function (string $i): string {
        $i = ltrim($i, "\0");
        if ($i === "" || (ord($i[0]) & 0x80)) {
            $i = "\0" . $i;
        }
        return "\x02" . chr(strlen($i)) . $i;
    };
    $body = $enc(substr($raw, 0, 32)) . $enc(substr($raw, 32, 32));
    return "\x30" . chr(strlen($body)) . $body;
}

function push_jwt(string $audience, string $pem, ?int $now = null): ?string
{
    $now = $now ?? time();
    $head = push_b64u((string) json_encode(["typ" => "JWT", "alg" => "ES256"]));
    $claims = push_b64u((string) json_encode(["aud" => $audience, "exp" => $now + 12 * 3600, "sub" => PUSH_SUBJECT]));
    $input = $head . "." . $claims;
    $sig = "";
    if (!openssl_sign($input, $sig, $pem, OPENSSL_ALGO_SHA256)) {
        return null;
    }
    $raw = push_der_to_raw($sig);
    return $raw === null ? null : $input . "." . push_b64u($raw);
}

// --- Suscripciones -----------------------------------------------------------

function push_host_allowed(string $host): bool
{
    $host = strtolower($host);
    foreach (PUSH_ALLOWED_HOSTS as $pat) {
        if ($pat[0] === "*") {
            $suffix = substr($pat, 1); // ".push.apple.com"
            if (strlen($host) > strlen($suffix) && substr($host, -strlen($suffix)) === $suffix) {
                return true;
            }
        } elseif ($host === $pat) {
            return true;
        }
    }
    return false;
}

/** Endpoint https de un servicio push conocido; devuelve el endpoint o null. */
function push_valid_endpoint($endpoint): ?string
{
    if (!is_string($endpoint) || strlen($endpoint) > 1000 || preg_match('/[\x00-\x20\x7F]/', $endpoint)) {
        return null;
    }
    $p = parse_url($endpoint);
    if (!$p || ($p["scheme"] ?? "") !== "https" || empty($p["host"]) || isset($p["user"]) || isset($p["port"])) {
        return null;
    }
    return push_host_allowed($p["host"]) ? $endpoint : null;
}

/** @return array<int,array<string,mixed>> */
function push_read_jsonl(string $path): array
{
    if (!is_file($path)) {
        return [];
    }
    $fh = @fopen($path, "rb");
    if (!$fh) {
        return [];
    }
    flock($fh, LOCK_SH);
    $out = [];
    while (($line = fgets($fh)) !== false) {
        $row = json_decode(trim($line), true);
        if (is_array($row)) {
            $out[] = $row;
        }
    }
    flock($fh, LOCK_UN);
    fclose($fh);
    return $out;
}

/** Reescribe un .jsonl completo bajo bloqueo exclusivo: $mutate recibe y devuelve las filas. */
function push_update_jsonl(string $path, callable $mutate): bool
{
    $fh = @fopen($path, "c+b");
    if (!$fh) {
        return false;
    }
    if (!flock($fh, LOCK_EX)) {
        fclose($fh);
        return false;
    }
    $rows = [];
    while (($line = fgets($fh)) !== false) {
        $row = json_decode(trim($line), true);
        if (is_array($row)) {
            $rows[] = $row;
        }
    }
    $rows = $mutate($rows);
    $out = "";
    foreach ($rows as $r) {
        $out .= json_encode($r, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, $out);
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return true;
}

/** @return array<int,array<string,mixed>> */
function push_subs(): array
{
    $p = push_file("push-suscripciones.jsonl");
    return $p === null ? [] : push_read_jsonl($p);
}

function push_sub_id(string $endpoint): string
{
    return substr(hash("sha256", $endpoint), 0, 32);
}

function push_sub_add(string $endpoint, string $lang): bool
{
    $p = push_file("push-suscripciones.jsonl");
    if ($p === null) {
        return false;
    }
    $id = push_sub_id($endpoint);
    return push_update_jsonl($p, function (array $rows) use ($id, $endpoint, $lang): array {
        foreach ($rows as $r) {
            if (($r["id"] ?? "") === $id) {
                return $rows; // ya estaba
            }
        }
        $rows[] = ["id" => $id, "endpoint" => $endpoint, "lang" => $lang, "created_at" => gmdate("c")];
        return $rows;
    });
}

/** @param array<int,string> $ids */
function push_sub_remove(array $ids): bool
{
    $p = push_file("push-suscripciones.jsonl");
    if ($p === null || !is_file($p) || !$ids) {
        return true;
    }
    return push_update_jsonl($p, function (array $rows) use ($ids): array {
        return array_values(array_filter($rows, function ($r) use ($ids) {
            return !in_array($r["id"] ?? "", $ids, true);
        }));
    });
}

// --- Avisos (historial) -------------------------------------------------------

/** @return array<int,array<string,mixed>> más recientes primero */
function push_avisos(): array
{
    $p = push_file("avisos.jsonl");
    return $p === null ? [] : array_reverse(push_read_jsonl($p));
}

function push_aviso_add(array $aviso): bool
{
    $p = push_file("avisos.jsonl");
    if ($p === null) {
        return false;
    }
    return push_update_jsonl($p, function (array $rows) use ($aviso): array {
        $rows[] = $aviso;
        return array_slice($rows, -200);
    });
}

function push_aviso_update(string $id, array $fields): void
{
    $p = push_file("avisos.jsonl");
    if ($p === null) {
        return;
    }
    push_update_jsonl($p, function (array $rows) use ($id, $fields): array {
        foreach ($rows as $i => $r) {
            if (($r["id"] ?? "") === $id) {
                $rows[$i] = array_merge($r, $fields);
            }
        }
        return $rows;
    });
}

// --- Envío --------------------------------------------------------------------

/**
 * Envía un push vacío a cada suscripción (curl_multi por lotes).
 * Elimina las que responden 404/410.
 *
 * @param array<int,array<string,mixed>> $subs
 * @param array<int,mixed> $curlOpts opciones curl extra (pruebas)
 * @return array{sent:int,failed:int,removed:int}
 */
function push_send_all(array $subs, array $curlOpts = []): array
{
    $res = ["sent" => 0, "failed" => 0, "removed" => 0];
    $keys = push_keys();
    if ($keys === null || !function_exists("curl_multi_init")) {
        $res["failed"] = count($subs);
        return $res;
    }
    $jwts = [];
    $gone = [];
    foreach (array_chunk($subs, PUSH_BATCH) as $batch) {
        $mh = curl_multi_init();
        $handles = [];
        foreach ($batch as $sub) {
            $endpoint = (string) ($sub["endpoint"] ?? "");
            $p = parse_url($endpoint);
            if (!$p || empty($p["scheme"]) || empty($p["host"])) {
                $res["failed"]++;
                continue;
            }
            $aud = $p["scheme"] . "://" . $p["host"] . (isset($p["port"]) ? ":" . $p["port"] : "");
            if (!isset($jwts[$aud])) {
                $jwts[$aud] = push_jwt($aud, $keys["pem"]);
            }
            if ($jwts[$aud] === null) {
                $res["failed"]++;
                continue;
            }
            $ch = curl_init($endpoint);
            curl_setopt_array($ch, [
                CURLOPT_CUSTOMREQUEST => "POST",
                CURLOPT_POSTFIELDS => "",
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_CONNECTTIMEOUT => 6,
                CURLOPT_TIMEOUT => 15,
                CURLOPT_HTTPHEADER => [
                    "Authorization: vapid t=" . $jwts[$aud] . ", k=" . $keys["public"],
                    "TTL: " . PUSH_TTL,
                    "Urgency: normal",
                    "Content-Length: 0",
                    "Expect:",
                ],
            ] + $curlOpts);
            curl_multi_add_handle($mh, $ch);
            $handles[] = [$ch, (string) ($sub["id"] ?? "")];
        }
        $running = 0;
        do {
            $st = curl_multi_exec($mh, $running);
            if ($running > 0) {
                curl_multi_select($mh, 1.0);
            }
        } while ($running > 0 && $st === CURLM_OK);
        foreach ($handles as [$ch, $id]) {
            $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
            if ($code >= 200 && $code < 300) {
                $res["sent"]++;
            } elseif ($code === 404 || $code === 410) {
                $res["removed"]++;
                $gone[] = $id;
            } else {
                $res["failed"]++;
            }
            curl_multi_remove_handle($mh, $ch);
            curl_close($ch);
        }
        curl_multi_close($mh);
    }
    if ($gone) {
        push_sub_remove($gone);
    }
    return $res;
}
