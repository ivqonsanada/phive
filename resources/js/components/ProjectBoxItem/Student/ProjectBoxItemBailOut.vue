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

        <div class="project-box__item--status project-box__item--status-red">
          <span class="iconify" data-icon="bx:bx-log-out-circle" width="20" height="20" />
          <span>Bail Out</span>
        </div>

        <div v-if="$matchMedia.xl">
          <p class="project-box__item--p">
            You were chose to Bail Out the project invitation.
          </p>
        </div>
        <div v-else class="project-box__details--container" @click="showDetails">
          <span class="project-box__item--details pointer">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" />
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile User -->
    <div v-show="show && !$matchMedia.xl" class="mt-2">
      <p class="project-box__item--p">
        You were chose to Bail Out the project invitation.
      </p>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectBoxItemBailOut',

  middleware: ['auth'],

  props: {
    data: { type: Object, default: null }
  },

  data: () => ({
    show: false
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    })
  },

  methods: {
    async showDetails () {
      this.show = !this.show
    }
  }
}
</script>
