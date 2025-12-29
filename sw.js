const CACHE_NAME = 'exam-seating-v1';
// List of files that are essential for the app to run.
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/components/Header.tsx',
  '/components/InputForm.tsx',
  '/components/ResultsDisplay.tsx',
  '/components/BatchInputRow.tsx',
  '/components/ArrangementView.tsx',
  '/components/SummaryView.tsx',
  '/components/DownloadView.tsx',
  '/services/seatingService.ts',
  '/services/exportService.ts',
  '/components/icons/BarChartIcon.tsx',
  '/components/icons/DownloadIcon.tsx',
  '/components/icons/FileTextIcon.tsx',
  '/components/icons/ListIcon.tsx',
  '/components/icons/PlusIcon.tsx',
  '/components/icons/SheetIcon.tsx',
  '/components/icons/TrashIcon.tsx',
  '/components/icons/WordIcon.tsx',
];

// On install, cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Opened cache');
      // We are not caching the CDN resources during install
      // because they will be cached on the first fetch.
      return cache.addAll(APP_SHELL_URLS);
    })
  );
});

// On fetch, use a cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If the request is in the cache, return it.
      if (response) {
        return response;
      }

      // If the request is not in the cache, fetch it from the network.
      return fetch(event.request).then((networkResponse) => {
        // If the network request is successful, clone it, cache it, and return it.
        if (networkResponse && networkResponse.status === 200) {
          // Don't cache chrome-extension requests
          if (event.request.url.startsWith('chrome-extension://')) {
              return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(error => {
        // If the network request fails (e.g., offline),
        // we can't do much if the resource isn't cached.
        // This is expected for the very first visit if offline.
        console.error('Fetching failed:', error);
        // We could return a generic fallback page here if we had one.
      });
    })
  );
});

// On activate, remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
