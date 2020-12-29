<template>
  <div class="">
    <h2 v-if="$matchMedia.xl" class="leaderboard__h1">
      Leaderboard
    </h2>

    <TopBoardList :leaderboard="true" :arrow="false" :data="topBoards" @change="changeExpertise" />

    <div class="leaderboard-body__container">
      <h2 v-if="$matchMedia.xl" class="leaderboard__h2">
        {{ title }}
      </h2>

      <div class="leaderboard-items__container">
        <LeaderboardItem v-for="e in currentExpertise" :key="`LeaderboardItem-${e.id}`" :data="e" />
      </div>
      <button v-if="loadMore.can" class="btn btn--blue mt-2 mx-auto" @click="doLoadMore">
        Load More
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import TopBoardList from '~/components/TopBoardList'
import LeaderboardItem from '~/components/LeaderboardItem'

export default {
  name: 'LeaderboardPage',

  components: { TopBoardList, LeaderboardItem },

  metaInfo () {
    return {
      title: 'Leaderboard',
      meta: [
        { name: 'description', content: 'PHive Leaderboard: Shows all the Top Student amongs expertises' }
      ]
    }
  },

  data: () => ({
    loadMore: { can: true, link: '' },
    topLeaderboards: {},
    topBoards: {},
    currentExpertise: {},
    expertise: 'UI/UX Designer'
  }),

  computed: {
    title () {
      if (this.expertise === 'UI/UX Designer') return 'Picasso'
      if (this.expertise === 'Frontend Engineer') return 'Front Row'
      if (this.expertise === 'Backend Engineer') return 'Mastermind'
      else return 'Snowden'
    }
  },

  mounted () {
    this.getData()
  },

  methods: {

    async getData () {
      await axios.get(`/api/leaderboards`)
        .then(({ data }) => {
          this.topBoards = {
            ui_ux_designer: data.top_boards.ui_ux_designer.data.shift(),
            frontend_engineer: data.top_boards.frontend_engineer.data.shift(),
            backend_engineer: data.top_boards.backend_engineer.data.shift(),
            data_expert: data.top_boards.data_expert.data.shift()
          }
          this.topLeaderboards = data.top_boards
          this.currentExpertise = this.topLeaderboards.ui_ux_designer.data

          if (!this.topLeaderboards.ui_ux_designer.next_page_url) this.loadMore.can = false
          else {
            this.loadMore.can = true
            this.loadMore.link = this.topLeaderboards.ui_ux_designer.next_page_url
          }
        })
    },

    async doLoadMore () {
      await axios.get(this.loadMore.link)
        .then(({ data }) => {
          this.topLeaderboards.ui_ux_designer.next_page_url = data.top_boards.ui_ux_designer.next_page_url
          this.topLeaderboards.frontend_engineer.next_page_url = data.top_boards.frontend_engineer.next_page_url
          this.topLeaderboards.backend_engineer.next_page_url = data.top_boards.backend_engineer.next_page_url
          this.topLeaderboards.data_expert.next_page_url = data.top_boards.data_expert.next_page_url

          if (this.expertise === 'UI/UX Designer') {
            if (!this.topLeaderboards.ui_ux_designer.next_page_url) this.loadMore.can = false
            else {
              this.loadMore.can = true
              this.loadMore.link = this.topLeaderboards.ui_ux_designer.next_page_url
            }
          } else if (this.expertise === 'Frontend Engineer') {
            if (!this.topLeaderboards.frontend_engineer.next_page_url) this.loadMore.can = false
            else {
              this.loadMore.can = true
              this.loadMore.link = this.topLeaderboards.frontend_engineer.next_page_url
            }
          } else if (this.expertise === 'Backend Engineer') {
            if (!this.topLeaderboards.backend_engineer.next_page_url) this.loadMore.can = false
            else {
              this.loadMore.can = true
              this.loadMore.link = this.topLeaderboards.backend_engineer.next_page_url
            }
          } else if (this.expertise === 'Data Expert') {
            if (!this.topLeaderboards.data_expert.next_page_url) this.loadMore.can = false
            else {
              this.loadMore.can = true
              this.loadMore.link = this.topLeaderboards.data_expert.next_page_url
            }
          }

          this.topLeaderboards.ui_ux_designer.data.push(...data.top_boards.ui_ux_designer.data)
          this.topLeaderboards.frontend_engineer.data.push(...data.top_boards.frontend_engineer.data)
          this.topLeaderboards.backend_engineer.data.push(...data.top_boards.backend_engineer.data)
          this.topLeaderboards.data_expert.data.push(...data.top_boards.data_expert.data)
        })
    },

    changeExpertise (e) {
      if (e === 0) {
        this.currentExpertise = this.topLeaderboards.ui_ux_designer.data
        this.expertise = this.topLeaderboards.ui_ux_designer.data[0].expertise
        if (!this.topLeaderboards.ui_ux_designer.next_page_url) this.loadMore.can = false
        else {
          this.loadMore.can = true
          this.loadMore.link = this.topLeaderboards.ui_ux_designer.next_page_url
        }
      } else if (e === 1) {
        this.currentExpertise = this.topLeaderboards.frontend_engineer.data
        this.expertise = this.topLeaderboards.frontend_engineer.data[0].expertise
        if (!this.topLeaderboards.frontend_engineer.next_page_url) this.loadMore.can = false
        else {
          this.loadMore.can = true
          this.loadMore.link = this.topLeaderboards.frontend_engineer.next_page_url
        }
      } else if (e === 2) {
        this.currentExpertise = this.topLeaderboards.backend_engineer.data
        this.expertise = this.topLeaderboards.backend_engineer.data[0].expertise
        if (!this.topLeaderboards.backend_engineer.next_page_url) this.loadMore.can = false
        else {
          this.loadMore.can = true
          this.loadMore.link = this.topLeaderboards.backend_engineer.next_page_url
        }
      } else if (e === 3) {
        this.currentExpertise = this.topLeaderboards.data_expert.data
        this.expertise = this.topLeaderboards.data_expert.data[0].expertise
        if (!this.topLeaderboards.data_expert.next_page_url) this.loadMore.can = false
        else {
          this.loadMore.can = true
          this.loadMore.link = this.topLeaderboards.data_expert.next_page_url
        }
      }
    }
  }
}
</script>
