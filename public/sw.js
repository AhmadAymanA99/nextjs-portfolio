const CACHE = 'portfolio-v3'

const STATIC_EXT = /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|json)$/

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith('http')) return

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }

  if (STATIC_EXT.test(request.url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }).catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  event.respondWith(fetch(request))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      ),
    ])
  )
})