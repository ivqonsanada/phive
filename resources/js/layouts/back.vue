<template>
  <div class="main-layout">
    <div v-if="!$matchMedia.xl" class="nav">
      <div class="nav-base">
        <button class="nav-toggler btn--clear flex" @click="back">
          <span class="iconify" data-icon="eva:arrow-back-fill" width="24" height="24" />
        </button>

        <div class="nav--brand-container">
          <a class="nav-brand">
            <!-- <div v-show="title">
              {{ title }}
            </div> -->
            <!-- <div v-show="!title"> -->
            <img src="/images/logo-blue.svg" alt="">
            <!-- </div> -->
          </a>
        </div>

        <div class="nav-stabilizer" />
      </div>
    </div>
    <Navbar v-else />

    <div class="container">
      <Child />

      <Footer v-if="$matchMedia.xl" class="footer-backward" />
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import Navbar from '~/components/Navbar'
import Footer from '~/components/Footer'
export default {
  name: 'BackLayout',

  components: {
    Navbar,
    Footer
  },

  computed: {
    // ...mapGetters({
    //   title: 'navigation/title'
    // })
  },

  methods: {
    async back () {
      this.$router.back()
    }
  }
}
</script>

<style lang="scss" scoped>
@import './resources/sass/abstract/_mixins.scss';

.container {
  display: flex;
  min-height: 100vh;
  justify-content: space-between;
  flex-direction: column;
  padding: calc(var(--mobile-nav-height) + 0.5rem) 3rem 3rem;

  @include respon(xl) {
    padding-top: calc(var(--desktop-nav-height) + 0.5rem);
  }
}

.main-layout {
  min-height: 100vh;
  background: #ffffff;

  @include respon(xl) {
    // min-height: unset;
  }
}

.footer-backward {
  @include respon(xl) {
    margin: 7rem -3rem -3rem;
  }
}
</style>
