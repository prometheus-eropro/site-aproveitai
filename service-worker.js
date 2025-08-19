// service-worker.js
const STATIC_CACHE = "static-v3";
const DATA_CACHE = "data-v3";

const STATIC_ASSETS = [
  "/", "/index.html", "/cliente.html", "/parceiro.html",
  "/logo-aproveitai.png", "/logo-prometheus.png",
  "/manifest.webmanifest", "/offline.html"
];


self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (![STATIC_CACHE, DATA_CACHE].includes(k)) return caches.delete(k);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // 1) Respostas da API do Apps Script (benefícios/cliente)
  const isApi = /script\.googleusercontent\.com|script\.google\.com/.test(url.host);
  if (isApi) {
    e.respondWith((async () => {
      try {
        const net = await fetch(e.request);
        const cache = await caches.open(DATA_CACHE);
        cache.put(e.request, net.clone());
        return net;
      } catch {
        const cached = await caches.match(e.request);
        return cached || new Response("{}", { headers: { "Content-Type": "application/json" }});
      }
    })());
    return;
  }

  // 2) QR do Google Charts (cachea também)
  const isQr = url.host.includes("chart.googleapis.com");
  if (isQr) {
    e.respondWith((async () => {
      const cache = await caches.open(DATA_CACHE);
      const cached = await cache.match(e.request);
      if (cached) {
        fetch(e.request).then(resp => cache.put(e.request, resp.clone())).catch(()=>{});
        return cached;
      }
      try {
        const net = await fetch(e.request);
        cache.put(e.request, net.clone());
        return net;
      } catch {
        return new Response(null, { status: 504 });
      }
    })());
    return;
  }

  // 3) Demais arquivos estáticos – stale-while-revalidate
  e.respondWith((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(e.request);
    const fetchPromise = fetch(e.request)
      .then(net => { cache.put(e.request, net.clone()); return net; })
      .catch(()=>null);
    return cached || fetchPromise || fetch(e.request);
  })());
});
