<?php
// Inicio de sesión del panel (/admin) con GitHub: paso 1, redirige a GitHub.
// Protocolo de OAuth externo compatible con Decap/Sveltia CMS.
// admin-auth/config.php lo genera el despliegue a partir de los secrets
// GITHUB_OAUTH_CLIENT_ID y GITHUB_OAUTH_CLIENT_SECRET (nunca está en git).
require __DIR__ . '/config.php';
if (!defined('GITHUB_CLIENT_ID') || GITHUB_CLIENT_ID === '') {
    http_response_code(503);
    exit('El inicio de sesión con GitHub aún no está configurado.');
}
$state = bin2hex(random_bytes(16));
setcookie('cms_oauth_state', $state, [
    'expires' => time() + 600, 'path' => '/admin-auth/',
    'secure' => true, 'httponly' => true, 'samesite' => 'Lax',
]);
$scope = (isset($_GET['scope']) && $_GET['scope'] === 'public_repo') ? 'public_repo' : 'repo';
header('Location: https://github.com/login/oauth/authorize?' . http_build_query([
    'client_id' => GITHUB_CLIENT_ID,
    'redirect_uri' => 'https://www.esgrimatorremolinos.com/admin-auth/callback.php',
    'scope' => $scope,
    'state' => $state,
]));
