<template>
  <div class="">
    <TopBoardList />

    <div>
      <div>
        <span />
        <span />
      </div>

      <div>
        s
      </div>
      <button v-if="canLoadMore" class="button__load-more" @click="loadMore">
        Load More
      </button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import TopBoardList from '~/components/TopBoardList'

export default {
  components: {
    TopBoardList
  },

  metaInfo () {
    return { title: 'Home' }
  },

  data: () => ({
    title: 'Home',
    canLoadMore: true
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user'
    }),

    getFullName () {
      return this.user.first_name + ' ' + this.user.last_name
    }

  },

  methods: {

    loadMore () {

    }
  }
}
</script>

<style>

</style>
