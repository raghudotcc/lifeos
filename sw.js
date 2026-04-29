const V = 'lifeos-v12';
const SHELL = ['index.html', 'manifest.json', 'icon.svg'];

self.addEventListener('install',  e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: 'window' }).then(cs => {
    const c = cs.find(c => c.url.includes('index.html') || c.url.endsWith('/'));
    return c ? c.focus() : clients.openWindow('index.html');
  }));
});

self.addEventListener('fetch', e => {
  if (/googleapis|accounts\.google/.test(e.request.url)) return;
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && e.request.method === 'GET') {
      const clone = r.clone(); // clone BEFORE body is consumed by return
      caches.open(V).then(c => c.put(e.request, clone));
    }
    return r;
  })).catch(() => caches.match('index.html')));
});
