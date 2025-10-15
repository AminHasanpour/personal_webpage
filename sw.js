/**
 * Service Worker for Mohammad Amin Hasanpour's Website
 * Provides offline capabilities and performance optimization
 * 
 * @author Mohammad Amin Hasanpour
 * @version 1.1.0
 */

const CACHE_NAME = 'website-v1.1.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/styles/w3.css',
  '/styles/loader.css',
  '/styles/email_box.css',
  '/styles/scrollable_slider.css',
  '/js/app.js',
  '/js/loading_text.js',
  '/js/email_box.js',
  '/js/leaves.js',
  '/images/my-photo.jpg',
  '/images/bg_home.jpg',
  '/images/flowers/leaf 1.png',
  '/images/flowers/leaf 2.png',
  '/images/flowers/leaf 3.png',
  '/images/flowers/leaf 4.png',
  '/images/flowers/leaf 5.png',
  '/images/flowers/leaf 6.png',
  '/images/flowers/leaf 7.png',
  '/images/flowers/leaf 8.png',
  // Add other critical resources as needed
];

/**
 * Install event - cache essential resources
 */
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache installation failed:', error);
      })
  );
  
  // Force the new service worker to activate immediately
  self.skipWaiting();
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Ensure the service worker controls all clients
  return self.clients.claim();
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip external requests (analytics, etc.)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Don't cache non-successful responses
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }
            
            // Clone response for caching
            const responseToCache = fetchResponse.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return fetchResponse;
          })
          .catch(() => {
            // Fallback for offline scenarios
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

/**
 * Background sync for analytics and form submissions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-analytics') {
    event.waitUntil(
      // Handle background analytics sync
      console.log('[ServiceWorker] Background sync for analytics')
    );
  }
});

/**
 * Push notifications (for future use)
 */
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  const title = 'Website Update';
  const options = {
    body: 'New content available!',
    icon: '/images/icon-192x192.png',
    badge: '/images/badge-72x72.png',
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
