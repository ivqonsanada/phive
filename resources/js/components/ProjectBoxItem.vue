<template>
  <div class="project-box__container">
    <div class="project-box__top-container">
      <img class="project-box__item--img" :src="`https://placeimg.com/640/360/tech/${data.id}`" alt="">
      <div class="project-box__item--container">
        <span class="project-box__item--title">{{ data.project.title }}</span>
        <template v-if="role === 'Lecturer'">
          <div class="project-box__item--lecture-statuses">
            <div class="project-box__item--status-lecturer">
              <span class="iconify" data-icon="ic:round-access-time" data-inline="true" width="12" height="12" />
              <span>Posted on 25 June 2020</span>
            </div>
            <div class="project-box__item--status-lecturer">
              <span class="project-box__item--lecturer-icon"><b>{{ status.icon }}</b></span>
              <span>{{ status.text }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="role === 'Student'">
          <div class="project-box__item--status" :class="color">
            <span class="iconify" :data-icon="status.icon" data-inline="true" width="20" height="20" />
            <span>{{ status.text }}</span>
          </div>
        </template>
        <div class="project-box__details--container" @click="showDetails">
          <span class="project-box__item--details pointer">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" data-inline="true" />
          </div>
        </div>
      </div>
    </div>
    <div v-show="show" class="project-box__bottom-container">
      <!-- Student -->
      <template v-if="role === 'Student'">
        <template v-if="data.status === 'Accepted'">
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
        </template>
        <template v-else-if="data.status === 'Rejected'">
          <p>You are rejected. Don't lose your hope, try another one!</p>
        </template>
        <template v-else-if="data.status === 'Waiting to Start'">
          <p>You have been shortlisted, the system will automatically accept you once the lecturer agree to start the project.</p>
        </template>
        <template v-else-if="data.status === 'Project Started'">
          <p class="mb-1_5">
            All have been set. Are you ready to start your project? Let’s hoop in and start working on the project!
          </p>
          <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--blue" tag="button">
            Start Project
          </router-link>
        </template>
      </template>

      <!-- Lecturer -->
      <template v-else-if="role === 'Lecturer'">
        <template v-if="data.status === 'Hiring'">
          <p class="mb-1_5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac, quis sit facilisis viverra aliquam netus nascetur quis risus. Sit ac donec suspendisse quis augue. Iaculis nunc morbi enim facilisis at. Et placerat viverra morbi est etiam turpis duis.
          </p>
          <div class="project-box__item--summaries mb-1_5">
            <div class="summary--item">
              <div class="project-box__item--icon">
                <span class="iconify project-box__item--icon " data-icon="ic:baseline-work" data-inline="true" />
              </div>
              <span class="project-box__item--text">10 Total Applicants</span>
            </div>
            <div class="summary--item">
              <div class="project-box__item--icon">
                <span class="iconify project-box__item--icon" data-icon="ri:team-fill" data-inline="true" />
              </div>
              <span class="project-box__item--text">Max. {{ data.project.max_person }} Person</span>
            </div>
          </div>

          <div class="project-box__item--button-group">
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--blue btn--small" tag="button">
              Edit Project
            </router-link>
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--decline btn--small" tag="button">
              End Application
            </router-link>
          </div>
          <div class="nav-separator mt-1 mb-1" />
          <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--grey-2 btn--small" tag="button">
            Shortlist Students
          </router-link>
        </template>
        <template v-else-if="data.status === 'Ongoing'">
          <p class="mb-1_5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac, quis sit facilisis viverra aliquam netus nascetur quis risus. Sit ac donec suspendisse quis augue. Iaculis nunc morbi enim facilisis at. Et placerat viverra morbi est etiam turpis duis.
          </p>
          <div>
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--blue btn--small mb-1" tag="button">
              Review Project
            </router-link>
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--decline btn--small" tag="button">
              Finish Project
            </router-link>
          </div>
        </template>
        <template v-else-if="data.status === 'Confirmation'">
          <p class="mb-1_5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac, quis sit facilisis viverra aliquam netus nascetur quis risus. Sit ac donec suspendisse quis augue. Iaculis nunc morbi enim facilisis at. Et placerat viverra morbi est etiam turpis duis.
          </p>
          <div>
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--blue" tag="button">
              Start Project
            </router-link>
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--blue" tag="button">
              Terminate
            </router-link>
          </div>
        </template>
        <template v-else-if="data.status === 'Draft'">
          <p class="mb-1_5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ac, quis sit facilisis viverra aliquam netus nascetur quis risus. Sit ac donec suspendisse quis augue. Iaculis nunc morbi enim facilisis at. Et placerat viverra morbi est etiam turpis duis.
          </p>
          <div>
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--blue btn--small mb-1" tag="button">
              Publish Project
            </router-link>
            <router-link :to="{ name: 'project.dashboard', params: { id: 1 } }" class="btn btn--decline btn--small" tag="button">
              Delete Project
            </router-link>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  name: 'ProjectBoxItem',

  props: {
    data: { type: Object, default: null },
    role: { type: String, default: null }
  },

  data: () => ({
    show: false,
    form: new Form({
      isAgree: null
    })
  }),

  computed: {
    ...mapGetters({
      snackbar: 'notification/snackbar'
    }),

    status () {
      if (this.data.status === 'Accepted') return { icon: 'bi:shield-fill-check', text: 'Accepted' }
      if (this.data.status === 'Rejected') return { icon: 'ic:round-block', text: 'Rejected' }
      if (this.data.status === 'Waiting to Start') return { icon: 'mdi-alpha-s-circle-outline', text: 'Waiting to Start' }
      if (this.data.status === 'Project Started') return { icon: 'mdi-alpha-s-circle-outline', text: 'Project Started' }

      if (this.data.status === 'Hiring') return { icon: 'H', text: 'Hiring' }
      if (this.data.status === 'Ongoing') return { icon: 'O', text: 'Ongoing' }
      if (this.data.status === 'Confirmation') return { icon: 'C', text: 'Confirmation' }
      if (this.data.status === 'Draft') return { icon: 'D', text: 'Draft' }

      return {}
    },

    color () {
      if (this.data.status === 'Rejected') return 'project-box__item--status-red'
      return 'project-box__item--status-blue'
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
            projectbox: data.projectbox
          })
        })
    }
  }
}
</script>

<style scoped>

</style>
