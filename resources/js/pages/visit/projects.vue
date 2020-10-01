<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in projects" :key="project.id"
                   :data="project"
      />
    </div>
  </div>
</template>

<script>
import ProjectCard from '~/components/ProjectCard'
import { mapGetters } from 'vuex'

export default {
  components: {
    ProjectCard
  },

  metaInfo () {
    return { title: `${this.data.user.first_name} ${this.data.user.last_name} - Projects` }
  },

  data: () => ({
    loading: true
  }),

  computed: {
    ...mapGetters({
      data: 'visit/user'
    }),

    projects () {
      if (this.data.user.role === 'Student') {
        return this.data.projects.map(e => e.project)
      }

      return this.data.projects
    }
  }
}
</script>
