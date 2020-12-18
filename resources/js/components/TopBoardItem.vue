<template>
  <div class="topboard-item" :class="{'topboard-item--home': !leaderboard}" @click="changeExpertise">
    <div>
      <div class="topboard-item__title--container">
        <span class="iconify topboard-item__title--icon" :data-icon="leader.icon" />
        <span class="topboard-item__title--name">{{ leader.title }}</span>
      </div>

      <div class="topboard-item__avatar--container">
        <div class="topboard-item__avatar--rank">
          #1
        </div>
        <img :src="data.user.avatar" alt="" class="topboard-item__avatar--img" height="108" width="108">
        <div class="topboard-item__avatar--points">
          {{ data.points }} Points
        </div>
      </div>

      <div class="topboard-item__identifier">
        <div class="topboard-item__identifier-name">
          {{ data.user.full_name }}
        </div>
        <div class="topboard-item__identifier-expertise">
          {{ data.expertise }}
        </div>
      </div>
    </div>

    <div>
      <div class="topboard-item__fact">
        <span class="iconify topboard-item__fact--icon" data-icon="ic:round-check-circle" />
        <span class="topboard-item__fact--name">{{ projectCount }} Project Finished</span>
      </div>
      <router-link :to="{ name: '@.info', params: { tagname: data.user.tagname } }" class="topboard-item__view-button" tag="button" :disabled="disabled">
        View Profile
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TopBoardItem',

  props: {
    data: { type: Object,
      default: function () {
        return { user: { avatar: '', tagname: 'initial' } }
      }
    },
    leader: { type: Object, default: null },
    disabled: { type: Boolean, default: true },
    leaderboard: { type: Boolean, default: false },
    expertise: { type: Number, default: null }
  },

  computed: {
    projectCount () {
      return this.data.user.finished_project ? this.data.user.finished_project.length : 0
    }
  },

  methods: {
    changeExpertise () {
      if (this.leaderboard) {
        this.$emit('click', this.expertise)
      }
    }
  }
}
</script>

<style>
</style>
