<template>
  <div class="main-layout">
    <Navbar />

    <div class="main-container">
      <div class="container">
        <Child />
      </div>

      <Footer v-if="$matchMedia.xl" />
      <Footer v-else-if="$route.name === 'index'" />
    </div>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar'
import Footer from '~/components/Footer'

export default {
  name: 'MainLayout',

  components: {
    Navbar,
    Footer
  }
}
</script>

<style lang="scss" scoped>
@import './resources/sass/abstract/_mixins.scss';

.container {
  padding: calc(var(--mobile-nav-height) + 0.5rem) 3rem 3rem;

  @include respon(xl) {
    padding-top: calc(var(--desktop-nav-height) + 0.5rem);
  }
}

.main-layout {
  min-height: 100vh;
}

.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
