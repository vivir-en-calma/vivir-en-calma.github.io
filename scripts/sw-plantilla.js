// Service worker de la Experiencia Libélula: permite abrir la herramienta sin conexión.
// Lo genera scripts/generar-sw.mjs después de compilar: la versión, la ruta base y
// la lista de archivos se completan con los datos de esa compilación.

const VERSION = "__VERSION__";
const BASE = "__BASE__";
const ARCHIVOS = __ARCHIVOS__;
const CACHE = `libelula-${VERSION}`;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ARCHIVOS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("libelula-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE + "/")) return;

  // Páginas: primero la red (para ver lo más reciente) y, sin conexión, la copia guardada.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() =>
          caches
            .match(req, { ignoreSearch: true })
            .then((r) => r || caches.match(url.pathname.endsWith("/") ? url.pathname : url.pathname + "/"))
            .then((r) => r || caches.match(BASE + "/")),
        ),
    );
    return;
  }

  // Archivos de la aplicación y datos de navegación: la copia guardada primero.
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (r) =>
        r ||
        fetch(req).then((res) => {
          if (res.ok && res.type === "basic") {
            const copia = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return res;
        }),
    ),
  );
});
