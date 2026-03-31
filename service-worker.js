// This is the "Offline page" service worker
importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = 'pwabuilder-page';
const offlineFallbackPage = '/offline.html';

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll([offlineFallbackPage]))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// network first para navegação, com fallback para offline.html
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        const cache = await caches.open(CACHE);
        const cachedResponse = await cache.match(offlineFallbackPage);
        return cachedResponse;
      }
    })());
    return;
  }

  // Adiciona caching para API e imagens, combinando com Next-PWA
  if (event.request.url.match(/\/(api)\//)) {
    event.respondWith((async () => {
      const cache = await caches.open('api-cache');
      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(event.request);
        return cached || fetch(event.request);
      }
    })());
    return;
  }

  if (event.request.destination === 'image') {
    event.respondWith((async () => {
      const cache = await caches.open('image-cache');
      const cached = await cache.match(event.request);
      const networkFetch = fetch(event.request).then((resp) => {
        if (resp && resp.status === 200) cache.put(event.request, resp.clone());
        return resp;
      }).catch(() => null);

      return cached || networkFetch || cached;
    })());
  }
});