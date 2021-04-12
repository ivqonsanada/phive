<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in projects" :key="project.id"
                   :data="project"
      />
      <p v-if="projects.length === 0" class="info__p">
        Let fill this page with some projects
      </p>
    </div>
  </div>
</template>

<script>
import ProjectCard from '~/components/ProjectCard'
import { mapGetters } from 'vuex'

export default {
  name: 'VisitedUserProjectsPage',
  scrollToTop: false,

  components: { ProjectCard },

  metaInfo () { return { title: `${this.data.user.full_name} - Projects` } },

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
