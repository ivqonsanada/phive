<template>
  <div>
    <div class="apply__top--container">
      <div class="edit-profile__top-decore">
        <div class="edit-profile__inside-top-decore" />
      </div>
    </div>

    <div>
      <transition name="fade" mode="out-in">
        <router-view :data="user" />
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  middleware: 'auth',

  data: () => ({
    applicant_type: ''
  }),

  metaInfo () {
    return { title: 'Apply' }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user'
    })
  },

  mounted () {
    // this.getUserData()
  },

  methods: {
    // async getUserData () {
    //   this.user = this.$props.user
    // }
  }
}
</script>
