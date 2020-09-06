<template>
  <div class="profile--container">
    <div class="user__info--container">
      <img class="user__info--img" :src="data.user.avatar" alt="">
      <p class="user__info--name">
        {{ getFullName }}
      </p>
      <p class="user__info--occupation">
        {{ data.user.expertise }}
      </p>
    </div>

    <div class="user__action--container">
      <template v-if="data.user.role === 'Student'">
        <div class="action--invite-to-team">
          Invite To Team
        </div>
        <div class="action--direct-message">
          Direct Message
        </div>
      </template>
      <template v-else>
        <div class="action--invite-to-team">
          Contact Lecturer
        </div>
      </template>
    </div>

    <div class="user__sub-menu--container">
      <router-link v-for="tab in tabs" :key="tab.route" :to="{ name: tab.route }" class="user__sub-menu--item" active-class="user__sub-menu--active">
        {{ tab.name }}
      </router-link>
    </div>

    <div class="">
      <transition name="fade" mode="out-in">
        <router-view :data="data" />
      </transition>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  // middleware: 'guest',

  data: () => ({
    navtitle: ''
  }),

  computed: {
    getFullName () {
      return this.data.user.first_name + ' ' + this.data.user.last_name
    },

    ...mapGetters({
      data: 'visitedUser/data'
    }),

    tabs () {
      if (this.data.user.role === 'Student') {
        return [
          {
            icon: 'user',
            name: 'Projects',
            route: '@.projects'
          },
          {
            icon: 'lock',
            name: 'Wishlist',
            route: '@.wishlist'
          },
          {
            icon: 'lock',
            name: 'Info',
            route: '@.info'
          }
        ]
      }

      return [
        {
          icon: 'user',
          name: 'Projects',
          route: '@.projects'
        },
        {
          icon: 'lock',
          name: 'Info',
          route: '@.info'
        }
      ]
    }
  },

  mounted: function () {
    this.getUser()
  },

  methods: {
    async getUser () {
      await this.$store.dispatch('visitedUser/fetchVisitedUser', {
        tagname: this.$route.params.tagname
      })

      await this.$store.dispatch('navigation/changeTitle', {
        title: this.getFullName
      })
    }
  }

}
</script>

<style>

</style>
