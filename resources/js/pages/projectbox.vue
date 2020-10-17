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
        <template v-if="user.role === 'Student'">
          <p class="profile__info--available">
            <span class="iconify" data-icon="carbon:dot-mark" data-inline="true" width="15" height="15" />
            Available
          </p>
        </template>
        <template v-else-if="user.role === 'Lecturer'">
          <p class="profile__info--verified">
            <span class="iconify" data-icon="bi:shield-fill-check" data-inline="true" width="15" height="15" />
            Verified
          </p>
        </template>
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
      <ProjectBoxItem v-for="project in projects" :key="`project-box-${project.id}`" :data="project" :role="user.role" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectBoxItem from '~/components/ProjectBoxItem.vue'

export default {

  middleware: 'auth',

  components: {
    ProjectBoxItem
  },

  metaInfo () {
    return { title: 'Project Box' }
  },

  computed: {
    ...mapGetters({
      user: 'auth/user',
      projects: 'notification/projectbox'
    }),

    getFullName () {
      return this.user.first_name + ' ' + this.user.last_name
    }
  },

  mounted () {
    this.getProjectBox()
  },

  methods: {
    async getProjectBox () {
      this.$store.dispatch('notification/fetchProjectBox')
    }
  }
}
</script>

<style>
</style>
