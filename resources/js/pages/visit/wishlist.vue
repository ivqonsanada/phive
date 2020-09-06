<template>
  <div>
    <div class="project--container">
      <template v-if="loading">
        <content-placeholders v-for="i in 4" :key="i" :rounded="true">
          <content-placeholders-img />
          <content-placeholders-heading />
        </content-placeholders>
      </template>
      <ProjectCard v-for="project in projects" :key="project.id"
                   :data="project"
      />
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ProjectCard from '~/components/ProjectCard'

export default {
  components: {
    ProjectCard
  },

  metaInfo () {
    return { title: 'Settings' }
  },

  data: () => ({
    loading: true,
    projects: '',
    searchQuery: ''
  }),

  mounted () {
    this.getWishlist()
  },

  methods: {
    async getWishlist () {
      this.loading = false
      this.projects = JSON.parse(localStorage.getItem('visitedUser')).projects
      // console.log(JSON.parse(localStorage.getItem('visitedUser')).wishlists)
      // this.loading = false
    }
  }
}
</script>
