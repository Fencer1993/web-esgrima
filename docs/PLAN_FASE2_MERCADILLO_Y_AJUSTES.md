# Plan fase 2: ajustes de calculadora y entrenador + mercadillo

Respuestas de Víctor del 10/10/2026 (página de dudas). Lo que aquí no se
decide sigue la regla de siempre: si hay duda real, pregunta en la página de
dudas y sigue con lo demás.

Reglas del proyecto: leer `AGENTS.md` y `CONTENT_MAP.md`. Textos en español
de España, claros. Sin dependencias npm nuevas. PHP 7.4 sin Composer
(compatible con 7.4: nada de `match`, `enum`, tipos unión, `readonly`…).
Datos privados en la carpeta privada (`club-data/` o `_data/`, mismas funciones
que `public/reserva.php` / `public/gestion/data.php`), nunca en git. Commits
que **nunca** empiecen por «Panel:».

---

## 1. Calculadora de talla: añadir al carrito con un toque

Víctor eligió «Muestra la talla de cada marca y la añade al carrito con un
toque».

- En las **tarjetas de producto** de la tienda (`ShopApp.tsx`), cuando hay
  tallas guardadas (`src/lib/mySizes.ts`) y el producto tiene esa talla para su
  marca: botón «Añadir talla 50» (en inglés «Add size 50»).
  - Si el producto no pide mano ni otras opciones: lo añade al carrito
    directamente (cantidad 1) y lo confirma con el aviso que ya use la tienda.
  - Si pide mano u opciones: abre la ficha con la talla ya elegida (como ahora)
    y el foco en lo que falte.
- En el resultado de la calculadora: botón «Ver productos en mi talla», que
  filtra la tienda a productos con una talla recomendada (filtro nuevo
  «En mi talla», que se puede quitar).
- No cambia nada del pedido (`pedido.php`).

## 2. Entrenador por voz: ampliación

Respuestas: movimientos «los elige cada uno en la app», «todos esos
movimientos», que **el entrenador pueda configurar sesiones y mandarlas a los
alumnos, y también los tiradores**; extras: «todas» (niveles por edad con
duraciones fijas, modo reacción y sesiones como deberes).

- **Movimientos a elegir**: además de los niveles, un modo «Personalizado» con
  casillas para cada movimiento de `entrenador.json` (agrupados por nivel), su
  frecuencia (poca / normal / mucha) y el ritmo (lento / medio / rápido o
  segundos mín–máx).
- **Sesiones para compartir (sin cuentas ni servidor)**: «Crear sesión» guarda
  toda la configuración (nombre de la sesión, movimientos y pesos, ritmo,
  duración, rondas, descanso, idioma, modo voz o colores) en el **enlace**
  (`/entrenador/#s=<datos>` en base64url, versión `v1`, validado al leer y con
  límites de tamaño). Botones «Copiar enlace» y «Enviar por WhatsApp»
  (`https://wa.me/?text=`). Quien lo abre ve «Sesión de <nombre>» y
  «Empezar». Cualquiera la puede crear (entrenador o tirador). Sesiones
  recientes en `localStorage` (try/catch).
- **Sesiones del club**: en `entrenador.json` una lista `sesiones` editable
  desde el panel (nombre, descripción, misma configuración) que sale como
  «Sesiones del club» para empezar con un toque. Incluir 3 de ejemplo.
- **Por edad**: preajustes en `entrenador.json` (`porEdad`), editables:
  - M11 y menores: iniciación, 30 s × 3 rondas, 60 s de descanso.
  - M13–M15: medio, 60 s × 3, 30 s de descanso.
  - M17–M20 y absoluto: competición, 120 s × 4, 30 s de descanso.
  - Veteranos: medio, 60 s × 3, 60 s de descanso.
  Botones de categoría encima de los niveles.
- **Flecha**: no tocar todavía. Va como pregunta a Víctor, porque en sable
  la flecha está prohibida por reglamento. Si contesta, se quita.
- Pruebas: ampliar `.github/scripts/test-footwork.mjs` con codificar y
  decodificar sesiones (redondo, datos corruptos → error controlado, tamaño
  máximo).

## 3. Mercadillo de segunda mano (`/mercadillo`)

Respuestas: **cualquiera publica, Víctor revisa antes de publicar**; **solo
material de esgrima**; **se muestra el WhatsApp del vendedor**; **público**;
sección **«Se busca»**.

### Página pública `/mercadillo` (solo en español; en el menú inglés, como
otras páginas, enlazada como «Second-hand market (in Spanish)»)
- Dos pestañas: «Se vende» y «Se busca». Filtros: tipo de material
  (careta, chaqueta, pantalón, chaqueta eléctrica, peto, guante, sable u hoja,
  zapatillas, medias, bolsa, otro), talla (texto libre en la ficha, filtro por
  texto) y mano.
- Tarjeta: foto (si hay), título, material, talla, mano, estado (nuevo /
  como nuevo / usado / para piezas), precio (o «Se regala»), zona o «En el
  club», fecha, botón «Escribir por WhatsApp» (`https://wa.me/34…?text=Hola,
  te escribo por tu anuncio «…» del mercadillo del Club de Esgrima
  Torremolinos`). Se busca: lo mismo sin foto obligatoria.
- Aviso fijo: el club solo revisa que el anuncio sea de esgrima; la compra es
  entre particulares; revisar homologación (FIE / 350N / 800N) antes de comprar.
- Los datos salen de `public/mercadillo.php?lista` (JSON solo con anuncios
  aprobados y vigentes, sin correo).

### Publicar (`/mercadillo#publicar`)
- Formulario: tipo (vendo / busco), material, título, descripción (máx. 600),
  talla, mano, estado, precio (0 = se regala), zona (opcional), hasta 3 fotos,
  nombre (solo nombre de pila visible), WhatsApp (obligatorio, se publica),
  correo (obligatorio, **no** se publica: sirve para el enlace de gestión del
  anuncio), casillas obligatorias: «Soy mayor de edad o lo publica mi
  padre/madre/tutor», «Acepto que mi nombre de pila y mi WhatsApp se muestren
  en el anuncio» y aceptación de la política de privacidad.
- Fotos: se reducen en el navegador (canvas, máx. 1200 px, JPEG 0,8) antes de
  subirlas. En el servidor: `getimagesize`, solo JPEG/PNG/WebP, máx. 1,5 MB
  cada una, se vuelven a codificar con GD si está disponible (quita EXIF); si
  no hay GD, se guardan tal cual tras validar. Se guardan en la carpeta
  privada y se sirven con `mercadillo.php?foto=<id>` **solo si el anuncio está
  aprobado** (en gestión, siempre).
- Anti-spam: honeypot, límite de 3 anuncios por IP y día (hash de la IP, como
  `pedido.php`), validación de longitudes y del teléfono español o
  internacional.
- Al enviar: estado «pendiente», correo al club (como `pedido.php`) con el
  enlace a la gestión, y correo al anunciante con su **enlace privado**
  (`mercadillo.php?gestionar=<token>` → página `/mercadillo/mi-anuncio#<token>`)
  para marcar «vendido / encontrado» o borrar el anuncio. El token se guarda
  con hash.

### Gestión (`public/gestion/mercadillo.php`)
- Lista por estado (pendientes primero) con fotos, datos completos y
  acciones: aprobar, rechazar (con motivo opcional que se envía por correo),
  marcar vendido, borrar (también las fotos).
- Al aprobar: correo al anunciante «Tu anuncio ya está publicado».
- Contador de pendientes en el inicio de gestión (`index.php`) y enlace en el
  menú de `layout.php`.
- Vigencia: los anuncios aprobados caducan a los 90 días (se ocultan; en
  gestión se ven como «caducado»). El anunciante recibe el enlace para
  renovarlo 30 días más (un clic en su enlace privado).

### Resto
- `.htaccess`: proteger los ficheros nuevos de datos (`mercadillo.jsonl`, fotos)
  igual que los demás.
- Política de privacidad (`src/app/(es)/politica-de-privacidad/page.tsx`):
  añadir el tratamiento del mercadillo (finalidad, datos públicos: nombre de
  pila y WhatsApp; datos no públicos: correo; plazo: hasta borrar el anuncio o
  90 días después de caducar; derechos).
- Enlaces: menú «El club» → «Mercadillo» («Material de segunda mano»), pie,
  `sitemap.ts`, `live-check.yml`, `CONTENT_MAP.md` y `docs/GESTION.md`.
- Textos fijos editables: `src/content/data/mercadillo.json` (intro, aviso,
  lista de tipos de material, estados) con entrada en el panel.

### Pruebas
- PHP: `php -l` en todo; script de prueba con `php -S` local, que publica un
  anuncio con foto, comprueba que no sale en `?lista` hasta aprobarlo (tocando
  el fichero de datos de prueba o llamando a la gestión con una configuración
  de prueba), que la foto da 404 antes y 200 después, y que el enlace privado
  marca vendido. No dejar datos de prueba en el repo.
- `npm run lint` y `npm run build`; Playwright a 360 y 1280 px en
  `/mercadillo/`, `/tienda/`, `/entrenador/` y `/en/footwork-trainer/`, sin
  desbordamiento ni errores de consola.

## Publicación
Commit(s) en `claude/esgrima-web-rebuild-1or7ev` (hacer `git pull --rebase`
antes de subir), `deploy-production.yml` y después `live-check.yml`.
