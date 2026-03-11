/* ============================
   CONTROLE ARTERIAL — Service Worker
   ============================ */

const CACHE_NAME = 'controle-arterial-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/utils.js',
    '/js/storage.js',
    '/js/charts.js',
    '/js/ui.js',
    '/js/app.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-512.png'
];

// Install — cache all assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — cache-first strategy
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // Skip Google Fonts (let them load from network)
    if (event.request.url.includes('fonts.googleapis.com') ||
        event.request.url.includes('fonts.gstatic.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return from cache, but also fetch in background to update
                event.waitUntil(
                    fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, networkResponse);
                            });
                        }
                    }).catch(() => { /* offline, ignore */ })
                );
                return cachedResponse;
            }

            // Not in cache — fetch from network
            return fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            });
        })
    );
});
