<template>
  <div class="explore--container">
    <div class="explore__top--container">
      <h1 class="explore__top--h1">
        Explore for Your Projects
      </h1>

      <div class="explore__search--container">
        <div class="form-tag__group explore__search--form">
          <input
            v-if="$matchMedia.xl" v-model="query" type="search"
            class="form-tag__input"
            placeholder="Search by Project Titles"
            @keyup.enter="search"
          >
          <input
            v-else v-model="query" type="search"
            class="form-tag__input"
            placeholder="Explore by projects" @change="search"
          >
          <label for="form.user.tagname" class="form-tag"><span class="iconify" data-icon="ic:round-search" width="30" height="30" /></label>
        </div>
        <button v-if="$matchMedia.xl" v-debounce:600ms="search" :debounce-events="'click'" class="btn explore__search--button ml-1" :disabled="query.length === 0">
          Explore
        </button>
      </div>
    </div>

    <div class="explore__main--container">
      <h2 class="explore__main--h2">
        Available Projects
      </h2>
      <button class="btn--clear flex-center" @click="toggleFilter">
        <div class="icon">
          <span class="iconify" data-icon="ic:round-filter-list" height="24" width="24" />
          <span v-if="$matchMedia.xl">Filters</span>
        </div>
      </button>
    </div>

    <Modal v-if="!$matchMedia.xl" ref="filtersModal" :type="`small`">
      <template v-slot:header>
        <h4 class="post__modal--h4 my-0">
          Filters
        </h4>
      </template>

      <template v-slot:body>
        <div class="separator-short my-0 mb-2_5" />

        <div class="select select--small select--border mb-2">
          <select v-model="filters.selected.status" @change="filterProjects">
            <option disabled value="">
              Status Project:
            </option>
            <option v-for="status in filters.statuses" :key="`SelectStatus-${status.name}`">
              {{ status.name }}
            </option>
          </select>
          <span class="focus" />
        </div>

        <div class="checkbox-group--filters">
          <label v-for="expertise in filters.expertises" :key="`filter-${expertise.name}`" class="checkbox-container checkbox-container--post checkbox-container--filters space-between">{{ expertise.name }}
            <input v-model="expertise.isChecked" type="checkbox" @change="filterProjects">
            <span class="checkbox-checkmark " />
            <p class="text-bold">({{ expertise.count }})</p>
          </label>
        </div>

        <div class="select select--small select--border mt-2">
          <select v-model="filters.selected.reward" @change="filterProjects">
            <option disabled value="">
              Rewards:
            </option>
            <option v-for="reward in filters.rewards" :key="`SelectRewards-${reward.name}`">
              {{ reward.name }}
            </option>
          </select>
          <span class="focus" />
        </div>
      </template>

      <template v-slot:footer>
        <button class="btn btn--clear mx-auto" @click="clearFilter">
          Clear Filter
        </button>
      </template>
    </Modal>

    <div v-show="showFilter && $matchMedia.xl" class="explore--filter mb-1_5 ">
      <div class="flex-row space-between">
        <div class="select select--small select--border">
          <select v-model="filters.selected.status" @change="filterProjects">
            <option disabled value="">
              Status Project:
            </option>
            <option v-for="status in filters.statuses" :key="`SelectStatus-${status.name}`">
              {{ status.name }}
            </option>
          </select>
          <span class="focus" />
        </div>
        <div class="flex-row checkbox-group--filter">
          <div v-for="expertise in filters.expertises" :key="`filter-${expertise.name}`" class="checkbox-container pl-0">
            <input :id="`filter-${expertise.name}`" v-model="expertise.isChecked" type="checkbox" @change="filterProjects">
            <label :for="`filter-${expertise.name}`" class="checkbox-checkmark--filter">{{ expertise.name }}</label>
          </div>
        </div>
        <div class="select select--small select--border">
          <select v-model="filters.selected.reward" @change="filterProjects">
            <option disabled value="">
              Rewards:
            </option>
            <option v-for="reward in filters.rewards" :key="`SelectRewards-${reward.name}`">
              {{ reward.name }}
            </option>
          </select>
          <span class="focus" />
        </div>
      </div>
    </div>

    <div class="project--container">
      <template v-if="loading">
        <content-placeholders
          v-for="i in 9"
          :key="`placeholder-${i}`"
          class="content-placeholders-container"
          :rounded="true"
        >
          <content-placeholders-img />
          <content-placeholders-heading />
        </content-placeholders>
      </template>
      <ProjectCard v-for="(project) in projects" :key="`ProjectCard-${project.id}`" :data="project" />
      <p v-if="!loading && projects.length === 0" class="info__p">
        There are no projects with these criteria
      </p>
    </div>

    <button v-if="canLoadMore && projects.length !== 0" class="btn btn--blue btn__load-more" @click="loadMore">
      <span>Load More</span><span v-if="$matchMedia.xl">Projects</span>
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import ProjectCard from '~/components/ProjectCard'

export default {
  name: 'ExplorePage',

  components: { ProjectCard },

  metaInfo () {
    return {
      title: 'Explore',
      meta: [
        { name: 'description', content: 'PHive Explore: Search the latest posted projects for you to apply or peek up the best projects that have been finished.' }
      ]
    }
  },

  data: () => {
    return {
      loadMoreType: 'auto', // manual or auto
      debounceAutoMore: '',
      loading: true,
      beforeFilterProjects: [],
      projects: [],
      query: '',
      page: 1,
      canLoadMore: true,
      showFilter: false,
      filters: {
        expertises: [
          { name: 'UI/UX Designer', isChecked: false, count: 0, apiName: 'ui_ux_designer' },
          { name: 'Frontend Engineer', isChecked: false, count: 0, apiName: 'front_end_engineer' },
          { name: 'Backend Engineer', isChecked: false, count: 0, apiName: 'back_end_engineer' },
          { name: 'Data Expert', isChecked: false, count: 0, apiName: 'data_expert' }
        ],
        applicantTypes: [
          { name: 'Individual', count: 0, apiName: 'applicant_type' },
          { name: 'Team', count: 0, apiName: 'applicant_type' },
          { name: 'Individual & Team', count: 0, apiName: 'applicant_type' }
        ],
        rewards: [
          { name: 'Salary & Certificate', icount: 0 },
          { name: 'Certificate', count: 0, apiName: 'certificate' },
          { name: 'Salary', icount: 0, apiName: 'salary' }
        ],
        statuses: [
          { name: 'Hiring', count: 0 },
          { name: 'Ongoing', count: 0 },
          { name: 'Finished', count: 0 }
        ],
        selected: {
          applicantType: '',
          reward: '',
          status: ''
        }
      }

    }
  },

  mounted () {
    if (this.$route.query.query) {
      this.query = this.$route.query.query
      this.searchQuery()
    } else this.getAll()

    if (this.loadMoreType === 'auto') {
      let app = document.querySelector('html')
      this.debounceAutoMore = ''
      window.onscroll = () => {
        clearTimeout(this.debounceAutoMore)
        this.debounceAutoMore = setTimeout(() => {
          let nearBottom = app.scrollTop + 1200 > app.scrollHeight
          if (nearBottom && this.canLoadMore) this.loadMore()
        }, 300)
      }
    }
  },

  beforeDestroy  () {
    window.onscroll = null
    clearTimeout(this.debounceAutoMore)
  },

  methods: {

    async search () {
      if (this.query !== this.$route.query.search) {
        this.$router.push({ name: 'explore', query: { search: this.query } })
        this.page = 1
        this.searchQuery()
      }
    },

    async searchQuery () {
      await axios.get('/api/projects/search?page=' + this.page, {
        params: {
          query: this.query
        }
      })
        .then(response => {
          this.loading = false
          this.beforeFilterProjects = response.data.data
          this.orderProjects()
          this.projects = this.beforeFilterProjects
          this.page++
          this.filterProjects()
          if (response.data.next_page_url === null) this.canLoadMore = false
          else this.canLoadMore = true
        })
    },

    async getAll () {
      await axios.get('/api/projects?page=' + this.page)
        .then(response => {
          this.loading = false
          this.beforeFilterProjects = response.data.data
          this.orderProjects()
          this.projects = this.beforeFilterProjects
          this.page++
          this.filterProjects()
          if (response.data.next_page_url === null) this.canLoadMore = false
        })
    },

    async loadMore () {
      let api = ''

      if (this.$route.query) {
        api = `/api/projects/search?page=${this.page}&query=${this.query}`
      } else api = '/api/projects?page=' + this.page

      await axios.get(api)
        .then(response => {
          // this.projects.push(...response.data.data)
          this.beforeFilterProjects.push(...response.data.data)
          this.orderProjects()
          this.filterProjects()
          this.page++
          if (response.data.next_page_url === null) this.canLoadMore = false
        })
    },

    toggleFilter () {
      this.showFilter = !this.showFilter
      if (!this.$matchMedia.xl) this.$refs.filtersModal.openModal()
    },

    async filterProjects () {
      let filteredProjects = [...this.beforeFilterProjects]

      for (const i in this.filters.expertises) {
        if (this.filters.expertises[i].isChecked) {
          filteredProjects = filteredProjects.filter(project => project[this.filters.expertises[i].apiName] === true)
        }
      }

      if (this.filters.selected.reward === 'Salary & Certificate') {
        for (const reward of this.filters.rewards.slice(1)) {
          filteredProjects = filteredProjects.filter(project => project[reward.apiName] === true)
        }
      } else if (this.filters.selected.reward === 'Salary') {
        filteredProjects = filteredProjects.filter(project => project.salary === true)
      } else if (this.filters.selected.reward === 'Certificate') {
        filteredProjects = filteredProjects.filter(project => project.certificate === true)
      }

      if (this.filters.selected.status !== '') {
        filteredProjects = filteredProjects.filter(project => project.status === this.filters.selected.status)
      }

      this.projects = filteredProjects
      this.countProject()
    },

    clearFilter () {
      for (const i in this.filters.expertises) {
        this.filters.expertises[i].isChecked = false
      }

      this.filters.selected.reward = ''
      this.filters.selected.status = ''

      this.projects = [...this.beforeFilterProjects]
    },

    async countProject () {
      let counter = {
        expertises: [...this.filters.expertises]
      }

      for (let i in counter.expertises) counter.expertises[i].count = 0

      for (let project of this.projects) {
        if (project.ui_ux_designer) counter.expertises[0].count++
        if (project.front_end_engineer) counter.expertises[1].count++
        if (project.back_end_engineer) counter.expertises[2].count++
        if (project.data_expert) counter.expertises[3].count++
      }

      this.filters.expertises = counter.expertises
    },

    orderProjects () {
      const hiringProjects = this.beforeFilterProjects.filter(project => project.status === 'Hiring')
      const ongoingProjects = this.beforeFilterProjects.filter(project => project.status === 'Ongoing')
      const finishedProjects = this.beforeFilterProjects.filter(project => project.status === 'Finished')

      this.beforeFilterProjects = [...hiringProjects, ...ongoingProjects, ...finishedProjects]
    }
  }

}
</script>
