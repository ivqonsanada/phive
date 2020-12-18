<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in projects" :key="`project-${project.id}`"
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
      user: 'auth/user',
      data: 'auth/data'
    }),

    projects () {
      if (this.user.role === 'Student') {
        return this.data.projects.map(e => e.project)
      }

      return this.data.projects
    }
  }
}
</script>
