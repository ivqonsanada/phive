<template>
  <div class="explore--container">
    <div class="explore__top--container">
      <h1 class="explore__top--h1">
        Explore for Your Projects
      </h1>
      <input v-model="searchQuery" type="search" class="explore__top--search" placeholder="Explore by projects or expertise role" @change="search">
    </div>

    <div class="explore__main--container">
      <h2 class="explore__main--h2">
        Available Projects
      </h2>
      <div>
        <label for="filter-search">
          <span class="iconify" data-icon="ic:round-filter-list" data-inline="false" />
        </label>
        <!-- <select id="filter-search" v-model="filter" class="form-group__input-select"
                placeholder="Select Expertise..."
        >
          <option value="UI/UX Designer">
            UI / UX Designer
          </option>
          <option value="Frontend Engineer">
            Frontend Engineer
          </option>
          <option value="Backend Engineer">
            Backend Engineer
          </option>
          <option value="Data Expert">
            Data Expert
          </option>
        </select> -->
      </div>
    </div>
    <div class="project--container">
      <template v-if="loading">
        <content-placeholders v-for="i in 8" :key="i" class="content-placeholders-container" :rounded="true">
          <content-placeholders-img />
          <content-placeholders-heading />
        </content-placeholders>
      </template>
      <ProjectCard v-for="project in projects" :key="project.id"
                   :data="project"
      />
    </div>
    <button v-if="canLoadMore" class="button__load-more" @click="loadMore">
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

  data () {
    return {
      loading: true,
      projects: '',
      searchQuery: '',
      page: 1,
      canLoadMore: true,
      filter: ''
    }
  },

  mounted () {
    this.getAll()
  },

  methods: {
    async search () {
      await axios.get('/api/projects/search/', {
        params: {
          query: this.searchQuery
        }
      })
        .then(response => {
          this.projects = response.data
        })
    },

    async getAll () {
      axios.get('/api/projects?page=' + this.page)
        .then(response => {
          this.loading = false
          this.projects = response.data.data
          this.page++
          if (response.data.next_page_url == null) this.canLoadMore = false
        })
    },

    async loadMore () {
      axios.get('/api/projects?page=' + this.page)
        .then(response => {
          this.projects.push(...response.data.data)
          this.page++
          if (response.data.next_page_url == null) this.canLoadMore = false
        })
    }
  },

  metaInfo () {
    return { title: 'Explorer' }
  }
}
</script>
