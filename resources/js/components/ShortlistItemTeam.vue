<template>
  <div class="shortlist-item__container">
    <div class="party-item__left-container party-item__left-container--shortlist">
      <img v-for="e in data.team_members" :key="`PartyMemberAvatar-${e.tagname}`" class="party-item__avatar" :class="{'party-item--accepted': data.isAccepted}" :src="e.avatar" alt="">
    </div>

    <button class="btn--accept" @click="showDetails">
      Details
    </button>

    <Modal ref="teamApplicantDetails" :type="`medium`">
      <template v-slot:header>
        <h4 class="post__modal--h4 my-0">
          Details
        </h4>
      </template>

      <template v-slot:body>
        <div class="separator-short mb-2_5" />
        <div v-for="member in data.team_members" :key="`TeamMemberItem-${member.tagname}`" class="shortlist-item__container">
          <div class="shortlist-item__left-container mb-1_5">
            <router-link :to="{ name: '@.info', params: { tagname: member.tagname } }">
              <img class="shortlist-avatar" :src="member.avatar" alt="">
            </router-link>
            <div class="shortlist-item__body justify-center">
              <div class="">
                <div class="shortlist-item__name">
                  {{ member.full_name }}
                </div>
                <div class="shortlist-item__expertise">
                  {{ member.expertise }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tell me about yourself! -->
        <div class="form-group__container mb-1_5">
          <h4 class="form-group__input-name form__input-name">
            Tell me about your team!
          </h4>
          <div class="">
            <textarea v-model="data.self_describe" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" readonly />
          </div>
        </div>

        <!-- Why you ? -->
        <div class="form-group__container">
          <h4 class="form-group__input-name form__input-name mb-1">
            Why are you interested in joining this project?
          </h4>
          <div class="">
            <textarea v-model="data.apply_reason" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" readonly />
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <button class="mx-auto" :class="btn.class" @click="accept">
          {{ btn.text }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ShortlistItemTeam',

  props: {
    data: { type: Object, default: null },
    role: { type: String, default: null },
    index: { type: Number, default: null }
  },

  data: () => ({

  }),

  computed: {
    ...mapGetters({
      // snackbar: 'notification/snackbar'
    }),

    btn () {
      if (this.data.isAccepted) {
        return { text: 'Cancel', class: 'btn btn--decline' }
      } else {
        return { text: 'Accept', class: 'btn btn--blue' }
      }
    }
  },

  methods: {
    // async showDetails () {
    //   this.$refs.showApplicantDetails.openModal()
    //   this.data.index = this.index
    //   this.$emit('click', this.data)
    // },

    hideDetails () {
      this.$refs.teamApplicantDetails.closeModal()
    },

    async accept () {
      this.data.isAccepted = !this.data.isAccepted

      this.$refs.teamApplicantDetails.closeModal()

      // this.$emit('accept', {
      //   index: this.index,
      //   isAccepted: this.data.isAccepted
      // })
    },

    showDetails () {
      this.$refs.teamApplicantDetails.openModal()
    }
  }
}
</script>

<style scoped>

</style>
