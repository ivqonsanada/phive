<template>
  <div id="app">
    <!-- <loading ref="loading" /> -->

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

// Load layout components dynamically.
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
    const appName = 'Phive'

    return {
      title: appName,
      titleTemplate: `%s · ${appName}`
    }
  },

  methods: {
    /**
     * Set the application layout.
     *
     * @param {String} layout
     */
    setLayout (layout) {
      if (!layout || !layouts[layout]) {
        layout = this.defaultLayout
      }

      this.layout = layouts[layout]
    }
  }
}
</script>
