const CACHE_NAME = 'rasiga-v1';
const ASSETS = [
  './',
  'index.html',
  'style.css',
  'js/icons.js',
  'js/data.js',
  'js/badges.js',
  'js/components.js',
  'js/charts-viz.js',
  'js/pages.js',
  'js/router.js',
  'js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
