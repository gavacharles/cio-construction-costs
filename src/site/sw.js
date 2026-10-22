/* CiO Costs offline cache: pages network-first (fall back to the last copy), assets cache-first. Build __BUILT__ */
const CACHE = "cio-__BUILT__";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "assets/cio.css", "assets/cio.js"]).catch(() => {}))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/")) return;
  const put = res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; };
  if (r.mode === "navigate" || u.pathname.endsWith(".html")) {
    e.respondWith(fetch(r).then(put).catch(() => caches.match(r).then(x => x || caches.match("./"))));
  } else if (u.pathname.includes("/assets/")) {
    e.respondWith(caches.match(r).then(x => x || fetch(r).then(put)));
  }
});
