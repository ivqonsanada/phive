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
            <span v-if="$matchMedia.sm" class="pre">Posted on</span> {{ date }}
          </div>
          <div class="project-box__item--status-lecturer">
            <span class="project-box__item--lecturer-icon"><b>H</b></span>
            <span>Hiring</span>
          </div>
        </div>

        <div v-if="$matchMedia.xl">
          <p class="mb-1_5">
            {{ data.project.description }}
          </p>
          <div class="project-box__item--summaries mb-1_5">
            <div class="summary--item">
              <div class="project-box__item--icon">
                <span class="iconify project-box__item--icon" data-icon="fa-solid:dollar-sign" />
              </div>
              <span class="project-box__item--text">{{ rewards }}</span>
            </div>
            <div class="summary--item">
              <div class="project-box__item--icon">
                <span class="iconify project-box__item--icon " data-icon="ic:baseline-work" />
              </div>
              <span class="project-box__item--text">{{ applicantsCount }} Applicants</span>
            </div>
            <div class="summary--item">
              <div class="project-box__item--icon">
                <span class="iconify project-box__item--icon" data-icon="ri:team-fill" />
              </div>
              <span class="project-box__item--text">Max. {{ data.project.max_person }} Person</span>
            </div>
          </div>
        </div>
        <div v-else class="project-box__details--container" @click="showDetails">
          <span class="project-box__item--details pointer">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" />
          </div>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="project-box__bottom-container">
        <div class="project-box__item--button-group">
          <router-link :to="{ name: 'project.editpost', params: { id: data.project.project_url } }" class="btn btn--blue btn--small" tag="button">
            Edit Project
          </router-link>
          <button class="btn btn--decline btn--small" @click="endApplication">
            End Application
          </button>
        </div>
        <div class="nav-separator mt-1 mb-1" />
        <router-link :to="{ name: 'shortlist.individual', params: { id: data.project.project_url } }" class="btn btn--grey-2 btn--small" tag="button">
          Shortlist Students
        </router-link>
      </div>
    </div>

    <!-- Mobile User -->
    <div v-if="!$matchMedia.xl">
      <div v-show="show" class="mt-2">
        <p class="mb-1_5">
          {{ data.project.description }}
        </p>
        <div class="project-box__item--summaries mb-1_5">
          <div class="summary--item">
            <div class="project-box__item--icon">
              <span class="iconify project-box__item--icon " data-icon="ic:baseline-work" />
            </div>
            <span class="project-box__item--text">{{ applicantsCount }} Applicants</span>
          </div>
          <div class="summary--item">
            <div class="project-box__item--icon">
              <span class="iconify project-box__item--icon" data-icon="ri:team-fill" />
            </div>
            <span class="project-box__item--text">Max. {{ data.project.max_person }} Person</span>
          </div>
        </div>

        <div class="project-box__item--button-group">
          <router-link :to="{ name: 'project.editpost', params: { id: data.project.project_url } }" class="btn btn--blue btn--small" tag="button">
            Edit Project
          </router-link>
          <button class="btn btn--decline btn--small" @click="endApplication">
            End Application
          </button>
        </div>
        <div class="nav-separator mt-1 mb-1" />
        <router-link :to="{ name: 'shortlist.individual', params: { id: data.project.project_url } }" class="btn btn--grey-2 btn--small" tag="button">
          Shortlist Students
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'ProjectBoxItemHiring',

  middleware: ['auth'],

  props: {
    data: { type: Object, default: null }
  },

  data: () => ({
    date: '',
    show: false
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    }),

    rewards () {
      if (this.data.project.salary && this.data.project.certificate) return 'Earn Salary & Certificate'
      else if (this.data.project.salary) return 'Earn Salary'
      else if (this.data.project.certificate) return 'Earn Certificate'

      return 'Not Specified'
    },

    applicantsCount () {
      return Number(this.data.project.individual_applicants_count) + Number(this.data.project.team_applicants_count)
    }
  },

  mounted () {
    const date = new Date(this.data.created_at)
    let options = { day: 'numeric', year: 'numeric', month: 'long' }
    this.date = date.toLocaleString('en-US', options)
  },

  methods: {
    async showDetails () {
      this.show = !this.show
    },

    async endApplication () {
      await axios.post('/api/projectbox/' + this.data.project.project_url + '/endapplication').then(({ data }) => {
        this.data.project.is_open_hiring = false
        this.$store.dispatch('notification/updateProjectBox', {
          projectBoxes: data.project_boxes
        })
        this.snackbar.open(data.message)
      })
    }
  }
}
</script>
