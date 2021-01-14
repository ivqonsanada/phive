importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js')

if (workbox) {
  console.log('Workbox berhasil dimuat')
} else {
  console.log('Workbox gagal dimuat')
}

// workbox.precaching.precacheAndRoute([
//   { url: '/index.html', revision: '1' },
//   { url: '/components/nav.html', revision: '1' },
//   { url: '/css/materialize.min.css', revision: '1' },
//   { url: '/css/styles.css', revision: '1' },
//   { url: '/dist/0.index.bundle.js', revision: '1' },
//   { url: '/dist/index.bundle.js', revision: '1' },
//   { url: 'https://code.iconify.design/1/1.0.7/iconify.min.js', revision: '1' },
//   { url: '/site.webmanifest', revision: '1' }
// ])

workbox.routing.registerRoute(
  new RegExp('/dist/js/'),
  workbox.strategies.cacheFirst({
    cacheName: 'pages'
  })
)

workbox.routing.registerRoute(
  new RegExp('/api/'),
  workbox.strategies.staleWhileRevalidate({
    cacheName: 'apis'
  })
)

workbox.routing.registerRoute(
  /\.(?:png|gif|jpg|jpeg|svg)$/,
  workbox.strategies.cacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.Plugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 hari
      })
    ]
  })
)

/*
  ukuran file crestnya terlalu besar, dan terlalu banyak,
  karena direkomendasikan untuk tidak dimasukkan ke service worker, saya comment saja
*/

// workbox.routing.registerRoute(
//   /^https:\/\/crests\.football-data\.org/,
//   workbox.strategies.cacheFirst({
//     cacheName: 'api-images',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200],
//       }),
//       new workbox.expiration.Plugin({
//         maxAgeSeconds: 60 * 60 * 24 * 365,
//         maxEntries: 30,
//       }),
//     ],
//   }),
// );

// self.addEventListener('push', (event) => {
//   let body
//   if (event.data) {
//     body = event.data.text()
//   } else {
//     body = 'Push message no payload'
//   }
//   const options = {
//     body,
//     icon: 'android-chrome-192x192.png',
//     vibrate: [100, 50, 100],
//     data: {
//       dateOfArrival: Date.now(),
//       primaryKey: 1
//     }
//   }
//   event.waitUntil(
//     self.registration.showNotification('Push Notification', options)
//   )
// })
