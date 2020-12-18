<template>
  <div class="leaderboard__container">
    <div ref="leaderboardlist" class="lederboard-list_container">
      <div :style="{ 'min-width': `${dummyWidth}px` }" />
      <TopBoardItem :class="{ 'leaderboard-item--active': expertise === 0 }"
                    :user="top.designer" :leader="leader.designer"
      />
      <TopBoardItem :class="{ 'leaderboard-item--active': expertise === 1 }"
                    :user="top.frontend" :leader="leader.frontend"
      />
      <TopBoardItem :class="{ 'leaderboard-item--active': expertise === 2 }"
                    :user="top.backend" :leader="leader.backend"
      />
      <TopBoardItem :class="{ 'leaderboard-item--active': expertise === 3 }"
                    :user="top.data" :leader="leader.data"
      />
      <div :style="{ 'min-width': `${dummyWidth}px` }" />
    </div>

    <div class="leaderboard-list__nav--container">
      <button :class="{ invisible: expertise === 0 }" class="btn--clear leaderboard-list__nav" :style="{ 'right': `${navPos}px` }" @click="navigate('left')">
        <span class="iconify leaderboard-list__nav--item" data-icon="bi:arrow-left-short" data-inline="true" />
      </button>
      <button :class="{ invisible: expertise === 3 }" class="btn--clear leaderboard-list__nav" :style="{ 'left': `${navPos}px` }" @click="navigate('right')">
        <span class="iconify leaderboard-list__nav--item" data-icon="bi-arrow-right-short" data-inline="true" />
      </button>
    </div>
  </div>
</template>

<script>
import TopBoardItem from '~/components/TopBoardItem'

export default {
  name: 'TopBoardList',

  components: {
    TopBoardItem
  },

  metaInfo () {
    return { title: 'Leaderboard' }
  },

  data: () => ({
    expertise: 0,
    top: {
      designer: { 'id': 1, 'first_name': 'Verrel', 'last_name': 'Radiman', 'tagname': 'verrelradiman', 'expertise': 'UI / UX Designer', 'avatar': 'https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm' },
      frontend: { 'id': 1, 'first_name': 'Ivqonnada', 'last_name': 'Al Mufarrih', 'tagname': 'Ivqonnada1', 'expertise': 'Frontend Engineer', 'avatar': 'https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm' },
      backend: { 'id': 1, 'first_name': 'Ivqonnada', 'last_name': 'Al Mufarrih', 'tagname': 'Ivqonnada1', 'expertise': 'Backend Engineer', 'avatar': 'https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm' },
      data: { 'id': 1, 'first_name': 'Rangga', 'last_name': 'Aji Gumiwang', 'tagname': 'ajigumiwang', 'expertise': 'Data Expert', 'avatar': 'https://www.gravatar.com/avatar/7fc93cea09e4b8c225baac9b80875fab.jpg?s=200&d=mm' }
    },

    leader: {
      designer: {
        icon: 'whh:painting',
        title: 'Picasso'
      },
      frontend: {
        icon: 'bx:bx-code',
        title: 'Front Row'
      },
      backend: {
        icon: 'bx:bx-code-curly',
        title: 'Mastermind'
      },
      data: {
        icon: 'bx:bxs-data',
        title: 'Snowden'
      }
    },

    dummyWidth: (window.innerWidth - 255) / 2,
    navPos: (window.innerWidth / 2) - 50
  }),

  mounted () {
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize)
      window.addEventListener('scroll', this.onScroll)
    })
  },

  beforeDestroy () {
    window.removeEventListener('resize', this.onResize)
    window.removeEventListener('scroll', this.onScroll)
  },

  methods: {
    navigate (direction) {
      if (direction === 'left') this.expertise--
      else this.expertise++

      this.$refs.leaderboardlist.scrollLeft = this.expertise * 235
    },

    onResize () {
      this.dummyWidth = (window.innerWidth - 255) / 2
      this.navPos = (window.innerWidth / 2) - 50
    },

    onScroll () {
      console.log(this.$refs.leaderboardlist.scrollLeft)
    }
  }
}
</script>
