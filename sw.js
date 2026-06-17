const CACHE_NAME = 'rasiga-v2';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'js/icons.js',
  'js/data.js',
  'js/badges.js',
  'js/components.js',
  'js/pages.js',
  'js/router.js',
  'js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network First, falling back to cache strategy
  e.respondWith(
    fetch(e.request).then((networkResponse) => {
      // If we got a successful response from the network, cache it and return it.
      if (networkResponse && networkResponse.status === 200) {
        const clonedResponse = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clonedResponse));
      }
      return networkResponse;
    }).catch(() => {
      // If the network request fails (offline), fall back to the cache.
      return caches.match(e.request);
    })
  );
});
