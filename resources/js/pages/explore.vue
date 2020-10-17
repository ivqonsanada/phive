<template>
  <div class="explore--container">
    <div class="explore__top--container">
      <h1 class="explore__top--h1">
        Explore for Your Projects
      </h1>
      <input
        v-model="query"
        type="search"
        class="explore__top--search"
        placeholder="Explore by projects or expertise role"
        @change="search"
      >
    </div>

    <div class="explore__main--container">
      <h2 class="explore__main--h2">
        Available Projects
      </h2>
      <button class="btn--clear flex-center" @click="toggleFilter">
        <span class="iconify" data-icon="ic:round-filter-list" data-inline="false" />
      </button>
    </div>

    <div v-show="showFilter" class="explore--filter mb-1_5 checkbox-group">
      <div v-for="filter in filters" :key="`filter-${filter.name}`" class="checkbox">
        <input :id="`filter-${filter.name}`" v-model="filter.isChecked" type="checkbox">
        <label :for="`filter-${filter.name}`">{{ filter.name }} ({{ filter.count }})</label>
      </div>

      <button class="" @click="filterProjects">
        Apply Filter
      </button>
      <button class="" @click="clearFilter">
        Clear Filter
      </button>
    </div>

    <div class="project--container">
      <template v-if="loading">
        <content-placeholders
          v-for="i in 8"
          :key="`placeholder-${i}`"
          class="content-placeholders-container"
          :rounded="true"
        >
          <content-placeholders-img />
          <content-placeholders-heading />
        </content-placeholders>
      </template>
      <ProjectCard v-for="project in projects" :key="`project-${project.id}`" :data="project" />
    </div>

    <button v-if="canLoadMore" class="btn btn--red mt-3" @click="loadMore">
      Load More
    </button>
  </div>
</template>

<script>
import axios from 'axios'
import ProjectCard from '~/components/ProjectCard'

export default {
  name: 'ExplorePage',

  components: {
    ProjectCard
  },

  data: () => {
    return {
      loading: true,
      beforeFilterProjects: '',
      projects: '',
      query: '',
      page: 1,
      canLoadMore: true,
      showFilter: false,
      filters: [
        {
          name: 'UI/UX Designer',
          isChecked: false,
          count: 0
        },
        {
          name: 'Frontend Engineer',
          isChecked: false,
          count: 0
        },
        {
          name: 'Backend Engineer',
          isChecked: false,
          count: 0
        },
        {
          name: 'Data Expert',
          isChecked: false,
          count: 0
        },
        {
          name: 'Individual',
          isChecked: false,
          count: 0
        },
        {
          name: 'Team',
          isChecked: false,
          count: 0
        },
        {
          name: 'Individual & Team',
          isChecked: false,
          count: 0
        },
        // {
        //   name: 'Salary',
        //   isChecked: false,
        //   count: 0
        // },
        {
          name: 'Certificate',
          isChecked: false,
          count: 0
        }
      ]
    }
  },

  mounted () {
    if (this.$route.query.query) {
      this.query = this.$route.query.query
      this.searchQuery()
    } else this.getAll()
  },

  methods: {
    async search () {
      this.$router.push({ name: 'explore', query: { search: this.query } })
      this.page = 1
      this.searchQuery()
    },

    async searchQuery () {
      await axios.get('/api/projects/search?page=' + this.page, {
        params: {
          query: this.query
        }
      })
        .then(response => {
          this.loading = false
          this.projects = response.data.data
          this.beforeFilterProjects = response.data.data
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
          this.projects = response.data.data
          this.beforeFilterProjects = response.data.data
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
          this.filterProjects()
          this.page++
          if (response.data.next_page_url === null) this.canLoadMore = false
        })
    },

    async toggleFilter () {
      this.showFilter = !this.showFilter
    },

    async filterProjects () {
      let filteredProjects = [...this.beforeFilterProjects]
      let expertise = [
        'ui_ux_designer',
        'front_end_engineer',
        'back_end_engineer',
        'data_expert',
        'applicant_type',
        'applicant_type',
        'applicant_type',
        'certificate'
      ]
      let mustBe = [1, 1, 1, 1, 'Individual', 'Team', 'Individual & Team', 1]

      for (let i in this.filters) {
        if (this.filters[i].isChecked) {
          filteredProjects = filteredProjects.filter(project => project[expertise[i]] == mustBe[i])
        }
      }

      this.projects = filteredProjects
      this.countProject()
    },

    async clearFilter () {
      for (let i in this.filters) {
        this.filters[i].isChecked = false
      }

      this.filterProjects()
    },

    async countProject () {
      let counter = [...this.filters]

      for (let i in counter) counter[i].count = 0

      for (let project of this.projects) {
        if (project.ui_ux_designer == 1) counter[0].count++
        if (project.front_end_engineer == 1) counter[1].count++
        if (project.back_end_engineer == 1) counter[2].count++
        if (project.data_expert == 1) counter[3].count++
        if (project.applicant_type === 'Individual') counter[4].count++
        else if (project.applicant_type === 'Team') counter[5].count++
        else if (project.applicant_type === 'Individual & Team') counter[6].count++
        if (project.certificate == 1) counter[7].count++
      }

      this.filters = counter
    }
  },

  metaInfo () {
    return { title: 'Explore' }
  }
}
</script>
