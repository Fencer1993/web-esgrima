# Mapa de contenido

Índice rápido de dónde vive cada texto del sitio, para no tener que
grepear todo el repo cada vez que hay que cambiar una frase. Rutas
relativas a `src/`.

| Ruta pública | Página (JSX/prosa) | Datos (hechos/listas) |
|---|---|---|
| `/` | `app/page.tsx` | `content/site.ts`, `content/programs.ts`, `content/gallery.ts` (3 fotos) |
| `/esgrima-ninos` | `app/esgrima-ninos/page.tsx` | `content/programs.ts` |
| `/esgrima-para-adultos` | `app/esgrima-para-adultos/page.tsx` | `content/programs.ts` |
| `/esgrima-en-silla-de-ruedas` | `app/esgrima-en-silla-de-ruedas/page.tsx` | FAQ inline en la propia página (`wheelchairFaq`) |
| `/nuestro-equipo` | `app/nuestro-equipo/page.tsx` | `content/programs.ts` (coaches + foto), `content/athletes.ts` |
| `/horarios-y-precios` | `app/horarios-y-precios/page.tsx` | `content/pricing.ts` (horarios, tecnificación, entrenamiento físico, precios, bonos, licencias) |
| `/instalaciones` | `app/instalaciones/page.tsx` | `content/gallery.ts` (foto, alt y pie de cada imagen) |
| `/clase-gratis` | `app/clase-gratis/page.tsx` | pasos inline (`steps`) |
| `/preguntas-frecuentes` | `app/preguntas-frecuentes/page.tsx` | `content/faq.ts` |
| `/contacto` | `app/contacto/page.tsx` | `content/site.ts` |
| `/aviso-legal` | `app/aviso-legal/page.tsx` | `content/site.ts` (`site.legal`) |
| `/politica-de-privacidad` | `app/politica-de-privacidad/page.tsx` | `content/site.ts` |
| `/politica-de-cookies-ue` | `app/politica-de-cookies-ue/page.tsx` | — |

## Compartido entre páginas

- `src/content/site.ts` — nombre, dirección, teléfono, email, redes,
  identidad legal, navegación (`navigation`, `footerLinks`).
- `src/components/Header.tsx` — menú agrupado: `navMenu` (desplegables con
  descripción) y `navLinks` de `site.ts`. `Footer.tsx` usa `navigation` /
  `footerLinks`. Para añadir un enlace basta con editar esos arrays.
- `src/components/CompetitionPromo.tsx` — bloque promocional de los grupos
  de tecnificación (lunes) y entrenamiento físico gratuito; datos en
  `pricing.ts` (`competitionGroups`, `physicalTraining`). Sale en la home y
  en Horarios y Precios (ancla `#tecnificacion`).
- `src/app/layout.tsx` — metadata global, JSON-LD del negocio
  (`SportsActivityLocation`/`ExerciseGym`), fuentes.
- `src/components/PageHero.tsx` — cabecera de cada página interior
  (eyebrow/título/lede) + JSON-LD `BreadcrumbList` automático.

## Imágenes

Fotos ya optimizadas (WebP, máx. 1200 px, sin EXIF) en
`public/images/{galeria,equipo,programas}/` con nombre descriptivo.
No hay optimizador en el export estático: reducir y comprimir *antes* de
añadir una foto. Se pintan con `src/components/Photo.tsx` (antepone el
`basePath` y fija width/height). El texto `alt` describe lo que se ve;
el pie de foto va aparte en `gallery.ts`. `CoachCard.tsx` pinta las
tarjetas de entrenadores (home y Nuestro Equipo).
El JSON-LD del negocio (`layout.tsx`) y las imágenes del `sitemap.ts`
salen de `gallery.ts` y `coaches`, así que al cambiar una foto ahí se
actualizan solos.

## Para asistentes de IA

`/llms.txt` y `/llms-full.txt` se generan en el build desde `site.ts`,
`pricing.ts`, `programs.ts` y `faq.ts` (`src/lib/llms.ts`). No se editan
a mano: cambiar el dato original basta. `robots.ts` permite
explícitamente a los rastreadores de IA. No hay ninguna versión distinta
de las páginas según quién las lea.

## Componentes visuales

- `Marquee.tsx` — cinta infinita de fotos de la home (primeras 12 de
  `gallery.ts`: el orden de la galería decide qué sale).
- `StatsBand.tsx` — cifras bajo la portada (array `stats` en el propio
  archivo; solo datos verificables).
- `Gallery.tsx` — galería en mampostería con visor (lightbox); los
  filtros salen de las categorías de `gallery.ts` ("En nuestra sala" =
  sala del club con tarima, armeros y espejos; "Competiciones" = resto).
- `Footer.tsx` — banda final de llamada a la acción + columnas.
- `PricingScheduleCard.tsx` — tarjeta de horario con chips de días
  (Horarios y Precios).
- `PhotoRow.tsx` — fila de fotos con pie en las páginas de programas;
  recibe fragmentos de nombre de archivo de `gallery.ts`.
- `PageHero.tsx` + `content/pageHeroes.ts` — foto de cabecera de cada
  página interior (por ruta). Evitar repetir una foto que ya salga en
  el cuerpo de esa página.
- `WhatsAppFloat.tsx` — botón flotante de WhatsApp (aparece al bajar).
- Valores de la home: tarjetas con icono (`icon` en `values` de
  `programs.ts`, SVG en `app/page.tsx`).
- Clase gratis: línea de tiempo con foto por paso (`steps` inline).
- Programas en la home: cuadrícula bento con la foto `photo` de cada
  programa en `programs.ts`.

## SEO por página

Cada `page.tsx` exporta su propio `metadata` (title/description/
canonical) al principio del archivo — es lo primero que hay que tocar
si se pide cambiar un meta description. `src/app/sitemap.ts` lista las
rutas indexables; añadir ahí cualquier página nueva.
