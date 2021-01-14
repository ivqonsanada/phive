<template>
  <div>
    <div class="project-box__top-container">
      <router-link :to="{ name: 'project.details', params: { id: data.project.project_url } }">
        <img class="project-box__item--img" :src="data.project.thumbnail_url">
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
            <span class="project-box__item--lecturer-icon"><b>C</b></span>
            <span>Confirmation</span>
          </div>
        </div>

        <div v-if="$matchMedia.xl">
          <p class="mb-1_5">
            {{ data.project.description }}
          </p>

          <div class="project-box__project-link pointer" @click="showCandidates">
            <span>{{ candidates.agree }}/{{ candidates.total }} Candidates Agree</span>
          </div>

          <Modal ref="candidatesList" :type="`small`">
            <template v-slot:header>
              <!-- <div class="shortlist-modal__stabilizier" /> -->
              <h4 class="candidates__modal--h4 my-0">
                Candidates
              </h4>
            </template>

            <template v-slot:body>
              <div class="">
                <p v-show="candidates.total === 0" class="info__p">
                  No candidates
                </p>

                <div v-show="candidates.fixes.length > 0" class="mb-3">
                  <h5 class="candidates__modal--h5">
                    Fixed
                  </h5>
                  <div class="">
                    <CandidateItem v-for="(candidate, index) in candidates.fixes" :key="`CandidateItemFixes-${index}`" :data="candidate" />
                  </div>
                </div>

                <div v-show="candidates.bailouts.length > 0" class="mb-3">
                  <h5 class="candidates__modal--h5">
                    Bail Out
                  </h5>
                  <div class="">
                    <CandidateItem v-for="(candidate, index) in candidates.bailouts" :key="`CandidateItemBailOut-${index}`" :data="candidate" />
                  </div>
                </div>

                <div v-show="candidates.waitings.length > 0" class="mb-3">
                  <h5 class="candidates__modal--h5">
                    Waiting
                  </h5>
                  <div class="candidates__list">
                    <CandidateItem v-for="(candidate, index) in candidates.waitings" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" @cancel="cancelProjectInvitation" />
                  </div>
                </div>

                <div v-show="candidates.team.waitings.length > 0" class="mb-3">
                  <h5 class="candidates__modal--h5">
                    Team - Waitings
                  </h5>
                  <div v-for="team in candidates.team.waitings" :key="`TeamItem-${team.id}`" class="candidates__list">
                    <CandidateItem v-for="(candidate, index) in team.applicant_team_members" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" :is-individual="false" @cancel="cancelProjectInvitation" />
                  </div>
                </div>

                <div v-show="candidates.team.bailouts.length > 0" class="mb-3">
                  <h5 class="candidates__modal--h5">
                    Team - Bail Out
                  </h5>
                  <div v-for="team in candidates.team.bailouts" :key="`TeamItem-${team.id}`" class="candidates__list">
                    <CandidateItem v-for="(candidate, index) in team.applicant_team_members" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" :is-individual="false" :is-responded="true" />
                  </div>
                </div>

                <div v-show="candidates.team.fixes.length > 0" class="mb-3">
                  <h5 class="candidates__modal--h5">
                    Team - Fixed
                  </h5>
                  <div v-for="team in candidates.team.fixes" :key="`TeamItem-${team.id}`" class="candidates__list">
                    <CandidateItem v-for="(candidate, index) in team.applicant_team_members" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" :is-individual="false" :is-responded="true" />
                  </div>
                </div>
              </div>
            </template>

            <template v-slot:footer>
              <button class="btn btn--blue ml-auto" :disabled="disableShortlist" @click="showShortlist">
                Shortlist Student
              </button>
            </template>
          </Modal>
        </div>
        <div v-else class="project-box__details--container" @click="showDetails">
          <span class="project-box__item--details pointer">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" />
          </div>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="project-box__bottom-container">
        <button class="btn btn--blue btn--small mb-1" @click="startProject">
          Start Project
        </button>
        <button class="btn btn--decline btn--small" @click="terminateProject">
          Terminate
        </button>
      </div>
    </div>

    <!-- Mobile User -->
    <div v-if="!$matchMedia.xl">
      <div v-show="show" class="mt-2">
        <p class="mb-1_5">
          {{ data.project.description }}
        </p>

        <div class="project-box__project-link pointer" @click="showCandidates">
          <span>{{ candidates.agree }}/{{ candidates.total }} Candidates Agree</span>
        </div>

        <modal ref="candidatesList">
          <template v-slot:header>
            <!-- <div class="shortlist-modal__stabilizier" /> -->
            <h4 class="candidates__modal--h4 my-0">
              Candidates
            </h4>
          </template>

          <template v-slot:body>
            <div class="">
              <div v-show="candidates.total === 0">
                <p class="info__p mb-2">
                  No candidates anymore
                </p>
              </div>

              <div v-show="candidates.waitings.length > 0" class="mb-3">
                <h5 class="candidates__modal--h5">
                  Waiting
                </h5>
                <div class="">
                  <CandidateItem v-for="(candidate, index) in candidates.waitings" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" @cancel="cancelProjectInvitation" />
                </div>
              </div>

              <div v-show="candidates.fixes.length > 0" class="mb-3">
                <h5 class="candidates__modal--h5">
                  Fixed
                </h5>
                <div class="">
                  <CandidateItem v-for="(candidate, index) in candidates.fixes" :key="`CandidateItemFixes-${index}`" :data="candidate" />
                </div>
              </div>

              <div v-show="candidates.bailouts.length > 0" class="mb-3">
                <h5 class="candidates__modal--h5">
                  Bail Out
                </h5>
                <div class="">
                  <CandidateItem v-for="(candidate, index) in candidates.bailouts" :key="`CandidateItemBailOut-${index}`" :data="candidate" />
                </div>
              </div>

              <div v-show="candidates.team.waitings.length > 0" class="mb-3">
                <h5 class="candidates__modal--h5">
                  Team - Waitings
                </h5>
                <div v-for="team in candidates.team.waitings" :key="`TeamItem-${team.id}`" class="candidates__list">
                  <CandidateItem v-for="(candidate, index) in team.applicant_team_members" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" :is-individual="false" @cancel="cancelProjectInvitation" />
                </div>
              </div>

              <div v-show="candidates.team.bailouts.length > 0" class="mb-3">
                <h5 class="candidates__modal--h5">
                  Team - Bail Out
                </h5>
                <div v-for="team in candidates.team.bailouts" :key="`TeamItem-${team.id}`" class="candidates__list">
                  <CandidateItem v-for="(candidate, index) in team.applicant_team_members" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" :is-individual="false" :is-responded="true" />
                </div>
              </div>

              <div v-show="candidates.team.fixes.length > 0" class="mb-3">
                <h5 class="candidates__modal--h5">
                  Team - Fixed
                </h5>
                <div v-for="team in candidates.team.fixes" :key="`TeamItem-${team.id}`" class="candidates__list">
                  <CandidateItem v-for="(candidate, index) in team.applicant_team_members" :key="`CandidateItemWaiting-${index}`" :data="candidate" :index="index" :is-individual="false" :is-responded="true" />
                </div>
              </div>
            </div>
          </template>

          <template v-slot:footer>
            <button class="btn btn--blue " :disabled="disableShortlist" @click="showShortlist">
              Shortlist Student
            </button>
          </template>
        </modal>

        <div>
          <button class="btn btn--blue btn--small mb-1" @click="startProject">
            Start Project
          </button>
          <!-- <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--decline btn--small" tag="button">
            Terminate
          </router-link> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'
import axios from 'axios'
import CandidateItem from '~/components/CandidateItem'

export default {
  name: 'ProjectBoxItemConfirmation',

  middleware: ['auth'],

  components: {
    CandidateItem
  },

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
      fixes: [],
      team: {
        waitings: [],
        bailouts: [],
        fixes: []
      }
    }
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    }),

    rewards () {
      if (this.data.project.salary && this.data.project.certificate) return 'Earn Salary & Certificate'
      else if (this.data.project.salary) return 'Earn Salary'
      else if (this.data.project.certificate) return 'Earn Certificate'

      return ''
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
      this.candidates.team.waitings = this.data.project.team_applicants.filter(e => e.status === 'Waiting')
      this.candidates.team.bailouts = this.data.project.team_applicants.filter(e => e.status === 'Bail Out')
      this.candidates.team.fixes = this.data.project.team_applicants.filter(e => e.status === 'Fixed')
      this.candidates.total = this.candidates.waitings.length + this.candidates.fixes.length + this.candidates.team.waitings.length + this.candidates.team.fixes.length
      this.candidates.agree = this.candidates.fixes.length + this.candidates.team.fixes.length
    }

    const date = new Date(this.data.created_at)
    let options = { day: 'numeric', year: 'numeric', month: 'long' }
    this.date = date.toLocaleString('en-US', options)
  },

  methods: {
    async showDetails () {
      this.show = !this.show
    },

    async showCandidates () {
      this.$refs.candidatesList.openModal()
    },

    async showShortlist () {
      this.$router.push({ name: 'shortlist.individual', params: { id: this.data.project.project_url } })
    },

    async cancelProjectInvitation (applicant) {
      if (applicant.type === 'Individual') {
        const candidate = this.candidates.waitings[applicant.index]

        await axios.post('/api/projectbox/cancelProjectInvitation', {
          individual_applicant_id: candidate.id
        }).then(({ data }) => {
          this.snackbar.open(data.message)
          this.candidates.waitings.splice(applicant.index, 1)
          this.candidates.total = this.candidates.waitings.length + this.candidates.fixes.length + this.candidates.team.waitings.length + this.candidates.team.fixes.length
          this.candidates.agree = this.candidates.fixes.length + this.candidates.team.fixes.length
        })
      } else {
        const candidate = this.candidates.team.waitings[applicant.index]

        await axios.post('/api/projectbox/cancelProjectInvitation', {
          team_applicant_id: candidate.id
        }).then(({ data }) => {
          this.snackbar.open(data.message)
          this.candidates.team.waitings.splice(applicant.index, 1)
          this.candidates.total = this.candidates.waitings.length + this.candidates.fixes.length + this.candidates.team.waitings.length + this.candidates.team.fixes.length
          this.candidates.agree = this.candidates.fixes.length + this.candidates.team.fixes.length
        })
      }
    },

    async startProject () {
      if ((this.candidates.agree !== this.candidates.total) || this.candidates.agree === 0) {
        this.snackbar.open('We need others consent before start the project. Or you can cancel who still not respond the invitations.')
      } else {
        await axios.post('/api/projectbox/start', {
          project_id: this.data.project_id
        }).then(({ data }) => {
          this.$store.dispatch('notification/updateProjectBox', {
            projectBoxes: data.project_boxes
          })
        })
      }
    },

    async terminateProject () {
      await axios.post('/api/projectbox/' + this.data.project.project_url + '/terminate').then(({ data }) => {
        this.$store.dispatch('notification/updateProjectBox', {
          projectBoxes: data.project_boxes
        })
        this.snackbar.open(data.message)
      })
    }
  }
}
</script>
