<template>
  <div class="main-layout">
    <navbar />

    <div class="container">
      <child />
    </div>
  </div>
</template>

<script>
import Navbar from '~/components/Navbar'

export default {
  name: 'MainLayout',

  components: {
    Navbar
  }
}
</script>

<style scoped>
.container {
  padding: 6rem 3rem 3rem
}

.main-layout {
  /* height: 100vh; */
  min-height: max-content;
  /* max-width: 1366px;
  margin: 0 auto;
  box-shadow: 0 2px 4px 0 rgba(0,0,0,.1); */
}
</style>
