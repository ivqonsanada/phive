<template>
  <div class="party__container">
    <h2 v-if="$matchMedia.xl" class="desktop-inbox__heading">
      Party
    </h2>
    <div class="party-body__container">
      <div class="party-info__container">
        <img class="inbox__info--img" :src="user.avatar" alt="">
        <div class="inbox__info--desc">
          <p class="inbox__info--name">
            {{ user.full_name }}
          </p>
          <p class="inbox__info--occupation">
            {{ user.major }}
            <!-- <span v-if="user.role === 'Student'">
              Major
            </span> -->
            <br>
            {{ user.university }} <br>
            {{ user.location }}
          </p>
          <p v-show="!$matchMedia.xl" class="inbox__info--expertise">
            <span class="iconify inbox__info--expertise-icon" data-icon="fa-solid:paint-brush" /> {{ user.expertise }}
          </p>
          <p v-show="$matchMedia.xl" class="inbox__info--expertise">
            {{ user.expertise }}
          </p>

          <p v-if="user.role === 'Student'" class="inbox__info--available">
            <span class="iconify inbox__info--expertise-icon" data-icon="carbon:dot-mark" />
            Available
          </p>

          <p v-else-if="user.role === 'Lecturer'" class="inbox__info--verified">
            <span class="iconify" data-icon="bi:shield-fill-check" width="15" height="15" />
            Verified
          </p>
        </div>
      </div>

      <div class="party-right__container flex-column">
        <transition name="fade" mode="out-in">
          <router-view />
        </transition>

        <div class="mt-auto">
          <button v-if="$matchMedia.xl" class="btn btn--blue mt-2" @click="changeAs">
            <span>Switch to {{ as.text }}</span>
          </button>
        </div>
      </div>
      <div class="mt-auto">
        <button v-if="!$matchMedia.xl" class="btn btn--blue mt-2" @click="changeAs">
          <span>Switch to {{ as.text }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PartyIndex',

  middleware: ['auth', 'student'],

  data: () => ({
    isLeader: true
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      inboxes: 'notification/inbox'
    }),

    as () {
      if (this.isLeader) return { route: 'party.member', text: 'Member' }
      else return { route: 'party.leader', text: 'Leader' }
    }
  },

  mounted () {
    this.getParty()

    if (this.$route.name === 'party.member') this.isLeader = false
  },

  methods: {
    async getParty () {
      this.$store.dispatch('auth/fetchUserParty')
    },

    changeAs () {
      if (this.$route.name !== this.as.route) this.$router.push({ name: this.as.route })
      this.isLeader = !this.isLeader
    }
  }
}
</script>
