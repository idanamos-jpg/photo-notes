const CACHE='photo-notes-v6';
const ASSETS=['./','./index.html','./manifest.webmanifest','./lib/jspdf.umd.min.js',
 './icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
 './fonts/heebo-hebrew-400-normal.woff2','./fonts/heebo-hebrew-500-normal.woff2','./fonts/heebo-hebrew-700-normal.woff2',
 './fonts/heebo-latin-400-normal.woff2','./fonts/heebo-latin-500-normal.woff2','./fonts/heebo-latin-700-normal.woff2'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='pn-share').map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const r=e.request, u=new URL(r.url);
  // Android share target: WhatsApp "Export chat" → Notesapp
  if(r.method==='POST'&&u.origin===location.origin&&u.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{
        const fd=await r.formData(); const files=fd.getAll('files').filter(f=>f&&typeof f!=='string');
        const c=await caches.open('pn-share'); for(const k of await c.keys()) await c.delete(k);
        let i=0; for(const f of files){ await c.put(new Request(new URL('__share/'+(i++),self.registration.scope).href),new Response(f,{headers:{'content-type':f.type||'application/octet-stream','x-name':encodeURIComponent(f.name||'file')}})); }
      }catch(err){}
      return Response.redirect(new URL('./?share=1',self.registration.scope).href,303);
    })());
    return;
  }
  if(r.method!=='GET'||u.origin!==location.origin) return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return res; }).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{ if(res.ok){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)); } return res; })));
});
