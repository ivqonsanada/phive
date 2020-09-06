import Vue from 'vue'
import store from '~/store'
import router from '~/router'
import App from '~/components/App'

import VueContentPlaceholders from 'vue-content-placeholders'

import '~/plugins'
import '~/components'

const VueScrollTo = require('vue-scrollto')

Vue.use(VueScrollTo, {
  easing: 'ease-in-out',
  duration: 60,
  offset: -60,
  force: true,
  cancelable: true
})
Vue.use(VueContentPlaceholders)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  store,
  router,
  ...App
})
