<template>
  <div class="newcomer__container">
    <div>
      <TopImage :type="2" />
      <h2 class="newcomer__h2">
        Hello, {{ user.full_name }}
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
  name: 'NewcomerIndex',
  layout: 'wide',
  middleware: 'auth',

  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    page () {
      return this.$route.path.split('/')[2]
    }
  }
}
</script>
