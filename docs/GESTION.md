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
  - *Excel del pedido* (`xlsx.php`): formato de la plantilla del club
    ("Pedido material – <mes> <año>"), un mes o un curso entero (una hoja por mes).
    Primero "Material del Club" (descuento 15 %, sin comisión), luego un bloque por
    socio con su fila TOTAL. Precio sin IVA = precio de socio / (0,95 × 1,21);
    los "Desde" se marcan para revisar. Los cancelados no salen. Cada pedido tiene
    el botón "Es material del club".
  - *CSV*: exportación del resumen y de los pedidos (UTF-8 con BOM, separador `;`,
    se abre bien en Excel en español).
  - *Marcar todos como agrupados*: pasa todos los "nuevo" a "agrupado".
- **Clases gratis** (`reservas.php`): reservas de la clase gratis agrupadas por
  día y grupo, con plazas ocupadas. Estados: confirmada, asistió, no vino,
  cancelada (una cancelada libera la plaza). Pestañas Próximas / Pasadas y CSV
  de todas las reservas (UTF-8 con BOM, separador `;`).
- **Mercadillo** (`mercadillo.php`): anuncios de material de segunda mano. Los
  nuevos llegan como *pendientes* (con aviso por correo al club) y **no se ven
  en la web ni sus fotos hasta aprobarlos**. Por cada anuncio: fotos, datos
  completos (incluido el correo, que nunca se publica) y botones *Aprobar*
  (se publica 90 días y se avisa al anunciante), *Rechazar* (con motivo
  opcional, que se envía por correo), *Marcar vendido* y *Borrar* (borra
  también las fotos). Un anuncio aprobado pasa a *caducado* a los 90 días; el
  anunciante puede renovarlo 30 días desde su enlace privado
  (`/mercadillo/mi-anuncio/#…`, recibido por correo). Los datos se borran solos
  90 días después de caducar, venderse o rechazarse. El Panel y el menú
  muestran cuántos hay pendientes.
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
- Reservas de clase gratis: `club-data/reservas.jsonl` (misma carpeta), con
  `reservas.jsonl.bak` antes de cada cambio. Hay que respaldarlo igual que los pedidos.
- Mercadillo: `club-data/mercadillo.jsonl` (un anuncio por línea, con
  `.bak`) y `club-data/mercadillo-fotos/` (fotos; solo se sirven por
  `mercadillo.php?foto=` si el anuncio está aprobado). Respaldar ambos.
- Los bloqueos de intentos de login (`login-*.lock`) van a la misma carpeta.
- Antes de cada cambio de estado se copia el fichero a `pedidos.jsonl.bak`.

## Copias de seguridad

El despliegue por FTP **no debe borrar** `club-data/` ni `_data/`. Descarga
`pedidos.jsonl` de vez en cuando (o usa el CSV de pedidos) y guárdalo fuera del
servidor; el `.bak` solo protege del último cambio.

## Reservas de clase gratis y recordatorios

Ajustes en el panel (`/admin`, "Reserva de clase gratis"). Para cerrar un día
(festivo, vacaciones) añádelo en "Días sin clase". El despliegue copia el JSON a
`reservas-config.json`. Cada día a las 17:07 UTC el workflow `recordatorios.yml`
llama a `recordatorios.php` con una clave derivada del secreto `FTP_PASSWORD`
(`sha256("recordatorios:" + FTP_PASSWORD)`); envía un correo a quien tiene clase
mañana y lo marca como recordado. Si cambias `FTP_PASSWORD`, vuelve a desplegar
para regenerar `recordatorios-config.php`. Se puede lanzar a mano desde Actions.

## Avisos al móvil

`/gestion/avisos.php` (menú "Avisos"): escribe título (máx. 60), texto (máx. 160)
y, si quieres, un enlace interno (`/calendario/`, `/noticias/`…). "Enviar aviso"
muestra una confirmación con el número de suscriptores; el envío no se puede
deshacer. El historial muestra, por aviso, entregados / errores / bajas
(dispositivos que ya no existen y se borran solos).

- Las personas lo activan con el botón "Recibir avisos del club en este
  dispositivo" del pie de la web y de `/calendario`. En iPhone/iPad hay que
  instalar antes la app (Compartir, "Añadir a pantalla de inicio"; iOS 16.4+).
- Datos: `club-data/push-vapid.json` (claves, se crean solas la primera vez; si
  se borran, todos los suscriptores tendrán que volver a activar los avisos),
  `push-suscripciones.jsonl`, `avisos.jsonl`, `push-rate.json`. Respáldalos como
  el resto; no se suben a git.
- Los pushes van vacíos; el móvil descarga el último aviso de
  `/aviso-actual.php`. Si fallara, muestra "tienes un aviso nuevo".
- Límites: sin cola ni programación; el envío es inmediato. El aviso caduca a
  las 24 h si el móvil está apagado.
