<template>
  <div>
    <ProjectDetailsHiring v-if="project.status === 'Hiring'" />
    <ProjectDetailsOngoing v-else-if="project.status === 'Ongoing'" />
    <ProjectDetailsFinished v-else-if="project.status === 'Finished'" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectDetailsHiring from '~/components/ProjectDetails/ProjectDetailsHiring'
import ProjectDetailsOngoing from '~/components/ProjectDetails/ProjectDetailsOngoing'
import ProjectDetailsFinished from '~/components/ProjectDetails/ProjectDetailsFinished'

export default {
  name: 'ProjectDetailsPage',

  components: { ProjectDetailsHiring, ProjectDetailsOngoing, ProjectDetailsFinished },

  metaInfo () { return { title: this.project.title } },

  computed: {
    ...mapGetters({
      project: 'visit/project'
    })
  },

  mounted () {
    this.getDetails()
  },

  methods: {
    async getDetails () {
      await this.$store.dispatch('visit/fetchVisitedProject', {
        id: this.$route.params.id
      })
    }
  }

}
</script>
