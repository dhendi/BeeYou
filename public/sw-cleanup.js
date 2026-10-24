// Service Worker Cache Maintenance & Security Cleanup
// Purges obsolete, sensitive, or legacy API caches on activation
self.addEventListener('activate', (event) => {
  const obsoleteCaches = ['api-speech-translation-cache'];
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((name) => obsoleteCaches.includes(name))
          .map((name) => {
            console.log('[SW Cleanup] Removing obsolete cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
});
