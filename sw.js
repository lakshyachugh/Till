/* Suramyah Till offline copy.
   Opens instantly from the phone's saved copy, then quietly fetches the newest version
   from GitHub in the background for next time. Webhook and printer traffic is never touched. */
const CACHE = "suramyah-till-v3";
const APP = ["./", "./index.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const key = req.mode === "navigate" ? "./index.html" : req;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const saved = await cache.match(key, { ignoreSearch: true });
    const fresh = fetch(req, { cache: "no-store" }).then(res => {
      if (res && res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => null);
    if (saved) { e.waitUntil(fresh); return saved; }
    return (await fresh) || new Response("Suramyah Till isn't saved on this phone yet. Open it once with internet.", { status: 503, headers: { "Content-Type": "text/plain" } });
  }));
});
