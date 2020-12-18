<template>
  <div class="user__container">
    <div class="user__info--container">
      <img class="user__info--img" :src="data.user.avatar" alt="">
      <p class="user__info--name">
        {{ data.user.full_name }}
      </p>
      <p class="user__info--occupation">
        {{ data.user.expertise }}
      </p>
    </div>

    <div class="user__action--container">
      <template v-if="data.user.role === 'Student'">
        <button v-if="user && user.role === 'Lecturer'" class="btn action--button btn--blue" :disabled="isSelf || !data.user.is_open_hired" @click="showOwnProjects">
          Invite To Project
        </button>
        <button v-else class="btn action--button btn--blue" :disabled="isSelf" @click="inviteToTeam">
          Invite To Party
        </button>
        <router-link :to="{ name: 'message', params: { tagname: this.$route.params.tagname } }" class="btn action--button btn--white" tag="button" :disabled="isSelf">
          Direct Message
        </router-link>
      </template>
      <template v-else>
        <router-link :to="{ name: 'message', params: { tagname: this.$route.params.tagname } }" class="btn action--button btn--white" tag="button" :disabled="isSelf">
          Contact Lecturer
        </router-link>
      </template>
    </div>

    <div v-if="!$matchMedia.xl" class="user__sub-menu--container">
      <router-link v-for="tab in tabs" :key="tab.route" :to="{ name: tab.route }" class="user__sub-menu--item" active-class="user__sub-menu--active">
        {{ tab.name }}
      </router-link>
    </div>

    <div v-if="$matchMedia.xl" class="user__sub-menu">
      <div class="user__sub-menu--left">
        <router-link v-for="tab in tabs" :key="tab.route" :to="{ name: tab.route }" class="user__sub-menu--item" active-class="user__sub-menu--active">
          {{ tab.name }}
        </router-link>
      </div>
      <!-- <div class="user__sub-menu--right">
        <div>filter</div>
        <div>time</div>
      </div> -->
    </div>

    <Modal ref="listOwnProjects" :type="`small`">
      <template v-slot:header>
        <div>
          <h4 class="post__modal--h4 my-0">
            Invite to
          </h4>
        </div>
      </template>

      <template v-slot:body>
        <div>
          <hr class="my-0 mb-2_5">
          <div class="form-group__container">
            <div class="select">
              <select v-model="inviteTo">
                <option v-for="project in hiringProjects" :key="`Option-${project.id}`" :value="project.id">
                  {{ project.title }}
                </option>
              </select>
              <span class="focus" />
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="btn btn--blue ml-auto" @click="inviteToProject">
          Invite
        </div>
      </template>
    </Modal>

    <hr v-if="$matchMedia.xl" class="separator-short mt-2_5 mb-3">

    <div class="">
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  name: 'VisitedUserIndex',

  data: () => ({
    inviteTo: ''
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      ownProjects: 'auth/projects',
      data: 'visit/user',
      snackbar: 'notification/snackbar'
    }),

    tabs () {
      if (this.data.user.role === 'Student') {
        return [
          { name: 'Projects', route: '@.projects' },
          { name: 'Wishlist', route: '@.wishlist' },
          { name: 'Info', route: '@.info' }
        ]
      }

      return [
        { name: 'Projects', route: '@.projects' },
        { name: 'Info', route: '@.info' }
      ]
    },

    isSelf () {
      if (this.user) {
        return this.user.id === this.data.user.id
      }

      return false
    },

    hiringProjects () {
      return this.ownProjects.filter(project => project.status === 'Hiring')
    }
  },

  mounted () {
    this.getUser()
  },

  methods: {
    async getUser () {
      await this.$store.dispatch('visit/fetchVisitedUser', {
        tagname: this.$route.params.tagname
      })

      this.changeTitle()
    },

    async changeTitle () {
      this.$store.dispatch('navigation/changeTitle', {
        title: this.data.user.full_name
      })
    },

    async inviteToTeam () {
      if (this.user) {
        axios.post(`/api/user/${this.data.user.tagname}/invite/team`)
          .then(({ data }) => {
            this.snackbar.open(data.message)
          })
      } else {
        this.$router.push({ name: 'login' })
      }
    },

    showOwnProjects () {
      if (this.ownProjects === null || this.ownProjects.length === 0) {
        this.snackbar.open("You don't have any projects yet")
      } else {
        this.inviteTo = this.hiringProjects[0].id
        this.$refs.listOwnProjects.openModal()
      }
    },

    async inviteToProject () {
      if (this.user) {
        axios.post(`/api/user/${this.data.user.tagname}/invite/project`, {
          project_id: this.inviteTo
        })
          .then(({ data }) => {
            this.snackbar.open(data.message)
            this.$refs.listOwnProjects.closeModal()
          })
          .catch((error) => {
            this.snackbar.open(error.response.data.message)
          })
      } else {
        this.$router.push({ name: 'login' })
      }
    }
  }

}
</script>
