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
          <span class="iconify" data-icon="ic:round-block" width="20" height="20" />
          <span>Rejected</span>
        </div>

        <div v-if="$matchMedia.xl">
          <p class="project-box__item--p">
            You are rejected. Don't lose your hope, try another one!
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
        You are rejected. Don't lose your hope, try another one!
      </p>
    </div>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'ProjectBoxItemRejected',

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
    },

    async showCandidates () {
      this.$refs.candidatesList.openModal()
    },

    async cancelProjectInvitation (index) {
      const candidate = this.candidates.waitings[index]

      await axios.post('/api/projectbox/cancelProjectInvitation', {
        individual_applicant_id: candidate.id
      }).then(({ data }) => {
        console.log(data)
        this.candidates.waitings = this.candidates.waitings.filter(e => e.id !== candidate.id)
        this.candidates.total = this.candidates.waitings.length + this.candidates.bailouts.length + this.candidates.fixes.length
      })
    },

    async startProject () {
      if (this.role === 'Lecturer') {
        await axios.post('/api/projectbox/start', {
          project_id: this.data.project_id
        }).then(({ data }) => {
          this.$store.dispatch('notification/updateProjectBox', {
            projectBoxes: data.project_boxes
          })
        })
      }
    }
  }
}
</script>
