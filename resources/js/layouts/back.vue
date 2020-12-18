<template>
  <div class="main-layout">
    <div class="nav">
      <div class="nav-base">
        <button class="nav-toggler btn--clear" @click="back">
          <span class="iconify" data-icon="eva:arrow-back-fill" data-inline="true" width="24" height="24" />
        </button>

        <div class="nav--brand-container">
          <a class="nav-brand">
            <div v-show="title">
              {{ title }}
            </div>
            <div v-show="!title">
              <img src="/images/logo-blue.svg" alt="">
            </div>
          </a>
        </div>

        <div class="nav-stabilizer" />
      </div>
    </div>

    <div class="container">
      <child />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'MessageLayout',

  computed: {
    ...mapGetters({
      title: 'navigation/title'
    })
  },

  methods: {
    async back () {
      this.$router.back()
    }
  }
}
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  padding: 5.5rem 0 6.5rem 0;
  flex-direction: column-reverse;
}

.main-layout {
  min-height: 100vh;
  background: #F9F9F9;
}
</style>
