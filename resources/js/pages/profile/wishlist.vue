<template>
  <div>
    <div class="project--container">
      <template v-if="loading">
        <content-placeholders v-for="i in 4" :key="i" :rounded="true">
          <content-placeholders-img />
          <content-placeholders-heading />
        </content-placeholders>
      </template>
      <ProjectCard v-for="project in wishlists" :key="project.id"
                   :data="project"
      />
    </div>
  </div>
</template>

<script>
// import axios from 'axios'
import ProjectCard from '~/components/ProjectCard'

export default {
  components: {
    ProjectCard
  },

  props: {
    data: { type: Object, default: null }
  },

  metaInfo () {
    return { title: 'Settings' }
  },

  data: () => ({
    loading: true,
    wishlists: '',
    searchQuery: ''
  }),

  mounted () {
    this.getWishlist()
  },

  methods: {
    async getWishlist () {
      this.loading = false
      this.wishlists = this.$props.data.wishlists
    }
  }
}
</script>
