<template>
  <div class="profile--container">
    <div class="profile__info--container">
      <img class="profile__info--img" :src="user.avatar" alt="">
      <div class="profile__info--desc">
        <p class="profile__info--name">
          {{ user.full_name }}
        </p>
        <p v-if="!$matchMedia.xl" class="profile__info--occupation">
          {{ major }} <br>
          {{ user.university }} <br>
          {{ user.location }}
        </p>
        <p v-else class="profile__info--occupation">
          {{ major }} / {{ user.university }} <br>
          {{ user.location }}
        </p>
        <p class="profile__info--expertise">
          <span class="iconify" data-icon="fa-solid:paint-brush" width="15" height="10" /> {{ user.expertise }}
        </p>

        <div v-if="$matchMedia.xl" class="profile__info--buttons">
          <router-link :to="{ path: '/profile/edit' }" class="profile__info--edit-profile" tag="button">
            Edit Profile
          </router-link>
        </div>

        <p v-if="user.role === 'Student'" :class="userStatus.class">
          <span class="iconify profile__info--icon" data-icon="carbon:dot-mark" />
          <span>{{ userStatus.text }}</span>
        </p>
        <p v-else-if="user.role === 'Lecturer'" :class="userStatus.class">
          <span class="iconify profile__info--icon" data-icon="bi:shield-fill-check" />
          <span>{{ userStatus.text }}</span>
        </p>
      </div>
    </div>

    <router-link v-if="!$matchMedia.xl" :to="{ path: '/profile/edit' }" class="edit-profile__link">
      <div class="profile__info--edit-profile">
        Edit Profile
      </div>
    </router-link>

    <div v-if="!$matchMedia.xl" class="user__sub-menu--container">
      <router-link v-for="tab in tabs" :key="tab.route" :to="{ name: tab.route }" class="user__sub-menu--item" active-class="user__sub-menu--active">
        {{ tab.name }}
      </router-link>
    </div>

    <div v-if="$matchMedia.xl" class="user__sub-menu">
      <div class="user__sub-menu--left">
        <router-link v-for="tab in tabs" :key="tab.route" :to="{ name: tab.route }" class="user__sub-menu--item" active-class="user__sub-menu--active">
          {{ tab.name }}
        </router-link>
      </div>
      <!-- <div class="user__sub-menu--right">
        <div>filter</div>
        <div>time</div>
      </div> -->
    </div>

    <hr v-if="$matchMedia.xl" class="separator-short mt-2_5 mb-3">

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
  name: 'UserProfileIndex',

  middleware: ['auth'],

  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    tabs () {
      if (this.user.role === 'Student') {
        return [
          { name: 'Projects', route: 'profile.projects' },
          { name: 'Wishlist', route: 'profile.wishlist' },
          { name: 'Info', route: 'profile.info' }
        ]
      }

      return [
        { name: 'Projects', route: 'profile.projects' },
        { name: 'Info', route: 'profile.info' }
      ]
    },

    major () {
      if (this.user.role === 'Student') return this.user.major + ' Major'
      else return this.user.major
    },

    userStatus () {
      if (this.user.role === 'Student') {
        return {
          class: this.user.is_open_hired ? 'profile__info--available' : 'profile__info--unavailable',
          text: this.user.is_open_hired ? 'Available' : 'Unavailable' }
      }

      return { class: 'profile__info--verified', text: 'Verified' }
    }
  }
}
</script>

<style>

</style>
