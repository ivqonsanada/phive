<template>
  <div>
    <div class="inbox__info--container">
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

    <div class="inbox--top">
      <div class="inbox--top-left">
        <span class="iconify inbox--left-icon" data-icon="simple-icons:polymerproject" data-inline="true" /> <h2 class="inbox--heading">
          Project Box
        </h2>
      </div>
      <div><span class="iconify inbox--right-icon" data-icon="ic:round-filter-list" data-inline="true" /></div>
    </div>
    <div class="inbox--container">
      <ProjectBoxItem v-for="data in datas" :key="`project-box-${data.id}`" :data="data" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectBoxItem from '~/components/ProjectBoxItem.vue'

export default {

  components: {
    ProjectBoxItem
  },

  metaInfo () {
    return { title: 'Home' }
  },

  data: () => ({
    title: 'Home'
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    getFullName () {
      return this.user.first_name + ' ' + this.user.last_name
    },

    datas () {
      return [
        {
          id: 1,
          title: 'Redesign SIAM UB Website',
          isAccepted: true
        },
        {
          id: 2,
          title: 'SIAM UB Website Development',
          isAccepted: false
        },
        {
          id: 3,
          title: 'SIAM UB Data Development',
          isAccepted: false
        }
      ]
    }
  }
}
</script>

<style>
</style>
