<?php
declare(strict_types=1);
if (!defined('GESTION_APP')) { http_response_code(403); exit; }

function h($v): string
{
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8');
}

function gestion_header(string $title, string $active = ''): void
{
    header('Content-Type: text/html; charset=utf-8');
    $nav = ['index.php' => 'Panel', 'pedidos.php' => 'Pedidos', 'convocatoria.php' => 'Convocatorias', 'calendario.php' => 'Calendario'];
    $links = '';
    foreach ($nav as $f => $label) {
        $links .= '<a href="' . $f . '"' . ($f === $active ? ' class="on"' : '') . '>' . h($label) . '</a>';
    }
    $csrf = gestion_csrf_field();
    $t = h($title);
    echo <<<HTML
<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{$t} · Gestión</title>
<style>
:root{--ink:#17232b;--green:#2e8f53;--sky:#1797d1;--line:#dfe6ea;--muted:#5b6b75;--soft:#f4f8fa}
*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.5}
header.top{border-bottom:1px solid var(--line);border-top:4px solid var(--green);display:flex;flex-wrap:wrap;gap:.5rem 1.25rem;align-items:center;padding:.75rem 1rem}
header.top strong{font-family:"Arial Narrow",Impact,sans-serif;text-transform:uppercase;letter-spacing:.05em;font-size:1.1rem;margin-right:auto}
header.top a{color:var(--ink);text-decoration:none;font-weight:600;padding:.25rem 0;border-bottom:2px solid transparent}
header.top a.on,header.top a:hover{border-color:var(--sky);color:var(--sky)}
header.top form{margin:0}
main{max-width:64rem;margin:0 auto;padding:1.25rem 1rem 3rem}
h1,h2,h3{font-family:"Arial Narrow",Impact,sans-serif;text-transform:uppercase;letter-spacing:.04em;line-height:1.15}
h1{font-size:1.8rem;margin:.5rem 0 1rem}h2{font-size:1.25rem;margin:2rem 0 .75rem;color:var(--green)}h3{font-size:1rem;margin:1.25rem 0 .4rem}
.btn,button{display:inline-block;background:var(--green);color:#fff;border:0;border-radius:3px;padding:.55rem .9rem;font-size:.9rem;font-weight:700;cursor:pointer;text-decoration:none}
.btn:hover,button:hover{background:#257a46}.btn.sky{background:var(--sky)}.btn.sky:hover{background:#127eae}
.btn.ghost,button.ghost{background:#fff;color:var(--ink);border:1px solid var(--line)}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(14rem,1fr));gap:1rem}
.card{border:1px solid var(--line);border-radius:4px;padding:1.1rem;color:inherit;text-decoration:none;display:block}
a.card:hover{border-color:var(--sky)}.card .n{font-size:2rem;font-weight:800;color:var(--green)}.card p{margin:.25rem 0 0;color:var(--muted);font-size:.9rem}
table{width:100%;border-collapse:collapse;font-size:.9rem}th,td{text-align:left;padding:.5rem .6rem;border-bottom:1px solid var(--line);vertical-align:top}
th{background:var(--soft);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}
.scroll{overflow-x:auto}.muted{color:var(--muted)}.alert{background:#fdecea;color:#a53324;padding:.6rem .8rem;border-radius:3px}.ok{background:#e8f5ec;color:#1f6b3b;padding:.6rem .8rem;border-radius:3px}
.tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:1rem}.row{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center}
select,input[type=text],input[type=datetime-local],textarea{font:inherit;padding:.5rem;border:1px solid var(--line);border-radius:3px;max-width:100%}
textarea{width:100%}input:focus,select:focus,textarea:focus{outline:2px solid var(--sky);outline-offset:1px}
.pill{display:inline-block;padding:.1rem .5rem;border-radius:99px;background:var(--soft);font-size:.78rem;font-weight:600}
.pill.nuevo{background:#e0f2fb;color:#0f6d98}.pill.cancelado{background:#fdecea;color:#a53324}.pill.entregado,.pill.recibido{background:#e8f5ec;color:#1f6b3b}
</style></head><body>
<header class="top"><strong>Gestión · Club de Esgrima</strong>{$links}
<form method="post" action="index.php"><input type="hidden" name="do" value="logout">{$csrf}<button class="ghost" type="submit">Salir</button></form></header>
<main>
HTML;
}

function gestion_footer(): void
{
    echo "</main></body></html>";
}
