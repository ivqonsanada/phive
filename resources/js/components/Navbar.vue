<template>
  <div class="nav">
    <div v-if="$matchMedia.xl" class="desktop-nav">
      <div class="flex-row desktop-nav__container">
        <div class="flex-row">
          <router-link :to="{ name: 'index' }">
            <img class="desktop-nav__logo" src="/images/logo-blue.svg" alt="">
          </router-link>

          <div class="desktop-nav__link--container">
            <router-link v-for="(menu, index) in leftMenu" :key="`LeftMenu-${index}`" :to="menu.route" class="desktop-nav__link " active-class="desktop-nav__active-link">
              <span>{{ menu.text }}</span>
            </router-link>
          </div>
        </div>
        <div class="desktop-nav__right">
          <!-- Authenticated -->

          <div v-if="user" class="flex-row desktop-nav__right-container">
            <div class="desktop-nav__right-icon">
              <router-link v-for="menu in rightMenu" :key="`RightMenu-${menu.icon}`" :to="menu.route" class="desktop-nav__link">
                <Icon :refs="menu.route" :icon="menu.icon" :width="20" :height="20" />
                <!-- <span class="iconify" :data-icon="menu.icon" width="20" height="20" /> -->
                <span class="tooltip">{{ menu.text }}</span>
              </router-link>

              <div class="desktop-nav__right-icon dropdown" :class="{ 'dropdown-hover': dropdown.state }" @mouseover="toggleDropdown(true)" @mouseleave="toggleDropdown(false)">
                <router-link :to="{ name: 'profile.projects' }" class="flex">
                  <img class="nav--profile-img" :src="user.avatar" alt="">
                </router-link>
                <div class="dropdown-content">
                  <div>
                    <router-link :to="{ name: 'profile.projects' }">
                      <b>{{ user.full_name }}</b>
                    </router-link>
                  </div>
                  <div class="nav-separator" />
                  <router-link :to="{ name: 'settings' }">
                    Settings
                  </router-link>
                  <div class="nav-separator" />
                  <button class="btn--clear btn-text--decline" @click="logout">
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!user">
          <div class="desktop-nav__right-container">
            <router-link :to="{ name: 'register' }" class="btn btn--link" tag="button">
              Create an Account
            </router-link>

            <router-link :to="{ name: 'login' }" class="btn btn--border btn--sign-in" tag="button">
              Sign In
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- for mobile -->
    <div v-else>
      <div class="nav-base">
        <button class="nav-toggler btn--clear flex" @click="openMenu">
          <span class="iconify" data-icon="ic:round-view-headline" width="24" height="24" />
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

      <div class="nav--overlay" :class="{ 'nav--overlay-open': menu.show, 'nav--overlay-close': menu.hide }" @click="closeMenu" />

      <nav v-touch:swipe.left="closeMenu" class="navbar" :class="{ 'nav--animate-open': menu.show, 'nav--animate-close': menu.hide }">
        <div class="navbar--menu-container">
          <div class="nav--top">
            <button class="nav-toggler btn--clear flex" @click="closeMenu">
              <span class="iconify" data-icon="entypo:chevron-left" width="24" height="24" />
            </button>

            <div class="nav--brand-container">
              <a class="nav-brand">
                <router-link :to="{ name: 'index' }">
                  <img src="/images/logo-blue.svg" alt="">
                </router-link>
              </a>
            </div>
            <div class="nav-stabilizer" />
          </div>

          <div v-if="user">
            <div class="nav--profile">
              <img class="nav--profile-img" :src="user.avatar" alt="">
              <div class="nav--profile-desc">
                <p class="nav--profile-name">
                  {{ user.full_name }}
                </p>
                <p class="nav--profile-expertise">
                  <span class="iconify" data-icon="fa-solid:paint-brush" width="10" height="10" />
                  <span>{{ user.expertise }}</span>
                </p>
                <p v-if="user.role === 'Student'" class="nav--profile-points">
                  {{ points }}
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
            <router-link v-for="(menu, index) in leftMenu" :key="`RightMenu-${index}`" :to="menu.route" class="nav-link" active-class="nav--active-link">
              <span class="iconify" :data-icon="menu.icon" width="20" height="20" />
              <span>{{ menu.text }} </span>
            </router-link>
          </div>

          <div class="nav-separator" />

          <!-- Authenticated -->
          <div v-show="user">
            <div class="nav-group">
              <router-link v-for="(menu, index) in rightMenu" :key="`RightMenu-${index}`" :to="menu.route" class="nav-link" active-class="nav--active-link">
                <span class="iconify" :data-icon="menu.icon" width="20" height="20" />
                <span>{{ menu.text }} </span>
              </router-link>
            </div>

            <div class="nav-separator" />

            <div class="nav-group">
              <router-link :to="{ name: 'settings' }" class="nav-link" active-class="nav--active-link">
                <span class="iconify" data-icon="eva:settings-fill" />
                <span>Settings</span>
              </router-link>

              <div class="dropdown-divider" />

              <button class="btn btn--decline mt-3" @click="logout">
                Logout
              </button>
            </div>
          </div>

          <div v-show="!user">
            <div class="nav-group mt-3">
              <router-link :to="{ name: 'login' }" class="btn btn--blue " tag="button">
                Sign In
              </router-link>

              <router-link :to="{ name: 'register' }" class="btn btn--white mt-1_5" tag="button">
                Create an Account
              </router-link>
            </div>
          </div>
        </div>
      </nav>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    appName: 'PHive',
    menu: { show: false, hide: false },
    photoUrl: 'https://www.gravatar.com/avatar/67104dea1ce9aef46682a4d8d145588c.jpg?s=200&d=mm',
    dropdown: { state: false, timeout: '' }
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      navTitle: 'navigation/title',
      overlay: 'navigation/overlay',
      snackbar: 'notification/snackbar'
    }),

    title () {
      if (this.$route.params.tagname) return this.navTitle
      if (this.$route.meta.title) return this.$route.meta.title
      else return null
    },

    points () {
      if (this.user && this.user.leaderboards) {
        return this.user.leaderboards.filter(e => e.expertise === this.user.expertise)[0].points + ' Points'
      }

      return 0
    },

    leftMenu () {
      return [
        { route: { name: 'explore' }, text: 'Explore', icon: 'eva:globe-2-fill' },
        { route: { name: 'leaderboard' }, text: 'Leaderboard', icon: 'gridicons:stats-up-alt' }
      ]
    },

    rightMenu () {
      if (this.user) {
        if (this.user.role === 'Lecturer') {
          return [
            { route: { name: 'project.post' }, text: 'Post Project', icon: 'ic:baseline-post-add' },
            { route: { name: 'inbox' }, text: 'Inbox', icon: 'ion:mail-unread-sharp' },
            { route: { name: 'projectbox' }, text: 'Project Box', icon: 'simple-icons:polymerproject' }
          ]
        }

        return [
          { route: { name: 'party.leader' }, text: 'Party', icon: 'carbon:3rd-party-connected' },
          { route: { name: 'inbox' }, text: 'Inbox', icon: 'ion:mail-unread-sharp' },
          { route: { name: 'projectbox' }, text: 'Project Box', icon: 'simple-icons:polymerproject' }
        ]
      }

      return [
        { route: { name: 'login' }, text: 'Sign In', icon: 'ic:baseline-post-add', class: '' },
        { route: { name: 'register' }, text: 'Create an Account', icon: 'ion:mail-unread-sharp', class: '' }
      ]
    }
  },

  watch: {
    $route (to, from) {
      if (this.menu.show) this.closeMenu()
    }
  },

  mounted () {
    if (this.user && this.user.new_notifications_count > 0) {
      this.$nextTick(function () {
        setTimeout(() => {
          document.querySelector('[d^="M374"]').style.color = 'red'
        }, 400)
      })
    }
  },

  methods: {
    openMenu () {
      this.menu.show = true
      this.menu.hide = false
    },

    closeMenu () {
      if (this.menu.show === false && this.menu.hide === false) {
      } else {
        this.menu.show = false
        this.menu.hide = true
      }
    },

    toggleDropdown (isHover) {
      if (isHover) {
        clearTimeout(this.dropdown.timeout)
        this.dropdown.state = true
      } else {
        this.dropdown.timeout = setTimeout(() => {
          this.dropdown.state = false
        }, 80)
      }
    },

    async logout () {
      await this.$store.dispatch('auth/logout')

      if (this.$route.path !== '/') this.$router.push({ name: 'index' })
    }

  }
}
</script>
