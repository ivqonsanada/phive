<template>
  <div class="backwards">
    <div class="slide__1--container">
      <div class="slide__1--first-block">
        <h2 class="slide__1--heading">
          Expand <br>
          Your Career <br>
          by Doing <br>
          Project.
        </h2>
        <div class="slide__1--ornament">
          <img class="slide__1--triangle" src="/images/triangle.svg" alt="">
          <img class="slide__1--left-dashed" src="/images/left-dashed.svg" alt="">
          <img class="slide__1--right-dashed" src="/images/right-dashed.svg" alt="">
        </div>
        <p class="slide__1--paragraph">
          Fill up your college life with expectation
        </p>
        <router-link :to="{ name: 'explore' }" class="">
          <button class="slide__1--button">
            Get Started <span class="iconify" data-icon="ion:arrow-forward-outline" data-inline="true" />
          </button>
        </router-link>
      </div>
      <div class="slide__1--image-container">
        <img class="slide__1--dot-1" src="/images/dot-red.svg" alt="">
        <img class="slide__1--dot-2" src="/images/dot-blue.svg" alt="">
        <img class="slide__1--image" src="/images/smiling-woman-looking.png" alt="">
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {

  metaInfo () {
    return { title: 'Home' }
  },

  data: () => ({
    title: 'Home'
  }),

  computed: mapGetters({
    authenticated: 'auth/check'
  }),

  mounted () {
    let sheet = document.createElement('style')
    sheet.setAttribute('id', 'tempNavBg')
    sheet.innerHTML = '.nav-base { background: #F2F4F6 }'
    document.body.appendChild(sheet)
  },

  destroyed () {
    let sheetToBeRemoved = document.getElementById('tempNavBg')
    let sheetParent = sheetToBeRemoved.parentNode
    sheetParent.removeChild(sheetToBeRemoved)
  }
}
</script>

<style>
.backwards {
  margin: -6rem -3rem -3rem;
}
</style>
