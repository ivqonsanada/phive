<template>
  <div class="main-layout">
    <Navbar />

    <div class="main-container">
      <div class="container">
        <child />
      </div>

      <Footer />
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

<style scoped>
.container {
  padding: 6rem 3rem 3rem
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
