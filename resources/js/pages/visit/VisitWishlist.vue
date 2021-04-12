<template>
  <div>
    <div class="project--container">
      <ProjectCard v-for="project in data.wishlists" :key="`Wishlist-${project.id}`"
                   :data="project"
      />
      <p v-if="data.wishlists.length === 0" class="info__p">
        Show your interest towards some projects :)
      </p>
    </div>
  </div>
</template>

<script>
import ProjectCard from '~/components/ProjectCard'
import { mapGetters } from 'vuex'

export default {
  name: 'VisitedUserWishlistsPage',
  scrollToTop: false,

  components: { ProjectCard },

  metaInfo () { return { title: `${this.data.user.full_name} - Wishlists` } },

  computed: {
    ...mapGetters({
      data: 'visit/user'
    })
  }
}
</script>
