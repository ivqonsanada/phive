<template>
  <div class="topboard__container">
    <div ref="topBoardList" v-touch:swipe="swipeTopLeaderboard" class="topboard-list_container" :class="{ 'topboard-list--showAll': showAll, 'topboard-list_container--leaderboard': leaderboard }">
      <div :class="{'none' : showAll}" :style="{ 'min-width': `${dummyWidth / 10}rem` }" />
      <TopBoardItem v-for="(e, index) in topBoards" :key="`TopBoardItem-${index}`" :class="isDisabled[index].class"
                    :data="e.data" :leader="leader[index]" :disabled="!isDisabled[index].active" :expertise="index" :leaderboard="leaderboard" @click="changeExpertise"
      />
      <div :class="{'none' : showAll}" :style="{ 'min-width': `${dummyWidth / 10}rem` }" />
    </div>

    <div v-if="arrow" class="topboard-list__nav--container">
      <button :class="{ invisible: expertise === 0 }" class="btn--clear topboard-list__nav" :style="{ 'right': `${navPos / 10}rem` }" @click="navigate('left')">
        <span class="iconify topboard-list__nav--item" data-icon="bi:arrow-left-short" />
      </button>
      <button :class="{ invisible: expertise === 3 }" class="btn--clear topboard-list__nav" :style="{ 'left': `${navPos / 10}rem` }" @click="navigate('right')">
        <span class="iconify topboard-list__nav--item" data-icon="bi-arrow-right-short" />
      </button>
    </div>
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import TopBoardItem from '~/components/TopBoardItem'

export default {
  name: 'TopBoardList',

  components: {
    TopBoardItem
  },

  props: {
    arrow: { type: Boolean, default: true },
    differ: { type: Boolean, default: true },
    showAll: { type: Boolean, default: false },
    data: { type: Object, default: null },
    leaderboard: { type: Boolean, default: false }
  },

  data: () => ({
    expertise: 0,
    leader: [
      { icon: 'whh:painting', title: 'Picasso' },
      { icon: 'bx:bx-code', title: 'Front Row' },
      { icon: 'bx:bx-code-curly', title: 'Mastermind' },
      { icon: 'bx:bxs-data', title: 'Snowden' }
    ],

    dummyWidth: '',
    navPos: ''
  }),

  computed: {
    isDisabled () {
      if (this.showAll) {
        return [
          { active: true, class: 'opacity-1' },
          { active: true, class: 'opacity-1' },
          { active: true, class: 'opacity-1' },
          { active: true, class: 'opacity-1' }
        ]
      }
      if (!this.differ) {
        return [
          { active: true, class: 'leaderboard-item--active' },
          { active: true, class: 'leaderboard-item--active' },
          { active: true, class: 'leaderboard-item--active' },
          { active: true, class: 'leaderboard-item--active' }
        ]
      }
      return [
        { active: this.expertise === 0, class: this.expertise === 0 ? 'leaderboard-item--active' : '' },
        { active: this.expertise === 1, class: this.expertise === 1 ? 'leaderboard-item--active' : '' },
        { active: this.expertise === 2, class: this.expertise === 2 ? 'leaderboard-item--active' : '' },
        { active: this.expertise === 3, class: this.expertise === 3 ? 'leaderboard-item--active' : '' }
      ]
    },

    topBoards () {
      return [
        { data: this.data.ui_ux_designer },
        { data: this.data.frontend_engineer },
        { data: this.data.backend_engineer },
        { data: this.data.data_expert }
      ]
    }
  },

  mounted () {
    this.onResize()

    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
    })
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
  },

  methods: {
    navigate (direction) {
      if (direction === 'left') this.expertise--
      else this.expertise++

      this.$refs.topBoardList.scrollLeft = this.expertise * 235
    },

    onResize () {
      const app = document.querySelector('html')

      this.dummyWidth = (app.scrollWidth - 235) / 2
      this.navPos = (app.scrollWidth / 2) - 50
    },

    swipeTopLeaderboard (direction) {
      if (!this.$matchMedia.xl) {
        let expertise = this.expertise
        if (direction === 'right' && expertise > 0) expertise--
        else if (direction === 'left' && expertise < 3) expertise++
        this.$refs.topBoardList.scrollLeft = expertise * 235

        // setTimeout(() => {
        this.expertise = expertise
        // }, 160)

        if (this.leaderboard) {
          this.$emit('change', this.expertise)
        }
      }
    },

    changeExpertise (e) {
      if (this.leaderboard && this.$matchMedia.xl) {
        this.expertise = e
        this.$emit('change', e)
      }
    }
  }
}
</script>
