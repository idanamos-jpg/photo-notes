const CACHE='photo-notes-v2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./lib/jspdf.umd.min.js',
 './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
 './fonts/heebo-hebrew-400-normal.woff2','./fonts/heebo-hebrew-500-normal.woff2','./fonts/heebo-hebrew-700-normal.woff2',
 './fonts/heebo-latin-400-normal.woff2','./fonts/heebo-latin-500-normal.woff2','./fonts/heebo-latin-700-normal.woff2'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET'||new URL(r.url).origin!==location.origin) return;
  if(r.mode==='navigate'){ // network first for the page, so updates arrive
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return res; }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));
});
