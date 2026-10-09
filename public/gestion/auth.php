<?php
/**
 * Autenticación de /gestion/: sesión, login, logout, CSRF y limitación de
 * intentos. Se incluye al principio de cada página.
 */
declare(strict_types=1);

define('GESTION_APP', true);

header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');

// --- Configuración -------------------------------------------------------
$__cfg = __DIR__ . '/config.php';
if (is_file($__cfg)) {
    require_once $__cfg;
}
if (!defined('GESTION_USER') || !defined('GESTION_PASS_HASH')
    || trim((string)GESTION_USER) === '' || trim((string)GESTION_PASS_HASH) === '') {
    http_response_code(503);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Gestión</title></head>'
        . '<body style="font-family:system-ui,sans-serif;padding:2rem"><p>Gestión aún no configurada</p></body></html>';
    exit;
}

require_once __DIR__ . '/data.php';

// --- Sesión ---------------------------------------------------------------
function gestion_is_https(): bool
{
    return (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
}

session_name('gestion_sid');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/gestion/',
    'secure' => gestion_is_https(),
    'httponly' => true,
    'samesite' => 'Strict',
]);
ini_set('session.use_strict_mode', '1');
session_start();

if (isset($_SESSION['last']) && time() - (int)$_SESSION['last'] > 8 * 3600) {
    $_SESSION = [];
    session_regenerate_id(true);
}
if (!empty($_SESSION['auth'])) {
    $_SESSION['last'] = time();
}

function gestion_csrf(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function gestion_csrf_field(): string
{
    return '<input type="hidden" name="csrf" value="' . htmlspecialchars(gestion_csrf(), ENT_QUOTES) . '">';
}

function gestion_csrf_ok(): bool
{
    $t = (string)($_POST['csrf'] ?? '');
    return $t !== '' && hash_equals(gestion_csrf(), $t);
}

/** Exige POST con token CSRF válido; si no, 400. */
function gestion_require_csrf(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !gestion_csrf_ok()) {
        http_response_code(400);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Petición no válida (token caducado). Recarga la página.';
        exit;
    }
}

// --- Limitación de intentos (por IP, fichero) ------------------------------
const THROTTLE_MAX = 5;
const THROTTLE_WINDOW = 900;

function throttle_file(): string
{
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    return gestion_data_dir() . '/login-' . hash('sha256', $ip) . '.lock';
}

/** @return array<int,int> marcas de tiempo de intentos fallidos recientes */
function throttle_attempts(): array
{
    $f = throttle_file();
    $list = [];
    if (is_file($f)) {
        foreach (explode("\n", (string)@file_get_contents($f)) as $l) {
            if ($l !== '' && (int)$l > time() - THROTTLE_WINDOW) {
                $list[] = (int)$l;
            }
        }
    }
    return $list;
}

function throttle_blocked(): bool
{
    return count(throttle_attempts()) >= THROTTLE_MAX;
}

function throttle_fail(): void
{
    $list = throttle_attempts();
    $list[] = time();
    @file_put_contents(throttle_file(), implode("\n", $list) . "\n", LOCK_EX);
}

function throttle_clear(): void
{
    @unlink(throttle_file());
}

// --- Acciones de login / logout ------------------------------------------
function gestion_logout(): void
{
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'],
            'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Strict']);
    }
    session_destroy();
}

function gestion_login_page(string $error = ''): void
{
    if ($error !== '' && http_response_code() === 200) {
        http_response_code(401);
    }
    header('Content-Type: text/html; charset=utf-8');
    $e = $error !== '' ? '<p class="alert">' . htmlspecialchars($error) . '</p>' : '';
    $csrf = gestion_csrf_field();
    echo <<<HTML
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gestión · Club de Esgrima Torremolinos</title>
<style>
:root{--ink:#17232b;--green:#2e8f53;--sky:#1797d1;--line:#dfe6ea;--muted:#5b6b75}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.card{width:100%;max-width:22rem;margin:1.25rem;padding:2rem;border:1px solid var(--line);border-top:4px solid var(--green);border-radius:4px}
h1{margin:0 0 1.25rem;font-family:"Arial Narrow",Impact,sans-serif;text-transform:uppercase;letter-spacing:.04em;font-size:1.5rem}
label{display:block;margin:.75rem 0 .25rem;font-size:.85rem;font-weight:600}
input[type=text],input[type=password]{width:100%;padding:.65rem;border:1px solid var(--line);border-radius:3px;font-size:1rem}
input:focus{outline:2px solid var(--sky);outline-offset:1px}
button{margin-top:1.25rem;width:100%;padding:.75rem;background:var(--green);color:#fff;border:0;border-radius:3px;font-size:1rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;cursor:pointer}
button:hover{background:#257a46}.alert{background:#fdecea;color:#a53324;padding:.6rem .75rem;border-radius:3px;font-size:.9rem}
</style></head><body>
<form class="card" method="post" action="" autocomplete="off">
<h1>Gestión del club</h1>{$e}
<input type="hidden" name="do" value="login">{$csrf}
<label for="u">Usuario</label><input id="u" name="user" type="text" autocomplete="username" required autofocus>
<label for="p">Contraseña</label><input id="p" name="pass" type="password" autocomplete="current-password" required>
<button type="submit">Entrar</button>
</form></body></html>
HTML;
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['do'] ?? '') === 'logout' && gestion_csrf_ok()) {
    gestion_logout();
    header('Location: ./');
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['do'] ?? '') === 'login') {
    if (!gestion_csrf_ok()) {
        gestion_login_page('Sesión caducada. Inténtalo de nuevo.');
    }
    if (throttle_blocked()) {
        http_response_code(429);
        gestion_login_page('Demasiados intentos. Espera 15 minutos.');
    }
    $okUser = hash_equals((string)GESTION_USER, (string)($_POST['user'] ?? ''));
    $okPass = password_verify((string)($_POST['pass'] ?? ''), (string)GESTION_PASS_HASH);
    if ($okUser && $okPass) {
        throttle_clear();
        session_regenerate_id(true);
        $_SESSION['auth'] = true;
        $_SESSION['last'] = time();
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
        header('Location: ' . strtok((string)($_SERVER['REQUEST_URI'] ?? './'), '?'));
        exit;
    }
    throttle_fail();
    usleep(400000);
    gestion_login_page('Usuario o contraseña incorrectos.');
}

if (empty($_SESSION['auth'])) {
    if (throttle_blocked()) {
        http_response_code(429);
        gestion_login_page('Demasiados intentos. Espera 15 minutos.');
    }
    gestion_login_page();
}
