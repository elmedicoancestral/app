const CACHE='el-medico-ancestral-v3.0.0';
const ASSETS=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./logo-el-medico-ancestral.png","./icon-192.png","./icon-512.png","./apple-touch-icon.png","./favicon-32.png","./assets/plants/manzanilla.webp","./assets/plants/menta-hierbabuena.webp","./assets/plants/tilo.webp","./assets/plants/lavanda.webp","./assets/plants/romero.webp","./assets/plants/salvia.webp","./assets/plants/tomillo.webp","./assets/plants/oregano.webp","./assets/plants/eucalipto.webp","./assets/plants/jengibre.webp","./assets/plants/curcuma.webp","./assets/plants/calendula.webp","./assets/plants/aloe-vera.webp","./assets/plants/boldo.webp","./assets/plants/diente-de-leon.webp","./assets/plants/ortiga.webp","./assets/plants/hinojo.webp","./assets/plants/anis-estrellado.webp","./assets/plants/canela.webp","./assets/plants/laurel.webp","./assets/plants/limon.webp","./assets/plants/perejil.webp","./assets/plants/ajo.webp","./assets/plants/cebolla.webp","./assets/plants/malva.webp","./assets/plants/cola-de-caballo.webp","./assets/plants/pasiflora.webp","./assets/plants/valeriana.webp","./assets/plants/rosa-mosqueta.webp","./assets/plants/sauco.webp"];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith(fetch(event.request).then(response=>{
    const copy=response.clone();
    caches.open(CACHE).then(cache=>cache.put(event.request,copy));
    return response;
  }).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
