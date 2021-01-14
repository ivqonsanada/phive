<template>
  <div>
    <div class="mb-3" :class="{ 'shortlist-container': teams.length > 0 }">
      <ShortlistItemTeam v-for="(e, index) in teams" :key="`ShortlistItemTeam-${e.id}`" :data="e" :index="index" @click="showDetails" />
      <p v-if="teams.length === 0" class="info__p">
        No Team Applicants yet
      </p>
    </div>

    <div v-if="$matchMedia.xl" class="separator-short mb-1" />

    <paginate
      v-if="$matchMedia.xl"
      :page-count="pageCount"
      :page-range="7"
      :margin-pages="2"
      :click-handler="changePage"
      :prev-text="`<`"
      :next-text="`>`"
      :container-class="'pagination'"
      :page-class="'page-item'"
      :page-link-class="'page-item--link'"
      :prev-class="'page-item'"
      :prev-link-class="'page-item--link'"
      :next-class="'page-item'"
      :next-link-class="'page-item--link'"
      :active-class="'page-item--active'"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ShortlistItemTeam from '~/components/ShortlistItemTeam'

export default {
  name: 'ShortlistTeamPage',

  components: { ShortlistItemTeam },

  metaInfo () { return { title: 'Shortlist Team' } },

  data: () => ({
    page: 1,
    project: {},
    applicantDetails: {
      isAccepted: false
    }
  }),

  computed: {
    ...mapGetters({
      user: 'auth/user',
      snackbar: 'notification/snackbar',
      data: 'page/shortlistTeams'
    }),

    pageCount () {
      return this.data.length / 8
    },

    teams () {
      if (this.$matchMedia.xl) return this.data.slice(((this.page - 1) * 8), this.page * 8)
      else return this.data
    }
  },

  mounted () {

  },

  methods: {
    async acceptIndividual (e) {
      this.individuals[e.index].isAccepted = e.isAccepted
    },

    async acceptIndividualModal () {
      this.individuals[this.applicantDetails.index].isAccepted = !this.individuals[this.applicantDetails.index].isAccepted
      this.$refs.showApplicantDetails.closeModal()
    },

    async showDetails (e) {
      this.applicantDetails = e
      this.$refs.showApplicantDetails.openModal()
    },

    changePage (e) {
      this.page = e
    }
  }

}
</script>

<style>
</style>
