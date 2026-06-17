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
  // Stale-while-revalidate strategy for the app shell
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Cache the fresh response if it's successful
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
