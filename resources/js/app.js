import Vue from 'vue'
import store from '~/store'
import router from '~/router'
import App from '~/components/App'
import Snackbar from 'vuejs-snackbar'

// import LogRocket from 'logrocket'

import VueContentPlaceholders from 'vue-content-placeholders'

import '~/plugins'
import '~/components'

// import Echo from 'laravel-echo'

// window.Pusher = require('pusher-js')

// window.Echo = new Echo({
//   broadcaster: 'pusher',
//   key: process.env.MIX_PUSHER_APP_KEY,
//   cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//   encrypted: false
// })

// LogRocket.init('i0tmx9/phive')

const VueScrollTo = require('vue-scrollto')

Vue.use(VueScrollTo, {
  easing: 'ease-in-out',
  duration: 60,
  offset: -60,
  force: true,
  cancelable: true
})
Vue.use(VueContentPlaceholders)

Vue.component('snackbar', Snackbar)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  store,
  router,
  ...App
})
