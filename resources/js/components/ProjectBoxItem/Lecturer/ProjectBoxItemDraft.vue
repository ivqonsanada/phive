<template>
  <div>
    <div class="project-box__top-container">
      <img class="project-box__item--img" :src="data.project.thumbnail_url" width="100" height="100" alt="">
      <div class="project-box__item--container">
        <div>
          <span class="project-box__item--title">{{ data.project.title ? data.project.title : 'Not decided yet' }}</span>
        </div>

        <div class="project-box__item--lecture-statuses">
          <div class="project-box__item--status-lecturer">
            <span class="iconify" data-icon="ic:round-access-time" width="12" height="12" />
            <span>Not posted yet</span>
          </div>
          <div class="project-box__item--status-lecturer">
            <span class="project-box__item--lecturer-icon"><b>D</b></span>
            <span>Draft</span>
          </div>
        </div>

        <div v-if="$matchMedia.xl">
          <p class="mb-1_5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac, quis sit facilisis viverra aliquam netus nascetur quis risus. Sit ac donec suspendisse quis augue. Iaculis nunc morbi enim facilisis at. Et placerat viverra morbi est etiam turpis duis.
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
        <div class="project-box__item--button-group">
          <button class="btn btn--blue btn--small" :disabled="!data.project.title" @click="publishProject">
            Post Project
          </button>
          <button class="btn btn--decline btn--small" @click="cancelProject">
            Cancel Project
          </button>
        </div>
        <div class="nav-separator mt-1 mb-1" />
        <router-link :to="{ name: 'project.editpost', params: { id: data.project.project_url } }" class="btn  btn--small" :class="`${!data.project.title ? 'btn--blue' : 'btn--grey-2'}`" tag="button">
          Edit Project
        </router-link>
      </div>
    </div>

    <!-- Mobile User -->
    <div v-show="show && !$matchMedia.xl" class="mt-2">
      <p class="mb-1_5">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac, quis sit facilisis viverra aliquam netus nascetur quis risus. Sit ac donec suspendisse quis augue. Iaculis nunc morbi enim facilisis at. Et placerat viverra morbi est etiam turpis duis.
      </p>

      <div class="project-box__item--button-group">
        <button class="btn btn--blue btn--small" @click="publishProject">
          Post Project
        </button>
        <button class="btn btn--decline btn--small" @click="cancelProject">
          Cancel Project
        </button>
      </div>
      <div class="nav-separator mt-1 mb-1" />
      <router-link :to="{ name: 'project.editpost', params: { id: data.project.project_url } }" class="btn  btn--grey-2 btn--small" tag="button">
        Edit Project
      </router-link>
    </div>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'ProjectBoxItemDraft',

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
      user: 'auth/user',
      snackbar: 'notification/snackbar'
    }),

    rewards () {
      if (this.data.project.salary && this.data.project.certificate) return 'Earn Salary & Certificate'
      else if (this.data.project.salary) return 'Earn Salary'
      else if (this.data.project.certificate) return 'Earn Certificate'

      return ''
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

    const date = new Date(this.data.created_at)
    let options = { day: 'numeric', year: 'numeric', month: 'long' }
    this.date = date.toLocaleString('en-US', options)
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

    async showShortlist () {
      this.$router.push({ name: 'shortlist.individual', params: { id: this.data.project.project_url } })
    },

    async publishProject () {
      if (this.user.role === 'Lecturer') {
        await axios.post('/api/projectbox/' + this.data.project.project_url + '/publish').then(({ data }) => {
          this.snackbar.open(data.message)
          this.$store.dispatch('notification/updateProjectBox', {
            projectBoxes: data.project_boxes
          })
        })
      }
    },

    async cancelProject () {
      if (this.user.role === 'Lecturer') {
        await axios.post('/api/projectbox/' + this.data.project.project_url + '/cancel').then(({ data }) => {
          this.snackbar.open(data.message)
          this.$store.dispatch('notification/updateProjectBox', {
            projectBoxes: data.project_boxes
          })
        })
      }
    }
  }
}
</script>
