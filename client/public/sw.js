self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('atelier-static-v1').then((cache) => cache.addAll(['/', '/index.html']))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json?.() || { title: 'Atelier Notes', body: 'Neue Team-Aktivität' };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Atelier Notes', {
      body: data.body || 'Es gibt ein Update.',
      icon: '/vite.svg'
    })
  );
});
