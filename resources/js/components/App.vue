<template>
  <div id="app">
    <!-- <loading ref="loading" /> -->
    <template>
      <snackbar ref="snackbar" base-size="100px" style="font-size:1.24rem" position="bottom" :hold-time="4000" :multiple="false" />
    </template>
    <transition name="page" mode="out-in">
      <component :is="layout" v-if="layout" />
    </transition>
  </div>
</template>

<script>
// import Loading from './Loading'
import '../../sass/elements/_customNProgress.scss'
import { loadProgressBar } from 'axios-progress-bar'

loadProgressBar()

const requireContext = require.context('~/layouts', false, /.*\.vue$/)

const layouts = requireContext.keys()
  .map(file =>
    [file.replace(/(^.\/)|(\.vue$)/g, ''), requireContext(file)]
  )
  .reduce((components, [name, component]) => {
    components[name] = component.default || component
    return components
  }, {})

export default {
  el: '#app',

  data: () => ({
    layout: null,
    defaultLayout: 'default'
  }),

  metaInfo () {
    const appName = 'PHive'

    return {
      title: appName,
      titleTemplate: `%s · ${appName}`
    }
  },

  mounted () {
    this.$store.dispatch('notification/attachSnackbar', {
      snackbar: this.$refs.snackbar
    })
  },

  methods: {
    setLayout (layout) {
      if (!layout || !layouts[layout]) {
        layout = this.defaultLayout
      }

      this.layout = layouts[layout]
    }
  }
}
</script>
