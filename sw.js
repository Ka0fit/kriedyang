// สมุดกรีดยาง: เก็บแอปไว้ในเครื่องเพื่อเปิดได้ตอนไม่มีเน็ต
// อัปเดตได้ 2 ทาง: ออนไลน์ (ไฟล์นี้เปลี่ยน) หรือจากไฟล์ในแอป (เก็บใน kriedyang-user) · ใช้เวอร์ชันที่เลขสูงกว่าเสมอ
const VER=52;
const CACHE='kriedyang-'+VER,UC='kriedyang-user';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
const verOf=t=>{const m=/const APP_V=(\d+);/.exec(t||'');return m?+m[1]:0};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting();else if(e.data==='ver'&&e.ports&&e.ports[0])e.ports[0].postMessage(VER)});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==UC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
async function page(req){
  const c=await caches.open(CACHE),u=await caches.open(UC);
  const sh=await c.match(req,{ignoreSearch:true})||await c.match('index.html');const ov=await u.match('user/index.html');
  if(ov){if(!sh)return ov;const [a,b]=await Promise.all([ov.clone().text(),sh.clone().text()]);if(verOf(a)>verOf(b))return ov}
  if(sh)return sh;
  try{return await fetch(req)}catch(err){return new Response('',{status:504})}
}
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  if(e.request.mode==='navigate'){e.respondWith(page(e.request));return}
  e.respondWith(caches.open(CACHE).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    if(hit)return hit;
    try{const r=await fetch(e.request);if(r&&(r.ok||r.type==='opaque'))c.put(e.request,r.clone());return r}
    catch(err){return new Response('',{status:504})}
  }));
});
