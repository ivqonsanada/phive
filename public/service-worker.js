importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js')

if (workbox) {
  console.log('Workbox berhasil dimuat')
} else {
  console.log('Workbox gagal dimuat')
}

// workbox.precaching.precacheAndRoute([
//   { url: '/', revision: '5' },
//   { url: '/dist/js/app.e58caa.js', revision: '1' },
//   { url: '/dist/css/app.f0814a.css', revision: '1' },
// ])

// workbox.routing.registerRoute(
//   new RegExp('/dist/js/'),
//   workbox.strategies.cacheFirst({
//     cacheName: 'pages'
//   })
// )

workbox.routing.registerRoute(
  new RegExp('/api/(leaderboard|home|project/[^.]*/similar)'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'apis'
  })
)

workbox.routing.registerRoute(
  new RegExp('/api/'),
  workbox.strategies.networkFirst({
    cacheName: 'apis'
  })
)

// workbox.routing.registerRoute(
//   /\.(?:png|gif|jpg|jpeg|svg)$/,
//   workbox.strategies.cacheFirst({
//     cacheName: 'images',
//     plugins: [
//       new workbox.expiration.Plugin({
//         maxEntries: 30,
//         maxAgeSeconds: 30 * 24 * 60 * 60 // 30 hari
//       })
//     ]
//   })
// )

workbox.routing.registerRoute(
  /^https:\/\/fonts\.googleapis\.com/,
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets'
  })
)

workbox.routing.registerRoute(
  /^https:\/\/fonts\.gstatic\.com/,
  workbox.strategies.cacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [
      new workbox.cacheableResponse.Plugin({
        statuses: [0, 200]
      }),
      new workbox.expiration.Plugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30
      })
    ]
  })
)
