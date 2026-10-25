const CACHE_NAME = "voilearn-v1";

const STATIC_FILES = [
  "./css/style.css",
  "./js/app.js",
  "./js/router.js",
  "./js/lesson.js",
  "./js/quiz.js",
  "./js/notes.js",
  "./js/progress.js",
  "./js/storage.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES))
  );

  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  const req = event.request;
  const url = new URL(req.url);

  // -------------------------
  // HTML -> Always Network First
  // -------------------------
  if (
    req.mode === "navigate" ||
    req.destination === "document"
  ) {

    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, copy);
          });

          return response;
        })
        .catch(() => caches.match(req))
    );

    return;
  }

  // -------------------------
  // JSON -> Network First
  // -------------------------
  if (url.pathname.endsWith(".json")) {

    event.respondWith(
      fetch(req)
        .then(response => {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, copy);
          });

          return response;
        })
        .catch(() => caches.match(req))
    );

    return;
  }

  // -------------------------
  // JS/CSS/Images
  // Stale While Revalidate
  // -------------------------
  event.respondWith(
    caches.match(req).then(cached => {

      const networkFetch = fetch(req).then(response => {

        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, copy);
          });
        }

        return response;

      });

      return cached || networkFetch;

    })
  );

});
