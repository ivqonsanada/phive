<template>
  <div class="profile--container">
    <div class="user__info--container">
      <img class="user__info--img" :src="data.user.avatar" alt="">
      <p class="user__info--name">
        {{ fullName }}
      </p>
      <p class="user__info--occupation">
        {{ data.user.expertise }}
      </p>
    </div>

    <div class="user__action--container">
      <template v-if="data.user.role === 'Student'">
        <button class="btn--clear action--invite-to-team" @click="inviteToTeam">
          <template v-if="user && user.role === 'Lecturer'">
            Invite To Project
          </template>
          <template v-else>
            Invite To Team
          </template>
        </button>
        <router-link :to="{ name: 'message', params: { tagname: this.$route.params.tagname } }" class="action--direct-message" tag="button">
          Direct Message
        </router-link>
      </template>
      <template v-else>
        <router-link :to="{ name: 'message', params: { tagname: this.$route.params.tagname } }" class="action--invite-to-team" tag="button">
          Contact Lecturer
        </router-link>
      </template>
    </div>

    <div class="user__sub-menu--container">
      <router-link v-for="tab in tabs" :key="tab.route" :to="{ name: tab.route }" class="user__sub-menu--item" active-class="user__sub-menu--active">
        {{ tab.name }}
      </router-link>
    </div>

    <div class="">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  // middleware: 'guest',

  computed: {
    ...mapGetters({
      user: 'auth/user',
      data: 'visit/user',
      snackbar: 'notification/snackbar'
    }),

    fullName () {
      return this.data.user.first_name + ' ' + this.data.user.last_name
    },

    tabs () {
      if (this.data.user.role === 'Student') {
        return [
          {
            name: 'Projects',
            route: '@.projects'
          },
          {
            name: 'Wishlist',
            route: '@.wishlist'
          },
          {
            name: 'Info',
            route: '@.info'
          }
        ]
      }

      return [
        {
          name: 'Projects',
          route: '@.projects'
        },
        {
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
      await this.$store.dispatch('visit/fetchVisitedUser', {
        tagname: this.$route.params.tagname
      })

      this.changeTitle()
    },

    async changeTitle () {
      this.$store.dispatch('navigation/changeTitle', {
        title: this.fullName
      })
    },

    async inviteToTeam () {
      if (this.user) {
        if (this.user.role === 'Student') {
          axios.post(`/api/user/${this.data.user.tagname}/invite/team`)
            .then(({ data }) => {
              this.snackbar.info(data.message)
              console.log(data)
            })
        } else {
          axios.post(`/api/user/${this.data.user.tagname}/invite/project`)
            .then(({ data }) => {
              this.snackbar.info(data.message)
              console.log(data)
            })
        }
      } else {
        this.$router.push({ name: 'login' })
      }
    }
  }

}
</script>
