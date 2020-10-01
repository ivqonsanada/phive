<template>
  <div>
    <div class="top-img__1--container">
      <div class="top-img__1--background">
        <div class="top-img__1--logo" />
      </div>
    </div>

    <div>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>

export default {
  middleware: 'auth',

  data: () => ({
    applicant_type: ''
  }),

  metaInfo () {
    return { title: 'Apply' }
  },

  computed: {
    // ...mapGetters({
    //   user: 'auth/user'
    // })
  },

  mounted () {
    // this.getUserData()
  },

  methods: {
  }
}
</script>
