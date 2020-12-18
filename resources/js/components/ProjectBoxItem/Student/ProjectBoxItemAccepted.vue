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

        <div class="project-box__item--status" :class="color">
          <span class="iconify" data-icon="bi:shield-fill-check" width="20" height="20" />
          <span>Accepted</span>
        </div>

        <div v-if="$matchMedia.xl">
          <p class="project-box__item--p">
            You’re Accepted to join this project. Please send the confirmation message to PIC of the project if you’re agree on joining the project by clicking the <strong>"Agree to Join"</strong> button, you have 24 hours to make an agreement to the PIC. It will be change to rejected automatically within 24 hours if you don’t make a confirmation.
          </p>
        </div>

        <!-- Mobile User -->
        <div v-else class="project-box__details--container" @click="showDetails">
          <span class="project-box__item--details pointer">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" />
          </div>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="project-box__bottom-container">
        <button class="btn btn--small btn--blue" @click="confirmProject(true)">
          Agree to Join Project
        </button>
        <button class="btn btn--small btn--decline mt-1" @click="confirmProject(false)">
          Bail Out
        </button>
      </div>
    </div>

    <!-- Mobile User -->
    <div v-show="show && !$matchMedia.xl" class="mt-2">
      <p class="project-box__item--p">
        You’re Accepted to join this project. Please send the confirmation message to PIC of the project if you’re agree on joining the project by clicking the <strong>"Agree to Join"</strong> button, you have 24 hours to make an agreement to the PIC. It will be change to rejected automatically within 24 hours if you don’t make a confirmation.
      </p>
      <div>
        <button class="btn btn--small btn--blue" @click="confirmProject(true)">
          Agree to Join Project
        </button>
        <button class="btn btn--small btn--decline mt-1" @click="confirmProject(false)">
          Bail Out
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'ProjectBoxItemAccepted',

  middleware: ['auth'],

  props: {
    data: { type: Object, default: null }
  },

  data: () => ({
    date: '',
    show: false,
    form: new Form({
      isAgree: null
    }),
    candidates: {
      agree: 0,
      total: 0,
      waitings: [],
      bailouts: [],
      fixes: []
    }
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    }),

    status () {
      if (this.role === 'Student') {
        if (this.data.status === 'Waiting') return { icon: 'ant-design:field-time-outlined', text: 'Waiting' }
        if (this.data.status === 'Accepted') return { icon: 'bi:shield-fill-check', text: 'Accepted' }
        if (this.data.status === 'Rejected') return { icon: 'ic:round-block', text: 'Rejected' }
        if (this.data.status === 'Waiting to Start') return { icon: 'mdi-alpha-s-circle-outline', text: 'Waiting to Start' }
        if (this.data.status === 'Project Started') return { icon: 'mdi-alpha-s-circle-outline', text: 'Project Started' }
        if (this.data.status === 'Bail Out') return { icon: 'entypo:log-out', text: 'Bail Out' }
      }

      if (this.data.status === 'Hiring') return { icon: 'H', text: 'Hiring' }
      if (this.data.status === 'Ongoing') return { icon: 'O', text: 'Ongoing' }
      if (this.data.status === 'Confirmation') return { icon: 'C', text: 'Confirmation' }
      if (this.data.status === 'Draft') return { icon: 'D', text: 'Draft' }

      return {}
    },

    color () {
      if (this.data.status === 'Rejected') return 'project-box__item--status-red'
      return 'project-box__item--status-blue'
    },

    applicantsCount () {
      return this.data.project.individual_applicants_count
    },

    disableShortlist () {
      return this.candidates.waitings.length + this.candidates.fixes.length >= this.data.project.max_person
    }
  },

  mounted () {
    if (this.data.status === 'Confirmation') {
      this.candidates.waitings = this.data.project.individual_applicants.filter(e => e.status === 'Waiting')
      this.candidates.bailouts = this.data.project.individual_applicants.filter(e => e.status === 'Bail Out')
      this.candidates.fixes = this.data.project.individual_applicants.filter(e => e.status === 'Fixed')
      this.candidates.total = this.candidates.waitings.length + this.candidates.bailouts.length + this.candidates.fixes.length
      this.candidates.agree = this.candidates.fixes.length
    }

    if (this.role === 'Lecturer') {
      const date = new Date(this.data.created_at)
      let options = { day: 'numeric', year: 'numeric', month: 'long' }
      this.date = date.toLocaleString('en-US', options)
    }
  },

  methods: {
    async showDetails () {
      this.show = !this.show
    },

    async confirmProject (isAccepted) {
      if (isAccepted) this.form.isAgree = true
      else this.form.isAgree = false
      this.form.project_box_id = this.data.id

      await this.form.post('/api/projectbox/confirmation')
        .then(({ data }) => {
          this.snackbar.open(data.message)
          this.$store.dispatch('notification/updateProjectBox', {
            projectBoxes: data.project_boxes
          })
        })
        .catch(({ response }) => {
          this.snackbar.open(response.data.message)
          this.$store.dispatch('notification/updateProjectBox', {
            projectBoxes: response.data.project_boxes
          })
        })
    }
  }
}
</script>
