import Vue from 'vue'
import store from '~/store'
import router from '~/router'
import App from '~/components/App'
import Snackbar from 'vuejs-snackbar'

// import LogRocket from 'logrocket'
// import VueInputDropdown from 'vue-input-dropdown'
import vueDebounce from 'vue-debounce'
import VueContentPlaceholders from 'vue-content-placeholders'
import VueExpandableImage from 'vue-expandable-image'
import Vue2TouchEvents from 'vue2-touch-events'
import VueSocialSharing from 'vue-social-sharing'
import Paginate from 'vuejs-paginate'

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

import VueMatchMedia from '@webqam/vue-match-media'
const breakpoints = {
  xs: '360px',
  sm: '410px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  xxl: '1366px'
}

const VueScrollTo = require('vue-scrollto')

Vue.use(VueScrollTo, {
  easing: 'ease-in-out',
  duration: 60,
  offset: -60,
  force: true,
  cancelable: true
})
Vue.use(VueSocialSharing)
Vue.use(Vue2TouchEvents)
Vue.use(VueContentPlaceholders)
Vue.use(VueExpandableImage)
Vue.use(VueMatchMedia, { breakpoints })
Vue.use(vueDebounce)
// Vue.use(VueInputDropdown)

Vue.component('snackbar', Snackbar)
Vue.component('paginate', Paginate)

Vue.config.productionTip = true

/* eslint-disable no-new */
new Vue({
  store,
  router,
  ...App
})
