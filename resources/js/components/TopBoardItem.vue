<template>
  <div class="leaderboard-item">
    <div>
      <div class="leaderboard-item__title--container">
        <span class="iconify leaderboard-item__title--icon" :data-icon="leader.icon" data-inline="true" />
        <span class="leaderboard-item__title--name">{{ leader.title }}</span>
      </div>

      <div class="leaderboard-item__avatar--container">
        <div class="leaderboard-item__avatar--rank">
          #1
        </div>
        <img :src="user.avatar" alt="" class="leaderboard-item__avatar--img">
        <div class="leaderboard-item__avatar--points">
          21000 Points
        </div>
      </div>

      <div class="leaderboard-item__identifier">
        <div class="leaderboard-item__name">
          {{ user.first_name + ' ' + user.last_name }}
        </div>
        <div class="leaderboard-item__expertise">
          {{ user.expertise }}
        </div>
      </div>
      <div class="leaderboard-item__fact">
        <span class="iconify leaderboard-item__fact--icon" data-icon="ic:round-check-circle" data-inline="false" />
        <span class="leaderboard-item__fact--name">15 Project Finished</span>
      </div>
    </div>

    <router-link :to="{ name: '@.info', params: { tagname: user.tagname } }" class="leaderboard-item__view-button" tag="button">
      View Profile
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'TopBoardItem',

  props: {
    user: { type: Object, default: null },
    leader: { type: Object, default: null }
  },

  computed: {
    getFullName () {
      return this.user.first_name + ' ' + this.user.last_name
    }
  }
}
</script>

<style>
</style>
