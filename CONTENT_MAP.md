# Mapa de contenido

Índice rápido de dónde vive cada texto del sitio, para no tener que
grepear todo el repo cada vez que hay que cambiar una frase. Rutas
relativas a `src/`.

| Ruta pública | Página (JSX/prosa) | Datos (hechos/listas) |
|---|---|---|
| `/` | `app/page.tsx` | `content/site.ts`, `content/programs.ts` |
| `/esgrima-ninos` | `app/esgrima-ninos/page.tsx` | `content/programs.ts` |
| `/esgrima-para-adultos` | `app/esgrima-para-adultos/page.tsx` | `content/programs.ts` |
| `/esgrima-en-silla-de-ruedas` | `app/esgrima-en-silla-de-ruedas/page.tsx` | FAQ inline en la propia página (`wheelchairFaq`) |
| `/nuestro-equipo` | `app/nuestro-equipo/page.tsx` | `content/programs.ts` (coaches + foto), `content/athletes.ts` |
| `/horarios-y-precios` | `app/horarios-y-precios/page.tsx` | `content/pricing.ts` |
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
- `src/components/Header.tsx` / `Footer.tsx` — usan `navigation` /
  `footerLinks` de `site.ts`; no hace falta tocarlos para añadir un
  enlace, basta con editar el array.
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

## SEO por página

Cada `page.tsx` exporta su propio `metadata` (title/description/
canonical) al principio del archivo — es lo primero que hay que tocar
si se pide cambiar un meta description. `src/app/sitemap.ts` lista las
rutas indexables; añadir ahí cualquier página nueva.
