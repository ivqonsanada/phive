<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in wishlists" :key="project.id"
                   :data="project"
      />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import axios from 'axios'
import ProjectCard from '~/components/ProjectCard'

export default {
  components: {
    ProjectCard
  },

  metaInfo () {
    return { title: 'Wishlists' }
  },

  data: () => ({
    wishlists: '',
    searchQuery: ''
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      data: 'auth/data'
    })
  },

  mounted () {
    this.getWishlist()
  },

  methods: {
    async getWishlist () {
      this.wishlists = this.data.wishlists
    }
  }
}
</script>
