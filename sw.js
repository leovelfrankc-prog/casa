// ============================================
// Service Worker para desarrollo
// Siempre obtiene los recursos del servidor
// ============================================

self.addEventListener("install", event => {

    console.log("SW instalado");

    self.skipWaiting();

});

self.addEventListener("activate", event => {

    console.log("SW activado");

    event.waitUntil(
        clients.claim()
    );

});

self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request, {
            cache: "no-store"
        }).catch(() => {

            return caches.match(
                event.request
            );

        })

    );

});
