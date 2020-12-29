<template>
  <div>
    <div class="project-box__top-container">
      <div class="">
        <router-link :to="{ name: '@.info', params: { tagname: data.project_invitation.from.tagname } }">
          <img class="project-box__img" :src="data.project_invitation.from.avatar" alt="">
        </router-link>
      </div>
      <div class="project-box__content--container">
        <div class="project-box__content">
          <span class="project-box__name">
            {{ data.project_invitation.from.full_name }}
          </span>
          <span class="project-box__name-action">Invited you to join a project</span>
        </div>

        <div v-if="!$matchMedia.xl" class="project-box__details--container" @click="showDetails">
          <span class="project-box__details">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" />
          </div>
        </div>
        <div v-else>
          <p>
            You’re invited to join project: <span class="project-box__project-title">"{{ data.project_invitation.project.title }}”</span>. You can see the detail about the project by clicking the see project details on the button below. If you’re agree to join this project please notify the lecturer about your agreement. If you’re not interested joining the project please state the reason to the lecturer by sending a message.
          </p>
          <router-link class="project-box__project-link" :to="{ name: 'project.details', params: { id: data.project_invitation.project.project_url} }">
            <span>See Project Details</span>
          </router-link>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="project-box__bottom-container">
        <div>
          <button class="btn btn--small btn--blue" @click="acceptProjectInvitation(true)">
            Agree to Join Project
          </button>
          <button class="btn btn--small btn--decline mt-1" @click="acceptProjectInvitation(false)">
            Decline
          </button>
        </div>
      </div>
    </div>

    <div v-if="!$matchMedia.xl" v-show="show" class="project-box__bottom-container">
      <p>
        You’re invited to join project: <span class="project-box__project-title">"{{ data.project_invitation.project.title }}”</span>. You can see the detail about the project by clicking the see project details on the button below. If you’re agree to join this project please notify the lecturer about your agreement. If you’re not interested joining the project please state the reason to the lecturer by sending a message.
      </p>
      <router-link class="project-box__project-link" :to="{ name: 'project.details', params: { id: data.project_invitation.project.project_url} }">
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
  </div>
</template>

<script>
import Form from 'vform'
import { mapGetters } from 'vuex'

export default {
  name: 'IndexItemAcceptProject',

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
      snackbar: 'notification/snackbar'
    })

  },

  methods: {
    showDetails () {
      this.show = !this.show
    },

    async acceptProjectInvitation (isAgree) {
      if (isAgree) this.form.isAgree = true
      else this.form.isAgree = false
      this.form.project_invitation_id = this.data.project_invitation_id

      await this.form.post('/api/inbox/invitation/project')
        .then(({ data }) => {
          this.snackbar.open(data.message)
          this.$store.dispatch('notification/updateInbox', {
            inbox: data.inboxes
          })
        })
    }
  }
}
</script>
