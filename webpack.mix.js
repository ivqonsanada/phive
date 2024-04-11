const { join, resolve } = require('path')
const { copySync, removeSync } = require('fs-extra')
const mix = require('laravel-mix')
const findRemoveSync = require('find-remove')
require('laravel-mix-versionhash')
require('laravel-mix-workbox')
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const serviceWorkerConfig = {
  additionalManifestEntries: [{ url: '/', revision: Date.now().toString() }],

  navigateFallback: '/',

  modifyURLPrefix: {
    '//': '/'
  },

  // Do not precache images
  exclude: [/\.(?:png|jpg|jpeg|txt)$/],

  // Define runtime caching rules.
  runtimeCaching: [
    {
      // Match any request from inside icon
      urlPattern: /icon/,

      // Apply a cache-first strategy.
      handler: 'CacheFirst',

      options: {
        // Use a custom cache name.
        cacheName: 'icons',

        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },

    {
      // Match any request from api
      urlPattern: /api/,

      // Apply a network-first strategy.
      handler: 'NetworkFirst',

      options: {
        // Use a custom cache name.
        cacheName: 'apis',

        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },

    {
      urlPattern: /\.(?:svg|ico)$/,

      // Apply a cache-first strategy.
      handler: 'CacheFirst',

      options: {
        // Use a custom cache name.
        cacheName: 'images'
      }
    },

    {
      // Match any request that ends with .png, .jpg, .jpeg
      urlPattern: /\.(?:png|jpg|jpeg)$/,

      // Apply a cache-first strategy.
      handler: 'CacheFirst',

      options: {
        // Use a custom cache name.
        cacheName: 'images',

        // Only cache 30 images.
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
        }
      }
    },

    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,

      // Apply a stale-while-revalidate strategy.
      handler: 'StaleWhileRevalidate',

      options: {
        // Use a custom cache name.
        cacheName: 'google-fonts-stylesheets'
      }
    },

    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,

      // Apply a cache-first strategy.
      handler: 'CacheFirst',

      options: {
        // Use a custom cache name.
        cacheName: 'google-fonts-webfonts',

        cacheableResponse: {
          statuses: [0, 200]
        },
        expiration: {
          maxAgeSeconds: 60 * 60 * 24 * 365,
          maxEntries: 30
        }
      }
    }
  ],

  skipWaiting: true
}

mix
  .js('resources/js/app.js', 'public/dist/js')
  .vue({
    extractStyles: true
  })
  .sass('resources/sass/app.scss', 'public/dist/css')
  .options({ processCssUrls: false })
  .disableNotifications()

if (mix.inProduction()) {
  mix
    // .extract() // Disabled until resolved: https://github.com/JeffreyWay/laravel-mix/issues/1889
    // .version() // Use `laravel-mix-versionhash` for the generating correct Laravel Mix manifest file.
    .versionHash()
    .generateSW(serviceWorkerConfig)
} else {
  mix.sourceMaps()
}

let outputConfig = {
  chunkFilename: 'dist/js/[chunkhash].js',
  path: resolve(__dirname, mix.inProduction() ? './public/build' : './public')
}

if (mix.inProduction()) {
  outputConfig = {
    ...outputConfig,
    publicPath: '/'
  }
}

mix.webpackConfig({
  plugins: [
    // new BundleAnalyzerPlugin()
  ],
  resolve: {
    extensions: ['.js', '.json', '.vue'],
    alias: {
      '~': join(__dirname, './resources/js')
    }
  },
  output: outputConfig
})

mix.then(() => {
  process.nextTick(() => {
    cleanOldBuild()

    if (mix.inProduction()) {
      publishAssets()
    }
  })
})

function cleanOldBuild () {
  const publicDir = resolve(__dirname, './public')

  findRemoveSync(publicDir, {
    maxLevel: 1,
    files: 'workbox|worker',
    regex: true
  })
}

function publishAssets () {
  const publicDir = resolve(__dirname, './public')

  removeSync(join(publicDir, 'dist'))
  copySync(join(publicDir, 'build'), publicDir)
  removeSync(join(publicDir, 'build'))
}
