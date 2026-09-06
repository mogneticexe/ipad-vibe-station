// VibeStation Service Worker - Session Keepalive & Offline Cache
const CACHE_NAME = 'vibestation-v1';
const ASSETS = [
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  '../starter-game/index.html',
  '../starter-game/game.js',
  '../starter-game/style.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => console.log('Cache prefill notice:', err));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => {
      return res || fetch(e.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
