<template>
  <div class="nav">
    <div class="nav-base">
      <div class="nav-toggler" @click="openMenu">
        <span class="iconify" data-icon="ic:round-view-headline" data-inline="true" width="24" height="24" />
      </div>

      <div class="nav--brand-container">
        <a class="nav-brand">
          <template v-if="title">
            {{ title }}
          </template>
          <template v-else>
            <img src="/images/logo-blue.svg" alt="">
          </template>
        </a>
      </div>

      <div class="nav-stabilizer" />
    </div>

    <div class="nav--overlay" :class="{ 'nav--overlay-open': showMenu, 'nav--overlay-close': hideMenu }" @click="closeMenu" />

    <nav class="navbar" :class="{ 'nav--animate-open': showMenu, 'nav--animate-close': hideMenu }">
      <div class="navbar--menu-container">
        <div class="nav--top">
          <div class="nav-toggler" @click="closeMenu">
            <span class="iconify" data-icon="entypo:chevron-left" data-inline="true" />
          </div>

          <div class="nav--brand-container">
            <a class="nav-brand">
              <img src="/images/logo-blue.svg" alt="">
            </a>
          </div>
          <div class="nav-stabilizer" />
        </div>

        <div v-if="user">
          <div class="nav--profile">
            <img class="nav--profile-img" :src="user.avatar" alt="">
            <div class="nav--profile-desc">
              <p class="nav--profile-name">
                {{ getFullName }}
              </p>
              <p class="nav--profile-expertise">
                <span class="iconify" data-icon="fa-solid:paint-brush" data-inline="true" width="10" height="10" /> {{ user.expertise }}
              </p>
              <p v-if="user.role === 'Student'" class="nav--profile-points">
                3500 Points
              </p>
            </div>
          </div>
          <router-link :to="{ name: 'profile.projects' }" class="nav--profile-link" active-class="nav--profile-link-active">
            View Profile
          </router-link>
        </div>
        <div v-else class="nav--profile-guest">
          <img class="nav--profile-img" :src="photoUrl" alt="">
          <p class="nav__profile--guest-desc">
            No Account Signed
          </p>
        </div>

        <div class="nav-separator" />

        <div class="nav-group">
          <router-link :to="{ name: 'explore' }" class="nav-link" active-class="nav--active-link">
            <span class="iconify" data-icon="eva:globe-2-fill" data-inline="true" width="20" height="20" /> Explore
          </router-link>
          <router-link :to="{ path: '/leaderboard' }" class="nav-link" active-class="nav--active-link">
            <span class="iconify" data-icon="gridicons:stats-up-alt" data-inline="true" width="20" height="20" /> Leaderboard
          </router-link>

          <template v-if="user">
            <router-link v-if="user.role == 'Student'" :to="{ path: '/quest' }" class="nav-link" active-class="nav--active-link">
              <span class="iconify" data-icon="el:star-alt" data-inline="true" width="20" height="20" /> Quest
            </router-link>
          </template>
        </div>

        <div class="nav-separator" />

        <!-- Authenticated -->
        <template v-if="user">
          <div class="nav-group">
            <router-link :to="{ path: '/inbox' }" class="nav-link" active-class="nav--active-link">
              <span class="iconify" data-icon="ion:mail-unread-sharp" data-inline="true" width="20" height="20" />
              Inbox
            </router-link>

            <router-link :to="{ path: '/box' }" class="nav-link" active-class="nav--active-link">
              <span class="iconify" data-icon="simple-icons:polymerproject" data-inline="true" width="20" height="20" />
              Project Box
            </router-link>

            <router-link v-if="user.role == 'Lecturer'" :to="{ name: 'project.post' }" class="nav-link" active-class="nav--active-link">
              <span class="iconify" data-icon="ic:baseline-post-add" data-inline="true" width="20" height="20" />
              Post Project
            </router-link>
          </div>

          <div class="nav-separator" />

          <div class="nav-group">
            <router-link :to="{ path: '/settings' }" class="nav-link" active-class="nav--active-link">
              <span class="iconify" data-icon="eva:settings-fill" data-inline="true" />
              Settings
            </router-link>

            <div class="dropdown-divider" />

            <a href="#" class="button-logout" @click.prevent="logout">
              Logout
            </a>
          </div>
        </template>
        <!-- Guest -->
        <template v-else>
          <div class="nav-group ">
            <router-link :to="{ name: 'login' }" class="link-login" active-class="nav--active-link">
              Login
            </router-link>

            <router-link :to="{ name: 'register' }" class="link-register" active-class="nav--active-link">
              Create Account
            </router-link>
          </div>
        </template>
      </div>
    </nav>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    appName: 'PHive',
    showMenu: false,
    hideMenu: false,
    photoUrl: ''
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      navTitle: 'navigation/title'
    }),

    getFullName () {
      return this.user.first_name + ' ' + this.user.last_name
    },

    title () {
      if (this.$route.params.tagname) return this.navTitle
      if (this.$route.meta.title) return this.$route.meta.title
      else return null
    }
  },

  watch: {
    $route (to, from) {
      if (this.showMenu) this.closeMenu()
    }
  },

  mounted: function () {
    this.photoUrl = 'https://www.gravatar.com/avatar/67104dea1ce9aef46682a4d8d145588c.jpg?s=200&d=mm'
  },

  methods: {
    openMenu: function () {
      this.showMenu = true
      this.hideMenu = false
    },

    closeMenu: function () {
      if (this.showMenu === false && this.hideMenu === false) {
      } else {
        this.showMenu = false
        this.hideMenu = true
      }
    },

    async logout () {
      await this.$store.dispatch('auth/logout')

      this.$router.push({ name: 'login' })
    }

  }
}
</script>

<style scoped>
  .profile-photo {
    width: 2rem;
    height: 2rem;
    margin: -.375rem 0;
  }
</style>
