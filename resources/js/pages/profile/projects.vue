<template>
  <div>
    <div class="project--container">
      <template v-if="loading">
        <content-placeholders v-for="i in 4" :key="i" :rounded="true">
          <content-placeholders-img />
          <content-placeholders-heading />
        </content-placeholders>
      </template>
      <ProjectCard v-for="project in data.projects" :key="project.id"
                   :data="project"
      />
    </div>
  </div>
</template>

<script>
import ProjectCard from '~/components/ProjectCard'
import { mapGetters } from 'vuex'

export default {
  name: 'ProfileProjects',

  components: {
    ProjectCard
  },

  metaInfo () {
    return { title: 'Profile' }
  },

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapGetters({
      data: 'auth/data'
    })
  },

  mounted () {
    this.getProjects()
  },

  methods: {
    async getProjects () {
      this.loading = false
    }
  }
}
</script>
