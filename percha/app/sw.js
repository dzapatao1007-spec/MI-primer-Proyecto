/* Service worker: red primero (siempre ves la versión nueva) y caché como respaldo sin conexión. */
var CACHE = "lapercha-v8";
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== CACHE; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var u = new URL(e.request.url);
  var isImg = /\.(webp|jpg|png|svg)$/.test(u.pathname);
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request).then(function (hit) {
      var net = fetch(e.request).then(function (res) { if (res.ok) c.put(e.request, res.clone()); return res; });
      if (isImg && hit) return hit;
      return net.catch(function () { return hit; });
    });
  }));
});
