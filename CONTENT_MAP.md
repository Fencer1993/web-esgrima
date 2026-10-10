# Mapa de contenido

> **Datos editables desde el panel** (`/admin`, Sveltia CMS): horarios,
> precios, equipo y deportistas, galería, FAQ (también `faq-silla.json`), pasos de la clase gratis
> (`clase-gratis.json`), cifras de la portada (`cifras.json`), entrenador de pies
> (`entrenador.json`: movimientos, niveles, tiempos y frases), fotos de
> cabecera (`cabeceras.json`), clases/valores y datos del
> club viven en `src/content/data/*.json`. Los `.ts` de `src/content/` solo
> los leen y tipan. Configuración del panel: `public/admin/config.yml`.
> Inicio de sesión con GitHub: `public/admin-auth/*.php` (secrets
> `GITHUB_OAUTH_CLIENT_ID` / `GITHUB_OAUTH_CLIENT_SECRET`). Los commits del
> panel ("Panel: …") se publican solos (`deploy-production.yml`). Las
> medidas de las fotos se leen en el build (`src/lib/imageSize.ts`).

Índice rápido de dónde vive cada texto del sitio, para no tener que
grepear todo el repo cada vez que hay que cambiar una frase. Rutas
relativas a `src/`.

| Ruta pública | Página (JSX/prosa) | Datos (hechos/listas) |
|---|---|---|
| `/` | `app/page.tsx` | `content/site.ts`, `content/programs.ts`, `content/gallery.ts` (3 fotos) |
| `/esgrima-ninos` | `app/esgrima-ninos/page.tsx` | `content/programs.ts` |
| `/esgrima-para-adultos` | `app/esgrima-para-adultos/page.tsx` | `content/programs.ts` |
| `/esgrima-en-silla-de-ruedas` | `app/esgrima-en-silla-de-ruedas/page.tsx` | `content/data/faq-silla.json` (FAQ + JSON-LD) |
| `/nuestro-equipo` | `app/nuestro-equipo/page.tsx` | `content/programs.ts` (coaches + foto), `content/athletes.ts` |
| `/horarios-y-precios` | `app/horarios-y-precios/page.tsx` | `content/pricing.ts` (horarios, tecnificación, entrenamiento físico, precios, bonos, licencias) |
| `/instalaciones` | `app/instalaciones/page.tsx` | `content/gallery.ts` (foto, alt y pie de cada imagen) |
| `/clase-gratis` | `app/clase-gratis/page.tsx` | `content/data/clase-gratis.json` (pasos; foto = fragmento de nombre de `gallery.ts`) |
| `/preguntas-frecuentes` | `app/preguntas-frecuentes/page.tsx` | `content/faq.ts` |
| `/resultados`, `/resultados/[slug]`, `/deportistas/[slug]` | `app/resultados/`, `app/deportistas/` | `content/data/resultados.json` (torneos y puestos; medallas automáticas), `equipo.json` (slug/bio/arma/desde; página solo si hay resultados o bio) |
| `/patrocinadores` | `app/patrocinadores/page.tsx` | `content/data/patrocinadores.json`, `cifras.json` |
| `/entrenador`, `/en/footwork-trainer` | `app/(es)/entrenador/page.tsx`, `app/(en)/en/footwork-trainer/page.tsx` (+ `components/FootworkTrainer.tsx`) | `content/data/entrenador.json` (órdenes es/fr/en, niveles, pasos de pista, colores del modo reacción) |
| `/contacto` | `app/contacto/page.tsx` | `content/site.ts` |
| `/aviso-legal` | `app/aviso-legal/page.tsx` | `content/site.ts` (`site.legal`) |
| `/politica-de-privacidad` | `app/politica-de-privacidad/page.tsx` | `content/site.ts` |
| `/politica-de-cookies-ue` | `app/politica-de-cookies-ue/page.tsx` | — |

> **Estructura de `src/app/`:** las páginas en español viven en el grupo de
> rutas `src/app/(es)/…` (layout raíz con `lang="es"`; las URLs no cambian) y
> las inglesas en `src/app/(en)/en/…` (layout raíz con `lang="en"`). Donde esta
> tabla dice `app/<ruta>/page.tsx`, léase `app/(es)/<ruta>/page.tsx`.
> `sitemap.ts`, `robots.ts`, `icon.tsx`, `llms*.txt` y `global-not-found.tsx` (el 404)
> están en la raíz de `app/`.

## Versión en inglés (`/en/…`)

Once páginas más el detalle de noticias: `/en/`, `/en/fencing-for-kids`,
`/en/fencing-for-adults`, `/en/wheelchair-fencing`, `/en/schedule-and-prices`,
`/en/free-trial-class`, `/en/our-team`, `/en/faq`, `/en/contact`, `/en/shop`,
`/en/news` y `/en/news/<slug>` (mismos slugs que en español). Calendario,
instalaciones, resultados, patrocinadores y páginas legales siguen en español
(se enlazan como "(in Spanish)").

- **Tienda (`/en/shop`)**: reutiliza `ShopApp`, `ShopDialog` y `SizeGuide` con
  `lang="en"`. Textos de interfaz, categorías, nombres de opciones y formato de
  precios (`Desde 87,36 €` → `From €87.36`): `src/content/shopText.ts` (solo
  traducción de pantalla; el carrito y el pedido siguen enviando los valores
  españoles, p. ej. `Diestro`). Intro y guía de tallas en
  `src/content/data/en/tienda.json` (editable en el panel; títulos de tabla,
  cabeceras y celdas van como parejas español exacto → inglés; lo que falte se
  muestra en español; `howToMeasure` alineado por posición). Nombre y
  descripción de producto en inglés: campos opcionales `name_en` /
  `description_en` en `tienda.json`. `public/pedido.php` responde y envía la
  copia al cliente en inglés si recibe `lang=en`.
- **Noticias (`/en/news`)**: campos opcionales `title_en`, `summary_en` y
  `body_en` en `noticias.json` (hacen falta los tres; si falta alguno se
  muestra el español con la etiqueta "(in Spanish)" y `lang="es"`). Tipos
  traducidos en `newsTypeEn` (`src/content/news.ts`).

- **Mapa de rutas es↔en, `hreflang`, selector ES|EN y menú inglés:** todo en
  `src/content/i18n.ts`. Para añadir una página inglesa: crear
  `src/app/(en)/en/<slug>/page.tsx`, añadir la pareja en `pathPairs` y usar
  `pageAlternates(...)` en el `metadata` de las dos versiones.
- **Los hechos se leen del español** (`src/content/data/*.json`): horas, días
  (se traducen solos: "Martes a viernes" → "Tuesday to Friday"), precios
  (`30€` → `€30`), números, nombres, teléfonos, fotos. El cargador es
  `src/content/en.ts`.
- **La prosa traducida** está en `src/content/data/en/*.json` (editable en el
  panel: "Versión en inglés · …"): `textos`, `programas`, `horarios`, `precios`,
  `equipo`, `faq`, `faq-silla`, `clase-gratis`, `cifras`, `galeria` (pies y alt).
  Las listas van **alineadas por posición** con la lista española equivalente
  (los programas, por `slug`; la galería, por `src`). Dentro de un texto inglés,
  `{1}`, `{2}`… se sustituyen por el 1.º, 2.º… número (precio, hora, edad) del
  texto español.
- **Si cambias en español** el significado de un texto (no solo una cifra):
  añadir/quitar/reordenar un grupo, plan, bono, licencia, pregunta, paso,
  entrenador, cifra o foto; o cambiar los días de la semana citados en una
  respuesta de la FAQ → hay que actualizar también el JSON inglés. Si falta
  una entrada, la web muestra el texto español en esa posición y el build
  avisa con `[en] …`. Cambiar solo una hora, un precio o una edad no requiere
  tocar el inglés.
- Prosa de las páginas inglesas (párrafos largos): en su `page.tsx`, como en
  las españolas. Importes fijos de la página de silla de ruedas (30 €/mes,
  70 €/año): están escritos a mano en las dos versiones; cambiar ambas.
- Los componentes (`Header`, `Footer`, `PageHero`, `CompetitionPromo`…) aceptan
  `lang="en"`; sus textos de interfaz están en `i18n.ts` o en el propio
  componente. El layout inglés (`(en)/layout.tsx`) duplica fuentes y scripts
  globales del español: cambios globales, en los dos.
- El formulario de `/en/contact/` envía `lang=en` a `public/contact.php`, que
  responde en inglés.

## Compartido entre páginas

- `src/content/data/textos.json` — cabecera (etiqueta/título/entradilla) de cada
  página interior y textos principales de la home (editable en el panel);
  se leen con `pageText(path)` / `homeText` de `src/content/texts.ts`. El H1
  de la home es fijo (SEO).
- `src/content/site.ts` — nombre, dirección, teléfono, email, redes,
  identidad legal, navegación (`navigation`, `footerLinks`).
- `src/components/Header.tsx` — menú agrupado: `navMenu` (desplegables con
  descripción) y `navLinks` de `site.ts`. `Footer.tsx` usa `navigation` /
  `footerLinks`. Para añadir un enlace basta con editar esos arrays.
- `src/components/CompetitionPromo.tsx` — bloque promocional de los grupos
  de tecnificación (lunes) y entrenamiento físico gratuito; datos en
  `pricing.ts` (`competitionGroups`, `physicalTraining`). Sale en la home y
  en Horarios y Precios (ancla `#tecnificacion`).
- `src/app/(es)/layout.tsx` (y `(en)/layout.tsx`) — metadata global, JSON-LD del negocio
  (`SportsActivityLocation`/`ExerciseGym`), fuentes.
- `src/components/PageHero.tsx` — cabecera de cada página interior
  (eyebrow/título/lede) + JSON-LD `BreadcrumbList` automático.

## Imágenes

Escudo oficial: `public/brand/escudo-club-esgrima-torremolinos.png` (fondo
transparente; versión ligera `-256.webp`). Sale en la cabecera, el pie, la portada
(es/en), las imágenes para compartir (`opengraph-image.tsx`), el JSON-LD (`logo`),
la gestión y los iconos de la app/favicon (regenerar con
`node .github/scripts/generate-pwa-icons.mjs` si cambia el escudo).


Fotos ya optimizadas (WebP, máx. 1200 px, sin EXIF) en
`public/images/{galeria,equipo,programas}/` con nombre descriptivo.
Las fotos subidas desde el panel se optimizan solas
(`.github/scripts/optimize-images.mjs`, en el despliegue y en
`optimize-images.yml`). Se pintan con `src/components/Photo.tsx` (antepone el
`basePath` y fija width/height). El texto `alt` describe lo que se ve;
el pie de foto va aparte en `gallery.ts`. `CoachCard.tsx` pinta las
tarjetas de entrenadores (home y Nuestro Equipo).
El JSON-LD del negocio (`layout.tsx`) y las imágenes del `sitemap.ts`
salen de `gallery.ts` y `coaches`, así que al cambiar una foto ahí se
actualizan solos.

## Tienda

`/tienda` (`app/tienda/page.tsx` + `components/ShopApp.tsx`, carrito y
favoritos en `lib/shopStore.ts`) lee `content/data/tienda.json`. El
catálogo de sable de Grant Esgrima, Allstar España (allstarspain.com) y Villalbi (villalbiesgrima.es) se importa con el workflow
manual `catalog-import.yml`: paso `fetch` (guarda `data/catalog-raw/`),
luego `python3 .github/scripts/catalog-build.py` (filtra lo de sable,
conserva descripciones/visibilidad editadas)
y paso `images` (descarga y optimiza las fotos a `public/images/tienda/`).
La **calculadora de talla** («¿Qué talla pido?», ancla `#calculadora`,
`components/SizeCalculator.tsx`, lógica en `lib/sizeCalc.ts`, tallas guardadas en
`localStorage` por `lib/mySizes.ts`) lee solo `tallas.json`: no lleva tallas
escritas en el código, así que al editar las tablas desde el panel cambia sola
(reconoce las columnas por el texto de la cabecera: «Altura», «Pecho»,
«Cintura», «Cadera», «Contorno de cabeza», «Contorno de mano»; y el tipo de
prenda por el título de la tabla: «Trajes»/«Ropa», «Chaqueta eléctrica»,
«Caretas», «Guantes», «Peto interior», «Zapatillas»). Una marca sin tablas
propias (Grant/PBT) usa las de VE. La ficha de producto preselecciona la talla
guardada si coincide con una de sus tallas. Prueba de la lógica:
`node --experimental-strip-types .github/scripts/test-size-calc.mjs`.
La guía de tallas (antes del catálogo) sale de `content/data/tallas.json`
(`components/SizeGuide.tsx`); cada ficha enlaza a `#tallas-<marca>`.
Los pedidos van a `public/pedido.php` y se gestionan en `/gestion/` (Excel mensual con
el formato de la plantilla del club: `public/gestion/xlsx.php`).

## Reserva de clase gratis

`/clase-gratis` incluye la reserva online (`components/ReservaClaseGratis.tsx`,
lógica de fechas y calendario en `lib/reservas.ts`). Los ajustes (grupos, días,
horas, plazas por sesión, semanas de antelación, horas mínimas, días sin clase y
"qué traer") están en `content/data/reservas.json`, editable en el panel
("Reserva de clase gratis"). El despliegue lo copia a `reservas-config.json`
para `public/reserva.php` (disponibilidad y reservas, guarda en
`club-data/reservas.jsonl`) y `public/recordatorios.php` (aviso el día antes,
lo lanza `.github/workflows/recordatorios.yml`). Listado en `/gestion/reservas.php`.

## Entrenador de pies por voz

`/entrenador` · `/en/footwork-trainer` (`components/FootworkTrainer.tsx`; la
lógica de elegir órdenes, sin React, en `lib/footwork.ts`). Todo ocurre en el
navegador: voz del propio móvil (`speechSynthesis`), pitidos con Web Audio y
pantalla siempre encendida con Wake Lock si existe; no se guarda ni se envía
nada. Movimientos, niveles, intervalos, límite de la pista virtual (±6 pasos),
colores del modo reacción y frases fijas (es/fr/en) están en
`content/data/entrenador.json`, editable en el panel («Entrenador de pies por
voz»). Para añadir una orden basta una entrada nueva en `movimientos` (con sus
niveles, `paso` y `peso`). Prueba de la lógica:
`node --experimental-strip-types .github/scripts/test-footwork.mjs`.

## Para asistentes de IA

`/llms.txt` y `/llms-full.txt` se generan en el build desde `site.ts`,
`pricing.ts`, `programs.ts` y `faq.ts` (`src/lib/llms.ts`). No se editan
a mano: cambiar el dato original basta. `robots.ts` permite
explícitamente a los rastreadores de IA. No hay ninguna versión distinta
de las páginas según quién las lea.

## Componentes visuales

- `Marquee.tsx` — cinta infinita de fotos de la home (primeras 12 de
  `gallery.ts`: el orden de la galería decide qué sale).
- `StatsBand.tsx` — cifras bajo la portada (`content/data/cifras.json`; solo datos
  verificables).
- `Gallery.tsx` — galería en mampostería con visor (lightbox); los
  filtros salen de las categorías de `gallery.ts` ("En nuestra sala" =
  sala del club con tarima, armeros y espejos; "Competiciones" = resto).
- `Footer.tsx` — banda final de llamada a la acción + columnas.
- `PricingScheduleCard.tsx` — tarjeta de horario con chips de días
  (Horarios y Precios).
- `PhotoRow.tsx` — fila de fotos con pie en las páginas de programas;
  recibe fragmentos de nombre de archivo de `gallery.ts`.
- `PageHero.tsx` + `content/pageHeroes.ts` (lee `data/cabeceras.json`) — foto de cabecera de cada
  página interior (por ruta). Evitar repetir una foto que ya salga en
  el cuerpo de esa página.
- `WhatsAppFloat.tsx` — botón flotante de WhatsApp (aparece al bajar).
- Valores de la home: tarjetas con icono (`icon` en `values` de
  `programs.ts`, SVG en `components/valueIcons.tsx`).
- Clase gratis: línea de tiempo con foto por paso (`clase-gratis.json`).
- Programas en la home: cuadrícula bento con la foto `photo` de cada
  programa en `programs.ts`.

## SEO por página

Cada `page.tsx` exporta su propio `metadata` (title/description/
canonical) al principio del archivo — es lo primero que hay que tocar
si se pide cambiar un meta description. `src/app/sitemap.ts` lista las
rutas indexables; añadir ahí cualquier página nueva.

## Avisos al móvil (Web Push)

El gestor envía avisos desde `/gestion/avisos.php`. Los pushes van **sin
cuerpo** (solo autenticación VAPID, sin cifrado): el móvil despierta a
`public/sw.js`, que pide `/aviso-actual.php` (título, texto, enlace; sin datos
personales) y muestra la notificación. `AvisosToggle.tsx` (pie de página y
`/calendario`) pide el permiso al pulsar y registra el dispositivo en
`push-suscribir.php` (alta/baja; solo endpoint, idioma y fecha). Claves VAPID
(`push-vapid.json`), suscripciones (`push-suscripciones.jsonl`) e historial
(`avisos.jsonl`) viven en `club-data/` (o `_data/`), nunca en git; la clave
pública sale de `push-clave.php`. Lógica común: `public/push-lib.php`.
En iPhone solo funciona con la app instalada (iOS/Safari 16.4+). Detalle en
`docs/GESTION.md`.

## App instalable (PWA)

`src/app/manifest.ts` (manifest, respeta `BASE_PATH`), `public/sw.js`
(caché sin conexión; sube `VERSION` para invalidar; hueco para `push`),
`src/app/offline/page.tsx` (noindex, fuera del sitemap),
`src/components/PwaRegister.tsx` (registro + aviso único) e
`InstallAppLink.tsx` (botón del pie), `AppInstallButton.tsx` (botón «App» con punto
indicador en la cabecera: instala con un toque o lleva a `/app`) y la página
`/app` · `/en/app` (`components/AppPage.tsx`, instrucciones por sistema). Iconos en `public/icons/`
(regenerar con `node .github/scripts/generate-pwa-icons.mjs`).
