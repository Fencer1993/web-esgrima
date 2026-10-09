<?php
// Inicio de sesión del panel: paso 2, GitHub vuelve aquí con un código que
// se cambia por un token y se entrega a la ventana del panel.
require __DIR__ . '/config.php';

function respond($status, $payload) {
    $message = 'authorization:github:' . $status . ':' . json_encode($payload);
    $js = json_encode($message);
    header('Content-Type: text/html; charset=utf-8');
    echo "<!doctype html><meta charset='utf-8'><p>Conectando con el panel…</p><script>
(function () {
  var origin = 'https://www.esgrimatorremolinos.com';
  function receive(e) {
    if (e.origin !== origin) return;
    window.opener.postMessage($js, origin);
    window.removeEventListener('message', receive);
  }
  window.addEventListener('message', receive);
  window.opener.postMessage('authorizing:github', origin);
})();
</script>";
    exit;
}

$state = $_COOKIE['cms_oauth_state'] ?? '';
if (!isset($_GET['code'], $_GET['state']) || !hash_equals($state, (string) $_GET['state'])) {
    respond('error', ['message' => 'Estado de inicio de sesión no válido.']);
}
setcookie('cms_oauth_state', '', ['expires' => 1, 'path' => '/admin-auth/']);

$ch = curl_init('https://github.com/login/oauth/access_token');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => ['Accept: application/json'],
    CURLOPT_POSTFIELDS => http_build_query([
        'client_id' => GITHUB_CLIENT_ID,
        'client_secret' => GITHUB_CLIENT_SECRET,
        'code' => $_GET['code'],
        'redirect_uri' => 'https://www.esgrimatorremolinos.com/admin-auth/callback.php',
    ]),
    CURLOPT_TIMEOUT => 15,
]);
$body = json_decode((string) curl_exec($ch), true);
curl_close($ch);

if (empty($body['access_token'])) {
    respond('error', ['message' => $body['error_description'] ?? 'GitHub no devolvió un token.']);
}
respond('success', ['token' => $body['access_token'], 'provider' => 'github']);
