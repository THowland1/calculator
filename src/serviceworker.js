import { manifest, version } from '@parcel/service-worker';

const OFFLINE_URL = 'index.html';
const v = process.env.BUILD_TIME;

self.addEventListener('install', function (event) {
  console.log('[ServiceWorker] Install');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(version);
      // Setting {cache: 'reload'} in the new request will ensure that the response
      // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
      await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
      await cache.add('/');
      await cache.addAll(manifest);
    })()
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    (async () => {
      // Enable navigation preload if it's supported.
      // See https://developers.google.com/web/updates/2017/02/navigation-preload
      if ('navigationPreload' in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  // console.log('[Service Worker] Fetch', event.request.url);
  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(event.request);
      console.log;
      return cachedResponse || fetch(event.request);
    })()
  );
});
