<template>
  <div class="project-box__container">
    <template v-if="user.role === 'Student'">
      <template v-if="data.category === 'Project Invitation'">
        <div class="project-box__top-container">
          <div class="mr-1_5">
            <router-link :to="{ name: '@.info', params: { tagname: data.project_invitation.from.tagname } }">
              <img class="project-box__img" :src="data.project_invitation.from.avatar" alt="">
            </router-link>
          </div>
          <div class="project-box__content--container">
            <div class="project-box__content">
              <span class="project-box__name">
                {{ data.project_invitation.from.first_name + ' ' + data.project_invitation.from.last_name }}
              </span>
              Invited you to join a project
            </div>
            <div class="project-box__details--container" @click="showDetails">
              <span class="project-box__details">Details</span>
              <div v-show="show">
                <span class="iconify project-box__close-button" data-icon="ion:close" data-inline="true" />
              </div>
            </div>
          </div>
        </div>
        <div v-show="show" class="project-box__bottom-container">
          <p>
            You’re invited to join project: <span class="project-box__project-title">"{{ data.project_invitation.project.title }}”</span>. You can see the detail about the project by clicking the see project details on the button below. If you’re agree to join this project please notify the lecturer about your agreement. If you’re not interested joining the project please state the reason to the lecturer by sending a message.
          </p>
          <router-link class="project-box__project-link" :to="{ name: 'project.details', params: { id: data.project_invitation.project.id} }">
            <span>See Project Details</span>
          </router-link>
          <div>
            <button class="btn btn--small btn--blue" @click="acceptProjectInvitation(true)">
              Agree to Join Project
            </button>
            <button class="btn btn--small btn--decline mt-1" @click="acceptProjectInvitation(false)">
              Decline
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="data.category === 'Team Invitation'">
        <div class="project-box__top-container">
          <div class="mr-1_5">
            <router-link :to="{ name: '@.info', params: { tagname: data.team_invitation.from.tagname } }">
              <img class="project-box__img" :src="data.team_invitation.from.avatar" alt="">
            </router-link>
          </div>
          <div class="project-box__content--container">
            <div class="project-box__content">
              <span class="project-box__name">
                {{ data.team_invitation.from.first_name + ' ' + data.team_invitation.from.last_name }}
              </span>
              Invited you to do a team project
            </div>
            <div class="project-box__details--container" @click="showDetails">
              <span class="project-box__details">Details</span>
              <div v-show="show">
                <span class="iconify project-box__close-button" data-icon="ion:close" data-inline="true" />
              </div>
            </div>
          </div>
        </div>
        <div v-show="show" class="project-box__bottom-container">
          <div>
            <button class="btn btn--small btn--blue" @click="acceptTeamInvitation(true)">
              Agree to Join Team
            </button>
            <button class="btn btn--small btn--decline mt-1" @click="acceptTeamInvitation(false)">
              Decline
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="data.category === 'message'">
        <div class="project-box__top-container">
          <div class="mr-1_5">
            <router-link :to="{ name: '@.info', params: { tagname: data.message_body.sender.tagname } }">
              <img class="project-box__img" :src="data.message_body.sender.avatar" alt="">
            </router-link>
          </div>
          <div class="project-box__content--container">
            <router-link :to="{ name: 'message', params: { tagname: data.message_body.sender.tagname } }" class="link--clean">
              <p class="project-box__content project-box__name ellipsies">
                {{ data.message_body.sender.first_name + ' ' + data.message_body.sender.last_name }}
              </p>
              <p class="project-box__message">
                <VueSnarkdown>{{ data.message_body.message }}</VueSnarkdown>
              </p>
            </router-link>
          </div>
        </div>
      </template>
    </template>

    <!-- For Lecturer -->
    <template v-else>
      <template v-if="data.category === 'Individual Applicant'">
        <div class="project-box__top-container">
          <div class="mr-1_5">
            <router-link :to="{ name: '@.info', params: { tagname: data.individual_applicant.from.tagname } }">
              <img class="project-box__img" :src="data.individual_applicant.from.avatar" alt="">
            </router-link>
          </div>
          <div class="project-box__content--container">
            <div class="project-box__content">
              <span class="project-box__name">
                {{ data.individual_applicant.from.first_name + ' ' + data.individual_applicant.from.last_name }}
              </span>
              applied to your <span class="project-box__project-title">{{ data.individual_applicant.project.title }}</span> Project
            </div>
            <div class="project-box__details--container" @click="showDetails">
              <span class="project-box__details">Details</span>
              <div v-show="show">
                <span class="iconify project-box__close-button" data-icon="ion:close" data-inline="true" />
              </div>
            </div>
          </div>
        </div>
        <div v-show="show" class="project-box__bottom-container">
          <p>
            One of the student applied your project <span class="project-box__project-title">"{{ data.individual_applicant.project.title }}"</span>. You can see the detail about the student by clicking the see student information on the button below. Click Accept Student, if you’re agree to accept the student to join the project. Click Decline, If you won’t accept the student and state the reason about your rejection.
          </p>
          <router-link class="project-box__project-link" :to="{ name: '@.info', params: { tagname: data.individual_applicant.from.tagname } }">
            <span>Applicant Information</span>
          </router-link>
          <div>
            <button class="btn btn--small btn--blue" @click="acceptIndividualApplicant(true)">
              Accept
            </button>
            <button class="btn btn--small btn--decline mt-1">
              Decline
            </button>
          </div>
        </div>
      </template>

      <template v-else-if="data.category === 'Team Applicant'">
        <div class="project-box__top-container">
          <img class="project-box__img" :src="data.img" alt="">
          <div class="project-box__content--container">
            <p class="project-box__content project-box__name ellipsies">
              {{ data.name }}
            </p>
            <p class="project-box__message">
              {{ data.message }}
            </p>
          </div>
        </div>
      </template>
      <template v-else-if="data.category === 'message'">
        <div class="project-box__top-container">
          <div class="mr-1_5">
            <router-link :to="{ name: '@.info', params: { tagname: data.message_body.sender.tagname } }">
              <img class="project-box__img" :src="data.message_body.sender.avatar" alt="">
            </router-link>
          </div>
          <div class="project-box__content--container">
            <router-link :to="{ name: 'message', params: { tagname: data.message_body.sender.tagname } }" class="link--clean">
              <p class="project-box__content project-box__name ellipsies">
                {{ data.message_body.sender.first_name + ' ' + data.message_body.sender.last_name }}
              </p>
              <p class="project-box__message">
                <VueSnarkdown>{{ data.message_body.message }}</VueSnarkdown>
              </p>
            </router-link>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'
import VueSnarkdown from '@swayable/vue-snarkdown'

export default {
  name: 'IndexItem',

  components: {
    VueSnarkdown
  },

  props: {
    data: { type: Object, default: null }
  },

  data: () => ({
    show: false,
    form: new Form({
      isAgree: null
    })
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      snackbar: 'notification/snackbar'
    })
  },

  mounted () {

  },

  methods: {
    showDetails () {
      this.show = !this.show
    },

    async acceptTeamInvitation (isAgree) {
      if (isAgree) this.form.isAgree = true
      else this.form.isAgree = false
      this.form.team_invitation_id = this.data.team_invitation_id

      await this.form.post('/api/inbox/invitation/team')
        .then(({ data }) => {
          this.snackbar.open(data.message)
        })
    },

    async acceptProjectInvitation (isAgree) {
      if (isAgree) this.form.isAgree = true
      else this.form.isAgree = false
      this.form.project_invitation_id = this.data.project_invitation_id

      await this.form.post('/api/inbox/invitation/project')
        .then(({ data }) => {
          this.snackbar.open(data.message)
        })
    },

    async acceptIndividualApplicant (isAccepted) {
      if (isAccepted) this.form.isAgree = true
      else this.form.isAgree = false
      this.form.individual_applicant_id = this.data.individual_applicant_id
      this.form.inbox_id = this.data.id

      await this.form.post('/api/inbox/apply/individual')
        .then(({ data }) => {
          this.snackbar.open(data.message)
          console.log(data.inbox)
          this.$store.dispatch('notification/updateInbox', {
            inbox: data.inboxes
          })
        })
    }
  }

}
</script>
