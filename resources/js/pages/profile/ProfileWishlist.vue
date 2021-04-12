<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in wishlists" :key="project.id"
                   :data="project"
      />
      <p v-if="wishlists.length === 0" class="info__p">
        Show your interest towards some projects :)
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ProjectCard from '~/components/ProjectCard'

export default {
  name: 'UserProfileWishlistsPage',
  scrollToTop: false,

  components: { ProjectCard },

  metaInfo () { return { title: 'Profile Wishlists' } },

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
