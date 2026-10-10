/* Service worker del Club de Esgrima Torremolinos.
 *
 * - Páginas (navegación): red primero; si falla, la copia guardada y, en
 *   último término, /offline/.
 * - /_next/static/* e imágenes/iconos: caché primero con revalidación en
 *   segundo plano y tope de tamaño.
 * - Nunca se toca: métodos distintos de GET, PHP, /admin/, /admin-auth/,
 *   /gestion/, tienda-productos.json, calendario.json ni otros orígenes.
 *
 * El prefijo (BASE_PATH de las previsualizaciones) se deduce del ámbito con el
 * que se registró el worker, así que el mismo archivo vale en la raíz y en
 * subcarpetas. Para invalidar todo lo guardado, sube VERSION.
 *
 * Avisos push (al final del archivo): el servidor envía pushes SIN carga
 * (solo autenticación VAPID); al recibir uno, el worker pide
 * /aviso-actual.php (nunca en caché) y muestra la notificación. Al pulsarla,
 * enfoca una pestaña del sitio o abre el enlace del aviso.
 */
const VERSION = "v2";
const PAGES = `esgrima-pages-${VERSION}`;
const STATIC = `esgrima-static-${VERSION}`;
const IMAGES = `esgrima-images-${VERSION}`;
const KEEP = [PAGES, STATIC, IMAGES];
const MAX_PAGES = 40;
const MAX_IMAGES = 80;
const MAX_STATIC = 120;
const NETWORK_TIMEOUT_MS = 5000;

// "/web-esgrima" o "" (sin barra final).
const BASE = new URL(self.registration.scope).pathname.replace(/\/$/, "");
const OFFLINE_URL = `${BASE}/offline/`;
const PRECACHE_PAGES = [OFFLINE_URL];
const PRECACHE_ASSETS = [
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
  `${BASE}/icons/apple-touch-icon.png`,
];

// Rutas (sin el prefijo) que jamás se guardan ni se sirven desde caché.
const NEVER = /^\/(admin|admin-auth|gestion)(\/|$)|\.php$|\/tienda-productos\.json$|\/calendario\.json$/i;

function localPath(url) {
  const p = url.pathname;
  return BASE && p.startsWith(BASE) ? p.slice(BASE.length) || "/" : p;
}

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const pages = await caches.open(PAGES);
      const statics = await caches.open(STATIC);
      // La página sin conexión necesita sus propios JS/CSS de /_next/static.
      for (const url of PRECACHE_PAGES) {
        const res = await fetch(url, { cache: "reload" });
        if (!res.ok) throw new Error(`precache ${url}: ${res.status}`);
        await pages.put(url, res.clone());
        const html = await res.text();
        const assets = new Set(
          [...html.matchAll(/["'(](\/[^"'()\s]*?\/_next\/static\/[^"'()\s\\]+?\.(?:js|css|woff2))/g)].map(
            (m) => m[1],
          ),
        );
        await Promise.all(
          [...assets].map((a) => statics.add(a).catch(() => undefined)),
        );
      }
      const images = await caches.open(IMAGES);
      await Promise.all(PRECACHE_ASSETS.map((a) => images.add(a).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("esgrima-") && !KEEP.includes(n))
          .map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES);
  try {
    const res = await withTimeout(fetch(request), NETWORK_TIMEOUT_MS);
    // Solo se guardan páginas correctas (nada de 404/5xx ni redirecciones).
    if (res.ok && res.type === "basic") {
      const url = new URL(request.url);
      url.search = "";
      await cache.put(url.toString(), res.clone());
      trim(PAGES, MAX_PAGES);
    }
    return res;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const offline = await cache.match(OFFLINE_URL);
    return (
      offline ||
      new Response("Sin conexión", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function staleWhileRevalidate(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const update = fetch(request)
    .then((res) => {
      if (res.ok && res.type === "basic") {
        cache.put(request, res.clone()).then(() => trim(cacheName, max));
      }
      return res;
    })
    .catch(() => undefined);
  if (cached) return cached;
  return (await update) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.headers.has("range")) return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const path = localPath(url);
  if (NEVER.test(path)) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }
  // Los activos de /_next/static llevan hash en el nombre: inmutables.
  if (path.startsWith("/_next/static/")) {
    event.respondWith(staleWhileRevalidate(request, STATIC, MAX_STATIC));
    return;
  }
  if (
    request.destination === "image" ||
    path.startsWith("/images/") ||
    path.startsWith("/icons/")
  ) {
    event.respondWith(staleWhileRevalidate(request, IMAGES, MAX_IMAGES));
  }
  // Todo lo demás (JSON de datos, RSC, etc.) pasa directo a la red.
});

// --- Avisos push -------------------------------------------------------------

const FALLBACK_NOTICE = {
  title: "Club de Esgrima Torremolinos",
  body: "Tienes un aviso nuevo.",
  url: "/",
  id: "aviso",
};

async function currentNotice() {
  try {
    const res = await withTimeout(fetch(`${BASE}/aviso-actual.php`, { cache: "no-store" }), 8000);
    const data = await res.json();
    if (data && data.ok && data.title) return data;
  } catch {
    // Sin red o respuesta rara: se usa el aviso genérico.
  }
  return FALLBACK_NOTICE;
}

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      const n = await currentNotice();
      const url = typeof n.url === "string" && n.url.startsWith("/") ? n.url : "/";
      await self.registration.showNotification(n.title, {
        body: n.body || "",
        icon: `${BASE}/icons/icon-192.png`,
        badge: `${BASE}/icons/icon-192.png`,
        tag: String(n.id || "aviso"),
        data: { url: `${BASE}${url}` },
      });
    })(),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || `${BASE}/`, self.location.origin).href;
  event.waitUntil(
    (async () => {
      const list = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of list) {
        if (new URL(c.url).origin === self.location.origin && "focus" in c) {
          await c.focus();
          if ("navigate" in c && c.url !== target) {
            try {
              await c.navigate(target);
            } catch {
              // navegación no permitida: se queda donde estaba
            }
          }
          return;
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});
