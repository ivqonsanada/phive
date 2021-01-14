<template>
  <div class="leaderboard-item__container">
    <div class="leaderboard-item__left-container">
      <router-link :to="{ name: '@.info', params: { tagname: data.user.tagname } }">
        <img class="leaderboard-item__img" :src="data.user.avatar" alt="">
      </router-link>
      <div class="leaderboard-item__body">
        <div class="leaderboard-item__body-top">
          <div class="leaderboard-item__name">
            {{ data.user.full_name }}
          </div>
          <div class="leaderboard-item__expertise">
            {{ data.expertise }}
          </div>
        </div>

        <div class="leaderboard-item__stat">
          <span class="iconify leaderboard-item__stat-icon" data-icon="ic:round-check-circle" />
          <span class="leaderboard-item__stat-text">{{ projectCount }} Project Finished</span>
        </div>
      </div>
    </div>
    <div class="leaderboard-item__points-container">
      <span class="leaderboard-item__points--number">{{ points }}</span>
      <span class="leaderboard-item__points--text">Points</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeaderboardItem',

  props: {
    data: { type: Object, default: null }
  },

  data: () => ({

  }),

  computed: {
    points () {
      return (this.data.points / 1000).toFixed(0) + 'K'
    },

    projectCount () {
      return this.data.user.finished_project ? this.data.user.finished_project.length : 0
    }
  },

  methods: {

  }
}
</script>

<style scoped>

</style>
