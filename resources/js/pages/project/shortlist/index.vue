<template>
  <div class="shortlisted__container">
    <div class="shorlisted-top__container">
      <div>
        <div v-show="project" class="shortlisted-top__image-container mt-2_5">
          <div class="project-details--image shortlisted--image">
            <img
              :src="project.thumbnail_url"
              alt="Project Photo"
              class="img"
            >
          </div>
        </div>
      </div>

      <div class="shortlisted-top__left">
        <h1 class="shortlisted--h1  mb-1_5 text-outline--thin">
          {{ project ? project.title : '' }}
        </h1>

        <div v-if="!$matchMedia.xl" class="separator-short mb-1" />

        <h3 class="shortlisted--h3 mt-3">
          Shortlisted Student
        </h3>
      </div>
    </div>

    <div v-if="$matchMedia.xl" class="separator-short" />

    <div class="mt-1_5 mb-1_5">
      <div class="select select--small ml-auto">
        <select v-model="shortlistType" @change="changeShortlist">
          <option value="Individual">
            Individual
          </option>
          <option value="Team">
            Team
          </option>
        </select>
        <span class="focus" />
      </div>
    </div>

    <div v-if="$matchMedia.xl" class="separator-short mb-1" />

    <div>
      <transition name="fade" mode="out-in">
        <router-view />
      </transition>
    </div>

    <!-- <router-link :to=" { path: '/' }" class="btn btn--blue btn--large" tag="button"> -->
    <button class="btn btn--blue btn--large btn__small--xl mx-auto" @click="acceptStudents">
      Proceed
    </button>
    <!-- </router-link> -->
  </div>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'

export default {
  name: 'ShortlistIndex',
  layout: 'back',
  middleware: ['auth', 'lecturer'],
  // components: { ShortlistIndividual },

  metaInfo () { return { title: 'Applicant Shortlist' } },

  data: () => ({
    applicantDetails: {
      isAccepted: false
    },

    shortlistType: 'Individual'
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      snackbar: 'notification/snackbar',
      project: 'page/project',
      individuals: 'page/shortlistIndividuals',
      teams: 'page/shortlistTeams'
    })
  },

  mounted () {
    this.getShortlist()

    // if (this.$route)
    if (this.$route.name === 'shortlist.team') this.shortlistType = 'Team'
  },

  methods: {
    async getShortlist () {
      await this.$store.dispatch('page/fetchShortlist', {
        project_url: this.$route.params.id
      })
    },

    async acceptStudents () {
      const acceptedStudents = {
        individuals: this.individuals.filter(e => e.isAccepted === true),
        teams: this.teams.filter(e => e.isAccepted === true)
      }

      if (acceptedStudents.individuals.length === 0 && acceptedStudents.teams.length === 0) {
        return this.$router.push({ name: 'projectbox' })
      }

      await axios.post('/api/project/' + this.$route.params.id + '/shortlist', {
        'individuals': acceptedStudents.individuals,
        'teams': acceptedStudents.teams
      })
        .then(({ data }) => {
          this.snackbar.open(data.message)

          this.$store.dispatch('notification/updateProjectBox', {
            projectBoxes: data.project_boxes
          })

          this.$router.push({ name: 'projectbox' })
        })
    },

    changeShortlist () {
      if (this.shortlistType === 'Individual') this.$router.push({ name: 'shortlist.individual' })
      else if (this.shortlistType === 'Team') this.$router.push({ name: 'shortlist.team' })
    }
  }

}
</script>

<style>
</style>
