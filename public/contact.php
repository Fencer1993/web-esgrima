<?php
/**
 * Manejador del formulario de contacto para el hosting compartido OVH.
 * El sitio es un export estático de Next.js (sin servidor Node), así que
 * este único script PHP recibe el POST del formulario en /contacto/ y
 * envía el email. Necesita PHP con mail() habilitado (estándar en el
 * hosting Web Cloud de OVH).
 */

declare(strict_types=1);

$destination = "esgrimatorremolinos@gmail.com";
$siteName = "Club de Esgrima Torremolinos";

function render_page(string $title, string $message, bool $isError = false): void
{
    $color = $isError ? "#a53324" : "#2a6b4f";
    http_response_code($isError ? 400 : 200);
    header("Content-Type: text/html; charset=utf-8");
    echo <<<HTML
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{$title}</title>
<meta name="robots" content="noindex">
<style>
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#fbfaf7; color:#14181d; font-family:system-ui,-apple-system,"Segoe UI",sans-serif; }
  .card { max-width:28rem; margin:1.5rem; padding:2.5rem; border:1px solid #e4e1d8; border-radius:4px; background:#fff; }
  h1 { margin:0 0 .75rem; font-size:1.4rem; color:{$color}; }
  p { line-height:1.6; color:#454e59; }
  a { display:inline-block; margin-top:1.5rem; color:#c8372a; font-weight:600; text-decoration:none; }
</style>
</head>
<body>
  <div class="card">
    <h1>{$title}</h1>
    <p>{$message}</p>
    <a href="/contacto/">&larr; Volver a Contacto</a>
  </div>
</body>
</html>
HTML;
    exit;
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: /contacto/");
    exit;
}

// Honeypot anti-spam: campo oculto que solo rellenan los bots.
if (!empty($_POST["website"] ?? "")) {
    render_page("¡Gracias!", "Hemos recibido tu mensaje. Te responderemos lo antes posible.");
}

function clean_field(string $value): string
{
    // Evita inyección de cabeceras de correo.
    return trim(str_replace(["\r", "\n"], "", $value));
}

$name = clean_field($_POST["name"] ?? "");
$email = clean_field($_POST["email"] ?? "");
$phone = clean_field($_POST["phone"] ?? "");
$subject = clean_field($_POST["subject"] ?? "");
$message = trim($_POST["message"] ?? "");

if ($name === "" || $email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    render_page(
        "Faltan datos",
        "Revisa tu nombre y correo electrónico e inténtalo de nuevo.",
        true
    );
}

$mailSubject = "[Web] " . ($subject !== "" ? $subject : "Nuevo mensaje de contacto");
$body = "Nombre: {$name}\n"
    . "Email: {$email}\n"
    . "Teléfono: " . ($phone !== "" ? $phone : "-") . "\n\n"
    . "Mensaje:\n" . ($message !== "" ? $message : "-");

$headers = "From: {$siteName} <no-reply@" . ($_SERVER["HTTP_HOST"] ?? "esgrimatorremolinos.com") . ">\r\n"
    . "Reply-To: {$name} <{$email}>\r\n"
    . "Content-Type: text/plain; charset=utf-8";

$sent = @mail($destination, $mailSubject, $body, $headers);

if ($sent) {
    $safeName = htmlspecialchars($name, ENT_QUOTES, "UTF-8");
    render_page(
        "¡Mensaje enviado!",
        "Gracias, {$safeName}. Hemos recibido tu mensaje y te responderemos lo antes posible."
    );
}

render_page(
    "No se pudo enviar",
    "Ha ocurrido un error al enviar el mensaje. Escríbenos directamente a {$destination} o por WhatsApp.",
    true
);
