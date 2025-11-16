// Service Worker for offline functionality
const CACHE_NAME = 'morefitlyfe-v1';
const RUNTIME_CACHE = 'morefitlyfe-runtime';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/programs',
  '/meal-plans',
  '/mobile-features',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Precaching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API requests - network first, cache fallback
  if (url.pathname.includes('/rest/v1/') || url.pathname.includes('/auth/v1/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone and cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then(cached => {
            if (cached) {
              return cached;
            }
            // Return offline response for API calls
            return new Response(
              JSON.stringify({ error: 'Offline', cached: false }),
              { 
                headers: { 'Content-Type': 'application/json' },
                status: 503 
              }
            );
          });
        })
    );
    return;
  }

  // Static assets - cache first, network fallback
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) {
          return cached;
        }
        return fetch(request).then(response => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - network first, cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cached => {
            if (cached) {
              return cached;
            }
            // Fallback to index.html for SPA routing
            return caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Default - network only
  event.respondWith(fetch(request));
});

// Background sync for failed requests (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('Background sync triggered');
  // Implement sync logic here
}

// Push notification support (for future use)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'MoreFitLyfe';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/app-icon.png',
    badge: '/app-icon.png',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
