<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in projects" :key="`project-${project.id}`"
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
  name: 'UserProfileProjectsPage',
  scrollToTop: false,

  components: { ProjectCard },

  metaInfo () { return { title: 'Profile Projects' } },

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
