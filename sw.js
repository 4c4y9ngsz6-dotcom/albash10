const CACHE_NAME = 'honey-shop-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './images/logo.png',
  './images/manuka_hero_bg.png',
  './images/default_honey.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
