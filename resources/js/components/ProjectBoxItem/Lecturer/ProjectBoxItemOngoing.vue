<template>
  <div>
    <div class="project-box__top-container">
      <router-link :to="{ name: 'project.details', params: { id: data.project.project_url } }">
        <img class="project-box__item--img" :src="data.project.thumbnail_url" alt="">
      </router-link>
      <div class="project-box__item--container">
        <div>
          <span class="project-box__item--title">{{ data.project.title }}</span>
        </div>

        <div class="project-box__item--lecture-statuses">
          <div class="project-box__item--status-lecturer">
            <span class="iconify" data-icon="ic:round-access-time" width="12" height="12" />
            <span v-if="$matchMedia.sm" class="pre">Posted on </span> {{ date }}
          </div>
          <div class="project-box__item--status-lecturer">
            <span class="project-box__item--lecturer-icon"><b>O</b></span>
            <span>Ongoing</span>
          </div>
        </div>

        <div v-if="$matchMedia.xl">
          <p class="mb-1_5">
            {{ data.project.description }}
          </p>
        </div>
        <div v-else class="project-box__details--container" @click="showDetails">
          <span class="project-box__item--details pointer">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" />
          </div>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="project-box__bottom-container">
        <router-link :to="{ name: 'project.review', params: { id: data.project.project_url } }" class="btn btn--blue btn--small mb-1" tag="button">
          Review Project
        </router-link>
      </div>
    </div>

    <!-- Mobile User -->
    <div v-show="show && !$matchMedia.xl" class="mt-2">
      <p class="mb-1_5">
        {{ data.project.description }}
      </p>
      <div>
        <router-link :to="{ name: 'project.review', params: { id: data.project.project_url } }" class="btn btn--blue btn--small mb-1" tag="button">
          Review Project
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProjectBoxItemOngoing',

  middleware: ['auth'],

  props: {
    data: { type: Object, default: null }
  },

  data: () => ({
    date: '',
    show: false
  }),

  mounted () {
    const date = new Date(this.data.created_at)
    let options = { day: 'numeric', year: 'numeric', month: 'long' }
    this.date = date.toLocaleString('en-US', options)
  }

}
</script>
