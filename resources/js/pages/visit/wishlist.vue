<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in data.wishlists" :key="project.id"
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
    return { title: `${this.data.user.first_name} ${this.data.user.last_name} - Wishlists` }
  },

  data: () => ({
    loading: true,
    projects: ''
  }),

  computed: {
    ...mapGetters({
      data: 'visit/user'
    })
  }
}
</script>
