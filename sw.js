// Süper Lig 7-0 service worker: önce internet (her zaman en güncel sürüm), yoksa önbellek.
const C = "sl70-v3";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(["./", "manifest.json", "icon-192.png"]).catch(()=>{}))); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  const fresh = e.request.mode === "navigate" || u.pathname.endsWith("/") || u.pathname.endsWith(".html");
  e.respondWith((fresh ? fetch(u.href, {cache: "no-cache", credentials: "same-origin"}) : fetch(e.request)).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("./"))));
});
