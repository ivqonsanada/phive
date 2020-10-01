<template>
  <div class="profile--container">
    <div class="profile__info--container">
      <img class="profile__info--img" :src="user.avatar" alt="">
      <div class="profile__info--desc">
        <p class="profile__info--name">
          {{ getFullName }}
        </p>
        <p class="profile__info--occupation">
          {{ user.major }}
          <template v-if="user.role === 'Student'">
            Major
          </template>
          <br>
          {{ user.university }} <br>
          {{ user.location }}
        </p>
        <p class="profile__info--expertise">
          <span class="iconify" data-icon="fa-solid:paint-brush" data-inline="true" width="15" height="10" /> {{ user.expertise }}
        </p>
        <p class="profile__info--available">
          <span class="iconify" data-icon="carbon:dot-mark" data-inline="true" width="15" height="15" />
          Available
        </p>
      </div>
    </div>

    <router-link :to="{ path: '/profile/edit' }" class="edit-profile__link">
      <div class="profile__info--edit-profile">
        Edit Profile
      </div>
    </router-link>

    <div class="user__sub-menu--container">
      <router-link v-for="tab in tabs" :key="`route-${tab.name}`" :to="{ name: tab.route }" class="profile__sub-menu--item" active-class="profile__sub-menu--active">
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
import { mapGetters } from 'vuex'

export default {
  middleware: 'auth',

  name: 'ProfileIndex',

  data: function () {
    return {

    }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    getFullName () {
      return this.user.first_name + ' ' + this.user.last_name
    },

    tabs () {
      if (this.user.role === 'Student') {
        return [
          {
            icon: 'user',
            name: 'Projects',
            route: 'profile.projects'
          },
          {
            icon: 'lock',
            name: 'Wishlist',
            route: 'profile.wishlist'
          },
          {
            icon: 'lock',
            name: 'Info',
            route: 'profile.info'
          }
        ]
      }

      return [
        {
          icon: 'user',
          name: 'Projects',
          route: 'profile.projects'
        },
        {
          icon: 'lock',
          name: 'Info',
          route: 'profile.info'
        }
      ]
    }
  },

  mounted () {

  },

  methods: {

  }

}
</script>

<style>

</style>
