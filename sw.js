// สมุดกรีดยาง: เก็บแอปไว้ในเครื่องเพื่อเปิดได้ตอนไม่มีเน็ต
// ออกเวอร์ชันใหม่: เปลี่ยนเลข CACHE ทุกครั้ง แอปจะขึ้นแถบ "มีเวอร์ชันใหม่"
const CACHE='kriedyang-v5';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    if(hit)return hit;
    try{const r=await fetch(e.request);if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}
    catch(err){if(e.request.mode==='navigate'){const i=await c.match('index.html');if(i)return i}return new Response('',{status:504})}
  }));
});
