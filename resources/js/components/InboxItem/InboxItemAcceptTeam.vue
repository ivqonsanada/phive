<template>
  <div>
    <div class="project-box__top-container">
      <div class="">
        <router-link :to="{ name: '@.info', params: { tagname: data.team_invitation.from.tagname } }">
          <img class="project-box__img" :src="data.team_invitation.from.avatar" alt="">
        </router-link>
      </div>
      <div class="project-box__content--container">
        <div class="project-box__content">
          <span class="project-box__name">
            {{ data.team_invitation.from.full_name }}
          </span>
          <span class="project-box__name-action">Invited you to do a team project</span>
        </div>
        <div v-if="!$matchMedia.xl" class="project-box__details--container" @click="showDetails">
          <span class="project-box__details">Details</span>
          <div v-show="show">
            <span class="iconify project-box__close-button" data-icon="ion:close" />
          </div>
        </div>
        <div v-else>
          <p>
            You’re invited to join a team project. If you agree to join this team, click <i>Agree to Join  Team</i> and you can see your party at the party tab. If you decline, click <i>Decline</i>.
          </p>
        </div>
      </div>
      <div v-if="$matchMedia.xl" class="project-box__bottom-container">
        <div>
          <button class="btn btn--small btn--blue" @click="acceptTeamInvitation(true)">
            Agree to Join Team
          </button>
          <button class="btn btn--small btn--decline mt-1" @click="acceptTeamInvitation(false)">
            Decline
          </button>
        </div>
      </div>
    </div>
    <div v-if="!$matchMedia.xl" v-show="show" class="project-box__bottom-container">
      <div>
        <button class="btn btn--small btn--blue" @click="acceptTeamInvitation(true)">
          Agree to Join Team
        </button>
        <button class="btn btn--small btn--decline mt-1" @click="acceptTeamInvitation(false)">
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
  name: 'IndexItemAcceptTeam',

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

    async acceptTeamInvitation (isAgree) {
      if (isAgree) this.form.isAgree = true
      else this.form.isAgree = false
      this.form.team_invitation_id = this.data.team_invitation_id

      await this.form.post('/api/inbox/invitation/team')
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
