# Plan: calculadora de talla y entrenador de pies por voz

Dos funciones que se pueden hacer sin datos personales ni servidor: todo
ocurre en el navegador. Las decisiones abiertas están en la página de dudas
de Víctor (preguntas `tallas-*` y `voz-*`); mientras no conteste, se usan los
valores por defecto de este plan, que se pueden cambiar después.

Reglas del proyecto que aplican: leer `AGENTS.md` y `CONTENT_MAP.md`; textos
de la web en español de España, claros y sin jerga; versión inglesa en
`/en/…` siguiendo `src/content/i18n.ts`; datos editables en
`src/content/data/*.json` con su entrada en `public/admin/config.yml`;
nada de datos personales en el repositorio.

---

## A. Calculadora de talla (`/tienda` y `/en/shop`)

### Qué hace
Un bloque «¿Qué talla pido?» encima de la guía de tallas
(`src/components/SizeGuide.tsx`), con el ancla `#calculadora`. La persona
indica sus medidas y ve, para cada marca y tipo de prenda, la talla
recomendada. Las medidas no salen del navegador.

### Entradas (por defecto: las dos formas)
- **Perfil**: niño o niña / mujer / hombre (elige qué tablas usar).
- **Rápida**: altura (cm) y, opcional, edad (solo niños, para la columna
  «Edad» de VE).
- **Exacta**: altura, pecho, cintura, cadera (cm). Todas opcionales salvo
  la altura; cuantas más, mejor.
- **Extras opcionales**: contorno de cabeza (careta) y de mano (guante), en cm;
  número de pie EU (zapatillas, se muestra la equivalencia UK/US de la tabla).
- Ayuda «Cómo medir» enlazando a `howToMeasure` de `tallas.json` (ya existe).

### Lógica (nuevo `src/lib/sizeCalc.ts`, sin dependencias)
- Lee **solo** `src/content/data/tallas.json`; nada de tallas escritas a mano
  en el código. Si cambian las tablas desde el panel, la calculadora cambia sola.
- Parser de celdas: `"84-88"` → [84,88]; `"hasta 58"` / `"menos de 60"` →
  [-∞,58]; `"más de 62"` → [62,∞]; número suelto `"162"` → [162,162]
  (tolerancia ±3 cm); `"15,2"` coma decimal; `"—"` → sin dato. Reconoce las
  columnas por el texto de la cabecera («Altura», «Pecho», «Cintura»,
  «Cadera», «Contorno de cabeza», «Contorno de mano (cm)», «Edad»), no por
  la posición.
- Tabla candidata según el perfil (título contiene «Hombre», «Mujer»,
  «Niños», «Infantil»…). Para Allstar hay tres tablas por sexo (normal, alta,
  baja estatura): se prueban todas y se queda la de mejor encaje, diciendo
  cuál («Allstar, estatura alta: talla 98»).
- Puntuación por fila: suma de la distancia de cada medida dada al rango
  (0 si está dentro), con peso 1 para pecho, cintura y cadera y 0,5 para
  altura. Mejor fila = menor puntuación. **Si dos tallas empatan o la medida
  cae entre dos, se recomienda la mayor**, como dice la guía.
- Confianza: «encaja bien» (todo dentro), «aproximada» (alguna medida fuera
  por ≤ 4 cm) o «fuera de tabla» (no recomendar; sugerir probarse el material
  del club o preguntar por WhatsApp).
- Guantes: talla = contorno en cm / 2,54, redondeado al medio punto
  **hacia arriba** (tabla VE de guantes como referencia).
- PBT/Grant no tiene tabla propia (`tables: []`): se muestra la talla EU de
  la tabla VE equivalente con la nota de la marca («las tallas europeas
  equivalen…»).
- **Niños (por defecto)**: se recomienda la talla que encaja y, si la altura
  está en el tercio alto del rango, se añade «Si crece rápido: la siguiente,
  140». Sin cambiar la recomendación principal.

### Resultado y tienda (por defecto)
- Tarjetas por marca (Allstar · VE · NPT · Grant/PBT) con la talla de traje
  (chaqueta y pantalón), peto, chaqueta eléctrica, careta y guante cuando
  haya tabla, la confianza y un enlace «Ver tabla» a `#tallas-<marca>`.
- Botón «Usar mis tallas en la tienda»: guarda el resultado en
  `localStorage` (clave `cet-mis-tallas`, envuelto en try/catch). En la ficha
  de producto (`ShopDialog`/`ShopApp.tsx`), si el producto tiene esa talla
  en `sizes` y su `sizeGuide` es de esa marca, se **preselecciona** con la
  etiqueta «Tu talla según la calculadora». No se añade nada al carrito
  automáticamente. Botón «Borrar mis medidas».

### Detalles
- Componente cliente `src/components/SizeCalculator.tsx` con `lang`.
  Textos en español en el propio componente, o en `shopText.ts`; los títulos
  de tabla y celdas en inglés se traducen con `data/en/tienda.json` (ya existe
  ese mecanismo).
- Accesible: `<label>` en cada campo, `inputmode="decimal"`, resultado en
  región `aria-live="polite"`, sin depender del color.
- Aviso fijo: «Orientativo. Si dudas, pruébate el material del club en
  clase».
- Enlace a la calculadora desde la intro de la tienda (junto al de la guía de
  tallas) y desde el enlace «Ver tabla de tallas» de cada ficha.
- `CONTENT_MAP.md`: añadir la línea de la calculadora en «Tienda».

### Comprobación
- Script de prueba `node --experimental-strip-types` (o equivalente sin
  dependencias nuevas) con casos: hombre 178/98/86/102 → Allstar 50 normal;
  niña 141/77/69/84 → infantil 140 (o 146) con aviso de crecimiento; mano
  20,3 cm → guante 8; cabeza 57 → careta Allstar 0 (S). Ajustar los casos a
  lo que digan de verdad las tablas.
- `npm run build` y `npm run lint` sin errores; Playwright a 360 px y 1280 px
  sin desbordamiento horizontal, en `/tienda/` y `/en/shop/`.

---

## B. Entrenador de pies por voz (`/entrenador` y `/en/footwork-trainer`)

### Qué hace
El móvil canta órdenes de desplazamiento al azar («¡En guardia!… avance…
avance… ¡fondo!… retroceso…») a un ritmo variable, para entrenar en casa.
También se ve la orden en grande en pantalla (sirve con el sonido apagado o
para personas sordas). Funciona sin conexión una vez cargada (la app ya
tiene caché).

### Por defecto (hasta que Víctor conteste `voz-*`)
- **Voz**: la del propio móvil (`speechSynthesis`), eligiendo una voz del
  idioma; si no hay, solo pantalla y un pitido corto (Web Audio).
- **Idiomas**: español, y también francés e inglés a elegir (el francés es el
  idioma de la esgrima: «En garde», «Marchez», «Rompez», «Fendez-vous»,
  «Allez»). Por defecto, el idioma de la página.
- **Niveles**:
  - *Iniciación*: en guardia, avance, retroceso, fondo. Orden cada 1,6–2,5 s.
  - *Medio*: más doble avance, salto adelante/atrás, fondo con recuperación.
    Cada 1,2–2 s.
  - *Competición* (sable): más balestra, flecha, avance-fondo y paradas de
    sable (tercera, cuarta y quinta). Cada 0,8–1,6 s.
- **Duración**: rondas de 30 s, 1, 2 o 3 minutos, con 1 a 5 rondas y descanso
  de 30 s o 1 min entre ellas. Cuenta atrás «Preparados… ¡Adelante!» y
  «¡Alto!» al acabar cada ronda.
- **Pista virtual**: lleva la cuenta de la posición (cada avance +1, retroceso
  −1, fondo/flecha según el caso) y no manda salirse de una pista de ±6 pasos;
  si llega al límite, fuerza la orden contraria. Así se puede entrenar en un
  pasillo.
- **Modo reacción** (opcional, interruptor): sin voz; la pantalla cambia de
  color y cada color es una orden (leyenda en pantalla). Sin destellos: como
  mucho 2 cambios por segundo y transición suave; con
  `prefers-reduced-motion`, sin animación.

### Datos editables
`src/content/data/entrenador.json` (y su entrada en `public/admin/config.yml`,
«Entrenador por voz»): lista de movimientos con `id`, `es`, `fr`, `en`,
`niveles` (lista), `paso` (+1/−1/0, efecto en la pista) y `peso` (frecuencia
relativa); niveles con sus intervalos; textos de inicio y fin. El código no
lleva movimientos escritos a mano.

### Detalles
- Página `src/app/(es)/entrenador/page.tsx` y
  `src/app/(en)/en/footwork-trainer/page.tsx`, con su `metadata`,
  `PageHero` y la pareja en `pathPairs`. Componente cliente
  `src/components/FootworkTrainer.tsx`.
- Pantalla siempre encendida durante la sesión con la Wake Lock API, si
  existe (y se libera al parar).
- Botones grandes (Empezar / Pausa / Parar), orden actual en una región
  `aria-live="assertive"`, ronda y tiempo restante visibles.
- Aviso: «Calienta antes y despeja el espacio. Los menores, con un adulto
  cerca».
- Enlaces: menú «El club» → «Entrenador por voz» («Entrena los pies en casa»),
  en español e inglés (`site.ts`, `i18n.ts`); tarjeta en la página `/app`
  (`AppPage.tsx`); `sitemap.ts`; `live-check.yml`.
- `CONTENT_MAP.md`: fila nueva en la tabla y dato editable en la cabecera.

### Comprobación
- Playwright: la página carga sin errores de consola, «Empezar» cambia la
  orden en pantalla en menos de 3 s (con `speechSynthesis` sustituido por un
  doble en la prueba), «Parar» la detiene, y la posición nunca pasa de ±6
  en 200 órdenes simuladas (exponer la función generadora para probarla).
- `npm run build` y `npm run lint`; 360 px sin desbordamiento.

---

## Publicación
Una vez probadas las dos, commit en `claude/esgrima-web-rebuild-1or7ev`,
lanzar `deploy-production.yml` y comprobar en vivo `/tienda/#calculadora`,
`/en/shop/`, `/entrenador/` y `/en/footwork-trainer/` (devuelven 200). Si el
proxy no deja abrir la web desde la sesión, comprobarlo con el workflow
`live-check.yml`.
