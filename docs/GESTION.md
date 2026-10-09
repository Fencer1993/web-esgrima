# Área de gestión (`/gestion/`)

Zona privada para la presidencia del club. PHP + HTML simple, sin base de datos
ni frameworks. Todas las páginas exigen sesión y llevan `noindex`.

## Secciones

- **Panel** (`index.php`): accesos y número de pedidos nuevos.
- **Pedidos** (`pedidos.php`): pedidos de la tienda.
  - *Lista*: cada pedido con su estado (nuevo → agrupado → pedido al proveedor →
    recibido → entregado / cancelado). Se cambia con el desplegable y "Guardar".
  - *Resumen para el proveedor*: pedidos abiertos (nuevo + agrupado) sumados por
    proveedor → producto → talla, con los nombres de los socios de cada línea.
  - *CSV*: exportación del resumen y de los pedidos (UTF-8 con BOM, separador `;`,
    se abre bien en Excel en español).
  - *Marcar todos como agrupados*: pasa todos los "nuevo" a "agrupado".
- **Convocatorias** (`convocatoria.php`): formulario que genera, en el navegador,
  el texto para WhatsApp, el de SportMember y el objeto JSON de noticia web
  (`src/content/data/noticias.json`). No guarda nada en el servidor.
- **Calendario** (`calendario.php`): próximos eventos desde
  `club-data/sportmember-calendar.json` (o `/calendario.json` en la raíz web) con
  campos `title, start, end, location, team`. Si no existe, avisa de que aparecerá
  al conectar SportMember.

## Contraseña

`config.php` no está en el repositorio. En cada despliegue se genera a partir de
dos secretos de GitHub: `GESTION_USER` y `GESTION_PASSWORD`. La contraseña se
guarda hasheada (`password_hash`) en `gestion/config.php`; nunca en claro. Para
cambiarla basta con actualizar el secreto `GESTION_PASSWORD` y volver a desplegar.
Si no hay config o el hash está vacío, todas las páginas muestran "Gestión aún no
configurada" (503). Plantilla: `public/gestion/config.example.php`.

Seguridad: cookie de sesión `Secure`/`HttpOnly`/`SameSite=Strict`, token CSRF en
todos los POST, regeneración de sesión al entrar y límite de 5 intentos fallidos
cada 15 minutos por IP.

## Dónde están los datos

- Pedidos: `club-data/pedidos.jsonl`, una línea JSON por pedido, en la carpeta
  *hermana* del web root (fuera de la web). Si no es escribible, se usa
  `_data/pedidos.jsonl` dentro del web root (protegido con `.htaccess`).
- Los bloqueos de intentos de login (`login-*.lock`) van a la misma carpeta.
- Antes de cada cambio de estado se copia el fichero a `pedidos.jsonl.bak`.

## Copias de seguridad

El despliegue por FTP **no debe borrar** `club-data/` ni `_data/`. Descarga
`pedidos.jsonl` de vez en cuando (o usa el CSV de pedidos) y guárdalo fuera del
servidor; el `.bak` solo protege del último cambio.
