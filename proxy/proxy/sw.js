/* ==============================
   SERVICE WORKER - SDL Analyse
   ============================== */

const CACHE_NAME = "sdl-analyse-cache-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json"
];

// Installation du service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("📦 Mise en cache des fichiers essentiels...");
      return cache.addAll(ASSETS);
    })
  );
});

// Activation du service worker
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  console.log("✅ Service Worker actif !");
});

// Interception des requêtes
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
