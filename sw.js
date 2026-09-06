const CACHE = 'rw-v11';
const ASSETS = [
  './','./index.html','./styles.css','./manifest.json','./icon.svg','./fleisch-thron.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // API / andere Domains (buch-engine, Proxy, …) nie anfassen
  if(url.origin !== self.location.origin) return;
  if(e.request.method !== 'GET') return;

  const fallback = ()=> caches.match('./index.html').then(h=> h || new Response('Offline', {status:503, headers:{'content-type':'text/plain'}}));

  const isDoc = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/Kimi/') || url.pathname.endsWith('/Kimi');
  const isBoot = url.pathname.endsWith('/fleisch-thron.json');
  if(isDoc || isBoot){
    e.respondWith(
      fetch(e.request).then(r=>{
        if(r && r.ok){ const copy=r.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); }
        return r || fallback();
      }).catch(()=> caches.match(e.request).then(hit=> hit || fallback()))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit=>{
      if(hit) return hit;
      return fetch(e.request).then(r=>{
        if(r && r.ok){
          const copy=r.clone();
          caches.open(CACHE).then(c=>c.put(e.request, copy));
        }
        return r || fallback();
      }).catch(()=> fallback());
    })
  );
});
