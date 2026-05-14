const CACHE_NAME = 'nexus-match-v3';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/offline.html', '/manifest.json']);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (url.origin !== self.location.origin) return;

  // Never cache HTML documents — always fetch fresh from network
  if (event.request.mode === 'navigate' ||
      url.pathname === '/' ||
      url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Never cache Vite dev assets (they have ?v= or ?t= query params)
  if (url.search.includes('v=') || url.search.includes('t=') ||
      url.pathname.startsWith('/@') || url.pathname.startsWith('/src/') ||
      url.pathname.startsWith('/node_modules/') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Cache-first for static assets (images, fonts, icons)
  if (/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot|ico)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});
