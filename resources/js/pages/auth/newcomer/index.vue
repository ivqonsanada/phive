<template>
  <div class="newcomer__container">
    <div>
      <div class="top-img__1--container">
        <div class="top-img__1--background">
          <div class="top-img__1--logo" />
        </div>
      </div>
      <h2 class="newcomer__h2">
        Hello, {{ fullName }}
      </h2>

      <div class="stepper-wrap">
        <ul class="stepper">
          <li :class="{ active: page > 0 }">
            Biodata
          </li>
          <li :class="{ active: page > 1 }">
            Expertise <br> & <br> Experience
          </li>
          <li :class="{ active: page > 2 }">
            Get Ready!
          </li>
        </ul>
      </div>

      <div>
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>
      </div>
    </div>

    <div v-show="page > 2" class="newcomer__footer mt-3">
      <div><img src="/images/footer-logo-black.png" alt=""></div>
      <div>PHive, All Rights Reserved. &copy; 2020</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  middleware: 'auth',

  layout: 'wide',

  data: () => ({
    applicant_type: ''
  }),

  metaInfo () {
    return { title: 'Newcomer' }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    fullName () {
      return this.user.first_name + ' ' + this.user.last_name
    },

    page () {
      return this.$route.path.split('/')[2]
    }
  }
}
</script>
